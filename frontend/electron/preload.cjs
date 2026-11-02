const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApp', {
  isDesktop: true,
  platform: process.platform,
  version: '1.0.0',
  print: (options) => ipcRenderer.invoke('print', options),
  printToPDF: (options) => ipcRenderer.invoke('print-to-pdf', options),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});

