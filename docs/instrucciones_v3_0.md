# VITA v3.0

## Paso 1. Supabase

Ejecuta completo:

`docs/supabase_v3_0_tdah_crud_push.sql`

No borra datos.

## Paso 2. Archivos

Copia todo el paquete sobre tu proyecto.

## Paso 3. GitHub Desktop

Commit:

`VITA v3.0 TDAH CRUD push`

Push origin.

## Paso 4. Caché

En el móvil, elimina la PWA anterior y vuelve a instalar VITA desde GitHub Pages. Esto es importante porque el service worker anterior puede seguir cargando archivos viejos.

## Prueba mínima

1. Entrar como Patricia.
2. Guardar un registro de salud.
3. Editarlo.
4. Borrarlo.
5. Guardar un vehículo.
6. Editarlo.
7. Guardar un contacto.
8. Crear un evento en Calendario.
9. Cambiar entre día, semana, mes y año.
10. Ir a Cuenta.
11. Activar avisos.
12. Probar aviso.

## Nota sobre push

Si Probar aviso falla, ahora sí debe mostrar un mensaje visible. Si el mensaje dice que Supabase no pudo enviar el aviso, hay que revisar los logs de la Edge Function.
