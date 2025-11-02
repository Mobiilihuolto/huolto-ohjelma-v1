import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";

export interface InventoryPart {
  id: string;
  nimi: string;
  kuvaus?: string;
  hinta: number;
  kustannushinta?: number;
  saldo: number;
  minimisaldo?: number;
  yksikko?: string;
  toimittaja?: string;
  tuotekoodi?: string;
  kategoria?: string;
  sisaltaa_alv: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventorySettings {
  id: string;
  varasto_kaytossa: boolean;
  automaattinen_saldo_vahennys: boolean;
  varoita_matalasta_saldosta: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicePart {
  id: string;
  huolto_id: string;
  varaosa_id: string;
  maara: number;
  yksikkohinta: number;
  created_at: string;
}

// Hook to get inventory settings
export const useInventorySettings = () => {
  const { data: companyId } = useCompanyId();
  
  return useQuery({
    queryKey: ['inventory-settings', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from('varasto_asetukset')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      
      // Jos asetuksia ei löydy, luo oletusasetukset
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from('varasto_asetukset')
          .insert({
            company_id: companyId,
            varasto_kaytossa: false,
            automaattinen_saldo_vahennys: true,
            varoita_matalasta_saldosta: true,
            is_active: true
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        return newSettings as InventorySettings;
      }
      
      return data as InventorySettings | null;
    },
    enabled: !!companyId
  });
};

// Hook to get all inventory parts
export const useInventoryParts = () => {
  const { data: companyId } = useCompanyId();

  return useQuery({
    queryKey: ['inventory-parts', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('varaosat')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('nimi');

      if (error) throw error;
      return data as InventoryPart[];
    },
    enabled: !!companyId
  });
};

// Hook to get available inventory parts (in stock)
export const useAvailableInventoryParts = () => {
  const { data: companyId } = useCompanyId();

  return useQuery({
    queryKey: ['available-inventory-parts', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('varaosat')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .gt('saldo', 0)
        .order('nimi');

      if (error) throw error;
      return data as InventoryPart[];
    },
    enabled: !!companyId
  });
};

// Hook to get service parts for a specific service
export const useServiceParts = (serviceId?: string) => {
  return useQuery({
    queryKey: ['service-parts', serviceId],
    queryFn: async () => {
      if (!serviceId) return [];

      const { data, error } = await supabase
        .from('huolto_varaosat')
        .select(`
          *,
          varaosat (*)
        `)
        .eq('huolto_id', serviceId);

      if (error) throw error;
      return data;
    },
    enabled: !!serviceId
  });
};

// Hook to add a part to service
export const useAddServicePart = () => {
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (partData: {
      huolto_id: string;
      varaosa_id: string;
      maara: number;
      yksikkohinta: number;
    }) => {
      if (!companyId) throw new Error("Company ID not found");

      // Insert service part with company_id
      const { data: result, error } = await supabase
        .from('huolto_varaosat')
        .insert({ ...partData, company_id: companyId })
        .select()
        .single();

      if (error) throw error;

      // Check if automatic stock deduction is enabled
      const { data: settings } = await supabase
        .from('varasto_asetukset')
        .select('automaattinen_saldo_vahennys')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .maybeSingle();

      // Reduce stock if automatic deduction is enabled
      if (settings?.automaattinen_saldo_vahennys) {
        const { error: updateError } = await supabase.rpc('reduce_part_stock', {
          part_id: partData.varaosa_id,
          quantity: partData.maara
        });

        if (updateError) {
          console.error('Failed to reduce stock:', updateError);
        }
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-parts', variables.huolto_id] });
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      queryClient.invalidateQueries({ queryKey: ['available-inventory-parts'] });
    }
  });
};

// Hook to remove a part from service
export const useRemoveServicePart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ servicePartId, serviceId }: { servicePartId: string; serviceId: string }) => {
      const { error } = await supabase
        .from('huolto_varaosat')
        .delete()
        .eq('id', servicePartId);

      if (error) throw error;
      return servicePartId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-parts', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      queryClient.invalidateQueries({ queryKey: ['available-inventory-parts'] });
    }
  });
};

// Hook to update inventory settings
export const useUpdateInventorySettings = () => {
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (data: Partial<InventorySettings>) => {
      if (!companyId) throw new Error("Company ID not found");

      const { data: existingSettings } = await supabase
        .from('varasto_asetukset')
        .select('id')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .maybeSingle();

      if (existingSettings) {
        const { data: result, error } = await supabase
          .from('varasto_asetukset')
          .update(data)
          .eq('company_id', companyId)
          .eq('is_active', true)
          .select()
          .single();

        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('varasto_asetukset')
          .insert({
            company_id: companyId,
            varasto_kaytossa: data.varasto_kaytossa ?? false,
            automaattinen_saldo_vahennys: data.automaattinen_saldo_vahennys ?? true,
            varoita_matalasta_saldosta: data.varoita_matalasta_saldosta ?? true,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-settings'] });
    }
  });
};

// Hook to add inventory part
export const useAddInventoryPart = () => {
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (partData: Omit<InventoryPart, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
      if (!companyId) throw new Error("Company ID not found");

      const { data: result, error } = await supabase
        .from('varaosat')
        .insert({ ...partData, company_id: companyId })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      queryClient.invalidateQueries({ queryKey: ['available-inventory-parts'] });
    }
  });
};

// Hook to update inventory part
export const useUpdateInventoryPart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<InventoryPart>) => {
      const { data: result, error } = await supabase
        .from('varaosat')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      queryClient.invalidateQueries({ queryKey: ['available-inventory-parts'] });
    }
  });
};

// Hook to delete inventory part
export const useDeleteInventoryPart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('varaosat')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      queryClient.invalidateQueries({ queryKey: ['available-inventory-parts'] });
    }
  });
};