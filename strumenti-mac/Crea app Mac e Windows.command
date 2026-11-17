#!/bin/bash
# Doppio clic: crea in un colpo solo le versioni Mac e Windows.
DIR="$(dirname "$0")"
"$DIR/Crea app Mac.command" </dev/null | sed '/Premi un tasto/d'
exec "$DIR/Crea app Windows.command"
