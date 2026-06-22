# VITA v3.1

## Paso 1. Supabase

Ejecuta completo:

`docs/supabase_v3_1_medicacion_wallet.sql`

Esto añadirá a Patricia:

- Eutirox 112 microgramos, 1 comprimido/día en ayunas, 08:00, caja 100, stock 37.
- Bilasten 20 mg, 1 comprimido/día en ayunas, 08:00, caja 20, stock 11.
- Eroski Club.
- IKEA Family.

No duplica registros si ya existen con ese nombre.

## Paso 2. App

Copia el paquete completo en GitHub.

## Paso 3. Móvil

Elimina la PWA anterior e instala de nuevo desde GitHub Pages para evitar caché antigua.

## Prueba

1. Entra como Patricia.
2. Ve a Medicación y comprueba Eutirox y Bilasten.
3. Ve a Hogar → Wallet y comprueba Eroski Club e IKEA Family.
4. Edita una tarjeta.
5. Borra una tarjeta de prueba.
