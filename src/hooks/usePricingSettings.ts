import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

type PricingSetting = Database["public"]["Tables"]["hinnoittelu_asetukset"]["Row"];
type InsertPricingSetting = Database["public"]["Tables"]["hinnoittelu_asetukset"]["Insert"];

// Get fixed price settings for quick selection
export const useFixedPriceSettings = () => {
  const { data: companyId } = useCompanyId();
  
  return useQuery({
    queryKey: ["fixedPriceSettings", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("hinnoittelu_asetukset")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .eq("tyyppi", "kertamaksu")
        .order("nimi");

      if (error) throw error;
      return data as PricingSetting[];
    },
    enabled: !!companyId
  });
};

// Get hourly rate settings
export const useHourlyRateSettings = () => {
  const { data: companyId } = useCompanyId();
  
  return useQuery({
    queryKey: ["hourlyRateSettings", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("hinnoittelu_asetukset")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .eq("tyyppi", "tuntiveloitus")
        .order("nimi");

      if (error) throw error;
      return data as PricingSetting[];
    },
    enabled: !!companyId
  });
};

export const usePricingSettings = () => {
  const { data: companyId } = useCompanyId();
  
  return useQuery({
    queryKey: ["pricingSettings", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("hinnoittelu_asetukset")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PricingSetting[];
    },
    enabled: !!companyId
  });
};

export const useAddPricingSetting = () => {
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (setting: Omit<InsertPricingSetting, 'company_id'>) => {
      if (!companyId) throw new Error("Company ID not found");

      const { data, error } = await supabase
        .from("hinnoittelu_asetukset")
        .insert([{ ...setting, company_id: companyId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricingSettings"] });
      toast({
        title: "Onnistui!",
        description: "Hinnoitteluasetus lisätty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Hinnoitteluasetuksen lisääminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePricingSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PricingSetting> }) => {
      const { data, error } = await supabase
        .from("hinnoittelu_asetukset")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricingSettings"] });
      toast({
        title: "Onnistui!",
        description: "Hinnoitteluasetus päivitetty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Hinnoitteluasetuksen päivittäminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeletePricingSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("hinnoittelu_asetukset")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricingSettings"] });
      toast({
        title: "Onnistui!",
        description: "Hinnoitteluasetus poistettu onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Hinnoitteluasetuksen poistaminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};