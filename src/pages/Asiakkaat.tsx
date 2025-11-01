import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Search, 
  Users, 
  Building, 
  Phone, 
  Mail,
  MapPin,
  Edit,
  StickyNote,
  Building2,
  AlertCircle
} from "lucide-react";
import { useCustomers, useCustomerDeviceCount, useCustomerServiceCount, Customer } from "@/hooks/useCustomers";
import CustomerForm from "@/components/CustomerForm";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from 'react-i18next';

const CustomerCard = ({ customer, canManage }: { customer: Customer; canManage: boolean }) => {
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const { data: deviceCount = 0 } = useCustomerDeviceCount(customer.id);
  const { data: serviceCount = 0 } = useCustomerServiceCount(customer.id);

  const handleShowHistory = () => {
    navigate(`/huollot?search=${encodeURIComponent(customer.nimi)}`);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                {customer.tyyppi === "yritys" ? (
                  <Building className="h-4 w-4 text-primary" />
                ) : (
                  <Users className="h-4 w-4 text-primary" />
                )}
              </div>
               <div>
                 <CardTitle className="text-lg">
                  <div className="space-y-1">
                    {customer.tyyppi === "yritys" && customer.yrityksen_nimi ? (
                      <div>
                        <div>{customer.yrityksen_nimi}</div>
                        <div className="text-sm text-muted-foreground font-normal">{customer.nimi}</div>
                      </div>
                    ) : (
                      customer.nimi
                    )}
                     <div className="text-sm text-muted-foreground font-normal">
                       {customer.numero || "Ei numeroa"}
                     </div>
                   </div>
                 </CardTitle>
                 <Badge variant={customer.tyyppi === "yritys" ? "default" : "secondary"}>
                   {customer.tyyppi === "yritys" ? "Yritys" : "Henkilö"}
                 </Badge>
                </div>
             </div>
            {canManage && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEditForm(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Muokkaa
              </Button>
            )}
           </div>
         </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-2 text-sm">
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.puhelin && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.puhelin}</span>
              </div>
            )}
            {customer.osoite && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">{customer.osoite}</span>
              </div>
            )}
            
            {/* Company-specific fields */}
            {customer.tyyppi === "yritys" && customer.y_tunnus && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">Y-tunnus: {customer.y_tunnus}</span>
              </div>
            )}
            {customer.tyyppi === "yritys" && customer.alv_numero && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">ALV: {customer.alv_numero}</span>
              </div>
            )}
            
            {/* Private notes */}
            {customer.yksityiset_muistiinpanot && (
              <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Yksityiset muistiinpanot:</p>
                  <p className="text-xs text-muted-foreground">{customer.yksityiset_muistiinpanot}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between pt-2 border-t">
            <div className="text-center">
              <p className="text-sm font-medium">{deviceCount}</p>
              <p className="text-xs text-muted-foreground">Laitetta</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{serviceCount}</p>
              <p className="text-xs text-muted-foreground">Huoltoa</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleShowHistory}>
              Näytä historia
            </Button>
          </div>
        </CardContent>
      </Card>

      <CustomerForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        customer={customer}
      />
    </>
  );
};

const Asiakkaat = () => {
  const { t } = useTranslation(['customers', 'common']);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const { data: customers = [], isLoading } = useCustomers(searchTerm);
  const { canManageCustomers } = useUserPermissions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{t('customers:title')}</h1>
          <p className="text-muted-foreground">{t('customers:searchPlaceholder')}</p>
        </div>
        {canManageCustomers && (
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4" />
            {t('customers:addCustomer')}
          </Button>
        )}
      </div>

      {!canManageCustomers && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Voit tarkastella asiakkaita mutta et muokata niitä. Vain pääkäyttäjät ja teknikot voivat lisätä ja muokata asiakkaita.
          </AlertDescription>
        </Alert>
      )}

      {/* Hakukenttä */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t('customers:searchPlaceholder')}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asiakasluettelo */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : customers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {customers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} canManage={canManageCustomers} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('customers:noCustomers')}</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? t('customers:noCustomers')
                : t('customers:addFirstCustomer')
              }
            </p>
            {!searchTerm && canManageCustomers && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('customers:addCustomer')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <CustomerForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
      />
    </div>
  );
};

export default Asiakkaat;