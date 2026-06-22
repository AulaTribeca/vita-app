# VITA v1.0

Nivel 10 de VITA: volantes y documentos médicos.

## Qué añade

- Bucket privado `vita-medical-documents` en Supabase Storage.
- Tabla `medical_documents`.
- Subida de fotos/PDF de volantes, informes, recetas o peticiones de prueba.
- Relación opcional con una cita médica.
- Estados:
  - pendiente de subir;
  - pendiente de llevar;
  - usado;
  - archivado.
- Descarga autenticada de documentos.
- Al registrar una cita con volante dado, VITA crea un recordatorio para guardar el volante.

## Archivos modificados

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v1_0.md`
- `docs/supabase_v1_0.sql`

## Importante

Antes de probar Volantes, ejecuta `docs/supabase_v1_0.sql` en Supabase.
