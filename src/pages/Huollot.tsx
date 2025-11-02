import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  PlayCircle,
  StopCircle,
  Calendar,
  User,
  Wrench,
  Euro,
  Loader2,
  Printer,
  Building2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useServices, useUpdateService } from "@/hooks/useServices";
import { useServiceStatuses } from "@/hooks/useServiceStatuses";
import { useDevices } from "@/hooks/useDevices";
import { useServiceTimer } from "@/hooks/useServiceTimer";
import { ServiceEditForm } from "@/components/ServiceEditForm";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { ServiceForm } from "@/components/ServiceForm";
import { ServiceTimer } from "@/components/ServiceTimer";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";

const getStatusBadge = (status: string, statuses: any[]) => {
  const statusDef = statuses?.find(s => 
    s.name.toLowerCase().trim() === status.toLowerCase().trim()
  );
  const color = statusDef?.color || '#6b7280';
  
  return (
    <Badge 
      style={{ backgroundColor: color, color: '#ffffff' }}
      className="border-0"
    >
      {statusDef?.name || status}
    </Badge>
  );
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "odottaa":
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    case "työn alla":
      return <Clock className="h-4 w-4 text-warning" />;
    case "valmis":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "luovutettu":
      return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const Huollot = () => {
  const { t } = useTranslation('services');
  const { canManageServices } = useUserPermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<"kaikki" | "työn alla" | "valmiit">("kaikki");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: servicesData, isLoading, error } = useServices();
  const { data: statusesData } = useServiceStatuses();
  const { data: devices } = useDevices();
  const updateService = useUpdateService();

  // Get device filter from URL
  const deviceIdFilter = searchParams.get('laite');
  const selectedDevice = devices?.find(d => d.id === deviceIdFilter);

  // Read search term from URL on mount
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(decodeURIComponent(searchFromUrl));
    }
  }, [searchParams]);

  // Update page title when filtering by device
  useEffect(() => {
    if (selectedDevice) {
      document.title = `${selectedDevice.merkki} ${selectedDevice.malli} - Huoltohistoria`;
    }
  }, [selectedDevice]);

  const handleStatusUpdate = (serviceId: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    
    // Add timestamps when marking as completed or delivered
    if (newStatus === 'valmis') {
      updates.valmistunut_pvm = new Date().toISOString();
    } else if (newStatus === 'luovutettu') {
      updates.luovutettu_pvm = new Date().toISOString();
    }
    
    updateService.mutate({ id: serviceId, updates });
  };

  // Get next status in workflow
  const getNextStatus = (currentStatus: string) => {
    if (!statusesData) return null;
    
    const orderedStatuses = statusesData.sort((a, b) => a.order_index - b.order_index);
    const currentIndex = orderedStatuses.findIndex(s => s.name === currentStatus);
    
    if (currentIndex === -1 || currentIndex >= orderedStatuses.length - 1) return null;
    return orderedStatuses[currentIndex + 1];
  };

  const handleEditService = (service: any) => {
    // Find the original service data with full relationships
    const originalService = servicesData?.find(s => s.id === service.id);
    setEditingService(originalService || service);
    setShowEditForm(true);
  };

  const handleToggleTimer = (serviceId: string, isRunning: boolean) => {
    const service = servicesData?.find(s => s.id === serviceId);
    if (!service) return;

    if (isRunning) {
      // Stop timer
      updateService.mutate({
        id: serviceId,
        updates: {
          ajanlaskuri_kaynnissa: false,
          tyoaika_minuutit: service.tyoaika_minuutit || 0
        }
      });
    } else {
      // Start timer
      updateService.mutate({
        id: serviceId,
        updates: {
          ajanlaskuri_kaynnissa: true,
          ajanlaskuri_aloitettu_pvm: new Date().toISOString()
        }
      });
    }
  };

  const handleAddParts = (serviceId: string) => {
    // TODO: Implement parts management
    alert('Osien lisäys (toiminto tulossa pian)');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('common:loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{t('common:error')}: {error.message}</p>
      </div>
    );
  }

  // Map database data to expected format
  const allServices = servicesData?.map((service) => ({
    id: service.id,
    numero: service.numero || service.id.slice(0, 8),
    customer: service.asiakkaat?.nimi || "Tuntematon asiakas",
    asiakas_tyyppi: service.asiakkaat?.tyyppi,
    yrityksen_nimi: service.asiakkaat?.yrityksen_nimi,
    device: service.laitteet
      ? (service.laitteet.malli?.startsWith(service.laitteet.merkki || "") 
          ? service.laitteet.malli 
          : `${service.laitteet.merkki || ""} ${service.laitteet.malli || ""}`.trim())
      : `${service.merkki || ""} ${service.malli || ""}`.trim() || "Tuntematon laite",
    issue: service.kuvaus || "Ei kuvausta",
    status: service.status || "odottaa", // Use actual status from database
    technician: service.tekniikat?.nimi || null, // Add technician name
    estimatedCompletion: (() => {
      try {
        if (service.arvioitu_valmistumispvm) {
          const date = new Date(service.arvioitu_valmistumispvm);
          if (!isNaN(date.getTime())) {
            return format(date, "dd.MM.yyyy", { locale: fi });
          }
        }
        return null;
      } catch (error) {
        return null;
      }
    })(),
    startDate: (() => {
      try {
        if (service.created_at) {
          const date = new Date(service.created_at);
          if (!isNaN(date.getTime())) {
            return format(date, "dd.MM.yyyy", { locale: fi });
          }
        }
        return "Tuntematon päivä";
      } catch (error) {
        return "Tuntematon päivä";
      }
    })(),
    completedDate: (() => {
      try {
        if (service.valmistunut_pvm) {
          const date = new Date(service.valmistunut_pvm);
          if (!isNaN(date.getTime())) {
            return format(date, "dd.MM.yyyy", { locale: fi });
          }
        }
        return undefined;
      } catch (error) {
        return undefined;
      }
    })(),
    deliveredDate: (() => {
      try {
        if (service.luovutettu_pvm) {
          const date = new Date(service.luovutettu_pvm);
          if (!isNaN(date.getTime())) {
            return format(date, "dd.MM.yyyy", { locale: fi });
          }
        }
        return undefined;
      } catch (error) {
        return undefined;
      }
    })(),
    cost: (() => {
      let baseCost = 0;
      
      // Calculate base cost (labor)
      if (service.hinnoittelu_tyyppi === 'kertamaksu' && service.kiintea_hinta) {
        baseCost = Number(service.kiintea_hinta);
      } else if (service.hinnoittelu_tyyppi === 'tuntiveloitus' && service.tuntihinta && service.tyoaika_minuutit) {
        const hours = service.tyoaika_minuutit / 60;
        baseCost = Number(service.tuntihinta) * hours;
      }
      
      // Add parts cost
      const partsCost = (service.huolto_varaosat || []).reduce((sum, part) => {
        return sum + (part.maara * part.yksikkohinta);
      }, 0);
      
      return baseCost + partsCost;
    })(),
    timeSpent: (() => {
      const minutes = service.tyoaika_minuutit || 0;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}min`;
    })(),
    warranty: (() => {
      const workWarranty = service.tyotakuu_kuukautta || 0;
      const partsWarranty = service.osatakuu_kuukautta || 0;
      
      if (workWarranty > 0 || partsWarranty > 0) {
        const warranties = [];
        if (workWarranty > 0) warranties.push(`Työtakuu ${workWarranty} kk`);
        if (partsWarranty > 0) warranties.push(`Osatakuu ${partsWarranty} kk`);
        return warranties.join(', ');
      }
      return null;
    })(),
    isTimerRunning: service.ajanlaskuri_kaynnissa || false,
    tyoaika_minuutit: service.tyoaika_minuutit || 0
  })) || [];

  // Apply search filter
  let searchFiltered = allServices.filter(service => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      service.customer.toLowerCase().includes(searchLower) ||
      service.device.toLowerCase().includes(searchLower) ||
      service.issue.toLowerCase().includes(searchLower)
    );
  });

  // Apply device filter if specified in URL
  if (deviceIdFilter) {
    searchFiltered = searchFiltered.filter(service => {
      // Check if service is linked to the specific device
      const linkedService = servicesData?.find(s => s.id === service.id);
      if (linkedService?.laite_id === deviceIdFilter) {
        return true;
      }
      
      // Also check by brand and model if device exists
      if (selectedDevice) {
        const serviceBrand = linkedService?.merkki?.toLowerCase();
        const serviceModel = linkedService?.malli?.toLowerCase();
        const deviceBrand = selectedDevice.merkki?.toLowerCase();
        const deviceModel = selectedDevice.malli?.toLowerCase();
        
        return serviceBrand === deviceBrand && serviceModel === deviceModel;
      }
      
      return false;
    });
  }

  // Filter services based on active filter
  const services = searchFiltered
    .filter(service => {
      if (activeFilter === "työn alla") return service.status === "odottaa" || service.status === "työn alla";
      if (activeFilter === "valmiit") return service.status === "valmis" || service.status === "luovutettu";
      return true; // "kaikki" shows all
    })
    .sort((a, b) => {
      // Sort so that completed services (valmis, luovutettu) appear last
      const aIsCompleted = a.status === "valmis" || a.status === "luovutettu";
      const bIsCompleted = b.status === "valmis" || b.status === "luovutettu";
      
      if (aIsCompleted && !bIsCompleted) return 1;
      if (!aIsCompleted && bIsCompleted) return -1;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">
            {selectedDevice ? `${selectedDevice.merkki} ${selectedDevice.malli} - ${t('common:serviceHistory')}` : t('title')}
          </h1>
          <p className="text-muted-foreground">
            {selectedDevice 
              ? `${t('common:allServicesFor')} ${selectedDevice.merkki} ${selectedDevice.malli}`
              : t('common:trackServiceProgress')
            }
          </p>
        </div>
        {canManageServices && (
          <Button className="flex items-center gap-2" onClick={() => setShowServiceForm(true)}>
            <Plus className="h-4 w-4" />
            {t('addService')}
          </Button>
        )}
      </div>

      {!canManageServices && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('common:viewOnlyPermission')}
          </AlertDescription>
        </Alert>
      )}

      {/* Hakukenttä ja suodattimet */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('searchPlaceholder')} 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant={activeFilter === "työn alla" ? "default" : "outline"}
              onClick={() => setActiveFilter("työn alla")}
              className={activeFilter === "työn alla" ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}
            >
              {t('common:inProgress')}
            </Button>
            <Button 
              variant={activeFilter === "valmiit" ? "default" : "outline"}
              onClick={() => setActiveFilter("valmiit")}
              className={activeFilter === "valmiit" ? "bg-success text-success-foreground hover:bg-success/90" : ""}
            >
              {t('common:completed')}
            </Button>
            <Button 
              variant={activeFilter === "kaikki" ? "default" : "outline"}
              onClick={() => setActiveFilter("kaikki")}
            >
              {t('common:all')}
            </Button>
          </div>
          
          {/* Show filter results count */}
          {(searchTerm.trim() || activeFilter !== "kaikki" || deviceIdFilter) && (
            <div className="mt-2 text-sm text-muted-foreground">
              {services.length === 0 ? (
                t('common:noResults')
              ) : (
                `${services.length} ${t('common:servicesFound')}`
              )}
              {searchTerm.trim() && ` ${t('common:forSearch')} "${searchTerm}"`}
              {activeFilter !== "kaikki" && ` (${activeFilter})`}
              {deviceIdFilter && selectedDevice && ` ${t('common:forDevice')} ${selectedDevice.merkki} ${selectedDevice.malli}`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Huoltoluettelo */}
      <div className="space-y-4">
        {services.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">{t('noServices')}</p>
            </CardContent>
          </Card>
        ) : (
          services.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <CardTitle className="text-lg">
                        {service.asiakas_tyyppi === 'yritys' && service.yrityksen_nimi ? (
                          <>
                            <Building2 className="inline-block w-4 h-4 mr-1" />
                            {service.yrityksen_nimi} ({service.customer})
                          </>
                        ) : (
                          service.customer
                        )} - {service.numero}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Wrench className="h-3 w-3" />
                        {t('device')}: {service.device} • {t('issue')}: {service.issue}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(service.status, statusesData || [])}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/huollot/${service.id}/kaavake`)}
                      title="Avaa huoltokaavake"
                      className="gap-1"
                    >
                      <Printer className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('viewForm')}</span>
                    </Button>
                    {canManageServices && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditService(service)}
                      >
                        {t('edit')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t('startDate')}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {service.startDate}
                    </div>
                  </div>
                  
                  {service.estimatedCompletion && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Arvioitu korjauksen valmistuminen</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {service.estimatedCompletion}
                      </div>
                    </div>
                  )}
                  
                  {service.technician && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Teknikko</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {service.technician}
                      </div>
                    </div>
                  )}
                  
                  {service.completedDate && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Valmistunut</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3" />
                        {service.completedDate}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Käytetty aika</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className={`text-sm font-medium ${service.isTimerRunning ? 'text-green-600' : ''}`}>
                        <ServiceTimer 
                          serviceId={service.id}
                          initialMinutes={service.tyoaika_minuutit}
                          isRunning={service.isTimerRunning}
                        />
                      </span>
                      {service.isTimerRunning && (
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      )}
                       {service.status === "työn alla" && (
                         <div className="flex gap-1">
                           {service.isTimerRunning ? (
                             <Button 
                               size="sm" 
                               variant="outline" 
                               className="h-6 px-2 border-red-300 hover:bg-red-50"
                               onClick={() => handleToggleTimer(service.id, true)}
                               title="Pysäytä timer"
                             >
                               <StopCircle className="h-3 w-3 text-red-500" />
                             </Button>
                           ) : (
                             <Button 
                               size="sm" 
                               variant="outline" 
                               className="h-6 px-2 border-green-300 hover:bg-green-50"
                               onClick={() => handleToggleTimer(service.id, false)}
                               title="Käynnistä timer"
                             >
                               <PlayCircle className="h-3 w-3 text-green-500" />
                             </Button>
                           )}
                         </div>
                       )}
                    </div>
                  </div>
                  
                  {service.warranty && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Takuu</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3" />
                        {service.warranty}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Kustannus</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Euro className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{service.cost}€</span>
                    </div>
                  </div>
                </div>
                
                {/* Dynamic status action buttons */}
                {canManageServices && (() => {
                  const nextStatus = getNextStatus(service.status);
                  if (!nextStatus) return null;
                  
                  return (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusUpdate(service.id, nextStatus.name)}
                        disabled={updateService.isPending}
                        style={{ backgroundColor: nextStatus.color, borderColor: nextStatus.color }}
                        className="text-white hover:opacity-90"
                      >
                        {nextStatus.name === 'työn alla' ? 'Aloita työ' :
                         nextStatus.name === 'valmis' ? 'Merkitse valmiiksi' :
                         nextStatus.name === 'luovutettu' ? 'Luovuta asiakkaalle' :
                         `Siirry tilaan: ${nextStatus.name}`}
                      </Button>
                       {service.status === "työn alla" && (
                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={() => handleAddParts(service.id)}
                         >
                           Lisää osia
                         </Button>
                       )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ServiceForm 
        open={showServiceForm} 
        onOpenChange={setShowServiceForm} 
      />

      <ServiceEditForm 
        open={showEditForm} 
        onOpenChange={setShowEditForm}
        service={editingService}
      />
    </div>
  );
};

export default Huollot;