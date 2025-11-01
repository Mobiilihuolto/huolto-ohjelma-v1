import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddCustomer, useUpdateCustomer, Customer } from "@/hooks/useCustomers";

// Y-tunnus validation (Finnish business ID format)
const validateYTunnus = (value: string) => {
  if (!value) return true; // Optional field
  const ytunnusRegex = /^\d{7}-\d$/;
  return ytunnusRegex.test(value);
};

// ALV-numero validation (EU VAT format)
const validateAlvNumero = (value: string) => {
  if (!value) return true; // Optional field
  const alvRegex = /^[A-Z]{2}\d{8,12}$/;
  return alvRegex.test(value);
};

const formSchema = z.object({
  nimi: z.string().min(1, "Nimi on pakollinen"),
  email: z.string().email("Virheellinen sähköpostiosoite").optional().or(z.literal("")),
  puhelin: z.string().optional(),
  osoite: z.string().optional(),
  tyyppi: z.enum(["henkilö", "yritys"]).optional(),
  yksityiset_muistiinpanot: z.string().optional(),
  yrityksen_nimi: z.string().optional(),
  y_tunnus: z.string().optional().refine(validateYTunnus, {
    message: "Virheellinen Y-tunnus (muoto: 1234567-8)"
  }),
  alv_numero: z.string().optional().refine(validateAlvNumero, {
    message: "Virheellinen ALV-numero (muoto: FI12345678)"
  }),
});

type FormData = z.infer<typeof formSchema>;

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
}

const CustomerForm = ({ open, onOpenChange, customer }: CustomerFormProps) => {
  const [loading, setLoading] = useState(false);
  const addCustomer = useAddCustomer();
  const updateCustomer = useUpdateCustomer();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nimi: customer?.nimi || "",
      email: customer?.email || "",
      puhelin: customer?.puhelin || "",
      osoite: customer?.osoite || "",
      tyyppi: (customer?.tyyppi as "henkilö" | "yritys") || "henkilö",
      yksityiset_muistiinpanot: customer?.yksityiset_muistiinpanot || "",
      yrityksen_nimi: customer?.yrityksen_nimi || "",
      y_tunnus: customer?.y_tunnus || "",
      alv_numero: customer?.alv_numero || "",
    },
  });

  // Päivitä lomakkeen arvot kun customer-prop muuttuu
  useEffect(() => {
    if (customer) {
      form.reset({
        nimi: customer.nimi || "",
        email: customer.email || "",
        puhelin: customer.puhelin || "",
        osoite: customer.osoite || "",
        tyyppi: (customer.tyyppi as "henkilö" | "yritys") || "henkilö",
        yksityiset_muistiinpanot: customer.yksityiset_muistiinpanot || "",
        yrityksen_nimi: customer.yrityksen_nimi || "",
        y_tunnus: customer.y_tunnus || "",
        alv_numero: customer.alv_numero || "",
      });
    } else {
      form.reset({
        nimi: "",
        email: "",
        puhelin: "",
        osoite: "",
        tyyppi: "henkilö",
        yksityiset_muistiinpanot: "",
        yrityksen_nimi: "",
        y_tunnus: "",
        alv_numero: "",
      });
    }
  }, [customer, form]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const customerData = {
        nimi: data.nimi,
        email: data.email || null,
        puhelin: data.puhelin || null,
        osoite: data.osoite || null,
        tyyppi: data.tyyppi || "henkilö",
        yksityiset_muistiinpanot: data.yksityiset_muistiinpanot || null,
        yrityksen_nimi: data.yrityksen_nimi || null,
        y_tunnus: data.y_tunnus || null,
        alv_numero: data.alv_numero || null,
      };

      if (customer) {
        await updateCustomer.mutateAsync({
          id: customer.id,
          customer: customerData,
        });
      } else {
        await addCustomer.mutateAsync(customerData);
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving customer:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Muokkaa asiakasta" : "Uusi asiakas"}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? "Muokkaa asiakkaan tietoja alla olevilla kentillä."
              : "Lisää uusi asiakas täyttämällä alla olevat kentät."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nimi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nimi *</FormLabel>
                  <FormControl>
                    <Input placeholder="Asiakkaan nimi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tyyppi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tyyppi</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Valitse tyyppi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="henkilö">Henkilö</SelectItem>
                      <SelectItem value="yritys">Yritys</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sähköposti</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="asiakas@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="puhelin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Puhelinnumero</FormLabel>
                  <FormControl>
                    <Input placeholder="+358 40 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="osoite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Osoite</FormLabel>
                  <FormControl>
                    <Input placeholder="Esimerkkikatu 1, 00100 Helsinki" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company-specific fields - show only when tyyppi is "yritys" */}
            {form.watch("tyyppi") === "yritys" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="yrityksen_nimi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yrityksen nimi</FormLabel>
                      <FormControl>
                        <Input placeholder="esim. Autopesulla Oy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="y_tunnus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Y-tunnus</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567-8" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="alv_numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ALV-numero</FormLabel>
                        <FormControl>
                          <Input placeholder="FI12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="yksityiset_muistiinpanot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yksityiset muistiinpanot <span className="text-sm text-muted-foreground">(Ei näy asiakkaalle)</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Sisäiset muistiinpanot asiakkaasta..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Peruuta
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Tallennetaan..." : customer ? "Päivitä" : "Lisää asiakas"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerForm;