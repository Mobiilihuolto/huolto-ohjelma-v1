export interface ElectronAPI {
  checkLicense: () => Promise<{
    valid: boolean;
    message?: string;
    license?: {
      key: string;
      activated_at: string;
      expires_at?: string;
    };
  }>;

  activateLicense: (licenseKey: string) => Promise<{
    success: boolean;
    message: string;
    userId?: string;
    companyId?: string;
  }>;

  db: {
    query: (sql: string, params?: any[]) => Promise<{
      success: boolean;
      data?: any[];
      error?: string;
    }>;

    get: (sql: string, params?: any[]) => Promise<{
      success: boolean;
      data?: any;
      error?: string;
    }>;

    execute: (sql: string, params?: any[]) => Promise<{
      success: boolean;
      changes?: number;
      error?: string;
    }>;
  };
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
