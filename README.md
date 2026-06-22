# VITA v0.4.6

Corrección definitiva del inicio de sesión.

## Qué cambia

- Se elimina la dependencia externa de `supabase-js`.
- El login usa directamente la API REST de Supabase Auth.
- La app sigue bloqueada sin sesión real.
- No existe demo local.
- No hay mensajes de depuración visibles.
- El acceso sigue siendo:
  - `Patricia`
  - `Román`

## Archivos modificados

- `index.html`
- `app.js`
- `config.js`
- `service-worker.js`
- `README.md`
- `docs/instrucciones_v0_4_6.md`
