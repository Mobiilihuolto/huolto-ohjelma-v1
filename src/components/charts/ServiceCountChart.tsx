import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fi } from "date-fns/locale";

interface ServiceCountChartProps {
  services: any[];
}

export const ServiceCountChart = ({ services }: ServiceCountChartProps) => {
  const chartData = useMemo(() => {
    const now = new Date();
    const months = [];
    
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthServices = services.filter(service => {
        const serviceDate = new Date(service.created_at);
        return serviceDate >= monthStart && serviceDate <= monthEnd;
      });
      
      months.push({
        month: format(monthDate, "MMM", { locale: fi }),
        count: monthServices.length,
        ongoing: monthServices.filter(s => s.status === "odottaa" || s.status === "työn alla").length,
        completed: monthServices.filter(s => s.status === "valmis" || s.status === "luovutettu").length
      });
    }
    
    return months;
  }, [services]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Huoltomäärät kuukausittain</CardTitle>
        <CardDescription>Viimeisten 6 kuukauden huoltotilanne</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ongoing" fill="hsl(var(--warning))" name="Käynnissä" />
            <Bar dataKey="completed" fill="hsl(var(--success))" name="Valmiit" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
