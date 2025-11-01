import { useState, useRef, useEffect } from "react";
import { useCompanySettings, useUpdateCompanySettings, useUploadLogo } from "@/hooks/useCompanySettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Building2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CompanySettingsForm = () => {
  const { data: settings, isLoading, isError } = useCompanySettings();
  const updateSettings = useUpdateCompanySettings();
  const uploadLogo = useUploadLogo();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const [formData, setFormData] = useState({
    yrityksen_nimi: "",
    osoite: "",
    postinumero: "",
    postitoimipaikka: "",
    puhelin: "",
    email: "",
    y_tunnus: "",
    alv_numero: "",
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (settings) {
      setFormData({
        yrityksen_nimi: settings.yrityksen_nimi || "",
        osoite: settings.osoite || "",
        postinumero: settings.postinumero || "",
        postitoimipaikka: settings.postitoimipaikka || "",
        puhelin: settings.puhelin || "",
        email: settings.email || "",
        y_tunnus: settings.y_tunnus || "",
        alv_numero: settings.alv_numero || "",
      });
      setLogoUrl(settings.logo_url || null);
    }
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Virhe",
        description: "Valitse kuvatiedosto (JPG, PNG, jne.)",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Virhe",
        description: "Tiedosto on liian suuri. Maksimikoko on 2MB.",
      });
      return;
    }

    setIsUploadingLogo(true);
    try {
      const publicUrl = await uploadLogo.mutateAsync(file);
      setLogoUrl(publicUrl);
      
      // Also update the settings with the new logo URL
      await updateSettings.mutateAsync({
        ...formData,
        logo_url: publicUrl,
      });
    } catch (error) {
      console.error("Logo upload error:", error);
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = async () => {
    setLogoUrl(null);
    await updateSettings.mutateAsync({
      ...formData,
      logo_url: null,
    });
  };

  const handleSave = () => {
    if (!formData.yrityksen_nimi) {
      toast({
        variant: "destructive",
        title: "Virhe",
        description: "Yrityksen nimi on pakollinen",
      });
      return;
    }

    updateSettings.mutate({
      ...formData,
      logo_url: logoUrl,
    });
  };

  if (isLoading && !loadingTimeout) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm text-muted-foreground">Ladataan yrityksen tietoja...</p>
      </div>
    );
  }

  if (loadingTimeout || isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Yrityksen tiedot
          </CardTitle>
          <CardDescription>
            {isError ? "Virhe ladattaessa yrityksen tietoja." : "Lataus kestää odotettua kauemmin."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ole hyvä ja päivitä sivu tai yritä myöhemmin uudelleen.
          </p>
          <Button onClick={() => window.location.reload()}>
            Päivitä sivu
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Yrityksen tiedot
        </CardTitle>
        <CardDescription>
          Hallitse yrityksen perustietoja ja logoa. Nämä tiedot näkyvät laskuissa ja huoltokaavakkeissa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo upload */}
        <div className="space-y-2">
          <Label>Logo</Label>
          <div className="flex items-start gap-4">
            {logoUrl ? (
              <div className="relative">
                <img
                  src={logoUrl}
                  alt="Yrityksen logo"
                  className="h-20 w-auto object-contain border rounded p-2 bg-background"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={handleRemoveLogo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="h-20 w-20 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground">
                <Upload className="h-8 w-8" />
              </div>
            )}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingLogo}
              >
                {isUploadingLogo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ladataan...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {logoUrl ? "Vaihda logo" : "Lataa logo"}
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Suositeltava koko: 300x100px. Maksimikoko: 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Company name */}
        <div className="space-y-2">
          <Label htmlFor="yrityksen_nimi">Yrityksen nimi *</Label>
          <Input
            id="yrityksen_nimi"
            value={formData.yrityksen_nimi}
            onChange={(e) => handleInputChange("yrityksen_nimi", e.target.value)}
            placeholder="Esim. Oy Yritys Ab"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="osoite">Osoite</Label>
          <Input
            id="osoite"
            value={formData.osoite}
            onChange={(e) => handleInputChange("osoite", e.target.value)}
            placeholder="Esim. Esimerkkikatu 1"
          />
        </div>

        {/* Postal code and city */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postinumero">Postinumero</Label>
            <Input
              id="postinumero"
              value={formData.postinumero}
              onChange={(e) => handleInputChange("postinumero", e.target.value)}
              placeholder="00100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postitoimipaikka">Postitoimipaikka</Label>
            <Input
              id="postitoimipaikka"
              value={formData.postitoimipaikka}
              onChange={(e) => handleInputChange("postitoimipaikka", e.target.value)}
              placeholder="Helsinki"
            />
          </div>
        </div>

        {/* Phone and email */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="puhelin">Puhelin</Label>
            <Input
              id="puhelin"
              value={formData.puhelin}
              onChange={(e) => handleInputChange("puhelin", e.target.value)}
              placeholder="+358 40 123 4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Sähköposti</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="info@yritys.fi"
            />
          </div>
        </div>

        {/* Business ID and VAT */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="y_tunnus">Y-tunnus</Label>
            <Input
              id="y_tunnus"
              value={formData.y_tunnus}
              onChange={(e) => handleInputChange("y_tunnus", e.target.value)}
              placeholder="1234567-8"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alv_numero">ALV-numero</Label>
            <Input
              id="alv_numero"
              value={formData.alv_numero}
              onChange={(e) => handleInputChange("alv_numero", e.target.value)}
              placeholder="FI12345678"
            />
          </div>
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending || !formData.yrityksen_nimi}
          className="w-full"
        >
          {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Tallenna muutokset
        </Button>
      </CardContent>
    </Card>
  );
};
