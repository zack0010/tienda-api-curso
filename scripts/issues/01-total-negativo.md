---
titulo: El total del carrito puede quedar en negativo
etiquetas: bug
---

## Qué pasa

Con un cupón de importe fijo mayor que el subtotal, el total del carrito sale negativo. Si se hace el pedido, se guarda con ese total.

## Cómo reproducirlo

1. Inicia sesión como `ana@tienda.test`.
2. Añade al carrito un cuaderno A5 (producto 4, 12,95 €).
3. Aplica el cupón `REGALO25` (tarjeta regalo de 25 €).
4. `GET /api/cart` devuelve `"totalCents": -1205`.

## Qué debería pasar

El descuento nunca supera el subtotal. En el ejemplo, `discountCents` debería ser 1295 y `totalCents`, 0.
