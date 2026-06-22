# VITA v1.2, hogar compartido real

## Paso 1. Supabase

Ejecuta en Supabase SQL Editor:

`docs/supabase_v1_2.sql`

Este SQL crea:

- `household_bills`;
- `household_vehicles`;
- `vehicle_tasks`;
- `household_tasks`.

Todas las tablas usan políticas RLS por pertenencia al hogar.

## Paso 2. Archivos

Copia encima:

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v1_2.md`
- `docs/supabase_v1_2.sql`

## Paso 3. GitHub Desktop

Commit:

`VITA v1.2 hogar compartido`

Push origin.

## Prueba

1. Entra como Patricia.
2. Ve a Hogar.
3. Añade una factura.
4. Añade un vehículo.
5. Añade un aviso de ITV o seguro para ese vehículo.
6. Añade una gestión pendiente.
7. Cierra sesión.
8. Entra como Román.
9. Comprueba que ve los datos del hogar compartido.
10. Marca una gestión como completada.
11. Vuelve a entrar como Patricia y comprueba que también aparece completada.

## Importante

Estos datos son comunes para el hogar, no privados como salud o medicación.
