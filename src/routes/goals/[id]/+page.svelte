<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { getAuthStore } from '../../../lib/stores/auth.svelte';
    import { fetchGoals, updateGoal, deleteGoal, type Goal } from '../../../lib/services/goals';
    import { 
        fetchGoalTasks, 
        createGoalTask, 
        updateGoalTask,
        deleteGoalTask,
        createTaskOccurrence,
        fetchCompletedTaskIds,
        fetchTaskRecommendations,
        type GoalTask,
        type TaskRecommendation 
    } from '../../../lib/services/goalTasks';
    
    // Components
    import GoalHeader from '../../../lib/components/goals/GoalHeader.svelte';
    import ProgressBar from '../../../lib/components/goals/ProgressBar.svelte';
    import TaskCard from '../../../lib/components/goals/TaskCard.svelte';
    import RecommendationCard from '../../../lib/components/goals/RecommendationCard.svelte';
    
    const authStore = getAuthStore();
    let goalId = $derived($page.params.id || '');

    let goal: any = $state(null);
    let tasks: GoalTask[] = $state([]);
    let recommendations: TaskRecommendation[] = $state([]);
    let completedTaskIds: Set<string> = $state(new Set());
    let isLoading = $state(true);
    let isLoadingRecommendations = $state(false);
    let error = $state('');
    let successMessage = $state('');
    let showDeleteConfirm = $state(false);
    let showAddTaskForm = $state(false);
    let showEditTaskForm = $state(false);
    let editingTask: GoalTask | null = $state(null);
    
    // Task form
    let newTaskTitle = $state('');
    let newTaskDescription = $state('');
    let newTaskType: 'mind' | 'body' | 'habit' | 'one_off' = $state('habit');
    let newTaskRequired = $state(true);
    let newTaskWeight = $state(1);

    // Computed
    const completedTasks = $derived(Array.from(completedTaskIds).filter(id => tasks.some(t => t.id === id)).length);
    const totalTasks = $derived(tasks.length);
    // Calcular progreso basado en tareas completadas si todas están completadas
    const calculatedProgress = $derived(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0);
    // Si todas las tareas están completadas, establecer progreso al 100%, de lo contrario usar el valor del backend
    const progress = $derived(completedTasks === totalTasks && totalTasks > 0 ? 100 : (goal ? parseFloat(String(goal.progress || 0)) : 0));

    async function loadGoal() {
        isLoading = true;
        error = '';
        
        try {
            const token = authStore.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const goals = await fetchGoals(token);
            goal = goals.find(g => g.id === goalId) || null;

            if (!goal) {
                error = 'Goal not found';
                return;
            }

            // Load tasks
            await loadTasks();

        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load goal';
            console.error('Error loading goal:', err);
        } finally {
            isLoading = false;
        }
    }

    async function loadTasks() {
        try {
            const token = authStore.getToken();
            if (!token) {
                console.error('No token available');
                return;
            }

            // Usar try-catch independiente para cargar tareas
            try {
                tasks = await fetchGoalTasks(token, goalId);
            } catch (err) {
                console.error('Error loading tasks:', err);
                tasks = []; // Asegurarse de que tasks sea un array vacío si falla
            }
            
            // Cargar occurrences y marcar tareas completadas
            if (tasks.length > 0) {
                try {
                    const completedIds = await fetchCompletedTaskIds(token, tasks);
                    completedTaskIds = completedIds;
                    
                    // Actualizar goal si todas las tareas están completadas
                    if (completedIds.size === tasks.length && tasks.length > 0) {
                        try {
                            // Actualizar el goal al 100% de progreso si todas las tareas están completadas
                            await updateGoal(token, goalId, { progress: 100 });
                            if (goal) goal.progress = 100;
                        } catch (updateErr) {
                            console.log('No se pudo actualizar el progreso del goal:', updateErr);
                        }
                    }
                } catch (err) {
                    console.log('Could not load occurrences:', err);
                    // Continue without occurrences
                }
            }
        } catch (err) {
            console.error('Error in loadTasks:', err);
        }
    }

    async function loadRecommendations() {
        if (!goal) return;
        
        isLoadingRecommendations = true;
        
        try {
            const token = authStore.getToken();
            if (!token) return;

            const result = await fetchTaskRecommendations(token, goalId, 5, true);
            recommendations = result.recommendations;
            
            showMessage('✨ Recomendaciones generadas con IA', 'success');
        } catch (err) {
            console.error('Error loading recommendations:', err);
            showMessage('No se pudieron cargar las recomendaciones', 'error');
        } finally {
            isLoadingRecommendations = false;
        }
    }

    async function handleGoalUpdate(event: CustomEvent) {
        try {
            const token = authStore.getToken();
            if (!token) return;

            const updatedGoal = await updateGoal(token, goalId, event.detail);
            goal = updatedGoal;
            showMessage('✅ Goal actualizado', 'success');
        } catch (err) {
            showMessage('Error al actualizar el goal', 'error');
        }
    }

    async function handleAddTask() {
        if (!newTaskTitle.trim()) {
            showMessage('El título es requerido', 'error');
            return;
        }

        try {
            const token = authStore.getToken();
            if (!token) return;

            const taskData: any = {
                title: newTaskTitle.trim(),
                ...(newTaskDescription.trim() && { description: newTaskDescription.trim() }),
                type: newTaskType,
                required: newTaskRequired,
                weight: newTaskWeight,
                priority: 'medium' as 'low' | 'medium' | 'high'
            };

            await createGoalTask(token, goalId, taskData);
            await loadTasks();
            
            // Reset form
            newTaskTitle = '';
            newTaskDescription = '';
            newTaskType = 'habit';
            newTaskRequired = true;
            newTaskWeight = 1;
            showAddTaskForm = false;
            
            showMessage('✅ Tarea creada', 'success');
        } catch (err) {
            showMessage('Error al crear la tarea', 'error');
        }
    }

    async function handleCompleteTask(event: CustomEvent) {
        const taskId = event.detail;
        
        try {
            const token = authStore.getToken();
            if (!token) return;

            // Marcar como completada inmediatamente para respuesta UI instantánea
            completedTaskIds.add(taskId);
            completedTaskIds = new Set(completedTaskIds); // Trigger reactivity
            
            // Si todas las tareas están completadas, actualizar el progreso al 100%
            if (completedTaskIds.size === tasks.length && tasks.length > 0) {
                if (goal) goal.progress = 100;
            }

            // Try to create occurrence and log completion
            try {
                await createTaskOccurrence(token, goalId, taskId);
                console.log('Occurrence created successfully');
                
                // Si todas las tareas están completadas, actualizar el goal en el backend
                if (completedTaskIds.size === tasks.length && tasks.length > 0) {
                    try {
                        await updateGoal(token, goalId, { progress: 100 });
                    } catch (updateErr) {
                        console.log('No se pudo actualizar el progreso del goal');
                    }
                }
            } catch (occurrenceErr: any) {
                // Handle any backend errors gracefully - use local state
                console.log('Using local completion tracking, server error:', 
                    occurrenceErr instanceof Error ? occurrenceErr.message : 'Unknown error');
            }
            
            showMessage('\u2705 Tarea completada! +10 XP', 'success');
        } catch (err) {
            console.error('Error completing task:', err);
            showMessage('Error al completar la tarea', 'error');
        }
    }

    async function handleEditTask(event: CustomEvent) {
        const taskId = event.detail;
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            editingTask = task;
            newTaskTitle = task.title;
            newTaskDescription = task.description || '';
            newTaskType = (task.type as any) || 'habit';
            newTaskRequired = task.required || false;
            newTaskWeight = task.weight || 1;
            showEditTaskForm = true;
        }
    }

    async function handleDeleteTask(event: CustomEvent) {
        const taskId = event.detail;
        
        try {
            const token = authStore.getToken();
            if (!token) return;

            await deleteGoalTask(token, goalId, taskId);
            await loadTasks();
            showMessage('🗑️ Tarea eliminada', 'success');
        } catch (err) {
            showMessage('Error al eliminar la tarea', 'error');
        }
    }

    async function handleSaveEditTask() {
        if (!newTaskTitle.trim() || !editingTask?.id) return;

        try {
            const token = authStore.getToken();
            if (!token) return;

            const taskData: any = {
                title: newTaskTitle.trim(),
                ...(newTaskDescription.trim() && { description: newTaskDescription.trim() }),
                type: newTaskType,
                required: newTaskRequired,
                weight: newTaskWeight,
                priority: 'medium' as 'low' | 'medium' | 'high'
            };

            await updateGoalTask(token, goalId, editingTask.id, taskData);
            await loadTasks();
            
            // Reset form
            newTaskTitle = '';
            newTaskDescription = '';
            newTaskType = 'habit';
            newTaskRequired = true;
            newTaskWeight = 1;
            editingTask = null;
            showEditTaskForm = false;
            
            showMessage('✅ Tarea actualizada', 'success');
        } catch (err) {
            showMessage('Error al actualizar la tarea', 'error');
        }
    }

    async function handleAddRecommendation(event: CustomEvent) {
        const recommendation: TaskRecommendation = event.detail;
        
        try {
            const token = authStore.getToken();
            if (!token) return;

            const taskData = {
                title: recommendation.title,
                description: recommendation.description,
                type: 'habit' as const,
                required: recommendation.priority === 'high',
                weight: recommendation.priority === 'high' ? 2 : recommendation.priority === 'medium' ? 1.5 : 1,
                priority: recommendation.priority
            };

            await createGoalTask(token, goalId, taskData);
            await loadTasks();
            
            // Remove from recommendations
            recommendations = recommendations.filter(r => r !== recommendation);
            
            showMessage('✅ Tarea agregada desde recomendación', 'success');
        } catch (err) {
            showMessage('Error al agregar la tarea', 'error');
        }
    }

    async function handleDeleteGoal() {
        try {
            const token = authStore.getToken();
            if (!token) return;

            await deleteGoal(token, goalId);
            goto('/goals');
        } catch (err) {
            showMessage('Error al eliminar el goal', 'error');
            showDeleteConfirm = false;
        }
    }

    function showMessage(message: string, type: 'success' | 'error') {
        if (type === 'success') {
            successMessage = message;
            setTimeout(() => { successMessage = ''; }, 3000);
        } else {
            error = message;
            setTimeout(() => { error = ''; }, 3000);
        }
    }

    onMount(() => {
        loadGoal();
    });
</script>

<svelte:head>
    <title>{goal?.title || 'Goal'} - IAM Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-neutral-950 pb-20">
    {#if isLoading}
        <!-- Loading State -->
        <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
                <div class="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                <p class="text-white/60 text-lg">Cargando goal...</p>
            </div>
        </div>
    {:else if error && !goal}
        <!-- Error State -->
        <div class="flex items-center justify-center min-h-screen px-4">
            <div class="text-center">
                <div class="text-6xl mb-4">😕</div>
                <h2 class="text-2xl font-bold text-white mb-2">Goal No Encontrado</h2>
                <p class="text-white/60 mb-6">{error}</p>
                <a href="/goals" class="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all">
                    Volver a Goals
                </a>
            </div>
        </div>
    {:else if goal}
        <!-- Header Bar -->
        <div class="sticky top-0 z-20 bg-neutral-950/80 backdrop-blur-lg border-b border-white/10">
            <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <a href="/goals" class="text-white/60 hover:text-white transition-colors flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span class="hidden sm:inline">Volver</span>
                </a>
                <button
                    onclick={() => showDeleteConfirm = true}
                    class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    aria-label="Eliminar goal"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 py-6">
            <!-- Messages -->
            {#if error}
            <div class="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 flex items-center justify-between">
                <span>{error}</span>
                <button onclick={() => error = ''} class="text-red-200 hover:text-white">✕</button>
            </div>
            {/if}

            {#if successMessage}
            <div class="mb-4 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-200 flex items-center justify-between">
                <span>{successMessage}</span>
                <button onclick={() => successMessage = ''} class="text-emerald-200 hover:text-white">✕</button>
            </div>
            {/if}

            <!-- Layout: Header + Progress on top -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div class="lg:col-span-2">
                    <GoalHeader {goal} on:update={handleGoalUpdate} />
                </div>
                <div>
                    <ProgressBar {progress} {completedTasks} {totalTasks} />
                </div>
            </div>

            <!-- Main Content: Tasks + Recommendations -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Tasks Section (2 columns) -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Add Task Button -->
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                            <span>📋</span>
                            Tareas
                            <span class="text-sm font-normal text-white/60">({tasks.length})</span>
                        </h2>
                        <button
                            onclick={() => showAddTaskForm = !showAddTaskForm}
                            class="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva Tarea
                        </button>
                    </div>

                    <!-- Add Task Form -->
                    {#if showAddTaskForm}
                    <div class="bg-neutral-900 rounded-xl border border-white/10 p-6 space-y-4">
                        <h3 class="text-lg font-semibold text-white">➕ Crear Nueva Tarea</h3>
                        <input
                            type="text"
                            bind:value={newTaskTitle}
                            placeholder="Título de la tarea..."
                            class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                        <textarea
                            bind:value={newTaskDescription}
                            placeholder="Descripción (opcional)..."
                            class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                            rows="2"
                        ></textarea>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="taskType" class="block text-sm text-white/60 mb-2">Tipo</label>
                                <select id="taskType" bind:value={newTaskType} class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                                    <option value="mind">🧠 Mental</option>
                                    <option value="body">💪 Físico</option>
                                    <option value="habit">🔄 Hábito</option>
                                    <option value="one_off">⚡ Única</option>
                                </select>
                            </div>
                            <div>
                                <label for="taskWeight" class="block text-sm text-white/60 mb-2">Peso</label>
                                <input
                                    id="taskWeight"
                                    type="number"
                                    bind:value={newTaskWeight}
                                    min="0.5"
                                    max="5"
                                    step="0.5"
                                    class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                        </div>

                        <label class="flex items-center gap-2 text-white cursor-pointer">
                            <input type="checkbox" bind:checked={newTaskRequired} class="w-4 h-4 rounded border-white/20 bg-neutral-800 text-purple-500 focus:ring-purple-500/50" />
                            <span class="text-sm">Requerida para progreso</span>
                        </label>

                        <div class="flex gap-2">
                            <button
                                onclick={handleAddTask}
                                class="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all"
                            >
                                Crear Tarea
                            </button>
                            <button
                                onclick={() => showAddTaskForm = false}
                                class="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                    {/if}

                    <!-- Edit Task Form -->
                    {#if showEditTaskForm && editingTask}
                    <div class="bg-neutral-900 rounded-xl border border-purple-500/30 p-6 space-y-4">
                        <h3 class="text-lg font-semibold text-white">✏️ Editar Tarea</h3>
                        <input
                            type="text"
                            bind:value={newTaskTitle}
                            placeholder="Título de la tarea..."
                            class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                        <textarea
                            bind:value={newTaskDescription}
                            placeholder="Descripción (opcional)..."
                            class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                            rows="2"
                        ></textarea>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="editTaskType" class="block text-sm text-white/60 mb-2">Tipo</label>
                                <select id="editTaskType" bind:value={newTaskType} class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                                    <option value="mind">🧠 Mental</option>
                                    <option value="body">💪 Físico</option>
                                    <option value="habit">🔄 Hábito</option>
                                    <option value="one_off">⚡ Única</option>
                                </select>
                            </div>
                            <div>
                                <label for="editTaskWeight" class="block text-sm text-white/60 mb-2">Peso</label>
                                <input
                                    id="editTaskWeight"
                                    type="number"
                                    bind:value={newTaskWeight}
                                    min="0.5"
                                    max="5"
                                    step="0.5"
                                    class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                        </div>

                        <label class="flex items-center gap-2 text-white cursor-pointer">
                            <input type="checkbox" bind:checked={newTaskRequired} class="w-4 h-4 rounded border-white/20 bg-neutral-800 text-purple-500 focus:ring-purple-500/50" />
                            <span class="text-sm">Requerida para progreso</span>
                        </label>

                        <div class="flex gap-2">
                            <button
                                onclick={handleSaveEditTask}
                                class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
                            >
                                Guardar Cambios
                            </button>
                            <button
                                onclick={() => { showEditTaskForm = false; editingTask = null; }}
                                class="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                    {/if}

                    <!-- Tasks List -->
                    {#if tasks.length === 0}
                    <div class="bg-neutral-900 rounded-xl border border-white/10 p-12 text-center">
                        <div class="text-6xl mb-4">📝</div>
                        <h3 class="text-xl font-semibold text-white mb-2">No hay tareas todavía</h3>
                        <p class="text-white/60 mb-6">Crea tu primera tarea o usa las recomendaciones de IA →</p>
                    </div>
                    {:else}
                    <div class="space-y-3">
                        {#each tasks as task (task.id)}
                            <TaskCard 
                                {task}
                                isCompleted={completedTaskIds.has(task.id || '')}
                                on:complete={handleCompleteTask}
                                on:edit={handleEditTask}
                                on:delete={handleDeleteTask}
                            />
                        {/each}
                    </div>
                    {/if}
                </div>

                <!-- Recommendations Section (1 column) -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-bold text-white flex items-center gap-2">
                            <span>✨</span>
                            Recomendaciones
                        </h2>
                        <button
                            onclick={loadRecommendations}
                            disabled={isLoadingRecommendations}
                            class="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all disabled:opacity-50"
                            aria-label="Generar recomendaciones"
                        >
                            <svg class="w-5 h-5 {isLoadingRecommendations ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    {#if isLoadingRecommendations}
                    <div class="bg-neutral-900 rounded-xl border border-white/10 p-8 text-center">
                        <div class="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                        <p class="text-white/60">Generando recomendaciones con IA...</p>
                    </div>
                    {:else if recommendations.length === 0}
                    <div class="bg-neutral-900 rounded-xl border border-white/10 p-8 text-center">
                        <div class="text-5xl mb-3">🤖</div>
                        <h3 class="text-lg font-semibold text-white mb-2">Recomendaciones IA</h3>
                        <p class="text-sm text-white/60 mb-4">Obtén sugerencias inteligentes de tareas para lograr tu goal</p>
                        <button
                            onclick={loadRecommendations}
                            class="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
                        >
                            Generar Recomendaciones
                        </button>
                    </div>
                    {:else}
                    <div class="space-y-3">
                        {#each recommendations as recommendation, i (i)}
                            <RecommendationCard 
                                {recommendation}
                                index={i}
                                on:add={handleAddRecommendation}
                            />
                        {/each}
                    </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div class="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-red-500/30 shadow-2xl">
        <div class="text-center mb-6">
            <div class="text-6xl mb-4">⚠️</div>
            <h3 class="text-xl font-bold text-white mb-2">¿Eliminar Goal?</h3>
            <p class="text-white/60">Esta acción no se puede deshacer. Todas las tareas asociadas también serán eliminadas.</p>
        </div>
        
        <div class="flex gap-3">
            <button
                onclick={() => showDeleteConfirm = false}
                class="flex-1 px-4 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors font-medium"
            >
                Cancelar
            </button>
            <button
                onclick={handleDeleteGoal}
                class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium"
            >
                Eliminar Goal
            </button>
        </div>
    </div>
</div>
{/if}

<style>
    :global(body) {
        overflow-x: hidden;
    }
</style>
