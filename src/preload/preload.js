const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getCustomers: (status) => ipcRenderer.invoke('get-customers', status),
  addCustomer: (customer) => ipcRenderer.invoke('add-customer', customer),
  updateCustomer: (id, customer) => ipcRenderer.invoke('update-customer', { id, customer }),
  deleteCustomer: (id) => ipcRenderer.invoke('delete-customer', id),
  updateCustomerStatus: (id, status) => ipcRenderer.invoke('update-customer-status', { id, status }),
  getKpis: () => ipcRenderer.invoke('get-kpis'),
  login: (username, password) => ipcRenderer.invoke('login', { username, password }),
  updateCredentials: (role, newUsername, newPassword) => ipcRenderer.invoke('update-credentials', { role, newUsername, newPassword }),
  getUserByRole: (role) => ipcRenderer.invoke('get-user-by-role', role),
  getActivationInfo: () => ipcRenderer.invoke('get-activation-info'),
  getMachineId: () => ipcRenderer.invoke('get-machine-id'),
  activateLicense: (key) => ipcRenderer.invoke('activate-license', key),
  reloadApp: () => ipcRenderer.send('reload-app'),
  print: () => window.print(),
});
