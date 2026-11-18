#!/usr/bin/env bash
# Hook PostToolUse: se ejecuta DESPUÉS de cada "git commit".
# Si el mensaje del último commit no sigue Conventional Commits, se lo dice a Claude (exit 2) para que lo corrija.

# PERSONALIZAR: tipos de commit permitidos. Mantenlos iguales que en skills/convenciones/SKILL.md.
TIPOS="feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert"

# El filtro "if" de la configuración es aproximado: si Claude Code no puede analizar
# un comando, ejecuta el hook igualmente. Por eso se comprueba aquí que era un commit.
entrada=$(cat)
case "$entrada" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

titulo=$(git log -1 --format=%s 2>/dev/null) || exit 0
formato="^($TIPOS)(\([a-z0-9-]+\))?!?: .+"

if [[ ! "$titulo" =~ $formato ]]; then
  echo "El último commit no sigue Conventional Commits: \"$titulo\"" >&2
  echo "Formato: <tipo>(<ámbito opcional>): <descripción>. Tipos permitidos: ${TIPOS//|/, }" >&2
  echo "Corrígelo con: git commit --amend -m \"<mensaje correcto>\"" >&2
  exit 2
fi

exit 0
