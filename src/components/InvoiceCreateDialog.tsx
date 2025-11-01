import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, Trash2, Receipt, CalendarIcon, GripVertical, Building2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useServices } from "@/hooks/useServices";
import { useCreateInvoiceFromService, useInvoices } from "@/hooks/useInvoices";
import { useDefaultAlvSetting } from "@/hooks/useAlvSettings";
import { usePricingSettings } from "@/hooks/usePricingSettings";
import { useServiceParts } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useInvoiceSettings } from "@/hooks/useInvoiceSettings";

interface InvoiceCreateDialogProps {
  children: React.ReactNode;
}

interface EditableLine {
  id: string;
  kuvaus: string;
  maara: number;
  yksikko: string;
  yksikkohinta: number;
  includesVat: boolean;
}

interface SortableRowProps {
  line: EditableLine;
  pricingSettings: any[] | undefined;
  updateLine: (id: string, field: keyof EditableLine, value: string | number | boolean) => void;
  removeLine: (id: string) => void;
}

function SortableRow({ line, pricingSettings, updateLine, removeLine }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: line.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none p-1"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell>
        <Input
          placeholder="Kuvaus..."
          value={line.kuvaus}
          onChange={(e) => updateLine(line.id, 'kuvaus', e.target.value)}
          list={`pricing-options-${line.id}`}
          className="h-9"
        />
        <datalist id={`pricing-options-${line.id}`}>
          {pricingSettings?.map((pricing) => (
            <option key={pricing.id} value={pricing.nimi} />
          ))}
        </datalist>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={line.maara || ""}
          onChange={(e) => updateLine(line.id, 'maara', parseFloat(e.target.value) || 0)}
          className="h-9"
        />
      </TableCell>
      <TableCell>
        <Select value={line.yksikko} onValueChange={(value) => updateLine(line.id, 'yksikko', value)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="kpl" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {Array.from(new Set(['kpl', 'h', 'pv', 'm', 'kg', 'l', 'Työ', ...(pricingSettings?.map(ps => ps.yksikko).filter(Boolean) || [])])).map((unit) => (
              <SelectItem key={unit} value={unit as string}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={line.yksikkohinta || ""}
          onChange={(e) => updateLine(line.id, 'yksikkohinta', parseFloat(e.target.value) || 0)}
          className="h-9"
        />
      </TableCell>
      <TableCell className="text-right font-medium">
        {(line.maara * line.yksikkohinta).toFixed(2)}
      </TableCell>
      <TableCell>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeLine(line.id)}
          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function InvoiceCreateDialog({ children }: InvoiceCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [editableLines, setEditableLines] = useState<EditableLine[]>([]);
  const [tositelaji, setTositelaji] = useState<'lasku' | 'kuitti'>('lasku');
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentTermDays, setPaymentTermDays] = useState<number | null>(null);
  const [lateFee, setLateFee] = useState<number | null>(null);
  
  const { data: services } = useServices();
  const { data: allInvoices } = useInvoices();
  const createInvoiceFromService = useCreateInvoiceFromService();
  const { data: defaultAlvSetting } = useDefaultAlvSetting();
  const { data: pricingSettings } = usePricingSettings();
  const { data: serviceParts } = useServiceParts(selectedServiceId);
  const { toast } = useToast();
  const { data: paymentMethods } = usePaymentMethods();
  const { data: invoiceSettings } = useInvoiceSettings();

  // Filter services that are completed and don't have invoices yet (memoized to prevent infinite loop)
  const completableServices = useMemo(() => {
    return services?.filter(service => {
      const isCompleted = service.status === 'valmis' || service.status === 'valmistunut' || service.status === 'luovutettu';
      if (!isCompleted) return false;
      
      // Only consider valid invoices (kokonaissumma > 0) as existing invoices
      const hasInvoice = allInvoices?.some(invoice => 
        invoice.huolto_id === service.id && invoice.kokonaissumma > 0
      );
      return !hasInvoice;
    }) || [];
  }, [services, allInvoices]);

  // Populate editable lines when service is selected
  useEffect(() => {
    if (!selectedServiceId) {
      setEditableLines([]);
      return;
    }

    const selectedService = completableServices.find(s => s.id === selectedServiceId);
    if (!selectedService) return;

    const lines: EditableLine[] = [];

    // Add work line
    if (selectedService.hinnoittelu_tyyppi === 'tuntiveloitus') {
      const hours = (selectedService.tyoaika_minuutit || 0) / 60;
      const hourlyRate = selectedService.tuntihinta || 0;
      
      // Find matching pricing setting to check VAT inclusion
      const matchingPricing = pricingSettings?.find(ps => 
        ps.hinnoittelu_tyyppi === 'tuntiveloitus' && 
        ps.oletustuntihinta === hourlyRate
      );
      
      lines.push({
        id: 'work-line',
        kuvaus: selectedService.hinnoittelu_nimi || 'Työ',
        maara: parseFloat(hours.toFixed(2)),
        yksikko: 'h',
        yksikkohinta: hourlyRate,
        includesVat: matchingPricing?.sisaltaa_alv ?? false
      });
    } else if (selectedService.hinnoittelu_tyyppi === 'kertamaksu') {
      const fixedPrice = selectedService.kiintea_hinta || 0;
      
      // Find matching pricing setting to check VAT inclusion
      const matchingPricing = pricingSettings?.find(ps => 
        ps.hinnoittelu_tyyppi === 'kertamaksu' && 
        ps.kiintea_hinta === fixedPrice
      );
      
      lines.push({
        id: 'work-line',
        kuvaus: selectedService.hinnoittelu_nimi || 'Työ',
        maara: 1,
        yksikko: matchingPricing?.yksikko || 'Työ',
        yksikkohinta: fixedPrice,
        includesVat: matchingPricing?.sisaltaa_alv ?? false
      });
    }

    // Add parts from database
    if (serviceParts && serviceParts.length > 0) {
      serviceParts.forEach((sp: any) => {
        lines.push({
          id: `part-${sp.id}`,
          kuvaus: sp.varaosat?.nimi || 'Osa',
          maara: sp.maara,
          yksikko: sp.varaosat?.yksikko || 'kpl',
          yksikkohinta: sp.yksikkohinta,
          includesVat: true // Parts always include VAT
        });
      });
    }

    setEditableLines(lines);
  }, [selectedServiceId, serviceParts, pricingSettings]);

  const addLine = () => {
    const newLine: EditableLine = {
      id: `manual-${Date.now()}`,
      kuvaus: "",
      maara: 1,
      yksikko: "kpl",
      yksikkohinta: 0,
      includesVat: true
    };
    setEditableLines([...editableLines, newLine]);
  };

  const removeLine = (id: string) => {
    setEditableLines(editableLines.filter(line => line.id !== id));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEditableLines((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateLine = (id: string, field: keyof EditableLine, value: string | number | boolean) => {
    const newLines = [...editableLines];
    const lineIndex = newLines.findIndex(line => line.id === id);
    if (lineIndex === -1) return;
    
    if (field === 'kuvaus' || field === 'yksikko' || field === 'id') {
      newLines[lineIndex][field] = value as string;
      
      // Auto-fill pricing if description matches a pricing setting
      if (field === 'kuvaus' && pricingSettings) {
        const matchedPricing = pricingSettings.find(ps => ps.nimi === value);
        if (matchedPricing) {
          if (matchedPricing.hinnoittelu_tyyppi === 'kertamaksu' && matchedPricing.kiintea_hinta) {
            newLines[lineIndex].yksikkohinta = matchedPricing.kiintea_hinta;
            newLines[lineIndex].maara = 1;
            newLines[lineIndex].yksikko = matchedPricing.yksikko || 'Työ';
            newLines[lineIndex].includesVat = matchedPricing.sisaltaa_alv ?? true;
          } else if (matchedPricing.hinnoittelu_tyyppi === 'tuntiveloitus' && matchedPricing.oletustuntihinta) {
            newLines[lineIndex].yksikkohinta = matchedPricing.oletustuntihinta;
            newLines[lineIndex].yksikko = matchedPricing.yksikko || 'h';
            newLines[lineIndex].includesVat = matchedPricing.sisaltaa_alv ?? false;
            if (!newLines[lineIndex].maara) {
              newLines[lineIndex].maara = 1;
            }
          }
        }
      }
    } else if (field === 'maara' || field === 'yksikkohinta') {
      newLines[lineIndex][field] = value as number;
    } else if (field === 'includesVat') {
      newLines[lineIndex][field] = value as boolean;
    }
    
    setEditableLines(newLines);
  };

  const calculateTotals = () => {
    const vatPercentage = defaultAlvSetting?.alv_prosentti || 25.5;
    let totalSubtotal = 0;
    let totalVat = 0;
    let totalWithVat = 0;

    editableLines.forEach(line => {
      const lineTotal = line.maara * line.yksikkohinta;
      
      if (line.includesVat) {
        // Price includes VAT, extract it
        const subtotal = lineTotal / (1 + vatPercentage / 100);
        const vat = lineTotal - subtotal;
        totalSubtotal += subtotal;
        totalVat += vat;
        totalWithVat += lineTotal;
      } else {
        // Price doesn't include VAT, add it
        const vat = lineTotal * (vatPercentage / 100);
        totalSubtotal += lineTotal;
        totalVat += vat;
        totalWithVat += lineTotal + vat;
      }
    });

    return { totalSubtotal, totalVat, totalWithVat };
  };

  const handleCreateInvoice = () => {
    const selectedService = completableServices.find(s => s.id === selectedServiceId);
    if (!selectedService || !selectedService.asiakas_id) return;

    // Validate payment method for receipts
    if (tositelaji === 'kuitti' && !paymentMethod) {
      toast({
        title: "Virhe",
        description: "Valitse maksutapa kuitille.",
        variant: "destructive",
      });
      return;
    }

    // Validate that there are lines with valid data
    const validLines = editableLines.filter(line => 
      line.kuvaus.trim() !== "" && line.yksikkohinta > 0
    );

    if (validLines.length === 0) {
      toast({
        title: "Virhe",
        description: "Lisää vähintään yksi rivi laskuun.",
        variant: "destructive",
      });
      return;
    }

    // Convert all valid lines (including work) to the format expected by the mutation
    const additionalParts = validLines.map(line => ({
      kuvaus: line.kuvaus,
      maara: line.maara,
      yksikko: line.yksikko,
      yksikkohinta: line.yksikkohinta,
      includesVat: line.includesVat
    }));

    createInvoiceFromService.mutate({
      serviceId: selectedServiceId,
      customerId: selectedService.asiakas_id,
      additionalParts: additionalParts,
      tositelaji: tositelaji,
      paymentMethod: tositelaji === 'kuitti' ? paymentMethod : undefined,
      paymentDate: tositelaji === 'kuitti' ? paymentDate : undefined,
      paymentTermDays: paymentTermDays ?? invoiceSettings?.[0]?.oletusmaksuehto_paivat,
      lateFee: lateFee ?? invoiceSettings?.[0]?.oletusviivastyskulut
    });
    
    handleOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedServiceId("");
      setEditableLines([]);
      setTositelaji('lasku');
      setPaymentMethod("");
      setPaymentDate(new Date());
      setPaymentTermDays(null);
      setLateFee(null);
    }
  };

  const totals = calculateTotals();
  const selectedService = completableServices.find(s => s.id === selectedServiceId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Luo tosite huoltotyöstä</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tositelaji</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={tositelaji} onValueChange={(value) => setTositelaji(value as 'lasku' | 'kuitti')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lasku" id="lasku" />
                  <Label htmlFor="lasku" className="cursor-pointer flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Lasku</div>
                      <div className="text-xs text-muted-foreground">Maksu suoritetaan myöhemmin</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <RadioGroupItem value="kuitti" id="kuitti" />
                  <Label htmlFor="kuitti" className="cursor-pointer flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Kuitti</div>
                      <div className="text-xs text-muted-foreground">Maksu on jo suoritettu</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {tositelaji === 'lasku' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Maksuehdot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-term">Maksuaika (päivää)</Label>
                    <Input
                      id="payment-term"
                      type="number"
                      min="1"
                      placeholder={invoiceSettings?.[0]?.oletusmaksuehto_paivat?.toString() || "14"}
                      value={paymentTermDays ?? ""}
                      onChange={(e) => setPaymentTermDays(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="late-fee">Viivästysmaksu (€)</Label>
                    <Input
                      id="late-fee"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={invoiceSettings?.[0]?.oletusviivastyskulut?.toString() || "5"}
                      value={lateFee ?? ""}
                      onChange={(e) => setLateFee(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {tositelaji === 'kuitti' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Maksutiedot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Maksutapa</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="payment-method">
                      <SelectValue placeholder="Valitse maksutapa..." />
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

                <div className="space-y-2">
                  <Label>Maksupäivämäärä</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !paymentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {paymentDate ? format(paymentDate, "PPP", { locale: fi }) : <span>Valitse päivämäärä</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={paymentDate}
                        onSelect={(date) => date && setPaymentDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <label className="text-sm font-medium">Valitse valmistunut huoltotyö</label>
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Valitse huoltotyö..." />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {completableServices.map((service) => {
                  // Calculate service total for display
                  const serviceTotal = (() => {
                    if (service.hinnoittelu_tyyppi === 'tuntiveloitus') {
                      const hours = (service.tyoaika_minuutit || 0) / 60;
                      return hours * (service.tuntihinta || 0);
                    } else if (service.hinnoittelu_tyyppi === 'kertamaksu') {
                      return service.kiintea_hinta || 0;
                    }
                    return 0;
                  })();

                  return (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex items-center space-x-2">
                        <span>{service.numero}</span>
                        <span>-</span>
                        <span>
                          {service.asiakkaat?.tyyppi === 'yritys' && service.asiakkaat?.yrityksen_nimi ? (
                            <>
                              <Building2 className="inline-block w-3 h-3 mr-1" />
                              {service.asiakkaat.yrityksen_nimi} ({service.asiakkaat.nimi})
                            </>
                          ) : (
                            service.asiakkaat?.nimi
                          )}
                        </span>
                        {(service.laitteet?.merkki || service.merkki) && (service.laitteet?.malli || service.malli) && (
                          <>
                            <span>-</span>
                            <span className="text-muted-foreground">
                              {service.laitteet?.merkki || service.merkki} {service.laitteet?.malli || service.malli}
                            </span>
                          </>
                        )}
                        <span>-</span>
                        <span className="text-muted-foreground">{serviceTotal.toFixed(2)} €</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {completableServices.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ei laskutettavia huoltotöitä</h3>
                <p className="text-muted-foreground">
                  Laskuja voi luoda vain valmiista tai luovutetuista huoltotöistä.
                </p>
              </CardContent>
            </Card>
          )}

          {selectedServiceId && selectedService && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Laskun rivit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Service info */}
                <div className="grid grid-cols-2 gap-4 text-sm pb-4 border-b">
                  <div>
                    <div className="font-medium text-muted-foreground">Asiakas</div>
                    <div>
                      {selectedService.asiakkaat?.tyyppi === 'yritys' && selectedService.asiakkaat?.yrityksen_nimi ? (
                        <>
                          <Building2 className="inline-block w-4 h-4 mr-1" />
                          {selectedService.asiakkaat.yrityksen_nimi} ({selectedService.asiakkaat.nimi})
                        </>
                      ) : (
                        selectedService.asiakkaat?.nimi
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Huoltotyö</div>
                    <div className="flex items-center gap-2">
                      {selectedService.numero}
                      <Badge variant="outline">
                        {selectedService.hinnoittelu_tyyppi === 'tuntiveloitus' ? 'Tuntiveloitus' : 'Kiinteä hinta'}
                      </Badge>
                    </div>
                  </div>
                  {(selectedService.merkki || selectedService.laitteet?.merkki) && (selectedService.malli || selectedService.laitteet?.malli) && (
                    <div className="col-span-2">
                      <div className="font-medium text-muted-foreground">Laite</div>
                      <div>
                        {selectedService.laitteet?.merkki || selectedService.merkki} {selectedService.laitteet?.malli || selectedService.malli}
                        {(selectedService.sarjanumero || selectedService.laitteet?.sarjanumero) && (
                          <span className="text-muted-foreground ml-2">
                            (S/N: {selectedService.laitteet?.sarjanumero || selectedService.sarjanumero})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedService.kuvaus && (
                    <div className="col-span-2">
                      <div className="font-medium text-muted-foreground">Kuvaus</div>
                      <div>{selectedService.kuvaus}</div>
                    </div>
                  )}
                </div>

                {/* Editable lines table */}
                <div className="border rounded-lg overflow-hidden">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]"></TableHead>
                          <TableHead className="w-[35%]">Kuvaus</TableHead>
                          <TableHead className="w-[12%]">Määrä</TableHead>
                          <TableHead className="w-[13%]">Yksikkö</TableHead>
                          <TableHead className="w-[13%]">á-hinta (€)</TableHead>
                          <TableHead className="w-[12%] text-right">Yhteensä (€)</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <SortableContext
                        items={editableLines.map(line => line.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <TableBody>
                          {editableLines.map((line) => (
                            <SortableRow
                              key={line.id}
                              line={line}
                              pricingSettings={pricingSettings}
                              updateLine={updateLine}
                              removeLine={removeLine}
                            />
                          ))}
                        </TableBody>
                      </SortableContext>
                    </Table>
                  </DndContext>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLine}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Lisää rivi
                </Button>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Yhteensä (sis. ALV)</span>
                    <span>{totals.totalWithVat.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>- josta ALV ({(defaultAlvSetting?.alv_prosentti || 25.5)}%)</span>
                    <span>{totals.totalVat.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>- ilman ALV:iä</span>
                    <span>{totals.totalSubtotal.toFixed(2)} €</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Peruuta
            </Button>
            <Button 
              onClick={handleCreateInvoice}
              disabled={!selectedServiceId || createInvoiceFromService.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              {createInvoiceFromService.isPending ? "Luodaan..." : `Luo ${tositelaji}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
