# VITA v4.2, paneles clicables

Versión centrada en el uso real: primero ver, luego añadir.

## Cambios principales

- Recupera y refuerza los registros de salud.
- Salud muestra tarjetas-resumen antes del formulario.
- Citas, medicación y listas muestran primero lo existente.
- Hogar pasa a ser un panel de activos:
  - Casa y piso
  - Vehículos
  - Listas
  - Wallet
  - Facturas
  - Contactos
  - Vacaciones y viajes
- Cada tarjeta abre su sección correspondiente.
- Los formularios quedan ocultos dentro de “Añadir…”, para no saturar.
- Calendario mejorado:
  - días más legibles;
  - cabecera de lunes a domingo;
  - selección de día tocando en el calendario;
  - lista de eventos visibles debajo.
- SQL restaura `health_records` y crea `household_assets`.

## Supabase

Ejecuta:

`docs/supabase_v4_2_paneles_clicables.sql`

Este sustituye a todos los SQL v4 anteriores.

## GitHub

Commit sugerido:

`VITA v4.2 paneles clicables`

Después borra la PWA anterior y reinstala desde GitHub Pages.
