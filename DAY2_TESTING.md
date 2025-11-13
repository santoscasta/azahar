# 📋 DAY 2 - Testing Manual

**Fecha:** 13 de noviembre de 2025
**App disponible en:** http://localhost:5174/

---

## ✅ Checklist de Testing

### 1. Preparación
- [ ] Servidor corriendo en http://localhost:5174/
- [ ] Usuario logueado (si no, regístrate primero)
- [ ] Consola del navegador abierta (F12) sin errores

### 2. Test: Crear Tarea
1. [ ] Escribe "Tarea de prueba 1" en el input
2. [ ] Haz clic en "Añadir"
3. [ ] Verifica que aparece en la lista
4. [ ] Verifica que el contador muestra "0 de 1 completada"

### 3. Test: Marcar como Completada
1. [ ] Haz clic en el círculo vacío junto a "Tarea de prueba 1"
2. [ ] Verifica que:
   - El círculo se llena de verde con un tick ✓
   - El texto se tacha
   - El contador cambia a "1 de 1 completada"
3. [ ] Haz clic nuevamente para desmarcar
4. [ ] Verifica que vuelve al estado abierto

### 4. Test: Editar Tarea
1. [ ] Crea una nueva tarea: "Tarea a editar"
2. [ ] Haz hover sobre la tarea (aparecerán botones)
3. [ ] Haz clic en "Editar"
4. [ ] Cambia el texto a "Tarea editada correctamente"
5. [ ] Haz clic en "Guardar"
6. [ ] Verifica que el título se actualizó en la lista

### 5. Test: Cancelar Edición
1. [ ] Haz hover sobre una tarea
2. [ ] Haz clic en "Editar"
3. [ ] Cambia el texto (pero no guardes)
4. [ ] Haz clic en "Cancelar"
5. [ ] Verifica que el título original se mantiene

### 6. Test: Eliminar Tarea
1. [ ] Crea una tarea: "Tarea a eliminar"
2. [ ] Haz hover sobre la tarea
3. [ ] Haz clic en "Eliminar"
4. [ ] Verifica que desaparece de la lista inmediatamente

### 7. Test: Persistencia de Datos
1. [ ] Con varias tareas creadas, presiona F5 (recargar página)
2. [ ] Verifica que todas las tareas siguen ahí
3. [ ] Verifica que los estados (completadas/abiertas) se mantienen

### 8. Test: Errores
1. [ ] Intenta agregar una tarea vacía → debe mostrar error
2. [ ] Intenta editar una tarea dejándola vacía → debe mostrar error
3. [ ] Verifica que los mensajes de error aparecen en la caja roja

### 9. Test: Casos Extremos
- [ ] Crea 10+ tareas y verifica que la lista se mantiene ordenada (desc por fecha)
- [ ] Marca algunas como completadas y otras como abiertas
- [ ] Edita una tarea completada y verifica que mantiene su estado

---

## 🎯 Criterios de Aceptación

✅ **Completado si:**
- Todas las operaciones CRUD funcionan sin errores
- Los datos persisten al recargar
- La UI responde correctamente a cada acción
- No hay errores en la consola del navegador
- El contador de progreso es exacto

---

## 📝 Notas Técnicas

### Tecnologías usadas:
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Estado:** React Query (TanStack Query)
- **Backend:** Supabase + PostgreSQL
- **Seguridad:** RLS (Row Level Security) por usuario

### Funciones nuevas agregadas:
```typescript
// supabase.ts
updateTask(id, updates) → Actualiza campos de una tarea
toggleTaskStatus(id) → Marca/desmarca como completada
deleteTask(id) → Elimina una tarea
```

### Características visuales:
- ✓ Checkbox visual con tick verde
- ✓ Texto tachado para completadas
- ✓ Botones de acción aparecer al hover
- ✓ Contador de progreso (X de Y)
- ✓ Transiciones suaves

---

## 🚨 Troubleshooting

### Si algo no funciona:
1. Abre la consola (F12) y busca errores en rojo
2. Verifica que las variables de entorno están configuradas
3. Asegúrate que el esquema SQL ejecutó correctamente en Supabase
4. Intenta recargar la página (F5)
5. Si persiste, reinicia el servidor: `pnpm dev`

---

**¡A probar! 🚀**
