import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ServiceFormPrintView } from "@/components/ServiceFormPrintView";
import { useServices, useUpdateService } from "@/hooks/useServices";
import { Loader2, ArrowLeft, Printer, Save, Play, Pause, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SignaturePad } from "@/components/SignaturePad";
import { useServiceTimer } from "@/hooks/useServiceTimer";
import { useAuth } from "@/contexts/AuthContext";
import { useTechnicians } from "@/hooks/useTechnicians";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const HuoltoKaavake = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: servicesData, isLoading } = useServices();
  const updateService = useUpdateService();
  const { session } = useAuth();
  const { data: technicians } = useTechnicians();

  // Hae kirjautuneen käyttäjän nimi tekniikoista
  const currentUserTechnician = technicians?.find(
    t => t.user_id === session?.user?.id
  );
  const currentUserName = currentUserTechnician?.nimi || session?.user?.email || '';

  const service = servicesData?.find(s => s.id === id);
  const [suoritettuTyo, setSuoritettuTyo] = useState("");
  const [arvioituAika, setArvioituAika] = useState("");
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [teknikkoAllekirjoitus, setTeknikkoAllekirjoitus] = useState<string | undefined>();
  const [asiakasAllekirjoitus, setAsiakasAllekirjoitus] = useState<string | undefined>();
  const [isTeknikkoSignatureOpen, setIsTeknikkoSignatureOpen] = useState(false);
  const [isAsiakasSignatureOpen, setIsAsiakasSignatureOpen] = useState(false);

  // Service timer
  const { 
    minutes, 
    seconds,
    isActive, 
    startTimer, 
    stopTimer, 
    resetTimer, 
    formatTime 
  } = useServiceTimer(
    service?.id || "", 
    service?.tyoaika_minuutit || 0, 
    service?.ajanlaskuri_kaynnissa || false
  );

  useEffect(() => {
    if (service?.teknikon_muistiinpanot) {
      setSuoritettuTyo(service.teknikon_muistiinpanot);
    }
    if (service?.teknikko_allekirjoitus) {
      setTeknikkoAllekirjoitus(service.teknikko_allekirjoitus);
    }
    if (service?.asiakas_allekirjoitus) {
      setAsiakasAllekirjoitus(service.asiakas_allekirjoitus);
    }
    if (service?.arvioitu_tyoaika_minuutit) {
      const hours = Math.floor(service.arvioitu_tyoaika_minuutit / 60);
      const minutes = service.arvioitu_tyoaika_minuutit % 60;
      setArvioituAika(hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`);
    }
  }, [service]);

  useEffect(() => {
    if (service) {
      document.title = `Huoltokaavake ${service.numero || service.id}`;
    }
  }, [service]);

  const handleSave = async () => {
    if (!service?.id) return;
    
    try {
      // Parse estimated time
      let estimatedMinutes = null;
      if (arvioituAika.trim()) {
        const match = arvioituAika.match(/(\d+)\s*h?\s*(\d+)?\s*m?/i);
        if (match) {
          const hours = parseInt(match[1] || '0');
          const minutes = parseInt(match[2] || '0');
          estimatedMinutes = hours * 60 + minutes;
        }
      }

      await updateService.mutateAsync({
        id: service.id,
        updates: {
          teknikon_muistiinpanot: suoritettuTyo.trim(),
          teknikko_allekirjoitus: teknikkoAllekirjoitus || null,
          asiakas_allekirjoitus: asiakasAllekirjoitus || null,
          arvioitu_tyoaika_minuutit: estimatedMinutes
        }
      });
      toast({
        title: "Tallennettu",
        description: "Muutokset tallennettu onnistuneesti."
      });
    } catch (error) {
      toast({
        title: "Virhe",
        description: "Tallentaminen epäonnistui.",
        variant: "destructive"
      });
    }
  };

  const handleTeknikkoSignatureSave = (signature: string) => {
    setTeknikkoAllekirjoitus(signature);
    toast({
      title: "Allekirjoitus tallennettu",
      description: "Teknikön allekirjoitus tallennettu. Muista tallentaa lomake!",
    });
  };

  const handleAsiakasSignatureSave = (signature: string) => {
    setAsiakasAllekirjoitus(signature);
    toast({
      title: "Allekirjoitus tallennettu",
      description: "Asiakkaan allekirjoitus tallennettu. Muista tallentaa lomake!",
    });
  };

  const handleStopTimer = () => {
    stopTimer();
    toast({
      title: "Työaika tallennettu",
      description: `Työaika: ${formatTime()}`,
    });
  };

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

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Huoltotyötä ei löytynyt</p>
        <Button onClick={() => navigate("/huollot")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Takaisin huoltoihin
        </Button>
      </div>
    );
  }

  // Transform service data to match ServiceFormPrintView interface
  const printData = {
    numero: service.numero || service.id.slice(0, 8),
    created_at: service.created_at,
    asiakas_nimi: service.asiakkaat?.nimi || "Tuntematon asiakas",
    asiakas_puhelin: service.asiakkaat?.puhelin || undefined,
    asiakas_email: service.asiakkaat?.email || undefined,
    asiakas_osoite: service.asiakkaat?.osoite || undefined,
    asiakas_tyyppi: service.asiakkaat?.tyyppi || undefined,
    asiakas_yrityksen_nimi: service.asiakkaat?.yrityksen_nimi || undefined,
    asiakas_y_tunnus: service.asiakkaat?.y_tunnus || undefined,
    asiakas_alv_numero: service.asiakkaat?.alv_numero || undefined,
    merkki: service.laitteet?.merkki || service.merkki || undefined,
    malli: service.laitteet?.malli || service.malli || undefined,
    sarjanumero: service.laitteet?.sarjanumero || service.sarjanumero || undefined,
    kuvaus: service.kuvaus || "",
    teknikon_muistiinpanot: suoritettuTyo || undefined,
    status: service.status || "odottaa",
    arvioitu_valmistumispvm: service.arvioitu_valmistumispvm || undefined,
    valmistunut_pvm: service.valmistunut_pvm || undefined,
    teknikko_nimi: service.tekniikat?.nimi || undefined,
    tyotakuu_kuukautta: service.tyotakuu_kuukautta || undefined,
    osatakuu_kuukautta: service.osatakuu_kuukautta || undefined,
    teknikko_allekirjoitus: teknikkoAllekirjoitus,
    asiakas_allekirjoitus: asiakasAllekirjoitus,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Print controls - hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2 print:hidden">
        <Button variant="outline" onClick={() => navigate("/huollot")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Takaisin
        </Button>
        <Button onClick={handleSave} disabled={updateService.isPending}>
          {updateService.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Tallenna
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
          <p className="text-sm text-muted-foreground">Näin kaavake näyttää tulostettuna</p>
        </div>
      )}

      {/* Service form for printing - always visible at top */}
      <div className={!isPrintMode ? "no-print max-w-4xl mx-auto px-4 pb-6" : ""}>
        <ServiceFormPrintView service={printData} />
      </div>

      {/* Edit form below preview - hidden when printing */}
      {!isPrintMode && (
        <div className="no-print max-w-4xl mx-auto px-4 pb-8 space-y-4 print:hidden">
          {/* Työajan seuranta */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">⏱️ Työajan seuranta</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Seuraa työn todellista kestoa
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Työaika</p>
                  <p className="text-2xl font-bold font-mono">
                    {formatTime()}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {!isActive ? (
                    <Button 
                      onClick={startTimer}
                      size="lg"
                      className="gap-2"
                    >
                      <Play className="h-5 w-5" />
                      Aloita
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleStopTimer}
                      size="lg"
                      variant="secondary"
                      className="gap-2"
                    >
                      <Pause className="h-5 w-5" />
                      Pysäytä
                    </Button>
                  )}
                  
                  <Button 
                    onClick={resetTimer}
                    size="lg"
                    variant="outline"
                    className="gap-2"
                    disabled={isActive}
                  >
                    <RotateCcw className="h-5 w-5" />
                    Nollaa
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Arvioitu työaika */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="arvioitu-aika" className="text-base font-semibold">
                  Arvioitu työaika
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Esim: "2h 30min" tai "45min"
                </p>
                <Input
                  id="arvioitu-aika"
                  value={arvioituAika}
                  onChange={(e) => setArvioituAika(e.target.value)}
                  placeholder="Esim: 2h 30min"
                  className="max-w-sm"
                />
                {service?.tyoaika_minuutit && arvioituAika && (
                  <p className="text-sm mt-2">
                    <span className="font-medium">Todellinen aika:</span> {Math.floor(service.tyoaika_minuutit / 60)}h {service.tyoaika_minuutit % 60}min
                    {(() => {
                      const match = arvioituAika.match(/(\d+)\s*h?\s*(\d+)?\s*m?/i);
                      if (match) {
                        const estimatedMins = (parseInt(match[1] || '0') * 60) + (parseInt(match[2] || '0'));
                        const diff = service.tyoaika_minuutit - estimatedMins;
                        if (diff > 0) {
                          return <span className="text-destructive ml-2">(+{Math.floor(diff / 60)}h {diff % 60}min yli arvion)</span>;
                        } else if (diff < 0) {
                          return <span className="text-success ml-2">(-{Math.floor(Math.abs(diff) / 60)}h {Math.abs(diff) % 60}min alle arvion)</span>;
                        }
                      }
                      return null;
                    })()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Suoritettu työ */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="suoritettu-tyo" className="text-base font-semibold">
                  Suoritettu työ / Teknikön muistiinpanot
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Kirjoita tähän suoritetut toimenpiteet - esikatselu päivittyy yllä automaattisesti
                </p>
                <Textarea
                  id="suoritettu-tyo"
                  value={suoritettuTyo}
                  onChange={(e) => setSuoritettuTyo(e.target.value)}
                  placeholder="Esim:&#10;- Vaihdettu näyttö&#10;- Päivitetty ohjelmistot&#10;- Testattu toimivuus&#10;&#10;Käytetyt varaosat:&#10;- Näyttö, malli XYZ123"
                  className="min-h-[150px] font-mono text-sm"
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {suoritettuTyo.length}/5000 merkkiä
                </p>
              </div>
            </div>
          </div>

          {/* Teknikön allekirjoitus */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <Collapsible open={isTeknikkoSignatureOpen} onOpenChange={setIsTeknikkoSignatureOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex justify-between items-center p-0 hover:bg-transparent">
                  <h3 className="text-base font-semibold">📝 Teknikön allekirjoitus (vapaaehtoinen)</h3>
                  <ChevronDown className={`h-5 w-5 transition-transform ${isTeknikkoSignatureOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Kirjoita nimi tai piirrä allekirjoitus
                  </p>
                  <SignaturePad 
                    onSave={handleTeknikkoSignatureSave}
                    existingSignature={teknikkoAllekirjoitus}
                    signatureType="technician"
                    defaultName={currentUserName}
                  />
                  {teknikkoAllekirjoitus && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-2">Tallennettu allekirjoitus:</p>
                      <img src={teknikkoAllekirjoitus} alt="Teknikön allekirjoitus" className="border rounded" />
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Asiakkaan allekirjoitus */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <Collapsible open={isAsiakasSignatureOpen} onOpenChange={setIsAsiakasSignatureOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex justify-between items-center p-0 hover:bg-transparent">
                  <h3 className="text-base font-semibold">📝 Asiakkaan allekirjoitus (vapaaehtoinen)</h3>
                  <ChevronDown className={`h-5 w-5 transition-transform ${isAsiakasSignatureOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Kirjoita nimi tai piirrä allekirjoitus
                  </p>
                  <SignaturePad 
                    onSave={handleAsiakasSignatureSave}
                    existingSignature={asiakasAllekirjoitus}
                    signatureType="customer"
                  />
                  {asiakasAllekirjoitus && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-2">Tallennettu allekirjoitus:</p>
                      <img src={asiakasAllekirjoitus} alt="Asiakkaan allekirjoitus" className="border rounded" />
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      )}

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
          @page {
            size: A4;
            margin: 8mm;
            padding: 0;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default HuoltoKaavake;
