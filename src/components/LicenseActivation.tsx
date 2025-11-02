import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface LicenseActivationProps {
  onActivated: (userId: string, companyId: string) => void;
}

export function LicenseActivation({ onActivated }: LicenseActivationProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const formatLicenseKey = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    const parts = [];

    if (cleaned.length > 0) parts.push('HU');
    if (cleaned.length > 0) parts.push(cleaned.substring(0, 4));
    if (cleaned.length > 4) parts.push(cleaned.substring(4, 8));
    if (cleaned.length > 8) parts.push(cleaned.substring(8, 12));
    if (cleaned.length > 12) parts.push(cleaned.substring(12, 16));

    return parts.join('-');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value);
    setLicenseKey(formatted);
    setError('');
  };

  const handleActivate = async () => {
    setIsActivating(true);
    setError('');
    setSuccess(false);

    try {
      if (!window.electron) {
        throw new Error('Electron API ei ole saatavilla');
      }

      const result = await window.electron.activateLicense(licenseKey);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onActivated(result.userId, result.companyId);
        }, 1500);
      } else {
        setError(result.message || 'Lisenssin aktivointi epäonnistui');
      }
    } catch (err) {
      setError('Virhe lisenssin aktivoinnissa: ' + (err as Error).message);
    } finally {
      setIsActivating(false);
    }
  };

  const isValidFormat = /^HU-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(licenseKey);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Huoltosovellus</CardTitle>
          <CardDescription>
            Aktivoi ohjelmisto syöttämällä lisenssiavain
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Lisenssi aktivoitu onnistuneesti! Sovellus käynnistyy hetken kuluttua...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="license-key" className="text-sm font-medium">
              Lisenssiavain
            </label>
            <Input
              id="license-key"
              placeholder="HU-XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={handleInputChange}
              maxLength={24}
              className="font-mono text-center text-lg tracking-wider"
              disabled={isActivating || success}
            />
            <p className="text-xs text-muted-foreground text-center">
              Syötä ostamasi 20-merkkinen lisenssiavain
            </p>
          </div>

          <Button
            onClick={handleActivate}
            disabled={!isValidFormat || isActivating || success}
            className="w-full"
            size="lg"
          >
            {isActivating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aktivoidaan...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Aktivoitu
              </>
            ) : (
              'Aktivoi lisenssi'
            )}
          </Button>

          <div className="mt-6 pt-6 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold">Tarvitsetko apua?</p>
              <p>Jos sinulla on kysymyksiä lisenssistäsi, ota yhteyttä myyjään.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
