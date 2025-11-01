import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

type NumberingSettings = Database["public"]["Tables"]["numerointi_asetukset"]["Row"];
type UpdateNumberingSettings = Database["public"]["Tables"]["numerointi_asetukset"]["Update"];

export const useNumberingSettings = () => {
  const { data: companyId } = useCompanyId();
  
  return useQuery({
    queryKey: ["numbering-settings", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("numerointi_asetukset")
        .select("*")
        .eq("company_id", companyId)
        .order("tyyppi");
      
      if (error) throw error;
      
      return data as NumberingSettings[];
    },
    enabled: !!companyId
  });
};

export const useUpdateNumberingSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateNumberingSettings }) => {
      const { data, error } = await supabase
        .from("numerointi_asetukset")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["numbering-settings"] });
      toast({
        title: "Onnistui!",
        description: "Numerointiasetukset päivitetty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Numerointiasetuksien päivittäminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};