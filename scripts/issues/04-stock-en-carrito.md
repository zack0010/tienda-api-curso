---
titulo: No dejar añadir al carrito más unidades de las que hay en stock
etiquetas: mejora
---

## Qué pasa ahora

El carrito acepta cualquier cantidad (hasta 99 unidades) aunque no haya stock. El usuario no se entera hasta que hace el pedido y recibe un 409 `OUT_OF_STOCK`.

## Criterios de aceptación

- `POST /api/cart/items` y `PATCH /api/cart/items/:productId` responden 409 con el código `OUT_OF_STOCK` si las unidades del producto en el carrito superan su stock.
- El mensaje dice cuántas unidades quedan.
- La comprobación al hacer el pedido se mantiene: el stock puede cambiar entre medias.
- Con tests.
