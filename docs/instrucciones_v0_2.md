# VITA v0.2, instrucciones

## Cómo actualizar desde GitHub Desktop

No borres la carpeta completa. Copia estos archivos encima de la versión actual:

- `index.html`
- `styles.css`
- `app.js`
- `service-worker.js`
- `config.js`
- `docs/supabase_v0_2.sql`
- `docs/instrucciones_v0_2.md`
- `README.md`

Después:

1. Abre GitHub Desktop.
2. Revisa los cambios.
3. Commit: `VITA v0.2 Supabase core`
4. Push origin.

## GitHub Pages

Mantén GitHub Pages como:

Settings → Pages → Source: Deploy from a branch → Branch: main → Folder: /root.

## Supabase

En esta versión ya hay que tocar Supabase cuando quieras activar login real.

Pasos:

1. Crear proyecto en Supabase.
2. Ir a SQL Editor.
3. Crear una consulta nueva.
4. Pegar el contenido de `docs/supabase_v0_2.sql`.
5. Ejecutar.
6. Ir a Project Settings → API.
7. Copiar:
   - Project URL
   - anon/public key
8. Pegar esos valores en `config.js`.

No pegues nunca la service_role key en `config.js`.

## Autenticación

En Supabase, revisa Auth → URL Configuration.

Cuando la app esté publicada en GitHub Pages, habrá que añadir la URL pública de VITA como Site URL y Redirect URL para que el enlace mágico vuelva correctamente a la app.
