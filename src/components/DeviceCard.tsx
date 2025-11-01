import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Laptop, 
  Wrench,
  Calendar,
  User,
  Loader2,
  Edit
} from "lucide-react";
import { useDeviceServiceCount, useLastServiceDate } from "@/hooks/useDevices";
import { DeviceForm } from "@/components/DeviceForm";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

type Device = {
  id: string;
  sarjanumero: string | null;
  malli: string | null;
  merkki: string | null;
  // asiakkaat-kenttä poistettu koska laitteet ovat nyt yleisiä
};

interface DeviceCardProps {
  device: Device;
}

const getDeviceIcon = (model: string | null) => {
  if (!model) return Wrench;
  const modelLower = model.toLowerCase();
  if (modelLower.includes('iphone') || modelLower.includes('galaxy') || modelLower.includes('pixel')) {
    return Smartphone;
  }
  if (modelLower.includes('thinkpad') || modelLower.includes('laptop') || modelLower.includes('macbook')) {
    return Laptop;
  }
  return Wrench;
};

export const DeviceCard = ({ device }: DeviceCardProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const { data: serviceCount, isLoading: loadingServiceCount } = useDeviceServiceCount(device.id);
  const { data: lastServiceDate, isLoading: loadingLastService } = useLastServiceDate(device.id);
  const navigate = useNavigate();
  
  const DeviceIcon = getDeviceIcon(device.malli);

  const formatServiceDate = (dateString: string | null) => {
    if (!dateString) return "Ei huoltoja";
    try {
      return format(new Date(dateString), "d.M.yyyy", { locale: fi });
    } catch {
      return "Ei huoltoja";
    }
  };

  const handleHistoryClick = () => {
    // Siirry huollot-sivulle ja suodata laitteen mukaan
    navigate(`/huollot?laite=${device.id}`);
  };

  return (
    <>
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DeviceIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{device.malli || "Tuntematon malli"}</CardTitle>
              <CardDescription>{device.merkki || "Tuntematon valmistaja"}</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditForm(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Badge variant="default">Käytössä</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-medium">Sarjanumero/mallikoodi:</p>
            <p className="text-muted-foreground font-mono">
              {device.sarjanumero || "Ei tietoa"}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Yleinen laite</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              Viimeisin huolto: {' '}
              {loadingLastService ? (
                <Loader2 className="h-3 w-3 animate-spin inline" />
              ) : (
                formatServiceDate(lastServiceDate)
              )}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-center">
            {loadingServiceCount ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              <>
                <p className="text-sm font-medium">{serviceCount || 0}</p>
                <p className="text-xs text-muted-foreground">Huoltoa</p>
              </>
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleHistoryClick}>
              Historia
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <DeviceForm
      open={showEditForm}
      onOpenChange={setShowEditForm}
      device={device}
    />
    </>
  );
};