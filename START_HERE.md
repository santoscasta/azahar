# 👋 START HERE - Punto de Entrada para Mañana

**Hoy es:** 13 de noviembre de 2025  
**Proyecto:** AZAHAR - Gestor de Tareas  
**Estado:** ✅ Día 2 Completado - Listo para Día 3

---

## ⚡ En 30 Segundos

Tu aplicación ya tiene:
- ✅ Autenticación funcional
- ✅ CRUD completo de tareas (crear, leer, editar, eliminar)
- ✅ UI bonita con Tailwind CSS
- ✅ Todo guardado en Supabase

Ahora necesitas agregar:
- ⏳ Proyectos
- ⏳ Etiquetas

---

## 🚀 Iniciar el Servidor (Ahora)

```bash
cd /Users/santos.castane/Documents/azahar
pnpm dev
```

La app se abre en **http://localhost:5174/**

---

## 📖 Lectura Recomendada (2 minutos)

1. **`DEVELOPMENT_LOG.md`** ← Tu diario (estado actual)
2. **`DAY2_SUMMARY.md`** ← Resumen visual de lo hecho
3. **`DAY3_PREPARATION.md`** ← Plan para hoy

---

## 🎯 Hoy Harás (Día 3)

### Proyectos ✨
```
- Agregar funciones en supabase.ts:
  getProjects(), addProject(), updateProject(), deleteProject()

- Agregar en TasksPage:
  Dropdown para seleccionar proyecto
  Mostrar proyecto asignado en cada tarea

- Testing:
  Crear un proyecto "Mi Trabajo"
  Asignar tareas al proyecto
  Filtrar por proyecto
```

### Etiquetas ✨
```
- Agregar funciones en supabase.ts:
  getLabels(), addLabel(), addTaskLabel(), removeTaskLabel()

- Agregar en TasksPage:
  UI para agregar etiquetas a tareas
  Mostrar etiquetas en cada tarea

- Testing:
  Crear etiqueta "urgente"
  Asignar a tareas
  Filtrar por etiqueta
```

---

## 📊 Estructura de Código

```
apps/web/src/
├── lib/supabase.ts ← Aquí agregar nuevas funciones (Día 3)
├── pages/TasksPage.tsx ← Aquí agregar UI (Día 3)
└── App.tsx ← No tocar (router OK)
```

---

## 💡 Template para Día 3

Todas las funciones backend siguen este patrón:

```typescript
export async function NOMBRE() {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'No auth' }
    
    const { data, error } = await supabase
      .from('tabla')
      .operacion()
      .eq('user_id', user.id)
    
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (err) {
    return { success: false, error: 'Error inesperado' }
  }
}
```

---

## 🔐 Seguridad Recordatorio

✅ RLS está habilitado en todas las tablas  
✅ Cada función valida `auth.uid()`  
✅ Usuario solo ve/edita sus propios datos  
✅ Nada que cambiar de seguridad hoy

---

## ✨ Quick Cheat Sheet

### Crear variable de estado
```typescript
const [projects, setProjects] = useState([])
```

### Crear mutation con React Query
```typescript
const mutation = useMutation({
  mutationFn: (args) => supabaseFunction(args),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  }
})
```

### Usar mutation en handleClick
```typescript
const handleAdd = () => {
  mutation.mutate('nombre del proyecto')
}
```

### Query para leer datos
```typescript
const { data: projects } = useQuery({
  queryKey: ['projects'],
  queryFn: () => getProjects()
})
```

---

## 🎨 UI Reference

Así se verá hoy:

```
┌──────────────────────────────────────────┐
│ AZAHAR                    [Logout]        │
├──────────────────────────────────────────┤
│ [Nueva tarea...] [Proyecto ▼] [ADD]      │
│ (dropdown: Sin proyecto, Trabajo, etc)   │
├──────────────────────────────────────────┤
│ [✓] Tarea 1      [trabajo] [E][X]        │
│     13 nov       [etiqueta1] [etiqueta2] │
│                                          │
│ [○] Tarea 2      [personal] [E][X]       │
│     13 nov       [urgente]               │
├──────────────────────────────────────────┤
│ 1 de 2 completadas                       │
│ Filtrar: [Todos] [trabajo] [personal]... │
└──────────────────────────────────────────┘
```

---

## 🐛 Si Algo Falla

| Problema | Solución |
|----------|----------|
| "Cannot find module" | `pnpm install` |
| Errores TypeScript | Revisa tipos en supabase.ts |
| BD error | Verifica Supabase console |
| Port ocupado | Usa otro: `pnpm dev -- --port 5175` |

---

## 📞 Documentación Existente

```
README.md ........................ Documentación general
SETUP.md ......................... Setup inicial (solo si nuevo)
DAY1_DELIVERABLES.md ............. Qué se hizo Día 1
DAY2_SUMMARY.md .................. Qué se hizo Día 2
DAY2_CHANGES.md .................. Detalles técnicos
DAY2_TESTING.md .................. Si quieres re-testear
DAY3_PREPARATION.md .............. Plan detallado Día 3
PROJECT_STATUS.md ................ Status general del proyecto
```

---

## ✅ Checklist de Hoy

Copia esto en una terminal para verificar:

```bash
# 1. Verificar que estamos en el directorio correcto
pwd
# Debe mostrar: /Users/santos.castane/Documents/azahar

# 2. Verificar dependencias
pnpm list --depth=0
# Debe mostrar react, vite, tailwindcss, @supabase/supabase-js

# 3. Verificar servidor
pnpm dev
# Debe abrir http://localhost:5174/

# 4. Abrir navegador
open http://localhost:5174/
# O copia la URL en tu navegador
```

---

## 🎉 Resumen

| Métrica | Estado |
|---------|--------|
| Código | ✅ Funcionando |
| Tests | ✅ 9/9 pasados |
| Documentación | ✅ Completa |
| Servidor | ✅ Listo |
| BD | ✅ Configurada |
| Git | ✅ Actualizado |

---

## 🎯 Meta para Hoy

**Al finalizar Día 3 deberías tener:**

- Usuarios pueden crear proyectos
- Usuarios pueden asignar tareas a proyectos
- Usuarios pueden crear etiquetas
- Usuarios pueden asignar etiquetas a tareas
- Interfaz para filtrar por proyecto
- Interfaz para filtrar por etiqueta
- Todo testeado y funcionando
- Documentación actualizada
- Nuevo commit con cambios

---

## 🚀 Cuando Termines

```bash
# Hacer commit
git add -A
git commit -m "feat(day3): Implementar proyectos y etiquetas"

# Actualizar diario
# Editar DEVELOPMENT_LOG.md con lo que hiciste

# Crear resumen
# Crear DAY3_SUMMARY.md similar a DAY2_SUMMARY.md
```

---

## 💬 Notas Personales

*Este archivo fue creado por ti el 13 de noviembre a las 9:00 AM*

Hoy será un buen día de desarrollo. Tienes:
- ✅ Un proyecto bien estructurado
- ✅ Código limpio y testeado
- ✅ Documentación al día
- ✅ Un plan claro

¡Ahora a ejecutar! 🚀

---

**Inicio → `pnpm dev` → http://localhost:5174/**

**¡Mucho éxito! 💪**
