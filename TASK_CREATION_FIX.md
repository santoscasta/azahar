# Solución: Problemas de creación de tareas

## Problema 1: Error "quick_view column not found"

**Causa**: La columna `quick_view` falta en la tabla `tasks` de la base de datos Supabase.

**Solución**:

1. Abre la consola SQL de Supabase: https://supabase.com/dashboard
2. Ve a tu proyecto
3. Abre el editor SQL
4. Ejecuta la siguiente query:

```sql
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS quick_view TEXT;
```

Esto agregará la columna `quick_view` a la tabla de tareas, lo que permitirá guardar correctamente el tipo de vista rápida asignada a cada tarea.

## Problema 2: Pantalla en blanco al crear tareas

**Causa**: Error no controlado en el componente durante la creación de tareas.

**Solución Implementada**:

1. ✅ Agregué un `ErrorBoundary` component en [ErrorBoundary.tsx](../../apps/web/src/components/ErrorBoundary.tsx)
2. ✅ Integré el ErrorBoundary en [App.tsx](../../apps/web/src/App.tsx) para capturar cualquier error de React

Ahora, si ocurre un error durante la creación de tareas:
- En lugar de pantalla en blanco, se mostrará un mensaje "Algo salió mal"
- El usuario podrá hacer clic en "Recargar página" para intentar de nuevo
- El error se registrará en la consola del navegador para debugging

## Pasos siguientes

1. **Ejecuta la migration en Supabase** para agregar la columna `quick_view`
2. **Recarga la aplicación** (`Ctrl+F5` o `Cmd+Shift+R` en Mac)
3. **Intenta crear una tarea nuevamente** desde el modo móvil

Si aún hay problemas:
- Abre la consola del navegador (`F12`)
- Revisa el error exacto en la pestaña Console
- Esto te ayudará a identificar qué está fallando específicamente

## Archivos modificados

- [App.tsx](../../apps/web/src/App.tsx) - Agregado ErrorBoundary
- [ErrorBoundary.tsx](../../apps/web/src/components/ErrorBoundary.tsx) - Nuevo componente para manejo de errores
- [schema.sql](../../docs/schema.sql) - Agregada columna quick_view (para referencia)
- [001_add_quick_view_column.sql](../../migrations/001_add_quick_view_column.sql) - Migration para Supabase
