# 🧪 DAY 3 - Testing Manual: Proyectos & Etiquetas

**Fecha:** 13 de noviembre de 2025  
**App disponible en:** http://localhost:5174/

---

## ✅ Checklist de Testing - Proyectos

### 1. Test: Crear Proyecto
1. [ ] Abre http://localhost:5174/
2. [ ] Haz click en botón "+ Proyecto"
3. [ ] Aparece formulario para crear proyecto
4. [ ] Escribe nombre: "Mi Proyecto"
5. [ ] Haz click en "Crear"
6. [ ] El proyecto aparece en el dropdown del formulario de tareas

**Esperado:**
- ✅ Proyecto creado sin errores
- ✅ Aparece en selector de proyecto
- ✅ Sin mensajes de error

---

### 2. Test: Asignar Tarea a Proyecto
1. [ ] Crea una nueva tarea: "Tarea del proyecto"
2. [ ] En el dropdown, selecciona "Mi Proyecto"
3. [ ] Haz click en "Añadir"
4. [ ] La tarea aparece en la lista
5. [ ] Se muestra el badge del proyecto en la tarea

**Esperado:**
- ✅ Tarea creada y asignada al proyecto
- ✅ Badge azul muestra nombre del proyecto
- ✅ Tarea se ve en la lista

---

### 3. Test: Filtrado por Proyecto
1. [ ] Crea otro proyecto: "Trabajo"
2. [ ] Crea una tarea: "Tarea de Trabajo" sin proyecto
3. [ ] En el dropdown de proyectos, selecciona "Mi Proyecto"
4. [ ] Solo ve la tarea del primer proyecto
5. [ ] Selecciona "Trabajo"
6. [ ] Solo ve la tarea de Trabajo
7. [ ] Selecciona "Sin proyecto"
8. [ ] Ve todas las tareas

**Esperado:**
- ✅ Filtrado funciona correctamente
- ✅ Solo muestra tareas del proyecto seleccionado
- ✅ Contador se actualiza según filtro

---

## ✅ Checklist de Testing - Etiquetas

### 4. Test: Crear Etiqueta
1. [ ] Haz click en botón "+ Etiqueta"
2. [ ] Aparece formulario
3. [ ] Escribe: "Importante"
4. [ ] Haz click "Crear"
5. [ ] No aparece error
6. [ ] La etiqueta se lista

**Esperado:**
- ✅ Etiqueta creada sin errores
- ✅ Se puede crear múltiples etiquetas

---

### 5. Test: Asignar Etiqueta a Tarea
1. [ ] Haz click en "Etiquetar" en una tarea
2. [ ] Aparece el formulario de etiquetas
3. [ ] Muestra todas las etiquetas disponibles
4. [ ] Haz click en "+ Importante"
5. [ ] Se asigna la etiqueta

**Esperado:**
- ✅ Se muestra lista de etiquetas
- ✅ Se asigna correctamente
- ✅ Sin errores

---

### 6. Test: Mostrar Etiquetas Asignadas
1. [ ] Una vez asignada una etiqueta a una tarea
2. [ ] La tarea debería mostrar la etiqueta
3. [ ] Se ve con color de etiqueta

**Esperado:**
- ✅ Badge de etiqueta visible en la tarea
- ✅ Diseño limpio

---

### 7. Test: Múltiples Etiquetas
1. [ ] Crea 3 etiquetas más: "Urgente", "Después", "Revisar"
2. [ ] Asigna múltiples etiquetas a una tarea
3. [ ] Se muestran todas las etiquetas

**Esperado:**
- ✅ Se pueden asignar múltiples
- ✅ Todas aparecen correctamente
- ✅ UI no se rompe con muchas etiquetas

---

## ✅ Checklist de Testing - Integración

### 8. Test: Persistencia de Proyectos
1. [ ] Crea 2 proyectos
2. [ ] Crea tareas en cada proyecto
3. [ ] Recarga la página (F5)
4. [ ] Los proyectos siguen ahí
5. [ ] Las tareas mantienen su asignación

**Esperado:**
- ✅ Proyectos persisten
- ✅ Relaciones se mantienen

---

### 9. Test: Persistencia de Etiquetas
1. [ ] Crea 3 etiquetas
2. [ ] Asigna a tareas
3. [ ] Recarga página
4. [ ] Las etiquetas siguen asignadas
5. [ ] Cierra sesión y vuelve a loguear
6. [ ] Todo persiste

**Esperado:**
- ✅ Etiquetas persisten en BD
- ✅ Relaciones se mantienen
- ✅ RLS funciona (solo ve sus datos)

---

### 10. Test: Flujo Completo
1. [ ] Crea proyecto "Personal"
2. [ ] Crea etiquetas: "Salud", "Ocio", "Aprender"
3. [ ] Crea 5 tareas diferentes
4. [ ] Asigna a proyectos
5. [ ] Asigna etiquetas
6. [ ] Filtra por proyecto
7. [ ] Marca algunas como completadas
8. [ ] Recarga página
9. [ ] Verifica que todo persiste
10. [ ] Sin errores en consola

**Esperado:**
- ✅ Sistema completo funciona
- ✅ Flujo de usuario es intuitivo
- ✅ Sin bugs

---

## 🐛 Casos de Error a Probar

### Error 1: Crear proyecto vacío
1. [ ] Click "+ Proyecto"
2. [ ] Dejar nombre vacío
3. [ ] Click "Crear"
4. [ ] Mostrar error: "El nombre del proyecto no puede estar vacío"

**Esperado:** ✅ Error message claro

### Error 2: Crear etiqueta vacía
1. [ ] Click "+ Etiqueta"
2. [ ] Dejar nombre vacío
3. [ ] Click "Crear"
4. [ ] Mostrar error

**Esperado:** ✅ Error message claro

### Error 3: Cambiar proyecto de tarea existente
1. [ ] Crea tarea en "Mi Proyecto"
2. [ ] Intenta cambiar a otro proyecto
3. [ ] ¿Se actualiza correctamente?

**Esperado:** ✅ Proyecto se actualiza

---

## 📊 Criterios de Aceptación

✅ **Testing Completado si:**
- Crear proyectos funciona sin errores
- Asignar tareas a proyectos funciona
- Filtrado por proyecto es preciso
- Crear etiquetas funciona
- Asignar etiquetas funciona
- Mostrar etiquetas en tareas funciona
- Persistencia funciona (recarga/logout)
- Sin errores en consola
- UI es responsive y limpia
- RLS protege datos correctamente

---

## 🎯 Plan de Testing

**Fase 1: Proyectos (Tests 1-3)**
- Tiempo: 15-20 min
- Prioridad: Alta

**Fase 2: Etiquetas (Tests 4-7)**
- Tiempo: 15-20 min
- Prioridad: Alta

**Fase 3: Integración (Tests 8-10)**
- Tiempo: 20-30 min
- Prioridad: Alta

**Fase 4: Errores (Tests 11-13)**
- Tiempo: 10 min
- Prioridad: Media

**Total Estimado:** 60-80 minutos

---

## 📝 Notas de Desarrollo

### Cosas a Verificar Extra:
- [ ] Componente TaskLabels se muestra correctamente
- [ ] Selector de proyecto filtra en tiempo real
- [ ] Contador de tareas se actualiza con filtros
- [ ] No hay memory leaks (DevTools)
- [ ] Rendimiento es bueno con 50+ tareas

---

## 🚀 Próximos Tests (Si Todo Funciona)

- [ ] Borrar proyectos
- [ ] Borrar etiquetas
- [ ] Filtrado múltiple (proyecto + etiqueta)
- [ ] Búsqueda de tareas
- [ ] Ordenamiento personalizado

---

**¡Comienza el testing! 🧪**

*Documenta cualquier problema que encuentres.*
