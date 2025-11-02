import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useAuth } from "@/contexts/AuthContext";

type Technician = Database["public"]["Tables"]["tekniikat"]["Row"];
type InsertTechnician = Database["public"]["Tables"]["tekniikat"]["Insert"];

// Hook for fetching technicians
export const useTechnicians = () => {
  return useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tekniikat")
        .select("*")
        .eq("is_active", true)
        .order("nimi");
      
      if (error) throw error;
      return data as Technician[];
    },
  });
};

// Hook for adding a new technician
export const useAddTechnician = () => {
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (technician: Omit<InsertTechnician, 'company_id'>) => {
      if (!companyId) throw new Error("Company ID not found");

      const { data, error } = await supabase
        .from("tekniikat")
        .insert([{ ...technician, company_id: companyId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Onnistui!",
        description: "Uusi teknikko lisätty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Teknikon lisääminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating technician
export const useUpdateTechnician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Technician> }) => {
      const { data, error } = await supabase
        .from("tekniikat")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Onnistui!",
        description: "Teknikko päivitetty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Teknikon päivittäminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting technician
export const useDeleteTechnician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tekniikat")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Onnistui!",
        description: "Teknikko poistettu onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Teknikon poistaminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for ensuring technician exists in tekniikat table
export const useEnsureTechnicianExists = () => {
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!session?.user || !companyId) {
        return;
      }

      // Tarkista onko teknikko jo olemassa
      const { data: existing, error: checkError } = await supabase
        .from("tekniikat")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("company_id", companyId)
        .maybeSingle();

      if (checkError) {
        console.error("❌ Virhe tarkistettaessa teknikkoa:", checkError);
        throw checkError;
      }

      if (existing) {
        return existing;
      }

      // Hae käyttäjän profiili
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", session.user.id)
        .single();

      if (profileError) {
        console.error("❌ Virhe haettaessa profiilia:", profileError);
        throw profileError;
      }

      // Lisää teknikko automaattisesti
      const { data: newTechnician, error: insertError } = await supabase
        .from("tekniikat")
        .insert({
          nimi: profile.full_name || session.user.email || "Nimetön teknikko",
          company_id: companyId,
          user_id: session.user.id,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Virhe lisättäessä teknikkoa:", insertError);
        throw insertError;
      }

      return newTechnician;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Onnistui!",
        description: "Sinut on lisätty tekniikoihin.",
      });
    },
    onError: (error) => {
      console.error("❌ useEnsureTechnicianExists virhe:", error);
      toast({
        title: "Virhe",
        description: "Teknikon lisäys epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};