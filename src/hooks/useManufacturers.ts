import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

type Manufacturer = Database["public"]["Tables"]["laite_valmistajat"]["Row"];
type InsertManufacturer = Database["public"]["Tables"]["laite_valmistajat"]["Insert"];
type UpdateManufacturer = Database["public"]["Tables"]["laite_valmistajat"]["Update"];

// Hook for fetching manufacturers
export const useManufacturers = () => {
  const { data: companyId } = useCompanyId();
  
  return useQuery({
    queryKey: ["manufacturers", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("laite_valmistajat")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data as Manufacturer[];
    },
    enabled: !!companyId
  });
};

// Hook for adding a new manufacturer
export const useAddManufacturer = () => {
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (manufacturer: Omit<InsertManufacturer, 'company_id'>) => {
      if (!companyId) throw new Error("Company ID not found");

      const { data, error } = await supabase
        .from("laite_valmistajat")
        .insert([{ ...manufacturer, company_id: companyId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manufacturers"] });
      toast({
        title: "Onnistui!",
        description: "Valmistaja lisätty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Valmistajan lisääminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating a manufacturer
export const useUpdateManufacturer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateManufacturer }) => {
      const { data, error } = await supabase
        .from("laite_valmistajat")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manufacturers"] });
      toast({
        title: "Onnistui!",
        description: "Valmistaja päivitetty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Valmistajan päivittäminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting (deactivating) a manufacturer
export const useDeleteManufacturer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("laite_valmistajat")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manufacturers"] });
      toast({
        title: "Onnistui!",
        description: "Valmistaja poistettu onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Valmistajan poistaminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};
