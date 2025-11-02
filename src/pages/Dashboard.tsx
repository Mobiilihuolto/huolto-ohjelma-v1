import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Package,
  Users,
  Wrench,
  Loader2,
  Pencil,
  FileText,
  Euro,
  TrendingUp,
  Command
} from "lucide-react";
import { ServiceCountChart } from "@/components/charts/ServiceCountChart";
import { RevenueTrendChart } from "@/components/charts/RevenueTrendChart";
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
  
  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const { data: devicesData, isLoading: devicesLoading } = useDevices();
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: inventoryParts, isLoading: inventoryLoading } = useInventoryParts();
  const { data: inventorySettings, isLoading: inventorySettingsLoading } = useInventorySettings();
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices();

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

  // Show loading state while any data is loading (AFTER all hooks)
  if (servicesLoading || devicesLoading || customersLoading || inventoryLoading || inventorySettingsLoading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
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
      {/* Pikahaku */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t('dashboard:quickSearch')}
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>{t('dashboard:searchPlaceholder')}</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <Command className="h-3 w-3" />K
            </kbd>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="flex gap-2">
              <Input 
                id="dashboard-search"
                placeholder="Hae nimellä, sarjanumerolla tai /uusi toiminto..." 
                className="flex-1"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchResults(e.target.value.trim().length > 0);
                }}
                onFocus={() => setShowSearchResults(searchTerm.trim().length > 0 || recentSearches.length > 0)}
              />
              <Button onClick={() => setShowSearchResults(false)}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {searchTerm.startsWith('/') ? (
                  <div className="p-2">
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Toiminnot
                    </div>
                    <div
                      className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                      onClick={() => { setShowServiceForm(true); setShowSearchResults(false); setSearchTerm(""); }}
                    >
                      <div className="font-medium">Uusi huolto</div>
                      <div className="text-sm text-muted-foreground">Luo uusi huoltotyö</div>
                    </div>
                    <div
                      className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                      onClick={() => { setShowCustomerForm(true); setShowSearchResults(false); setSearchTerm(""); }}
                    >
                      <div className="font-medium">Uusi asiakas</div>
                      <div className="text-sm text-muted-foreground">Lisää uusi asiakas</div>
                    </div>
                    <div
                      className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                      onClick={() => { setShowDeviceForm(true); setShowSearchResults(false); setSearchTerm(""); }}
                    >
                      <div className="font-medium">Uusi laite</div>
                      <div className="text-sm text-muted-foreground">Rekisteröi uusi laite</div>
                    </div>
                  </div>
                ) : !hasSearchResults && searchTerm.trim() ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Ei tuloksia haulla "{searchTerm}"
                  </div>
                ) : (
                  <div className="p-2">
                    {/* Recent Searches */}
                    {!searchTerm.trim() && recentSearches.length > 0 && (
                      <div className="mb-2">
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Viimeisimmät haut
                        </div>
                        {recentSearches.map((search, idx) => (
                          <div
                            key={idx}
                            className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                            onClick={() => setSearchTerm(search)}
                          >
                            <div className="text-sm">{search}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Customer Results */}
                    {searchResults.customers.length > 0 && (
                      <div className="mb-2">
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Asiakkaat
                        </div>
                        {searchResults.customers.map((customer) => (
                          <div
                            key={customer.id}
                            className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                            onClick={() => handleSearchResultClick('customer', customer)}
                          >
                            <div className="font-medium">{customer.nimi}</div>
                            <div className="text-sm text-muted-foreground">{customer.email || customer.puhelin}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Device Results */}
                    {searchResults.devices.length > 0 && (
                      <div className="mb-2">
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Laitteet
                        </div>
                        {searchResults.devices.map((device) => (
                          <div
                            key={device.id}
                            className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                            onClick={() => handleSearchResultClick('device', device)}
                          >
                            <div className="font-medium">{device.merkki} {device.malli}</div>
                            <div className="text-sm text-muted-foreground">
                              SN: {device.sarjanumero} | {device.asiakkaat?.nimi}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Service Results */}
                    {searchResults.services.length > 0 && (
                      <div className="mb-2">
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Huollot
                        </div>
                        {searchResults.services.map((service) => (
                          <div
                            key={service.id}
                            className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                            onClick={() => handleSearchResultClick('service', service)}
                          >
                            <div className="font-medium">{service.customer}</div>
                            <div className="text-sm text-muted-foreground">
                              {service.device} - {service.issue.length > 50 ? service.issue.substring(0, 50) + '...' : service.issue}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowCustomerForm(true)}
            >
              <Users className="h-4 w-4" />
              Uusi asiakas
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowDeviceForm(true)}
            >
              <Wrench className="h-4 w-4" />
              Uusi laite
            </Button>
            <Button className="flex items-center gap-2" onClick={() => setShowServiceForm(true)}>
              <Plus className="h-4 w-4" />
              Uusi huoltotyö
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tilastokortit */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Käynnissä olevat</p>
                <p className="text-2xl font-bold text-warning">{ongoingServices.length}</p>
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
                <p className="text-2xl font-bold text-success">{completedServices.length}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Käynnissä olevat huollot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Käynnissä olevat huollot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ongoingServices.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Ei käynnissä olevia huoltoja</p>
              ) : (
                ongoingServices.slice(0, 5).map((service) => (
                  <div 
                    key={service.id} 
                    className="p-3 border rounded-lg bg-warning/5 cursor-pointer hover:bg-warning/10 transition-colors"
                    onClick={() => handleServiceClick(service.id)}
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
                             service.status === 'työn alla' ? 'bg-warning text-warning-foreground' :
                             service.status === 'odottaa' ? 'border-muted-foreground' : ''
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

        {/* Valmiit huollot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Valmiit huollot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedServices.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Ei valmiita huoltoja</p>
              ) : (
                completedServices.slice(0, 5).map((service) => (
                  <div 
                    key={service.id} 
                    className="p-3 border rounded-lg bg-success/5 cursor-pointer hover:bg-success/10 transition-colors"
                    onClick={() => handleServiceClick(service.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{service.customer}</p>
                        <p className="text-sm text-muted-foreground">{service.device}</p>
                        <p className="text-sm">{service.issue}</p>
                      </div>
                       <div className="space-y-1 text-right">
                         <Badge 
                           variant="outline" 
                           className={
                             service.status === 'valmis' ? 'text-success border-success' :
                             service.status === 'luovutettu' ? 'bg-success text-success-foreground' : ''
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
      </div>

      {/* Kriittiset varaosat - Näytä vain jos varasto on käytössä */}
      {inventorySettings?.varasto_kaytossa && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-destructive" />
              Kriittiset varaosat
            </CardTitle>
            <CardDescription>
              Osat joiden määrä on vähissä
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalStock.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Ei kriittisiä varaosia! ✅</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kaikki varaosat ovat riittävällä tasolla.
                  </p>
                </div>
              ) : (
                criticalStock.map((item) => (
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
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