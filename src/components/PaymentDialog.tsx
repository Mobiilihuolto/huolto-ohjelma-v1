import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";

interface PaymentDialogProps {
  children: React.ReactNode;
  onConfirm: (paymentMethod: string, paymentDate: Date) => void;
  isPending?: boolean;
}

export function PaymentDialog({ children, onConfirm, isPending = false }: PaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const { data: paymentMethods } = usePaymentMethods();

  const handleConfirm = () => {
    if (paymentMethod) {
      onConfirm(paymentMethod, paymentDate);
      setOpen(false);
      setPaymentMethod("");
      setPaymentDate(new Date());
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setPaymentMethod("");
      setPaymentDate(new Date());
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Lisää maksutapa
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => date && setPaymentDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Peruuta
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!paymentMethod || isPending}
          >
            {isPending ? "Merkitään..." : "Merkitse maksetuksi"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
