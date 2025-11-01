import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addMonths, differenceInDays, isBefore, isAfter } from "date-fns";

export interface WarrantyInfo {
  id: string;
  numero: string;
  asiakasNimi: string;
  laiteMerkki: string;
  laiteMalli: string;
  valmistumispvm: string;
  luovutettuPvm: string;
  tyotakuuKuukautta: number;
  osatakuuKuukautta: number;
  tyotakuuPaattyy: Date;
  osatakuuPaattyy: Date;
  tyotakuuStatus: "voimassa" | "paattyy_pian" | "paattynyt";
  osatakuuStatus: "voimassa" | "paattyy_pian" | "paattynyt";
  tyotakuuPaivia: number;
  osatakuuPaivia: number;
  asiakas_id: string;
  laite_id: string;
}

const getWarrantyStatus = (endDate: Date): "voimassa" | "paattyy_pian" | "paattynyt" => {
  const today = new Date();
  const daysLeft = differenceInDays(endDate, today);
  
  if (isBefore(endDate, today)) return "paattynyt";
  if (daysLeft <= 30) return "paattyy_pian";
  return "voimassa";
};

export const useWarranties = () => {
  return useQuery({
    queryKey: ["warranties"],
    queryFn: async () => {
      // First get services with warranty info
      const { data: servicesData, error: servicesError } = await supabase
        .from("huollot")
        .select("*")
        .or("tyotakuu_kuukautta.gt.0,osatakuu_kuukautta.gt.0")
        .not("valmistunut_pvm", "is", null);

      if (servicesError) throw servicesError;

      // Get customer names
      const customerIds = [...new Set(servicesData.map(s => s.asiakas_id).filter(Boolean))];
      const { data: customersData } = await supabase
        .from("asiakkaat")
        .select("id, nimi")
        .in("id", customerIds);

      // Get device info
      const deviceIds = [...new Set(servicesData.map(s => s.laite_id).filter(Boolean))];
      const { data: devicesData } = await supabase
        .from("laitteet")
        .select("id, merkki, malli")
        .in("id", deviceIds);

      const warranties: WarrantyInfo[] = servicesData
        .filter(service => {
          // Näytä vain huollot joilla on eksplisiittisesti asetettu takuu ja jotka ovat valmistuneita/luovutettuja
          const hasWorkWarranty = service.tyotakuu_kuukautta && service.tyotakuu_kuukautta > 0;
          const hasPartsWarranty = service.osatakuu_kuukautta && service.osatakuu_kuukautta > 0;
          const isCompleted = service.valmistunut_pvm || service.luovutettu_pvm;
          
          return (hasWorkWarranty || hasPartsWarranty) && isCompleted;
        })
        .map(service => {
          const customer = customersData?.find(c => c.id === service.asiakas_id);
          const device = devicesData?.find(d => d.id === service.laite_id);
          
          const baseDate = new Date(service.luovutettu_pvm || service.valmistunut_pvm);
          const tyotakuuPaattyy = service.tyotakuu_kuukautta && service.tyotakuu_kuukautta > 0
            ? addMonths(baseDate, service.tyotakuu_kuukautta)
            : baseDate;
          const osatakuuPaattyy = service.osatakuu_kuukautta && service.osatakuu_kuukautta > 0
            ? addMonths(baseDate, service.osatakuu_kuukautta)
            : baseDate;

          return {
            id: service.id,
            numero: service.numero || "",
            asiakasNimi: customer?.nimi || "",
            laiteMerkki: device?.merkki || service.merkki || "",
            laiteMalli: device?.malli || service.malli || "",
            valmistumispvm: service.valmistunut_pvm,
            luovutettuPvm: service.luovutettu_pvm,
            tyotakuuKuukautta: service.tyotakuu_kuukautta || 0,
            osatakuuKuukautta: service.osatakuu_kuukautta || 0,
            tyotakuuPaattyy,
            osatakuuPaattyy,
            tyotakuuStatus: service.tyotakuu_kuukautta && service.tyotakuu_kuukautta > 0 ? getWarrantyStatus(tyotakuuPaattyy) : "paattynyt",
            osatakuuStatus: service.osatakuu_kuukautta && service.osatakuu_kuukautta > 0 ? getWarrantyStatus(osatakuuPaattyy) : "paattynyt",
            tyotakuuPaivia: service.tyotakuu_kuukautta && service.tyotakuu_kuukautta > 0 ? differenceInDays(tyotakuuPaattyy, new Date()) : 0,
            osatakuuPaivia: service.osatakuu_kuukautta && service.osatakuu_kuukautta > 0 ? differenceInDays(osatakuuPaattyy, new Date()) : 0,
            asiakas_id: service.asiakas_id,
            laite_id: service.laite_id,
          };
        });

      return warranties;
    },
  });
};

export const useWarrantyStats = (warranties: WarrantyInfo[] | undefined) => {
  const voimassaTyotakuut = warranties?.filter(w => w.tyotakuuKuukautta > 0 && w.tyotakuuStatus === "voimassa").length || 0;
  const voimassaOsatakuut = warranties?.filter(w => w.osatakuuKuukautta > 0 && w.osatakuuStatus === "voimassa").length || 0;
  const paattyvatPianTyotakuut = warranties?.filter(w => w.tyotakuuKuukautta > 0 && w.tyotakuuStatus === "paattyy_pian").length || 0;
  const paattyvatPianOsatakuut = warranties?.filter(w => w.osatakuuKuukautta > 0 && w.osatakuuStatus === "paattyy_pian").length || 0;
  
  return {
    voimassaTyotakuut,
    voimassaOsatakuut,
    paattyvatPianTyotakuut,
    paattyvatPianOsatakuut,
    yhteensa: warranties?.length || 0,
  };
};