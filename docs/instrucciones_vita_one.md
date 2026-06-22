# Instrucciones VITA ONE

1. Copia todo el proyecto en GitHub.
2. Ejecuta `docs/supabase_vita_one_schema.sql` en Supabase.
3. Ejecuta `docs/supabase_vita_one_eliminar_cron_antiguo.sql` si quedó un cron antiguo.
4. Despliega `supabase/functions/send-vita-push/index.ts`.
5. Borra la PWA antigua del móvil y reinstala desde GitHub Pages.
6. Prueba primero Compra: escribe varios productos, uno por línea, marca uno como comprado y comprueba que se tacha.
