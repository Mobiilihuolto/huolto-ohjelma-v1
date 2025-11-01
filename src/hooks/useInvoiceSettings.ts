import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

export interface InvoiceSettings {
  id: string;
  nimi: string;
  oletusmaksuehto_paivat: number;
  oletusviivastyskulut: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useInvoiceSettings = () => {
  const { data: companyId } = useCompanyId();
  
  return useQuery({
    queryKey: ["invoiceSettings", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("lasku_asetukset")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as InvoiceSettings[];
    },
    enabled: !!companyId
  });
};

export const useAddInvoiceSetting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (newSetting: Omit<InvoiceSettings, "id" | "created_at" | "updated_at" | "company_id">) => {
      if (!companyId) throw new Error("Company ID not found");

      const { error } = await supabase
        .from("lasku_asetukset")
        .insert({ ...newSetting, company_id: companyId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceSettings"] });
      toast({
        title: "Asetus lisätty",
        description: "Uusi laskuasetus on lisätty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Asetuksen lisääminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateInvoiceSetting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InvoiceSettings> }) => {
      const { error } = await supabase
        .from("lasku_asetukset")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceSettings"] });
      toast({
        title: "Asetus päivitetty",
        description: "Laskuasetus on päivitetty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Asetuksen päivitys epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteInvoiceSetting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lasku_asetukset")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoiceSettings"] });
      toast({
        title: "Asetus poistettu",
        description: "Laskuasetus on poistettu onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Asetuksen poistaminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};
