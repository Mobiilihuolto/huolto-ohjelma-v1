import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fiCommon from '@/locales/fi/common.json';
import fiAuth from '@/locales/fi/auth.json';
import fiSidebar from '@/locales/fi/sidebar.json';
import fiLayout from '@/locales/fi/layout.json';
import fiDashboard from '@/locales/fi/dashboard.json';
import fiCustomers from '@/locales/fi/customers.json';
import fiDevices from '@/locales/fi/devices.json';
import fiServices from '@/locales/fi/services.json';
import fiInvoicing from '@/locales/fi/invoicing.json';
import fiInventory from '@/locales/fi/inventory.json';
import fiWarranty from '@/locales/fi/warranty.json';
import fiSettings from '@/locales/fi/settings.json';

import enCommon from '@/locales/en/common.json';
import enAuth from '@/locales/en/auth.json';
import enSidebar from '@/locales/en/sidebar.json';
import enLayout from '@/locales/en/layout.json';
import enDashboard from '@/locales/en/dashboard.json';
import enCustomers from '@/locales/en/customers.json';
import enDevices from '@/locales/en/devices.json';
import enServices from '@/locales/en/services.json';
import enInvoicing from '@/locales/en/invoicing.json';
import enInventory from '@/locales/en/inventory.json';
import enWarranty from '@/locales/en/warranty.json';
import enSettings from '@/locales/en/settings.json';

import zhCommon from '@/locales/zh/common.json';
import zhAuth from '@/locales/zh/auth.json';
import zhSidebar from '@/locales/zh/sidebar.json';
import zhLayout from '@/locales/zh/layout.json';
import zhDashboard from '@/locales/zh/dashboard.json';
import zhCustomers from '@/locales/zh/customers.json';
import zhDevices from '@/locales/zh/devices.json';
import zhServices from '@/locales/zh/services.json';
import zhInvoicing from '@/locales/zh/invoicing.json';
import zhInventory from '@/locales/zh/inventory.json';
import zhWarranty from '@/locales/zh/warranty.json';
import zhSettings from '@/locales/zh/settings.json';

import deCommon from '@/locales/de/common.json';
import deAuth from '@/locales/de/auth.json';
import deSidebar from '@/locales/de/sidebar.json';
import deLayout from '@/locales/de/layout.json';
import deDashboard from '@/locales/de/dashboard.json';
import deCustomers from '@/locales/de/customers.json';
import deDevices from '@/locales/de/devices.json';
import deServices from '@/locales/de/services.json';
import deInvoicing from '@/locales/de/invoicing.json';
import deInventory from '@/locales/de/inventory.json';
import deWarranty from '@/locales/de/warranty.json';
import deSettings from '@/locales/de/settings.json';

import esCommon from '@/locales/es/common.json';
import esAuth from '@/locales/es/auth.json';
import esSidebar from '@/locales/es/sidebar.json';
import esLayout from '@/locales/es/layout.json';
import esDashboard from '@/locales/es/dashboard.json';
import esCustomers from '@/locales/es/customers.json';
import esDevices from '@/locales/es/devices.json';
import esServices from '@/locales/es/services.json';
import esInvoicing from '@/locales/es/invoicing.json';
import esInventory from '@/locales/es/inventory.json';
import esWarranty from '@/locales/es/warranty.json';
import esSettings from '@/locales/es/settings.json';

const resources = {
  fi: {
    common: fiCommon,
    auth: fiAuth,
    sidebar: fiSidebar,
    layout: fiLayout,
    dashboard: fiDashboard,
    customers: fiCustomers,
    devices: fiDevices,
    services: fiServices,
    invoicing: fiInvoicing,
    inventory: fiInventory,
    warranty: fiWarranty,
    settings: fiSettings,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    sidebar: enSidebar,
    layout: enLayout,
    dashboard: enDashboard,
    customers: enCustomers,
    devices: enDevices,
    services: enServices,
    invoicing: enInvoicing,
    inventory: enInventory,
    warranty: enWarranty,
    settings: enSettings,
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    sidebar: zhSidebar,
    layout: zhLayout,
    dashboard: zhDashboard,
    customers: zhCustomers,
    devices: zhDevices,
    services: zhServices,
    invoicing: zhInvoicing,
    inventory: zhInventory,
    warranty: zhWarranty,
    settings: zhSettings,
  },
  de: {
    common: deCommon,
    auth: deAuth,
    sidebar: deSidebar,
    layout: deLayout,
    dashboard: deDashboard,
    customers: deCustomers,
    devices: deDevices,
    services: deServices,
    invoicing: deInvoicing,
    inventory: deInventory,
    warranty: deWarranty,
    settings: deSettings,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    sidebar: esSidebar,
    layout: esLayout,
    dashboard: esDashboard,
    customers: esCustomers,
    devices: esDevices,
    services: esServices,
    invoicing: esInvoicing,
    inventory: esInventory,
    warranty: esWarranty,
    settings: esSettings,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'fi',
    fallbackLng: 'fi',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
