import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useManufacturers, useAddManufacturer, useUpdateManufacturer, useDeleteManufacturer } from "@/hooks/useManufacturers";
import { Loader2, Plus, Pencil, Trash2, Check, X, ChevronUp, ChevronDown } from "lucide-react";

export const ManufacturersSettingsForm = () => {
  const { data: manufacturers, isLoading } = useManufacturers();
  const addManufacturer = useAddManufacturer();
  const updateManufacturer = useUpdateManufacturer();
  const deleteManufacturer = useDeleteManufacturer();

  const [newManufacturerName, setNewManufacturerName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAdd = async () => {
    if (!newManufacturerName.trim()) return;
    
    const maxOrderIndex = manufacturers?.reduce((max, m) => Math.max(max, m.order_index), 0) || 0;
    
    await addManufacturer.mutateAsync({
      nimi: newManufacturerName.trim(),
      order_index: maxOrderIndex + 1,
    });
    
    setNewManufacturerName("");
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return;
    
    await updateManufacturer.mutateAsync({
      id: editingId,
      updates: { nimi: editingName.trim() },
    });
    
    setEditingId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Haluatko varmasti poistaa tämän valmistajan?")) {
      await deleteManufacturer.mutateAsync(id);
    }
  };

  const handleMoveUp = async (id: string, currentIndex: number) => {
    if (currentIndex === 0) return;
    
    const sortedManufacturers = [...(manufacturers || [])].sort((a, b) => a.order_index - b.order_index);
    const currentManufacturer = sortedManufacturers.find(m => m.id === id);
    const previousManufacturer = sortedManufacturers[currentIndex - 1];
    
    if (!currentManufacturer || !previousManufacturer) return;
    
    await Promise.all([
      updateManufacturer.mutateAsync({
        id: currentManufacturer.id,
        updates: { order_index: previousManufacturer.order_index },
      }),
      updateManufacturer.mutateAsync({
        id: previousManufacturer.id,
        updates: { order_index: currentManufacturer.order_index },
      }),
    ]);
  };

  const handleMoveDown = async (id: string, currentIndex: number) => {
    const sortedManufacturers = [...(manufacturers || [])].sort((a, b) => a.order_index - b.order_index);
    if (currentIndex === sortedManufacturers.length - 1) return;
    
    const currentManufacturer = sortedManufacturers.find(m => m.id === id);
    const nextManufacturer = sortedManufacturers[currentIndex + 1];
    
    if (!currentManufacturer || !nextManufacturer) return;
    
    await Promise.all([
      updateManufacturer.mutateAsync({
        id: currentManufacturer.id,
        updates: { order_index: nextManufacturer.order_index },
      }),
      updateManufacturer.mutateAsync({
        id: nextManufacturer.id,
        updates: { order_index: currentManufacturer.order_index },
      }),
    ]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sortedManufacturers = [...(manufacturers || [])].sort((a, b) => a.order_index - b.order_index);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Laitevalmistajat</CardTitle>
        <CardDescription>
          Hallitse laitevalmistajien luetteloa. Nämä valmistajat näkyvät pudotusvalikossa huoltotyötä luotaessa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new manufacturer */}
        <div className="space-y-2">
          <Label htmlFor="newManufacturer">Lisää uusi valmistaja</Label>
          <div className="flex gap-2">
            <Input
              id="newManufacturer"
              placeholder="esim. Apple"
              value={newManufacturerName}
              onChange={(e) => setNewManufacturerName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={!newManufacturerName.trim() || addManufacturer.isPending}>
              {addManufacturer.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Lisää
            </Button>
          </div>
        </div>

        {/* List of manufacturers */}
        <div className="space-y-2">
          <Label>Valmistajat</Label>
          <div className="space-y-2">
            {sortedManufacturers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ei valmistajia</p>
            ) : (
              sortedManufacturers.map((manufacturer, index) => (
                <div key={manufacturer.id} className="flex items-center gap-2 p-2 border rounded-md">
                  {editingId === manufacturer.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                        className="flex-1"
                      />
                      <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{manufacturer.nimi}</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveUp(manufacturer.id, index)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveDown(manufacturer.id, index)}
                          disabled={index === sortedManufacturers.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(manufacturer.id, manufacturer.nimi)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(manufacturer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
