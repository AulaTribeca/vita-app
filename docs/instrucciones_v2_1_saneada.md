# VITA v2.1 saneada

## Qué corrige

- Elimina los mensajes de depuración visibles.
- Elimina el panel técnico "Estado de VITA".
- Deja el acceso a Cuenta en un único lugar: el icono superior.
- Quita "Exportar" de los accesos rápidos de Hoy.
- Corrige llamadas antiguas a `evaluateNotifications` que provocaban errores de sincronización.
- Sustituye los mensajes antiguos de "ejecuta v0.8/v1.1".
- Mantiene instalación PWA y push, pero con interfaz más simple.
- Incluye un SQL único de reparación para no depender de haber ejecutado versiones antiguas.

## Paso 1. Supabase

Ejecuta completo:

`docs/supabase_v2_1_reparacion_total.sql`

## Paso 2. Archivos

Copia todo el paquete sobre tu proyecto.

No subas a GitHub:

`docs/VAPID_SECRETS_NO_SUBIR_A_GITHUB.md`

si contiene la VAPID private key.

## Paso 3. GitHub Desktop

Commit:

`VITA v2.1 saneada`

Push origin.

## Paso 4. Caché

Abre la app desde GitHub Pages, cierra sesión si hace falta y limpia caché del navegador o reinstala la PWA si seguía cargando una versión anterior.

## Pruebas mínimas

1. Inicia sesión como Patricia.
2. Registra salud.
3. Registra un vehículo.
4. Ve a Cuenta y activa avisos.
5. Pulsa Probar aviso.
6. Cierra sesión.
7. Inicia sesión como Román.
8. Comprueba que no ve salud ni medicación privada de Patricia, pero sí el hogar compartido.
