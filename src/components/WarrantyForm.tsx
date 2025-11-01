import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useAddWarrantySetting, useUpdateWarrantySetting } from "@/hooks/useWarrantySettings";
import { X } from "lucide-react";

interface WarrantyFormProps {
  onCancel: () => void;
  editingSetting?: {
    id: string;
    nimi: string;
    kuvaus?: string;
    oletustyotakuu_kuukautta?: number;
    oletusosatakuu_kuukautta?: number;
  };
}

export const WarrantyForm = ({ onCancel, editingSetting }: WarrantyFormProps) => {
  const [formData, setFormData] = useState({
    nimi: editingSetting?.nimi || "",
    kuvaus: editingSetting?.kuvaus || "",
    oletustyotakuu_kuukautta: editingSetting?.oletustyotakuu_kuukautta?.toString() || "",
    oletusosatakuu_kuukautta: editingSetting?.oletusosatakuu_kuukautta?.toString() || "",
  });

  const [includeWorkWarranty, setIncludeWorkWarranty] = useState(
    editingSetting?.oletustyotakuu_kuukautta !== null && editingSetting?.oletustyotakuu_kuukautta !== undefined
  );

  const addWarrantySetting = useAddWarrantySetting();
  const updateWarrantySetting = useUpdateWarrantySetting();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const settingData = {
      nimi: formData.nimi,
      kuvaus: formData.kuvaus || null,
      oletustyotakuu_kuukautta: includeWorkWarranty && formData.oletustyotakuu_kuukautta ? parseInt(formData.oletustyotakuu_kuukautta) : null,
      oletusosatakuu_kuukautta: formData.oletusosatakuu_kuukautta ? parseInt(formData.oletusosatakuu_kuukautta) : null,
    };

    if (editingSetting) {
      updateWarrantySetting.mutate({ 
        id: editingSetting.id, 
        updates: settingData 
      });
    } else {
      addWarrantySetting.mutate(settingData);
    }
    
    onCancel();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{editingSetting ? "Muokkaa takuuasetusta" : "Uusi takuuasetus"}</CardTitle>
        <Button
          variant="ghost" 
          size="icon"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nimi">Nimi *</Label>
            <Input
              id="nimi"
              value={formData.nimi}
              onChange={(e) => handleChange("nimi", e.target.value)}
              placeholder="Esim. Perus takuu"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kuvaus">Kuvaus</Label>
            <Textarea
              id="kuvaus"
              value={formData.kuvaus}
              onChange={(e) => handleChange("kuvaus", e.target.value)}
              placeholder="Kuvaus takuuasetuksesta"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="osatakuu">Osatakuu (kk)</Label>
            <Input
              id="osatakuu"
              type="number"
              min="0"
              value={formData.oletusosatakuu_kuukautta}
              onChange={(e) => handleChange("oletusosatakuu_kuukautta", e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-work-warranty"
                checked={includeWorkWarranty}
                onCheckedChange={(checked) => setIncludeWorkWarranty(checked === true)}
              />
              <Label htmlFor="include-work-warranty">Lisää työtakuu</Label>
            </div>

            {includeWorkWarranty && (
              <div className="space-y-2">
                <Label htmlFor="tyotakuu">Työtakuu (kk)</Label>
                <Input
                  id="tyotakuu"
                  type="number"
                  min="0"
                  value={formData.oletustyotakuu_kuukautta}
                  onChange={(e) => handleChange("oletustyotakuu_kuukautta", e.target.value)}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={!formData.nimi.trim()}>
              Tallenna
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Peruuta
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};