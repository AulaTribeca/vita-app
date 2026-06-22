# VITA v1.1, medicación real

## Paso 1. Supabase

Ejecuta en Supabase SQL Editor:

`docs/supabase_v1_1.sql`

Este SQL crea:

- tabla `medications`;
- tabla `medication_dose_logs`;
- políticas RLS;
- índices básicos.

## Paso 2. Archivos

Copia encima:

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v1_1.md`
- `docs/supabase_v1_1.sql`

## Paso 3. GitHub Desktop

Commit:

`VITA v1.1 medicacion`

Push origin.

## Prueba

1. Entra como Patricia.
2. Ve a Medicación.
3. Abre Nueva.
4. Añade un medicamento con una hora de toma, por ejemplo `08:00`.
5. Ve a Hoy.
6. Marca la toma como realizada.
7. Ve a Stock.
8. Comprueba que se ha descontado una unidad.
9. Cierra sesión.
10. Entra como Román y confirma que no ve la medicación de Patricia.

## Importante

Esta fase todavía no envía notificaciones automáticas. De momento muestra avisos visuales dentro de la app.
