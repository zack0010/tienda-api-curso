#!/usr/bin/env bash
# Hook PreToolUse: se ejecuta ANTES de cada "git commit".
# Si la rama actual está protegida, bloquea el commit (exit 2) y le explica a Claude qué hacer.

# PERSONALIZAR: ramas en las que no se permite hacer commit (separadas por espacios).
RAMAS_PROTEGIDAS="main master"

# El filtro "if" de la configuración es aproximado: si Claude Code no puede analizar
# un comando, ejecuta el hook igualmente. Por eso se comprueba aquí que es un commit.
entrada=$(cat)
case "$entrada" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

rama=$(git branch --show-current 2>/dev/null)

for protegida in $RAMAS_PROTEGIDAS; do
  if [ "$rama" = "$protegida" ]; then
    echo "No se puede hacer commit directamente en '$rama'. Crea antes una rama según las convenciones del equipo (por ejemplo: git switch -c feat/descripcion-corta) y haz el commit en ella." >&2
    exit 2
  fi
done

exit 0
