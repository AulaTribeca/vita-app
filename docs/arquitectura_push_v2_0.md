# Arquitectura VITA v2.0

## Instalación PWA

La instalación depende de:

- `manifest.webmanifest`;
- iconos PNG;
- `service-worker.js`;
- HTTPS, que GitHub Pages ya proporciona.

## Push real

El envío push cerrado necesita cuatro piezas:

1. El móvil crea una `PushSubscription`.
2. VITA guarda esa suscripción en `web_push_subscriptions`.
3. Supabase crea eventos pendientes en `notification_events`.
4. La Edge Function `send-vita-push` envía esos eventos a los dispositivos.

## Por qué no basta con GitHub Pages

GitHub Pages sirve archivos estáticos. Puede alojar la PWA, pero no puede ejecutar un proceso de servidor que despierte cada 15 minutos para enviar notificaciones. Por eso el envío real se traslada a Supabase Edge Functions.
