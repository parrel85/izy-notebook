#!/bin/bash
# Doppio clic: crea Quaderno per Mac (.dmg per chip Apple e per Intel) nella cartella dist.
source "$(dirname "$0")/_comune.sh"
titolo "Creo Quaderno per Mac"
rm -f dist/*.dmg dist/*.blockmap 2>/dev/null
if npm run dist:mac; then
  titolo "Fatto"
  echo "Nella cartella dist trovi:"
  ls -1 dist/*.dmg 2>/dev/null | sed 's|^dist/|   |'
  echo
  if [ "$(uname -m)" = "arm64" ]; then echo "Questo Mac ha il chip Apple: usa il file ...-mac-arm64.dmg"
  else echo "Questo Mac è Intel: usa il file ...-mac-x64.dmg"; fi
  echo "Aprilo e trascina Quaderno nella cartella Applicazioni."
  open dist
else
  echo; echo "La creazione non è riuscita: leggi il messaggio sopra (vedi docs/COMPILARE.md, sezione Problemi)."
fi
pausa
