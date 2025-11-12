# 🚀 AZAHAR - Guía de Setup Inicial

> **Última actualización:** 12 de noviembre de 2025  
> **Estado:** Listo para usar  
> **Node/pnpm:** v20 LTS / v10+

---

## ⚡ Quick Start (5 minutos)

### 1. Clonar el repo
```bash
git clone <tu-repo-url> azahar
cd azahar
```

### 2. Crear proyecto Supabase (EU)
- [supabase.com](https://supabase.com) → Crear proyecto
- Esperar ~2min a que esté listo
- Región: **Europe (EU)**

### 3. Activar Email Auth
- Dashboard → **Authentication > Providers**
- Habilitar **Email** con "Email with password"
- Guardar

### 4. Ejecutar SQL
- Dashboard → **SQL Editor** → Nueva consulta
- Copiar contenido de `docs/schema.sql`
- Ejecutar
- ✅ Sin errores

### 5. Configurar .env.local
```bash
cp apps/web/.env.local.example apps/web/.env.local
```
Edita `apps/web/.env.local`:
```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

*Obtén las claves en:* Dashboard → **Settings > API**

### 6. Instalar y levantar
```bash
pnpm install
pnpm dev
```

**Abre:** `http://localhost:5173`

---

## 📋 Verificación de Setup

Run this checklist after setup:

```bash
# 1. Verificar instalación
pnpm --version          # Debería ser v10+
node --version          # Debería ser v20+

# 2. Verificar TypeScript
pnpm lint              # Debe pasar sin errores

# 3. Verificar build
pnpm build             # Debe generar dist/ en ~10s

# 4. Verificar dev server
pnpm dev               # Debe abrir localhost:5173
```

---

## 🔍 Solución de Problemas

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
# Solución:
pnpm install
pnpm dev
```

### Error: "Faltan variables de entorno"
1. Verifica que existe `apps/web/.env.local`
2. Verifica que tiene `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
3. Reinicia el servidor dev (`pnpm dev`)

### Error: "Cannot register user"
1. Verifica Email Auth esté habilitado en Supabase
2. Revisa la consola del navegador (F12)
3. Comprueba que ejecutaste el SQL de `docs/schema.sql`

### Error: "Tasks no se guardan"
1. Verifica que RLS esté habilitado: Supabase → **SQL Editor**
   ```sql
   SELECT * FROM pg_tables WHERE schemaname = 'public';
   ```
   Debería mostrar 4 tablas: projects, tasks, labels, task_labels
2. Verifica políticas RLS: Supabase → **Authentication > Policies**

---

## 🧪 Prueba Rápida

### Crear usuario y 2 tareas
```
1. Abre http://localhost:5173
2. Haz clic en "Regístrate"
3. Email: test@example.com | Contraseña: Test1234!
4. Ingresa las 2 tareas:
   - "Aprender React"
   - "Terminar proyecto AZAHAR"
5. Recarga la página (F5)
6. Verifica que las tareas persisten
```

**✅ Si todo funciona, ¡estás listo para Día 2!**

---

## 📚 Comandos Disponibles

```bash
pnpm dev        # Inicia servidor de desarrollo (puerto 5173)
pnpm build      # Compila para producción
pnpm preview    # Preview del build compilado
pnpm lint       # Valida TypeScript (sin errores)
```

---

## 📖 Documentación Adicional

- **Estructura del proyecto:** Ver `DAY1_DELIVERABLES.md`
- **Schema SQL:** Ver `docs/schema.sql`
- **README completo:** Ver `README.md`
- **Código fuente:**
  - Autenticación: `apps/web/src/lib/supabase.ts`
  - Rutas: `apps/web/src/App.tsx`
  - Pantallas: `apps/web/src/pages/`

---

## 🎯 Próximos Pasos (Día 2)

- [ ] Editar tareas
- [ ] Completar/marcar como done
- [ ] Eliminar tareas
- [ ] Proyectos básicos

---

## ❓ Preguntas Frecuentes

**P: ¿Necesito crear la BD manualmente?**
No, ejecutar el SQL de `docs/schema.sql` crea todo automáticamente.

**P: ¿Puedo usar otra región en Supabase?**
Sí, pero la documentación recomienda EU para privacidad.

**P: ¿Cómo cambio las credenciales después?**
Edita `apps/web/.env.local` y reinicia el servidor.

**P: ¿Está optimizado para producción?**
No, Día 1 es MVP. Falta: auth refresh tokens, error boundaries, logging, etc.

---

**Creado con ❤️ para AZAHAR - Día 1**
