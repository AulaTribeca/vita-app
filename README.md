# VITA v0.1

Primera base visual de VITA, preparada para publicarse con GitHub Pages y para conectarse después con Supabase.

## Qué incluye esta versión

- Pantalla principal Hoy.
- Registro rápido de salud.
- Citas médicas con acción de volante.
- Medicación con control visual de stock.
- Hogar y gestiones compartidas.
- Estética base de la app.
- PWA inicial con manifest y service worker.
- Cliente Supabase preparado, pero todavía sin conexión real.

## Qué no incluye todavía

- Autenticación real.
- Base de datos Supabase.
- Subida real de documentos.
- Notificaciones push reales.
- Exportación PDF/ZIP.

Estas funciones se añaden en los siguientes niveles para no mezclar diseño, seguridad y datos personales antes de tener la estructura correcta.

## Publicación en GitHub Pages

1. Crear un repositorio nuevo en GitHub.
2. Subir todos los archivos de esta carpeta.
3. Entrar en Settings, Pages.
4. En Source, escoger GitHub Actions.
5. Ir a Actions y ejecutar el workflow si no se ejecuta automáticamente.

## Supabase

Cuando creemos el proyecto de Supabase, copiaremos los valores reales en variables de entorno:

- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

No deben escribirse claves privadas ni service role en el frontend.
