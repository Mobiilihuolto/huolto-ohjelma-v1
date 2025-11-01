import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CriticalStockItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
}

interface CriticalStockProps {
  items: CriticalStockItem[];
}

export function DashboardCriticalStock({ items }: CriticalStockProps) {
  const navigate = useNavigate();

  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-destructive" />
          Kriittiset varaosat
        </CardTitle>
        <CardDescription>Osat joiden määrä on vähissä</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 border rounded-lg bg-destructive/5 cursor-pointer hover:bg-destructive/10 transition-colors"
              onClick={() => navigate('/varasto')}
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Varastossa: {item.quantity} kpl (min. {item.minQuantity} kpl)
                </p>
              </div>
              <Badge variant="destructive">Tilaa lisää</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
