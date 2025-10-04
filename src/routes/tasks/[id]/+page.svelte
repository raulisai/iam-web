<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getAuthContext } from '$lib/stores/auth.svelte';
  import { getTaskDetail, updateTask, type TaskDetail } from '$lib/services/tasks';
  import { goto } from '$app/navigation';

  const authStore = getAuthContext();
  const taskId = $page.params.id;

  let task = $state<TaskDetail | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state<string | null>(null);
  let successMessage = $state<string | null>(null);

  // Form fields
  let duration = $state(0);
  let notes = $state('');
  let scheduledAt = $state('');
  let status = $state('pending');

  onMount(async () => {
    await loadTask();
  });

  async function loadTask() {
    if (!taskId) {
      error = 'ID de tarea no encontrado.';
      loading = false;
      return;
    }
    loading = true;
    error = null;
    try {
      // Intentar primero con 'mind', luego con 'body'
      let data = await getTaskDetail(authStore, taskId, 'mind');
      if (!data) {
        data = await getTaskDetail(authStore, taskId, 'body');
      }
      
      if (data) {
        task = data;
        duration = data.params?.duration || 0;
        notes = data.params?.notes || '';
        scheduledAt = data.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : '';
        status = data.status;
      } else {
        error = 'No se pudo cargar la tarea';
      }
    } catch (e) {
      error = 'Error al cargar la tarea';
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    saving = true;
    error = null;
    successMessage = null;

    if (!taskId || !task) {
      error = 'ID de tarea no encontrado.';
      saving = false;
      return;
    }

    try {
      const payload = {
        params: {
          duration,
          notes
        },
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        status
      };

      // Determinar el tipo de tarea por la categoría
      const taskType = task.task_templates.category === 'body' ? 'body' : 'mind';
      const updated = await updateTask(authStore, taskId, payload, taskType);
      if (updated) {
        task = updated;
        successMessage = '¡Tarea actualizada correctamente!';
        setTimeout(() => {
          successMessage = null;
        }, 3000);
      } else {
        error = 'No se pudo actualizar la tarea';
      }
    } catch (e) {
      error = 'Error al guardar los cambios';
      console.error(e);
    } finally {
      saving = false;
    }
  }
</script>

<div class="min-h-[100dvh] bg-neutral-950 text-white">
  <header class="sticky top-0 z-10 h-12 md:h-16 flex items-center gap-3 px-4 md:px-8 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur">
    <button 
      onclick={() => window.history.back()} 
      class="text-neutral-300 hover:text-white text-sm md:text-base transition-colors"
    >
      ← Back
    </button>
    <h1 class="text-sm md:text-lg font-semibold tracking-wide">Editar tarea</h1>
    <div class="ml-auto text-xs md:text-sm text-neutral-400">ID: {taskId}</div>
  </header>

  <main class="p-4 md:p-8">
    {#if loading}
      <div class="max-w-2xl mx-auto text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p class="mt-4 text-neutral-400">Cargando tarea...</p>
      </div>
    {:else if error && !task}
      <div class="max-w-2xl mx-auto rounded-xl border border-red-500/30 bg-red-900/20 p-6 text-center">
        <p class="text-red-400">{error}</p>
        <button onclick={() => loadTask()} class="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
          Reintentar
        </button>
      </div>
    {:else if task}
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Task Template Info (Read-only) -->
        <section class="rounded-xl border border-white/10 bg-neutral-900/60 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
          <h2 class="text-xl font-bold mb-4 text-white">{task.task_templates.name}</h2>
          <div class="space-y-2 text-sm">
            <p class="text-neutral-300">{task.task_templates.desc}</p>
            <div class="flex flex-wrap gap-4 mt-4">
              <div class="flex items-center gap-2">
                <span class="text-neutral-500">Categoría:</span>
                <span class="px-2 py-1 bg-neutral-800 rounded text-neutral-300">{task.task_templates.category}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-neutral-500">Dificultad:</span>
                <span class="text-yellow-400">{'⭐'.repeat(task.task_templates.difficulty)}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-neutral-500">XP Base:</span>
                <span class="text-green-400">{task.task_templates.reward_xp} XP</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-neutral-500">Tiempo estimado:</span>
                <span class="text-blue-400">{task.task_templates.estimated_minutes} min</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Editable Form -->
        <section class="rounded-xl border border-white/10 bg-neutral-900/60 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
          <h2 class="text-lg font-semibold mb-4 text-white">Detalles de la tarea</h2>
          
          {#if successMessage}
            <div class="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg text-green-300 text-sm">
              {successMessage}
            </div>
          {/if}

          {#if error}
            <div class="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          {/if}

          <form onsubmit={handleSubmit} class="space-y-4">
            <div>
              <label for="status" class="block text-sm font-medium text-neutral-300 mb-2">Estado</label>
              <select 
                id="status" 
                bind:value={status}
                class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div>
              <label for="duration" class="block text-sm font-medium text-neutral-300 mb-2">Duración (minutos)</label>
              <input 
                type="number" 
                id="duration" 
                bind:value={duration}
                min="0"
                class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label for="notes" class="block text-sm font-medium text-neutral-300 mb-2">Notas</label>
              <textarea 
                id="notes" 
                bind:value={notes}
                rows="4"
                class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Añade notas sobre esta tarea..."
              ></textarea>
            </div>

            <div>
              <label for="scheduledAt" class="block text-sm font-medium text-neutral-300 mb-2">Programada para</label>
              <input 
                type="datetime-local" 
                id="scheduledAt" 
                bind:value={scheduledAt}
                class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="flex gap-3 pt-4">
              <button 
                type="submit"
                disabled={saving}
                class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button 
                type="button"
                onclick={() => window.history.back()}
                class="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>

        <!-- Additional Info -->
        <section class="rounded-xl border border-white/10 bg-neutral-900/60 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
          <h2 class="text-lg font-semibold mb-4 text-white">Información adicional</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-neutral-500">Creada:</span>
              <span class="ml-2 text-neutral-300">{new Date(task.created_at).toLocaleString('es-ES')}</span>
            </div>
            <div>
              <span class="text-neutral-500">Creada por:</span>
              <span class="ml-2 text-neutral-300">{task.created_by}</span>
            </div>
            <div>
              <span class="text-neutral-500">XP otorgado:</span>
              <span class="ml-2 text-green-400">{task.xp_awarded} XP</span>
            </div>
            {#if task.completed_at}
              <div>
                <span class="text-neutral-500">Completada:</span>
                <span class="ml-2 text-neutral-300">{new Date(task.completed_at).toLocaleString('es-ES')}</span>
              </div>
            {/if}
          </div>
        </section>
      </div>
    {/if}
  </main>
</div>
