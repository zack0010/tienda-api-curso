# CLAUDE.md

## Descripción del proyecto

Tienda API es la API REST de una tienda online pequeña. Permite a los usuarios iniciar sesión, consultar el catálogo de productos, gestionar su carrito de la compra, aplicar cupones de descuento y hacer pedidos. Está desarrollada con Node.js y TypeScript y sigue una arquitectura por capas.

## Stack tecnológico

- Node.js 24
- TypeScript
- Express 5 para el servidor HTTP
- Zod para validar los datos de entrada
- jose para los tokens JWT
- Vitest y Supertest para los tests
- ESLint y Prettier

## Estructura del proyecto

- `src/app.ts`: crea la aplicación Express y registra las rutas
- `src/server.ts`: arranca el servidor
- `src/config.ts`: configuración a partir de variables de entorno
- `src/db/`: base de datos en memoria y datos iniciales
- `src/auth/`: login, tokens y middleware de autenticación
- `src/products/`: catálogo de productos
- `src/cart/`: carrito y cálculo de totales
- `src/coupons/`: cupones de descuento
- `src/orders/`: pedidos
- `src/shared/`: errores, validación y formato de importes
- `tests/`: tests de la API

Cada módulo tiene `routes.ts` (HTTP), `service.ts` (lógica de negocio) y `repository.ts` (acceso a datos).

## Comandos

- Instalar dependencias: `npm install`
- Arrancar en desarrollo: `npm run dev`
- Ejecutar los tests: `npm run test:unit`
- Lint: `npm run lint`

## Buenas prácticas

- Escribe código limpio, legible y mantenible.
- Usa nombres descriptivos para variables y funciones.
- Sigue los principios SOLID.
- Añade comentarios cuando el código no sea evidente.
- Gestiona siempre los errores.
- Usa TypeScript de forma estricta y evita `any`.
- Formatea el código con Prettier después de cada cambio.

## Reglas importantes

- IMPORTANTE: NUNCA LEAS EL FICHERO .env. CONTIENE SECRETOS.
- IMPORTANTE: NO HAGAS NUNCA `git push --force`.
- Los importes se guardan en céntimos, como números enteros.
- La API pública está congelada: la usa la app móvil, que no se actualiza a la vez que el backend. No cambies rutas ni formatos de respuesta existentes; los campos nuevos se añaden sin quitar los antiguos.

## Tests

- Usamos Vitest y Supertest.
- Los tests están en la carpeta `tests/`.
- En los tests, crea los datos que necesites con las funciones de `tests/helpers.ts`. No modifiques `src/db/seed.ts`: otros tests dependen de esos datos exactos.
- Escribe tests para todo el código nuevo.

## Git

- Las ramas se llaman `tipo/descripcion-corta`, por ejemplo `feat/login-con-sso`.
- Los mensajes de commit siguen Conventional Commits: `feat: ...`, `fix: ...`, `docs: ...`.
- No hagas commit directamente en `main`.

## Usuarios de prueba

- ana@tienda.test / ana-1234
- luis@tienda.test / luis-1234
