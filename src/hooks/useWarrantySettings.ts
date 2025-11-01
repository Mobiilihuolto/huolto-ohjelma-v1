import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

type WarrantySetting = Database["public"]["Tables"]["takuu_asetukset"]["Row"];
type InsertWarrantySetting = Database["public"]["Tables"]["takuu_asetukset"]["Insert"];

export const useWarrantySettings = () => {
  const { data: companyId } = useCompanyId();
  
  return useQuery({
    queryKey: ["warrantySettings", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("takuu_asetukset")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WarrantySetting[];
    },
    enabled: !!companyId
  });
};

export const useAddWarrantySetting = () => {
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (setting: Omit<InsertWarrantySetting, 'company_id'>) => {
      if (!companyId) throw new Error("Company ID not found");

      const { data, error } = await supabase
        .from("takuu_asetukset")
        .insert([{ ...setting, company_id: companyId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warrantySettings"] });
      toast({
        title: "Onnistui!",
        description: "Takuuasetus lisätty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Takuuasetuksen lisääminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateWarrantySetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WarrantySetting> }) => {
      const { data, error } = await supabase
        .from("takuu_asetukset")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warrantySettings"] });
      toast({
        title: "Onnistui!",
        description: "Takuuasetus päivitetty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Takuuasetuksen päivittäminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteWarrantySetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("takuu_asetukset")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warrantySettings"] });
      toast({
        title: "Onnistui!",
        description: "Takuuasetus poistettu onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Takuuasetuksen poistaminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};