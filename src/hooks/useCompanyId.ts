import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCompanyId = () => {
  return useQuery({
    queryKey: ["user-company-id"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      let { data, error } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
        return null;
      }

      if (!data) {
        const newCompanyId = crypto.randomUUID();

        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            company_id: newCompanyId,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: 'admin'
          })
          .select("company_id")
          .single();

        if (insertError) {
          console.error("Error creating profile:", insertError);
          return newCompanyId;
        }

        return newProfile?.company_id || newCompanyId;
      }

      if (!data.company_id) {
        const newCompanyId = crypto.randomUUID();

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ company_id: newCompanyId })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Error updating company_id:", updateError);
        }

        return newCompanyId;
      }

      return data.company_id;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
};
