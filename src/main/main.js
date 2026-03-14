const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db');
const activation = require('./db/activationRepository');

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  const activated = await activation.verifyLicenseStatus();
  if (activated) {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/activation.html'));
  }
}

app.whenReady().then(async () => {
  await db.init();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// IPC Handlers
ipcMain.handle('get-customers', async (event, status) => {
  return await db.getCustomers(status);
});

ipcMain.handle('add-customer', async (event, customer) => {
  return await db.addCustomer(customer);
});

ipcMain.handle('update-customer-status', async (event, { id, status }) => {
  return await db.updateCustomerStatus(id, status);
});

ipcMain.handle('update-customer', async (event, { id, customer }) => {
  return await db.updateCustomer(id, customer);
});

ipcMain.handle('delete-customer', async (event, id) => {
  return await db.deleteCustomer(id);
});

ipcMain.handle('manual-reset', async () => {
  return await db.runManualReset();
});

ipcMain.handle('get-kpis', async () => {
  return await db.getKpis();
});

ipcMain.handle('login', async (event, { username, password }) => {
  return await db.login(username, password);
});

ipcMain.handle('update-credentials', async (event, { role, newUsername, newPassword }) => {
  return await db.updateCredentials(role, newUsername, newPassword);
});

ipcMain.handle('get-user-by-role', async (event, role) => {
  return await db.getUserByRole(role);
});

ipcMain.handle('get-activation-info', async () => {
  return activation.getActivationInfo();
});

ipcMain.handle('get-machine-id', async () => {
  return activation.getHWID();
});

ipcMain.handle('activate-license', async (event, key) => {
  return await activation.activateLicense(key);
});

ipcMain.on('reload-app', async () => {
  if (mainWindow) {
    const activated = await activation.verifyLicenseStatus();
    if (activated) {
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    } else {
      mainWindow.reload();
    }
  }
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
