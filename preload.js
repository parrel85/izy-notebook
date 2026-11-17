// Ponte sicuro tra la pagina e il sistema: cartella di lavoro, impostazioni, finestra
const { contextBridge, ipcRenderer } = require('electron');
const sync = (ch, ...a) => ipcRenderer.sendSync(ch, ...a);
contextBridge.exposeInMainWorld('qapi', {
  isElectron: true,
  platform: process.platform,
  settingsLoad: () => sync('settings:load'),
  settingsSave: json => sync('settings:save', json),
  legacyLoad: () => sync('legacy:load'),
  legacyDone: () => sync('legacy:done'),
  fs: (op, folder, ...args) => sync('fs', op, folder, ...args),
  defaultFolder: () => sync('folder:default'),
  pickFolder: start => sync('folder:pick', start || null),
  watch: folder => ipcRenderer.send('folder:watch', folder),
  onChange: cb => ipcRenderer.on('fs-changed', () => cb()),
  openPath: p => ipcRenderer.send('open-path', p),
  // indirizzo file:// di un'immagine (funziona con C:\..., /Users/... e \\server\cartella)
  fileUrl: (folder, rel) => {
    const p = (String(folder) + '/' + String(rel)).replace(/\\/g, '/');
    const enc = p.split('/').map(s => encodeURIComponent(s).replace(/^([A-Za-z])%3A$/i, '$1:')).join('/');
    return p.startsWith('//') ? 'file:' + enc : 'file://' + (p.startsWith('/') ? '' : '/') + enc;
  },
  win: cmd => ipcRenderer.send('win', cmd)
});
