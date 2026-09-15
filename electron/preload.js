const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  sendNotification: (title, body) => ipcRenderer.send('notify', { title, body }),
  onToggleMute: (callback) => ipcRenderer.on('global-toggle-mute', callback)
});
