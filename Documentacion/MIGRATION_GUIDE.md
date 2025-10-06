# Guía de Migración - Actualización de Importaciones

## 📋 Archivos que Necesitan Actualización

Los siguientes archivos actualmente usan el servicio `tasks.ts` deprecated y deberían actualizarse:

### 1. `/src/routes/failures/AddFailureForm.svelte`

**Antes:**
```svelte
<script lang="ts">
    import { getMindTasks, getBodyTasks, type Task } from '$lib/services/tasks';
</script>
```

**Después:**
```svelte
<script lang="ts">
    import { getMindTasks } from '$lib/services/tasks_mind';
    import { getBodyTasks } from '$lib/services/tasks_body';
    import type { Task } from '$lib/types';
</script>
```

---

### 2. `/src/routes/tasks/[id]/+page.svelte`

**Antes:**
```svelte
<script lang="ts">
  import { getTaskDetail, updateTask, type TaskDetail } from '$lib/services/tasks';
</script>
```

**Después:**
```svelte
<script lang="ts">
  // Importar ambos servicios si no sabemos el tipo de tarea
  import { getMindTaskDetail, updateMindTask } from '$lib/services/tasks_mind';
  import { getBodyTaskDetail, updateBodyTask } from '$lib/services/tasks_body';
  import type { TaskDetail } from '$lib/types';
  
  // O si sabes que es una tarea mental:
  import { getMindTaskDetail, updateMindTask } from '$lib/services/tasks_mind';
  import type { TaskDetail } from '$lib/types';
  
  // O si sabes que es una tarea corporal:
  import { getBodyTaskDetail, updateBodyTask } from '$lib/services/tasks_body';
  import type { TaskDetail } from '$lib/types';
</script>
```

**Nota:** Este archivo probablemente necesita lógica adicional para determinar si la tarea es `mind` o `body` basándose en la URL o parámetros.

---

### 3. `/src/routes/minde/+page.svelte`

**Antes:**
```svelte
<script lang="ts">
    import { getMindTasks, type Task } from '$lib/services/tasks';
</script>
```

**Después:**
```svelte
<script lang="ts">
    import { getMindTasks } from '$lib/services/tasks_mind';
    import type { Task } from '$lib/types';
</script>
```

---

### 4. `/src/routes/body/+page.svelte`

**Antes:**
```svelte
<script lang="ts">
    import { getBodyTasks, completeTask, type Task } from '$lib/services/tasks';
</script>
```

**Después:**
```svelte
<script lang="ts">
    import { getBodyTasks, completeBodyTask } from '$lib/services/tasks_body';
    import type { Task } from '$lib/types';
    
    // Asegúrate de cambiar completeTask() por completeBodyTask()
</script>
```

**Cambios en el código:**
```svelte
<!-- Antes -->
<button on:click={() => completeTask(authStore, task.id, 'body')}>
    Completar
</button>

<!-- Después -->
<button on:click={() => completeBodyTask(authStore, task.id)}>
    Completar
</button>
```

---

## 🔧 Script de Migración Automática (Opcional)

Si quieres hacer una migración rápida manteniendo compatibilidad, puedes usar el archivo `tasks.ts` como está (ya tiene las funciones de compatibilidad).

## ⚠️ Consideración Especial: `/src/routes/tasks/[id]/+page.svelte`

Este archivo es especial porque maneja tanto tareas `mind` como `body`. Aquí hay dos enfoques:

### Opción 1: Mantener la función genérica (más simple)
```svelte
<script lang="ts">
  // Usar las funciones deprecated por ahora
  import { getTaskDetail, updateTask } from '$lib/services/tasks';
  import type { TaskDetail, TaskType } from '$lib/types';
  
  export let data;
  let taskType: TaskType = data.taskType || 'mind'; // Obtener del servidor o URL
  
  async function loadTask() {
    task = await getTaskDetail(authStore, taskId, taskType);
  }
  
  async function saveTask() {
    await updateTask(authStore, taskId, payload, taskType);
  }
</script>
```

### Opción 2: Usar servicios específicos con lógica condicional (más correcto)
```svelte
<script lang="ts">
  import { getMindTaskDetail, updateMindTask } from '$lib/services/tasks_mind';
  import { getBodyTaskDetail, updateBodyTask } from '$lib/services/tasks_body';
  import type { TaskDetail, TaskType } from '$lib/types';
  
  export let data;
  let taskType: TaskType = data.taskType || 'mind';
  
  async function loadTask() {
    if (taskType === 'mind') {
      task = await getMindTaskDetail(authStore, taskId);
    } else {
      task = await getBodyTaskDetail(authStore, taskId);
    }
  }
  
  async function saveTask() {
    if (taskType === 'mind') {
      await updateMindTask(authStore, taskId, payload);
    } else {
      await updateBodyTask(authStore, taskId, payload);
    }
  }
</script>
```

### Opción 3: Rutas separadas (más escalable)
Considera separar las rutas:
- `/tasks/mind/[id]/+page.svelte` - Solo usa `tasks_mind.ts`
- `/tasks/body/[id]/+page.svelte` - Solo usa `tasks_body.ts`

---

## 📝 Checklist de Migración

- [ ] Actualizar `AddFailureForm.svelte`
- [ ] Actualizar `+page.svelte` (minde)
- [ ] Actualizar `+page.svelte` (body)
- [ ] Revisar y actualizar `tasks/[id]/+page.svelte` (requiere análisis adicional)
- [ ] Buscar otras importaciones con: `grep -r "from '\$lib/services/tasks'" src/`
- [ ] Probar todas las funcionalidades
- [ ] Considerar separar las rutas de tasks en `mind` y `body`

---

## 🧪 Pruebas

Después de la migración, verifica:

1. ✅ Las tareas mentales se cargan correctamente en `/minde`
2. ✅ Las tareas corporales se cargan correctamente en `/body`
3. ✅ Se pueden completar tareas corporales
4. ✅ Los fallos pueden asociarse con tareas
5. ✅ La página de detalle de tareas funciona correctamente
6. ✅ No hay errores de TypeScript
7. ✅ El bundle de producción se genera correctamente

---

**Prioridad:** Media  
**Esfuerzo Estimado:** 1-2 horas  
**Riesgo:** Bajo (hay compatibilidad hacia atrás)
