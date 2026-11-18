---
name: convenciones
description: Convenciones de git del equipo, con nombres de rama, mensajes de commit (Conventional Commits) y formato de las pull requests. Úsala siempre antes de crear una rama, hacer un commit o abrir una pull request.
user-invocable: false
---

# Convenciones de git del equipo

Este archivo define cómo trabaja el equipo con git. Si cambia una convención, se cambia aquí.

## Generales

- Rama principal: `main`. Nunca se hace commit directamente en ella.
- Idioma de los mensajes de commit y de las PR: español.

## Ramas

Formato: `<tipo>/<descripcion-corta>`, en minúsculas y con guiones.

- `<tipo>` es uno de los tipos de commit de la tabla de abajo.
- Ejemplos: `feat/login-con-sso`, `fix/total-negativo-carrito`, `docs/guia-de-instalacion`.

## Commits: Conventional Commits

Formato del título:

```
<tipo>(<ámbito opcional>): <descripción>
```

- La descripción va en imperativo y en minúscula, sin punto final ("añadir", no "añadido").
- El título completo no pasa de 72 caracteres.
- Si el cambio rompe la compatibilidad, añade `!` después del tipo o del ámbito y explica el cambio en el cuerpo con `BREAKING CHANGE: ...`.
- El cuerpo es opcional. Cuenta qué cambia y por qué, no cómo.
- Cada commit contiene un solo cambio lógico.

| Tipo       | Cuándo se usa                                          |
| ---------- | ------------------------------------------------------ |
| `feat`     | Nueva funcionalidad                                    |
| `fix`      | Corrección de un error                                 |
| `docs`     | Solo documentación                                     |
| `style`    | Formato, sin cambiar la lógica                         |
| `refactor` | Cambio de código que ni corrige ni añade funcionalidad |
| `perf`     | Mejora de rendimiento                                  |
| `test`     | Añadir o corregir tests                                |
| `build`    | Sistema de build o dependencias                        |
| `ci`       | Configuración de la integración continua               |
| `chore`    | Mantenimiento que no toca el código de la aplicación   |
| `revert`   | Revierte un commit anterior                            |

Ejemplos:

```
feat(carrito): añadir descuento por volumen
fix: evitar total negativo al quitar productos
docs: explicar cómo arrancar el proyecto en local
refactor(api)!: renombrar /users a /clientes
```

## Pull requests

- Base: `main`.
- Título: el mismo formato que un commit.
- Una PR tiene un solo propósito. Si mezcla cosas, se divide.
- Descripción con esta plantilla:

```markdown
## Qué

<qué cambia, en 1-3 frases>

## Por qué

<motivo del cambio o problema que resuelve>

## Cómo probarlo

<pasos para comprobar que funciona>
```
