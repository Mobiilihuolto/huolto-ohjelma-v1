import { Loader2, Pencil, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useServices } from "@/hooks/useServices";
import { useDevices } from "@/hooks/useDevices";
import { useCustomers } from "@/hooks/useCustomers";
import { useInventoryParts, useInventorySettings } from "@/hooks/useInventory";
import { useInvoices } from "@/hooks/useInvoices";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { ServiceForm } from "@/components/ServiceForm";
import CustomerForm from "@/components/CustomerForm";
import { DeviceForm } from "@/components/DeviceForm";
import { ServiceEditForm } from "@/components/ServiceEditForm";
import { useTranslation } from 'react-i18next';
import { DashboardQuickSearch } from "@/components/DashboardQuickSearch";
import { DashboardStatCards } from "@/components/DashboardStatCards";
import { DashboardServicesList } from "@/components/DashboardServicesList";
import { DashboardCriticalStock } from "@/components/DashboardCriticalStock";
import { ServiceCountChart } from "@/components/charts/ServiceCountChart";
import { RevenueTrendChart } from "@/components/charts/RevenueTrendChart";

const Dashboard = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const navigate = useNavigate();

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('dashboard-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);
  
  const { data: servicesData, isLoading: servicesLoading, isError: servicesError } = useServices();
  const { data: devicesData, isLoading: devicesLoading, isError: devicesError } = useDevices();
  const { data: customersData, isLoading: customersLoading, isError: customersError } = useCustomers();
  const { data: inventoryParts, isLoading: inventoryLoading, isError: inventoryError } = useInventoryParts();
  const { data: inventorySettings, isLoading: inventorySettingsLoading, isError: inventorySettingsError } = useInventorySettings();
  const { data: invoicesData, isLoading: invoicesLoading, isError: invoicesError } = useInvoices();

  // Process services data for dashboard display (useMemo to prevent recreation on every render)
  const processedServices = useMemo(() => {
    return servicesData?.map((service) => ({
      id: service.id,
      customer: service.asiakkaat?.nimi || "Tuntematon asiakas",
      device: service.laitteet ? `${service.laitteet.merkki || ""} ${service.laitteet.malli || ""}`.trim() : service.merkki || "Tuntematon laite",
      issue: service.kuvaus || "Ei kuvausta",
      startDate: (() => {
        try {
          if (service.created_at) {
            const date = new Date(service.created_at);
            if (!isNaN(date.getTime())) {
              return format(date, "dd.MM", { locale: fi });
            }
          }
          return "??";
        } catch (error) {
          return "??";
        }
      })(),
      status: service.status || "odottaa" // Use actual status from database
    })) || [];
  }, [servicesData]);

  // Filter services by status (useMemo for performance)
  const { ongoingServices, completedServices } = useMemo(() => {
    const ongoing = processedServices.filter(service => 
      service.status === 'odottaa' || service.status === 'työn alla'
    );
    const completed = processedServices.filter(service => 
      service.status === 'valmis' || service.status === 'luovutettu'
    );
    return { ongoingServices: ongoing, completedServices: completed };
  }, [processedServices]);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return { customers: [], devices: [], services: [] };
    
    const term = searchTerm.toLowerCase();
    
    // Search customers
    const customers = (customersData || [])
      .filter(customer => 
        customer.nimi?.toLowerCase().includes(term) ||
        customer.email?.toLowerCase().includes(term) ||
        customer.puhelin?.toLowerCase().includes(term)
      )
      .slice(0, 3);
    
    // Search devices
    const devices = (devicesData || [])
      .filter(device =>
        device.sarjanumero?.toLowerCase().includes(term) ||
        device.merkki?.toLowerCase().includes(term) ||
        device.malli?.toLowerCase().includes(term) ||
        device.asiakkaat?.nimi?.toLowerCase().includes(term)
      )
      .slice(0, 3);
    
    // Search services
    const services = processedServices
      .filter(service =>
        service.customer.toLowerCase().includes(term) ||
        service.device.toLowerCase().includes(term) ||
        service.issue.toLowerCase().includes(term)
      )
      .slice(0, 3);
    
    return { customers, devices, services };
  }, [searchTerm, customersData, devicesData, processedServices]);

  // Kriittiset varaosat - suodatetaan oikeat kriittiset osat tietokannasta
  const criticalStock = useMemo(() => {
    if (!inventoryParts || !inventorySettings?.varasto_kaytossa) return [];
    
    return inventoryParts
      .filter(part => part.saldo < (part.minimisaldo || 0))
      .map(part => ({
        id: part.id,
        name: part.nimi,
        quantity: part.saldo,
        minQuantity: part.minimisaldo || 0
      }));
  }, [inventoryParts, inventorySettings]);

  // Kuukauden tulot
  const monthlyRevenue = useMemo(() => {
    if (!invoicesData) return 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return invoicesData
      .filter(invoice => {
        const invoiceDate = new Date(invoice.laskun_pvm);
        return invoiceDate.getMonth() === currentMonth && 
               invoiceDate.getFullYear() === currentYear;
      })
      .reduce((sum, invoice) => sum + (invoice.kokonaissumma || 0), 0);
  }, [invoicesData]);

  // Maksamattomat laskut
  const unpaidInvoices = useMemo(() => {
    if (!invoicesData) return { count: 0, total: 0 };
    
    const unpaid = invoicesData.filter(invoice => invoice.status !== 'maksettu');
    const total = unpaid.reduce((sum, invoice) => sum + (invoice.kokonaissumma || 0), 0);
    
    return { count: unpaid.length, total };
  }, [invoicesData]);

  // Asiakkaiden määrä
  const totalCustomers = useMemo(() => {
    return customersData?.length || 0;
  }, [customersData]);

  const isAnyLoading = servicesLoading || devicesLoading || customersLoading || inventoryLoading || inventorySettingsLoading || invoicesLoading;
  const hasAnyError = servicesError || devicesError || customersError || inventoryError || inventorySettingsError || invoicesError;

  const [showLoadingTimeout, setShowLoadingTimeout] = useState(false);

  useEffect(() => {
    if (isAnyLoading) {
      const timer = setTimeout(() => {
        setShowLoadingTimeout(true);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setShowLoadingTimeout(false);
    }
  }, [isAnyLoading]);

  if (isAnyLoading && !showLoadingTimeout) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm text-muted-foreground">{t('dashboard:loading')}</p>
      </div>
    );
  }

  if (showLoadingTimeout || hasAnyError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-muted-foreground">
          {t('dashboard:loadingSlow')}
        </p>
        <Button onClick={() => window.location.reload()}>
          {t('common:refresh')}
        </Button>
      </div>
    );
  }

  const hasSearchResults = searchTerm.trim() &&
    (searchResults.customers.length > 0 || searchResults.devices.length > 0 || searchResults.services.length > 0);

  const handleSearchResultClick = (type: string, item: any) => {
    // Save to recent searches
    const itemName = type === 'customer' ? item.nimi : 
                     type === 'device' ? `${item.merkki} ${item.malli}` : 
                     item.customer;
    const updated = [itemName, ...recentSearches.filter(s => s !== itemName)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    setShowSearchResults(false);
    setSearchTerm("");
    
    switch (type) {
      case 'customer':
        navigate(`/asiakkaat?search=${item.nimi}`);
        break;
      case 'device':
        navigate(`/laitteet?search=${item.sarjanumero || item.merkki}`);
        break;
      case 'service':
        navigate(`/huollot?search=${item.customer}`);
        break;
    }
  };

  const handleServiceClick = (serviceId: string) => {
    const fullService = servicesData?.find(s => s.id === serviceId);
    if (fullService) {
      setSelectedService(fullService);
      setShowActionDialog(true);
    }
  };

  const handleEditService = () => {
    setShowActionDialog(false);
    setShowEditDialog(true);
  };

  const handleOpenForm = () => {
    setShowActionDialog(false);
    if (selectedService) {
      navigate(`/huollot/${selectedService.id}/kaavake`);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardQuickSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchResults={searchResults}
        recentSearches={recentSearches}
        hasSearchResults={hasSearchResults}
        showSearchResults={showSearchResults}
        onShowSearchResults={setShowSearchResults}
        onSearchResultClick={handleSearchResultClick}
        onShowServiceForm={() => setShowServiceForm(true)}
        onShowCustomerForm={() => setShowCustomerForm(true)}
        onShowDeviceForm={() => setShowDeviceForm(true)}
      />

      <DashboardStatCards
        ongoingCount={ongoingServices.length}
        completedCount={completedServices.length}
        criticalStock={criticalStock}
        monthlyRevenue={monthlyRevenue}
        unpaidInvoices={unpaidInvoices}
        totalCustomers={totalCustomers}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardServicesList
          services={ongoingServices}
          type="ongoing"
          onServiceClick={handleServiceClick}
        />

        <DashboardServicesList
          services={completedServices}
          type="completed"
          onServiceClick={handleServiceClick}
        />
      </div>

      {inventorySettings?.varasto_kaytossa && (
        <DashboardCriticalStock items={criticalStock} />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceCountChart services={servicesData || []} />
        <RevenueTrendChart invoices={invoicesData || []} />
      </div>

      <ServiceForm
        open={showServiceForm} 
        onOpenChange={setShowServiceForm} 
      />
      
      <CustomerForm 
        open={showCustomerForm}
        onOpenChange={setShowCustomerForm}
      />
      
      <DeviceForm 
        open={showDeviceForm}
        onOpenChange={setShowDeviceForm}
      />

      {/* Action Dialog - Mitä haluat tehdä? */}
      <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mitä haluat tehdä?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedService && (
                <div className="mt-2">
                  <p className="font-medium">{selectedService.asiakkaat?.nimi || "Tuntematon asiakas"}</p>
                  <p className="text-sm">
                    {selectedService.laitteet ? 
                      `${selectedService.laitteet.merkki || ""} ${selectedService.laitteet.malli || ""}`.trim() : 
                      selectedService.merkki || "Tuntematon laite"
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedService.kuvaus || "Ei kuvausta"}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Peruuta</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEditService}
              className="bg-primary hover:bg-primary/90"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Muokkaa tietoja
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={handleOpenForm}
              className="bg-success hover:bg-success/90"
            >
              <FileText className="h-4 w-4 mr-2" />
              Avaa kaavake
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Service Edit Dialog */}
      {selectedService && (
        <ServiceEditForm
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          service={selectedService}
        />
      )}
    </div>
  );
};

export default Dashboard;