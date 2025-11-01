import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Key } from "lucide-react";

export function LicenseGenerator() {
  const [loading, setLoading] = useState(false);
  const [maxUsers, setMaxUsers] = useState(5);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(365);
  const [notes, setNotes] = useState('');
  const [generatedLicense, setGeneratedLicense] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-license', {
        body: {
          maxUsers,
          expiresInDays,
          notes
        }
      });

      if (error) throw error;

      setGeneratedLicense(data.license.license_key);
      toast.success('Lisenssinavain luotu!');
      
      // Reset form
      setNotes('');
    } catch (error: any) {
      console.error('Error generating license:', error);
      toast.error(error.message || 'Lisenssin luominen epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLicense) {
      navigator.clipboard.writeText(generatedLicense);
      toast.success('Lisenssinavain kopioitu leikepöydälle!');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Lisenssigeneraattori
        </CardTitle>
        <CardDescription>
          Luo uusia lisenssinavaimia myyntiä varten
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="maxUsers">Maksimi käyttäjämäärä</Label>
          <Input
            id="maxUsers"
            type="number"
            min="1"
            max="999"
            value={maxUsers}
            onChange={(e) => setMaxUsers(parseInt(e.target.value) || 1)}
            placeholder="Esim. 1, 5, 10, 50..."
          />
          <p className="text-xs text-muted-foreground">Anna haluamasi käyttäjämäärä (1-999)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expires">Voimassaolo (päiviä)</Label>
          <Input
            id="expires"
            type="number"
            min="1"
            placeholder="365 (tyhjä = ikuinen)"
            value={expiresInDays || ''}
            onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Muistiinpanot</Label>
          <Textarea
            id="notes"
            placeholder="Esim: Myyty asiakkaalle ABC Oy"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Luodaan...' : 'Luo Lisenssinavain'}
        </Button>

        {generatedLicense && (
          <div className="mt-4 p-4 bg-accent/50 rounded-lg space-y-2">
            <Label className="text-sm font-semibold">Luotu lisenssinavain:</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={generatedLicense}
                className="font-mono text-base font-bold"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Tallenna tämä lisenssinavain! Lähetä se asiakkaalle yhdessä sovelluslinkin kanssa.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
