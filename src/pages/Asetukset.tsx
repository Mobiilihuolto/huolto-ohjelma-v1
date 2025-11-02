import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Settings2,
  Palette,
  Euro,
  Shield,
  Star,
  Users,
  GripVertical,
  Loader2,
  Download,
  Upload,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServiceStatuses, useAddServiceStatus, useUpdateServiceStatus, useDeleteServiceStatus, useSetDefaultStatus } from "@/hooks/useServiceStatuses";
import { usePricingSettings, useAddPricingSetting, useUpdatePricingSetting, useDeletePricingSetting } from "@/hooks/usePricingSettings";
import { useWarrantySettings, useAddWarrantySetting, useUpdateWarrantySetting, useDeleteWarrantySetting } from "@/hooks/useWarrantySettings";
import { useNumberingSettings, useUpdateNumberingSettings } from "@/hooks/useNumberingSettings";
import { useTechnicians, useAddTechnician, useUpdateTechnician, useDeleteTechnician } from "@/hooks/useTechnicians";
import { useAlvSettings, useAddAlvSetting, useUpdateAlvSetting, useDeleteAlvSetting, useSetDefaultAlvSetting } from "@/hooks/useAlvSettings";
import { useInvoiceSettings, useAddInvoiceSetting, useUpdateInvoiceSetting, useDeleteInvoiceSetting } from "@/hooks/useInvoiceSettings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WarrantyForm } from "@/components/WarrantyForm";
import { InventorySettingsForm } from "@/components/InventorySettingsForm";
import { PaymentMethodsSettingsForm } from "@/components/PaymentMethodsSettingsForm";
import { CompanySettingsForm } from "@/components/CompanySettingsForm";
import { ManufacturersSettingsForm } from "@/components/ManufacturersSettingsForm";
import { NotificationSettingsForm } from "@/components/NotificationSettingsForm";
import { UserManagementForm } from "@/components/UserManagementForm";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Asetukset = () => {
  const { canManageSettings, canManageUsers, isLoading: permissionsLoading } = useUserPermissions();
  
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#6b7280");
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  
  // Pricing settings state
  const [newPricingName, setNewPricingName] = useState("");
  const [newPricingType, setNewPricingType] = useState("kertamaksu");
  const [newPricingPrice, setNewPricingPrice] = useState("");
  const [newPricingIncludesVat, setNewPricingIncludesVat] = useState(true);
  const [newPricingUnit, setNewPricingUnit] = useState("");
  const [editingPricing, setEditingPricing] = useState<string | null>(null);
  const [editPricingName, setEditPricingName] = useState("");
  const [editPricingType, setEditPricingType] = useState("");
  const [editPricingPrice, setEditPricingPrice] = useState("");
  const [editPricingIncludesVat, setEditPricingIncludesVat] = useState(true);
  const [editPricingUnit, setEditPricingUnit] = useState("");
  
  // Warranty settings state
  const [showWarrantyForm, setShowWarrantyForm] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<any>(null);
  
  // Technician settings state
  const [newTechnicianName, setNewTechnicianName] = useState("");
  const [editingTechnician, setEditingTechnician] = useState<string | null>(null);
  const [editTechnicianName, setEditTechnicianName] = useState("");

  // ALV settings state
  const [newAlvName, setNewAlvName] = useState("");
  const [newAlvRate, setNewAlvRate] = useState("");
  const [editingAlv, setEditingAlv] = useState<string | null>(null);
  const [editAlvName, setEditAlvName] = useState("");
  const [editAlvRate, setEditAlvRate] = useState("");

  // Invoice settings state
  const [newInvoiceName, setNewInvoiceName] = useState("");
  const [newInvoicePaymentTerm, setNewInvoicePaymentTerm] = useState("");
  const [newInvoiceLateFee, setNewInvoiceLateFee] = useState("");
  const [editingInvoice, setEditingInvoice] = useState<string | null>(null);
  const [editInvoiceName, setEditInvoiceName] = useState("");
  const [editInvoicePaymentTerm, setEditInvoicePaymentTerm] = useState("");
  const [editInvoiceLateFee, setEditInvoiceLateFee] = useState("");

  // Backup state
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [clearDataLoading, setClearDataLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: statuses, isLoading } = useServiceStatuses();
  const addStatus = useAddServiceStatus();
  const updateStatus = useUpdateServiceStatus();
  const deleteStatus = useDeleteServiceStatus();
  const setDefaultStatus = useSetDefaultStatus();
  
  // Pricing settings hooks
  const { data: pricingSettings, isLoading: pricingLoading } = usePricingSettings();
  const addPricingSetting = useAddPricingSetting();
  const updatePricingSetting = useUpdatePricingSetting();
  const deletePricingSetting = useDeletePricingSetting();
  
  // Warranty settings hooks
  const { data: warrantySettings, isLoading: warrantyLoading } = useWarrantySettings();
  const addWarrantySetting = useAddWarrantySetting();
  const updateWarrantySetting = useUpdateWarrantySetting();
  const deleteWarrantySetting = useDeleteWarrantySetting();
  
  // Numbering settings hooks
  const { data: numberingSettings, isLoading: numberingLoading } = useNumberingSettings();
  const updateNumberingSettings = useUpdateNumberingSettings();

  // Technician settings hooks
  const { data: technicians, isLoading: techniciansLoading } = useTechnicians();
  const addTechnician = useAddTechnician();
  const updateTechnician = useUpdateTechnician();
  const deleteTechnician = useDeleteTechnician();

  // ALV settings hooks
  const { data: alvSettings, isLoading: alvLoading } = useAlvSettings();
  const addAlvSetting = useAddAlvSetting();
  const updateAlvSetting = useUpdateAlvSetting();
  const deleteAlvSetting = useDeleteAlvSetting();
  const setDefaultAlvSetting = useSetDefaultAlvSetting();

  // Invoice settings hooks
  const { data: invoiceSettings, isLoading: invoiceLoading } = useInvoiceSettings();
  const addInvoiceSetting = useAddInvoiceSetting();
  const updateInvoiceSetting = useUpdateInvoiceSetting();
  const deleteInvoiceSetting = useDeleteInvoiceSetting();

  const handleAddStatus = () => {
    if (!newStatusName.trim()) return;
    
    const maxOrder = Math.max(...(statuses?.map(s => s.order_index) || [0]));
    
    addStatus.mutate({
      name: newStatusName.trim(),
      color: newStatusColor,
      order_index: maxOrder + 1,
      is_default: false,
      is_active: true
    });
    
    setNewStatusName("");
    setNewStatusColor("#6b7280");
  };

  const handleEditStatus = (status: any) => {
    setEditingStatus(status.id);
    setEditName(status.name);
    setEditColor(status.color);
  };

  const handleSaveEdit = () => {
    if (!editingStatus || !editName.trim()) return;
    
    updateStatus.mutate({
      id: editingStatus,
      updates: {
        name: editName.trim(),
        color: editColor
      }
    });
    
    setEditingStatus(null);
    setEditName("");
    setEditColor("");
  };

  const handleCancelEdit = () => {
    setEditingStatus(null);
    setEditName("");
    setEditColor("");
  };

  const handleDeleteStatus = (id: string) => {
    if (confirm("Oletko varma että haluat poistaa tämän statuksen?")) {
      deleteStatus.mutate(id);
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultStatus.mutate(id);
  };

  // Pricing settings handlers
  const handleAddPricing = () => {
    if (!newPricingName.trim() || !newPricingPrice.trim()) return;
    
    // Determine default unit if not specified
    let defaultUnit = newPricingUnit.trim();
    if (!defaultUnit) {
      defaultUnit = newPricingType === "tuntiveloitus" ? "H" : "Työ";
    }
    
    const settingData = {
      nimi: newPricingName.trim(),
      hinnoittelu_tyyppi: newPricingType,
      sisaltaa_alv: newPricingIncludesVat,
      yksikko: defaultUnit,
      is_active: true,
      ...(newPricingType === "tuntiveloitus" 
        ? { oletustuntihinta: parseFloat(newPricingPrice) } 
        : { kiintea_hinta: parseFloat(newPricingPrice) }
      )
    };
    
    addPricingSetting.mutate(settingData);
    
    setNewPricingName("");
    setNewPricingType("kertamaksu");
    setNewPricingPrice("");
    setNewPricingIncludesVat(true);
    setNewPricingUnit("");
  };

  const handleEditPricing = (pricing: any) => {
    setEditingPricing(pricing.id);
    setEditPricingName(pricing.nimi);
    setEditPricingType(pricing.hinnoittelu_tyyppi || "kertamaksu");
    setEditPricingIncludesVat(pricing.sisaltaa_alv ?? true);
    setEditPricingUnit(pricing.yksikko || "");
    const price = pricing.hinnoittelu_tyyppi === "tuntiveloitus" 
      ? pricing.oletustuntihinta 
      : pricing.kiintea_hinta;
    setEditPricingPrice(price?.toString() || "");
  };

  const handleSavePricingEdit = () => {
    if (!editingPricing || !editPricingName.trim() || !editPricingPrice.trim()) return;
    
    // Determine default unit if not specified
    let defaultUnit = editPricingUnit.trim();
    if (!defaultUnit) {
      defaultUnit = editPricingType === "tuntiveloitus" ? "H" : "Työ";
    }
    
    const updates = {
      nimi: editPricingName.trim(),
      hinnoittelu_tyyppi: editPricingType,
      sisaltaa_alv: editPricingIncludesVat,
      yksikko: defaultUnit,
      ...(editPricingType === "tuntiveloitus" 
        ? { oletustuntihinta: parseFloat(editPricingPrice), kiintea_hinta: null } 
        : { kiintea_hinta: parseFloat(editPricingPrice), oletustuntihinta: null }
      )
    };
    
    updatePricingSetting.mutate({
      id: editingPricing,
      updates
    });
    
    setEditingPricing(null);
    setEditPricingName("");
    setEditPricingType("");
    setEditPricingPrice("");
    setEditPricingIncludesVat(true);
    setEditPricingUnit("");
  };

  const handleCancelPricingEdit = () => {
    setEditingPricing(null);
    setEditPricingName("");
    setEditPricingType("");
    setEditPricingPrice("");
    setEditPricingIncludesVat(true);
    setEditPricingUnit("");
  };

  const handleDeletePricing = (id: string) => {
    if (confirm("Oletko varma että haluat poistaa tämän hinnoitteluasetuksen?")) {
      deletePricingSetting.mutate(id);
    }
  };

  // Warranty settings handlers
  const handleShowWarrantyForm = () => {
    setShowWarrantyForm(true);
    setEditingWarranty(null);
  };

  const handleHideWarrantyForm = () => {
    setShowWarrantyForm(false);
    setEditingWarranty(null);
  };

  const handleEditWarranty = (warranty: any) => {
    setEditingWarranty(warranty);
    setShowWarrantyForm(true);
  };

  const handleDeleteWarranty = (id: string) => {
    if (confirm("Oletko varma että haluat poistaa tämän takuuasetuksen?")) {
      deleteWarrantySetting.mutate(id);
    }
  };

  // Technician settings handlers
  const handleAddTechnician = () => {
    if (!newTechnicianName.trim()) return;
    
    addTechnician.mutate({
      nimi: newTechnicianName.trim()
    });
    
    setNewTechnicianName("");
  };

  const handleEditTechnician = (technician: any) => {
    setEditingTechnician(technician.id);
    setEditTechnicianName(technician.nimi);
  };

  const handleSaveTechnicianEdit = () => {
    if (!editingTechnician || !editTechnicianName.trim()) return;
    
    updateTechnician.mutate({
      id: editingTechnician,
      updates: {
        nimi: editTechnicianName.trim()
      }
    });
    
    setEditingTechnician(null);
    setEditTechnicianName("");
  };

  const handleCancelTechnicianEdit = () => {
    setEditingTechnician(null);
    setEditTechnicianName("");
  };

  const handleDeleteTechnician = (id: string) => {
    if (confirm("Oletko varma että haluat poistaa tämän teknikon?")) {
      deleteTechnician.mutate(id);
    }
  };

  // ALV settings handlers
  const handleAddAlv = () => {
    if (!newAlvName.trim() || !newAlvRate.trim()) return;
    
    const rate = parseFloat(newAlvRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({
        title: "Virhe",
        description: "Anna kelvollinen ALV-prosentti (0-100).",
        variant: "destructive",
      });
      return;
    }
    
    addAlvSetting.mutate({
      nimi: newAlvName.trim(),
      alv_prosentti: rate,
      is_default: alvSettings?.length === 0 // Set as default if it's the first one
    });
    
    setNewAlvName("");
    setNewAlvRate("");
  };

  const handleEditAlv = (alv: any) => {
    setEditingAlv(alv.id);
    setEditAlvName(alv.nimi);
    setEditAlvRate(alv.alv_prosentti?.toString() || "");
  };

  const handleSaveAlvEdit = () => {
    if (!editingAlv || !editAlvName.trim() || !editAlvRate.trim()) return;
    
    const rate = parseFloat(editAlvRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({
        title: "Virhe",
        description: "Anna kelvollinen ALV-prosentti (0-100).",
        variant: "destructive",
      });
      return;
    }
    
    updateAlvSetting.mutate({
      id: editingAlv,
      updates: {
        nimi: editAlvName.trim(),
        alv_prosentti: rate
      }
    });
    
    setEditingAlv(null);
    setEditAlvName("");
    setEditAlvRate("");
  };

  const handleCancelAlvEdit = () => {
    setEditingAlv(null);
    setEditAlvName("");
    setEditAlvRate("");
  };

  const handleDeleteAlv = (id: string) => {
    if (confirm("Oletko varma että haluat poistaa tämän ALV-asetuksen?")) {
      deleteAlvSetting.mutate(id);
    }
  };

  const handleSetDefaultAlv = (id: string) => {
    setDefaultAlvSetting.mutate(id);
  };

  // Invoice settings handlers
  const handleAddInvoice = () => {
    if (!newInvoiceName.trim() || !newInvoicePaymentTerm.trim() || !newInvoiceLateFee.trim()) return;
    
    const paymentTerm = parseInt(newInvoicePaymentTerm);
    const lateFee = parseFloat(newInvoiceLateFee);
    
    if (isNaN(paymentTerm) || paymentTerm < 1) {
      toast({
        title: "Virhe",
        description: "Anna kelvollinen maksuaika (vähintään 1 päivä).",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(lateFee) || lateFee < 0) {
      toast({
        title: "Virhe",
        description: "Anna kelvollinen viivästysmaksu (vähintään 0€).",
        variant: "destructive",
      });
      return;
    }
    
    addInvoiceSetting.mutate({
      nimi: newInvoiceName.trim(),
      oletusmaksuehto_paivat: paymentTerm,
      oletusviivastyskulut: lateFee,
      is_active: true
    });
    
    setNewInvoiceName("");
    setNewInvoicePaymentTerm("");
    setNewInvoiceLateFee("");
  };

  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice(invoice.id);
    setEditInvoiceName(invoice.nimi);
    setEditInvoicePaymentTerm(invoice.oletusmaksuehto_paivat?.toString() || "");
    setEditInvoiceLateFee(invoice.oletusviivastyskulut?.toString() || "");
  };

  const handleSaveInvoiceEdit = () => {
    if (!editingInvoice || !editInvoiceName.trim() || !editInvoicePaymentTerm.trim() || !editInvoiceLateFee.trim()) return;
    
    const paymentTerm = parseInt(editInvoicePaymentTerm);
    const lateFee = parseFloat(editInvoiceLateFee);
    
    if (isNaN(paymentTerm) || paymentTerm < 1) {
      toast({
        title: "Virhe",
        description: "Anna kelvollinen maksuaika (vähintään 1 päivä).",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(lateFee) || lateFee < 0) {
      toast({
        title: "Virhe",
        description: "Anna kelvollinen viivästysmaksu (vähintään 0€).",
        variant: "destructive",
      });
      return;
    }
    
    updateInvoiceSetting.mutate({
      id: editingInvoice,
      updates: {
        nimi: editInvoiceName.trim(),
        oletusmaksuehto_paivat: paymentTerm,
        oletusviivastyskulut: lateFee
      }
    });
    
    setEditingInvoice(null);
    setEditInvoiceName("");
    setEditInvoicePaymentTerm("");
    setEditInvoiceLateFee("");
  };

  const handleCancelInvoiceEdit = () => {
    setEditingInvoice(null);
    setEditInvoiceName("");
    setEditInvoicePaymentTerm("");
    setEditInvoiceLateFee("");
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm("Oletko varma että haluat poistaa tämän laskuasetuksen?")) {
      deleteInvoiceSetting.mutate(id);
    }
  };

  const NumberingSettings = () => (
    <div className="space-y-4">
      {numberingSettings?.map((setting) => (
        <Card key={setting.id}>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {setting.tyyppi === 'asiakas' ? 'Asiakkaiden' : 'Huoltojen'} numerointi
                </Label>
                <div className="text-sm text-muted-foreground">
                  Esimerkki: {setting.prefiksi}{new Date().getFullYear()}-{String(setting.seuraava_numero).padStart(setting.numeron_pituus, '0')}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`prefix-${setting.id}`} className="text-xs">Prefiksi</Label>
                <Input
                  id={`prefix-${setting.id}`}
                  defaultValue={setting.prefiksi}
                  onBlur={(e) => {
                    if (e.target.value !== setting.prefiksi) {
                  updateNumberingSettings.mutate({
                        id: setting.id,
                        updates: { prefiksi: e.target.value }
                      });
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`year-${setting.id}`} className="text-xs">Vuosiformaatti</Label>
                <Select 
                  defaultValue={setting.vuosi_formaatti}
                  onValueChange={(value) => {
                    updateNumberingSettings.mutate({
                      id: setting.id,
                      updates: { vuosi_formaatti: value }
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY">YYYY (2025)</SelectItem>
                    <SelectItem value="YY">YY (25)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`length-${setting.id}`} className="text-xs">Numeron pituus</Label>
                <Input
                  id={`length-${setting.id}`}
                  type="number"
                  min="3"
                  max="8"
                  defaultValue={setting.numeron_pituus}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value);
                    if (value !== setting.numeron_pituus && value >= 3 && value <= 8) {
                      updateNumberingSettings.mutate({
                        id: setting.id,
                        updates: { numeron_pituus: value }
                      });
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Backup and restore functions
  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    try {
      // Fetch all data from important tables
      const [customers, services, devices, statuses, pricing, warranty, numbering, techniciansList] = await Promise.all([
        supabase.from('asiakkaat').select('*'),
        supabase.from('huollot').select('*'),
        supabase.from('laitteet').select('*'),
        supabase.from('service_statuses').select('*'),
        supabase.from('hinnoittelu_asetukset').select('*'),
        supabase.from('takuu_asetukset').select('*'),
        supabase.from('numerointi_asetukset').select('*'),
        supabase.from('tekniikat').select('*')
      ]);

      // Check for errors
      const errors = [customers, services, devices, statuses, pricing, warranty, numbering, techniciansList]
        .filter(result => result.error)
        .map(result => result.error);

      if (errors.length > 0) {
        throw new Error(`Virhe tietojen haussa: ${errors.map(e => e?.message).join(', ')}`);
      }

      // Create backup object
      const backup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: {
          asiakkaat: customers.data || [],
          huollot: services.data || [],
          laitteet: devices.data || [],
          service_statuses: statuses.data || [],
          hinnoittelu_asetukset: pricing.data || [],
          takuu_asetukset: warranty.data || [],
          numerointi_asetukset: numbering.data || [],
          tekniikat: techniciansList.data || []
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `huoltovarmuuskopio_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Varmuuskopio luotu",
        description: "Varmuuskopio on ladattu onnistuneesti."
      });
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Virhe",
        description: error instanceof Error ? error.message : "Varmuuskopion luominen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (file: File) => {
    setRestoreLoading(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      // Validate backup structure
      if (!backup.data || !backup.version) {
        throw new Error("Virheellinen varmuuskopio tiedosto");
      }

      const { data } = backup;

      // Delete existing data (in reverse order due to foreign keys)
      await Promise.all([
        supabase.from('huollot').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('laitteet').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('asiakkaat').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('service_statuses').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('hinnoittelu_asetukset').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('takuu_asetukset').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('numerointi_asetukset').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('tekniikat').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]);

      // Insert restored data
      const insertPromises = [];

      if (data.asiakkaat && data.asiakkaat.length > 0) {
        insertPromises.push(supabase.from('asiakkaat').insert(data.asiakkaat));
      }
      if (data.laitteet && data.laitteet.length > 0) {
        insertPromises.push(supabase.from('laitteet').insert(data.laitteet));
      }
      if (data.huollot && data.huollot.length > 0) {
        insertPromises.push(supabase.from('huollot').insert(data.huollot));
      }
      if (data.service_statuses && data.service_statuses.length > 0) {
        insertPromises.push(supabase.from('service_statuses').insert(data.service_statuses));
      }
      if (data.hinnoittelu_asetukset && data.hinnoittelu_asetukset.length > 0) {
        insertPromises.push(supabase.from('hinnoittelu_asetukset').insert(data.hinnoittelu_asetukset));
      }
      if (data.takuu_asetukset && data.takuu_asetukset.length > 0) {
        insertPromises.push(supabase.from('takuu_asetukset').insert(data.takuu_asetukset));
      }
      if (data.numerointi_asetukset && data.numerointi_asetukset.length > 0) {
        insertPromises.push(supabase.from('numerointi_asetukset').insert(data.numerointi_asetukset));
      }
      if (data.tekniikat && data.tekniikat.length > 0) {
        insertPromises.push(supabase.from('tekniikat').insert(data.tekniikat));
      }

      const results = await Promise.all(insertPromises);

      // Check for errors
      const insertErrors = results.filter(result => result.error);
      if (insertErrors.length > 0) {
        throw new Error(`Virhe tietojen palautuksessa: ${insertErrors.map(e => e.error?.message).join(', ')}`);
      }

      toast({
        title: "Palautus onnistui",
        description: "Varmuuskopio on palautettu onnistuneesti. Sivu päivittyy hetken kuluttua."
      });

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: "Virhe",
        description: error instanceof Error ? error.message : "Varmuuskopion palautus epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (confirmationText.toUpperCase() !== "TYHJENNÄ") {
      toast({
        title: "Virhe",
        description: "Kirjoita 'TYHJENNÄ' vahvistaaksesi toiminnon.",
        variant: "destructive",
      });
      return;
    }

    setClearDataLoading(true);
    try {
      // Delete data in correct order (foreign key dependencies)
      
      // 1. Delete huolto_varaosat (junction table)
      const { error: partError } = await supabase
        .from("huolto_varaosat")
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (partError) throw new Error(`Huoltovaraosien poisto epäonnistui: ${partError.message}`);

      // 2. Delete laskut (invoices)
      const { error: invoiceError } = await supabase
        .from("laskut")
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (invoiceError) throw new Error(`Laskujen poisto epäonnistui: ${invoiceError.message}`);

      // 3. Delete Huollot (services)
      const { error: serviceError } = await supabase
        .from("huollot")
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (serviceError) throw new Error(`Huoltojen poisto epäonnistui: ${serviceError.message}`);

      // 4. Delete Laitteet (devices)
      const { error: deviceError } = await supabase
        .from("laitteet")
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deviceError) throw new Error(`Laitteiden poisto epäonnistui: ${deviceError.message}`);

      // 5. Delete varaosat (parts)
      const { error: partsError } = await supabase
        .from("varaosat")
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (partsError) throw new Error(`Varaosien poisto epäonnistui: ${partsError.message}`);

      // 6. Delete asiakkaat (customers)
      const { error: customerError } = await supabase
        .from("asiakkaat")
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (customerError) throw new Error(`Asiakkaiden poisto epäonnistui: ${customerError.message}`);

      // 7. Reset numbering for customers, services, and invoices
      const { error: numberingError } = await supabase
        .from("numerointi_asetukset")
        .update({ 
          seuraava_numero: 1,
          updated_at: new Date().toISOString()
        })
        .in('tyyppi', ['asiakas', 'huolto', 'lasku']);
      
      if (numberingError) throw new Error(`Numeroinnin nollaus epäonnistui: ${numberingError.message}`);

      // Invalidate all relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-parts"] });
      queryClient.invalidateQueries({ queryKey: ["numbering-settings"] });
      
      toast({
        title: "Onnistui!",
        description: "Data tyhjennetty onnistuneesti! Numerointi palautettu alkuun. Voit nyt aloittaa testauksen puhtaalta pöydältä.",
      });

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Clear data error:', error);
      toast({
        title: "Virhe",
        description: error instanceof Error ? error.message : "Datan tyhjennys epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setClearDataLoading(false);
      setConfirmationText("");
    }
  };

  if (isLoading || pricingLoading || warrantyLoading || numberingLoading || techniciansLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Asetukset</h1>
        <p className="text-muted-foreground">Muokkaa järjestelmän asetuksia ja määrityksiä</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">Yrityksen tiedot</TabsTrigger>
          {canManageUsers && <TabsTrigger value="users">Käyttäjät</TabsTrigger>}
          {canManageSettings && <TabsTrigger value="status">Statukset</TabsTrigger>}
          {canManageSettings && <TabsTrigger value="pricing">Hinnoittelu</TabsTrigger>}
          {canManageSettings && <TabsTrigger value="warranty">Takuu</TabsTrigger>}
          {canManageSettings && <TabsTrigger value="technicians">Teknikot</TabsTrigger>}
          {canManageSettings && <TabsTrigger value="manufacturers">Laitevalmistajat</TabsTrigger>}
          {canManageSettings && <TabsTrigger value="alv">ALV-asetukset</TabsTrigger>}
          {canManageSettings && <TabsTrigger value="invoice">Laskuasetukset</TabsTrigger>}
          {canManageSettings && <TabsTrigger value="payment-methods">Maksutavat</TabsTrigger>}
          {canManageSettings && <TabsTrigger value="numbering">Numerointi</TabsTrigger>}
          {canManageSettings && <TabsTrigger value="inventory">Varasto</TabsTrigger>}
          {canManageSettings && <TabsTrigger value="notifications">Ilmoitukset</TabsTrigger>}
          {canManageSettings && <TabsTrigger value="backup">Varmuuskopiointi</TabsTrigger>}
        </TabsList>

        <TabsContent value="company">
          {!canManageSettings && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vain pääkäyttäjät voivat muokata yrityksen tietoja.
              </AlertDescription>
            </Alert>
          )}
          <CompanySettingsForm />
        </TabsContent>

        {canManageUsers && (
          <TabsContent value="users">
            <UserManagementForm />
          </TabsContent>
        )}

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Huoltostatukset
              </CardTitle>
              <CardDescription>
                Muokkaa huoltojen eri tiloja. Voit lisätä uusia, muokata olemassa olevia tai poistaa tarpeettomia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new status */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <Label className="text-sm font-medium mb-3 block">Lisää uusi status</Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Statuksen nimi..."
                    value={newStatusName}
                    onChange={(e) => setNewStatusName(e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">Väri:</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={newStatusColor}
                        onChange={(e) => setNewStatusColor(e.target.value)}
                        className="w-12 h-10 border rounded cursor-pointer"
                        title="Valitse väri"
                      />
                      <Input
                        type="text"
                        value={newStatusColor}
                        onChange={(e) => setNewStatusColor(e.target.value)}
                        placeholder="#6b7280"
                        className="w-28 h-10 font-mono text-sm"
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddStatus}
                    disabled={!newStatusName.trim() || addStatus.isPending}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Lisää
                  </Button>
                </div>
              </div>

              {/* Status list */}
              <div className="space-y-2">
                {statuses?.map((status) => (
                  <div 
                    key={status.id} 
                    className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    
                    {editingStatus === status.id ? (
                      // Edit mode
                      <>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                        />
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            className="w-12 h-10 border rounded cursor-pointer"
                            title="Valitse väri"
                          />
                          <Input
                            type="text"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            placeholder="#6b7280"
                            className="w-28 h-10 font-mono text-sm"
                            pattern="^#[0-9A-Fa-f]{6}$"
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updateStatus.isPending}
                        >
                          Tallenna
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          Peruuta
                        </Button>
                      </>
                    ) : (
                      // View mode
                      <>
                        <Badge 
                          style={{ backgroundColor: status.color, color: '#ffffff' }}
                          className="border-0"
                        >
                          {status.name}
                        </Badge>
                        
                        {status.is_default && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-muted-foreground">Oletus</span>
                          </div>
                        )}
                        
                        <div className="flex-1" />
                        
                        <div className="flex gap-1">
                          {!status.is_default && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSetDefault(status.id)}
                              disabled={setDefaultStatus.isPending}
                              title="Aseta oletukseksi"
                            >
                              <Star className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditStatus(status)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteStatus(status.id)}
                            disabled={deleteStatus.isPending}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {statuses && statuses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Ei statuksia määritelty. Lisää ensimmäinen status yllä.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Hinnoittelu asetukset
              </CardTitle>
              <CardDescription>
                Hallitse tuntiveloitusta ja kertamaksuja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new pricing setting */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <Label className="text-sm font-medium mb-3 block">Lisää uusi hinnoitteluasetus</Label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <Input
                    placeholder="Asetuksen nimi..."
                    value={newPricingName}
                    onChange={(e) => setNewPricingName(e.target.value)}
                  />
                  <Select value={newPricingType} onValueChange={setNewPricingType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tuntiveloitus">Tuntiveloitus</SelectItem>
                      <SelectItem value="kertamaksu">Kertamaksu</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Hinta (€)..."
                    type="number"
                    step="0.01"
                    value={newPricingPrice}
                    onChange={(e) => setNewPricingPrice(e.target.value)}
                  />
                  <div className="space-y-1">
                    <Select 
                      value={newPricingUnit} 
                      onValueChange={(value) => setNewPricingUnit(value === "custom" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Yksikkö..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Työ">Työ</SelectItem>
                        <SelectItem value="H">H</SelectItem>
                        <SelectItem value="Kpl">Kpl</SelectItem>
                        <SelectItem value="Pv">Pv</SelectItem>
                        <SelectItem value="Kk">Kk</SelectItem>
                        <SelectItem value="custom">Muu (kirjoita)</SelectItem>
                      </SelectContent>
                    </Select>
                    {!["Työ", "H", "Kpl", "Pv", "Kk"].includes(newPricingUnit) && (
                      <Input
                        placeholder="Kirjoita yksikkö..."
                        value={newPricingUnit}
                        onChange={(e) => setNewPricingUnit(e.target.value)}
                        className="text-sm"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newPricingIncludesVat"
                      checked={newPricingIncludesVat}
                      onCheckedChange={(checked) => setNewPricingIncludesVat(checked === true)}
                    />
                    <Label htmlFor="newPricingIncludesVat" className="text-sm">
                      Sisältää ALV:n
                    </Label>
                  </div>
                  <Button 
                    onClick={handleAddPricing}
                    disabled={!newPricingName.trim() || !newPricingPrice.trim() || addPricingSetting.isPending}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Lisää
                  </Button>
                </div>
              </div>

              {/* Pricing settings list */}
              <div className="space-y-2">
                {pricingSettings?.map((pricing) => (
                  <div 
                    key={pricing.id} 
                    className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    {editingPricing === pricing.id ? (
                      // Edit mode
                      <>
                        <Input
                          value={editPricingName}
                          onChange={(e) => setEditPricingName(e.target.value)}
                          className="flex-1"
                        />
                        <Select value={editPricingType} onValueChange={setEditPricingType}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tuntiveloitus">Tuntiveloitus</SelectItem>
                            <SelectItem value="kertamaksu">Kertamaksu</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={editPricingPrice}
                          onChange={(e) => setEditPricingPrice(e.target.value)}
                          type="number"
                          step="0.01"
                          className="w-24"
                        />
                        <div className="space-y-1 w-32">
                          <Select 
                            value={editPricingUnit} 
                            onValueChange={(value) => setEditPricingUnit(value === "custom" ? "" : value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Yksikkö" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Työ">Työ</SelectItem>
                              <SelectItem value="H">H</SelectItem>
                              <SelectItem value="Kpl">Kpl</SelectItem>
                              <SelectItem value="Pv">Pv</SelectItem>
                              <SelectItem value="Kk">Kk</SelectItem>
                              <SelectItem value="custom">Muu</SelectItem>
                            </SelectContent>
                          </Select>
                          {!["Työ", "H", "Kpl", "Pv", "Kk"].includes(editPricingUnit) && (
                            <Input
                              placeholder="Kirjoita..."
                              value={editPricingUnit}
                              onChange={(e) => setEditPricingUnit(e.target.value)}
                              className="text-xs"
                            />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Checkbox
                            id="editPricingIncludesVat"
                            checked={editPricingIncludesVat}
                            onCheckedChange={(checked) => setEditPricingIncludesVat(checked === true)}
                          />
                          <Label htmlFor="editPricingIncludesVat" className="text-xs">
                            ALV
                          </Label>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleSavePricingEdit}
                          disabled={updatePricingSetting.isPending}
                        >
                          Tallenna
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelPricingEdit}
                        >
                          Peruuta
                        </Button>
                      </>
                    ) : (
                      // View mode
                      <>
                        <div className="flex-1">
                          <div className="font-medium">{pricing.nimi}</div>
                          <div className="text-sm text-muted-foreground">
                            {pricing.hinnoittelu_tyyppi === 'tuntiveloitus' ? 'Tuntiveloitus' : 'Kertamaksu'} - {pricing.hinnoittelu_tyyppi === 'tuntiveloitus' ? pricing.oletustuntihinta : pricing.kiintea_hinta}€
                            {pricing.yksikko && ` / ${pricing.yksikko}`}
                            {pricing.sisaltaa_alv ? ' (sis. ALV)' : ' (+ ALV)'}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditPricing(pricing)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePricing(pricing.id)}
                            disabled={deletePricingSetting.isPending}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {pricingSettings && pricingSettings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Ei hinnoitteluasetuksia määritelty. Lisää ensimmäinen asetus yllä.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warranty">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Takuu asetukset
              </CardTitle>
              <CardDescription>
                Hallitse työ- ja osatakuiden oletusarvoja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(showWarrantyForm || editingWarranty) ? (
                <WarrantyForm 
                  onCancel={handleHideWarrantyForm}
                  editingSetting={editingWarranty}
                />
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <Button 
                      onClick={handleShowWarrantyForm}
                      disabled={addWarrantySetting.isPending}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Uusi takuuasetus
                    </Button>
                  </div>

                  {/* Warranty settings list */}
                  <div className="space-y-2">
                    {warrantySettings?.map((warranty) => (
                      <div 
                        key={warranty.id} 
                        className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{warranty.nimi}</div>
                          <div className="text-sm text-muted-foreground">
                            {(() => {
                              const parts = [];
                              if (warranty.oletusosatakuu_kuukautta) {
                                parts.push(`Osatakuu: ${warranty.oletusosatakuu_kuukautta} kk`);
                              }
                              if (warranty.oletustyotakuu_kuukautta) {
                                parts.push(`Työtakuu: ${warranty.oletustyotakuu_kuukautta} kk`);
                              }
                              return parts.length > 0 ? parts.join(', ') : 'Ei takuuaikoja määritelty';
                            })()}
                            {warranty.kuvaus && ` - ${warranty.kuvaus}`}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditWarranty(warranty)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteWarranty(warranty.id)}
                            disabled={deleteWarrantySetting.isPending}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {warrantySettings && warrantySettings.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Ei takuuasetuksia määritelty. Lisää ensimmäinen asetus yllä.
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teknikot
              </CardTitle>
              <CardDescription>
                Hallitse teknikoiden tietoja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new technician */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <Label className="text-sm font-medium mb-3 block">Lisää uusi teknikko</Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Teknikon nimi..."
                    value={newTechnicianName}
                    onChange={(e) => setNewTechnicianName(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAddTechnician}
                    disabled={!newTechnicianName.trim() || addTechnician.isPending}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Lisää
                  </Button>
                </div>
              </div>

              {/* Technicians list */}
              <div className="space-y-2">
                {technicians?.map((technician) => (
                  <div 
                    key={technician.id} 
                    className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    {editingTechnician === technician.id ? (
                      // Edit mode
                      <>
                        <Input
                          value={editTechnicianName}
                          onChange={(e) => setEditTechnicianName(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveTechnicianEdit}
                          disabled={updateTechnician.isPending}
                        >
                          Tallenna
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelTechnicianEdit}
                        >
                          Peruuta
                        </Button>
                      </>
                    ) : (
                      // View mode
                      <>
                        <div className="flex-1">
                          <div className="font-medium">{technician.nimi}</div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTechnician(technician)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTechnician(technician.id)}
                            disabled={deleteTechnician.isPending}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {technicians && technicians.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Ei teknikoita määritelty. Lisää ensimmäinen teknikko yllä.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manufacturers">
          <ManufacturersSettingsForm />
        </TabsContent>

        <TabsContent value="alv">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                ALV-asetukset
              </CardTitle>
              <CardDescription>
                Määrittele ALV-prosentit joita käytetään laskutuksessa. Suomessa yleinen ALV-kanta on 25,5%.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new ALV setting */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <Label className="text-sm font-medium mb-3 block">Lisää uusi ALV-asetus</Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="ALV-asetuksen nimi (esim. Suomi ALV)..."
                    value={newAlvName}
                    onChange={(e) => setNewAlvName(e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="25,5"
                      value={newAlvRate}
                      onChange={(e) => setNewAlvRate(e.target.value)}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <Button 
                    onClick={handleAddAlv}
                    disabled={!newAlvName.trim() || !newAlvRate.trim() || addAlvSetting.isPending}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Lisää
                  </Button>
                </div>
              </div>

              {/* ALV list */}
              <div className="space-y-2">
                {alvSettings?.map((alv) => (
                  <div key={alv.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {editingAlv === alv.id ? (
                      // Edit mode
                      <>
                        <Input
                          value={editAlvName}
                          onChange={(e) => setEditAlvName(e.target.value)}
                          className="flex-1"
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editAlvRate}
                            onChange={(e) => setEditAlvRate(e.target.value)}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleSaveAlvEdit}
                          disabled={updateAlvSetting.isPending}
                        >
                          Tallenna
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelAlvEdit}
                        >
                          Peruuta
                        </Button>
                      </>
                    ) : (
                      // View mode
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{alv.nimi}</div>
                            <Badge variant="outline" className="text-xs">
                              {alv.alv_prosentti}%
                            </Badge>
                            {alv.is_default && (
                              <Badge variant="default" className="text-xs">
                                Oletus
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditAlv(alv)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          
                          {!alv.is_default && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSetDefaultAlv(alv.id)}
                              disabled={setDefaultAlvSetting.isPending}
                              title="Aseta oletukseksi"
                            >
                              <Star className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAlv(alv.id)}
                            disabled={deleteAlvSetting.isPending || alv.is_default}
                            className="hover:text-destructive"
                            title={alv.is_default ? "Et voi poistaa oletusasetusta" : "Poista"}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {alvSettings && alvSettings.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ei ALV-asetuksia</h3>
                  <p className="text-muted-foreground mb-4">
                    ALV-asetukset ovat käytettävissä kun migraatio on suoritettu.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Suorita ensin ALV-taulukon migraatio, jonka jälkeen voit määritellä ALV-prosentit.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Laskuasetukset
              </CardTitle>
              <CardDescription>
                Hallitse laskutusehtoja eri asiakastyypeille
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Asetuksen nimi (esim. Yritysasiakkaat)"
                    value={newInvoiceName}
                    onChange={(e) => setNewInvoiceName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Maksuaika (pv)"
                    value={newInvoicePaymentTerm}
                    onChange={(e) => setNewInvoicePaymentTerm(e.target.value)}
                    className="w-32"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Viivästysmaksu (€)"
                    value={newInvoiceLateFee}
                    onChange={(e) => setNewInvoiceLateFee(e.target.value)}
                    className="w-40"
                  />
                  <Button
                    onClick={handleAddInvoice}
                    disabled={addInvoiceSetting.isPending}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Lisää
                  </Button>
                </div>

                <div className="space-y-2">
                  {invoiceSettings?.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      {editingInvoice === invoice.id ? (
                        <>
                          <div className="flex gap-2 flex-1">
                            <Input
                              value={editInvoiceName}
                              onChange={(e) => setEditInvoiceName(e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              min="1"
                              value={editInvoicePaymentTerm}
                              onChange={(e) => setEditInvoicePaymentTerm(e.target.value)}
                              className="w-32"
                            />
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editInvoiceLateFee}
                              onChange={(e) => setEditInvoiceLateFee(e.target.value)}
                              className="w-40"
                            />
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              size="sm"
                              onClick={handleSaveInvoiceEdit}
                              disabled={updateInvoiceSetting.isPending}
                            >
                              Tallenna
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelInvoiceEdit}
                            >
                              Peruuta
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="font-medium">{invoice.nimi}</div>
                            <div className="text-sm text-muted-foreground">
                              Maksuaika: {invoice.oletusmaksuehto_paivat} päivää • Viivästysmaksu: {invoice.oletusviivastyskulut}€
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditInvoice(invoice)}
                              disabled={updateInvoiceSetting.isPending}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              disabled={deleteInvoiceSetting.isPending}
                              className="hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {invoiceSettings && invoiceSettings.length === 0 && (
                  <div className="text-center py-8">
                    <Euro className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Ei laskuasetuksia</h3>
                    <p className="text-muted-foreground">
                      Lisää ensimmäinen laskuasetus määritelläksesi maksuehdon ja viivästysmaksun.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="numbering">
          <Card>
            <CardHeader>
              <CardTitle>Numerointiasetuket</CardTitle>
              <CardDescription>
                Määritä asiakkaiden ja huoltojen numerointikaavat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NumberingSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <InventorySettingsForm />
        </TabsContent>

        <TabsContent value="payment-methods">
          <PaymentMethodsSettingsForm />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettingsForm />
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Varmuuskopiointi ja palautus
              </CardTitle>
              <CardDescription>
                Luo varmuuskopioita kaikista tärkeistä tiedoista tai palauta aiemmin luotu varmuuskopio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Download backup section */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Lataa varmuuskopio
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Lataa kaikki tärkeät tiedot (asiakkaat, huollot, laitteet, asetukset) JSON-tiedostoon.
                  </p>
                  <Button 
                    onClick={handleDownloadBackup}
                    disabled={backupLoading}
                    className="w-full"
                  >
                    {backupLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {backupLoading ? "Luodaan varmuuskopiota..." : "Lataa varmuuskopio"}
                  </Button>
                </div>
              </div>

              {/* Restore backup section */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Tuo varmuuskopio
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Palauta aiemmin luotu varmuuskopio. <strong>Varoitus:</strong> Tämä ylikirjoittaa kaikki nykyiset tiedot.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={restoreLoading}
                      >
                        {restoreLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        {restoreLoading ? "Palautetaan..." : "Valitse varmuuskopio"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                          Oletko varma?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Oletko varma, että haluat palauttaa varmuuskopion? Tämä toiminto:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Poistaa kaikki nykyiset asiakkaat, huollot ja laitteet</li>
                            <li>Korvaa kaikki asetukset varmuuskopion tiedoilla</li>
                            <li>Ei voi peruuttaa toimintoa</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Peruuta</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.json';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                handleRestoreBackup(file);
                              }
                            };
                            input.click();
                          }}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          Kyllä, palauta varmuuskopio
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Danger Zone - Clear all data */}
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Vaarallinen alue
                  </CardTitle>
                  <CardDescription>
                    Tyhjennä kaikki testidataa ja aloita puhtaalta pöydältä
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tietokentät: mitä poistetaan ja mitä säilyy */}
                  <div className="text-sm space-y-3">
                    <div>
                      <p className="font-semibold text-destructive mb-2">Mitä poistetaan:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Kaikki asiakkaat</li>
                        <li>Kaikki huollot</li>
                        <li>Kaikki laitteet</li>
                        <li>Kaikki laskut</li>
                        <li>Kaikki varaosat</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-green-600 dark:text-green-400 mb-2">Mitä säilyy:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Kaikki asetukset (hinnat, statukset, takuut, numerointiasetukset)</li>
                        <li>Valmistajat ja maksutavat</li>
                        <li>Käyttäjätunnukset</li>
                        <li>Yrityksen tiedot</li>
                      </ul>
                    </div>
                  </div>

                  {/* AlertDialog vahvistuksella */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full" disabled={clearDataLoading}>
                        {clearDataLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        {clearDataLoading ? "Tyhjennetään..." : "Tyhjennä kaikki data"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                          Oletko täysin varma?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                          <p>
                            Tämä toiminto on <strong>peruuttamaton</strong>. Kaikki asiakkaat, huollot, laitteet, laskut ja varaosat poistetaan pysyvästi.
                          </p>
                          <p className="text-destructive font-semibold">
                            Suosittelemme lataamaan varmuuskopion ennen tätä toimintoa!
                          </p>
                          <div className="space-y-2">
                            <Label htmlFor="confirmInput" className="text-sm font-medium">
                              Kirjoita <span className="font-mono bg-muted px-1 rounded">TYHJENNÄ</span> vahvistaaksesi:
                            </Label>
                            <Input
                              id="confirmInput"
                              value={confirmationText}
                              onChange={(e) => setConfirmationText(e.target.value)}
                              placeholder="Kirjoita TYHJENNÄ..."
                              className="font-mono"
                            />
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirmationText("")}>
                          Peruuta
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={confirmationText.toUpperCase() !== "TYHJENNÄ"}
                          onClick={handleClearAllData}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Tyhjennä data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>

              {/* Instructions */}
              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Ohjeita</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Luo varmuuskopioita säännöllisesti tärkeiden tietojen varalta</li>
                  <li>• Varmuuskopiot sisältävät kaikki asiakkaat, huollot, laitteet ja asetukset</li>
                  <li>• Talleta varmuuskopiot turvalliseen paikkaan</li>
                  <li>• Testaa varmuuskopioiden palauttaminen ennen tärkeää käyttöä</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Asetukset;