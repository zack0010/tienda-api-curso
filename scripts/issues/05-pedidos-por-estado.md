---
titulo: Filtrar mis pedidos por estado
etiquetas: mejora
---

## Qué queremos

Que el usuario pueda ver, por ejemplo, solo sus pedidos pendientes.

## Criterios de aceptación

- `GET /api/orders?status=pending` devuelve solo los pedidos del usuario en ese estado.
- Los estados válidos son los de `OrderStatus`. Con otro valor, responde 400 con el código `VALIDATION_ERROR`.
- Sin filtro, la respuesta no cambia.
- Con tests.
