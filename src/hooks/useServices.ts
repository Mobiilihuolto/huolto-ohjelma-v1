import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

type Service = Database["public"]["Tables"]["huollot"]["Row"] & {
  asiakkaat?: Database["public"]["Tables"]["asiakkaat"]["Row"] | null;
  laitteet?: Database["public"]["Tables"]["laitteet"]["Row"] | null;
  tekniikat?: Database["public"]["Tables"]["tekniikat"]["Row"] | null;
  huolto_varaosat?: Array<{
    id: string;
    maara: number;
    yksikkohinta: number;
  }>;
};
type InsertService = Database["public"]["Tables"]["huollot"]["Insert"];

// Hook for fetching services with customer and device information
export const useServices = () => {
  const { data: companyId } = useCompanyId();

  return useQuery({
    queryKey: ["services", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];

      // Get services for current company only
      const { data: services, error: servicesError } = await supabase
        .from("huollot")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (servicesError) throw servicesError;
      if (!services) return [];

      // Get customers for current company
      const { data: customers, error: customersError } = await supabase
        .from("asiakkaat")
        .select("*")
        .eq("company_id", companyId);

      if (customersError) throw customersError;

      // Get devices for current company
      const { data: devices, error: devicesError } = await supabase
        .from("laitteet")
        .select("*")
        .eq("company_id", companyId);

      if (devicesError) throw devicesError;

      // Get technicians for current company
      const { data: technicians, error: techniciansError } = await supabase
        .from("tekniikat")
        .select("*")
        .eq("company_id", companyId);

      if (techniciansError) throw techniciansError;

      // Get service parts
      const { data: serviceParts, error: servicePartsError } = await supabase
        .from("huolto_varaosat")
        .select("id, huolto_id, maara, yksikkohinta");

      if (servicePartsError) throw servicePartsError;

      // Join the data manually
      const servicesWithDetails = services.map((service) => {
        const customer = customers?.find(c => c.id === service.asiakas_id);
        const device = devices?.find(d => d.id === service.laite_id);
        const technician = technicians?.find(t => t.id === service.teknikko_id);
        const parts = serviceParts?.filter(p => p.huolto_id === service.id) || [];
        return {
          ...service,
          asiakkaat: customer || null,
          laitteet: device || null,
          tekniikat: technician || null,
          huolto_varaosat: parts
        };
      });

      return servicesWithDetails as Service[];
    },
  });
};

// Hook for adding a new service
export const useAddService = () => {
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (service: Omit<InsertService, 'company_id'>) => {
      if (!companyId) throw new Error("Company ID not found");

      const { data, error } = await supabase
        .from("huollot")
        .insert([{ ...service, company_id: companyId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Onnistui!",
        description: "Uusi huoltotyö lisätty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Huoltotyön lisääminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating service status
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Service> }) => {
      const { data, error } = await supabase
        .from("huollot")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Onnistui!",
        description: "Huoltotyö päivitetty onnistuneesti.",
      });
    },
    onError: (error) => {
      toast({
        title: "Virhe",
        description: "Huoltotyön päivittäminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};