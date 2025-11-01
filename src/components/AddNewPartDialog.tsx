import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useAddInventoryPart } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";

interface AddNewPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPartAdded: (part: { id: string; varaosa_id: string; nimi: string; maara: number; yksikkohinta: number; kustannushinta?: number }) => void;
}

export const AddNewPartDialog = ({ open, onOpenChange, onPartAdded }: AddNewPartDialogProps) => {
  const [partName, setPartName] = useState("");
  const [partQuantity, setPartQuantity] = useState("1");
  const [partPrice, setPartPrice] = useState("");
  const [partCostPrice, setPartCostPrice] = useState("");
  const [partDescription, setPartDescription] = useState("");
  const [saveToInventory, setSaveToInventory] = useState(false);
  
  // Extended fields (shown when saveToInventory is true)
  const [partStock, setPartStock] = useState("");
  const [partMinStock, setPartMinStock] = useState("");
  const [partUnit, setPartUnit] = useState("kpl");
  const [partSupplier, setPartSupplier] = useState("");
  const [partCode, setPartCode] = useState("");
  const [partCategory, setPartCategory] = useState("");
  const [partIncludesVat, setPartIncludesVat] = useState(false);

  const addInventoryPart = useAddInventoryPart();
  const { toast } = useToast();

  const resetForm = () => {
    setPartName("");
    setPartQuantity("1");
    setPartPrice("");
    setPartCostPrice("");
    setPartDescription("");
    setSaveToInventory(false);
    setPartStock("");
    setPartMinStock("");
    setPartUnit("kpl");
    setPartSupplier("");
    setPartCode("");
    setPartCategory("");
    setPartIncludesVat(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partName.trim() || !partPrice) {
      toast({
        variant: "destructive",
        title: "Virhe",
        description: "Nimi ja yksikköhinta ovat pakollisia",
      });
      return;
    }

    try {
      // Create part in inventory
      const partData: any = {
        nimi: partName.trim(),
        kuvaus: partDescription.trim() || null,
        hinta: parseFloat(partPrice),
        kustannushinta: partCostPrice ? parseFloat(partCostPrice) : null,
        saldo: saveToInventory ? (parseInt(partStock) || 0) : 0,
        minimisaldo: saveToInventory ? (parseInt(partMinStock) || 0) : 0,
        yksikko: saveToInventory ? partUnit : "kpl",
        toimittaja: saveToInventory ? (partSupplier.trim() || null) : null,
        tuotekoodi: saveToInventory ? (partCode.trim() || null) : null,
        kategoria: saveToInventory ? (partCategory.trim() || null) : null,
        sisaltaa_alv: saveToInventory ? partIncludesVat : false,
        is_active: true,
      };

      const newPart = await addInventoryPart.mutateAsync(partData);

      // Call parent callback with the new part info for service
      onPartAdded({
        id: Date.now().toString(),
        varaosa_id: newPart.id,
        nimi: newPart.nimi,
        maara: parseInt(partQuantity) || 1,
        yksikkohinta: parseFloat(partPrice),
        kustannushinta: partCostPrice ? parseFloat(partCostPrice) : undefined,
      });

      toast({
        title: "Varaosa lisätty",
        description: saveToInventory 
          ? "Uusi varaosa on lisätty varastoon ja huoltoon"
          : "Uusi varaosa on lisätty huoltoon",
      });

      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Virhe",
        description: error.message || "Varaosan lisääminen epäonnistui",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lisää uusi varaosa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic fields */}
          <div className="space-y-2">
            <Label htmlFor="part-name">Nimi *</Label>
            <Input
              id="part-name"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="esim. iPhone 12 näyttö"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="part-quantity">Määrä *</Label>
              <Input
                id="part-quantity"
                type="number"
                min="1"
                value={partQuantity}
                onChange={(e) => setPartQuantity(e.target.value)}
                placeholder="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="part-price">Yksikköhinta (€) *</Label>
              <Input
                id="part-price"
                type="number"
                step="0.01"
                value={partPrice}
                onChange={(e) => setPartPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="part-cost-price">Kustannushinta (€)</Label>
            <Input
              id="part-cost-price"
              type="number"
              step="0.01"
              value={partCostPrice}
              onChange={(e) => setPartCostPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="part-description">Kuvaus</Label>
            <Textarea
              id="part-description"
              value={partDescription}
              onChange={(e) => setPartDescription(e.target.value)}
              placeholder="Varaosan kuvaus"
              rows={2}
            />
          </div>

          {/* Save to inventory checkbox */}
          <div className="flex items-center space-x-2 py-2 border-t">
            <Checkbox
              id="save-to-inventory"
              checked={saveToInventory}
              onCheckedChange={(checked) => setSaveToInventory(!!checked)}
            />
            <Label htmlFor="save-to-inventory" className="text-sm font-medium cursor-pointer">
              Tallenna myös varastoon (lisää varaston lisätiedot)
            </Label>
          </div>

          {/* Extended fields (shown when saveToInventory is true) */}
          {saveToInventory && (
            <div className="space-y-4 border-t pt-4 bg-muted/30 p-4 rounded-md">
              <h4 className="text-sm font-medium">Varaston lisätiedot</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="part-stock">Saldo</Label>
                  <Input
                    id="part-stock"
                    type="number"
                    value={partStock}
                    onChange={(e) => setPartStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="part-min-stock">Min. saldo</Label>
                  <Input
                    id="part-min-stock"
                    type="number"
                    value={partMinStock}
                    onChange={(e) => setPartMinStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="part-unit">Yksikkö</Label>
                <Input
                  id="part-unit"
                  value={partUnit}
                  onChange={(e) => setPartUnit(e.target.value)}
                  placeholder="kpl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="part-supplier">Toimittaja</Label>
                <Input
                  id="part-supplier"
                  value={partSupplier}
                  onChange={(e) => setPartSupplier(e.target.value)}
                  placeholder="Toimittajan nimi"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="part-code">Tuotekoodi</Label>
                  <Input
                    id="part-code"
                    value={partCode}
                    onChange={(e) => setPartCode(e.target.value)}
                    placeholder="ABC123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="part-category">Kategoria</Label>
                  <Input
                    id="part-category"
                    value={partCategory}
                    onChange={(e) => setPartCategory(e.target.value)}
                    placeholder="esim. Näytöt"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="part-includes-vat"
                  checked={partIncludesVat}
                  onCheckedChange={(checked) => setPartIncludesVat(!!checked)}
                />
                <Label htmlFor="part-includes-vat" className="text-sm">
                  Sisältää ALV:n
                </Label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Peruuta
            </Button>
            <Button type="submit" disabled={addInventoryPart.isPending}>
              {addInventoryPart.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lisää varaosa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
