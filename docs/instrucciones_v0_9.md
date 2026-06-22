# VITA v0.9, citas médicas reales

## Paso 1. Supabase

Ejecuta en Supabase SQL Editor:

`docs/supabase_v0_9.sql`

Este SQL crea la tabla `medical_appointments` y las políticas RLS para que cada usuario solo pueda ver sus propias citas.

## Paso 2. Archivos

Copia encima:

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v0_9.md`
- `docs/supabase_v0_9.sql`

## Paso 3. GitHub Desktop

Commit:

`VITA v0.9 citas medicas`

Push origin.

## Prueba

1. Entra como Patricia.
2. Ve a Citas.
3. Pulsa Nueva.
4. Crea una cita médica.
5. Comprueba que aparece en Próximas.
6. Pulsa Completar.
7. Registra qué te dijeron, si hubo alta y si te dieron volante.
8. Comprueba que aparece en Historial.
9. Entra como Román y verifica que no ve las citas de Patricia.

## Importante

Todavía no subas volantes ni documentos médicos. Eso irá en la fase v1.0 con Supabase Storage.
