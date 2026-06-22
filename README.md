# VITA v4.1.1, depuración final

Corrige el fallo de `shopping_lists.name` y consolida una app más funcional.

## Error corregido

`null value in column "name" of relation "shopping_lists" violates not-null constraint`

El problema venía de una estructura antigua de Supabase que exigía `name`, mientras que las versiones nuevas usaban `title`. Esta versión usa ambos campos y rellena valores antiguos vacíos.

## Cambios de app

- Volantes/documentos ya permiten adjuntar archivo o foto.
- Wallet permite adjuntar archivo o foto de la tarjeta.
- Las tarjetas con archivo muestran botón para abrirlo.
- Los errores internos se muestran con el sistema visual de VITA.
- Se mantiene la pantalla Hoy como planificador de pendientes.
- Se mantienen calendario, citas, medicación, listas, hogar y wallet.

## Supabase

Ejecuta:

`docs/supabase_v4_1_1_depura_final.sql`

## GitHub

Commit sugerido:

`VITA v4.1.1 depuracion final`

Después borra la PWA del móvil y reinstala.
