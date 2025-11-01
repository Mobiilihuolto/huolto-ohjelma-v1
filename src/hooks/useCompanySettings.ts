import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

export interface CompanySettings {
  id: string;
  user_id?: string;
  yrityksen_nimi: string;
  osoite?: string;
  postinumero?: string;
  postitoimipaikka?: string;
  puhelin?: string;
  email?: string;
  y_tunnus?: string;
  alv_numero?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCompanySettings = () => {
  const { data: companyId } = useCompanyId();
  
  return useQuery({
    queryKey: ["company-settings", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from("yrityksen_asetukset")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      
      // Jos asetuksia ei löydy, luo oletusasetukset
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from("yrityksen_asetukset")
          .insert({
            company_id: companyId,
            yrityksen_nimi: "Yrityksen nimi",
            is_active: true
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        return newSettings as CompanySettings;
      }
      
      return data as CompanySettings | null;
    },
    enabled: !!companyId,
  });
};

export const useUpdateCompanySettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (settings: any) => {
      if (!companyId) throw new Error("Company ID not found");

      // Check if settings exist
      const { data: existing } = await supabase
        .from("yrityksen_asetukset")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("yrityksen_asetukset")
          .update(settings)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new with company_id
        const { data, error } = await supabase
          .from("yrityksen_asetukset")
          .insert([{ ...settings, company_id: companyId }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      toast({
        title: "Tallennettu",
        description: "Yrityksen tiedot on päivitetty",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Virhe",
        description: error.message,
      });
    },
  });
};

export const useUploadLogo = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("company-logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("company-logos")
        .getPublicUrl(filePath);

      return publicUrl;
    },
    onSuccess: () => {
      toast({
        title: "Ladattu",
        description: "Logo on ladattu onnistuneesti",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Virhe",
        description: error.message,
      });
    },
  });
};
