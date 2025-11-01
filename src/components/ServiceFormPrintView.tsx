import React from 'react';
import { format } from 'date-fns';
import { fi } from 'date-fns/locale';
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface ServiceFormData {
  numero: string;
  created_at: string;
  asiakas_nimi: string;
  asiakas_puhelin?: string;
  asiakas_email?: string;
  asiakas_osoite?: string;
  asiakas_tyyppi?: string;
  asiakas_yrityksen_nimi?: string;
  asiakas_y_tunnus?: string;
  asiakas_alv_numero?: string;
  merkki?: string;
  malli?: string;
  sarjanumero?: string;
  kuvaus: string;
  teknikon_muistiinpanot?: string;
  status: string;
  arvioitu_valmistumispvm?: string;
  valmistunut_pvm?: string;
  teknikko_nimi?: string;
  tyotakuu_kuukautta?: number;
  osatakuu_kuukautta?: number;
  teknikko_allekirjoitus?: string;
  asiakas_allekirjoitus?: string;
}

interface ServiceFormPrintViewProps {
  service: ServiceFormData;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo_url?: string;
  };
}

export const ServiceFormPrintView: React.FC<ServiceFormPrintViewProps> = ({
  service,
  companyInfo = {
    name: "Huoltoyritys Oy",
    address: "Yrityksen osoite, 00100 Helsinki",
    phone: "010 123 4567",
    email: "info@huoltoyritys.fi"
  }
}) => {
  const { data: companySettings } = useCompanySettings();
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: fi });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 text-black font-sans text-xs print:p-3">
      {/* Header */}
      <div className="flex justify-between items-start mb-1.5 pb-2 border-b-2 border-gray-800">
        <div className="flex items-center gap-4">
          {companySettings?.logo_url && (
            <img 
              src={companySettings.logo_url} 
              alt="Logo" 
              className="h-14 w-auto object-contain mt-2"
              style={{ maxHeight: '56px' }}
            />
          )}
          <div>
            <div className="text-xs">
              <p className="font-semibold">{companySettings?.yrityksen_nimi || companyInfo?.name}</p>
              <p>{companySettings?.osoite || companyInfo?.address}</p>
              <p>{companySettings?.puhelin || companyInfo?.phone}</p>
              <p>{companySettings?.email || companyInfo?.email}</p>
              {companySettings?.y_tunnus && (
                <p>Y-tunnus: {companySettings.y_tunnus}</p>
              )}
            </div>
          </div>
        </div>
        <div className="text-right bg-gray-100 p-3 rounded">
          <h2 className="text-xl font-bold mb-1 text-gray-900">HUOLTOKAAVAKE</h2>
          <div style={{ fontSize: '11px' }} className="space-y-0.5">
            <div className="flex justify-between gap-3">
              <span className="font-semibold">RMA-numero:</span>
              <span className="font-mono">{service.numero}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="font-semibold">Päivämäärä:</span>
              <span>{formatDate(service.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-1.5 border-2 border-gray-800 print:break-inside-avoid">
        <div className="bg-gray-800 text-white px-2 py-0.5">
          <h3 className="text-sm font-bold">ASIAKKAAN TIEDOT</h3>
        </div>
        <div className="p-2 bg-gray-50">
          <div style={{ fontSize: '11px' }} className="space-y-2">
            {service.asiakas_tyyppi === 'yritys' && service.asiakas_yrityksen_nimi && (
              <div>
                <span className="font-semibold">Yritys:</span>
                <div className="mt-0.5 p-1.5 bg-white border border-gray-300">{service.asiakas_yrityksen_nimi}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-semibold">Yhteyshenkilö:</span>
                <div className="mt-0.5 p-1.5 bg-white border border-gray-300">{service.asiakas_nimi}</div>
              </div>
              <div>
                <span className="font-semibold">Puhelin:</span>
                <div className="mt-0.5 p-1.5 bg-white border border-gray-300">{service.asiakas_puhelin || '-'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-semibold">Sähköposti:</span>
                <div className="mt-0.5 p-1.5 bg-white border border-gray-300">{service.asiakas_email || '-'}</div>
              </div>
              <div>
                <span className="font-semibold">Osoite:</span>
                <div className="mt-0.5 p-1.5 bg-white border border-gray-300">{service.asiakas_osoite || '-'}</div>
              </div>
            </div>
            {service.asiakas_tyyppi === 'yritys' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold">Y-tunnus:</span>
                  <div className="mt-0.5 p-1.5 bg-white border border-gray-300">{service.asiakas_y_tunnus || '-'}</div>
                </div>
                <div>
                  <span className="font-semibold">ALV-numero:</span>
                  <div className="mt-0.5 p-1.5 bg-white border border-gray-300">{service.asiakas_alv_numero || '-'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Device Information */}
      <div className="mb-1.5 border-2 border-gray-800 print:break-inside-avoid">
        <div className="bg-gray-800 text-white px-2 py-0.5">
          <h3 className="text-sm font-bold">LAITTEEN TIEDOT</h3>
        </div>
        <div className="p-2 bg-gray-50">
          <div style={{ fontSize: '11px' }} className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-semibold">Merkki:</span>
                <div className="mt-0.5 p-1.5 bg-white border border-gray-300">{service.malli || '-'}</div>
              </div>
              <div>
                <span className="font-semibold">Valmistaja:</span>
                <div className="mt-0.5 p-1.5 bg-white border border-gray-300">{service.merkki || '-'}</div>
              </div>
            </div>
            <div>
              <span className="font-semibold">Sarjanumero:</span>
              <div className="mt-0.5 p-1.5 bg-white border border-gray-300">{service.sarjanumero || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Description */}
      <div className="mb-1.5 border-2 border-gray-800 print:break-inside-avoid">
        <div className="bg-gray-800 text-white px-2 py-0.5">
          <h3 className="text-sm font-bold">VIKAKUVAUS / ASIAKKAAN KUVAUS</h3>
        </div>
        <div className="p-2 bg-white min-h-[40px]">
          <p style={{ fontSize: '11px' }} className="whitespace-pre-wrap">{service.kuvaus}</p>
        </div>
      </div>

      {/* Performed Work - Always visible */}
      <div className="mb-1.5 border-2 border-gray-800 print:break-inside-avoid">
        <div className="bg-gray-800 text-white px-2 py-0.5">
          <h3 className="text-sm font-bold">SUORITETTU TYÖ / TEKNIKÖN MUISTIINPANOT</h3>
        </div>
        <div className="p-2 bg-white min-h-[50px]">
          {service.teknikon_muistiinpanot ? (
            <p style={{ fontSize: '11px' }} className="whitespace-pre-wrap">{service.teknikon_muistiinpanot}</p>
          ) : (
            <div style={{ fontSize: '11px' }} className="text-gray-400 space-y-1">
              <p>Suoritetut toimenpiteet:</p>
              <div className="space-y-0.5 ml-3">
                <p>□ _________________________________________________</p>
                <p>□ _________________________________________________</p>
                <p>□ _________________________________________________</p>
              </div>
              <p className="mt-2">Käytetyt varaosat:</p>
              <div className="space-y-0.5 ml-3">
                <p>_____________________________________________________</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Status and Dates */}
      <div className="mb-1.5 border-2 border-gray-800 print:break-inside-avoid">
        <div className="bg-gray-800 text-white px-2 py-0.5">
          <h3 className="text-sm font-bold">HUOLLON TILA JA AIKATAULU</h3>
        </div>
        <div className="p-2 bg-gray-50">
          <div className="grid grid-cols-3 gap-3" style={{ fontSize: '11px' }}>
            <div>
              <span className="font-semibold">Status:</span>
              <div className="mt-0.5 p-1.5 bg-white border border-gray-300 uppercase">{service.status}</div>
            </div>
            <div>
              <span className="font-semibold">Arvioitu valmistuminen:</span>
              <div className="mt-0.5 p-1.5 bg-white border border-gray-300">{formatDate(service.arvioitu_valmistumispvm)}</div>
            </div>
            <div>
              <span className="font-semibold">Valmistunut:</span>
              <div className="mt-0.5 p-1.5 bg-white border border-gray-300">{formatDate(service.valmistunut_pvm)}</div>
            </div>
          </div>
          {service.teknikko_nimi && (
            <div className="mt-2" style={{ fontSize: '11px' }}>
              <span className="font-semibold">Vastuuteknikko:</span>
              <div className="mt-0.5 p-1.5 bg-white border border-gray-300">{service.teknikko_nimi}</div>
            </div>
          )}
        </div>
      </div>

      {/* Warranty Information - Only show if warranty exists */}
      {((service.tyotakuu_kuukautta && service.tyotakuu_kuukautta > 0) || 
        (service.osatakuu_kuukautta && service.osatakuu_kuukautta > 0)) && (
        <div className="mb-1.5 border-2 border-gray-800 print:break-inside-avoid">
          <div className="bg-gray-800 text-white px-2 py-0.5">
            <h3 className="text-sm font-bold">TAKUUTIEDOT</h3>
          </div>
          <div className="p-2 bg-gray-50">
            <div className="space-y-1" style={{ fontSize: '11px' }}>
              {service.tyotakuu_kuukautta && service.tyotakuu_kuukautta > 0 && (
                <div className="flex items-center">
                  <span className="font-semibold mr-2">Työtakuu:</span>
                  <span>{service.tyotakuu_kuukautta} kuukautta</span>
                </div>
              )}
              {service.osatakuu_kuukautta && service.osatakuu_kuukautta > 0 && (
                <div className="flex items-center">
                  <span className="font-semibold mr-2">Osatakuu:</span>
                  <span>{service.osatakuu_kuukautta} kuukautta</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Signatures */}
      <div className="pt-2 mt-1.5 print:break-inside-avoid">
        <div className="grid grid-cols-2 gap-8 items-start">
          <div>
            <h4 className="font-bold mb-1" style={{ fontSize: '11px' }}>ASIAKKAAN ALLEKIRJOITUS</h4>
            <div className="h-24 flex items-end mt-2">
              {service.asiakas_allekirjoitus && (
                <img 
                  src={service.asiakas_allekirjoitus} 
                  alt="Asiakkaan allekirjoitus" 
                  className="max-h-20 w-auto"
                />
              )}
            </div>
            <div className="border-t-2 border-gray-800 pt-1">
              <div className="text-center text-gray-600" style={{ fontSize: '10px' }}>
                Allekirjoitus / Päivämäärä
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-1" style={{ fontSize: '11px' }}>TEKNIKON ALLEKIRJOITUS</h4>
            <div className="h-24 flex items-end mt-2">
              {service.teknikko_allekirjoitus && (
                <img 
                  src={service.teknikko_allekirjoitus} 
                  alt="Teknikön allekirjoitus" 
                  className="max-h-20 w-auto"
                />
              )}
            </div>
            <div className="border-t-2 border-gray-800 pt-1">
              <div className="text-center text-gray-600" style={{ fontSize: '10px' }}>
                Allekirjoitus / Päivämäärä
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-1.5 pt-1 border-t border-gray-300 text-center text-gray-600" style={{ fontSize: '10px' }}>
        <p>Tämä huoltokaavake on laadittu {formatDate(service.created_at)}</p>
      </div>
    </div>
  );
};