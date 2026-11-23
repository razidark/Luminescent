const { contextBridge, ipcRenderer } = require('electron');

// We expose any native APIs here
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  on: (channel, func) => {
    const validChannels = ['app-info'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  send: (channel, data) => {
    const validChannels = ['do-something'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});
