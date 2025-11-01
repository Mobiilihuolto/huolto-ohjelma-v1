import React from 'react';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface InvoiceLine {
  kuvaus: string;
  maara: number;
  yksikko: string;
  yksikkohinta: number;
  yhteensa: number;
}

interface InvoiceData {
  numero: string;
  laskun_pvm: string;
  erapaiva: string;
  asiakas_nimi: string;
  asiakas_yhteyshenkilo?: string;
  asiakas_osoite?: string;
  asiakas_email?: string;
  asiakas_puhelin?: string;
  asiakas_y_tunnus?: string;
  asiakas_alv_numero?: string;
  rivit: InvoiceLine[];
  summa_ilman_alvia: number;
  alv_summa: number;
  kokonaissumma: number;
  alv_prosentti?: number;
  huomautukset?: string;
  tositelaji?: string;
  status?: string;
  maksuehto_paivat?: number;
  viivastyskulut?: number;
}

interface ServiceData {
  numero: string;
  kuvaus: string;
  merkki?: string;
  malli?: string;
  sarjanumero?: string;
  tyotakuu_kuukautta?: number;
  osatakuu_kuukautta?: number;
  valmistunut_pvm?: string;
  teknikon_muistiinpanot?: string;
  Laitteet?: {
    merkki?: string;
    malli?: string;
    sarjanumero?: string;
  };
}

interface InvoicePrintViewProps {
  invoice: InvoiceData;
  service?: ServiceData;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    business_id?: string;
    logo_url?: string;
  };
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({
  invoice,
  service,
  companyInfo = {
    name: "Huoltoyritys Oy",
    address: "Yrityksen osoite\n00100 Helsinki",
    phone: "010 123 4567",
    email: "info@huoltoyritys.fi",
    business_id: "1234567-8"
  }
}) => {
  const { data: companySettings } = useCompanySettings();
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: fi });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 text-black font-sans text-sm print:p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-3 border-b-2 border-gray-800">
        <div className="flex items-center gap-4">
          {companySettings?.logo_url && (
            <img 
              src={companySettings.logo_url} 
              alt="Logo" 
              className="h-16 w-auto object-contain"
              style={{ maxHeight: '64px' }}
            />
          )}
          <div>
            <div className="text-sm">
              <p className="font-semibold">{companySettings?.yrityksen_nimi || companyInfo?.name}</p>
              <p className="whitespace-pre-line">{companySettings?.osoite ? 
                `${companySettings.osoite}${companySettings.postinumero ? '\n' + companySettings.postinumero : ''}${companySettings.postitoimipaikka ? ' ' + companySettings.postitoimipaikka : ''}` : 
                companyInfo?.address}</p>
              <p>Puh: {companySettings?.puhelin || companyInfo?.phone}</p>
              <p>Email: {companySettings?.email || companyInfo?.email}</p>
              {(companySettings?.y_tunnus || companyInfo?.business_id) && (
                <p>Y-tunnus: {companySettings?.y_tunnus || companyInfo?.business_id}</p>
              )}
            </div>
          </div>
        </div>
        <div className="text-right bg-gray-100 p-4 rounded">
          <h2 className="text-2xl font-bold mb-3 text-gray-900">
            {invoice.tositelaji === 'kuitti' ? 'KUITTI' : 'LASKU'}
          </h2>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-4">
              <span className="font-semibold">Laskunumero:</span>
              <span>{invoice.numero}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-semibold">Laskun pvm:</span>
              <span>{formatDate(invoice.laskun_pvm)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-semibold">Eräpäivä:</span>
              <span className="font-bold">{formatDate(invoice.erapaiva)}</span>
            </div>
            {invoice.maksuehto_paivat && (
              <div className="flex justify-between gap-4">
                <span className="font-semibold">Maksuehto:</span>
                <span>{invoice.maksuehto_paivat} päivää netto</span>
              </div>
            )}
            {service && (
              <div className="flex justify-between gap-4 mt-2 pt-2 border-t border-gray-300">
                <span className="font-semibold">Huolto:</span>
                <span>{service.numero}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-6">
        <h3 className="text-base font-bold mb-2 text-gray-800 border-b border-gray-300 pb-1">
          ASIAKKAAN TIEDOT
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div><strong>Yritys:</strong> {invoice.asiakas_nimi}</div>
            {invoice.asiakas_yhteyshenkilo && (
              <div><strong>Yhteyshenkilö:</strong> {invoice.asiakas_yhteyshenkilo}</div>
            )}
            {invoice.asiakas_osoite && (
              <div><strong>Osoite:</strong> {invoice.asiakas_osoite}</div>
            )}
            {invoice.asiakas_puhelin && (
              <div><strong>Puhelin:</strong> {invoice.asiakas_puhelin}</div>
            )}
          </div>
          <div>
            {invoice.asiakas_email && (
              <div><strong>Sähköposti:</strong> {invoice.asiakas_email}</div>
            )}
            {invoice.asiakas_y_tunnus && (
              <div><strong>Y-tunnus:</strong> {invoice.asiakas_y_tunnus}</div>
            )}
            {invoice.asiakas_alv_numero && (
              <div><strong>ALV-numero:</strong> {invoice.asiakas_alv_numero}</div>
            )}
          </div>
        </div>
      </div>

      {/* Service Information */}
      {service && (
        <div className="mb-5">
          <h3 className="text-base font-bold mb-2 text-gray-800 border-b border-gray-300 pb-1">
            TUOTTEEN JA HUOLLON TIEDOT
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              {service.numero && (
                <div><strong>Huoltonumero:</strong> {service.numero}</div>
              )}
              {(() => {
                const merkki = service.merkki || service.Laitteet?.merkki;
                const malli = service.malli || service.Laitteet?.malli;
                const sarjanumero = service.sarjanumero || service.Laitteet?.sarjanumero;
                
                return (
                  <>
                {malli && (
                  <div><strong>Laite:</strong> {malli}</div>
                )}
                {merkki && (
                  <div><strong>Valmistaja:</strong> {merkki}</div>
                )}
                    {sarjanumero && (
                      <div><strong>Sarjanumero:</strong> {sarjanumero}</div>
                    )}
                  </>
                );
              })()}
              {service.valmistunut_pvm && (
                <div><strong>Huolto valmistunut:</strong> {formatDate(service.valmistunut_pvm)}</div>
              )}
            </div>
            <div>
              {((service.tyotakuu_kuukautta && service.tyotakuu_kuukautta > 0) || 
                (service.osatakuu_kuukautta && service.osatakuu_kuukautta > 0)) && (
                <div className="space-y-1">
                  <div><strong>Takuutiedot:</strong></div>
                  {service.tyotakuu_kuukautta && service.tyotakuu_kuukautta > 0 && (
                    <div className="ml-4">• Työlle: {service.tyotakuu_kuukautta} kk</div>
                  )}
                  {service.osatakuu_kuukautta && service.osatakuu_kuukautta > 0 && (
                    <div className="ml-4">• Osille: {service.osatakuu_kuukautta} kk</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Lines */}
      <div className="mb-4">
        <h3 className="text-base font-bold mb-2 text-gray-900 bg-gray-200 px-3 py-2">
          LASKUN ERITTELY
        </h3>
        <table className="w-full border-collapse border-2 border-gray-800 text-xs">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-gray-700 p-2 text-left font-semibold">Tuote / Palvelu</th>
              <th className="border border-gray-700 p-2 text-center font-semibold w-20">Määrä</th>
              <th className="border border-gray-700 p-2 text-center font-semibold w-20">Yks.</th>
              <th className="border border-gray-700 p-2 text-right font-semibold w-28">á-hinta (sis. ALV)</th>
              <th className="border border-gray-700 p-2 text-right font-semibold w-28">Yhteensä (sis. ALV)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.rivit.map((line, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 p-2">{line.kuvaus}</td>
                <td className="border border-gray-300 p-2 text-center">{line.maara}</td>
                <td className="border border-gray-300 p-2 text-center">{line.yksikko}</td>
                <td className="border border-gray-300 p-2 text-right font-mono">{line.yksikkohinta.toFixed(2)} €</td>
                <td className="border border-gray-300 p-2 text-right font-mono font-semibold">{line.yhteensa.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mb-4">
        <div className="flex justify-end">
          <div className="w-96 border-2 border-gray-800">
            <div className="bg-gray-800 text-white px-4 py-2">
              <h3 className="text-sm font-bold">MAKSETTAVA YHTEENSÄ</h3>
            </div>
            <div className="p-4 space-y-2 text-xs bg-gray-50">
              <div className="flex justify-between py-1">
                <span className="font-semibold">Veroton summa:</span>
                <span className="font-mono">{invoice.summa_ilman_alvia.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-300 pb-2">
                <span className="font-semibold">ALV {invoice.alv_prosentti || 25.5}%:</span>
                <span className="font-mono">{invoice.alv_summa.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center gap-8 font-bold bg-yellow-50 -mx-4 px-4 py-4 border-t-2 border-gray-800">
                <span className="text-lg">LOPPUSUMMA:</span>
                <span className="font-mono text-lg">{invoice.kokonaissumma.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Terms */}
      {invoice.tositelaji !== 'kuitti' && invoice.viivastyskulut && invoice.viivastyskulut > 0 && (
        <div className="mb-5 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <h3 className="text-base font-bold mb-2 text-gray-800">
            MAKSUEHDOT
          </h3>
          <div className="text-xs space-y-1">
            {invoice.maksuehto_paivat && (
              <p>• Maksuaika: <strong>{invoice.maksuehto_paivat} päivää netto</strong></p>
            )}
            <p>• Viivästyskorko: <strong>{invoice.viivastyskulut.toFixed(2)} €</strong> + kulloinkin voimassa oleva viivästyskorko</p>
            <p className="text-gray-600 mt-2">Laskun eräpäivän ylitettyä perimme viivästysmaksun.</p>
          </div>
        </div>
      )}

      {/* Additional Notes */}
      {invoice.huomautukset && (
        <div className="mb-5">
          <h3 className="text-base font-bold mb-2 text-gray-800 border-b border-gray-300 pb-1">
            HUOMAUTUKSET
          </h3>
          <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
            {invoice.huomautukset}
          </div>
        </div>
      )}
    </div>
  );
};