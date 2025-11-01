import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";

interface Service {
  id: string;
  customer: string;
  device: string;
  issue: string;
  startDate: string;
  status: string;
}

interface ServicesListProps {
  services: Service[];
  type: "ongoing" | "completed";
  onServiceClick: (serviceId: string) => void;
}

export function DashboardServicesList({
  services,
  type,
  onServiceClick,
}: ServicesListProps) {
  const isOngoing = type === "ongoing";
  const title = isOngoing ? "Käynnissä olevat huollot" : "Valmiit huollot";
  const icon = isOngoing ? Clock : CheckCircle;
  const iconColor = isOngoing ? "text-warning" : "text-success";
  const bgColor = isOngoing ? "bg-warning/5 hover:bg-warning/10" : "bg-success/5 hover:bg-success/10";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon === Clock ? (
            <Clock className={`h-5 w-5 ${iconColor}`} />
          ) : (
            <CheckCircle className={`h-5 w-5 ${iconColor}`} />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {isOngoing ? "Ei käynnissä olevia huoltoja" : "Ei valmiita huoltoja"}
            </p>
          ) : (
            services.slice(0, 5).map((service) => (
              <div
                key={service.id}
                className={`p-3 border rounded-lg ${bgColor} cursor-pointer transition-colors`}
                onClick={() => onServiceClick(service.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{service.customer}</p>
                    <p className="text-sm text-muted-foreground">{service.device}</p>
                    <p className="text-sm">{service.issue}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <Badge
                      variant="secondary"
                      className={
                        service.status === 'työn alla'
                          ? 'bg-warning text-warning-foreground'
                          : service.status === 'odottaa'
                          ? 'border-muted-foreground'
                          : service.status === 'valmis'
                          ? 'text-success border-success'
                          : service.status === 'luovutettu'
                          ? 'bg-success text-success-foreground'
                          : ''
                      }
                    >
                      {service.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{service.startDate}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
