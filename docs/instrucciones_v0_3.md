# VITA v0.3, instrucciones

## Archivos modificados

Copia encima de la versión actual:

- `index.html`
- `styles.css`
- `app.js`
- `service-worker.js`
- `config.js`
- `README.md`
- `docs/supabase_v0_3.sql`
- `docs/instrucciones_v0_3.md`

## Qué se añade

- Pantalla de Listas.
- Lista de la compra compartida.
- Lista de compras personal.
- Lista de deseos con preparación para enlaces e imágenes.
- Pantalla de Documentos.
- Botón de descarga de documento de prueba.
- Botón de envío por email mediante `mailto`.
- SQL preparatorio para documentos generados, listas, artículos y visibilidad selectiva de deseos.

## Supabase

Cuando estemos listas para base de datos:

1. Ejecutar primero `docs/supabase_v0_2.sql`, si no se ha ejecutado ya.
2. Ejecutar después `docs/supabase_v0_3.sql`.

Este nivel sí requiere tocar Supabase para crear las nuevas tablas cuando pasemos de demo visual a datos reales.
