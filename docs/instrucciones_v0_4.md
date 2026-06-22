# VITA v0.4, instrucciones

## Archivos modificados

Copia encima de la versión actual:

- `index.html`
- `styles.css`
- `app.js`
- `service-worker.js`
- `config.js`
- `README.md`
- `docs/instrucciones_v0_4.md`

## Qué se añade

- Pantalla inicial de inicio de sesión.
- Acceso con usuario y contraseña mediante Supabase Auth.
- La app queda oculta hasta iniciar sesión si Supabase está configurado.
- Modo demo local solo cuando Supabase todavía no está configurado.
- Botón para restablecer contraseña.
- Pantalla de cuenta adaptada a sesión segura.

## Cómo crear usuarios en Supabase

1. Entra en tu proyecto de Supabase.
2. Ve a Authentication.
3. Entra en Users.
4. Crea un usuario para Patricia con email y contraseña.
5. Más adelante crea otro usuario para Román.
6. Comprueba que el usuario queda confirmado o que puede iniciar sesión según la configuración de email.

## Configuración recomendada

En Authentication → Providers → Email:

- Mantén activo Email.
- Usa password authentication.
- Desactiva los registros públicos si la app va a ser solo para vosotros.
- Crea los usuarios desde el panel de Supabase.

En Authentication → URL Configuration:

- Añade la URL pública de GitHub Pages como Site URL.
- Añade también esa URL en Redirect URLs.

## config.js

Cuando Supabase esté creado, pega:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

No pegues nunca la service_role key.
