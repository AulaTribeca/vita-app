# VITA v0.4

Nivel 4 de VITA.

## Incluye

- Pantalla de inicio de sesión.
- Acceso con usuario y contraseña.
- Bloqueo de la app si no hay sesión iniciada.
- Modo demo local solo si Supabase no está configurado.
- Restablecimiento de contraseña preparado.
- Pantalla de cuenta adaptada a sesión segura.

## Seguridad

La app no permite crear usuarios desde la interfaz. Los usuarios deben crearse manualmente en Supabase.

Esto es importante porque VITA manejará datos sensibles:

- salud;
- medicación;
- citas médicas;
- volantes;
- facturas;
- hipoteca;
- hogar compartido;
- documentos personales.

## Pendiente

- Crear proyecto de Supabase.
- Ejecutar SQL v0.2 y v0.3.
- Crear usuarios en Supabase.
- Pegar URL y anon/public key en `config.js`.
- Verificar login real.
