# VITA v0.4.2, acceso por nombre de usuario

## Archivos que debes copiar encima

- `index.html`
- `app.js`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v0_4_2.md`

## Qué hacer después

1. Copia los archivos encima de la versión actual.
2. Abre GitHub Desktop.
3. Commit: `VITA v0.4.2 login por usuario`
4. Push origin.
5. Abre la app publicada.
6. Inicia sesión escribiendo:
   - Usuario: `Patricia`
   - Contraseña: la que creaste en Supabase.
7. Después prueba:
   - Usuario: `Román`
   - Contraseña: la que creaste en Supabase.

## Cómo funciona

Supabase Auth necesita un email internamente, pero VITA ya no te lo pide. El archivo `config.js` contiene una tabla de equivalencias:

- `Patricia` → `patricia@vitaapp.com`
- `Román` → `roman@vitaapp.com`

También admite `Patri` y `Roman` sin tilde.

## Importante

La clave incluida en `config.js` es la publishable/anon key. No pegues nunca la service_role key.
