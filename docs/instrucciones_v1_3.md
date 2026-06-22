# VITA v1.3, recordatorios internos inteligentes

## Supabase

No hay que ejecutar SQL nuevo.

Esta versión usa los datos ya creados en fases anteriores:

- medicación;
- citas;
- volantes;
- salud;
- hogar;
- facturas;
- coche;
- gestiones.

## Archivos

Copia encima:

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v1_3.md`

## GitHub Desktop

Commit:

`VITA v1.3 recordatorios internos`

Push origin.

## Prueba

1. Entra como Patricia.
2. Comprueba la pantalla Hoy.
3. Añade una medicación con toma pendiente.
4. Añade una cita próxima.
5. Añade un volante pendiente.
6. Añade una factura próxima.
7. Vuelve a Hoy y pulsa Actualizar.
8. Comprueba que aparecen los recordatorios.
9. Pulsa “Ocultar hoy” en un recordatorio.
10. Cierra sesión, entra como Román y comprueba que los avisos privados no se mezclan.

## Importante

Estos recordatorios son internos. Todavía no son notificaciones push del móvil. Las push irán en una fase posterior.
