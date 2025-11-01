import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fi } from "date-fns/locale";
import { TrendingUp, TrendingDown } from "lucide-react";

interface RevenueTrendChartProps {
  invoices: any[];
}

export const RevenueTrendChart = ({ invoices }: RevenueTrendChartProps) => {
  const { chartData, trend } = useMemo(() => {
    const now = new Date();
    const months = [];
    
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.laskun_pvm);
        return invoiceDate >= monthStart && invoiceDate <= monthEnd;
      });
      
      const revenue = monthInvoices.reduce((sum, inv) => sum + (inv.kokonaissumma || 0), 0);
      
      months.push({
        month: format(monthDate, "MMM", { locale: fi }),
        revenue: Math.round(revenue * 100) / 100
      });
    }
    
    // Calculate trend
    const lastMonth = months[months.length - 1]?.revenue || 0;
    const prevMonth = months[months.length - 2]?.revenue || 0;
    const trendValue = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;
    
    return { 
      chartData: months, 
      trend: { value: trendValue, isPositive: trendValue >= 0 } 
    };
  }, [invoices]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Laskutuksen trendi</span>
          <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
            {trend.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(trend.value).toFixed(1)}%
          </div>
        </CardTitle>
        <CardDescription>Kuukausittainen laskutus (viimeiset 6 kk)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `${value} €`} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Laskutus"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
