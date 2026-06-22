# VITA v0.6, listas reales conectadas a Supabase

## Archivos que debes copiar encima

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v0_6.md`

## Después

1. Abre GitHub Desktop.
2. Commit:
   `VITA v0.6 listas Supabase`
3. Push origin.
4. Espera el despliegue de GitHub Pages.
5. Abre VITA en incógnito.

## Prueba obligatoria

### Patricia

1. Entra como `Patricia`.
2. Ve a `Listas`.
3. Añade un producto a la lista compartida.
4. Añade un producto a tu lista personal.
5. Añade un deseo.

### Román

1. Cierra sesión.
2. Entra como `Román`.
3. Ve a `Listas`.
4. Comprueba que ve el producto de la lista compartida.
5. Añade otro producto compartido.
6. Añade un producto a su lista personal.

### Comprobación de privacidad

1. Vuelve a entrar como Patricia.
2. Comprueba que Patricia ve la lista compartida.
3. Comprueba que no aparece la lista personal de Román.

## Si aparece “Lista no encontrada”

Falta ejecutar alguno de estos SQL en Supabase:

- `docs/supabase_v0_2.sql`
- `docs/supabase_v0_3.sql`
- `vita_post_usuarios_setup.sql`
