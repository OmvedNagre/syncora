const { app, BrowserWindow, globalShortcut, Notification, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    title: 'DuoSpace — Pair Sanctuary',
    backgroundColor: '#07080d',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const devUrl = 'http://localhost:5173';
  mainWindow.loadURL(devUrl).catch(() => {
    // Retry if Vite dev server is still booting
    setTimeout(() => {
      mainWindow.loadURL(devUrl);
    }, 1500);
  });

  // Global hotkey for mute: Cmd/Ctrl + Shift + M
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (mainWindow) {
      mainWindow.webContents.send('global-toggle-mute');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('notify', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});
