# VITA v0.6

Nivel 6 de VITA: listas reales conectadas a Supabase.

## Qué añade

- Carga del perfil real del usuario conectado.
- Carga del hogar compartido.
- Lista de la compra compartida desde Supabase.
- Lista personal desde Supabase.
- Lista de deseos básica desde Supabase.
- Añadir elementos reales a cada lista.
- Marcar elementos como comprados o pendientes.
- Separación por usuario mediante las políticas RLS ya creadas.

## Archivos modificados

- `index.html`
- `app.js`
- `styles.css`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v0_6.md`

## Requisitos

Deben estar ejecutados en Supabase:

1. `docs/supabase_v0_2.sql`
2. `docs/supabase_v0_3.sql`
3. `vita_post_usuarios_setup.sql`

## Pruebas

1. Entra como Patricia.
2. Añade un producto a la lista compartida.
3. Cierra sesión.
4. Entra como Román.
5. Comprueba que ve el producto compartido.
6. Añade un producto a la lista personal de Román.
7. Cierra sesión.
8. Entra como Patricia.
9. Comprueba que no ves la lista personal de Román.
