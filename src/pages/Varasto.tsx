import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Package, AlertTriangle, Edit2, Trash2, Loader2 } from "lucide-react";
import { 
  useInventoryParts, 
  useInventorySettings, 
  useAddInventoryPart, 
  useUpdateInventoryPart,
  useDeleteInventoryPart 
} from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";

const Varasto = () => {
  const { t } = useTranslation('inventory');
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: inventorySettings } = useInventorySettings();
  const { data: inventoryParts } = useInventoryParts();
  const addInventoryPart = useAddInventoryPart();
  const updateInventoryPart = useUpdateInventoryPart();
  const deleteInventoryPart = useDeleteInventoryPart();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPart, setEditingPart] = useState<any>(null);
  const [deletingPart, setDeletingPart] = useState<any>(null);

  // Check URL parameter for critical filter
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'critical') {
      setShowCriticalOnly(true);
    }
  }, [searchParams]);
  
  // Add part form state
  const [newPartName, setNewPartName] = useState("");
  const [newPartDescription, setNewPartDescription] = useState("");
  const [newPartPrice, setNewPartPrice] = useState("");
  const [newPartCostPrice, setNewPartCostPrice] = useState("");
  const [newPartStock, setNewPartStock] = useState("");
  const [newPartMinStock, setNewPartMinStock] = useState("");
  const [newPartUnit, setNewPartUnit] = useState("kpl");
  const [newPartSupplier, setNewPartSupplier] = useState("");
  const [newPartCode, setNewPartCode] = useState("");
  const [newPartCategory, setNewPartCategory] = useState("");
  const [newPartIncludesVat, setNewPartIncludesVat] = useState(false);

  // Edit part form state
  const [editPartName, setEditPartName] = useState("");
  const [editPartDescription, setEditPartDescription] = useState("");
  const [editPartPrice, setEditPartPrice] = useState("");
  const [editPartCostPrice, setEditPartCostPrice] = useState("");
  const [editPartStock, setEditPartStock] = useState("");
  const [editPartMinStock, setEditPartMinStock] = useState("");
  const [editPartUnit, setEditPartUnit] = useState("kpl");
  const [editPartSupplier, setEditPartSupplier] = useState("");
  const [editPartCode, setEditPartCode] = useState("");
  const [editPartCategory, setEditPartCategory] = useState("");
  const [editPartIncludesVat, setEditPartIncludesVat] = useState(false);

  const resetForm = () => {
    setNewPartName("");
    setNewPartDescription("");
    setNewPartPrice("");
    setNewPartCostPrice("");
    setNewPartStock("");
    setNewPartMinStock("");
    setNewPartUnit("kpl");
    setNewPartSupplier("");
    setNewPartCode("");
    setNewPartCategory("");
    setNewPartIncludesVat(false);
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPartName.trim() || !newPartPrice) {
      toast({
        variant: "destructive",
        title: t('common:error'),
        description: t('common:nameAndPriceRequired'),
      });
      return;
    }

    // Check for duplicates
    const trimmedName = newPartName.trim().toLowerCase();
    const trimmedCode = newPartCode.trim().toLowerCase();
    
    const isDuplicate = inventoryParts?.some(part => {
      const partName = part.nimi.toLowerCase();
      const partCode = (part.tuotekoodi || '').toLowerCase();
      
      // Check if name matches
      if (partName === trimmedName) return true;
      
      // Check if product code matches (only if both are provided)
      if (trimmedCode && partCode && partCode === trimmedCode) return true;
      
      return false;
    });

    if (isDuplicate) {
      toast({
        variant: "destructive",
        title: t('common:alreadyExists'),
        description: t('common:partAlreadyExists'),
      });
      return;
    }

    try {
      await addInventoryPart.mutateAsync({
        nimi: newPartName.trim(),
        kuvaus: newPartDescription.trim() || undefined,
        hinta: parseFloat(newPartPrice),
        kustannushinta: newPartCostPrice ? parseFloat(newPartCostPrice) : null,
        saldo: parseInt(newPartStock) || 0,
        minimisaldo: parseInt(newPartMinStock) || 0,
        yksikko: newPartUnit,
        toimittaja: newPartSupplier.trim() || undefined,
        tuotekoodi: newPartCode.trim() || undefined,
        kategoria: newPartCategory.trim() || undefined,
        sisaltaa_alv: newPartIncludesVat,
        is_active: true
      });

      toast({
        title: t('partAdded'),
        description: t('common:partAddedSuccessfully'),
      });

      resetForm();
      setShowAddDialog(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Virhe",
        description: error.message || "Varaosan lisääminen epäonnistui",
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
        kuvaus: editPartDescription.trim() || undefined,
        hinta: parseFloat(editPartPrice),
        kustannushinta: editPartCostPrice ? parseFloat(editPartCostPrice) : null,
        saldo: parseInt(editPartStock) || 0,
        minimisaldo: parseInt(editPartMinStock) || 0,
        yksikko: editPartUnit,
        toimittaja: editPartSupplier.trim() || undefined,
        tuotekoodi: editPartCode.trim() || undefined,
        kategoria: editPartCategory.trim() || undefined,
        sisaltaa_alv: editPartIncludesVat,
      });

      toast({
        title: t('partUpdated'),
        description: t('common:partUpdatedSuccessfully'),
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

  const filteredParts = inventoryParts?.filter(part => {
    // Filter by search query
    const matchesSearch = part.nimi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.kategoria?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.toimittaja?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by critical stock if enabled
    const matchesCritical = !showCriticalOnly || part.saldo <= (part.minimisaldo || 0);
    
    return matchesSearch && matchesCritical;
  });

  if (!inventorySettings?.varasto_kaytossa) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('common:managePartsAndStock')}</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('common:inventoryNotEnabled')}</CardTitle>
            <CardDescription>
              {t('common:enableInventoryInSettings')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('common:managePartsAndStock')}</p>
          </div>
          <Button 
            onClick={() => {
              console.log("Lisää varaosa nappia painettu!");
              setShowAddDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('addPart')}
          </Button>
        </div>

        {/* Yhteenveto */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('common:totalParts')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryParts?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('inStock')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventoryParts?.filter(part => part.saldo > 0).length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('lowStock')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventoryParts?.filter(part => part.saldo <= (part.minimisaldo || 0)).length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('common:totalValue')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventoryParts?.reduce((sum, part) => sum + (part.saldo * part.hinta), 0).toFixed(2)} €
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Haku ja suodattimet */}
        <div className="flex items-center space-x-2">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          {showCriticalOnly && (
            <Badge 
              variant="destructive" 
              className="cursor-pointer"
              onClick={() => {
                setShowCriticalOnly(false);
                setSearchParams({});
              }}
            >
              {t('common:showingCriticalOnly')} ✕
            </Badge>
          )}
        </div>

        {/* Varaosat taulukko */}
        <Card>
          <CardHeader>
            <CardTitle>{t('common:parts')}</CardTitle>
            <CardDescription>
              {t('common:managePartsStockAndInfo')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('partName')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('price')}</TableHead>
                  <TableHead>{t('quantity')}</TableHead>
                  <TableHead>{t('minQuantity')}</TableHead>
                  <TableHead>{t('supplier')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts?.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{part.nimi}</div>
                        {part.kuvaus && (
                          <div className="text-sm text-muted-foreground">{part.kuvaus}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {part.kategoria && (
                        <Badge variant="secondary">{part.kategoria}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{part.hinta.toFixed(2)} €</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={part.saldo <= (part.minimisaldo || 0) ? "text-destructive font-medium" : ""}>
                          {part.saldo} {part.yksikko}
                        </span>
                        {part.saldo <= (part.minimisaldo || 0) && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{part.minimisaldo || 0} {part.yksikko}</TableCell>
                    <TableCell>{part.toimittaja || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            console.log("Muokkaa nappia painettu:", part.nimi);
                            setEditingPart(part);
                            // Pre-fill edit form with current values
                            setEditPartName(part.nimi);
                            setEditPartDescription(part.kuvaus || "");
                            setEditPartPrice(part.hinta.toString());
                            setEditPartCostPrice(part.kustannushinta?.toString() || "");
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setDeletingPart(part);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {(!filteredParts || filteredParts.length === 0) && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">{t('noParts')}</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? t('common:noPartsMatchingSearch') : t('addFirstPart')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Part Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('addPart')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPart} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('partName')} *</Label>
                <Input
                  id="name"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  placeholder="esim. iPhone 12 näyttö"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t('category')}</Label>
                <Input
                  id="category"
                  value={newPartCategory}
                  onChange={(e) => setNewPartCategory(e.target.value)}
                  placeholder="esim. Näytöt"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Kuvaus</Label>
              <Input
                id="description"
                value={newPartDescription}
                onChange={(e) => setNewPartDescription(e.target.value)}
                placeholder="Varaosan kuvaus"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Hinta (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newPartPrice}
                  onChange={(e) => setNewPartPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">Kustannushinta (€)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={newPartCostPrice}
                  onChange={(e) => setNewPartCostPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Saldo</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newPartStock}
                  onChange={(e) => setNewPartStock(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Min. saldo</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={newPartMinStock}
                  onChange={(e) => setNewPartMinStock(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Yksikkö</Label>
                <Input
                  id="unit"
                  value={newPartUnit}
                  onChange={(e) => setNewPartUnit(e.target.value)}
                  placeholder="kpl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Toimittaja</Label>
                <Input
                  id="supplier"
                  value={newPartSupplier}
                  onChange={(e) => setNewPartSupplier(e.target.value)}
                  placeholder="Toimittajan nimi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Tuotekoodi</Label>
                <Input
                  id="code"
                  value={newPartCode}
                  onChange={(e) => setNewPartCode(e.target.value)}
                  placeholder="ABC123"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-vat"
                checked={newPartIncludesVat}
                onCheckedChange={(checked) => setNewPartIncludesVat(!!checked)}
              />
              <Label htmlFor="includes-vat" className="text-sm font-medium">
                Hinta sisältää ALV:n
              </Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowAddDialog(false);
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

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="edit-costPrice">Kustannushinta (€)</Label>
                  <Input
                    id="edit-costPrice"
                    type="number"
                    step="0.01"
                    value={editPartCostPrice}
                    onChange={(e) => setEditPartCostPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPart} onOpenChange={(open) => !open && setDeletingPart(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Poista varaosa</AlertDialogTitle>
            <AlertDialogDescription>
              Haluatko varmasti poistaa varaosan <strong>{deletingPart?.nimi}</strong>?
              Tämä toiminto ei poista varaosaa pysyvästi, vaan merkitsee sen pois käytöstä.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Peruuta</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deletingPart) return;
                
                try {
                  await deleteInventoryPart.mutateAsync(deletingPart.id);
                  toast({
                    title: "Varaosa poistettu",
                    description: "Varaosa on merkitty pois käytöstä",
                  });
                  setDeletingPart(null);
                } catch (error: any) {
                  toast({
                    variant: "destructive",
                    title: "Virhe",
                    description: error.message || "Varaosan poistaminen epäonnistui",
                  });
                }
              }}
            >
              Poista
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Varasto;