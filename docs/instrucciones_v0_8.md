# VITA v0.8, salud diaria real

## Paso 1. Supabase

Ejecuta en Supabase SQL Editor:

`docs/supabase_v0_8.sql`

Este SQL crea la tabla `health_records` y las políticas RLS para que cada usuario solo pueda ver sus propios registros.

## Paso 2. Archivos

Copia encima:

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v0_8.md`
- `docs/supabase_v0_8.sql`

## Paso 3. GitHub Desktop

Commit:

`VITA v0.8 salud real`

Push origin.

## Prueba

1. Entra como Patricia.
2. Ve a Salud.
3. Pulsa “Baño”.
4. Guarda un registro detallado con una nota.
5. Comprueba que aparece en Actividad reciente.
6. Cierra sesión.
7. Entra como Román.
8. Comprueba que no aparecen los registros de Patricia.

## Importante

Aunque ya se guardan registros reales, todavía no subas documentos médicos ni volantes. Eso llegará en la fase de documentos de salud.
