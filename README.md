# VITA v2.1 saneada

Versión de depuración real tras detectar acumulación de parches.

## Objetivo

Volver a una app sencilla, visual y utilizable, sin mensajes técnicos visibles ni dependencias de SQL antiguos.

## Cambios principales

- Cuenta aparece solo en el icono superior.
- Se elimina el panel técnico de diagnóstico.
- Se eliminan mensajes de depuración visibles.
- Se repara el error de sincronización causado por una función antigua de notificaciones.
- Salud ya no remite a versiones antiguas.
- Vehículos quedan cubiertos por un SQL único de reparación.
- Push y PWA se mantienen, pero en interfaz simplificada.

## Supabase

Ejecutar:

`docs/supabase_v2_1_reparacion_total.sql`

## No subir a GitHub

Si existe y contiene claves privadas:

`docs/VAPID_SECRETS_NO_SUBIR_A_GITHUB.md`
