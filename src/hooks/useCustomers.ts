import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

export type Customer = {
  id: string;
  nimi: string;
  email?: string;
  puhelin?: string;
  osoite?: string;
  tyyppi?: string;
  created_at?: string;
  yksityiset_muistiinpanot?: string;
  y_tunnus?: string;
  alv_numero?: string;
  yrityksen_nimi?: string;
  numero?: string;
};

export type InsertCustomer = {
  nimi: string;
  email?: string;
  puhelin?: string;
  osoite?: string;
  tyyppi?: string;
  yksityiset_muistiinpanot?: string;
  y_tunnus?: string;
  alv_numero?: string;
  yrityksen_nimi?: string;
};

export const useCustomers = (searchTerm = "") => {
  return useQuery({
    queryKey: ["customers", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("asiakkaat")
        .select("*");

      if (searchTerm) {
        query = query.or(
          `nimi.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,puhelin.ilike.%${searchTerm}%,osoite.ilike.%${searchTerm}%,yrityksen_nimi.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching customers:", error);
        throw new Error("Virhe asiakkaiden haussa");
      }

      // Järjestetään asiakkaat: yritykset yrityksen nimellä, henkilöt henkilön nimellä
      const sortedData = (data as Customer[]).sort((a, b) => {
        const nameA = a.tyyppi === "yritys" && a.yrityksen_nimi 
          ? a.yrityksen_nimi.toLowerCase()
          : a.nimi.toLowerCase();
        const nameB = b.tyyppi === "yritys" && b.yrityksen_nimi 
          ? b.yrityksen_nimi.toLowerCase()
          : b.nimi.toLowerCase();
        
        // Ensisijainen järjestys: nimi/yrityksen nimi
        const primarySort = nameA.localeCompare(nameB, 'fi');
        
        // Jos nimet ovat samat, järjestetään asiakasnumeron mukaan
        if (primarySort === 0) {
          return (a.numero || '').localeCompare(b.numero || '', 'fi');
        }
        
        return primarySort;
      });

      return sortedData;
    },
  });
};

export const useAddCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (customer: Omit<InsertCustomer, 'company_id'>) => {
      if (!companyId) throw new Error("Company ID not found");

      const { data, error } = await supabase
        .from("asiakkaat")
        .insert([{ ...customer, company_id: companyId }])
        .select()
        .single();

      if (error) {
        console.error("Error adding customer:", error);
        throw new Error("Virhe asiakkaan lisäämisessä");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Asiakas lisätty",
        description: "Uusi asiakas on lisätty onnistuneesti.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, customer }: { id: string; customer: Partial<InsertCustomer> }) => {
      const { data, error } = await supabase
        .from("asiakkaat")
        .update(customer)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating customer:", error);
        throw new Error("Virhe asiakkaan päivittämisessä");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Asiakas päivitetty",
        description: "Asiakkaan tiedot on päivitetty onnistuneesti.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook to get device count for a customer (based on unique devices in services)
export const useCustomerDeviceCount = (customerId: string) => {
  return useQuery({
    queryKey: ["customer-device-count", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("huollot")
        .select("merkki, malli")
        .eq("asiakas_id", customerId);

      if (error) {
        console.error("Error fetching device count:", error);
        return 0;
      }

      // Count unique merkki + malli combinations
      const uniqueDevices = new Set(
        data
          ?.filter(d => d.merkki && d.malli)
          ?.map(d => `${d.merkki}-${d.malli}`)
      );

      return uniqueDevices.size;
    },
    enabled: !!customerId,
  });
};

// Hook to get service count for a customer
export const useCustomerServiceCount = (customerId: string) => {
  return useQuery({
    queryKey: ["customer-service-count", customerId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("huollot")
        .select("*", { count: "exact", head: true })
        .eq("asiakas_id", customerId);

      if (error) {
        console.error("Error fetching service count:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!customerId,
  });
};

// Hook to refresh customer data for an invoice
export const useRefreshInvoiceCustomerData = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ invoiceId, customerId }: { invoiceId: string; customerId: string }) => {
      // Fetch latest customer data
      const { data: customer, error: customerError } = await supabase
        .from("asiakkaat")
        .select("nimi, email, puhelin, osoite, y_tunnus, alv_numero, yrityksen_nimi")
        .eq("id", customerId)
        .single();

      if (customerError || !customer) {
        throw new Error("Asiakkaan tietojen haku epäonnistui");
      }

      // Update invoice with latest customer data
      const { error: updateError } = await supabase
        .from("laskut")
        .update({
          asiakas_nimi: customer.yrityksen_nimi || customer.nimi,
          asiakas_yhteyshenkilo: customer.yrityksen_nimi ? customer.nimi : null,
          asiakas_email: customer.email,
          asiakas_puhelin: customer.puhelin,
          asiakas_osoite: customer.osoite,
          asiakas_y_tunnus: customer.y_tunnus,
          asiakas_alv_numero: customer.alv_numero,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId);

      if (updateError) {
        throw new Error("Laskun päivitys epäonnistui");
      }

      return customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Asiakastiedot päivitetty",
        description: "Laskun asiakastiedot on päivitetty asiakkaan tiedoista.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};