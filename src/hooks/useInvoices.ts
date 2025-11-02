import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { useDefaultAlvSetting } from "./useAlvSettings";
import { usePricingSettings } from "./usePricingSettings";
import { useCompanyId } from "@/hooks/useCompanyId";

type Invoice = Database["public"]["Tables"]["laskut"]["Row"] & {
  asiakkaat?: Database["public"]["Tables"]["asiakkaat"]["Row"] | null;
  huollot?: Database["public"]["Tables"]["huollot"]["Row"] | null;
};
type InsertInvoice = Database["public"]["Tables"]["laskut"]["Insert"];

// Hook for fetching invoices with customer and service information
export const useInvoices = (searchTerm: string = "") => {
  return useQuery({
    queryKey: ["invoices", searchTerm],
    queryFn: async () => {
      
      let query = supabase
        .from("laskut")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`numero.ilike.%${searchTerm}%,asiakas_nimi.ilike.%${searchTerm}%`);
      }

      const { data: invoices, error: invoicesError } = await query;
      
      if (invoicesError) throw invoicesError;
      if (!invoices) return [];

      // Get all customers
      const { data: customers, error: customersError } = await supabase
        .from("asiakkaat")
        .select("*");
      
      if (customersError) throw customersError;

      // Get all services with device information
      const { data: services, error: servicesError } = await supabase
        .from("huollot")
        .select(`
          id,
          numero,
          kuvaus,
          status,
          merkki,
          malli,
          sarjanumero,
          valmistunut_pvm,
          laitteet (
            merkki,
            malli,
            sarjanumero
          )
        `);
      
      if (servicesError) throw servicesError;

      // Join the data manually and check for overdue invoices
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const invoicesWithDetails = invoices.map((invoice) => {
        const customer = customers?.find(c => c.id === invoice.asiakas_id);
        const service = services?.find(s => s.id === invoice.huolto_id);
        
      // Check if invoice is overdue OR should be reopened
      let status = invoice.status;
      
      // If open/sent and due date has passed → overdue
      if ((status === 'avoin' || status === 'lahetetty') && invoice.erapaiva) {
        const dueDate = new Date(invoice.erapaiva);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          status = 'myohassa';
        }
      }
      
      // If overdue but due date is still in the future → reopen as 'avoin'
      if (status === 'myohassa' && invoice.erapaiva) {
        const dueDate = new Date(invoice.erapaiva);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate >= today) {
          status = 'avoin';
        }
      }
        
        return {
          ...invoice,
          status,
          asiakkaat: customer || null,
          huollot: service || null
        };
      });

      return invoicesWithDetails as any as Invoice[];
    },
  });
};

// Hook for creating invoice from service
export const useCreateInvoiceFromService = () => {
  const queryClient = useQueryClient();
  const { data: defaultAlvSetting } = useDefaultAlvSetting();
  const { data: pricingSettings } = usePricingSettings();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async ({ 
      serviceId, 
      customerId, 
      additionalParts = [],
      tositelaji = 'lasku',
      paymentMethod,
      paymentDate,
      paymentTermDays,
      lateFee
    }: { 
      serviceId: string; 
      customerId: string; 
      additionalParts?: Array<{
        kuvaus: string; 
        maara: number;
        yksikko: string;
        yksikkohinta: number;
        includesVat: boolean;
      }>;
      tositelaji?: 'lasku' | 'kuitti';
      paymentMethod?: string;
      paymentDate?: Date;
      paymentTermDays?: number;
      lateFee?: number;
    }) => {
      // First, get the service details
      const { data: service, error: serviceError } = await supabase
        .from("huollot")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (serviceError) throw serviceError;

      // Get customer details
      const { data: customer, error: customerError } = await supabase
        .from("asiakkaat")
        .select("*")
        .eq("id", customerId)
        .single();

      if (customerError) throw customerError;

      // Get service parts from database
      const { data: serviceParts, error: partsError } = await supabase
        .from("huolto_varaosat")
        .select("*, varaosat(*)")
        .eq("huolto_id", serviceId);

      if (partsError) {
        console.error("Error fetching service parts:", partsError);
        throw partsError;
      }

      // Calculate invoice amounts
      // IMPORTANT: All prices (work and parts) already INCLUDE VAT
      // NOTE: Work line is now created by InvoiceCreateDialog, not here
      let totalIncludingVat = 0;
      const invoiceLines = [];

      // Add service parts from database (prices already include VAT)
      const dbPartNames = new Set<string>();
      if (serviceParts && serviceParts.length > 0) {
        serviceParts.forEach((sp: any) => {
          const partName = sp.varaosat?.nimi || 'Varaosa';
          dbPartNames.add(partName);
          const partTotal = sp.maara * sp.yksikkohinta;
          invoiceLines.push({
            kuvaus: partName,
            maara: sp.maara,
            yksikko: sp.varaosat?.yksikko || 'kpl',
            yksikkohinta: sp.yksikkohinta,
            yhteensa: partTotal
          });
          totalIncludingVat += partTotal;
        });
      }

      // Add additional parts to invoice lines (filter out duplicates)
      // Handle VAT properly based on whether prices include VAT or not
      const vatPercentage = defaultAlvSetting?.alv_prosentti || 25.5;
      
      // Filter out parts that are already in the database
      const filteredAdditionalParts = additionalParts.filter(part => {
        // Check if this part name already exists in database parts
        return !dbPartNames.has(part.kuvaus);
      });
      
      filteredAdditionalParts.forEach(part => {
        const lineTotal = part.maara * part.yksikkohinta;
        let lineTotalWithVat = lineTotal;
        
        // If price doesn't include VAT, add it
        if (!part.includesVat) {
          lineTotalWithVat = lineTotal * (1 + vatPercentage / 100);
        }
        
        invoiceLines.push({
          kuvaus: part.kuvaus,
          maara: part.maara,
          yksikko: part.yksikko,
          yksikkohinta: part.includesVat ? part.yksikkohinta : part.yksikkohinta * (1 + vatPercentage / 100),
          yhteensa: lineTotalWithVat
        });
        totalIncludingVat += lineTotalWithVat;
      });

      // Calculate VAT breakdown - prices ALREADY INCLUDE VAT
      // We need to extract the VAT amount from the total
      const subtotalWithoutVat = totalIncludingVat / (1 + vatPercentage / 100);
      const vatAmount = totalIncludingVat - subtotalWithoutVat;

      if (!companyId) throw new Error("Company ID not found");

      const today = new Date().toISOString().split('T')[0];
      const finalPaymentDate = paymentDate ? paymentDate.toISOString().split('T')[0] : today;
      const paymentTerm = paymentTermDays || 14;

      // Create invoice
      const invoiceData: InsertInvoice = {
        huolto_id: serviceId,
        asiakas_id: customerId,
        company_id: companyId,
        rivit: invoiceLines,
        summa_ilman_alvia: subtotalWithoutVat,
        alv_summa: vatAmount,
        alv_prosentti: vatPercentage,
        kokonaissumma: totalIncludingVat,
        asiakas_nimi: customer.tyyppi === 'yritys' && customer.yrityksen_nimi ? customer.yrityksen_nimi : customer.nimi,
        asiakas_yhteyshenkilo: customer.tyyppi === 'yritys' ? customer.nimi : null,
        asiakas_osoite: customer.osoite,
        asiakas_email: customer.email,
        asiakas_puhelin: customer.puhelin,
        asiakas_y_tunnus: customer.y_tunnus,
        asiakas_alv_numero: customer.alv_numero,
        laskun_pvm: today,
        erapaiva: tositelaji === 'kuitti' 
          ? finalPaymentDate 
          : new Date(Date.now() + paymentTerm * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maksuehto_paivat: paymentTerm,
        viivastyskulut: lateFee || 0,
        status: tositelaji === 'kuitti' ? 'maksettu' : 'avoin',
        maksettu_pvm: tositelaji === 'kuitti' ? finalPaymentDate : null,
        maksutapa: tositelaji === 'kuitti' ? paymentMethod : null,
        tositelaji: tositelaji
      };

      const { data, error } = await supabase
        .from("laskut")
        .insert([invoiceData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Onnistui!",
        description: `${variables.tositelaji === 'kuitti' ? 'Kuitti' : 'Lasku'} luotu onnistuneesti huoltotyöstä.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Laskun luominen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating invoice
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Invoice> }) => {
      const { data, error } = await supabase
        .from("laskut")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Onnistui!",
        description: "Lasku päivitetty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Laskun päivittäminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for marking invoice as paid
export const useMarkInvoicePaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      invoiceId, 
      paymentMethod, 
      paymentDate 
    }: { 
      invoiceId: string; 
      paymentMethod: string; 
      paymentDate: Date;
    }) => {
      const { data, error } = await supabase
        .from("laskut")
        .update({ 
          status: 'maksettu',
          tositelaji: 'kuitti',
          maksettu_pvm: paymentDate.toISOString().split('T')[0],
          maksutapa: paymentMethod
        })
        .eq("id", invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Onnistui!",
        description: "Maksu merkitty suoritetuksi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Maksun merkitseminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting invoice
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from("laskut")
        .delete()
        .eq("id", invoiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Onnistui!",
        description: "Lasku poistettu.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Laskun poistaminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for sending payment reminder
export const useSendPaymentReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      // Get current reminder count
      const { data: invoice } = await supabase
        .from("laskut")
        .select("muistutukset_lahetetty")
        .eq("id", invoiceId)
        .single();

      // Call the existing edge function
      const { data, error } = await supabase.functions.invoke("send-overdue-invoice-email", {
        body: { invoiceId }
      });

      if (error) throw error;

      // Increment reminder counter
      await supabase
        .from("laskut")
        .update({ muistutukset_lahetetty: (invoice?.muistutukset_lahetetty || 0) + 1 })
        .eq("id", invoiceId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Muistutus lähetetty",
        description: "Maksumuistutus lähetetty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Muistutuksen lähetys epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};