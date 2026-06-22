# VITA v0.4.3, corrección de login por usuario

## Archivos que debes copiar encima

- `index.html`
- `app.js`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v0_4_3.md`

## Después

1. Commit en GitHub Desktop:
   `VITA v0.4.3 corregir login usuario`
2. Push origin.
3. Espera a que GitHub Pages despliegue.
4. Abre la app en ventana de incógnito.

## Prueba

Usuario:

`Patricia`

Contraseña:

la de Supabase.

Después prueba:

`Román`

## Si vuelve a salir el aviso del @

Eso significa que el navegador sigue usando el `index.html` antiguo.

Haz esto en Chrome:

1. Abre VITA.
2. Pulsa F12.
3. Entra en Application.
4. Service Workers → Unregister.
5. Storage → Clear site data.
6. Cierra esa pestaña.
7. Abre VITA otra vez.

La versión correcta no debe pedir un email.
