# VITA v1.6 estable

Fase de cierre y depuración de la primera versión utilizable de VITA.

## Qué corrige

- Limpieza de funciones antiguas duplicadas en salud.
- Limpieza definitiva del bloque de variables globales.
- Corrección de `loadProfileAndHousehold`, que había arrastrado líneas de reseteo en lugares indebidos.
- Gestión de sesión caducada.
- Refuerzo de `restRequest` para errores 401 y 403.
- Navegación protegida para evitar pantallas inexistentes.
- Actualización del service worker.
- Panel de diagnóstico en Cuenta.
- Botón para limpiar caché y recargar.
- Control de errores globales para que no fallen módulos en silencio.

## Qué deja preparado

- App privada con Patricia/Román.
- Hogar compartido.
- Salud privada.
- Citas y volantes.
- Medicación y stock.
- Facturas, coche y gestiones.
- Listas y deseos.
- Recordatorios internos.
- Exportaciones.
- Notificaciones de navegador/PWA.

## Archivos modificados

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v1_6.md`
- `docs/checklist_v1_6.md`

## Supabase

No hay que ejecutar SQL nuevo.
