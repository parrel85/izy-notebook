// Quaderno - operazioni sulla cartella di lavoro
//   <cartella>/Nota.md                      note del quaderno "Generale"
//   <cartella>/<Quaderno>/Nota.md           note di un quaderno (sottocartella)
//   <cartella>/<Quaderno>/allegati/img.png  immagini delle note di quel quaderno
//   <cartella>/_cestino/...                 note e quaderni eliminati
const fs = require('fs');
const path = require('path');

const IMG_EXT = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;
const okSeg = s => typeof s === 'string' && s.length > 0 && s.length < 200 && s !== '.' && s !== '..' &&
  !s.startsWith('.') && !/[\\/:*?"<>|\u0000-\u001f]/.test(s);
const okDirName = s => okSeg(s) && !s.startsWith('_') && s.toLowerCase() !== 'allegati';

function rel(folder, r, kind) {
  if (typeof folder !== 'string' || !folder) throw new Error('cartella non impostata');
  if (typeof r !== 'string') throw new Error('percorso non valido');
  const seg = r.split('/');
  if (!seg.every(okSeg)) throw new Error('percorso non valido: ' + r);
  if (kind === 'md') {
    if (seg.length > 2 || !/\.md$/i.test(r) || (seg.length === 2 && !okDirName(seg[0]))) throw new Error('nota non valida: ' + r);
  } else if (kind === 'img') {
    const ok = (seg.length === 2 && seg[0].toLowerCase() === 'allegati') ||
               (seg.length === 3 && okDirName(seg[0]) && seg[1].toLowerCase() === 'allegati');
    if (!ok || !IMG_EXT.test(r)) throw new Error('immagine non valida: ' + r);
  } else if (kind === 'dir') {
    if (seg.length !== 1 || !okDirName(seg[0])) throw new Error('nome di quaderno non valido: ' + r);
  }
  return path.join(folder, ...seg);
}
const stamp = () => new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
const mtime = p => fs.statSync(p).mtimeMs;
function freeName(p) {           // aggiunge un numero se il file esiste già
  if (!fs.existsSync(p)) return p;
  const ext = path.extname(p), base = p.slice(0, -ext.length || undefined);
  for (let i = 2; ; i++) { const q = `${base}-${i}${ext}`; if (!fs.existsSync(q)) return q; }
}
function toTrash(folder, p, sub) {
  const dir = path.join(folder, '_cestino', ...(sub ? [sub] : []));
  fs.mkdirSync(dir, { recursive: true });
  let dest = path.join(dir, path.basename(p));
  if (fs.existsSync(dest)) { const ext = path.extname(dest); dest = dest.slice(0, -ext.length || undefined) + ' ' + stamp() + ext; }
  try { fs.renameSync(p, dest); }
  catch (e) { fs.cpSync(p, dest, { recursive: true }); fs.rmSync(p, { recursive: true, force: true }); }
}

const ops = {
  exists: f => ({ ok: !!f && fs.existsSync(f) && fs.statSync(f).isDirectory() }),
  ensure: f => { fs.mkdirSync(f, { recursive: true }); return { ok: true }; },
  list: f => {
    const files = [], dirs = [];
    const isNote = d => d.isFile() && /\.md$/i.test(d.name) && !d.name.startsWith('.');
    for (const d of fs.readdirSync(f, { withFileTypes: true })) {
      if (isNote(d)) files.push({ name: d.name, mtime: mtime(path.join(f, d.name)) });
      else if (d.isDirectory() && okDirName(d.name)) {
        dirs.push(d.name);
        let inner = [];
        try { inner = fs.readdirSync(path.join(f, d.name), { withFileTypes: true }); } catch (e) {}
        for (const e of inner) if (isNote(e)) files.push({ name: d.name + '/' + e.name, mtime: mtime(path.join(f, d.name, e.name)) });
      }
    }
    return { files, dirs };
  },
  loadAll: f => {
    const r = ops.list(f);
    r.files.forEach(x => { x.text = fs.readFileSync(path.join(f, ...x.name.split('/')), 'utf8'); });
    return r;
  },
  read: (f, n) => { const p = rel(f, n, 'md'); return { text: fs.readFileSync(p, 'utf8'), mtime: mtime(p) }; },
  // expect = data di modifica attesa sul disco: se è diversa qualcun altro ha cambiato il file
  write: (f, n, text, expect) => {
    const p = rel(f, n, 'md');
    if (expect != null && fs.existsSync(p)) { const m = mtime(p); if (Math.abs(m - expect) > 1) return { conflict: true, mtime: m }; }
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const tmp = path.join(path.dirname(p), '.' + path.basename(p) + '.tmp');
    fs.writeFileSync(tmp, text, 'utf8');
    try { fs.renameSync(tmp, p); }
    catch (e) { fs.writeFileSync(p, text, 'utf8'); try { fs.unlinkSync(tmp); } catch (_) {} }   // file bloccato (OneDrive, rete)
    return { ok: true, mtime: mtime(p) };
  },
  rename: (f, a, b) => {           // anche tra quaderni diversi
    const pa = rel(f, a, 'md'), pb = rel(f, b, 'md');
    if (!fs.existsSync(pa)) return { ok: true };
    if (pa.toLowerCase() !== pb.toLowerCase() && fs.existsSync(pb)) return { error: 'esiste già il file ' + b };
    fs.mkdirSync(path.dirname(pb), { recursive: true });
    fs.renameSync(pa, pb);
    return { ok: true, mtime: mtime(pb) };
  },
  trash: (f, n) => {
    const p = rel(f, n, 'md');
    if (fs.existsSync(p)) toTrash(f, p, n.includes('/') ? n.split('/')[0] : '');
    return { ok: true };
  },
  mkdir: (f, d) => { fs.mkdirSync(rel(f, d, 'dir'), { recursive: true }); return { ok: true }; },
  renameDir: (f, a, b) => {
    const pa = rel(f, a, 'dir'), pb = rel(f, b, 'dir');
    if (pa.toLowerCase() !== pb.toLowerCase() && fs.existsSync(pb)) return { error: 'esiste già un quaderno ' + b };
    fs.renameSync(pa, pb); return { ok: true };
  },
  trashDir: (f, d) => { const p = rel(f, d, 'dir'); if (fs.existsSync(p)) toTrash(f, p, ''); return { ok: true }; },
  // immagini: restituisce il percorso finale (con un numero se il nome era già usato)
  writeBin: (f, r, bytes) => {
    let p = freeName(rel(f, r, 'img'));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, Buffer.from(bytes));
    return { ok: true, name: path.relative(f, p).split(path.sep).join('/') };
  },
  copyBin: (f, a, b) => {
    const pa = rel(f, a, 'img'), pb = rel(f, b, 'img');
    if (!fs.existsSync(pa) || fs.existsSync(pb)) return { ok: true };
    fs.mkdirSync(path.dirname(pb), { recursive: true });
    fs.copyFileSync(pa, pb); return { ok: true };
  }
};

function run(op, folder, ...args) {
  if (!Object.prototype.hasOwnProperty.call(ops, op)) return { error: 'operazione sconosciuta' };
  try { return ops[op](folder, ...args); } catch (e) { return { error: e.message }; }
}
module.exports = { run, ops, rel };
