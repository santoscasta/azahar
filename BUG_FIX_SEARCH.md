# Bug Fix: Búsqueda de Tareas

## Problema Identificado
La función de búsqueda tenía un bug en el filtrado que hacía que las tareas desaparecieran al introducir ciertos caracteres.

### Causa Raíz
En [TasksPage.tsx](TasksPage.tsx#L413-L440), el filtro de búsqueda tenía un bloque `try-catch` que:
1. Devolvía `false` cuando ocurría un error durante el filtrado
2. No manejaba de manera segura valores `null` o `undefined` antes de convertirlos a string

Esto causaba que si alguna tarea tenía valores nulos en ciertos campos o caracteres especiales causaban errores, la tarea era excluida de los resultados.

## Solución Implementada

Se mejoró el manejo de valores en la función `searchResults`:

### Cambios Principales:
1. **Conversión Segura a String**: Se envuelve cada valor potencialmente nulo con `String()` para asegurar que siempre sea un string válido:
   ```typescript
   const title = String(task.title ?? '').toLowerCase()
   const notes = task.notes ? String(task.notes).toLowerCase() : ''
   const projectName = task.project_id
     ? String(projects.find(project => project.id === task.project_id)?.name ?? '').toLowerCase()
     : ''
   ```

2. **Manejo de Errores Mejorado**: En lugar de devolver `false` (excluir la tarea), ahora devuelve `true` en caso de error:
   ```typescript
   catch (error) {
     console.error('Search filter error', { error, task, normalizedSearch })
     // Return true on error to avoid losing tasks
     return true
   }
   ```

## Beneficios
- Las tareas **nunca desaparecerán** al escribir en el buscador
- Se manejan correctamente caracteres especiales y unicode
- Se manejan correctamente valores nulos/indefinidos
- Si ocurre un error inesperado, es mejor mostrar más resultados que ninguno

## Tests Agregados
Se crearon tests en [TasksPage.search.test.ts](TasksPage.search.test.ts) para validar:
- ✓ Manejo de títulos nulos
- ✓ Manejo de notas nulas
- ✓ Caracteres especiales (!@#$%^&*())
- ✓ Caracteres regex especiales ([]*+?)
- ✓ Caracteres unicode (café, 日本語, ñoño, 你好)
- ✓ Strings muy largos (100k caracteres)

Todos los tests pasan correctamente.
