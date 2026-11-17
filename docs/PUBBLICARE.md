# Come pubblicare Quaderno su GitHub

Guida per il repository `parrel85/quaderno`.

## 1. Creare il repository (una volta sola)

1. Su github.com: **+ → New repository**.
2. Nome: `quaderno`. Descrizione: *Blocco note a quadretti in stile Windows 3.1 con collegamenti tra note alla Tomboy*.
3. **Public**. Non aggiungere README, .gitignore o licenza: sono già nella cartella.
4. **Create repository**.

## 2. Caricare i file

### Con GitHub Desktop (consigliato se non usi la riga di comando)
1. *File → Add local repository…* → scegli la cartella `quaderno` (quella con `package.json`).
2. Se dice che non è un repository: *create a repository* → **Create repository**.
3. In basso a sinistra scrivi il messaggio `Prima versione` → **Commit to main**.
4. **Publish repository**. Togli la spunta *Keep this code private* se vuoi il repository pubblico.

### Con la riga di comando
Dalla cartella `quaderno`:
```bash
git init
git add .
git commit -m "Quaderno 1.2.0"
git branch -M main
git remote add origin https://github.com/parrel85/quaderno.git
git push -u origin main
```

### Dal sito, senza installare nulla
Nella pagina del repository vuoto: *uploading an existing file* → trascina **il contenuto** della cartella `quaderno` → **Commit changes**.
⚠ Il sito non carica le cartelle nascoste: `.github` (i workflow) e `.gitignore` non arrivano. Creali a mano con *Add file → Create new file*, scrivendo come nome `.github/workflows/build.yml` e `.github/workflows/pages.yml`, e incolla il contenuto dei file. Con GitHub Desktop questo problema non c'è.

## 3. Attivare la versione browser (GitHub Pages)
1. Repository → **Settings → Pages**.
2. *Build and deployment → Source*: **GitHub Actions**.
3. **Actions → Pubblica versione browser → Run workflow**.
4. Dopo un minuto è online su **https://parrel85.github.io/quaderno/**. Da lì in poi si aggiorna da sola a ogni modifica di `app/`.

## 4. Creare una versione da scaricare (Release)
Ogni volta che vuoi pubblicare gli eseguibili:

1. In `package.json` aggiorna `"version"` (es. `1.2.0` → `1.3.0`). Aggiungi le novità in `CHANGELOG.md`.
2. Fai commit e push.
3. Crea il tag della versione:
   - **GitHub Desktop**: *History* → clic destro sull'ultimo commit → *Create Tag…* → `v1.3.0` → poi **Push origin**;
   - **riga di comando**: `git tag v1.3.0` e poi `git push origin v1.3.0`;
   - **dal sito**: *Releases → Draft a new release → Choose a tag* → scrivi `v1.3.0` → *Create new tag* → **Publish release**.
4. In **Actions** parte *Build Quaderno* (circa 10 minuti). Alla fine la Release `v1.3.0` contiene `setup.exe`, `portable.exe` e i due `.dmg`.

Il numero del tag (`v1.3.0`) deve corrispondere alla `version` di `package.json` (`1.3.0`), perché i file prendono il nome da lì.

Per una prova senza pubblicare: **Actions → Build Quaderno → Run workflow**. I file restano scaricabili per 90 giorni in fondo alla pagina del run, sotto *Artifacts*.

## 5. Ritocchi facoltativi alla pagina del repository
- Nella colonna di destra, la rotellina accanto ad *About*:
  - **Website**: `https://parrel85.github.io/quaderno/`;
  - **Topics**: `notepad`, `markdown`, `tomboy`, `electron`, `windows-31`, `notes`.
- **Settings → General → Social preview**: carica `docs/img/principale.png`. È l'immagine che appare quando condividi il link.
