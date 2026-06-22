# VITA v1.0, volantes y documentos médicos

## Paso 1. Supabase

Ejecuta en Supabase SQL Editor:

`docs/supabase_v1_0.sql`

Este SQL crea:

- bucket privado `vita-medical-documents`;
- tabla `medical_documents`;
- políticas RLS;
- políticas de Storage.

## Paso 2. Archivos

Copia encima:

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v1_0.md`
- `docs/supabase_v1_0.sql`

## Paso 3. GitHub Desktop

Commit:

`VITA v1.0 volantes medicos`

Push origin.

## Prueba

1. Entra como Patricia.
2. Ve a Citas.
3. Abre la pestaña Volantes.
4. Guarda un volante con foto o PDF.
5. Comprueba que aparece en Volantes guardados.
6. Descárgalo.
7. Marca el documento como usado.
8. Entra como Román y confirma que no ve los documentos de Patricia.

## Importante

El bucket es privado. Los documentos solo deben descargarse desde una sesión autenticada del propietario.
