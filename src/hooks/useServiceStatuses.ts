import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

type ServiceStatus = Database["public"]["Tables"]["service_statuses"]["Row"];
type InsertServiceStatus = Database["public"]["Tables"]["service_statuses"]["Insert"];
type UpdateServiceStatus = Database["public"]["Tables"]["service_statuses"]["Update"];

// Hook for fetching service statuses
export const useServiceStatuses = () => {
  const { data: companyId } = useCompanyId();
  
  return useQuery({
    queryKey: ["service-statuses", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("service_statuses")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      
      return data as ServiceStatus[];
    },
    enabled: !!companyId
  });
};

// Hook for adding a new service status
export const useAddServiceStatus = () => {
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (status: Omit<InsertServiceStatus, 'company_id'>) => {
      if (!companyId) throw new Error("Company ID not found");

      const { data, error } = await supabase
        .from("service_statuses")
        .insert([{ ...status, company_id: companyId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-statuses"] });
      toast({
        title: "Onnistui!",
        description: "Uusi status lisätty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Statuksen lisääminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating service status
export const useUpdateServiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateServiceStatus }) => {
      const { data, error } = await supabase
        .from("service_statuses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-statuses"] });
      toast({
        title: "Onnistui!",
        description: "Status päivitetty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Statuksen päivittäminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for deleting service status (mark as inactive)
export const useDeleteServiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("service_statuses")
        .update({ is_active: false })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-statuses"] });
      toast({
        title: "Onnistui!",
        description: "Status poistettu onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Statuksen poistaminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for setting default status
export const useSetDefaultStatus = () => {
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!companyId) throw new Error("Company ID not found");
      
      // First, remove default from all other statuses in same company
      await supabase
        .from("service_statuses")
        .update({ is_default: false })
        .eq("company_id", companyId)
        .neq("id", id);

      // Then set the new default
      const { data, error } = await supabase
        .from("service_statuses")
        .update({ is_default: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-statuses"] });
      toast({
        title: "Onnistui!",
        description: "Oletusstatus asetettu onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Oletusstatus asettaminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};