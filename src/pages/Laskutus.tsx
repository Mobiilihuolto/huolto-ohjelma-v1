import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { InvoiceEditDialog } from "@/components/InvoiceEditDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, FileText, Euro, Calendar, CreditCard, Trash2, Building2, AlertTriangle, Send, AlertCircle } from "lucide-react";
import { useInvoices, useMarkInvoicePaid, useDeleteInvoice, useSendPaymentReminder } from "@/hooks/useInvoices";
import { InvoiceCreateDialog } from "@/components/InvoiceCreateDialog";
import { PaymentDialog } from "@/components/PaymentDialog";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";

const getStatusBadge = (status: string, t: any) => {
  const statusConfig = {
    luonnos: { label: t('statusDraft'), variant: "secondary" as const },
    avoin: { label: t('statusOpen'), variant: "default" as const },
    lahetetty: { label: t('statusSent'), variant: "default" as const },
    maksettu: { label: t('statusPaid'), variant: "default" as const },
    myohassa: { label: t('statusOverdue'), variant: "destructive" as const },
    peruutettu: { label: t('statusCancelled'), variant: "outline" as const }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.luonnos;
  
  return (
    <Badge 
      variant={config.variant}
      style={{ 
        backgroundColor: status === 'maksettu' ? '#16a34a' : undefined,
        color: status === 'maksettu' ? 'white' : undefined
      }}
    >
      {config.label}
    </Badge>
  );
};

export default function Laskutus() {
  const { t } = useTranslation('invoicing');
  const { canManageInvoices } = useUserPermissions();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("kaikki");
  const { data: invoices, isLoading } = useInvoices(searchTerm);
  const markInvoicePaid = useMarkInvoicePaid();
  const deleteInvoice = useDeleteInvoice();
  const sendReminder = useSendPaymentReminder();

  const handleMarkPaid = (invoiceId: string, paymentMethod: string, paymentDate: Date) => {
    markInvoicePaid.mutate({ invoiceId, paymentMethod, paymentDate });
  };

  const handleSendReminder = (invoiceId: string) => {
    sendReminder.mutate(invoiceId);
  };

  // Calculate average payment delay
  const avgPaymentDelay = invoices ? (() => {
    const paidInvoices = invoices.filter(inv => inv.status === 'maksettu' && inv.maksettu_pvm && inv.erapaiva);
    if (paidInvoices.length === 0) return 0;
    
    const totalDelay = paidInvoices.reduce((sum, inv) => {
      const paidDate = new Date(inv.maksettu_pvm!);
      const dueDate = new Date(inv.erapaiva!);
      const delay = Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + delay;
    }, 0);
    
    return Math.round(totalDelay / paidInvoices.length);
  })() : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-muted-foreground">{t('common:loading')}</div>
      </div>
    );
  }

  if (!canManageInvoices) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('common:manageInvoicesDescription')}</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('common:noPermission')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter invoices based on active tab
  const filteredInvoices = invoices?.filter(invoice => {
    if (activeTab === "kaikki") return true;
    if (activeTab === "laskut") return (invoice.tositelaji || "lasku") === "lasku";
    if (activeTab === "kuitit") return invoice.tositelaji === "kuitti";
    if (activeTab === "maksetut") return invoice.status === "maksettu";
    if (activeTab === "avoimet") return invoice.status === "avoin" || invoice.status === "lahetetty" || invoice.status === "myohassa";
    return true;
  })?.sort((a, b) => {
    // Sort overdue invoices first
    if (a.status === 'myohassa' && b.status !== 'myohassa') return -1;
    if (a.status !== 'myohassa' && b.status === 'myohassa') return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('common:manageInvoicesDescription')}
          </p>
        </div>
        <InvoiceCreateDialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('createInvoice')}
          </Button>
        </InvoiceCreateDialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="kaikki">{t('tabAll')} ({invoices?.length || 0})</TabsTrigger>
          <TabsTrigger value="laskut">{t('tabInvoices')} ({invoices?.filter(i => (i.tositelaji || "lasku") === "lasku").length || 0})</TabsTrigger>
          <TabsTrigger value="kuitit">{t('tabReceipts')} ({invoices?.filter(i => i.tositelaji === "kuitti").length || 0})</TabsTrigger>
          <TabsTrigger value="maksetut">{t('tabPaid')} ({invoices?.filter(i => i.status === "maksettu").length || 0})</TabsTrigger>
          <TabsTrigger value="avoimet">{t('tabOpen')} ({invoices?.filter(i => i.status === "avoin" || i.status === "lahetetty").length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">

      {/* Statistics Cards */}
      {invoices && invoices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Paid Invoices */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('common:paid')}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {invoices.filter(inv => inv.status === 'maksettu').reduce((sum, inv) => sum + (inv.kokonaissumma || 0), 0).toFixed(2)} €
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({t('common:inclVAT')} {invoices.filter(inv => inv.status === 'maksettu').reduce((sum, inv) => sum + (inv.alv_summa || 0), 0).toFixed(2)} €)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {invoices.filter(inv => inv.status === 'maksettu').length} {t('common:invoices').toLowerCase()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Open Invoices */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('common:open')}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {invoices.filter(inv => inv.status === 'avoin' || inv.status === 'lahetetty').reduce((sum, inv) => sum + (inv.kokonaissumma || 0), 0).toFixed(2)} €
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (sis. ALV {invoices.filter(inv => inv.status === 'avoin' || inv.status === 'lahetetty').reduce((sum, inv) => sum + (inv.alv_summa || 0), 0).toFixed(2)} €)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {invoices.filter(inv => inv.status === 'avoin' || inv.status === 'lahetetty').length} laskua
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overdue Invoices */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('statusOverdue')}</p>
                  <p className="text-2xl font-bold text-red-600">
                    {invoices.filter(inv => inv.status === 'myohassa').reduce((sum, inv) => sum + (inv.kokonaissumma || 0), 0).toFixed(2)} €
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (sis. ALV {invoices.filter(inv => inv.status === 'myohassa').reduce((sum, inv) => sum + (inv.alv_summa || 0), 0).toFixed(2)} €)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {invoices.filter(inv => inv.status === 'myohassa').length} laskua
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('total')}</p>
                  <p className="text-2xl font-bold">
                    {invoices.reduce((sum, inv) => sum + (inv.kokonaissumma || 0), 0).toFixed(2)} €
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (sis. ALV {invoices.reduce((sum, inv) => sum + (inv.alv_summa || 0), 0).toFixed(2)} €)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {invoices.length} laskua
                  </p>
                  {avgPaymentDelay !== 0 && (
                    <p className={`text-xs font-medium mt-2 ${avgPaymentDelay > 0 ? 'text-destructive' : 'text-success'}`}>
                      ⌀ Maksetaan {avgPaymentDelay > 0 ? `+${avgPaymentDelay}` : avgPaymentDelay} pv eräpäivän {avgPaymentDelay > 0 ? 'jälkeen' : 'ennen'}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Euro className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

          <div className="grid gap-4">
            {filteredInvoices?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('noInvoices')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? t('common:noResults') : t('createFirstInvoice')}
                  </p>
                  <InvoiceCreateDialog>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('createFirstInvoice')}
                    </Button>
                  </InvoiceCreateDialog>
                </CardContent>
              </Card>
            ) : (
              filteredInvoices?.map((invoice) => {
                // Calculate days overdue
                const isOverdue = invoice.status === 'myohassa';
                let daysOverdue = 0;
                if (isOverdue && invoice.erapaiva) {
                  const today = new Date();
                  const dueDate = new Date(invoice.erapaiva);
                  daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                }
                
                return (
                <Card 
                  key={invoice.id} 
                  className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-l-4 border-l-destructive bg-red-50/50' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">
                            {invoice.asiakkaat?.tyyppi === 'yritys' && invoice.asiakkaat?.yrityksen_nimi ? (
                              <>
                                <Building2 className="inline-block w-4 h-4 mr-1" />
                                {invoice.asiakas_nimi}
                              </>
                            ) : (
                              invoice.asiakas_nimi
                            )}
                          </CardTitle>
                          {getStatusBadge(invoice.status, t)}
                          {invoice.status === 'maksettu' && invoice.tositelaji === 'kuitti' && (
                            <Badge variant="outline">{t('receipt')}</Badge>
                          )}
                        </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileText className="w-4 h-4 mr-1" />
                      {invoice.numero}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-lg font-semibold">
                      <Euro className="w-4 h-4 mr-1" />
                      {invoice.kokonaissumma?.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      (sis. ALV {invoice.alv_prosentti || 25.5}% {invoice.alv_summa?.toFixed(2)} €)
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground">{t('date')}</div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {invoice.laskun_pvm ? format(new Date(invoice.laskun_pvm), "d.M.yyyy", { locale: fi }) : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">{t('dueDate')}</div>
                    <div className={`flex items-center ${isOverdue ? 'text-destructive font-semibold' : ''}`}>
                      <Calendar className="w-4 h-4 mr-1" />
                      {invoice.erapaiva ? format(new Date(invoice.erapaiva), "d.M.yyyy", { locale: fi }) : "-"}
                      {isOverdue && (
                        <>
                          <AlertTriangle className="w-4 h-4 ml-2 mr-1" />
                          <span className="text-xs">{t('common:overdue').toUpperCase()} ({daysOverdue} {t('common:days')})</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">{t('common:serviceWork')}</div>
                    <div>
                      {invoice.Huollot?.numero || t('common:notLinked')}
                    </div>
                  </div>
                </div>

                {invoice.status === 'maksettu' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t">
                    <div>
                      <div className="font-medium text-muted-foreground">{t('common:paymentDate')}</div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {invoice.maksettu_pvm ? format(new Date(invoice.maksettu_pvm), "d.M.yyyy", { locale: fi }) : "-"}
                      </div>
                    </div>
                    {invoice.maksutapa && (
                      <div>
                        <div className="font-medium text-muted-foreground">{t('common:paymentMethod')}</div>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" />
                          {invoice.maksutapa}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {invoice.rivit && Array.isArray(invoice.rivit) && invoice.rivit.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <div className="font-medium text-sm text-muted-foreground mb-2">{t('items')}:</div>
                    {(invoice.rivit as any[]).map((line: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm py-1">
                        <span>{line.kuvaus}</span>
                        <span>{line.maara} {line.yksikko} × {line.yksikkohinta?.toFixed(2)} € = {line.yhteensa?.toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Show reminder count if any */}
                {(invoice.muistutukset_lahetetty || 0) > 0 && (
                  <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <Send className="inline w-3 h-3 mr-1" />
                    {t('common:remindersSent')}: {invoice.muistutukset_lahetetty}
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-4">
                  {invoice.status === 'myohassa' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSendReminder(invoice.id)}
                            disabled={sendReminder.isPending}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            {t('common:sendReminder')}
                          </Button>
                  )}
                  {(invoice.status === 'avoin' || invoice.status === 'lahetetty') && (
                    <PaymentDialog 
                      onConfirm={(paymentMethod, paymentDate) => handleMarkPaid(invoice.id, paymentMethod, paymentDate)}
                      isPending={markInvoicePaid.isPending}
                    >
                      <Button size="sm" variant="default">
                        <CreditCard className="w-4 h-4 mr-1" />
                        {t('markPaid')}
                      </Button>
                    </PaymentDialog>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/laskutus/${invoice.id}/esikatselu`)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    {invoice.tositelaji === 'kuitti' ? t('openReceipt') : t('openInvoice')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingInvoice(invoice);
                    }}
                  >
                    {t('common:edit')}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(t('confirmDelete').replace('{number}', invoice.numero))) {
                        deleteInvoice.mutate(invoice.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t('common:delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
        )}
      </div>
      </TabsContent>
      </Tabs>

      {/* Invoice edit dialog */}
      {editingInvoice && (
        <InvoiceEditDialog
          open={!!editingInvoice}
          onOpenChange={(open) => !open && setEditingInvoice(null)}
          invoice={editingInvoice}
        />
      )}
    </div>
  );
}