# VITA v1.5

Nivel 15 de VITA: avisos automáticos y notificaciones del dispositivo.

## Qué añade

- Panel de notificaciones en Cuenta.
- Botón para activar avisos en el dispositivo.
- Botón de prueba.
- Preferencias por tipo:
  - medicación y stock;
  - citas;
  - volantes;
  - hogar;
  - salud.
- Notificaciones del navegador/PWA basadas en los recordatorios inteligentes de Hoy.
- Evita repetir el mismo aviso más de una vez al día.
- Revisión automática cada 15 minutos mientras la app está abierta o instalada y activa.
- Apertura de la app desde una notificación.
- No requiere SQL nuevo.

## Limitación importante

Esta fase añade avisos reales del navegador cuando la app está abierta, instalada o activa en segundo plano según permita el dispositivo. Para avisos garantizados con la app totalmente cerrada hace falta un backend o una Edge Function con push web, que puede abordarse después.

## Archivos modificados

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v1_5.md`
