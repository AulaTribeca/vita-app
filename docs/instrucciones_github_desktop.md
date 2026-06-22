# Cómo sustituir la versión anterior usando GitHub Desktop

1. Cierra el navegador donde tenías VITA abierta.
2. En tu ordenador, entra en la carpeta local del repositorio.
3. Borra todo el contenido anterior.
4. Descomprime `vita_v0_1_1.zip`.
5. Copia dentro del repositorio estos archivos y carpetas:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `manifest.webmanifest`
   - `service-worker.js`
   - `README.md`
   - `assets`
   - `docs`
6. Abre GitHub Desktop.
7. Revisa que aparezcan los cambios.
8. Escribe un mensaje de commit, por ejemplo: `VITA v0.1.1 static base`.
9. Pulsa `Commit to main`.
10. Pulsa `Push origin`.

## Ajuste de GitHub Pages

En GitHub:

Settings → Pages → Build and deployment → Source → Deploy from a branch.

Selecciona:

- Branch: `main`
- Folder: `/root`

Guarda.

Si la página publicada sigue viéndose en blanco, prueba a abrirla en ventana de incógnito o borra caché, porque la versión anterior tenía service worker y puede quedar cacheada.
