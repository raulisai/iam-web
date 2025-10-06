# Ejemplos Prácticos de Uso

## 🚀 Casos de Uso Comunes

### 1. Componente de Lista de Tareas Mentales

```svelte
<!-- src/routes/minde/TaskList.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { getMindTasks } from '$lib/services/tasks_mind';
  import type { Task, AuthStore } from '$lib/types';
  import { authStore } from '$lib/stores/auth.svelte';

  let tasks: Task[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      tasks = await getMindTasks(authStore);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Error desconocido';
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <p>Cargando tareas mentales...</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  <ul>
    {#each tasks as task}
      <li>
        <span>{task.icon}</span>
        <h3>{task.title}</h3>
        <p>{task.summary}</p>
        <span>{task.points} XP</span>
      </li>
    {/each}
  </ul>
{/if}
```

### 2. Componente de Lista de Tareas Corporales con Completar

```svelte
<!-- src/routes/body/TaskList.svelte -->
<script lang="ts">
  import { getBodyTasks, completeBodyTask } from '$lib/services/tasks_body';
  import type { Task, AuthStore } from '$lib/types';
  import { authStore } from '$lib/stores/auth.svelte';

  let tasks = $state<Task[]>([]);
  let completing = $state<string | null>(null);

  async function loadTasks() {
    tasks = await getBodyTasks(authStore);
  }

  async function handleComplete(taskId: string) {
    completing = taskId;
    try {
      const success = await completeBodyTask(authStore, taskId);
      if (success) {
        // Recargar lista
        await loadTasks();
      }
    } catch (e) {
      console.error('Error completando tarea:', e);
    } finally {
      completing = null;
    }
  }

  $effect(() => {
    loadTasks();
  });
</script>

<div class="task-list">
  {#each tasks as task (task.id)}
    <div class="task-card">
      <h3>{task.icon} {task.title}</h3>
      <p>{task.summary}</p>
      <button
        onclick={() => handleComplete(task.id)}
        disabled={completing === task.id}
      >
        {completing === task.id ? 'Completando...' : 'Completar'}
      </button>
    </div>
  {/each}
</div>
```

### 3. Página de Detalle de Tarea (con tipo dinámico)

```svelte
<!-- src/routes/tasks/[id]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getMindTaskDetail, updateMindTask } from '$lib/services/tasks_mind';
  import { getBodyTaskDetail, updateBodyTask } from '$lib/services/tasks_body';
  import type { TaskDetail, UpdateTaskPayload, TaskType } from '$lib/types';
  import { authStore } from '$lib/stores/auth.svelte';

  // Obtener parámetros
  const taskId = $page.params.id;
  const taskType: TaskType = ($page.url.searchParams.get('type') as TaskType) || 'mind';

  let task = $state<TaskDetail | null>(null);
  let notes = $state('');
  let duration = $state(0);
  let saving = $state(false);

  async function loadTask() {
    if (taskType === 'mind') {
      task = await getMindTaskDetail(authStore, taskId);
    } else {
      task = await getBodyTaskDetail(authStore, taskId);
    }
    
    if (task) {
      notes = task.params.notes || '';
      duration = task.params.duration || 0;
    }
  }

  async function saveTask() {
    if (!task) return;
    
    saving = true;
    try {
      const payload: UpdateTaskPayload = {
        params: {
          notes,
          duration
        }
      };

      let updated: TaskDetail | null;
      if (taskType === 'mind') {
        updated = await updateMindTask(authStore, taskId, payload);
      } else {
        updated = await updateBodyTask(authStore, taskId, payload);
      }

      if (updated) {
        task = updated;
        alert('Tarea actualizada correctamente');
      }
    } catch (e) {
      console.error('Error guardando tarea:', e);
      alert('Error al guardar');
    } finally {
      saving = false;
    }
  }

  $effect(() => {
    loadTask();
  });
</script>

{#if task}
  <div class="task-detail">
    <h1>{task.task_templates.name}</h1>
    <p class="category">
      Tipo: <span class="badge">{taskType === 'mind' ? '🧠 Mental' : '🧘 Corporal'}</span>
    </p>
    
    <div class="info">
      <p><strong>Descripción:</strong> {task.task_templates.desc}</p>
      <p><strong>Dificultad:</strong> {task.task_templates.difficulty}/5</p>
      <p><strong>Tiempo estimado:</strong> {task.task_templates.estimated_minutes} min</p>
      <p><strong>Recompensa:</strong> {task.task_templates.reward_xp} XP</p>
    </div>

    <form onsubmit|preventDefault={saveTask}>
      <label>
        Duración (minutos):
        <input type="number" bind:value={duration} min="0" />
      </label>

      <label>
        Notas:
        <textarea bind:value={notes} rows="4"></textarea>
      </label>

      <button type="submit" disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  </div>
{:else}
  <p>Cargando tarea...</p>
{/if}
```

### 4. Formulario de Creación de Objetivo con Tipos

```svelte
<!-- src/routes/goals/CreateGoalForm.svelte -->
<script lang="ts">
  import { createGoal } from '$lib/services/goals';
  import type { CreateGoalData, Goal } from '$lib/types';

  let formData = $state<CreateGoalData>({
    title: '',
    description: '',
    type: 'short',
    metric_key: 'tasks_completed',
    target_value: 10,
    start_date: new Date().toISOString().split('T')[0],
    is_active: true
  });

  let submitting = $state(false);
  let error = $state<string | null>(null);

  async function handleSubmit() {
    const token = localStorage.getItem('token');
    if (!token) {
      error = 'No estás autenticado';
      return;
    }

    submitting = true;
    error = null;

    try {
      const newGoal: Goal = await createGoal(token, formData);
      console.log('Objetivo creado:', newGoal);
      // Redirigir o mostrar éxito
    } catch (e) {
      error = e instanceof Error ? e.message : 'Error al crear objetivo';
    } finally {
      submitting = false;
    }
  }
</script>

<form onsubmit|preventDefault={handleSubmit}>
  <h2>Crear Nuevo Objetivo</h2>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <label>
    Título:
    <input type="text" bind:value={formData.title} required />
  </label>

  <label>
    Descripción:
    <textarea bind:value={formData.description}></textarea>
  </label>

  <label>
    Tipo:
    <select bind:value={formData.type}>
      <option value="short">Corto plazo</option>
      <option value="medium">Mediano plazo</option>
      <option value="long">Largo plazo</option>
    </select>
  </label>

  <label>
    Métrica:
    <select bind:value={formData.metric_key}>
      <option value="tasks_completed">Tareas completadas</option>
      <option value="xp_earned">XP ganado</option>
      <option value="days_streak">Días consecutivos</option>
    </select>
  </label>

  <label>
    Valor objetivo:
    <input type="number" bind:value={formData.target_value} min="1" required />
  </label>

  <label>
    Fecha de inicio:
    <input type="date" bind:value={formData.start_date} required />
  </label>

  <button type="submit" disabled={submitting}>
    {submitting ? 'Creando...' : 'Crear Objetivo'}
  </button>
</form>
```

### 5. Componente de Registro de Fallo

```svelte
<!-- src/routes/failures/ReportFailure.svelte -->
<script lang="ts">
  import { createFailure } from '$lib/services/failures';
  import type { CreateFailurePayload, Failure } from '$lib/types';
  import { authStore } from '$lib/stores/auth.svelte';

  export let taskId: string;
  export let taskTable: 'tasks_mind' | 'tasks_body';
  export let onSuccess: (failure: Failure) => void;

  let payload = $state<CreateFailurePayload>({
    task_table: taskTable,
    task_id: taskId,
    reason: '',
    severity: 'minor',
    notes: '',
    title: '',
    rootCause: '',
    prevention: ''
  });

  let submitting = $state(false);
  let error = $state<string | null>(null);

  async function handleSubmit() {
    submitting = true;
    error = null;

    try {
      const failure = await createFailure(authStore, payload);
      if (failure) {
        onSuccess(failure);
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Error al reportar fallo';
    } finally {
      submitting = false;
    }
  }
</script>

<div class="failure-form">
  <h3>Reportar Fallo</h3>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <form onsubmit|preventDefault={handleSubmit}>
    <label>
      Título:
      <input type="text" bind:value={payload.title} required />
    </label>

    <label>
      Severidad:
      <select bind:value={payload.severity}>
        <option value="minor">Menor</option>
        <option value="major">Mayor</option>
        <option value="critical">Crítico</option>
      </select>
    </label>

    <label>
      Razón:
      <textarea bind:value={payload.reason} required></textarea>
    </label>

    <label>
      Causa raíz:
      <textarea bind:value={payload.rootCause}></textarea>
    </label>

    <label>
      Prevención:
      <textarea bind:value={payload.prevention}></textarea>
    </label>

    <label>
      Notas adicionales:
      <textarea bind:value={payload.notes}></textarea>
    </label>

    <button type="submit" disabled={submitting}>
      {submitting ? 'Reportando...' : 'Reportar Fallo'}
    </button>
  </form>
</div>
```

### 6. Store Reactivo con Tipos

```typescript
// src/lib/stores/tasks.svelte.ts
import { getMindTasks } from '$lib/services/tasks_mind';
import { getBodyTasks } from '$lib/services/tasks_body';
import type { Task, AuthStore } from '$lib/types';

class TaskStore {
  mindTasks = $state<Task[]>([]);
  bodyTasks = $state<Task[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);

  async loadMindTasks(authStore: AuthStore) {
    this.loading = true;
    this.error = null;
    try {
      this.mindTasks = await getMindTasks(authStore);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Error cargando tareas';
    } finally {
      this.loading = false;
    }
  }

  async loadBodyTasks(authStore: AuthStore) {
    this.loading = true;
    this.error = null;
    try {
      this.bodyTasks = await getBodyTasks(authStore);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Error cargando tareas';
    } finally {
      this.loading = false;
    }
  }

  async loadAllTasks(authStore: AuthStore) {
    await Promise.all([
      this.loadMindTasks(authStore),
      this.loadBodyTasks(authStore)
    ]);
  }

  get allTasks(): Task[] {
    return [...this.mindTasks, ...this.bodyTasks];
  }

  get totalTasks(): number {
    return this.allTasks.length;
  }
}

export const taskStore = new TaskStore();
```

### 7. Uso del Store en Componente

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import { taskStore } from '$lib/stores/tasks.svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    taskStore.loadAllTasks(authStore);
  });
</script>

<div class="dashboard">
  <h1>Dashboard</h1>

  {#if taskStore.loading}
    <p>Cargando tareas...</p>
  {:else if taskStore.error}
    <p class="error">{taskStore.error}</p>
  {:else}
    <div class="stats">
      <div class="stat-card">
        <h3>Tareas Mentales</h3>
        <p class="number">{taskStore.mindTasks.length}</p>
      </div>
      
      <div class="stat-card">
        <h3>Tareas Corporales</h3>
        <p class="number">{taskStore.bodyTasks.length}</p>
      </div>
      
      <div class="stat-card">
        <h3>Total</h3>
        <p class="number">{taskStore.totalTasks}</p>
      </div>
    </div>

    <div class="task-lists">
      <div class="mind-tasks">
        <h2>🧠 Tareas Mentales</h2>
        {#each taskStore.mindTasks as task}
          <div class="task-item">{task.title}</div>
        {/each}
      </div>

      <div class="body-tasks">
        <h2>🧘 Tareas Corporales</h2>
        {#each taskStore.bodyTasks as task}
          <div class="task-item">{task.title}</div>
        {/each}
      </div>
    </div>
  {/if}
</div>
```

---

## 💡 Tips y Mejores Prácticas

### ✅ DO

```typescript
// Importar tipos con 'type'
import type { Task, AuthStore } from '$lib/types';

// Usar servicios específicos
import { getMindTasks } from '$lib/services/tasks_mind';

// Manejar errores apropiadamente
try {
  const tasks = await getMindTasks(authStore);
} catch (e) {
  console.error('Error:', e);
}

// Usar estados reactivos de Svelte 5
let tasks = $state<Task[]>([]);
```

### ❌ DON'T

```typescript
// No importar tipos como valores
import { Task } from '$lib/types';

// No usar el servicio deprecated
import { getTaskDetail } from '$lib/services/tasks';

// No ignorar errores
const tasks = await getMindTasks(authStore); // ⚠️ Sin try/catch

// No mezclar sintaxis antigua de Svelte
let tasks: Task[] = []; // ⚠️ Usar $state en Svelte 5
```

---

Estos ejemplos te dan una base sólida para empezar a trabajar con la nueva arquitectura. 🚀
