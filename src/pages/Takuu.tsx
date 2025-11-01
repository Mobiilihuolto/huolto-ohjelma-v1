import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
  Download,
  Mail
} from "lucide-react";
import { useWarranties, useWarrantyStats } from "@/hooks/useWarranties";
import { useWarrantySettings, useUpdateWarrantySetting, useDeleteWarrantySetting } from "@/hooks/useWarrantySettings";
import { WarrantyForm } from "@/components/WarrantyForm";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx';
import { toast } from "@/hooks/use-toast";

const Takuu = () => {
  const [activeTab, setActiveTab] = useState("takuut");
  const [searchTerm, setSearchTerm] = useState("");
  const [showWarrantyForm, setShowWarrantyForm] = useState(false);
  const [editingWarrantySetting, setEditingWarrantySetting] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<"kaikki" | "voimassa" | "paattyy_pian" | "paattynyt">("kaikki");
  const [selectedWarranties, setSelectedWarranties] = useState<Set<string>>(new Set());

  const { data: warranties, isLoading: warrantiesLoading } = useWarranties();
  const warrantyStats = useWarrantyStats(warranties);
  const { data: warrantySettings } = useWarrantySettings();
  const updateWarrantySetting = useUpdateWarrantySetting();
  const deleteWarrantySetting = useDeleteWarrantySetting();

  // Filter warranties
  const filteredWarranties = warranties?.filter(warranty => {
    const matchesSearch = !searchTerm || 
      warranty.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warranty.asiakasNimi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warranty.laiteMerkki.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warranty.laiteMalli.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "kaikki" || 
      warranty.tyotakuuStatus === statusFilter || 
      warranty.osatakuuStatus === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  // Bulk actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWarranties(new Set(filteredWarranties.map(w => w.id)));
    } else {
      setSelectedWarranties(new Set());
    }
  };

  const handleSelectWarranty = (warrantyId: string, checked: boolean) => {
    const newSelection = new Set(selectedWarranties);
    if (checked) {
      newSelection.add(warrantyId);
    } else {
      newSelection.delete(warrantyId);
    }
    setSelectedWarranties(newSelection);
  };

  const exportToExcel = () => {
    const selectedWarrantyData = filteredWarranties.filter(w => selectedWarranties.has(w.id));
    
    const excelData = selectedWarrantyData.map(warranty => ({
      'Huoltonumero': warranty.numero,
      'Asiakas': warranty.asiakasNimi,
      'Laite': `${warranty.laiteMerkki} ${warranty.laiteMalli}`,
      'Työtakuu (kk)': warranty.tyotakuuKuukautta,
      'Työtakuu status': warranty.tyotakuuStatus === 'voimassa' ? 'Voimassa' : 
                       warranty.tyotakuuStatus === 'paattyy_pian' ? 'Päättyy pian' : 'Päättynyt',
      'Työtakuu päättyy': format(warranty.tyotakuuPaattyy, "dd.MM.yyyy", { locale: fi }),
      'Työtakuu päiviä jäljellä': warranty.tyotakuuPaivia,
      'Osatakuu (kk)': warranty.osatakuuKuukautta,
      'Osatakuu status': warranty.osatakuuStatus === 'voimassa' ? 'Voimassa' : 
                        warranty.osatakuuStatus === 'paattyy_pian' ? 'Päättyy pian' : 'Päättynyt',
      'Osatakuu päättyy': format(warranty.osatakuuPaattyy, "dd.MM.yyyy", { locale: fi }),
      'Osatakuu päiviä jäljellä': warranty.osatakuuPaivia,
      'Luovutettu': warranty.luovutettuPvm 
        ? format(new Date(warranty.luovutettuPvm), "dd.MM.yyyy", { locale: fi })
        : warranty.valmistumispvm 
          ? format(new Date(warranty.valmistumispvm), "dd.MM.yyyy", { locale: fi })
          : "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Takuut");
    
    const fileName = `takuut_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Onnistui!",
      description: `${selectedWarrantyData.length} takuuta viety Excel-tiedostoon: ${fileName}`,
    });
    
    setSelectedWarranties(new Set());
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "voimassa":
        return <Badge variant="secondary" className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Voimassa</Badge>;
      case "paattyy_pian":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700"><AlertTriangle className="w-3 h-3 mr-1" />Päättyy pian</Badge>;
      case "paattynyt":
        return <Badge variant="secondary" className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Päättynyt</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Takuu</h1>
        <p className="text-muted-foreground">Hallitse takuuaikoja ja seuraa voimassaolevia takuita</p>
      </div>

      {/* Statistics Cards */}
      {warrantyStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Työtakuut voimassa</p>
                  <p className="text-2xl font-bold text-green-600">{warrantyStats.voimassaTyotakuut}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Osatakuut voimassa</p>
                  <p className="text-2xl font-bold text-green-600">{warrantyStats.voimassaOsatakuut}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Päättyy pian</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {warrantyStats.paattyvatPianTyotakuut + warrantyStats.paattyvatPianOsatakuut}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Yhteensä</p>
                  <p className="text-2xl font-bold">{warrantyStats.yhteensa}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="takuut">Aktiiviset takuut</TabsTrigger>
          <TabsTrigger value="asetukset">Takuuasetukset</TabsTrigger>
        </TabsList>

        <TabsContent value="takuut" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Hae huoltonumerolla, asiakkaalla tai laitteella..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "kaikki" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("kaikki")}
                  >
                    Kaikki
                  </Button>
                  <Button
                    variant={statusFilter === "voimassa" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("voimassa")}
                  >
                    Voimassa
                  </Button>
                  <Button
                    variant={statusFilter === "paattyy_pian" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("paattyy_pian")}
                  >
                    Päättyy pian
                  </Button>
                  <Button
                    variant={statusFilter === "paattynyt" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("paattynyt")}
                  >
                    Päättynyt
                  </Button>
                </div>
              </div>
              
              {filteredWarranties.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Näytetään {filteredWarranties.length} takuuta
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bulk Actions Bar */}
          {selectedWarranties.size > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {selectedWarranties.size} takuuta valittu
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWarranties(new Set())}
                    >
                      Tyhjennä valinta
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToExcel}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Vie Exceliin
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Tulossa pian",
                          description: "Muistutusviestit ominaisuus toteutetaan myöhemmin",
                        });
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Lähetä muistutukset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warranties Table */}
          <Card>
            <CardHeader>
              <CardTitle>Takuut</CardTitle>
            </CardHeader>
            <CardContent>
              {warrantiesLoading ? (
                <div className="text-center py-8">Ladataan takuutietoja...</div>
              ) : filteredWarranties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== "kaikki" ? "Ei tuloksia hakuehdoilla" : "Ei takuutietoja"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedWarranties.size === filteredWarranties.length && filteredWarranties.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Huolto</TableHead>
                        <TableHead>Asiakas</TableHead>
                        <TableHead>Laite</TableHead>
                        <TableHead>Työtakuu</TableHead>
                        <TableHead>Osatakuu</TableHead>
                        <TableHead>Luovutettu</TableHead>
                        <TableHead>Toiminnot</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWarranties.map((warranty) => (
                        <TableRow key={warranty.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedWarranties.has(warranty.id)}
                              onCheckedChange={(checked) => handleSelectWarranty(warranty.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{warranty.numero}</TableCell>
                          <TableCell>
                            <Link 
                              to={`/asiakkaat?id=${warranty.asiakas_id}`}
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {warranty.asiakasNimi}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link 
                              to={`/laitteet?id=${warranty.laite_id}`}
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {warranty.laiteMerkki} {warranty.laiteMalli}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </TableCell>
                           <TableCell>
                             <div className="space-y-1">
                               {warranty.tyotakuuKuukautta > 0 && (
                                 <>
                                   {getStatusBadge(warranty.tyotakuuStatus)}
                                   <div className="text-xs text-muted-foreground">
                                     <div>Alkaa: {format(new Date(warranty.luovutettuPvm || warranty.valmistumispvm), "dd.MM.yyyy", { locale: fi })}</div>
                                     <div>Päättyy: {format(warranty.tyotakuuPaattyy, "dd.MM.yyyy", { locale: fi })}</div>
                                     <div className="font-medium">
                                       {warranty.tyotakuuPaivia > 0 ? `Voimassa ${warranty.tyotakuuPaivia} pv` : "Päättynyt"}
                                     </div>
                                   </div>
                                 </>
                               )}
                               {warranty.tyotakuuKuukautta === 0 && (
                                 <span className="text-muted-foreground text-sm">-</span>
                               )}
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="space-y-1">
                               {warranty.osatakuuKuukautta > 0 && (
                                 <>
                                   {getStatusBadge(warranty.osatakuuStatus)}
                                   <div className="text-xs text-muted-foreground">
                                     <div>Alkaa: {format(new Date(warranty.luovutettuPvm || warranty.valmistumispvm), "dd.MM.yyyy", { locale: fi })}</div>
                                     <div>Päättyy: {format(warranty.osatakuuPaattyy, "dd.MM.yyyy", { locale: fi })}</div>
                                     <div className="font-medium">
                                       {warranty.osatakuuPaivia > 0 ? `Voimassa ${warranty.osatakuuPaivia} pv` : "Päättynyt"}
                                     </div>
                                   </div>
                                 </>
                               )}
                               {warranty.osatakuuKuukautta === 0 && (
                                 <span className="text-muted-foreground text-sm">-</span>
                               )}
                             </div>
                           </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {warranty.luovutettuPvm 
                                ? format(new Date(warranty.luovutettuPvm), "dd.MM.yyyy", { locale: fi })
                                : warranty.valmistumispvm 
                                  ? format(new Date(warranty.valmistumispvm), "dd.MM.yyyy", { locale: fi })
                                  : "-"
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link to={`/huollot?id=${warranty.id}`}>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asetukset" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Takuuasetukset</h3>
              <p className="text-muted-foreground">Hallitse takuutyyppejä ja oletusarvoja</p>
            </div>
            <Button onClick={() => setShowWarrantyForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Uusi takuuasetus
            </Button>
          </div>

          {(showWarrantyForm || editingWarrantySetting) && (
            <WarrantyForm 
              onCancel={() => {
                setShowWarrantyForm(false);
                setEditingWarrantySetting(null);
              }}
              editingSetting={editingWarrantySetting}
            />
          )}

          <Card>
            <CardContent className="p-6">
              {warrantySettings?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Ei takuuasetuksia. Luo ensimmäinen takuuasetus yllä olevalla painikkeella.
                </div>
              ) : (
                <div className="space-y-4">
                  {warrantySettings?.map((setting) => (
                    <Card key={setting.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{setting.nimi}</h4>
                          {setting.kuvaus && (
                            <p className="text-sm text-muted-foreground">{setting.kuvaus}</p>
                          )}
                          <div className="flex gap-4 text-sm">
                            <span>Työtakuu: {setting.oletustyotakuu_kuukautta || 0} kk</span>
                            <span>Osatakuu: {setting.oletusosatakuu_kuukautta || 0} kk</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingWarrantySetting(setting)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteWarrantySetting.mutate(setting.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Takuu;