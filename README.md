# VITA v4.1.2 sin errores

Versión defensiva contra la estructura antigua de Supabase.

## Error corregido

`shopping_lists_list_type_check`

Tu tabla antigua aceptaba `list_type` como `personal`, `household` o `wishlist`, pero las versiones recientes intentaban usar otros valores. Esta versión elimina el bloqueo antiguo y acepta tanto los valores antiguos como los nuevos.

## Cambios incluidos

- Corrige constraints antiguas de `shopping_lists`.
- Usa `name` y `title` para compatibilidad.
- Usa `owner_id` y `created_by` en elementos de listas.
- Repara lista de compra compartida, lista privada y lista de deseos.
- La app reconoce listas antiguas y nuevas.
- Mantiene pantalla Hoy, calendario, citas, documentos, medicación, wallet y listas.
- Mantiene adjuntos de volantes y tarjetas.
- Mantiene animaciones visuales de v4.1.1.

## Supabase

Ejecuta:

`docs/supabase_v4_1_2_sin_errores.sql`

Este sustituye a todos los SQL 4.x anteriores.
