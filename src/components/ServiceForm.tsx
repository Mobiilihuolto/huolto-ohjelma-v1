import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, User, Wrench, Euro, Clock, Calendar, Package, Plus, Minus } from "lucide-react";
import { useCustomers, useAddCustomer } from "@/hooks/useCustomers";
import { useDevices, useAddDevice } from "@/hooks/useDevices";
import { useAddService } from "@/hooks/useServices";
import { useServiceStatuses } from "@/hooks/useServiceStatuses";
import { usePricingSettings, useFixedPriceSettings, useHourlyRateSettings } from "@/hooks/usePricingSettings";
import { useWarrantySettings } from "@/hooks/useWarrantySettings";
import { useTechnicians, useEnsureTechnicianExists } from "@/hooks/useTechnicians";
import { useInventorySettings, useAvailableInventoryParts, InventoryPart } from "@/hooks/useInventory";
import { useManufacturers } from "@/hooks/useManufacturers";
import { useCurrentUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/contexts/AuthContext";
import { AddNewPartDialog } from "@/components/AddNewPartDialog";
import { hasRole } from "@/lib/roleUtils";
import { useToast } from "@/hooks/use-toast";

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ServiceForm = ({ open, onOpenChange }: ServiceFormProps) => {
  const queryClient = useQueryClient();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [deviceSerial, setDeviceSerial] = useState("");
  const [customManufacturer, setCustomManufacturer] = useState("");
  const [pricingType, setPricingType] = useState<"tuntiveloitus" | "kertamaksu">("kertamaksu");
  const [selectedFixedPriceId, setSelectedFixedPriceId] = useState<string>("");
  const [selectedFixedPriceName, setSelectedFixedPriceName] = useState<string>("");
  const [selectedHourlyRateId, setSelectedHourlyRateId] = useState<string>("");
  const [selectedHourlyRateName, setSelectedHourlyRateName] = useState<string>("");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [fixedPrice, setFixedPrice] = useState<string>("");
  const [selectedWarrantySettingId, setSelectedWarrantySettingId] = useState<string>("");
  const [workWarranty, setWorkWarranty] = useState<string>("");
  const [partsWarranty, setPartsWarranty] = useState<string>("");
  
  // Uusi asiakas -kentät
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [newCustomerType, setNewCustomerType] = useState<"henkilö" | "yritys">("henkilö");
  const [newCustomerCompanyName, setNewCustomerCompanyName] = useState("");
  const [newCustomerYTunnus, setNewCustomerYTunnus] = useState("");
  const [newCustomerAlvNumero, setNewCustomerAlvNumero] = useState("");

  // Uudet kentät
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState<string>(() => {
    // Oletuksena seuraava päivä
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  // Varaosa-kentät
  const [selectedParts, setSelectedParts] = useState<Array<{
    id: string;
    varaosa_id: string;
    nimi: string;
    maara: number;
    yksikkohinta: number;
    kustannushinta?: number;
  }>>([]);
  const [showAddNewPartDialog, setShowAddNewPartDialog] = useState(false);
  const [currentPartSelection, setCurrentPartSelection] = useState<string>("");

  // Laitteiden tallentaminen -kentät
  const [showDeviceSaveDialog, setShowDeviceSaveDialog] = useState(false);
  const [saveDevicePermanently, setSaveDevicePermanently] = useState(false);

  const { data: customers, isLoading: customersLoading } = useCustomers();
  const { data: devices, isLoading: devicesLoading } = useDevices();
  const { data: statusesData } = useServiceStatuses();
  const { data: pricingSettings } = usePricingSettings();
  const { data: fixedPriceSettings } = useFixedPriceSettings();
  const { data: hourlyRateSettings } = useHourlyRateSettings();
  const { data: warrantySettings } = useWarrantySettings();
  const { data: technicians, isLoading: techniciansLoading } = useTechnicians();
  const { data: inventorySettings } = useInventorySettings();
  const { data: availableParts } = useAvailableInventoryParts();
  const { data: manufacturers, isLoading: manufacturersLoading } = useManufacturers();
  const { data: currentUserRoles } = useCurrentUserRoles();
  const ensureTechnicianMutation = useEnsureTechnicianExists();
  const { session } = useAuth();
  const { toast } = useToast();

  const addServiceMutation = useAddService();
  const addCustomerMutation = useAddCustomer();
  const addDeviceMutation = useAddDevice();

  // Set default values from settings
  const defaultHourlyRate = hourlyRateSettings?.[0];
  const defaultWarranty = warrantySettings?.find(w => w.nimi.includes("Normaali")) || warrantySettings?.[0];

  // Auto-select technician if user has teknikko role
  useEffect(() => {
    const initializeTechnician = async () => {
      if (open && hasRole(currentUserRoles, 'teknikko') && technicians && !selectedTechnicianId) {
        console.log("🔍 Tekniikat:", technicians);
        console.log("🔍 Käyttäjän roolit:", currentUserRoles);
        
        try {
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          // Check if user already exists in tekniikat table
          const existingTechnician = technicians.find(t => t.user_id === user.id);
          
          if (!existingTechnician) {
            console.log("⚠️ Teknikkoa ei löytynyt, lisätään automaattisesti...");
            // Add user to tekniikat table
            await ensureTechnicianMutation.mutateAsync();
            
            // Wait a moment and refresh the list
            setTimeout(async () => {
              await queryClient.invalidateQueries({ queryKey: ['technicians'] });
              
              // Try to select the technician again after refresh
              const { data: refreshedTechnicians } = await supabase
                .from("tekniikat")
                .select("*")
                .eq("is_active", true)
                .eq("user_id", user.id);
              
              if (refreshedTechnicians && refreshedTechnicians.length > 0) {
                setSelectedTechnicianId(refreshedTechnicians[0].id);
                console.log("✅ Teknikko asetettu automaattisesti:", refreshedTechnicians[0].nimi);
              }
            }, 500);
          } else {
            // User already exists, just select them
            setSelectedTechnicianId(existingTechnician.id);
            console.log("✅ Teknikko asetettu automaattisesti:", existingTechnician.nimi);
          }
        } catch (error) {
          console.error("❌ Teknikon alustus epäonnistui:", error);
          toast({
            title: "Virhe",
            description: "Teknikon automaattinen asetus epäonnistui",
            variant: "destructive",
          });
        }
      }
    };
    
    initializeTechnician();
  }, [open, currentUserRoles, technicians, selectedTechnicianId]);
  
  // Handle fixed price selection
  const handleFixedPriceSelect = (value: string) => {
    setSelectedFixedPriceId(value);
    
    if (value && value !== "custom") {
      const selectedSetting = fixedPriceSettings?.find(s => s.id === value);
      if (selectedSetting && selectedSetting.kiintea_hinta) {
        setFixedPrice(selectedSetting.kiintea_hinta.toString());
        setSelectedFixedPriceName(selectedSetting.nimi);
      }
    } else if (value === "custom") {
      setFixedPrice("");
      setSelectedFixedPriceName("");
    }
  };

  // Handle hourly rate selection
  const handleHourlyRateSelect = (value: string) => {
    setSelectedHourlyRateId(value);
    
    if (value && value !== "custom") {
      const selectedSetting = hourlyRateSettings?.find(s => s.id === value);
      if (selectedSetting && selectedSetting.oletustuntihinta) {
        setHourlyRate(selectedSetting.oletustuntihinta.toString());
        setSelectedHourlyRateName(selectedSetting.nimi);
      }
    } else if (value === "custom") {
      setHourlyRate("");
      setSelectedHourlyRateName("");
    }
  };

  // Filter devices by selected customer - EI ENÄÄ KÄYTÖSSÄ koska laitteet ovat yleisiä
  // const customerDevices = devices?.filter(device => 
  //   device.asiakas_id === selectedCustomerId
  // ) || [];

  const selectedCustomer = customers?.find(c => c.id === selectedCustomerId);

  const handleCustomerSelect = (value: string) => {
    if (value === "new") {
      setShowNewCustomer(true);
      setSelectedCustomerId("");
    } else {
      setShowNewCustomer(false);
      setSelectedCustomerId(value);
    }
  };

  const handleWarrantySettingSelect = (value: string) => {
    setSelectedWarrantySettingId(value);
    
    if (value && value !== "none") {
      const selectedSetting = warrantySettings?.find(w => w.id === value);
      if (selectedSetting) {
        setWorkWarranty(selectedSetting.oletustyotakuu_kuukautta?.toString() || "");
        setPartsWarranty(selectedSetting.oletusosatakuu_kuukautta?.toString() || "");
      }
    }
  };

  // Tarkista onko laite jo olemassa yleisessä listassa
  const deviceExistsInGeneral = devices?.some(device => 
    device.merkki?.toLowerCase() === deviceBrand.trim().toLowerCase() && 
    device.malli?.toLowerCase() === deviceModel.trim().toLowerCase() &&
    device.merkki && device.malli // Varmista että kentät eivät ole tyhjiä
  );

  console.log("🔧 Device existence check:", {
    deviceBrand: deviceBrand.trim(),
    deviceModel: deviceModel.trim(), 
    devicesCount: devices?.length || 0,
    deviceExistsInGeneral,
    allDevices: devices?.map(d => ({ merkki: d.merkki, malli: d.malli }))
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      return;
    }

    console.log("🔧 Submit aloitettu:", {
      selectedDeviceId,
      deviceBrand: deviceBrand.trim(),
      deviceModel: deviceModel.trim(),
      selectedCustomerId,
      showNewCustomer,
      deviceExistsInGeneral
    });

    // Jos syötetään uusi laite ja se ei ole jo olemassa
    const shouldShowDialog = !selectedDeviceId && 
                            deviceBrand.trim() && 
                            deviceModel.trim() && 
                            !deviceExistsInGeneral &&
                            (selectedCustomerId || showNewCustomer); // Vaaditaan asiakas

    console.log("🔧 Dialog decision:", {
      selectedDeviceId: !!selectedDeviceId,
      hasBrand: !!deviceBrand.trim(),
      hasModel: !!deviceModel.trim(),
      deviceExistsInGeneral,
      hasCustomer: !!(selectedCustomerId || showNewCustomer),
      shouldShowDialog
    });

    console.log("🔧 Pitäisikö näyttää dialogi:", shouldShowDialog);

    if (shouldShowDialog) {
      console.log("🔧 === NÄYTETÄÄN LAITE TALLENNUS DIALOGI ===");
      console.log("🔧 Laitteen tiedot dialogiin:", {
        merkki: deviceBrand.trim(),
        malli: deviceModel.trim(),
        sarjanumero: deviceSerial.trim()
      });
      setShowDeviceSaveDialog(true);
      return;
    }

    console.log("🔧 Ei näytetä dialogia, jatketaan suoraan tallennukseen");
    await processServiceSubmission();
  };

  const processServiceSubmission = async (shouldSaveDevice?: boolean) => {
    console.log("🔧 === PROCESS SERVICE SUBMISSION ALOITETTU ===");
    const actualSaveDevice = shouldSaveDevice !== undefined ? shouldSaveDevice : saveDevicePermanently;
    console.log("🔧 Should save device permanently:", actualSaveDevice);
    let customerId = selectedCustomerId;

    // Jos luodaan uusi asiakas, luo se ensin
    if (showNewCustomer && newCustomerName.trim()) {
      console.log("🔧 Luodaan uusi asiakas:", newCustomerName);
      try {
        const newCustomer = await addCustomerMutation.mutateAsync({
          nimi: newCustomerName.trim(),
          email: newCustomerEmail.trim() || null,
          puhelin: newCustomerPhone.trim() || null,
          osoite: newCustomerAddress.trim() || null,
          tyyppi: newCustomerType,
          yrityksen_nimi: newCustomerType === "yritys" ? newCustomerCompanyName.trim() || null : null,
          y_tunnus: newCustomerType === "yritys" ? newCustomerYTunnus.trim() || null : null,
          alv_numero: newCustomerType === "yritys" ? newCustomerAlvNumero.trim() || null : null,
        });
        customerId = newCustomer.id;
        console.log("✅ Asiakas luotu:", customerId);
      } catch (error) {
        console.error("❌ Virhe luotaessa asiakasta:", error);
        return;
      }
    }

    let deviceId = selectedDeviceId;

    console.log("🔧 Tallennetaanko laite pysyvästi?", actualSaveDevice);
    console.log("🔧 Onko laite valittu?", !!selectedDeviceId);
    console.log("🔧 Laitteen tiedot:", { deviceBrand: deviceBrand.trim(), deviceModel: deviceModel.trim() });

    // Linkitä olemassa oleva laite asiakkaaseen automaattisesti jos tarpeen
    if (selectedDeviceId && customerId) {
      const selectedDevice = devices?.find(d => d.id === selectedDeviceId);
      
      if (selectedDevice && selectedDevice.asiakas_id !== customerId) {
        try {
          const { error: deviceUpdateError } = await supabase.from("laitteet")
            .update({ asiakas_id: customerId })
            .eq("id", selectedDeviceId);
            
          if (deviceUpdateError) {
            console.error("Virhe päivitettäessä laitteen asiakasta:", deviceUpdateError);
          } else {
            console.log("✅ Laite linkitetty asiakkaaseen:", customerId);
          }
        } catch (error) {
          console.error("❌ Virhe linkitettäessä laitetta asiakkaaseen:", error);
        }
      }
    }

    // Jos valittiin tallentaa laite pysyvästi, luo se Laitteet-osioon
    if (actualSaveDevice && !selectedDeviceId && deviceBrand.trim() && deviceModel.trim()) {
      console.log("🔧 TALLENNETAAN LAITE PYSYVÄSTI Laitteet-osioon!");
      try {
        const finalBrand = deviceBrand === "__custom__" ? customManufacturer.trim() : deviceBrand.trim();
        const deviceData = {
          merkki: finalBrand,
          malli: deviceModel.trim(),
          sarjanumero: deviceSerial.trim() || null,
          asiakas_id: null, // Yleinen laite, ei sidottu asiakkaaseen
        };
        
        console.log("🔧 Tallennettava laite data:", deviceData);
        
        const newDevice = await addDeviceMutation.mutateAsync(deviceData);
        console.log("✅ Laite tallennettu Laitteet-osioon onnistuneesti:", newDevice);
        
        // Aseta deviceId jotta huoltotyö linkittyy laitteeseen
        deviceId = newDevice.id;
        console.log("🔧 DeviceId asetettu:", deviceId);
        
        // Päivitä devices query eksplisiittisesti
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error("❌ KRIITTINEN VIRHE tallentaessa laitetta Laitteet-osioon:", error);
        // Näytä virhe käyttäjälle
        return;
      }
    } else if (!actualSaveDevice && !selectedDeviceId && deviceBrand.trim() && deviceModel.trim()) {
      console.log("🔧 Laite tallennetaan VAIN huoltotyöhön (ei Laitteet-osioon)");
      console.log("🔧 deviceId pysyy null-arvona");
      // deviceId pysyy null, laitteen tiedot tallennetaan huoltotyöhön suoraan
    } else if (selectedDeviceId) {
      console.log("🔧 Käytetään valittua laitetta, deviceId:", selectedDeviceId);
    }

    console.log("🔧 Luodaan huoltotyö:", { 
      customerId, 
      deviceId, 
      description: description.trim(),
      actualSaveDevice,
      deviceBrand: deviceBrand.trim(),
      deviceModel: deviceModel.trim(),
      finalDeviceId: deviceId
    });

    // Get default status
    const defaultStatus = statusesData?.find(s => s.is_default);
    const statusName = (defaultStatus?.name || 'odottaa').toLowerCase();

    try {
      const finalBrand = deviceBrand === "__custom__" ? customManufacturer.trim() : deviceBrand.trim();
      const serviceData = {
        asiakas_id: customerId || null,
        laite_id: deviceId || null,
        kuvaus: description.trim(),
        merkki: finalBrand || null,
        malli: deviceModel.trim() || null,
        sarjanumero: deviceSerial.trim() || null,
        status: statusName,
        hinnoittelu_tyyppi: pricingType,
        hinnoittelu_nimi: pricingType === "tuntiveloitus" ? (selectedHourlyRateName || null) : (selectedFixedPriceName || null),
        tuntihinta: pricingType === "tuntiveloitus" ? parseFloat(hourlyRate) || null : null,
        kiintea_hinta: pricingType === "kertamaksu" ? parseFloat(fixedPrice) || null : null,
        tyotakuu_kuukautta: parseInt(workWarranty) || null,
        osatakuu_kuukautta: parseInt(partsWarranty) || null,
        teknikko_id: selectedTechnicianId || null,
        arvioitu_valmistumispvm: estimatedCompletionDate || null,
      };
      
      console.log("🔧 Tallennettava huoltotyö data:", serviceData);
      console.log("🔧 Huoltotyö yhdistetään laitteeseen:", deviceId ? "Kyllä (laite_id: " + deviceId + ")" : "Ei (vain huoltotyön tiedot)");
      
      const result = await addServiceMutation.mutateAsync(serviceData);
      
      console.log("✅ Huoltotyö tallennettu onnistuneesti!", result);

      // Tallenna varaosat huoltotyöhön
      if (selectedParts.length > 0) {
        console.log("💾 Tallennetaan varaosat huoltotyöhön:", selectedParts);
        
        // Get company_id from result
        const companyId = result.company_id;
        
        for (const part of selectedParts) {
          try {
            const { error: partError } = await supabase
              .from('huolto_varaosat')
              .insert({
                huolto_id: result.id,
                varaosa_id: part.varaosa_id || null,
                maara: part.maara,
                yksikkohinta: part.yksikkohinta,
                company_id: companyId
              });

            if (partError) {
              console.error("❌ Virhe tallentaessa varaosaa:", partError);
            } else {
              console.log("✅ Varaosa tallennettu huoltotyöhön");
            }
          } catch (error) {
            console.error("❌ Kriittinen virhe varaosan tallennuksessa:", error);
          }
        }
        console.log("✅ Kaikki varaosat tallennettu!");
        
        // Päivitä query cache jotta varaosat näkyvät heti
        queryClient.invalidateQueries({ queryKey: ['service-parts'] });
      }

      // Reset form
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("❌ Virhe tallentaessa huoltotyötä:", error);
    }
  };

  const resetForm = () => {
    setSelectedCustomerId("");
    setSelectedDeviceId("");
    setDescription("");
    setDeviceBrand("");
    setDeviceModel("");
    setDeviceSerial("");
    setCustomManufacturer("");
    setPricingType("kertamaksu");
    setSelectedFixedPriceId("");
    setSelectedFixedPriceName("");
    setSelectedHourlyRateId("");
    setSelectedHourlyRateName("");
    setHourlyRate("");
    setFixedPrice("");
    setSelectedWarrantySettingId("none");
    setWorkWarranty("");
    setPartsWarranty("");
    
    // Reset new fields
    setSelectedTechnicianId("");
    setEstimatedCompletionDate(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    });
    
    // Reset new customer fields
    setShowNewCustomer(false);
    setNewCustomerName("");
    setNewCustomerEmail("");
    setNewCustomerPhone("");
    setNewCustomerAddress("");
    setNewCustomerType("henkilö");
    setNewCustomerCompanyName("");
    setNewCustomerYTunnus("");
    setNewCustomerAlvNumero("");

    // Reset device save fields
    setSaveDevicePermanently(false);

    // Reset parts selection
    setSelectedParts([]);
    setCurrentPartSelection("");
  };

  const handleDeviceSaveDecision = async (saveDevice: boolean) => {
    console.log("🔧 === DEVICE SAVE DECISION ===");
    console.log("🔧 Käyttäjän valinta:", saveDevice ? "TALLENNA LAITTEET-OSIOON" : "VAIN HUOLTOTYÖHÖN");
    console.log("🔧 Laitteen tiedot:", { 
      deviceBrand: deviceBrand.trim(), 
      deviceModel: deviceModel.trim(), 
      deviceSerial: deviceSerial.trim() 
    });
    
    setSaveDevicePermanently(saveDevice);
    setShowDeviceSaveDialog(false);
    
    console.log("🔧 State päivitetty, saveDevicePermanently:", saveDevice);
    
    // Odota hetki että dialog sulkeutuu ja state päivittyy
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log("🔧 Aloitetaan huoltotyön tallennus...");
    await processServiceSubmission(saveDevice);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <div className="max-h-full overflow-y-auto pr-2">{/* Add inner scroll container */}
        <DialogHeader>
          <DialogTitle>Uusi huoltotyö</DialogTitle>
        </DialogHeader>

        {/* Manual technician addition alert */}
        {hasRole(currentUserRoles, 'teknikko') && 
         technicians && 
         !technicians.some(t => t.user_id === session?.user?.id) && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertDescription className="flex items-center justify-between">
              <span>Sinut ei ole vielä lisätty tekniikoihin.</span>
              <Button 
                onClick={() => ensureTechnicianMutation.mutate()}
                size="sm"
                variant="outline"
                disabled={ensureTechnicianMutation.isPending}
              >
                {ensureTechnicianMutation.isPending ? "Lisätään..." : "Lisää minut teknikiksi"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asiakas valinta */}
          <div className="space-y-2">
            <Label htmlFor="customer">Asiakas</Label>
            {customersLoading ? (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Ladataan asiakkaita...</span>
              </div>
            ) : (
              <Select value={showNewCustomer ? "new" : selectedCustomerId} onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Valitse asiakas tai luo uusi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      + Luo uusi asiakas
                    </div>
                  </SelectItem>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {customer.tyyppi === "yritys" && customer.yrityksen_nimi ? (
                          <span>{customer.yrityksen_nimi} ({customer.nimi})</span>
                        ) : (
                          customer.nimi
                        )}
                        {customer.tyyppi && (
                          <span className="text-xs text-muted-foreground">({customer.tyyppi})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Uusi asiakas lomake */}
          {showNewCustomer && (
            <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
              <Label className="text-sm font-medium">Uuden asiakkaan tiedot</Label>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="newCustomerName" className="text-xs">Nimi *</Label>
                    <Input
                      id="newCustomerName"
                      placeholder="Asiakkaan nimi"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="newCustomerType" className="text-xs">Tyyppi</Label>
                    <Select value={newCustomerType} onValueChange={(value: "henkilö" | "yritys") => setNewCustomerType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="henkilö">Henkilö</SelectItem>
                        <SelectItem value="yritys">Yritys</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newCustomerType === "yritys" && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="newCustomerCompanyName" className="text-xs">Yrityksen nimi</Label>
                      <Input
                        id="newCustomerCompanyName"
                        placeholder="esim. Autopesulla Oy"
                        value={newCustomerCompanyName}
                        onChange={(e) => setNewCustomerCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="newCustomerYTunnus" className="text-xs">Y-tunnus</Label>
                        <Input
                          id="newCustomerYTunnus"
                          placeholder="1234567-8"
                          value={newCustomerYTunnus}
                          onChange={(e) => setNewCustomerYTunnus(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="newCustomerAlvNumero" className="text-xs">ALV-numero</Label>
                        <Input
                          id="newCustomerAlvNumero"
                          placeholder="FI12345678"
                          value={newCustomerAlvNumero}
                          onChange={(e) => setNewCustomerAlvNumero(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="newCustomerEmail" className="text-xs">Sähköposti</Label>
                    <Input
                      id="newCustomerEmail"
                      type="email"
                      placeholder="asiakas@example.com"
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="newCustomerPhone" className="text-xs">Puhelin</Label>
                    <Input
                      id="newCustomerPhone"
                      placeholder="+358 40 123 4567"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="newCustomerAddress" className="text-xs">Osoite</Label>
                  <Input
                    id="newCustomerAddress"
                    placeholder="Esimerkkikatu 1, 00100 Helsinki"
                    value={newCustomerAddress}
                    onChange={(e) => setNewCustomerAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Laite valinta - nyt yleisestä listasta */}
          <div className="space-y-2">
            <Label htmlFor="device">Valitse laite yleisestä listasta</Label>
            {devicesLoading ? (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Ladataan laitteita...</span>
              </div>
            ) : devices && devices.length > 0 ? (
              <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Valitse laite tai jätä tyhjäksi uudelle laitteelle" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        {device.merkki} {device.malli}
                        {device.sarjanumero && (
                          <span className="text-xs text-muted-foreground">({device.sarjanumero})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Ei laitteita järjestelmässä. Voit syöttää laitteen tiedot alle tai lisätä laite ensin Laitteet-osioon.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Uusi laite tiedot (jos ei valittu olemassa olevaa) */}
          {!selectedDeviceId && (
            <div className="space-y-3 border-t pt-3">
              <Label className="text-sm font-medium">Uusi laite</Label>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="model" className="text-xs">Malli</Label>
                  <Input
                    id="model"
                    placeholder="esim. iPhone 12 Pro Max"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="manufacturer" className="text-xs">Valmistaja</Label>
                  {manufacturersLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <Select value={deviceBrand} onValueChange={setDeviceBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder="Valitse valmistaja" />
                      </SelectTrigger>
                      <SelectContent>
                        {manufacturers?.map((m) => (
                          <SelectItem key={m.id} value={m.nimi}>
                            {m.nimi}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom__">+ Muu valmistaja</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                {deviceBrand === "__custom__" && (
                  <div className="space-y-1">
                    <Label htmlFor="customManufacturer" className="text-xs">Syötä valmistaja</Label>
                    <Input
                      id="customManufacturer"
                      placeholder="Kirjoita valmistajan nimi"
                      value={customManufacturer}
                      onChange={(e) => setCustomManufacturer(e.target.value)}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="serial" className="text-xs">Sarjanumero (valinnainen)</Label>
                <Input
                  id="serial"
                  placeholder="Sarjanumero tai tunniste"
                  value={deviceSerial}
                  onChange={(e) => setDeviceSerial(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Asiakkaan ongelmakuvaus */}
          <div className="space-y-2">
            <Label htmlFor="description">Asiakkaan ongelmakuvaus *</Label>
            <Textarea
              id="description"
              placeholder="Kuvaile asiakkaan kuvailema ongelma tai huoltotarve..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Hinnoittelu */}
          <div className="space-y-3 border-t pt-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Hinnoittelu
            </Label>
            
            <RadioGroup 
              value={pricingType} 
              onValueChange={(value: "tuntiveloitus" | "kertamaksu") => setPricingType(value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tuntiveloitus" id="tuntiveloitus" />
                <Label htmlFor="tuntiveloitus" className="text-sm">Tuntiveloitus</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kertamaksu" id="kertamaksu" />
                <Label htmlFor="kertamaksu" className="text-sm">Kiinteä hinta</Label>
              </div>
            </RadioGroup>

            {pricingType === "tuntiveloitus" ? (
              <div className="space-y-3">
                {/* Valmiin hinnoittelun valinta */}
                <div className="space-y-1">
                  <Label htmlFor="hourlyRateSelect" className="text-xs">Valitse hinnoittelu</Label>
                  <Select
                    value={selectedHourlyRateId}
                    onValueChange={handleHourlyRateSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Valitse hinnoittelu tai syötä mukautettu" />
                    </SelectTrigger>
                    <SelectContent>
                      {hourlyRateSettings?.map((setting) => (
                        <SelectItem key={setting.id} value={setting.id}>
                          {setting.nimi} - {setting.oletustuntihinta}€/h
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Mukautettu hinta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tuntihinta kenttä */}
                <div className="space-y-1">
                  <Label htmlFor="hourlyRate" className="text-xs">
                    {selectedHourlyRateId && selectedHourlyRateId !== "custom" ? "Tuntihinta" : "Mukautettu tuntihinta"} (€/h)
                  </Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    placeholder={defaultHourlyRate?.oletustuntihinta?.toString() || "50.00"}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    disabled={selectedHourlyRateId && selectedHourlyRateId !== "custom"}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Valmiin hinnoittelun valinta */}
                <div className="space-y-1">
                  <Label htmlFor="fixedPriceSelect" className="text-xs">Valitse palvelu</Label>
                  <Select
                    value={selectedFixedPriceId}
                    onValueChange={handleFixedPriceSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Valitse palvelu tai syötä mukautettu hinta" />
                    </SelectTrigger>
                    <SelectContent>
                      {fixedPriceSettings?.map((setting) => (
                        <SelectItem key={setting.id} value={setting.id}>
                          {setting.nimi} - {setting.kiintea_hinta}€
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Mukautettu hinta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Hinnan syöttökenttä */}
                <div className="space-y-1">
                  <Label htmlFor="fixedPrice" className="text-xs">
                    {selectedFixedPriceId && selectedFixedPriceId !== "custom" ? "Hinta" : "Mukautettu hinta"} (€)
                  </Label>
                  <Input
                    id="fixedPrice"
                    type="number"
                    step="0.01"
                    placeholder="60.00"
                    value={fixedPrice}
                    onChange={(e) => setFixedPrice(e.target.value)}
                    disabled={selectedFixedPriceId && selectedFixedPriceId !== "custom"}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Takuu */}
          <div className="space-y-3 border-t pt-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Takuu
            </Label>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="warrantySettings" className="text-xs">Takuuasetus (valinnainen)</Label>
                <Select value={selectedWarrantySettingId} onValueChange={handleWarrantySettingSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Valitse takuuasetus tai syötä manuaalisesti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">Ei valmista asetusta</span>
                    </SelectItem>
                    {warrantySettings?.map((warranty) => (
                      <SelectItem key={warranty.id} value={warranty.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{warranty.nimi}</span>
                          <span className="text-xs text-muted-foreground">
                            {(() => {
                              const parts = [];
                              if (warranty.oletustyotakuu_kuukautta) {
                                parts.push(`Työtakuu: ${warranty.oletustyotakuu_kuukautta} kk`);
                              }
                              if (warranty.oletusosatakuu_kuukautta) {
                                parts.push(`Osatakuu: ${warranty.oletusosatakuu_kuukautta} kk`);
                              }
                              return parts.length > 0 ? parts.join(', ') : 'Ei takuuaikoja';
                            })()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="workWarranty" className="text-xs">Työtakuu (kk)</Label>
                   <Input
                     id="workWarranty"
                     type="number"
                     placeholder={(() => {
                       if (selectedWarrantySettingId && selectedWarrantySettingId !== "none") {
                         const selectedSetting = warrantySettings?.find(w => w.id === selectedWarrantySettingId);
                         if (selectedSetting && !selectedSetting.oletustyotakuu_kuukautta) {
                           return "Ei työtakuuta";
                         }
                       }
                       return defaultWarranty?.oletustyotakuu_kuukautta?.toString() || "6";
                     })()}
                     value={workWarranty}
                     onChange={(e) => {
                       setWorkWarranty(e.target.value);
                       // Tyhjennä takuuasetus valinta jos käyttäjä muokkaa manuaalisesti
                       if (selectedWarrantySettingId && e.target.value !== warrantySettings?.find(w => w.id === selectedWarrantySettingId)?.oletustyotakuu_kuukautta?.toString()) {
                        setSelectedWarrantySettingId("none");
                       }
                     }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="partsWarranty" className="text-xs">Osatakuu (kk)</Label>
                   <Input
                     id="partsWarranty"
                     type="number"
                     placeholder={(() => {
                       if (selectedWarrantySettingId && selectedWarrantySettingId !== "none") {
                         const selectedSetting = warrantySettings?.find(w => w.id === selectedWarrantySettingId);
                         if (selectedSetting && !selectedSetting.oletusosatakuu_kuukautta) {
                           return "Ei osatakuuta";
                         }
                       }
                       return defaultWarranty?.oletusosatakuu_kuukautta?.toString() || "12";
                     })()}
                     value={partsWarranty}
                     onChange={(e) => {
                       setPartsWarranty(e.target.value);
                       // Tyhjennä takuuasetus valinta jos käyttäjä muokkaa manuaalisesti
                       if (selectedWarrantySettingId && e.target.value !== warrantySettings?.find(w => w.id === selectedWarrantySettingId)?.oletusosatakuu_kuukautta?.toString()) {
                          setSelectedWarrantySettingId("none");
                       }
                     }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Teknikko */}
          <div className="space-y-2">
            <Label htmlFor="technician" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Teknikko
            </Label>
            {techniciansLoading ? (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Ladataan teknikoita...</span>
              </div>
            ) : hasRole(currentUserRoles, 'teknikko') ? (
              // TEKNIKKO: Näytä vain oma nimi, ei muokattavissa
              <div className="p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">
                    {technicians?.find(t => t.user_id === session?.user?.id)?.nimi || 'Sinä'}
                  </span>
                </div>
              </div>
            ) : (
              // ADMIN: Näytä kaikki tekniikat dropdown-valikossa
              <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
                <SelectTrigger>
                  <SelectValue placeholder="Valitse teknikko (valinnainen)" />
                </SelectTrigger>
                <SelectContent>
                  {technicians?.map((technician) => (
                    <SelectItem key={technician.id} value={technician.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {technician.nimi}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Arvioitu valmistumispäivä */}
          <div className="space-y-2">
            <Label htmlFor="estimatedCompletion" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Arvioitu valmistumispäivä
            </Label>
            <Input
              id="estimatedCompletion"
              type="date"
              value={estimatedCompletionDate}
              onChange={(e) => setEstimatedCompletionDate(e.target.value)}
            />
          </div>

          {/* Varaosat - näkyy vain jos varasto on käytössä */}
          {inventorySettings?.varasto_kaytossa && (
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Varaosat
              </Label>
              
              {/* Valitut varaosat */}
              {selectedParts.length > 0 && (
                <div className="space-y-2">
                  {selectedParts.map((part) => (
                    <div key={part.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                      <div className="flex-1">
                        <span className="font-medium">{part.nimi}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {part.maara} kpl × {part.yksikkohinta.toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedParts = selectedParts.map(p => 
                              p.id === part.id ? { ...p, maara: Math.max(1, p.maara - 1) } : p
                            );
                            setSelectedParts(updatedParts);
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{part.maara}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedParts = selectedParts.map(p => 
                              p.id === part.id ? { ...p, maara: p.maara + 1 } : p
                            );
                            setSelectedParts(updatedParts);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedParts(selectedParts.filter(p => p.id !== part.id));
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-right text-sm text-muted-foreground">
                    Varaosat yhteensä: {selectedParts.reduce((sum, part) => sum + (part.maara * part.yksikkohinta), 0).toFixed(2)} €
                  </div>
                </div>
              )}

              {/* Lisää varaosa */}
              <Select 
                value={currentPartSelection}
                onValueChange={(value) => {
                  if (value === "new") {
                    setShowAddNewPartDialog(true);
                    setCurrentPartSelection("");
                    return;
                  }
                  const part = availableParts?.find(p => p.id === value);
                  if (part) {
                    const existingPart = selectedParts.find(p => p.varaosa_id === part.id);
                    if (existingPart) {
                      // Lisää määrää olemassa olevaan osaan
                      const updatedParts = selectedParts.map(p => 
                        p.varaosa_id === part.id ? { ...p, maara: p.maara + 1 } : p
                      );
                      setSelectedParts(updatedParts);
                    } else {
                      // Lisää uusi osa
                      const newPart = {
                        id: Date.now().toString(),
                        varaosa_id: part.id,
                        nimi: part.nimi,
                        maara: 1,
                        yksikkohinta: part.hinta,
                        kustannushinta: part.kustannushinta,
                      };
                      setSelectedParts([...selectedParts, newPart]);
                    }
                    setCurrentPartSelection("");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lisää varaosa..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">
                    <div className="flex items-center gap-2 font-medium">
                      <Plus className="h-4 w-4" />
                      + Lisää uusi varaosa
                    </div>
                  </SelectItem>
                  {availableParts?.map((part) => (
                    <SelectItem key={part.id} value={part.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{part.nimi}</span>
                        <div className="text-sm text-muted-foreground ml-2">
                          {part.hinta.toFixed(2)} € (saldo: {part.saldo})
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Hinta yhteenveto */}
          {(pricingType === "kertamaksu" && fixedPrice) || (pricingType === "tuntiveloitus" && hourlyRate) || selectedParts.length > 0 ? (
            <div className="space-y-2 border-t pt-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Hinta yhteensä
              </h4>
              <div className="space-y-1 bg-muted/30 p-3 rounded-md">
                {pricingType === "kertamaksu" && fixedPrice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {selectedFixedPriceName ? `Työ ${selectedFixedPriceName}:` : "Työ (kiinteä hinta):"}
                    </span>
                    <span className="font-medium">{parseFloat(fixedPrice).toFixed(2)} € (sis. ALV)</span>
                  </div>
                )}
                {pricingType === "tuntiveloitus" && hourlyRate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tuntiveloitus:</span>
                    <span className="font-medium">{parseFloat(hourlyRate).toFixed(2)} € / h (sis. ALV)</span>
                  </div>
                )}
                {selectedParts.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Varaosat:</span>
                    <span className="font-medium">{selectedParts.reduce((sum, part) => sum + (part.maara * part.yksikkohinta), 0).toFixed(2)} € (sis. ALV)</span>
                  </div>
                )}
                {pricingType === "kertamaksu" && fixedPrice && selectedParts.length > 0 && (
                  <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                    <span>Yhteensä:</span>
                    <span>{(parseFloat(fixedPrice) + selectedParts.reduce((sum, part) => sum + (part.maara * part.yksikkohinta), 0)).toFixed(2)} € (sis. ALV)</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Toiminnot */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Peruuta
            </Button>
            <Button
              type="submit"
              disabled={!description.trim() || addServiceMutation.isPending || (showNewCustomer && !newCustomerName.trim())}
            >
              {addServiceMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Lisätään...
                </>
              ) : (
                "Lisää huoltotyö"
              )}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>

      {/* Dialog kysymään haluaako tallentaa laitteen pysyvästi */}
      <AlertDialog open={showDeviceSaveDialog} onOpenChange={setShowDeviceSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tallennetaanko laite pysyvästi?</AlertDialogTitle>
            <AlertDialogDescription>
              Syöttämääsi laitetta "{deviceBrand} {deviceModel}" ei löydy Laitteet-osiosta. 
              Haluatko tallentaa sen pysyvästi Laitteet-osioon vai tallentaa tiedot vain tähän huoltotyöhön?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleDeviceSaveDecision(false)}>
              Vain tähän huoltotyöhön
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeviceSaveDecision(true)}>
              Tallenna Laitteet-osioon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lisää uusi varaosa dialogi */}
      <AddNewPartDialog
        open={showAddNewPartDialog}
        onOpenChange={setShowAddNewPartDialog}
        onPartAdded={(part) => {
          setSelectedParts([...selectedParts, part]);
        }}
      />
    </Dialog>
  );
};