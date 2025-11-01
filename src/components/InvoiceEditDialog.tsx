import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, X, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { usePricingSettings } from "@/hooks/usePricingSettings";
import { useRefreshInvoiceCustomerData } from "@/hooks/useCustomers";

interface InvoiceEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
}

export const InvoiceEditDialog = ({ open, onOpenChange, invoice }: InvoiceEditDialogProps) => {
  const { t } = useTranslation('invoicing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceLines, setInvoiceLines] = useState<any[]>([]);
  const [originalInvoiceLines, setOriginalInvoiceLines] = useState<any[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentTermDays, setPaymentTermDays] = useState(14);
  const [lateFee, setLateFee] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: paymentMethods } = usePaymentMethods();
  const { data: pricingSettings } = usePricingSettings();
  const refreshCustomerData = useRefreshInvoiceCustomerData();

  useEffect(() => {
    if (invoice && open) {
      const lines = invoice.rivit || [];
      setInvoiceLines(lines);
      setOriginalInvoiceLines(lines);
      setDueDate(invoice.erapaiva ? new Date(invoice.erapaiva).toISOString().split('T')[0] : "");
      setInvoiceDate(invoice.laskun_pvm ? new Date(invoice.laskun_pvm).toISOString().split('T')[0] : "");
      setNotes(invoice.huomautukset || "");
      setStatus(invoice.status || "lahetetty");
      setPaymentDate(invoice.maksettu_pvm ? new Date(invoice.maksettu_pvm).toISOString().split('T')[0] : "");
      setPaymentMethod(invoice.maksutapa || "");
      setPaymentTermDays(invoice.maksuehto_paivat || 14);
      setLateFee(invoice.viivastyskulut || 0);
    }
  }, [invoice, open]);

  // Auto-calculate due date when invoice date or payment term changes
  useEffect(() => {
    if (invoiceDate && paymentTermDays) {
      const invoiceDateObj = new Date(invoiceDate);
      const dueDateObj = new Date(invoiceDateObj);
      dueDateObj.setDate(dueDateObj.getDate() + paymentTermDays);
      const newDueDate = dueDateObj.toISOString().split('T')[0];
      setDueDate(newDueDate);
    }
  }, [invoiceDate, paymentTermDays]);

  const addLine = () => {
    setInvoiceLines([
      ...invoiceLines,
      { kuvaus: "", maara: 1, yksikko: "kpl", yksikkohinta: 0, yhteensa: 0 }
    ]);
  };

  const removeLine = (index: number) => {
    setInvoiceLines(invoiceLines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...invoiceLines];
    newLines[index][field] = value;
    
    // If description is changed, check if it matches a pricing setting and auto-fill price
    if (field === 'kuvaus' && pricingSettings) {
      const matchedPricing = pricingSettings.find(ps => ps.nimi === value);
      if (matchedPricing) {
        // Auto-fill based on pricing type
        if (matchedPricing.hinnoittelu_tyyppi === 'kertamaksu' && matchedPricing.kiintea_hinta) {
          newLines[index].yksikkohinta = matchedPricing.kiintea_hinta;
          newLines[index].maara = 1;
          newLines[index].yksikko = matchedPricing.yksikko || 'Työ';
          newLines[index].yhteensa = matchedPricing.kiintea_hinta * 1;
        } else if (matchedPricing.hinnoittelu_tyyppi === 'tuntiveloitus' && matchedPricing.oletustuntihinta) {
          newLines[index].yksikkohinta = matchedPricing.oletustuntihinta;
          newLines[index].yksikko = matchedPricing.yksikko || 'H';
          // Keep current maara or set to 1
          const maara = newLines[index].maara || 1;
          newLines[index].yhteensa = matchedPricing.oletustuntihinta * maara;
        }
      }
    }
    
    // Calculate total for this line
    if (field === 'maara' || field === 'yksikkohinta') {
      newLines[index].yhteensa = newLines[index].maara * newLines[index].yksikkohinta;
    }
    
    setInvoiceLines(newLines);
  };

  const calculateTotals = () => {
    const total = invoiceLines.reduce((sum, line) => sum + (line.yhteensa || 0), 0);
    const vatPercentage = invoice.alv_prosentti || 25.5;
    const subtotal = total / (1 + vatPercentage / 100); // Remove VAT from total
    const vatAmount = total - subtotal; // VAT amount
    
    return { subtotal, vatAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validointi: Tarkista onko rivejä
    if (invoiceLines.length === 0) {
      const confirmEmpty = window.confirm(
        "⚠️ VAROITUS: Olet tallentamassa laskun ilman yhtään riviä!\n\n" +
        "Tämä poistaa KAIKKI laskutettavat työt ja osat.\n" +
        "Laskun kokonaissumma tulee olemaan 0 €.\n\n" +
        "Haluatko VARMASTI jatkaa?"
      );
      if (!confirmEmpty) return;
    }
    
    setIsSubmitting(true);

    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
      // Validointi: Tarkista onko summa 0
      if (total === 0 && invoiceLines.length > 0) {
        const confirmZero = window.confirm(
          "⚠️ HUOMIO: Laskun kokonaissumma on 0 €.\n\n" +
          "Haluatko varmasti tallentaa laskun nolla euron summalla?"
        );
        if (!confirmZero) {
          setIsSubmitting(false);
          return;
        }
      }

      // Auto-update status based on due date
      let finalStatus = status;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDateObj = new Date(dueDate);
      dueDateObj.setHours(0, 0, 0, 0);
      
      // If status is 'avoin' or 'lahetetty' and due date has passed → mark as overdue
      if ((finalStatus === 'avoin' || finalStatus === 'lahetetty') && dueDateObj < today) {
        finalStatus = 'myohassa';
      }
      
      // If status is 'myohassa' but due date is in the future → reopen as 'avoin'
      if (finalStatus === 'myohassa' && dueDateObj >= today) {
        finalStatus = 'avoin';
      }

      const updateData: any = {
        rivit: invoiceLines,
        erapaiva: dueDate,
        laskun_pvm: invoiceDate,
        maksuehto_paivat: paymentTermDays,
        viivastyskulut: lateFee,
        huomautukset: notes,
        status: finalStatus,
        summa_ilman_alvia: subtotal,
        alv_summa: vatAmount,
        kokonaissumma: total,
        updated_at: new Date().toISOString()
      };

      // Add payment info if status is 'maksettu'
      if (status === 'maksettu') {
        updateData.maksettu_pvm = paymentDate || new Date().toISOString().split('T')[0];
        updateData.maksutapa = paymentMethod || null;
        updateData.tositelaji = 'kuitti';
      } else {
        updateData.maksettu_pvm = null;
        updateData.maksutapa = null;
        // Jos status EI ole 'maksettu', palauta tositelaji takaisin 'lasku'
        if (invoice.tositelaji === 'kuitti') {
          updateData.tositelaji = 'lasku';
        }
      }

      const { error } = await supabase
        .from("laskut")
        .update(updateData)
        .eq("id", invoice.id);

      if (error) throw error;

      toast({
        title: t('invoiceUpdated'),
        description: t('common:saveSuccess'),
      });

      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating invoice:", error);
      toast({
        variant: "destructive",
        title: t('common:error'),
        description: error.message || t('common:saveFailed'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('edit')} {invoice?.numero}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Varoitus tyhjistä riveistä */}
          {invoiceLines.length === 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{t('common:warning')}!</strong> {t('common:noLines')}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Varoitus nollasummasta */}
          {invoiceLines.length > 0 && calculateTotals().total === 0 && (
            <Alert className="border-orange-500 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-900">
                <strong>{t('common:notice')}:</strong> {t('common:zeroTotal')}
              </AlertDescription>
            </Alert>
          )}

          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">{t('invoiceDate')}</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">{t('dueDate')}</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Customer info refresh button */}
          {invoice?.asiakas_id && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
              <div className="flex-1">
                <p className="text-sm font-medium">{t('common:customerInfo')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('customer')}: {invoice.asiakas_nimi} ({invoice.asiakas_email || t('common:noEmail')})
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  const confirmed = window.confirm(
                    `Päivitetään laskun asiakastiedot asiakkaan ${invoice.asiakas_nimi} tuoreimmista tiedoista.\n\nTämä päivittää:\n- Nimi\n- Sähköposti\n- Puhelin\n- Osoite\n- Y-tunnus\n\nHaluatko jatkaa?`
                  );
                  if (confirmed) {
                    await refreshCustomerData.mutateAsync({
                      invoiceId: invoice.id,
                      customerId: invoice.asiakas_id,
                    });
                    // Reload invoice data without closing the dialog
                    queryClient.invalidateQueries({ queryKey: ["invoices"] });
                  }
                }}
                disabled={refreshCustomerData.isPending}
              >
                {refreshCustomerData.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">{t('common:refreshCustomer')}</span>
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">{t('status')}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avoin">{t('statusOpen')}</SelectItem>
                <SelectItem value="luonnos">{t('statusDraft')}</SelectItem>
                <SelectItem value="lahetetty">{t('statusSent')}</SelectItem>
                <SelectItem value="maksettu">{t('statusPaid')}</SelectItem>
                <SelectItem value="myohassa">{t('statusOverdue')}</SelectItem>
                <SelectItem value="peruutettu">{t('statusCancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-term-edit">{t('paymentTermDays')}</Label>
              <Input
                id="payment-term-edit"
                type="number"
                min="1"
                value={paymentTermDays}
                onChange={(e) => setPaymentTermDays(parseInt(e.target.value) || 14)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="late-fee-edit">{t('lateFees')} (€)</Label>
              <Input
                id="late-fee-edit"
                type="number"
                min="0"
                step="0.01"
                value={lateFee}
                onChange={(e) => setLateFee(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Payment details - show when status is 'maksettu' */}
          {status === 'maksettu' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="space-y-2">
                <Label htmlFor="paymentDate">{t('paymentDate')}</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">{t('paymentMethod')}</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common:selectPayment')} />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods && paymentMethods.length > 0 ? (
                      paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.nimi}>
                          {method.nimi}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="käteinen">Käteinen</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Invoice lines */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>{t('invoiceLines')}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="h-4 w-4 mr-1" />
                {t('addLine')}
              </Button>
            </div>

            <div className="space-y-2">
              {invoiceLines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Input
                      placeholder={t('description')}
                      value={line.kuvaus}
                      onChange={(e) => updateLine(index, 'kuvaus', e.target.value)}
                      list={`pricing-options-${index}`}
                    />
                    <datalist id={`pricing-options-${index}`}>
                      {pricingSettings?.map((pricing) => (
                        <option key={pricing.id} value={pricing.nimi} />
                      ))}
                    </datalist>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder={t('quantity')}
                      value={line.maara}
                      onChange={(e) => updateLine(index, 'maara', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder={t('unit')}
                      value={line.yksikko}
                      onChange={(e) => updateLine(index, 'yksikko', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={t('unitPrice')}
                      value={line.yksikkohinta}
                      onChange={(e) => updateLine(index, 'yksikkohinta', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-1">
                    <div className="text-sm font-medium">{line.yhteensa?.toFixed(2)} €</div>
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between text-lg font-bold">
                <span>{t('totalWithVat')}:</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('ofWhichVat')} {invoice?.alv_prosentti || 25.5}%:</span>
                <span>{vatAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('withoutVat')}:</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('notes')}</Label>
            <Textarea
              id="notes"
              placeholder={t('common:additionalInfo')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Palauta alkuperäiset tiedot
                setInvoiceLines(originalInvoiceLines);
                setDueDate(invoice.erapaiva ? new Date(invoice.erapaiva).toISOString().split('T')[0] : "");
                setInvoiceDate(invoice.laskun_pvm ? new Date(invoice.laskun_pvm).toISOString().split('T')[0] : "");
                setNotes(invoice.huomautukset || "");
                setStatus(invoice.status || "lahetetty");
                setPaymentDate(invoice.maksettu_pvm ? new Date(invoice.maksettu_pvm).toISOString().split('T')[0] : "");
                setPaymentMethod(invoice.maksutapa || "");
                setPaymentTermDays(invoice.maksuehto_paivat || 14);
                setLateFee(invoice.viivastyskulut || 0);
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              {t('common:cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || invoiceLines.length === 0}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? t('updating') : t('updateInvoice')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
