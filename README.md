# AZAHAR - Gestor de tareas minimalista

Aplicación web PWA para gestionar tareas personales. Stack: React 18, TypeScript, Vite, Tailwind CSS, Supabase.

## 🚀 Inicio rápido

### Requisitos previos

- Node.js 20 LTS
- pnpm 8+
- Cuenta en Supabase (región EU)

### 1. Crear proyecto en Supabase

1. Accede a [Supabase](https://supabase.com)
2. Crea un nuevo proyecto (región: Europe/EU)
3. Activa Email Auth:
   - En el panel, ve a **Authentication > Providers**
   - Activa **Email** con "Email with password"

### 2. Ejecutar SQL en Supabase

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Crea una nueva consulta vacía
3. Copia y pega el contenido de **docs/schema.sql**
4. Ejecuta el script

### 3. Configurar proyecto local

```bash
# Instalar dependencias
pnpm install

# Crear archivo .env.local
cp apps/web/.env.local.example apps/web/.env.local

# Editar .env.local con tus credenciales de Supabase
# VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (encontradas en Settings > API)
# (Opcional para seeds de e2e) SUPABASE_SERVICE_ROLE_KEY para scripts de pruebas
```

## 🚢 Despliegue automatizado con GitHub Actions

El repositorio incluye un workflow en `.github/workflows/deploy.yml` que construye y despliega la aplicación a Vercel cada vez que se hace push a `main` (o manualmente con **Run workflow**).

1. Crea los secretos en **Settings > Secrets and variables > Actions** del repositorio:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
2. Opcional: ajusta el branch de disparo en el propio workflow si usas otro nombre.
3. El pipeline instala dependencias con pnpm, ejecuta `pnpm -C apps/web build` y utiliza `vercel pull/build/deploy` para publicar la versión precompilada.

Con los secretos configurados, cada commit en `main` generará un despliegue automático en tu proyecto Vercel.

### 4. Levantar desarrollo

```bash
pnpm dev
```

La aplicación abrirá en `http://localhost:5173`

## 📁 Estructura del proyecto

```
azahar/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── pages/
│       │   │   ├── LoginPage.tsx
│       │   │   └── TasksPage.tsx
│       │   ├── lib/
│       │   │   ├── supabase.ts
│       │   │   └── queryClient.ts
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css
│       ├── public/
│       │   └── manifest.webmanifest
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── tsconfig.json
│       └── package.json
├── packages/
├── tsconfig.json
├── pnpm-workspace.yaml
├── package.json
└── .env.local.example
```

## 📜 Scripts disponibles

```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Preview del build
pnpm preview

# Linting TypeScript
pnpm lint

# Tests de estado (quick views/filtros)
pnpm -C apps/web test

# Seed de datos de prueba (requiere service_role)
pnpm -C apps/web seed:test
```

## 🧪 Tests automáticos

La suite de `node:test` valida la lógica de quick views, normalización de fechas y filtros activos que alimentan la UI. Los tests se ejecutan sin mockear React/Supabase (solo los selectores puros) y los puedes correr con:

```bash
pnpm -C apps/web test
```

El comando compila únicamente los selectores de `TasksPage` y confirma que cada vista (Inbox, Hoy, Próximas, Algún día y Logbook) y los filtros de proyecto/etiquetas arrojan el estado esperado.

## ✨ Características principales (v0.6.0)

### Autenticación
- Registro, login y logout con Supabase Auth
- Gestión de sesión automática + ruta protegida `/app`

### Gestión de tareas
- CRUD completo (crear, editar inline, completar, eliminar)
- Campos avanzados: notas, prioridad (🟢/🟡/🔴) y fecha de vencimiento
- Orden inteligente: primero por vencimiento (ASC, nulls first) y luego por creación (DESC)
- Chips informativos con proyecto, prioridad, vencimiento y etiquetas asignadas

### Proyectos y etiquetas
- CRUD de proyectos y etiquetas con validación + RLS
- Asignación de proyectos al crear/editar tareas
- Panel de “Gestión rápida” para renombrar o eliminar proyectos/etiquetas desde la UI
- Botón contextual “Etiquetas” en cada tarea para asignar/remover etiquetas sin salir de la lista

### Áreas y secciones
- Áreas para agrupar proyectos y tareas sueltas, con soporte para cambiarles el nombre o eliminarlas.
- Cada proyecto puede vivir dentro de un área y dispone de “secciones” (headings) para agrupar tareas por temática.
- Las vistas “Hoy / Próximas / Algún día” muestran primero las áreas y proyectos que tienen tareas activas, manteniendo el contexto jerárquico.
- Las vistas de área permiten navegar a los proyectos contenidos y ver tareas que dependen directamente del área.

### Búsqueda y filtrado
- Buscador superior con sugerencias predictivas (título + notas)
- Filtro por proyecto y multi-select de etiquetas (modo AND)
- Chips removibles para filtros activos

### Experiencia de usuario
- UI responsiva con Tailwind + transiciones suaves
- Estados de carga y errores claros
- Indicador de progreso (tareas completadas / totales)

### Seguridad / Backend
- Supabase con Row Level Security en tasks, projects, labels y task_labels
- Validación de `auth.uid()` en cada operación
- Patrón consistente para manejar `success/error` tanto en frontend como backend

## 🧪 Smoke test recomendado

1. **Crear usuario** desde `http://localhost:5173` y acceder a `/app`.
2. **Crear un proyecto** (“Trabajo”) y una etiqueta (“Urgente”).
3. **Añadir una tarea** con título, notas, prioridad 🔴 y fecha, asignando Proyecto + Etiqueta.
4. **Editar la tarea inline**: cambia el título y la prioridad, guarda y verifica el chip actualizado.
5. **Probar filtros**: busca por texto, filtra por el proyecto recién creado y marca la etiqueta; la lista debe respetar todos los criterios.
6. **Asignar/Remover etiquetas** usando el botón “Etiquetas” dentro de la tarjeta de la tarea.
7. **Eliminar un proyecto o etiqueta** desde la sección de gestión rápida y confirma que los filtros se limpian automáticamente.
8. **Recargar** el navegador y verifica que todos los datos se mantienen gracias a Supabase.

## 🚀 Despliegue en Vercel

1. **Inicia sesión y vincula el proyecto**
   ```bash
   pnpm dlx vercel login
   pnpm dlx vercel link
   ```
   El `vercel.json` en la raíz ya fija el build command (`pnpm -C apps/web build`) y el `outputDirectory` (`apps/web/dist`), por lo que no debes cambiar el “Root Directory” ni los comandos en el panel.

2. **Configura las variables de entorno**
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_APP_BASE_URL # opcional, define el dominio público para redirecciones de auth
   ```
   Añádelas en Vercel (Settings → Environment Variables) para los entornos *Production* y *Preview*. Si prefieres la CLI:
   ```bash
   pnpm dlx vercel env add VITE_SUPABASE_URL production
   pnpm dlx vercel env add VITE_SUPABASE_ANON_KEY production
   pnpm dlx vercel env add VITE_SUPABASE_URL preview
   pnpm dlx vercel env add VITE_SUPABASE_ANON_KEY preview
   ```
   Después ejecuta `pnpm dlx vercel env pull apps/web/.env.local` si quieres sincronizarlas localmente.

3. **Despliegues manuales**
   ```bash
   pnpm dlx vercel        # preview
   pnpm dlx vercel --prod # producción
   ```
   Cada comando construirá `apps/web` con pnpm y publicará el bundle estático de Vite.

4. **Despliegues automáticos**
   - Conecta el repositorio (GitHub/GitLab/Bitbucket) en el dashboard de Vercel.
   - Cuando se te solicite el “Root Directory”, selecciona `/` (la raíz) y confirma que el Build Command y Output están en blanco para que `vercel.json` tome el control.
   - Cada push a la rama principal generará un build de producción; las ramas/PRs generan previews.

## 🔧 Solución de problemas

### Error: "Faltan variables de entorno"
- Verifica que `.env.local` existe en `apps/web/`
- Revisa que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén presentes
- Para scripts de seed/reset e2e añade `SUPABASE_SERVICE_ROLE_KEY` (clave service_role de Supabase)

### No puedo registrarme
- Asegúrate que Email Auth está activado en Supabase
- Revisa la consola del navegador para más detalles

### Las tareas no se guardan
- Verifica que ejecutaste el SQL de schema.sql en Supabase
- Comprueba que las políticas RLS están habilitadas

## 📋 Definición de Hecho (DoD actual)

- [x] Monorepo pnpm (apps/web) con Vite + React 18 + TS + Tailwind + React Query
- [x] Supabase Auth con flujo completo de signup/login/logout y RLS en todas las tablas
- [x] CRUD de tareas con notas, prioridad, vencimiento y estado done/open
- [x] CRUD de proyectos y etiquetas, incluido editor/borrado inline en la UI
- [x] Buscador + filtros (proyecto + etiquetas) y chips descriptivos por tarea
- [x] Panel de asignación de etiquetas, indicador de progreso e invalidación de queries
- [x] Scripts `dev / build / preview / lint` funcionando sin errores TS
- [x] Documentación (README, PROGRESS, SETUP) sincronizada con la versión 0.6.0

## 📝 Próximos pasos sugeridos

- Completar el checklist de testing para proyectos/etiquetas (DAY3_TESTING.md)
- Agregar filtros por prioridad y/o vencimiento
- Implementar historial de búsquedas y modo oscuro
- Explorar PWA offline + notificaciones locales

## 📄 Licencia

MIT

---

**Creado con ❤️ para gestionar tareas de forma minimalista**
