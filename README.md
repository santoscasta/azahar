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
```

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
```

## ✨ Características (Día 1)

### Autenticación
- Registro e inicio de sesión con email y contraseña
- Gestión de sesión automática
- Cierre de sesión

### Gestión de tareas
- **Listar tareas**: obtiene todas las tareas del usuario ordenadas por fecha de creación (descendente)
- **Añadir tarea**: crear una nueva tarea con título
- Visualización de estado (abierta/completada)
- Timestamps de creación

### Seguridad
- Row Level Security (RLS) en todas las tablas
- Políticas por usuario: cada usuario solo ve sus propios datos
- Autenticación via Supabase Auth

### PWA
- Manifest para instalación como app nativa
- Soporte offline básico

## 🧪 Pasos de prueba

### 1. Crear usuario
1. Ve a `http://localhost:5173`
2. Haz clic en "Regístrate"
3. Ingresa:
   - Email: `test@example.com`
   - Contraseña: `password123`
4. Confirma el registro

### 2. Iniciar sesión
1. Ingresa con las credenciales creadas
2. Deberías acceder a la página de tareas

### 3. Crear 2 tareas
1. En el input, escribe "Aprender React"
2. Haz clic en "Añadir"
3. Repite con "Terminar proyecto AZAHAR"
4. Verifica que ambas aparecen en la lista (descendente por fecha)

### 4. Recargar y verificar persistencia
1. Presiona F5 o recarga la página
2. Verifica que las 2 tareas siguen ahí
3. Cierra sesión y vuelve a acceder
4. Confirma que los datos persisten

## 🔧 Solución de problemas

### Error: "Faltan variables de entorno"
- Verifica que `.env.local` existe en `apps/web/`
- Revisa que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén presentes

### No puedo registrarme
- Asegúrate que Email Auth está activado en Supabase
- Revisa la consola del navegador para más detalles

### Las tareas no se guardan
- Verifica que ejecutaste el SQL de schema.sql en Supabase
- Comprueba que las políticas RLS están habilitadas

## 📋 Definición de Hecho (DoD Día 1)

- [x] Monorepo pnpm configurado (apps/web + packages/)
- [x] Vite + React + TypeScript con modo estricto
- [x] Tailwind CSS integrado y funcional
- [x] TanStack Query configurado
- [x] Supabase Auth (signup/login) funcional
- [x] Supabase conectado con tablas mínimas (projects, tasks, labels, task_labels)
- [x] RLS por usuario en todas las tablas
- [x] Pantalla de Login compilable y funcional
- [x] Pantalla de Tareas con listTasks() y addTask() funcionales
- [x] UI mínima pero limpia con Tailwind
- [x] Scripts dev/build/preview funcionando
- [x] .env.local.example y README completos
- [x] Sin errores TypeScript ni warnings
- [x] Git inicializado con commit de esqueleto

## 📝 Próximos pasos (Día 2+)

- Editar, completar y eliminar tareas
- Proyectos y etiquetas
- Fechas de vencimiento
- Buscar y filtrar
- Sincronización offline (service worker)
- Notificaciones
- Tema oscuro

## 📄 Licencia

MIT

---

**Creado con ❤️ para gestionar tareas de forma minimalista**
