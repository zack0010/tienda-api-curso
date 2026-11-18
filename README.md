# Tienda API

API REST de una tienda online pequeña: catálogo de productos, carrito, cupones de descuento y pedidos.

Es el repositorio de prácticas del curso de Claude Code. Tiene tests, algún bug conocido y tareas pendientes, que están en los issues.

## Requisitos

- Node.js 22.18 o superior (recomendada la 24)
- Git. En Windows, Git for Windows, que incluye Git Bash
- CLI de GitHub (`gh`) con la sesión iniciada
- Claude Code

## Puesta en marcha

1. Crea tu copia desde la plantilla: **Use this template → Create a new repository**, con la opción **Include all branches** marcada.
2. Clona tu copia y entra en la carpeta.
3. Instala las dependencias y prepara el entorno:

   ```bash
   npm install
   npm run setup    # comprueba las herramientas y crea el .env
   npm run issues   # crea en tu repositorio los issues del curso
   ```

4. Comprueba que todo funciona:

   ```bash
   npm test
   npm run dev      # http://localhost:3000/api/health
   ```

## Usuarios de prueba

| Email              | Contraseña  |
| ------------------ | ----------- |
| `ana@tienda.test`  | `ana-1234`  |
| `luis@tienda.test` | `luis-1234` |

## Endpoints

Las rutas de carrito y pedidos necesitan la cabecera `Authorization: Bearer <token>`, con el token que devuelve el login. Los importes van en céntimos.

| Método   | Ruta                         | Qué hace                                    |
| -------- | ---------------------------- | ------------------------------------------- |
| `POST`   | `/api/auth/login`            | Inicia sesión y devuelve un token           |
| `GET`    | `/api/products`              | Lista el catálogo                           |
| `GET`    | `/api/products/:id`          | Devuelve un producto                        |
| `GET`    | `/api/cart`                  | Devuelve el carrito con sus totales         |
| `POST`   | `/api/cart/items`            | Añade un producto (`productId`, `quantity`) |
| `PATCH`  | `/api/cart/items/:productId` | Cambia la cantidad de un producto           |
| `DELETE` | `/api/cart/items/:productId` | Quita un producto                           |
| `POST`   | `/api/cart/coupon`           | Aplica un cupón (`code`)                    |
| `DELETE` | `/api/cart/coupon`           | Quita el cupón                              |
| `POST`   | `/api/orders`                | Crea un pedido con el contenido del carrito |
| `GET`    | `/api/orders`                | Lista mis pedidos                           |
| `GET`    | `/api/orders/:id`            | Devuelve un pedido                          |
| `POST`   | `/api/orders/:id/cancel`     | Cancela un pedido pendiente                 |

Ejemplo desde Git Bash, con el servidor arrancado:

```bash
TOKEN=$(curl -s -X POST localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@tienda.test","password":"ana-1234"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

curl -s localhost:3000/api/cart -H "Authorization: Bearer $TOKEN"
```

## Scripts

| Script              | Qué hace                                          |
| ------------------- | ------------------------------------------------- |
| `npm test`          | Ejecuta los tests (Vitest) con cobertura          |
| `npm run dev`       | Arranca el servidor y lo reinicia con cada cambio |
| `npm run typecheck` | Comprueba los tipos de TypeScript                 |
| `npm run lint`      | Pasa ESLint                                       |
| `npm run format`    | Formatea el código con Prettier                   |

## Servidor MCP (sesión 3)

`mcp/servidor.ts` expone la API como herramientas para Claude Code: buscar productos, ver el carrito y los pedidos, añadir al carrito y hacer un pedido. Necesita la API arrancada (`npm run dev`) y se conecta como `ana@tienda.test`. Se puede cambiar con las variables `TIENDA_URL`, `TIENDA_EMAIL` y `TIENDA_PASSWORD`.

```bash
claude mcp add --scope project tienda -- node mcp/servidor.ts
```

## Ramas

- `main`: punto de partida del curso.
- `solucion/sesion-1`: cómo debería quedar el repositorio al terminar la sesión 1.
- `solucion/sesion-2`: cómo debería quedar al terminar la sesión 2, con las skills y los hooks del plugin.

Si te has quedado atrás en la sesión 1, trae a tu rama los archivos de la solución. Quedan como cambios sin commit, igual que si hubieras hecho tú las prácticas:

```bash
git checkout origin/solucion/sesion-1 -- .
```

Para empezar la sesión 3 desde la solución de la sesión 2, crea tu rama a partir de tu `main`, trae los archivos de la solución y guárdalos en un commit. Si tienes cambios sin guardar, apártalos antes con `git stash -u`:

```bash
git switch -c feat/pedidos-y-carrito main
git checkout origin/solucion/sesion-2 -- .
git commit -m "feat: incorporar la solución de la sesión 2"
```

No crees la rama directamente desde `origin/solucion/sesion-2`. En una copia hecha desde la plantilla, cada rama es un commit sin historia común con `main`: el agente revisor no podría comparar tu rama con `main` y GitHub no te dejaría abrir la pull request.
