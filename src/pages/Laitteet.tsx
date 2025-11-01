import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, AlertCircle } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import { DeviceForm } from "@/components/DeviceForm";
import { DeviceCard } from "@/components/DeviceCard";
import { useTranslation } from 'react-i18next';

const Laitteet = () => {
  const { t } = useTranslation(['devices', 'common']);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const { data: devices, isLoading, error } = useDevices(searchTerm);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">{t('common:loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-destructive">{t('common:error')}</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{t('devices:title')}</h1>
          <p className="text-muted-foreground">{t('devices:searchPlaceholder')}</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowDeviceForm(true)}
        >
          <Plus className="h-4 w-4" />
          {t('devices:addDevice')}
        </Button>
      </div>

      {/* Hakukenttä */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('devices:searchPlaceholder')}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Laiteluettelo */}
      {devices && devices.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm ? t('devices:noDevices') : t('devices:addFirstDevice')}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowDeviceForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('devices:addFirstDevice')}
            </Button>
          )}
        </div>
      )}

      <DeviceForm 
        open={showDeviceForm} 
        onOpenChange={setShowDeviceForm} 
      />
    </div>
  );
};

export default Laitteet;