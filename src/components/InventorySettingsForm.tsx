import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit2, Trash2, Package, Loader2 } from "lucide-react";
import { useInventorySettings, useUpdateInventorySettings, useInventoryParts, useAddInventoryPart, useUpdateInventoryPart } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";

export const InventorySettingsForm = () => {
  const [newPartName, setNewPartName] = useState("");
  const [newPartDescription, setNewPartDescription] = useState("");
  const [newPartPrice, setNewPartPrice] = useState("");
  const [newPartStock, setNewPartStock] = useState("");
  const [newPartMinStock, setNewPartMinStock] = useState("");
  const [newPartUnit, setNewPartUnit] = useState("kpl");
  const [newPartSupplier, setNewPartSupplier] = useState("");
  const [newPartCode, setNewPartCode] = useState("");
  const [newPartCategory, setNewPartCategory] = useState("");
  const [newPartIncludesVat, setNewPartIncludesVat] = useState(false);

  // Edit part state
  const [editingPart, setEditingPart] = useState<any>(null);
  const [editPartName, setEditPartName] = useState("");
  const [editPartDescription, setEditPartDescription] = useState("");
  const [editPartPrice, setEditPartPrice] = useState("");
  const [editPartStock, setEditPartStock] = useState("");
  const [editPartMinStock, setEditPartMinStock] = useState("");
  const [editPartUnit, setEditPartUnit] = useState("kpl");
  const [editPartSupplier, setEditPartSupplier] = useState("");
  const [editPartCode, setEditPartCode] = useState("");
  const [editPartCategory, setEditPartCategory] = useState("");
  const [editPartIncludesVat, setEditPartIncludesVat] = useState(false);

  const { data: inventorySettings } = useInventorySettings();
  const { data: inventoryParts } = useInventoryParts();
  const updateInventorySettings = useUpdateInventorySettings();
  const addInventoryPart = useAddInventoryPart();
  const updateInventoryPart = useUpdateInventoryPart();
  const { toast } = useToast();

  const handleToggleInventory = async (enabled: boolean) => {
    try {
      await updateInventorySettings.mutateAsync({
        varasto_kaytossa: enabled
      });
      toast({
        title: enabled ? "Varasto otettu käyttöön" : "Varasto poistettu käytöstä",
        description: enabled 
          ? "Voit nyt hallita varaosia ja lisätä niitä huoltotöihin."
          : "Varasto-ominaisuudet piilotettu käyttöliittymästä."
      });
    } catch (error) {
      toast({
        title: "Virhe",
        description: "Varastoasetusten päivitys epäonnistui",
        variant: "destructive"
      });
    }
  };

  const handleAddPart = async () => {
    if (!newPartName.trim() || !newPartPrice) return;

    try {
      await addInventoryPart.mutateAsync({
        nimi: newPartName.trim(),
        kuvaus: newPartDescription.trim() || undefined,
        hinta: parseFloat(newPartPrice),
        saldo: parseInt(newPartStock) || 0,
        minimisaldo: parseInt(newPartMinStock) || undefined,
        yksikko: newPartUnit,
        toimittaja: newPartSupplier.trim() || undefined,
        tuotekoodi: newPartCode.trim() || undefined,
        kategoria: newPartCategory.trim() || undefined,
        sisaltaa_alv: newPartIncludesVat,
        is_active: true
      });

      // Reset form
      setNewPartName("");
      setNewPartDescription("");
      setNewPartPrice("");
      setNewPartStock("");
      setNewPartMinStock("");
      setNewPartUnit("kpl");
      setNewPartSupplier("");
      setNewPartCode("");
      setNewPartCategory("");
      setNewPartIncludesVat(false);

      toast({
        title: "Varaosa lisätty",
        description: `${newPartName} on lisätty varastoon`
      });
    } catch (error) {
      toast({
        title: "Virhe",
        description: "Varaosan lisääminen epäonnistui",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPart || !editPartName.trim() || !editPartPrice) {
      toast({
        variant: "destructive",
        title: "Virhe",
        description: "Nimi ja hinta ovat pakollisia",
      });
      return;
    }

    try {
      await updateInventoryPart.mutateAsync({
        id: editingPart.id,
        nimi: editPartName.trim(),
        kuvaus: editPartDescription.trim() || null,
        hinta: parseFloat(editPartPrice),
        saldo: parseInt(editPartStock) || 0,
        minimisaldo: parseInt(editPartMinStock) || 0,
        yksikko: editPartUnit,
        toimittaja: editPartSupplier.trim() || null,
        tuotekoodi: editPartCode.trim() || null,
        kategoria: editPartCategory.trim() || null,
        sisaltaa_alv: editPartIncludesVat,
      });

      toast({
        title: "Varaosa päivitetty",
        description: "Varaosan tiedot on päivitetty onnistuneesti",
      });

      setEditingPart(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Virhe",
        description: error.message || "Varaosan päivittäminen epäonnistui",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Varastoasetukset */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <CardTitle>Varastoasetukset</CardTitle>
          </div>
          <CardDescription>
            Hallitse varaston käyttöä ja asetuksia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="inventory-enabled">Varasto käytössä</Label>
              <p className="text-sm text-muted-foreground">
                Kun varasto on käytössä, voit lisätä varaosia huoltotöihin
              </p>
            </div>
            <Switch
              id="inventory-enabled"
              checked={inventorySettings?.varasto_kaytossa || false}
              onCheckedChange={handleToggleInventory}
              disabled={updateInventorySettings.isPending}
            />
          </div>

          {inventorySettings?.varasto_kaytossa && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automaattinen saldon vähennys</Label>
                  <p className="text-sm text-muted-foreground">
                    Vähennä automaattisesti varaosia kun ne lisätään huoltoon
                  </p>
                </div>
                <Switch
                  checked={inventorySettings?.automaattinen_saldo_vahennys || false}
                  onCheckedChange={(value) => updateInventorySettings.mutate({
                    automaattinen_saldo_vahennys: value
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Varoita matalasta saldosta</Label>
                  <p className="text-sm text-muted-foreground">
                    Näytä varoitus kun varaosan saldo on alhainen
                  </p>
                </div>
                <Switch
                  checked={inventorySettings?.varoita_matalasta_saldosta || false}
                  onCheckedChange={(value) => updateInventorySettings.mutate({
                    varoita_matalasta_saldosta: value
                  })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Varaosat */}
      {inventorySettings?.varasto_kaytossa && (
        <Card>
          <CardHeader>
            <CardTitle>Varaosat</CardTitle>
            <CardDescription>
              Hallitse varastossa olevia varaosia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lisää uusi varaosa */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="partName">Nimi *</Label>
                <Input
                  id="partName"
                  placeholder="esim. Näyttö"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partPrice">Hinta (€) *</Label>
                <Input
                  id="partPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newPartPrice}
                  onChange={(e) => setNewPartPrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partStock">Saldo</Label>
                <Input
                  id="partStock"
                  type="number"
                  placeholder="0"
                  value={newPartStock}
                  onChange={(e) => setNewPartStock(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partDescription">Kuvaus</Label>
                <Input
                  id="partDescription"
                  placeholder="Valinnainen kuvaus"
                  value={newPartDescription}
                  onChange={(e) => setNewPartDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partUnit">Yksikkö</Label>
                <Select value={newPartUnit} onValueChange={setNewPartUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kpl">kpl</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="l">l</SelectItem>
                    <SelectItem value="pkt">pkt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partMinStock">Minimisaldo</Label>
                <Input
                  id="partMinStock"
                  type="number"
                  placeholder="0"
                  value={newPartMinStock}
                  onChange={(e) => setNewPartMinStock(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partSupplier">Toimittaja</Label>
                <Input
                  id="partSupplier"
                  placeholder="Toimittajan nimi"
                  value={newPartSupplier}
                  onChange={(e) => setNewPartSupplier(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partCode">Tuotekoodi</Label>
                <Input
                  id="partCode"
                  placeholder="Tuotekoodi"
                  value={newPartCode}
                  onChange={(e) => setNewPartCode(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partCategory">Kategoria</Label>
                <Input
                  id="partCategory"
                  placeholder="esim. Näytöt"
                  value={newPartCategory}
                  onChange={(e) => setNewPartCategory(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="includes-vat"
                    checked={newPartIncludesVat}
                    onCheckedChange={(checked) => setNewPartIncludesVat(!!checked)}
                  />
                  <Label htmlFor="includes-vat" className="text-sm font-medium">
                    Hinta sisältää ALV:n
                  </Label>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddPart}
                    disabled={!newPartName.trim() || !newPartPrice || addInventoryPart.isPending}
                  >
                    {addInventoryPart.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Lisätään...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Lisää varaosa
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Varaosat lista */}
            <div className="space-y-2">
              {inventoryParts?.map((part) => (
                <div key={part.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{part.nimi}</span>
                      {part.saldo <= (part.minimisaldo || 0) && part.minimisaldo && (
                        <Badge variant="destructive" className="text-xs">
                          Alhainen saldo
                        </Badge>
                      )}
                    </div>
                    {part.kuvaus && (
                      <p className="text-sm text-muted-foreground">{part.kuvaus}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Hinta: {part.hinta.toFixed(2)} € {part.sisaltaa_alv ? '(sis. ALV)' : '(+ ALV)'}</span>
                      <span>Saldo: {part.saldo} {part.yksikko}</span>
                      {part.toimittaja && <span>Toimittaja: {part.toimittaja}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingPart(part);
                        setEditPartName(part.nimi);
                        setEditPartDescription(part.kuvaus || "");
                        setEditPartPrice(part.hinta.toString());
                        setEditPartStock(part.saldo.toString());
                        setEditPartMinStock((part.minimisaldo || 0).toString());
                        setEditPartUnit(part.yksikko || "kpl");
                        setEditPartSupplier(part.toimittaja || "");
                        setEditPartCode(part.tuotekoodi || "");
                        setEditPartCategory(part.kategoria || "");
                        setEditPartIncludesVat(part.sisaltaa_alv || false);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {(!inventoryParts || inventoryParts.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ei varaosia. Lisää ensimmäinen varaosa yllä olevalla lomakkeella.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Part Dialog */}
      {editingPart && (
        <Dialog open={!!editingPart} onOpenChange={() => setEditingPart(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Muokkaa varaosaa: {editingPart.nimi}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdatePart} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nimi *</Label>
                  <Input
                    id="edit-name"
                    value={editPartName}
                    onChange={(e) => setEditPartName(e.target.value)}
                    placeholder="esim. iPhone 12 näyttö"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Kategoria</Label>
                  <Input
                    id="edit-category"
                    value={editPartCategory}
                    onChange={(e) => setEditPartCategory(e.target.value)}
                    placeholder="esim. Näytöt"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Kuvaus</Label>
                <Input
                  id="edit-description"
                  value={editPartDescription}
                  onChange={(e) => setEditPartDescription(e.target.value)}
                  placeholder="Varaosan kuvaus"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Hinta (€) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editPartPrice}
                    onChange={(e) => setEditPartPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Saldo</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editPartStock}
                    onChange={(e) => setEditPartStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-minStock">Min. saldo</Label>
                  <Input
                    id="edit-minStock"
                    type="number"
                    value={editPartMinStock}
                    onChange={(e) => setEditPartMinStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Yksikkö</Label>
                  <Input
                    id="edit-unit"
                    value={editPartUnit}
                    onChange={(e) => setEditPartUnit(e.target.value)}
                    placeholder="kpl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-supplier">Toimittaja</Label>
                  <Input
                    id="edit-supplier"
                    value={editPartSupplier}
                    onChange={(e) => setEditPartSupplier(e.target.value)}
                    placeholder="Toimittajan nimi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Tuotekoodi</Label>
                  <Input
                    id="edit-code"
                    value={editPartCode}
                    onChange={(e) => setEditPartCode(e.target.value)}
                    placeholder="ABC123"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-includes-vat"
                  checked={editPartIncludesVat}
                  onCheckedChange={(checked) => setEditPartIncludesVat(!!checked)}
                />
                <Label htmlFor="edit-includes-vat" className="text-sm font-medium">
                  Hinta sisältää ALV:n
                </Label>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingPart(null)}
                >
                  Peruuta
                </Button>
                <Button type="submit" disabled={updateInventoryPart.isPending}>
                  {updateInventoryPart.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Tallenna muutokset
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};