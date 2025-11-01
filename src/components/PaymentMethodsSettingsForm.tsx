import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  usePaymentMethods,
  useAddPaymentMethod,
  useDeletePaymentMethod,
} from "@/hooks/usePaymentMethods";

export const PaymentMethodsSettingsForm = () => {
  const [newMethodName, setNewMethodName] = useState("");
  const { data: paymentMethods, isLoading } = usePaymentMethods();
  const addMutation = useAddPaymentMethod();
  const deleteMutation = useDeletePaymentMethod();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethodName.trim()) return;
    
    addMutation.mutate(newMethodName.trim());
    setNewMethodName("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Haluatko varmasti poistaa tämän maksutavan?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maksutavat</CardTitle>
        <CardDescription>
          Hallitse maksutapoja jotka näkyvät laskuissa ja kuitteissa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new payment method */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="newMethod" className="sr-only">
              Uusi maksutapa
            </Label>
            <Input
              id="newMethod"
              placeholder="Esim. Lasku, Paytrail, Swish..."
              value={newMethodName}
              onChange={(e) => setNewMethodName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={addMutation.isPending || !newMethodName.trim()}>
            {addMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Lisää
              </>
            )}
          </Button>
        </form>

        {/* List of payment methods */}
        <div className="space-y-2">
          <Label>Käytettävissä olevat maksutavat:</Label>
          <div className="space-y-2">
            {paymentMethods && paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                >
                  <span className="font-medium">{method.nimi}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Ei maksutapoja.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
