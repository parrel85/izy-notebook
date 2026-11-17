// Quaderno - processo principale Electron
const { app, BrowserWindow, ipcMain, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const fsops = require('./fsops');

const userFile = name => path.join(app.getPath('userData'), name);
const SETTINGS = () => userFile('quaderno-impostazioni.json');
const LEGACY = () => userFile('quaderno-note.json');          // archivio della versione 1.0

function readText(f) { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return null; } }

let watcher = null, watchTimer = null;
function watchFolder(win, folder) {
  if (watcher) { try { watcher.close(); } catch (e) {} watcher = null; }
  try {
    watcher = fs.watch(folder, () => {
      clearTimeout(watchTimer);
      watchTimer = setTimeout(() => { if (!win.isDestroyed()) win.webContents.send('fs-changed'); }, 300);
    });
    watcher.on('error', () => {});      // su dischi di rete può fallire: resta il controllo periodico
  } catch (e) { watcher = null; }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000, height: 760, minWidth: 560, minHeight: 360,
    frame: false,                       // la cornice Win 3.1 la disegna la pagina
    backgroundColor: '#c0c0c0',
    title: 'Quaderno',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true, spellcheck: false }
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', e => e.preventDefault());
}

ipcMain.on('settings:load', e => { e.returnValue = readText(SETTINGS()); });
ipcMain.on('settings:save', (e, json) => {
  try { fs.mkdirSync(path.dirname(SETTINGS()), { recursive: true }); fs.writeFileSync(SETTINGS(), json, 'utf8'); e.returnValue = true; }
  catch (err) { e.returnValue = String(err); }
});
ipcMain.on('legacy:load', e => { e.returnValue = readText(LEGACY()); });
ipcMain.on('legacy:done', e => {
  try { fs.renameSync(LEGACY(), userFile('quaderno-note.migrato.json')); } catch (err) {}
  e.returnValue = true;
});
ipcMain.on('fs', (e, op, folder, ...args) => { e.returnValue = fsops.run(op, folder, ...args); });
ipcMain.on('folder:default', e => { e.returnValue = path.join(app.getPath('documents'), 'Quaderno'); });
ipcMain.on('folder:pick', (e, start) => {
  const res = dialog.showOpenDialogSync(BrowserWindow.fromWebContents(e.sender), {
    title: 'Scegli la cartella di lavoro di Quaderno',
    defaultPath: start || app.getPath('documents'),
    properties: ['openDirectory', 'createDirectory', 'promptToCreate']
  });
  e.returnValue = res && res[0] ? res[0] : null;
});
ipcMain.on('folder:watch', (e, folder) => { watchFolder(BrowserWindow.fromWebContents(e.sender), folder); });
ipcMain.on('open-path', (e, p) => { if (typeof p === 'string' && fs.existsSync(p)) shell.openPath(p); });
ipcMain.on('win', (e, cmd) => {
  const w = BrowserWindow.fromWebContents(e.sender); if (!w) return;
  if (cmd === 'min') w.minimize();
  else if (cmd === 'max') w.isMaximized() ? w.unmaximize() : w.maximize();
  else if (cmd === 'close') w.close();
});

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    // su Mac servono i ruoli standard perché Cmd+C / Cmd+V / Cmd+Q funzionino
    Menu.setApplicationMenu(Menu.buildFromTemplate([{ role: 'appMenu' }, { role: 'editMenu' }]));
  } else {
    Menu.setApplicationMenu(null);
  }
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => app.quit());
