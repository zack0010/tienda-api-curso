---
titulo: Filtrar el catálogo por categoría y precio máximo
etiquetas: mejora
---

## Qué queremos

Que la app pueda pedir solo una parte del catálogo.

## Criterios de aceptación

- `GET /api/products?category=hogar` devuelve solo los productos de esa categoría.
- `GET /api/products?maxPriceCents=3000` devuelve los productos que cuestan 30,00 € o menos.
- Los dos filtros se pueden combinar.
- Sin filtros, la respuesta no cambia.
- Si un parámetro no es válido, responde 400 con el código `VALIDATION_ERROR`.
- Con tests.
