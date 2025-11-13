# ⚡ QUICK START - Para Mañana (Día 3)

**Fecha:** 13 de noviembre de 2025 (preparado por tu self del futuro 👋)

---

## 🚀 Inicio Rápido en 2 Minutos

### 1. Arrancar proyecto
```bash
cd /Users/santos.castane/Documents/azahar
pnpm dev
# App abre en http://localhost:5174/
```

### 2. Dónde está todo
```
/apps/web/src/
├── pages/
│   ├── LoginPage.tsx ← Auth (Día 1 ✓)
│   └── TasksPage.tsx ← Tareas + CRUD (Día 2 ✓)
├── lib/
│   ├── supabase.ts ← Funciones backend (Día 1+2 ✓)
│   └── queryClient.ts ← React Query
└── App.tsx ← Router
```

### 3. Documentación importante
```
DEVELOPMENT_LOG.md ← Está aquí (tu diario)
DAY1_DELIVERABLES.md ← Lo que hiciste Día 1
DAY2_SUMMARY.md ← Resumen Día 2 (lee esto)
DAY2_CHANGES.md ← Detalles técnicos
DAY2_TESTING.md ← Si quieres re-testear
```

---

## ✅ Estado Actual

### Implementado ✓
- Autenticación (signup/login)
- CRUD de tareas (create, read, update, delete, toggle)
- UI con Tailwind
- React Query para caching
- RLS en Supabase

### Por Hacer (Día 3)
- **Proyectos** (agregar, filtrar)
- **Etiquetas** (agregar, filtrar)
- Relaciones proyecto-tareas
- Relaciones etiquetas-tareas

---

## 🎯 Plan para Hoy (Día 3)

### Fase 1: Proyectos (2-3 horas)
```
1. Agregar UI selector de proyecto en TasksPage
2. Función updateTask para asignar proyecto
3. Función getProjects() para listar proyectos
4. Función addProject() para crear proyecto
5. Filtrado por proyecto (dropdown)
6. Testing: crear proyecto y asignar tareas
```

### Fase 2: Etiquetas (2-3 horas)
```
1. Mostrar etiquetas en lista de tareas
2. Función addLabel() crear etiqueta
3. Función addTaskLabel() asignar etiqueta a tarea
4. Función removeTaskLabel() desasignar
5. Filtrado por etiqueta
6. UI para agregar etiquetas
7. Testing: crear y asignar etiquetas
```

### Fase 3: Refinamiento (1 hora)
```
1. Revisar UI/UX
2. Testing final integración
3. Documentar Día 3
4. Commit final
```

---

## 🔧 Cambios que probablemente necesitarás

### En supabase.ts (agregar)
```typescript
// Proyectos
export async function getProjects()
export async function addProject(name: string, color?: string)
export async function updateProject(id: string, updates: Partial<Project>)
export async function deleteProject(id: string)

// Etiquetas
export async function getLabels()
export async function addLabel(name: string, color?: string)
export async function addTaskLabel(taskId: string, labelId: string)
export async function removeTaskLabel(taskId: string, labelId: string)

// Interfaces
export interface Project { ... }
export interface Label { ... }
```

### En TasksPage.tsx (agregar)
```typescript
// Nuevo estado
const [selectedProject, setSelectedProject] = useState<string | null>(null)

// Nuevas queries
const { data: projects } = useQuery({ queryKey: ['projects'], ... })
const { data: labels } = useQuery({ queryKey: ['labels'], ... })

// Nuevas mutaciones
const addProjectMutation = useMutation({ ... })
const addLabelMutation = useMutation({ ... })
const updateTaskProjectMutation = useMutation({ ... })
```

---

## 📊 Base de Datos (Ya existe)

```sql
-- Schema ya en Supabase
projects (id, user_id, name, color, sort_order, created_at)
labels (id, user_id, name, color)
task_labels (task_id, label_id) -- relación M:M
tasks (id, project_id, ...) -- ya tiene relación
```

RLS ya está habilitado para todas las tablas.

---

## 🎨 Referencias de UI

### Selector de Proyecto
```
┌─────────────────────────────────┐
│ + Nueva tarea...  [Select▼] ADD │
│                   [proyecto 1]  │
│                   [proyecto 2]  │
└─────────────────────────────────┘
```

### Etiquetas en Tarea
```
┌────────────────────────────────┐
│ [✓] Tarea 1      [etiqueta1]   │
│     13 nov       [etiqueta2]   │
│                  [E][X]        │
└────────────────────────────────┘
```

---

## 🐛 Si Algo Falla

1. **Error de tipo TypeScript**: Revisa `DAY2_CHANGES.md`
2. **App no carga**: `pnpm dev` (el servidor debería estar corriendo)
3. **DB error**: Verifica Supabase → SQL Editor (schema.sql ejecutado)
4. **RLS bloqueado**: Verifica `auth.uid()` en el backend

---

## 💡 Tips para Hoy

### Copiar función de supabase.ts es rápido
Todas siguen el mismo patrón:
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
    return { success: false, error: 'Unexpected error' }
  }
}
```

### React Query Mutaciones también son un template
```typescript
const XMutation = useMutation({
  mutationFn: (args) => someFunction(args),
  onSuccess: (result) => {
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['...'] })
    }
  }
})
```

---

## 📞 Links Útiles

- [Supabase Console](https://app.supabase.com) ← Gestiona BD
- [TanStack Query Docs](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/docs)
- Schema local: `/docs/schema.sql`

---

## ✨ Próximo Commit Message

```
feat(day3): Implementar proyectos y etiquetas con relaciones M:M
```

---

**¡Buenas suerte hoy! 🚀 Esto va a estar genial.**

*- Tu yo del 13 de Nov*
