# Funzioni comuni agli script per Mac (non va aperto da solo)
pausa() { echo; read -n 1 -s -r -p "Premi un tasto per chiudere questa finestra..."; echo; }
titolo() { echo; echo "=================================================="; echo "  $1"; echo "=================================================="; echo; }

# va alla cartella del progetto (quella con package.json)
cd "$(dirname "$0")/.." || { echo "Cartella del progetto non trovata."; pausa; exit 1; }

# Node.js installato?
if ! command -v npm >/dev/null 2>&1; then
  for d in /usr/local/bin /opt/homebrew/bin; do [ -x "$d/npm" ] && export PATH="$d:$PATH"; done
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js non è installato."
  echo "Si apre la pagina di download: scegli la versione LTS per macOS (.pkg),"
  echo "installala come un normale programma e poi rilancia questo script."
  open "https://nodejs.org/it/download"
  pausa; exit 1
fi
echo "Node.js $(node -v), npm $(npm -v)"

# dipendenze (Electron ed electron-builder): solo la prima volta, circa 300 MB
if [ ! -d node_modules/electron ] || [ ! -d node_modules/electron-builder ]; then
  titolo "Prima volta: scarico Electron ed electron-builder (qualche minuto)"
  npm install || { echo; echo "npm install non è riuscito: controlla la connessione e riprova."; pausa; exit 1; }
  echo
  echo "Nota: se npm segnala delle \"vulnerabilities\", riguardano solo gli strumenti che creano"
  echo "i pacchetti, non l'app Quaderno: vedi docs/COMPILARE.md, sezione 8. Non usare \"npm audit fix --force\"."
fi
