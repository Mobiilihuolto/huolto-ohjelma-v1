import { useState } from "react";
import { useLicenses, useUpdateLicenseNotes, useRevokeLicense } from "@/hooks/useLicenses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Copy, Eye, Trash2, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function LicenseList() {
  const { data: licenses, isLoading } = useLicenses();
  const updateNotes = useUpdateLicenseNotes();
  const revokeLicense = useRevokeLicense();
  const [editingNotes, setEditingNotes] = useState<{ id: string; notes: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopioitu leikepöydälle!");
  };

  const getLicenseStatus = (license: any) => {
    if (license.is_used) {
      if (license.expires_at && new Date(license.expires_at) < new Date()) {
        return { label: "Vanhentunut", color: "bg-red-500", icon: XCircle };
      }
      return { label: "Käytössä", color: "bg-blue-500", icon: CheckCircle };
    }
    return { label: "Käyttämätön", color: "bg-green-500", icon: Clock };
  };

  const filteredLicenses = licenses?.filter((license) => {
    const search = searchTerm.toLowerCase();
    return (
      license.license_key.toLowerCase().includes(search) ||
      license.notes?.toLowerCase().includes(search) ||
      license.max_users?.toString().includes(search)
    );
  });

  const handleSaveNotes = () => {
    if (!editingNotes) return;
    updateNotes.mutate(
      { id: editingNotes.id, notes: editingNotes.notes },
      {
        onSuccess: () => setEditingNotes(null),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lisenssien hallinta</CardTitle>
        <CardDescription>
          Hallitse luotuja lisenssejä ja seuraa niiden tilaa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Hae lisenssejä..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Badge variant="outline">
            Yhteensä: {licenses?.length || 0}
          </Badge>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lisenssinavain</TableHead>
                <TableHead>Käyttäjät</TableHead>
                <TableHead>Tila</TableHead>
                <TableHead>Voimassa</TableHead>
                <TableHead>Muistiinpanot</TableHead>
                <TableHead className="text-right">Toiminnot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses && filteredLicenses.length > 0 ? (
                filteredLicenses.map((license) => {
                  const status = getLicenseStatus(license);
                  const StatusIcon = status.icon;

                  return (
                    <TableRow key={license.id}>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{license.license_key}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(license.license_key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{license.max_users || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${status.color} text-white border-0`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {license.expires_at
                          ? format(new Date(license.expires_at), "dd.MM.yyyy")
                          : "Ikuinen"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {license.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Lisenssin tiedot</DialogTitle>
                                <DialogDescription>
                                  Tarkastele ja muokkaa lisenssin tietoja
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium">Lisenssinavain</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Input
                                      readOnly
                                      value={license.license_key}
                                      className="font-mono font-bold"
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => copyToClipboard(license.license_key)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Käyttäjämäärä</Label>
                                    <p className="text-2xl font-bold">{license.max_users}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Tila</Label>
                                    <div className="mt-1">
                                      <Badge className={`${status.color} text-white border-0`}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {status.label}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Luotu</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(license.created_at), "dd.MM.yyyy HH:mm")}
                                    </p>
                                  </div>
                                  {license.activated_at && (
                                    <div>
                                      <Label className="text-sm font-medium">Aktivoitu</Label>
                                      <p className="text-sm text-muted-foreground">
                                        {format(new Date(license.activated_at), "dd.MM.yyyy HH:mm")}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <Label className="text-sm font-medium">Voimassaoloaika</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {license.expires_at
                                      ? format(new Date(license.expires_at), "dd.MM.yyyy")
                                      : "Ikuinen"}
                                  </p>
                                </div>

                                <div>
                                  <Label htmlFor="notes" className="text-sm font-medium">
                                    Muistiinpanot
                                  </Label>
                                  <Textarea
                                    id="notes"
                                    value={editingNotes?.id === license.id ? editingNotes.notes : license.notes || ""}
                                    onChange={(e) =>
                                      setEditingNotes({ id: license.id, notes: e.target.value })
                                    }
                                    rows={4}
                                    className="mt-1"
                                  />
                                  {editingNotes?.id === license.id && (
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        size="sm"
                                        onClick={handleSaveNotes}
                                        disabled={updateNotes.isPending}
                                      >
                                        {updateNotes.isPending ? "Tallennetaan..." : "Tallenna"}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingNotes(null)}
                                      >
                                        Peruuta
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Mitätöi lisenssi?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Haluatko varmasti mitätöidä tämän lisenssin? Tätä toimintoa ei voi
                                  peruuttaa.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Peruuta</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => revokeLicense.mutate(license.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Mitätöi
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm
                      ? "Ei hakutuloksia."
                      : "Ei luotuja lisenssejä. Luo ensimmäinen lisenssi yllä."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
