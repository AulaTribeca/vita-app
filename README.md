# VITA v1.1

Nivel 11 de VITA: medicación real y control de stock.

## Qué añade

- Tabla `medications`.
- Tabla `medication_dose_logs`.
- Alta de medicamentos.
- Horas de toma.
- Registro de tomas diarias.
- Descuento automático de stock al marcar una toma.
- Cálculo aproximado de días restantes.
- Aviso visual de compra cuando el stock baja.
- Reposición de stock por caja.
- Edición rápida de stock.
- Archivado de medicación.
- Privacidad: cada usuario solo ve su propia medicación.

## Archivos modificados

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v1_1.md`
- `docs/supabase_v1_1.sql`

## Importante

Antes de probar Medicación, ejecuta `docs/supabase_v1_1.sql` en Supabase.
