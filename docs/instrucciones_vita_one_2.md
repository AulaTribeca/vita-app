# Instrucciones VITA ONE 2.0

1. Copia todo el contenido del ZIP en GitHub.
2. Ejecuta en Supabase SQL Editor:

`docs/supabase_vita_one_2_schema.sql`

3. Ejecuta también:

`docs/supabase_vita_one_2_eliminar_cron_antiguo.sql`

4. Despliega:

`supabase/functions/send-vita-push/index.ts`

5. Borra la PWA vieja del móvil y reinstala.

6. Prueba mínima:
   - Hacer lista de la compra con varios productos, uno por línea.
   - Marcar un producto como comprado.
   - Añadir una cita médica.
   - Completar la cita y crear documento pendiente.
   - Añadir una tarea UNED con fecha.
   - Usar el botón atrás del móvil.
