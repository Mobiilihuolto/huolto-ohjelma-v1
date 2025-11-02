const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  checkLicense: () => ipcRenderer.invoke('check-license'),
  activateLicense: (licenseKey) => ipcRenderer.invoke('activate-license', licenseKey),

  db: {
    query: (sql, params) => ipcRenderer.invoke('db-query', { sql, params }),
    execute: (sql, params) => ipcRenderer.invoke('db-execute', { sql, params }),
    get: (sql, params) => ipcRenderer.invoke('db-get', { sql, params })
  }
});
