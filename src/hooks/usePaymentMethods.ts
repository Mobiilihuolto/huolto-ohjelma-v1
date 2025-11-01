import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

export interface PaymentMethod {
  id: string;
  nimi: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const usePaymentMethods = () => {
  const { data: companyId } = useCompanyId();
  
  return useQuery({
    queryKey: ["payment-methods", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("maksutavat")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      
      return data as PaymentMethod[];
    },
    enabled: !!companyId
  });
};

export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (nimi: string) => {
      if (!companyId) throw new Error("Company ID not found");

      const { data, error } = await supabase
        .from("maksutavat")
        .insert([{ nimi, company_id: companyId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({
        title: "Onnistui!",
        description: "Maksutapa lisätty.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, nimi }: { id: string; nimi: string }) => {
      const { data, error } = await supabase
        .from("maksutavat")
        .update({ nimi })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({
        title: "Onnistui!",
        description: "Maksutapa päivitetty.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("maksutavat")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({
        title: "Onnistui!",
        description: "Maksutapa poistettu.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Virhe",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
