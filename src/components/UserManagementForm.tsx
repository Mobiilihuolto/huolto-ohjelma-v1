import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, UserPlus, UserMinus, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useUsersWithRoles, useAddUserRole, useRemoveUserRole, useCurrentUserRoles, useDeleteUser } from "@/hooks/useUserRoles";
import { useAuth } from "@/contexts/AuthContext";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const roleColors = {
  admin: "bg-destructive text-destructive-foreground",
  teknikko: "bg-primary text-primary-foreground",
  kayttaja: "bg-secondary text-secondary-foreground",
};

const roleNames = {
  admin: "Pääkäyttäjä",
  teknikko: "Teknikko",
  kayttaja: "Käyttäjä",
};

export function UserManagementForm() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useUsersWithRoles();
  const { data: currentUserRoles } = useCurrentUserRoles();
  const addRole = useAddUserRole();
  const removeRole = useRemoveUserRole();
  const deleteUser = useDeleteUser();
  
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teknikko' | 'kayttaja'>("kayttaja");

  const isAdmin = currentUserRoles?.includes('admin');

  const handleAddRole = () => {
    if (!selectedUserId || !selectedRole) return;
    
    addRole.mutate({ userId: selectedUserId, role: selectedRole }, {
      onSuccess: () => {
        setSelectedUserId("");
        setSelectedRole("kayttaja");
      },
    });
  };

  const handleRemoveRole = (userId: string, role: 'admin' | 'teknikko' | 'kayttaja') => {
    if (!confirm(`Haluatko varmasti poistaa roolin "${roleNames[role]}" käyttäjältä?`)) {
      return;
    }
    
    removeRole.mutate({ userId, role });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Sinulla ei ole oikeuksia hallita käyttäjiä. Vain pääkäyttäjät voivat hallita käyttäjärooleja.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Käyttäjien hallinta
        </CardTitle>
        <CardDescription>
          Hallitse käyttäjien rooleja ja oikeuksia. Vain pääkäyttäjät voivat muokata rooleja.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add role section */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <h3 className="text-sm font-medium mb-3">Lisää rooli käyttäjälle</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Valitse käyttäjä" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email} {user.full_name ? `(${user.email})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as any)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Pääkäyttäjä</SelectItem>
                <SelectItem value="teknikko">Teknikko</SelectItem>
                <SelectItem value="kayttaja">Käyttäjä</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleAddRole} 
              disabled={!selectedUserId || addRole.isPending}
              className="w-full sm:w-auto"
            >
              {addRole.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Lisää rooli
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Users list */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Käyttäjät ja roolit</h3>
          
          {!users || users.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ei käyttäjiä.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{user.full_name || user.email}</p>
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="text-xs">Sinä</Badge>
                      )}
                    </div>
                    {user.full_name && (
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Rekisteröity: {new Date(user.created_at).toLocaleDateString("fi-FI")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-wrap gap-2">
                      {user.roles.length === 0 ? (
                        <Badge variant="outline" className="text-xs">
                          Ei rooleja
                        </Badge>
                      ) : (
                        user.roles.map((role) => (
                          <div key={role} className="flex items-center gap-1">
                            <Badge className={roleColors[role as keyof typeof roleColors]}>
                              {roleNames[role as keyof typeof roleNames]}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive/10"
                              onClick={() => handleRemoveRole(user.id, role as 'admin' | 'teknikko' | 'kayttaja')}
                              disabled={removeRole.isPending}
                            >
                              <UserMinus className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={user.id === currentUser?.id}
                          title={user.id === currentUser?.id ? "Et voi poistaa itseäsi" : "Poista käyttäjä"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Poista käyttäjä</AlertDialogTitle>
                          <AlertDialogDescription>
                            Haluatko varmasti poistaa käyttäjän <strong>{user.full_name || user.email}</strong>?
                            <br /><br />
                            Tämä poistaa käyttäjän profiilin ja kaikki roolit.
                            <br />
                            <strong className="text-destructive">Tätä toimintoa ei voi perua.</strong>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Peruuta</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteUser.mutate(user.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Poista käyttäjä
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info section */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Roolien selitykset:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Pääkäyttäjä:</strong> Täydet oikeudet - voi hallita käyttäjiä, 
                muokata kaikkia asetuksia (yritys, numerointi, hinnoittelu, ALV, maksutavat, 
                valmistajat, takuu, huoltostatukset, ilmoitukset, varasto, laskutus), 
                luoda ja muokata laskuja, asiakkaita, laitteita, huoltoja ja varastoa.
              </li>
              <li>
                <strong>Teknikko:</strong> Voi luoda ja muokata asiakkaita, laitteita, 
                huoltoja ja varastoa. Näkee kaikki tiedot mutta ei voi hallita käyttäjiä, 
                asetuksia tai laskutusta.
              </li>
              <li>
                <strong>Käyttäjä:</strong> Voi tarkastella asiakkaita, laitteita, huoltoja ja varastoa. 
                Ei voi tehdä muutoksia, lisätä uusia tai poistaa tietoja. 
                Ei pääsyä laskutukseen tai asetuksiin.
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
