import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCompanyId = () => {
  return useQuery({
    queryKey: ["user-company-id"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data?.company_id || null;
    },
  });
};
