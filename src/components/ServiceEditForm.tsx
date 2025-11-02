import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, User, Wrench, Euro, Clock, Calendar, Package, Plus, Minus, Printer, FileText, Play, Pause, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCustomers, useAddCustomer } from "@/hooks/useCustomers";
import { useDevices } from "@/hooks/useDevices";
import { useUpdateService } from "@/hooks/useServices";
import { useServiceStatuses } from "@/hooks/useServiceStatuses";
import { usePricingSettings, useFixedPriceSettings, useHourlyRateSettings } from "@/hooks/usePricingSettings";
import { useWarrantySettings } from "@/hooks/useWarrantySettings";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useInventorySettings, useAvailableInventoryParts, useServiceParts, useAddServicePart } from "@/hooks/useInventory";
import { useManufacturers } from "@/hooks/useManufacturers";
import { useServiceTimer } from "@/hooks/useServiceTimer";
import { useCurrentUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/contexts/AuthContext";
import { hasRole } from "@/lib/roleUtils";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { AddNewPartDialog } from "@/components/AddNewPartDialog";

interface ServiceEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: any;
}

export const ServiceEditForm = ({ open, onOpenChange, service }: ServiceEditFormProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [description, setDescription] = useState("");
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [deviceSerial, setDeviceSerial] = useState("");
  const [customManufacturer, setCustomManufacturer] = useState("");
  const [pricingType, setPricingType] = useState<"tuntiveloitus" | "kertamaksu">("tuntiveloitus");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [fixedPrice, setFixedPrice] = useState<string>("");
  const [selectedFixedPriceName, setSelectedFixedPriceName] = useState<string>("");
  const [selectedHourlyRateName, setSelectedHourlyRateName] = useState<string>("");
  const [workWarranty, setWorkWarranty] = useState<string>("");
  const [partsWarranty, setPartsWarranty] = useState<string>("");
  const [selectedWarrantySettingId, setSelectedWarrantySettingId] = useState<string>("");

  // Uudet kentät
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState<string>("");
  const [technicianNotes, setTechnicianNotes] = useState<string>("");
  
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

  const { data: customers, isLoading: customersLoading } = useCustomers();
  const { data: devices, isLoading: devicesLoading } = useDevices();
  const { data: statusesData } = useServiceStatuses();
  const { data: technicians, isLoading: techniciansLoading } = useTechnicians();
  const { data: inventorySettings } = useInventorySettings();
  const { data: availableParts } = useAvailableInventoryParts();
  const { data: serviceParts } = useServiceParts(service?.id);
  const { data: manufacturers, isLoading: manufacturersLoading } = useManufacturers();
  const { data: fixedPriceSettings } = useFixedPriceSettings();
  const { data: hourlyRateSettings } = useHourlyRateSettings();
  const { data: warrantySettings } = useWarrantySettings();
  const updateServiceMutation = useUpdateService();
  const addServicePartMutation = useAddServicePart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: currentUserRoles } = useCurrentUserRoles();
  const { session } = useAuth();

  // Service timer
  const { 
    minutes: timerMinutes,
    seconds: timerSeconds,
    isActive: isTimerActive, 
    startTimer, 
    stopTimer, 
    resetTimer, 
    formatTime 
  } = useServiceTimer(
    service?.id || "", 
    service?.tyoaika_minuutit || 0, 
    service?.ajanlaskuri_kaynnissa || false
  );

  // Initialize form with service data
  useEffect(() => {
    if (service && open) {
      
      // Set customer ID - try multiple paths for customer ID
      const customerId = service.asiakkaat?.id || service.asiakas_id || "";
      setSelectedCustomerId(customerId);
      
      // Set device ID  
      const deviceId = service.laitteet?.id || service.laite_id || "";
      setSelectedDeviceId(deviceId);
      
      setSelectedStatus(getDisplayStatusValue(service.status) || "");
      setDescription(service.kuvaus || "");
      setDeviceBrand(service.merkki || "");
      setDeviceModel(service.malli || "");
      setDeviceSerial(service.sarjanumero || "");
      setPricingType(service.hinnoittelu_tyyppi || "tuntiveloitus");
      setHourlyRate(service.tuntihinta?.toString() || "");
      setFixedPrice(service.kiintea_hinta?.toString() || "");
      setSelectedFixedPriceName(service.hinnoittelu_nimi || "");
      setSelectedHourlyRateName(service.hinnoittelu_nimi || "");
      setWorkWarranty(service.tyotakuu_kuukautta?.toString() || "");
      setPartsWarranty(service.osatakuu_kuukautta?.toString() || "");

      // Set new fields
      setSelectedTechnicianId(service.teknikko_id || "");
      setEstimatedCompletionDate(service.arvioitu_valmistumispvm || "");
      setTechnicianNotes(service.teknikon_muistiinpanot || "");
      
      // Load service parts
      if (serviceParts && serviceParts.length > 0) {
        const parts = serviceParts.map((sp: any) => {
          return {
            id: sp.id,
            varaosa_id: sp.varaosa_id,
            nimi: sp.varaosat?.nimi || "",
            maara: sp.maara,
            yksikkohinta: sp.yksikkohinta
          };
        });
        setSelectedParts(parts);
      } else {
        setSelectedParts([]);
      }
    }
  }, [service, open, serviceParts]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedCustomerId("");
      setSelectedDeviceId("");
      setSelectedStatus("");
      setDescription("");
      setDeviceBrand("");
      setDeviceModel("");
      setDeviceSerial("");
      setSelectedParts([]);
      setCurrentPartSelection("");
    }
  }, [open]);

  const selectedCustomer = customers?.find(c => c.id === selectedCustomerId);
  
  // Suodata laitteet asiakkaan mukaan, mutta sisällytä aina huollon nykyinen laite
  const customerDevices = (() => {
    if (!devices) return [];
    
    const filtered = devices.filter(device => device.asiakas_id === selectedCustomerId);
    
    // Lisää huollon nykyinen laite listaan, jos sitä ei jo ole
    if (service?.laite_id) {
      const currentDevice = devices.find(d => d.id === service.laite_id);
      if (currentDevice && !filtered.find(d => d.id === currentDevice.id)) {
        filtered.unshift(currentDevice); // Lisää listan alkuun
      }
    }
    
    return filtered;
  })();

  // Handle warranty setting selection
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

  // Convert display status to database format
  const getDbStatusValue = (displayStatus: string) => {
    switch (displayStatus) {
      case 'Odottaa': return 'odottaa';
      case 'Työn alla': return 'työn alla';
      case 'Valmis': return 'valmis';
      case 'Luovutettu': return 'luovutettu';
      default: return displayStatus.toLowerCase();
    }
  };

  // Convert database status to display format
  const getDisplayStatusValue = (dbStatus: string) => {
    switch (dbStatus) {
      case 'odottaa': return 'Odottaa';
      case 'työn alla': return 'Työn alla';
      case 'valmis': return 'Valmis';
      case 'luovutettu': return 'Luovutettu';
      default: return dbStatus;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Virhe",
        description: "Huollon kuvaus on pakollinen",
      });
      return;
    }

    // Validate that selectedStatus is a valid status
    if (selectedStatus && !statusesData?.find(s => s.name === selectedStatus)) {
      toast({
        variant: "destructive",
        title: "Virhe",
        description: "Valitse kelvollinen status",
      });
      return;
    }

    try {
      // Linkitä laite asiakkaaseen automaattisesti jos tarpeen
      if (selectedDeviceId && selectedCustomerId) {
        const selectedDevice = devices?.find(d => d.id === selectedDeviceId);
        
        if (selectedDevice && selectedDevice.asiakas_id !== selectedCustomerId) {
          const { error: deviceUpdateError } = await supabase
            .from("laitteet")
            .update({ asiakas_id: selectedCustomerId })
            .eq("id", selectedDeviceId);
            
          if (deviceUpdateError) {
            console.error("Virhe päivitettäessä laitteen asiakasta:", deviceUpdateError);
          }
        }
      }

      const updates: any = {
        asiakas_id: selectedCustomerId || null,
        laite_id: selectedDeviceId || null,
        kuvaus: description.trim(),
        status: getDbStatusValue(selectedStatus) || 'odottaa', // Convert display status to DB format
        hinnoittelu_tyyppi: pricingType,
        hinnoittelu_nimi: pricingType === "tuntiveloitus" ? (selectedHourlyRateName || null) : (selectedFixedPriceName || null),
        tyotakuu_kuukautta: workWarranty ? parseInt(workWarranty) : null,
        osatakuu_kuukautta: partsWarranty ? parseInt(partsWarranty) : null,
        teknikko_id: selectedTechnicianId || null,
        arvioitu_valmistumispvm: estimatedCompletionDate || null,
        teknikon_muistiinpanot: technicianNotes.trim() || null,
      };

      // Add pricing information
      if (pricingType === 'tuntiveloitus') {
        updates.tuntihinta = hourlyRate ? parseFloat(hourlyRate) : null;
        updates.kiintea_hinta = null;
      } else {
        updates.kiintea_hinta = fixedPrice ? parseFloat(fixedPrice) : null;
        updates.tuntihinta = null;
      }

      // Only update device info if no existing device selected
      if (!selectedDeviceId) {
        const finalBrand = deviceBrand === "__custom__" ? customManufacturer.trim() : deviceBrand.trim();
        updates.merkki = finalBrand || null;
        updates.malli = deviceModel.trim() || null;
        updates.sarjanumero = deviceSerial.trim() || null;
      }

      // Add timestamps for status changes
      const currentStatus = service.status;
      const newDbStatus = getDbStatusValue(selectedStatus);
      if (newDbStatus !== currentStatus) {
        if (selectedStatus === 'Valmis' && currentStatus !== 'valmis') {
          updates.valmistunut_pvm = new Date().toISOString();
          
          // Lähetä automaattinen huolto valmis -ilmoitus
          try {
            const { data: notificationSettings } = await supabase
              .from('ilmoitus_asetukset')
              .select('*')
              .limit(1)
              .maybeSingle();
            
            if (notificationSettings?.huolto_valmis_kaytossa && selectedCustomer?.email) {
              const { error: emailError } = await supabase.functions.invoke('send-service-ready-email', {
                body: { serviceId: service.id }
              });
              
              if (!emailError) {
                toast({
                  title: "Ilmoitus lähetetty",
                  description: `Huolto valmis -ilmoitus lähetetty osoitteeseen ${selectedCustomer.email}`,
                });
              }
            }
          } catch (error) {
            console.error('Ilmoituksen lähetys epäonnistui:', error);
            // Ei estetä tallennusta vaikka ilmoitus epäonnistuisi
          }
        } else if (selectedStatus === 'Luovutettu' && currentStatus !== 'luovutettu') {
          updates.luovutettu_pvm = new Date().toISOString();
        }
      }

      await updateServiceMutation.mutateAsync({
        id: service.id,
        updates
      });

      // Tallenna varaosat jos niitä on valittu
      if (selectedParts.length > 0) {
        // Poista vanhat varaosat ensin
        const { error: deleteError } = await supabase
          .from('huolto_varaosat')
          .delete()
          .eq('huolto_id', service.id);
        
        if (deleteError) {
          console.error("Error deleting old parts:", deleteError);
        }

        // Tallenna uudet varaosat
        for (const part of selectedParts) {
          await addServicePartMutation.mutateAsync({
            huolto_id: service.id,
            varaosa_id: part.varaosa_id,
            maara: part.maara,
            yksikkohinta: part.yksikkohinta
          });
        }
      }

      toast({
        title: "Tallennettu onnistuneesti",
        description: "Huoltotyön tiedot on päivitetty.",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating service:", error);
      
      const errorMessage = error?.message || 'Tuntematon virhe';
      const errorCode = error?.code || '';
      const errorDetails = error?.details || '';
      
      let displayMessage = errorMessage;
      if (errorCode) {
        displayMessage += ` (Koodi: ${errorCode})`;
      }
      if (errorDetails) {
        displayMessage += ` - ${errorDetails}`;
      }
      
      toast({
        variant: "destructive",
        title: "Virhe tallennuksessa",
        description: displayMessage,
      });
    }
  };

  if (!service) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle>Muokkaa huoltotyötä</DialogTitle>
                <DialogDescription>
                  Muokkaa huoltotyön tietoja ja statusta
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service info header */}
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Huolto {service.numero || '#' + service.id.slice(0, 8)}</p>
                 <p className="text-sm text-muted-foreground flex items-center gap-2">
                   <Calendar className="h-3 w-3" />
                   Luotu {(() => {
                     try {
                       if (service.created_at) {
                         const date = new Date(service.created_at);
                         if (!isNaN(date.getTime())) {
                           return format(date, "dd.MM.yyyy 'klo' HH:mm", { locale: fi });
                         }
                       }
                       return 'Tuntematon päivä';
                     } catch (error) {
                       return 'Tuntematon päivä';
                     }
                   })()}
                 </p>
              </div>
              {statusesData && (
                <Badge 
                  style={{ 
                    backgroundColor: statusesData.find(s => 
                      s.name.toLowerCase().trim() === service.status.toLowerCase().trim()
                    )?.color || '#6b7280',
                    color: '#ffffff' 
                  }}
                  className="border-0"
                >
                  {statusesData.find(s => 
                    s.name.toLowerCase().trim() === service.status.toLowerCase().trim()
                  )?.name || service.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Status selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Valitse status" />
              </SelectTrigger>
              <SelectContent>
                {statusesData?.map((status) => (
                  <SelectItem key={status.id} value={status.name}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      />
                      {status.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer selection */}
          <div className="space-y-2">
            <Label htmlFor="customer">Asiakas</Label>
            {customersLoading ? (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Ladataan asiakkaita...</span>
              </div>
            ) : (
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Valitse asiakas" />
              </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.nimi}
                      {customer.email && (
                        <span className="text-xs text-muted-foreground ml-2">({customer.email})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Device selection */}
          {selectedCustomerId && (
            <div className="space-y-2">
              <Label>Laite</Label>
              {devicesLoading ? (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Ladataan laitteita...</span>
                </div>
              ) : customerDevices.length > 0 ? (
                <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Valitse laite tai jätä tyhjäksi muokataksesi laitteen tietoja" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerDevices.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.merkki} {device.malli}
                        {device.sarjanumero && (
                          <span className="text-xs text-muted-foreground ml-2">({device.sarjanumero})</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>
          )}

          {/* Device details (when no existing device selected or for new devices) */}
          {selectedCustomerId && !selectedDeviceId && (
            <div className="space-y-4 border-t pt-4">
              <Label className="text-sm font-medium">Laitteen tiedot</Label>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-xs">Malli</Label>
                  <Input
                    id="model"
                    placeholder="esim. iPhone 12 Pro Max"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
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
                  <div className="space-y-2">
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
              
              <div className="space-y-2">
                <Label htmlFor="serial" className="text-xs">Sarjanumero (valinnainen)</Label>
                <Input
                  id="serial"
                  placeholder="esim. ABC123456"
                  value={deviceSerial}
                  onChange={(e) => setDeviceSerial(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Service description */}
          <div className="space-y-2">
            <Label htmlFor="description">Huollon kuvaus</Label>
            <Textarea
              id="description"
              placeholder="Kuvaile mitä vikaa laitteessa on tai mitä huoltotoimenpiteitä tarvitaan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Pricing section */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-sm font-medium">Hinnoittelu</Label>
            
            <RadioGroup value={pricingType} onValueChange={(value: "tuntiveloitus" | "kertamaksu") => setPricingType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tuntiveloitus" id="hourly" />
                <Label htmlFor="hourly" className="text-sm">Tuntiveloitus</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kertamaksu" id="fixed" />
                <Label htmlFor="fixed" className="text-sm">Kertamaksu</Label>
              </div>
            </RadioGroup>

            {pricingType === "tuntiveloitus" ? (
              <div className="space-y-3">
                {/* Valmiin hinnoittelun valinta */}
                <div className="space-y-1">
                  <Label htmlFor="hourlyRateSelect" className="text-xs">Valitse hinnoittelu</Label>
                  <Select
                    value={hourlyRate && hourlyRateSettings?.find(s => s.oletustuntihinta === parseFloat(hourlyRate))?.id || "custom"}
                    onValueChange={(value) => {
                      if (value !== "custom") {
                        const selectedSetting = hourlyRateSettings?.find(s => s.id === value);
                        if (selectedSetting && selectedSetting.oletustuntihinta) {
                          setHourlyRate(selectedSetting.oletustuntihinta.toString());
                          setSelectedHourlyRateName(selectedSetting.nimi);
                        }
                      } else {
                        setSelectedHourlyRateName("");
                      }
                    }}
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
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate" className="text-xs">Tuntihinta (€/h)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    placeholder="esim. 65.00"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Valmiin hinnoittelun valinta */}
                <div className="space-y-1">
                  <Label htmlFor="fixedPriceSelect" className="text-xs">Valitse palvelu</Label>
                  <Select
                    value={fixedPrice && fixedPriceSettings?.find(s => s.kiintea_hinta === parseFloat(fixedPrice))?.id || "custom"}
                    onValueChange={(value) => {
                      if (value !== "custom") {
                        const selectedSetting = fixedPriceSettings?.find(s => s.id === value);
                        if (selectedSetting && selectedSetting.kiintea_hinta) {
                          setFixedPrice(selectedSetting.kiintea_hinta.toString());
                          setSelectedFixedPriceName(selectedSetting.nimi);
                        }
                      } else {
                        setSelectedFixedPriceName("");
                      }
                    }}
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
                  <Label htmlFor="fixedPrice" className="text-xs">Kiinteä hinta (€)</Label>
                  <Input
                    id="fixedPrice"
                    type="number"
                    step="0.01"
                    placeholder="esim. 120.00"
                    value={fixedPrice}
                    onChange={(e) => setFixedPrice(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Työajan seuranta - näkyy vain tuntiveloituksessa */}
          {pricingType === "tuntiveloitus" && (
            <div className="space-y-4 border-t pt-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Työajan seuranta
              </Label>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-muted rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Työaika</p>
                  <p className="text-xl font-bold font-mono">
                    {formatTime()}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {!isTimerActive ? (
                    <Button 
                      type="button"
                      onClick={startTimer}
                      size="sm"
                      className="gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Aloita
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={() => {
                        stopTimer();
                        toast({
                          title: "Työaika tallennettu",
                          description: `Työaika: ${formatTime()}`,
                        });
                      }}
                      size="sm"
                      variant="secondary"
                      className="gap-2"
                    >
                      <Pause className="h-4 w-4" />
                      Pysäytä
                    </Button>
                  )}
                  
                  <Button 
                    type="button"
                    onClick={resetTimer}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    disabled={isTimerActive}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Nollaa
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Warranty section */}
          <div className="space-y-4 border-t pt-4">
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
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="workWarranty" className="text-xs">Työtakuu (kuukaudet)</Label>
                  <Input
                    id="workWarranty"
                    type="number"
                    min="0"
                    placeholder="esim. 12"
                    value={workWarranty}
                    onChange={(e) => {
                      setWorkWarranty(e.target.value);
                      // Clear warranty setting selection if user edits manually
                      if (selectedWarrantySettingId && e.target.value !== warrantySettings?.find(w => w.id === selectedWarrantySettingId)?.oletustyotakuu_kuukautta?.toString()) {
                        setSelectedWarrantySettingId("none");
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partsWarranty" className="text-xs">Osatakuu (kuukaudet)</Label>
                  <Input
                    id="partsWarranty"
                    type="number"
                    min="0"
                    placeholder="esim. 24"
                    value={partsWarranty}
                    onChange={(e) => {
                      setPartsWarranty(e.target.value);
                      // Clear warranty setting selection if user edits manually
                      if (selectedWarrantySettingId && e.target.value !== warrantySettings?.find(w => w.id === selectedWarrantySettingId)?.oletusosatakuu_kuukautta?.toString()) {
                        setSelectedWarrantySettingId("none");
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Teknikko ja arviointipäivä kentät */}
          <div className="space-y-4 border-t pt-4">
            {/* Teknikko */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Teknikko
              </Label>
              {hasRole(currentUserRoles, 'teknikko') ? (
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
                        {technician.nimi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Arviointipäivä */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Arvioitu valmistumispäivä
              </Label>
              <Input
                type="date"
                value={estimatedCompletionDate}
                onChange={(e) => setEstimatedCompletionDate(e.target.value)}
              />
            </div>

            {/* Teknikon muistiinpanot (näkyy vain valmiissa töissä) */}
            {selectedStatus === 'Valmis' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Teknikon muistiinpanot</Label>
                <Textarea
                  placeholder="Kuvaile tehdyt toimenpiteet..."
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Varaosat - näkyy vain jos varasto on käytössä */}
          {inventorySettings?.varasto_kaytossa && (
            <div className="space-y-3 border-t pt-4">
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
                      const updatedParts = selectedParts.map(p => 
                        p.varaosa_id === part.id ? { ...p, maara: p.maara + 1 } : p
                      );
                      setSelectedParts(updatedParts);
                    } else {
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

          {/* Buttons */}
          <div className="flex gap-3 pt-4 print-hide">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Peruuta
            </Button>
            <Button 
              type="submit" 
              disabled={!description.trim() || updateServiceMutation.isPending}
              className="flex-1"
            >
              {updateServiceMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Tallenna muutokset
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    
    {/* Lisää uusi varaosa dialogi */}
    <AddNewPartDialog
      open={showAddNewPartDialog}
      onOpenChange={setShowAddNewPartDialog}
      onPartAdded={(part) => {
        setSelectedParts([...selectedParts, part]);
      }}
    />
    </>
  );
};