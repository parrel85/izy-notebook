#!/bin/bash
# Doppio clic: crea Quaderno per Windows dal Mac (installer + versione portable) nella cartella dist.
source "$(dirname "$0")/_comune.sh"
titolo "Creo Quaderno per Windows"

# sui Mac con chip Apple gli strumenti Windows (Wine) girano tramite Rosetta 2
if [ "$(uname -m)" = "arm64" ] && ! /usr/bin/arch -x86_64 /usr/bin/true 2>/dev/null; then
  echo "Per creare la versione Windows su un Mac con chip Apple serve Rosetta 2 (gratuito, di Apple)."
  read -r -p "Lo installo adesso? Ti verrà chiesta la password del Mac. [s/n] " r
  if [ "$r" = "s" ] || [ "$r" = "S" ]; then sudo softwareupdate --install-rosetta --agree-to-license; fi
fi

rm -f dist/*.exe dist/*-win*.zip dist/*.blockmap 2>/dev/null
if npm run dist:win; then
  titolo "Fatto"
  echo "Nella cartella dist trovi:"
  echo "   Quaderno-...-setup.exe     installer per Windows"
  echo "   Quaderno-...-portable.exe  versione senza installazione"
  open dist
else
  rm -f dist/*.exe dist/*.nsis.7z 2>/dev/null   # toglie i file incompleti
  echo
  echo "L'installer non si è potuto creare (di solito per gli strumenti Windows/Wine)."
  read -r -p "Creo invece la versione .zip (cartella pronta all'uso, senza installer)? [s/n] " r
  if [ "$r" = "s" ] || [ "$r" = "S" ]; then
    if npm run dist:win-zip; then
      titolo "Fatto"
      echo "In dist trovi Quaderno-...-win.zip: su Windows estrailo e avvia Quaderno.exe"
      open dist
    fi
  fi
  echo
  echo "In alternativa l'installer lo crea GitHub (vedi docs/PUBBLICARE.md)."
fi
pausa
