#!/bin/bash
# Doppio clic: avvia Quaderno senza creare l'app (per provare le modifiche).
source "$(dirname "$0")/_comune.sh"
titolo "Avvio Quaderno (chiudi la finestra di Quaderno per terminare)"
npm start
