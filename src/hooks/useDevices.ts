import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

type Device = Database["public"]["Tables"]["Laitteet"]["Row"] & {
  asiakkaat?: Database["public"]["Tables"]["asiakkaat"]["Row"] | null;
};
type InsertDevice = Database["public"]["Tables"]["Laitteet"]["Insert"];

// Hook for fetching devices with customer information
export const useDevices = (searchTerm = "") => {
  return useQuery({
    queryKey: ["devices", searchTerm],
    queryFn: async () => {
      console.log("Fetching devices in development mode...");
      // Hae kaikki laitteet (ei enää asiakaskohtaisia)
      let devicesQuery = supabase.from("Laitteet").select("*");

      if (searchTerm) {
        devicesQuery = devicesQuery.or(
          `sarjanumero.ilike.%${searchTerm}%,malli.ilike.%${searchTerm}%,merkki.ilike.%${searchTerm}%`
        );
      }

      const { data: devices, error: devicesError } = await devicesQuery.order("created_at", { ascending: false });
      
      if (devicesError) throw devicesError;
      if (!devices) return [];

      // Palautetaan laitteet sellaisenaan
      return devices as Device[];
    },
  });
};

// Hook for fetching customers for the device form
export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asiakkaat")
        .select("*")
        .order("nimi", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

// Hook for adding a new device
export const useAddDevice = () => {
  const queryClient = useQueryClient();
  const { data: companyId } = useCompanyId();

  return useMutation({
    mutationFn: async (device: Omit<InsertDevice, 'company_id'>) => {
      if (!companyId) throw new Error("Company ID not found");
      
      console.log("🔧 useAddDevice: Aloitetaan laitteen tallennus:", device);
      
      const deviceData = { ...device, company_id: companyId };
      console.log("🔧 useAddDevice: Tallennetaan data:", deviceData);
      
      const { data, error } = await supabase
        .from("Laitteet")
        .insert([deviceData])
        .select()
        .single();

      if (error) {
        console.error("❌ useAddDevice: Virhe:", error);
        throw error;
      }
      
      console.log("✅ useAddDevice: Tallennus onnistui:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("🔧 useAddDevice: onSuccess kutsuttu:", data);
      // Invalidoi kaikki device-kyselyt
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Onnistui!",
        description: "Uusi laite lisätty onnistuneesti.",
      });
    },
    onError: (error) => {
      console.error("❌ useAddDevice: onError:", error);
      toast({
        title: "Virhe",
        description: "Laitteen lisääminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for updating a device
export const useUpdateDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertDevice> }) => {
      console.log("🔧 useUpdateDevice: Päivitetään laite:", id, updates);
      
      const { data, error } = await supabase
        .from("Laitteet")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ useUpdateDevice: Virhe:", error);
        throw error;
      }
      
      console.log("✅ useUpdateDevice: Päivitys onnistui:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast({
        title: "Onnistui!",
        description: "Laitteen tiedot päivitetty onnistuneesti.",
      });
    },
    onError: (error) => {
      console.error("❌ useUpdateDevice: onError:", error);
      toast({
        title: "Virhe",
        description: "Laitteen päivittäminen epäonnistui: " + error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for getting device service count
export const useDeviceServiceCount = (deviceId: string) => {
  return useQuery({
    queryKey: ["device-services", deviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Huollot")
        .select("id")
        .eq("laite_id", deviceId);

      if (error) throw error;
      return data?.length || 0;
    },
  });
};

// Hook for getting last service date
export const useLastServiceDate = (deviceId: string) => {
  return useQuery({
    queryKey: ["last-service", deviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Huollot")
        .select("created_at")
        .eq("laite_id", deviceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data?.created_at || null;
    },
  });
};