---
name: commit
description: Crea uno o varios commits siguiendo las convenciones del equipo. Si estás en main, crea antes una rama.
argument-hint: '[pista sobre el cambio]'
disable-model-invocation: true
allowed-tools:
  - Bash(git status *)
  - Bash(git diff *)
  - Bash(git log *)
  - Bash(git branch *)
  - Bash(git switch *)
  - Bash(git add *)
  - Bash(git commit *)
---

# Commit con las convenciones del equipo

## Situación actual

- Rama: !`git branch --show-current`
- Archivos cambiados: !`git status --short`
- Últimos commits: !`git log --oneline -5`

## Pasos

1. Sigue las convenciones del equipo (skill `convenciones`). Cárgala si no la tienes ya.
2. Si estás en `main`, crea primero una rama con `git switch -c <tipo>/<descripcion-corta>`. Hazlo en un comando aparte, antes del commit.
3. Revisa los cambios con `git diff` y agrúpalos: un commit por cada cambio lógico.
4. Para cada grupo, añade solo sus archivos con `git add` y haz el commit.
5. No hagas push.
6. Termina mostrando los commits creados con `git log --oneline -5`.

Pista del usuario sobre el cambio (puede estar vacía): $ARGUMENTS
