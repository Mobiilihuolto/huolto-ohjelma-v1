import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  Package,
  Euro,
  AlertTriangle,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StatCardsProps {
  ongoingCount: number;
  completedCount: number;
  criticalStock: Array<{ id: string; name: string; quantity: number; minQuantity: number }>;
  monthlyRevenue: number;
  unpaidInvoices: { count: number; total: number };
  totalCustomers: number;
}

export function DashboardStatCards({
  ongoingCount,
  completedCount,
  criticalStock,
  monthlyRevenue,
  unpaidInvoices,
  totalCustomers,
}: StatCardsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Käynnissä olevat</p>
              <p className="text-2xl font-bold text-warning">{ongoingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-warning" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valmiit huollot</p>
              <p className="text-2xl font-bold text-success">{completedCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </CardContent>
      </Card>

      <Card
        className={`cursor-pointer hover:bg-accent/50 transition-colors ${
          criticalStock.length === 0 ? "border-success/50" :
          criticalStock.length <= 2 ? "border-warning/50" :
          criticalStock.length <= 5 ? "border-warning" :
          "border-destructive"
        }`}
        onClick={() => navigate('/varasto?filter=critical')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Varastosaldo vähissä</p>
              <p className={`text-2xl font-bold ${
                criticalStock.length === 0 ? "text-success" :
                criticalStock.length <= 2 ? "text-warning" :
                criticalStock.length <= 5 ? "text-warning" :
                "text-destructive"
              }`}>{criticalStock.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {criticalStock.length === 0 && "✅ Kaikki osat riittävät"}
                {criticalStock.length > 0 && criticalStock.length <= 2 && "⚠️ Klikkaa nähdäksesi"}
                {criticalStock.length > 2 && criticalStock.length <= 5 && "⚠️ Katso lista →"}
                {criticalStock.length > 5 && "🔴 Tilaa lisää nyt!"}
              </p>
            </div>
            <AlertTriangle className={`h-8 w-8 ${
              criticalStock.length === 0 ? "text-success" :
              criticalStock.length <= 5 ? "text-warning" :
              "text-destructive"
            }`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kuukauden tulot</p>
              <p className="text-2xl font-bold text-primary">{monthlyRevenue.toFixed(2)} €</p>
            </div>
            <Euro className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Maksamattomat</p>
              <p className="text-2xl font-bold text-warning">{unpaidInvoices.total.toFixed(2)} €</p>
              <p className="text-xs text-muted-foreground">{unpaidInvoices.count} laskua</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-warning" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Asiakkaita yhteensä</p>
              <p className="text-2xl font-bold text-primary">{totalCustomers}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
