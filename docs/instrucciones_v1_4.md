# VITA v1.4, exportaciones

## Supabase

No hay que ejecutar SQL nuevo.

## Archivos

Copia encima:

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v1_4.md`

## GitHub Desktop

Commit:

`VITA v1.4 exportaciones`

Push origin.

## Prueba

1. Entra como Patricia.
2. Ve a Documentos desde el botón Exportar de Hoy.
3. Exporta Salud en JSON.
4. Exporta Hogar en CSV.
5. Exporta Todo VITA en HTML.
6. En el informe HTML, pulsa "Guardar como PDF / Imprimir".
7. Comprueba que aparece el historial de informes generados.
8. Entra como Román y verifica que las exportaciones no mezclan datos privados de Patricia.

## Nota

El envío por email real con adjuntos necesitará una fase posterior con backend o Edge Function. En esta versión se prepara un correo con resumen mediante `mailto`.
