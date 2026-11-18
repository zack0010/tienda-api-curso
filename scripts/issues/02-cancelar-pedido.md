---
titulo: Permitir cancelar un pedido pendiente
etiquetas: mejora
---

## Qué queremos

Que se pueda cancelar un pedido mientras todavía no se ha enviado.

## Criterios de aceptación

- Nuevo endpoint `POST /api/orders/:id/cancel`, que responde con el pedido actualizado.
- Solo se pueden cancelar los pedidos en estado `pending`. Si el pedido está en otro estado, responde 409 con el código `ORDER_NOT_CANCELLABLE`.
- Al cancelar, el pedido pasa a estado `cancelled` y las unidades de cada producto vuelven al stock.
- Si el pedido no existe, responde 404.
- Con tests.
