import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

// Types for ALV settings
type AlvSetting = {
  id: string;
  nimi: string;
  alv_prosentti: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

type InsertAlvSetting = {
  nimi: string;
  alv_prosentti: number;
  is_active?: boolean;
  is_default?: boolean;
};

type UpdateAlvSetting = {
  nimi?: string;
  alv_prosentti?: number;
  is_active?: boolean;
  is_default?: boolean;
};

// Hook for fetching all ALV settings  
export const useAlvSettings = () => {
  return useQuery({
    queryKey: ["alv-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alv_asetukset")
        .select("*")
        .order("nimi");

      if (error) throw error;
      return data as AlvSetting[];
    },
  });
};

// Hook for fetching the default ALV setting
export const useDefaultAlvSetting = () => {
  const { data: companyId } = useCompanyId();
  
  return useQuery({
    queryKey: ["default-alv-setting", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from("alv_asetukset")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      
      // Jos asetuksia ei löydy, luo oletusasetukset
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from("alv_asetukset")
          .insert({
            company_id: companyId,
            nimi: "ALV 25.5%",
            alv_prosentti: 25.5,
            is_default: true,
            is_active: true
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        return newSettings as AlvSetting;
      }
      
      return data as AlvSetting | null;
    },
    enabled: !!companyId,
  });
};

// Hook for adding new ALV setting
export const useAddAlvSetting = () => {
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (newSetting: Omit<InsertAlvSetting, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
      if (!companyId) throw new Error("Company ID not found");

      const { data, error } = await supabase
        .from("alv_asetukset")
        .insert([{ ...newSetting, company_id: companyId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alv-settings"] });
      queryClient.invalidateQueries({ queryKey: ["default-alv-setting"] });
      toast({
        title: "Onnistui!",
        description: "ALV-asetus lisätty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "ALV-asetuksen lisääminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating ALV setting
export const useUpdateAlvSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateAlvSetting }) => {
      const { data, error } = await supabase
        .from("alv_asetukset")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alv-settings"] });
      queryClient.invalidateQueries({ queryKey: ["default-alv-setting"] });
      toast({
        title: "Onnistui!",
        description: "ALV-asetus päivitetty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "ALV-asetuksen päivittäminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting ALV setting
export const useDeleteAlvSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("alv_asetukset")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alv-settings"] });
      queryClient.invalidateQueries({ queryKey: ["default-alv-setting"] });
      toast({
        title: "Onnistui!",
        description: "ALV-asetus poistettu onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "ALV-asetuksen poistaminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for setting default ALV setting
export const useSetDefaultAlvSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First, set all settings to not default
      await supabase
        .from("alv_asetukset")
        .update({ is_default: false });

      // Then set the selected one as default
      const { data, error } = await supabase
        .from("alv_asetukset")
        .update({ is_default: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alv-settings"] });
      queryClient.invalidateQueries({ queryKey: ["default-alv-setting"] });
      toast({
        title: "Onnistui!",
        description: "Oletus ALV-asetus päivitetty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Oletus ALV-asetuksen päivittäminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};