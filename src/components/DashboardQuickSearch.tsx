import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Command, Plus, Users, Wrench } from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

interface SearchResult {
  customers: Array<{ id: string; nimi: string; email?: string; puhelin?: string }>;
  devices: Array<{ id: string; merkki?: string; malli?: string; sarjanumero?: string; asiakkaat?: { nimi: string } }>;
  services: Array<{ id: string; customer: string; device: string; issue: string }>;
}

interface QuickSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchResults: SearchResult;
  recentSearches: string[];
  hasSearchResults: boolean;
  showSearchResults: boolean;
  onShowSearchResults: (show: boolean) => void;
  onSearchResultClick: (type: string, item: any) => void;
  onShowServiceForm: () => void;
  onShowCustomerForm: () => void;
  onShowDeviceForm: () => void;
}

export function DashboardQuickSearch({
  searchTerm,
  onSearchChange,
  searchResults,
  recentSearches,
  hasSearchResults,
  showSearchResults,
  onShowSearchResults,
  onSearchResultClick,
  onShowServiceForm,
  onShowCustomerForm,
  onShowDeviceForm,
}: QuickSearchProps) {
  const { t } = useTranslation(['dashboard', 'common']);

  return (
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
                onSearchChange(e.target.value);
                onShowSearchResults(e.target.value.trim().length > 0);
              }}
              onFocus={() => onShowSearchResults(searchTerm.trim().length > 0 || recentSearches.length > 0)}
            />
            <Button onClick={() => onShowSearchResults(false)}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {searchTerm.startsWith('/') ? (
                <div className="p-2">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Toiminnot
                  </div>
                  <div
                    className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                    onClick={() => {
                      onShowServiceForm();
                      onShowSearchResults(false);
                      onSearchChange("");
                    }}
                  >
                    <div className="font-medium">Uusi huolto</div>
                    <div className="text-sm text-muted-foreground">Luo uusi huoltotyö</div>
                  </div>
                  <div
                    className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                    onClick={() => {
                      onShowCustomerForm();
                      onShowSearchResults(false);
                      onSearchChange("");
                    }}
                  >
                    <div className="font-medium">Uusi asiakas</div>
                    <div className="text-sm text-muted-foreground">Lisää uusi asiakas</div>
                  </div>
                  <div
                    className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                    onClick={() => {
                      onShowDeviceForm();
                      onShowSearchResults(false);
                      onSearchChange("");
                    }}
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
                  {!searchTerm.trim() && recentSearches.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Viimeisimmät haut
                      </div>
                      {recentSearches.map((search, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                          onClick={() => onSearchChange(search)}
                        >
                          <div className="text-sm">{search}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.customers.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Asiakkaat
                      </div>
                      {searchResults.customers.map((customer) => (
                        <div
                          key={customer.id}
                          className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                          onClick={() => onSearchResultClick('customer', customer)}
                        >
                          <div className="font-medium">{customer.nimi}</div>
                          <div className="text-sm text-muted-foreground">{customer.email || customer.puhelin}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.devices.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Laitteet
                      </div>
                      {searchResults.devices.map((device) => (
                        <div
                          key={device.id}
                          className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                          onClick={() => onSearchResultClick('device', device)}
                        >
                          <div className="font-medium">{device.merkki} {device.malli}</div>
                          <div className="text-sm text-muted-foreground">
                            SN: {device.sarjanumero} | {device.asiakkaat?.nimi}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.services.length > 0 && (
                    <div className="mb-2">
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Huollot
                      </div>
                      {searchResults.services.map((service) => (
                        <div
                          key={service.id}
                          className="px-2 py-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                          onClick={() => onSearchResultClick('service', service)}
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
            onClick={onShowCustomerForm}
          >
            <Users className="h-4 w-4" />
            Uusi asiakas
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={onShowDeviceForm}
          >
            <Wrench className="h-4 w-4" />
            Uusi laite
          </Button>
          <Button className="flex items-center gap-2" onClick={onShowServiceForm}>
            <Plus className="h-4 w-4" />
            Uusi huoltotyö
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
