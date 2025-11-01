import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Mail, Bell, Package } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useIlmoitusAsetukset, useUpdateIlmoitusAsetukset, useSendTestEmail } from "@/hooks/useIlmoitusAsetukset";

export const NotificationSettingsForm = () => {
  const { data: settings, isLoading } = useIlmoitusAsetukset();
  const updateSettings = useUpdateIlmoitusAsetukset();
  const sendTestEmail = useSendTestEmail();

  const [serviceReadyEnabled, setServiceReadyEnabled] = useState(false);
  const [serviceReadyTemplate, setServiceReadyTemplate] = useState("");
  const [serviceReadyTemplateLocal, setServiceReadyTemplateLocal] = useState("");
  
  const [overdueEnabled, setOverdueEnabled] = useState(false);
  const [overdueDays, setOverdueDays] = useState(7);
  const [overdueTemplate, setOverdueTemplate] = useState("");
  const [overdueTemplateLocal, setOverdueTemplateLocal] = useState("");
  
  const [inventoryAlertEnabled, setInventoryAlertEnabled] = useState(false);
  const [inventoryAlertEmail, setInventoryAlertEmail] = useState("");
  
  const [serviceReadyTestEmail, setServiceReadyTestEmail] = useState("");
  const [overdueTestEmail, setOverdueTestEmail] = useState("");

  const serviceReadyDebounceRef = useRef<NodeJS.Timeout>();
  const overdueDebounceRef = useRef<NodeJS.Timeout>();

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setServiceReadyEnabled(settings.huolto_valmis_kaytossa);
      setServiceReadyTemplate(settings.huolto_valmis_pohja);
      setServiceReadyTemplateLocal(settings.huolto_valmis_pohja);
      setOverdueEnabled(settings.lasku_eraantynyt_kaytossa);
      setOverdueDays(settings.lasku_eraantynyt_paivat);
      setOverdueTemplate(settings.lasku_eraantynyt_pohja);
      setOverdueTemplateLocal(settings.lasku_eraantynyt_pohja);
      setInventoryAlertEnabled(settings.varasto_varoitus_kaytossa || false);
      setInventoryAlertEmail(settings.varasto_varoitus_email || "");
    }
  }, [settings]);

  const handleServiceReadyTemplateChange = (value: string) => {
    setServiceReadyTemplateLocal(value);
    
    if (serviceReadyDebounceRef.current) {
      clearTimeout(serviceReadyDebounceRef.current);
    }
    
    serviceReadyDebounceRef.current = setTimeout(() => {
      setServiceReadyTemplate(value);
    }, 300);
  };

  const handleOverdueTemplateChange = (value: string) => {
    setOverdueTemplateLocal(value);
    
    if (overdueDebounceRef.current) {
      clearTimeout(overdueDebounceRef.current);
    }
    
    overdueDebounceRef.current = setTimeout(() => {
      setOverdueTemplate(value);
    }, 300);
  };

  const handleSave = () => {
    updateSettings.mutate({
      huolto_valmis_kaytossa: serviceReadyEnabled,
      huolto_valmis_pohja: serviceReadyTemplate,
      lasku_eraantynyt_kaytossa: overdueEnabled,
      lasku_eraantynyt_paivat: overdueDays,
      lasku_eraantynyt_pohja: overdueTemplate,
      varasto_varoitus_kaytossa: inventoryAlertEnabled,
      varasto_varoitus_email: inventoryAlertEmail,
    });
  };

  const handleSendTestEmail = (type: "service_ready" | "overdue_invoice" | "inventory_alert", email: string) => {
    if (!email) {
      alert("Anna testisähköpostiosoite");
      return;
    }
    sendTestEmail.mutate({ email, type });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Ready Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Huolto valmis -ilmoitus
          </CardTitle>
          <CardDescription>
            Lähetä automaattinen sähköposti-ilmoitus asiakkaalle kun huolto merkitään valmiiksi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="service-ready-enabled">Käytössä</Label>
            <Switch
              id="service-ready-enabled"
              checked={serviceReadyEnabled}
              onCheckedChange={setServiceReadyEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-ready-template">Viestipohja</Label>
            <Textarea
              id="service-ready-template"
              value={serviceReadyTemplateLocal}
              onChange={(e) => handleServiceReadyTemplateChange(e.target.value)}
              placeholder="Hei [Asiakas], laitteesi [Laite] on valmis noudettavaksi. Terv. [Yritys]"
              rows={4}
              disabled={!serviceReadyEnabled}
            />
            <p className="text-sm text-muted-foreground">
              Käytä placeholder-tekstejä: <code className="bg-muted px-1 rounded">[Asiakas]</code>,{" "}
              <code className="bg-muted px-1 rounded">[Laite]</code>,{" "}
              <code className="bg-muted px-1 rounded">[Yritys]</code>
              <br />
              <span className="text-amber-600 font-medium">💡 Tärkeää:</span> Euro-merkki pitää kirjoittaa <code className="bg-muted px-1 rounded">&amp;euro;</code> muodossa, ei <code className="bg-muted px-1 rounded line-through">€</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-ready-test-email">Testisähköpostiosoite</Label>
            <Input
              id="service-ready-test-email"
              type="email"
              value={serviceReadyTestEmail}
              onChange={(e) => setServiceReadyTestEmail(e.target.value)}
              placeholder="testi@example.com"
              disabled={!serviceReadyEnabled}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => handleSendTestEmail("service_ready", serviceReadyTestEmail)}
            disabled={!serviceReadyEnabled || sendTestEmail.isPending}
          >
            {sendTestEmail.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Lähetä testiviesti
          </Button>
        </CardContent>
      </Card>

      {/* Overdue Invoice Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Lasku erääntynyt -muistutus
          </CardTitle>
          <CardDescription>
            Lähetä automaattinen muistutus asiakkaalle kun lasku on erääntynyt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="overdue-enabled">Käytössä</Label>
            <Switch
              id="overdue-enabled"
              checked={overdueEnabled}
              onCheckedChange={setOverdueEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overdue-days">Lähetä muistutus (päivää eräpäivän jälkeen)</Label>
            <Input
              id="overdue-days"
              type="number"
              value={overdueDays}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setOverdueDays(val >= 0 ? val : 7);
              }}
              min={0}
              disabled={!overdueEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overdue-template">Viestipohja</Label>
            <Textarea
              id="overdue-template"
              value={overdueTemplateLocal}
              onChange={(e) => handleOverdueTemplateChange(e.target.value)}
              placeholder="Hei [Asiakas], laskusi [Numero] on erääntynyt [Päivää] päivää sitten. Summa: [Summa]&euro;. Terv. [Yritys]"
              rows={4}
              disabled={!overdueEnabled}
            />
            <p className="text-sm text-muted-foreground">
              Käytä placeholder-tekstejä: <code className="bg-muted px-1 rounded">[Asiakas]</code>,{" "}
              <code className="bg-muted px-1 rounded">[Numero]</code>,{" "}
              <code className="bg-muted px-1 rounded">[Päivää]</code>,{" "}
              <code className="bg-muted px-1 rounded">[Summa]</code>,{" "}
              <code className="bg-muted px-1 rounded">[Yritys]</code>
              <br />
              <span className="text-amber-600 font-medium">💡 Tärkeää:</span> Euro-merkki pitää kirjoittaa <code className="bg-muted px-1 rounded">&amp;euro;</code> muodossa, ei <code className="bg-muted px-1 rounded line-through">€</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="overdue-test-email">Testisähköpostiosoite</Label>
            <Input
              id="overdue-test-email"
              type="email"
              value={overdueTestEmail}
              onChange={(e) => setOverdueTestEmail(e.target.value)}
              placeholder="testi@example.com"
              disabled={!overdueEnabled}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => handleSendTestEmail("overdue_invoice", overdueTestEmail)}
            disabled={!overdueEnabled || sendTestEmail.isPending}
          >
            {sendTestEmail.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Lähetä testiviesti
          </Button>
        </CardContent>
      </Card>

      {/* Inventory Low Stock Alert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Varasto-ilmoitukset
          </CardTitle>
          <CardDescription>
            Lähetä automaattinen ilmoitus kun varaosien saldo laskee alle minimirajan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          

          <div className="flex items-center justify-between">
            <Label htmlFor="inventory-alert-enabled">Käytössä</Label>
            <Switch
              id="inventory-alert-enabled"
              checked={inventoryAlertEnabled}
              onCheckedChange={setInventoryAlertEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inventory-alert-email">Ilmoitusten sähköpostiosoite</Label>
            <Input
              id="inventory-alert-email"
              type="email"
              value={inventoryAlertEmail}
              onChange={(e) => setInventoryAlertEmail(e.target.value)}
              placeholder="varasto@yritys.fi"
              disabled={!inventoryAlertEnabled}
            />
            <p className="text-sm text-muted-foreground">
              Jos tyhjä, ilmoitukset lähetetään yrityksen oletussähköpostiin
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => handleSendTestEmail("inventory_alert", inventoryAlertEmail)}
            disabled={!inventoryAlertEnabled || sendTestEmail.isPending}
          >
            {sendTestEmail.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Lähetä testiviesti
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          Tallenna asetukset
        </Button>
      </div>
    </div>
  );
};
