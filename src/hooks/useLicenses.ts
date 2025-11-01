import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface License {
  id: string;
  license_key: string;
  company_id: string | null;
  plan_type: string | null;
  max_users: number | null;
  is_used: boolean | null;
  activated_by: string | null;
  activated_at: string | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
}

export function useLicenses() {
  return useQuery({
    queryKey: ["licenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("licenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as License[];
    },
  });
}

export function useUpdateLicenseNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data, error } = await supabase
        .from("licenses")
        .update({ notes })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast.success("Muistiinpanot päivitetty!");
    },
    onError: (error: Error) => {
      toast.error(`Virhe: ${error.message}`);
    },
  });
}

export function useRevokeLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("licenses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast.success("Lisenssi mitätöity!");
    },
    onError: (error: Error) => {
      toast.error(`Virhe: ${error.message}`);
    },
  });
}

export function useUpdateLicenseExpiration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, expiresAt }: { id: string; expiresAt: string | null }) => {
      const { data, error } = await supabase
        .from("licenses")
        .update({ expires_at: expiresAt })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast.success("Voimassaoloaika päivitetty!");
    },
    onError: (error: Error) => {
      toast.error(`Virhe: ${error.message}`);
    },
  });
}
