import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InvoicePrintView } from "@/components/InvoicePrintView";
import { useInvoices } from "@/hooks/useInvoices";
import { Loader2, ArrowLeft, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const LaskuEsikatselu = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoices, isLoading } = useInvoices("");
  const [serviceData, setServiceData] = useState<any>(null);
  const [isPrintMode, setIsPrintMode] = useState(false);

  const invoice = invoices?.find(inv => inv.id === id);

  useEffect(() => {
    const fetchServiceData = async () => {
      if (invoice?.huolto_id) {
        const { data: service } = await supabase
          .from("huollot")
          .select(`
            *,
            laitteet (
              merkki,
              malli,
              sarjanumero
            )
          `)
          .eq("id", invoice.huolto_id)
          .single();
        setServiceData(service);
      }
    };
    
    fetchServiceData();
  }, [invoice?.huolto_id]);

  useEffect(() => {
    if (invoice) {
      const documentType = invoice.tositelaji === 'kuitti' ? 'Kuitti' : 'Lasku';
      document.title = `${documentType} ${invoice.numero}`;
    }
  }, [invoice]);

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrintMode(false), 500);
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Laskua ei löytynyt</p>
        <Button onClick={() => navigate("/laskutus")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Takaisin laskutukseen
        </Button>
      </div>
    );
  }

  const documentType = invoice.tositelaji === 'kuitti' ? 'Kuitti' : 'Lasku';

  return (
    <div className="min-h-screen bg-background">
      {/* Print controls - hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2 print:hidden">
        <Button variant="outline" onClick={() => navigate("/laskutus")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Takaisin
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Tallenna PDF / Tulosta
        </Button>
      </div>

      {/* Live preview label */}
      {!isPrintMode && (
        <div className="no-print text-center pt-20 pb-4 print:hidden">
          <h2 className="text-xl font-semibold text-muted-foreground">📄 Esikatselu</h2>
          <p className="text-sm text-muted-foreground">Näin {documentType.toLowerCase()} näyttää tulostettuna</p>
        </div>
      )}

      {/* Invoice for printing - always visible at top */}
      <div className={!isPrintMode ? "no-print max-w-4xl mx-auto px-4 pb-6" : ""}>
        <InvoicePrintView invoice={invoice as any} service={serviceData} />
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LaskuEsikatselu;
