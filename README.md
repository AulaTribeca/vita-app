# VITA v0.8

Nivel 8 de VITA: registros reales de salud diaria.

## Qué añade

- Tabla `health_records` en Supabase.
- Registro rápido de:
  - baño;
  - síntomas;
  - sueño;
  - regla;
  - dolor;
  - ánimo.
- Registro detallado con:
  - tipo;
  - fecha y hora;
  - intensidad de 1 a 10;
  - nota.
- Carga de actividad reciente desde Supabase.
- Contadores de registros de hoy.
- Privacidad: cada usuario solo puede ver sus propios registros de salud.

## Archivos modificados

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v0_8.md`
- `docs/supabase_v0_8.sql`

## Importante

Antes de probar Salud, ejecuta `docs/supabase_v0_8.sql` en Supabase.
