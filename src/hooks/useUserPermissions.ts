import { useCurrentUserRoles } from "./useUserRoles";

export function useUserPermissions() {
  const { data: roles, isLoading } = useCurrentUserRoles();

  const isAdmin = roles?.includes('admin') || false;
  const isTeknikko = roles?.includes('teknikko') || false;
  const isKayttaja = roles?.includes('kayttaja') || false;

  // Permission checks
  const canManageUsers = isAdmin;
  const canManageSettings = isAdmin;
  const canManageCompany = isAdmin;
  const canManageInvoices = isAdmin || isTeknikko;
  
  const canManageCustomers = isAdmin || isTeknikko;
  const canManageDevices = isAdmin || isTeknikko;
  const canManageServices = isAdmin || isTeknikko;
  const canManageInventory = isAdmin || isTeknikko;
  
  const canViewCustomers = isAdmin || isTeknikko; // Only admin and teknikko can view customer data
  const canViewDevices = true;
  const canViewServices = true;
  const canViewInvoices = isAdmin || isTeknikko; // Admin and teknikko can view invoices
  const canViewInventory = true;

  return {
    roles,
    isLoading,
    isAdmin,
    isTeknikko,
    isKayttaja,
    canManageUsers,
    canManageSettings,
    canManageCompany,
    canManageInvoices,
    canManageCustomers,
    canManageDevices,
    canManageServices,
    canManageInventory,
    canViewCustomers,
    canViewDevices,
    canViewServices,
    canViewInvoices,
    canViewInventory,
  };
}
