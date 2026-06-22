# VITA v1.0.1, depuración de login

## Qué debes copiar encima

- `index.html`
- `app.js`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v1_0_1.md`

## Supabase

No hay que ejecutar SQL nuevo.

## GitHub Desktop

Commit:

`VITA v1.0.1 depurar login`

Después:

`Push origin`

## Prueba obligatoria

1. Abre VITA en incógnito.
2. Entra como `Patricia`.
3. Comprueba que carga la app.
4. Cierra sesión.
5. Entra como `Román`.
6. Cierra sesión.
7. Vuelve a entrar como `Patricia`.

## Qué se ha corregido

El fallo venía de `app.js`: al añadir salud, citas y volantes se duplicaron varias variables de estado en la zona inicial del archivo. Eso provocaba un error de JavaScript antes de que se activase el formulario de login. Por eso Supabase podía registrar sesiones o intentos, pero la app no llegaba a entrar correctamente.
