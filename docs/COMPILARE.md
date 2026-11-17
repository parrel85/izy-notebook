# Creare l'app Quaderno dal Mac (versione Mac e versione Windows)

Dalla cartella del progetto si ottengono:

| File (nella cartella `dist`) | Per |
|---|---|
| `Quaderno-1.3.0-mac-arm64.dmg` | Mac con chip Apple (M1, M2, M3, M4…) |
| `Quaderno-1.3.0-mac-x64.dmg` | Mac Intel |
| `Quaderno-1.3.0-setup.exe` | Windows, con installazione |
| `Quaderno-1.3.0-portable.exe` | Windows, senza installazione (anche da chiavetta) |
| `Quaderno-1.3.0-win.zip` | Windows, piano di riserva: cartella pronta, si avvia `Quaderno.exe` |

Strumenti usati: **Electron 45** (l'app) ed **electron-builder 26.18** (crea i pacchetti).

---

## 1. Preparazione (una volta sola)

1. **Installa Node.js**: da <https://nodejs.org/it/download> scarica la versione **LTS** per macOS (file `.pkg`) e installala come un normale programma.
   Per controllare, apri *Terminale* e scrivi `node -v`: deve rispondere con un numero di versione.
2. **Scompatta il progetto** (es. `quaderno-github.zip`) in una cartella comoda, per esempio `Documenti/Progetti/quaderno`.
   Usa un percorso **senza** iCloud Drive: la cartella `node_modules` contiene migliaia di file e iCloud la sincronizzerebbe all'infinito.
3. **Spazio e rete**: la prima volta vengono scaricati circa 300 MB (Electron ed electron-builder), poi restano in `node_modules`.

---

## 2. Metodo semplice: doppio clic

Nella cartella `strumenti-mac` ci sono questi script:

| Script | Cosa fa |
|---|---|
| **Avvia Quaderno.command** | Apre Quaderno senza creare l'app: serve per provare le modifiche |
| **Crea app Mac.command** | Crea i due `.dmg` |
| **Crea app Windows.command** | Crea `setup.exe` e `portable.exe` (oppure lo `.zip` di riserva) |
| **Crea app Mac e Windows.command** | Li crea tutti e due di seguito |

**La prima volta** macOS blocca gli script scaricati da internet ("sviluppatore non identificato"). Hai due possibilità:
- per ogni script: **clic destro → Apri → Apri**. Basta una volta per script;
- oppure, una volta sola, in *Terminale*:
  ```bash
  xattr -dr com.apple.quarantine ~/Documenti/Progetti/quaderno
  ```
  (con il percorso della tua cartella: puoi trascinare la cartella nel Terminale invece di scriverlo).

Ogni script apre una finestra di Terminale che mostra cosa sta facendo e, alla fine, apre la cartella `dist`.

---

## 3. Metodo con il Terminale

```bash
cd ~/Documenti/Progetti/quaderno     # la cartella con package.json
npm install                          # solo la prima volta, o dopo aver cambiato le versioni
npm start                            # prova l'app
npm run dist:mac                     # .dmg per chip Apple e Intel
npm run dist:win                     # setup.exe e portable.exe per Windows
npm run dist:all                     # Mac e Windows insieme
npm run dist:win-zip                 # Windows di riserva: .zip senza installer
```

---

## 4. Installare sul tuo Mac

1. Apri `Quaderno-…-mac-arm64.dmg` (o `x64` se il Mac è Intel) e trascina **Quaderno** in **Applicazioni**.
2. Un'app creata sul tuo Mac si apre direttamente.
3. Se copi il `.dmg` su un **altro** Mac, la prima volta macOS dice che lo sviluppatore non è verificato:
   - **clic destro sull'app → Apri**;
   - oppure *Impostazioni di Sistema → Privacy e sicurezza → Apri comunque*.

L'app ha una firma "ad-hoc" (gratuita, senza certificato Apple). Per questo non compare l'errore "l'app è danneggiata", ma solo l'avviso di sviluppatore non verificato. Togliere anche quello richiede l'Apple Developer Program, a pagamento.

## 5. La versione Windows creata dal Mac

- **Mac con chip Apple**: gli strumenti che preparano l'installer Windows sono programmi Intel e girano tramite **Rosetta 2**. Lo script lo controlla e propone di installarlo. A mano: `softwareupdate --install-rosetta --agree-to-license`.
- Al primo `dist:win` electron-builder scarica da solo gli strumenti per Windows. Ci vuole qualche minuto in più.
- Se l'installer non si riesce a creare, lo script propone lo **`.zip`**, che non ha bisogno di quegli strumenti. Su Windows si estrae la cartella e si avvia `Quaderno.exe`. In questa versione il file `.exe` mostra l'icona standard di Electron, mentre la finestra mostra quella di Quaderno.
- In ogni caso GitHub può creare l'installer Windows su un vero Windows: vedi [PUBBLICARE.md](PUBBLICARE.md), sezione 4.

Su Windows, al primo avvio SmartScreen può avvisare: **Ulteriori informazioni → Esegui comunque**. Anche qui, togliere l'avviso richiede un certificato di firma a pagamento.

Non avendo un PC Windows, prova la versione Windows su un PC dell'ufficio, con la versione `portable.exe`: non installa nulla.

---

## 6. Nuova versione

1. Modifica i file (l'interfaccia è tutta in `app/index.html`).
2. Prova con **Avvia Quaderno** (o `npm start`).
3. In `package.json` aumenta `"version"` (es. `1.3.0` → `1.3.1`). Il numero finisce nei nomi dei file. In `app/index.html` aggiorna anche `APP_VER`, che compare in *? → Informazioni*.
4. Ricrea le app.

Le note **non** stanno dentro l'app, ma nella cartella di lavoro. Reinstallare o aggiornare Quaderno non le tocca.

---

## 7. Problemi

| Messaggio o sintomo | Soluzione |
|---|---|
| `npm: command not found` | Node.js non è installato, oppure il Terminale era già aperto prima di installarlo: chiudilo e riaprilo |
| Lo script `.command` non si apre | clic destro → Apri (vedi sezione 2) |
| `EACCES` / permessi durante `npm install` | non usare `sudo`. Sposta il progetto in una cartella tua (Documenti) e rilancia |
| `wine` / `Bad CPU type` durante `dist:win` | installa Rosetta 2 (sezione 5) oppure usa `npm run dist:win-zip` |
| Download di Electron lento o bloccato | riprova. Su reti aziendali con proxy usa una connessione diversa |
| "Quaderno è danneggiato" su un altro Mac | in Terminale: `xattr -cr /Applications/Quaderno.app` |
| `npm` segnala *vulnerabilities* | riguardano solo gli strumenti di build, non l'app: vedi sezione 8 |
| Voglio ripartire da zero | cancella le cartelle `node_modules` e `dist` e rilancia |

## 8. Avviso "vulnerabilities" di npm

Durante `npm install` npm può scrivere qualcosa come *11 vulnerabilities (5 moderate, 6 high)*. **Riguarda solo gli strumenti che creano i pacchetti, non l'app.**

- Le segnalazioni sono tutte in librerie usate da **electron-builder** per cercare i file con schemi come `*.js` (`minimatch`, `picomatch` e simili). Il rischio indicato è un blocco del programma se riceve uno schema di ricerca costruito apposta da un malintenzionato. Qui gli schemi sono solo quelli scritti in `package.json`, quindi il caso non si presenta.
- **Nessuna di queste librerie finisce dentro Quaderno.** L'app contiene solo `app/index.html`, `main.js`, `preload.js`, `fsops.js`, `package.json` e l'icona: Quaderno non usa librerie esterne. Per controllarlo: `npm audit --omit=dev`, che esamina solo ciò che va nell'app, risponde **found 0 vulnerabilities**.
- Electron, che invece è nell'app, è alla versione più recente e non è segnalato.
- **Non usare `npm audit fix --force`**: per "risolvere" scenderebbe a electron-builder 24, una versione più vecchia, e potrebbe rompere la creazione dei pacchetti. Per una di queste librerie (`picomatch`) non esiste ancora una versione corretta.

Cosa conviene fare: ogni tanto aggiornare gli strumenti con `npm update` (o cambiando le versioni in `package.json`), così le correzioni arrivano quando electron-builder le pubblica.

## Cosa c'è nel progetto

```
app/index.html           interfaccia e logica (funziona anche da sola nel browser)
main.js                  processo principale Electron: finestra, dialoghi, controllo della cartella
preload.js               ponte sicuro tra la pagina e il sistema
fsops.js                 lettura e scrittura dei file .md e delle immagini
build/icon.png           icona 1024×1024 (electron-builder la converte in .icns e .ico)
package.json             versioni e configurazione dei pacchetti (sezione "build")
strumenti-mac/           script da avviare con doppio clic
.github/workflows/       build automatiche su GitHub
```
