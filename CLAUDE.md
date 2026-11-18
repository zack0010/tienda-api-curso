# CLAUDE.md

## Tests y verificación

- Para un solo módulo: `npx vitest run tests/<módulo>.test.ts --coverage.enabled=false`. `npm test` exige un 80 % de cobertura global y falla con un solo módulo aunque los tests pasen.
- Vitest no comprueba tipos. Antes de dar una tarea por terminada, ejecuta `npm test`, `npm run typecheck` y `npm run lint`.

## Decisiones

- La API pública está congelada: la usa la app móvil, que no se actualiza a la vez que el backend. No cambies rutas ni formatos de respuesta existentes; los campos nuevos se añaden sin quitar los antiguos.
