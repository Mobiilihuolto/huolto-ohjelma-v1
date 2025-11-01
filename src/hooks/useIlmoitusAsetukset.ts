import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

export interface IlmoitusAsetukset {
  id: string;
  huolto_valmis_kaytossa: boolean;
  huolto_valmis_pohja: string;
  lasku_eraantynyt_kaytossa: boolean;
  lasku_eraantynyt_paivat: number;
  lasku_eraantynyt_pohja: string;
  testiviesti_email: string | null;
  varasto_varoitus_kaytossa?: boolean;
  varasto_varoitus_email?: string | null;
}

export const useIlmoitusAsetukset = () => {
  const { data: companyId } = useCompanyId();
  
  return useQuery({
    queryKey: ["ilmoitus_asetukset", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from("ilmoitus_asetukset")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();

      if (error) throw error;
      
      // Jos asetuksia ei löydy, luo oletusasetukset
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from("ilmoitus_asetukset")
          .insert({
            company_id: companyId,
            huolto_valmis_kaytossa: false,
            huolto_valmis_pohja: 'Hei [Asiakas], laitteesi [Laite] on valmis noudettavaksi. Terv. [Yritys]',
            lasku_eraantynyt_kaytossa: false,
            lasku_eraantynyt_paivat: 7,
            lasku_eraantynyt_pohja: 'Hei [Asiakas], laskusi [Numero] on erääntynyt [Päivää] päivää sitten. Summa: [Summa]€. Terv. [Yritys]',
            varasto_varoitus_kaytossa: false
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        return newSettings as IlmoitusAsetukset;
      }
      
      return data as IlmoitusAsetukset | null;
    },
    enabled: !!companyId,
  });
};

export const useUpdateIlmoitusAsetukset = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (updates: Partial<IlmoitusAsetukset> & { id?: string }) => {
      if (!companyId) throw new Error("Company ID not found");

      // Check if settings exist
      const { data: existing } = await supabase
        .from("ilmoitus_asetukset")
        .select("id")
        .limit(1)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing settings
        const { data, error } = await supabase
          .from("ilmoitus_asetukset")
          .update(updates)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new settings with company_id
        const { data, error } = await supabase
          .from("ilmoitus_asetukset")
          .insert({ ...updates, company_id: companyId })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ilmoitus_asetukset"] });
      toast({
        title: "Ilmoitusasetukset tallennettu",
        description: "Muutokset on tallennettu onnistuneesti.",
      });
    },
    onError: (error: any) => {
      console.error("Error updating notification settings:", error);
      toast({
        title: "Virhe",
        description: "Ilmoitusasetusten tallentaminen epäonnistui.",
        variant: "destructive",
      });
    },
  });
};

export const useSendTestEmail = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email, type }: { email: string; type: "service_ready" | "overdue_invoice" | "inventory_alert" }) => {
      if (type === "inventory_alert") {
        const { data, error } = await supabase.functions.invoke("send-low-stock-alert", {
          body: {},
        });

        if (error) {
          const errorMsg = error.message || 'Unknown error';
          throw new Error(errorMsg);
        }
        
        // Check if the response indicates an error
        if (data && !data.success) {
          throw new Error(data.error || 'Failed to send email');
        }
        
        return data;
      } else if (type === "service_ready") {
        // Get the latest service to use for testing
        const { data: services, error: serviceError } = await supabase
          .from("huollot")
          .select("id, asiakas_id")
          .limit(1)
          .maybeSingle();

        if (serviceError) throw new Error("Ei huoltoja testiviestiä varten");
        if (!services) throw new Error("Luo ensin vähintään yksi huolto testiviestiä varten");

        // Update the customer email for testing
        const { error: updateError } = await supabase
          .from("asiakkaat")
          .update({ email })
          .eq("id", services.asiakas_id);

        if (updateError) throw updateError;

        const { data, error } = await supabase.functions.invoke("send-service-ready-email", {
          body: { serviceId: services.id },
        });

        if (error) throw error;
        return data;
      } else {
        // Get the latest invoice to use for testing
        const { data: invoice, error: invoiceError } = await supabase
          .from("laskut")
          .select("id, asiakas_id")
          .limit(1)
          .maybeSingle();

        if (invoiceError) throw new Error("Ei laskuja testiviestiä varten");
        if (!invoice) throw new Error("Luo ensin vähintään yksi lasku testiviestiä varten");

        // Update the customer email for testing
        const { error: updateError } = await supabase
          .from("asiakkaat")
          .update({ email })
          .eq("id", invoice.asiakas_id);

        if (updateError) throw updateError;

        const { data, error } = await supabase.functions.invoke("send-overdue-invoice-email", {
          body: { invoiceId: invoice.id, isTest: true },
        });

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: "Testiviesti lähetetty",
        description: "Tarkista sähköpostisi.",
      });
    },
    onError: (error: any) => {
      console.error("Error sending test email:", error);
      toast({
        title: "Virhe",
        description: error.message || "Testiviestin lähetys epäonnistui.",
        variant: "destructive",
      });
    },
  });
};
