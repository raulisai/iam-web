<script lang="ts">
    import Brain from './Brain.svelte';
    import TaskCarousel from '../../lib/components/TaskCarousel.svelte';
    import MetricsChart from '../../lib/components/MetricsChart.svelte';
    import AddTaskButton from '../../lib/components/AddTaskButton.svelte';
    import TaskRecommendationModal from '../../lib/components/TaskRecommendationModal.svelte';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { getAuthContext } from '$lib/stores/auth.svelte';
    import { getMindTasks, completeTask, type Task } from '$lib/services/tasks';
    import { getLatestSnapshot, type PerformanceSnapshot } from '$lib/services/stats';
    import { getMindRecommendations, createTaskFromRecommendation, createCustomTask, type TaskRecommendation } from '$lib/services/recommendations';
    import { toastStore } from '$lib/stores/toast.svelte';

    let fillLevel = $state(0);
    let scoreMind = $state(0);
    let attention = $state(0);
    let tasks = $state<Task[]>([]);
    let snapshot = $state<PerformanceSnapshot | null>(null);
    let isLoadingStats = $state(true);
    let isLoadingTasks = $state(true);
    
    // Recommendations state
    let showRecommendationsModal = $state(false);
    let recommendations = $state<TaskRecommendation[]>([]);
    let isLoadingRecommendations = $state(false);

    // Obtener authStore una vez al inicializar el componente
    const authStore = getAuthContext();

    // Datos de ejemplo mínimos para la gráfica (se pueden reemplazar por reales)
    const chartData = [0.25,0.5,0.35,0.6,0.45,0.7,0.5].map((y,i,arr)=>({ x: i/(arr.length-1), y }));

    onMount(async () => {
        await Promise.all([
            loadMindTasks(),
            loadStats()
        ]);
    });

    async function loadMindTasks() {
        isLoadingTasks = true;
        try {
            tasks = await getMindTasks(authStore);
            console.log('Tareas obtenidas:', tasks);
        } finally {
            isLoadingTasks = false;
        }
    }

    async function loadStats() {
        isLoadingStats = true;
        
        try {
            const latestSnapshot = await getLatestSnapshot(authStore);
            
            if (latestSnapshot) {
                snapshot = latestSnapshot;
                
                // Actualizar métricas de mind
                scoreMind = latestSnapshot.score_mind ?? 0;
                attention = latestSnapshot.attention ?? 0;
                
                // El fillLevel para el cerebro es el score_mind
                fillLevel = scoreMind;
                
                console.log('Mind stats cargadas:', { scoreMind, attention, fillLevel });
            } else {
                console.log('No hay snapshots disponibles');
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            isLoadingStats = false;
        }
    }

    async function handleTaskDone(e: CustomEvent<{ id: string }>) {
        const taskId = e.detail.id;
        const task = tasks.find(t => t.id === taskId);
        const points = task?.points ?? 30;
        
        console.log('Completando tarea mental:', taskId);
        
        const success = await completeTask(authStore, taskId, 'mind');
        
        if (success) {
            console.log('Tarea completada exitosamente');
            toastStore.success('¡Tarea completada!', points);
            // Recargar las tareas para actualizar la lista
            await loadMindTasks();
            await loadStats();
        } else {
            console.error('Error al completar la tarea');
            toastStore.error('Error al completar la tarea');
        }
    }
    
    async function handleAddTaskClick() {
        showRecommendationsModal = true;
        isLoadingRecommendations = true;
        
        try {
            // Usar IA para recomendaciones más inteligentes
            const response = await getMindRecommendations(authStore, 3, true);
            if (response && response.recommendations) {
                recommendations = response.recommendations;
                console.log(`Using ${response.method} recommendations`);
            } else {
                recommendations = [];
                toastStore.error('No recommendations available');
            }
        } catch (error) {
            console.error('Error loading recommendations:', error);
            toastStore.error('Error loading recommendations');
            recommendations = [];
        } finally {
            isLoadingRecommendations = false;
        }
    }
    
    async function handleRecommendationSelect(e: CustomEvent<TaskRecommendation>) {
        const recommendation = e.detail;
        console.log('Selected recommendation:', recommendation);
        
        const success = await createTaskFromRecommendation(authStore, recommendation);
        
        if (success) {
            toastStore.success('Task added successfully!', recommendation.reward_xp);
            showRecommendationsModal = false;
            // Recargar las tareas
            await loadMindTasks();
        } else {
            toastStore.error('Error adding task');
        }
    }
    
    async function handleCustomTaskCreate(e: CustomEvent<{
        name: string;
        desc: string;
        reward_xp: number;
        estimated_minutes: number;
    }>) {
        const taskData = e.detail;
        console.log('Creating custom task:', taskData);
        
        const success = await createCustomTask(authStore, 'mind', taskData);
        
        if (success) {
            toastStore.success('Custom task created!', taskData.reward_xp);
            showRecommendationsModal = false;
            // Recargar las tareas
            await loadMindTasks();
        } else {
            toastStore.error('Error creating custom task');
        }
    }
    
    function handleModalClose() {
        showRecommendationsModal = false;
    }
</script>

<!-- Vista mobile-only -->
<div class="md:hidden h-[calc(100dvh-4rem)] overflow-hidden">
    <!-- Layout vertical sin scroll -->
    <div class="flex flex-col h-full">
        <!-- 1) Carrusel de tareas -->
        <div class="shrink-0 z-0">
            <TaskCarousel 
                title="Missio" 
                {tasks}
                isLoading={isLoadingTasks}
                category="mind"
                on:done={handleTaskDone}
                on:addTask={handleAddTaskClick}
            />
        </div>

        <!-- 2) Cerebro responsivo al centro -->
        <div class="flex-1 px-4 flex items-center justify-center">
            <div class="w-96  h-80">
                <Brain {fillLevel} />
            </div>
        </div>

        <!-- 3) Gráfica de métricas -->
        <div class="shrink-0 mb-16 px-4 pb-2">
            <MetricsChart data={chartData} />
        </div>
    </div>
    
    <!-- Add Task Button -->
    <AddTaskButton position="bottom-right" color="purple" on:click={handleAddTaskClick} />
    
    <!-- Nota: El menú móvil global ya está en el layout (altura 4rem) -->
</div>

<!-- Vista escritorio -->
<div class="hidden md:block bg-neutral-950">
    <div class="max-w-6xl mx-auto p-8">
            <h1 class="text-4xl font-bold text-white mb-8">Mind Analytics</h1>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Columna izquierda: Brain visualization -->
                <div class="flex flex-col gap-6">
                    <div class="w-full max-w-md mx-auto aspect-square">
                        <Brain {fillLevel} />
                    </div>
                    
                    <!-- Metrics Chart -->
                    <div class="w-full">
                        <h2 class="text-lg font-semibold text-white mb-4">Performance Metrics</h2>
                        <svg viewBox="0 0 360 120" class="w-full h-40">
                            <defs>
                                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#22c55e" stop-opacity="0.6"/>
                                    <stop offset="100%" stop-color="#16a34a" stop-opacity="0.1"/>
                                </linearGradient>
                            </defs>
                            <rect x="0" y="0" width="100%" height="100%" rx="12" class="fill-neutral-900 stroke-white/10" />
                            {#each chartData as point, i}
                                {@const x = 12 + point.x * (360 - 24)}
                                {@const y = 12 + (1 - point.y) * (120 - 24)}
                                {#if i === 0}
                                    <path d="M {x} {y}" class="stroke-green-400 fill-none" stroke-width="2" />
                                {:else}
                                    {@const prevPoint = chartData[i-1]}
                                    {@const prevX = 12 + prevPoint.x * (360 - 24)}
                                    {@const prevY = 12 + (1 - prevPoint.y) * (120 - 24)}
                                    <line x1={prevX} y1={prevY} x2={x} y2={y} class="stroke-green-400" stroke-width="2" />
                                {/if}
                            {/each}
                            {#each [1,2,3] as i}
                                <line x1="0" x2="100%" y1={(120/4)*i} y2={(120/4)*i} class="stroke-white/5" />
                            {/each}
                        </svg>
                    </div>
                </div>
                
                <!-- Columna derecha: Tasks carousel y additional info -->
                <div class="flex flex-col gap-6">
                    <div>
                        <h2 class="text-lg font-semibold text-white mb-4">Mind Missions</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {#if isLoadingTasks}
                                <!-- Skeleton Loader -->
                                {#each Array(4) as _, i}
                                    <div class="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-neutral-800 to-neutral-900 animate-pulse">
                                        <div class="flex items-center mb-2">
                                            <div class="w-8 h-8 bg-neutral-700 rounded-full"></div>
                                        </div>
                                        <div class="h-4 bg-neutral-700 rounded w-3/4 mb-2"></div>
                                        <div class="h-3 bg-neutral-700 rounded w-full mb-1"></div>
                                        <div class="h-3 bg-neutral-700 rounded w-1/2 mt-2"></div>
                                        <div class="mt-2 flex items-center justify-between">
                                            <div class="flex gap-1">
                                                {#each Array(5) as _}
                                                    <div class="w-3 h-3 bg-neutral-700 rounded-full"></div>
                                                {/each}
                                            </div>
                                            <div class="h-3 bg-neutral-700 rounded w-10"></div>
                                        </div>
                                    </div>
                                {/each}
                            {:else if tasks.length === 0}
                                <div class="col-span-full flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-neutral-900/50">
                                    <div class="text-6xl mb-4">🧠</div>
                                    <h3 class="text-xl font-semibold text-white mb-2">No Mind Missions Yet</h3>
                                    <p class="text-neutral-400 text-center mb-6 max-w-md">Boost your mental power! Add your first mind mission to enhance your cognitive abilities and earn rewards.</p>
                                    <button 
                                        class="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold text-lg shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                                        onclick={handleAddTaskClick}
                                    >
                                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                        Add Mind Mission
                                    </button>
                                </div>
                            {:else}
                                {#each tasks as task (task.id)}
                                    {@const icon = task.icon ?? '⭐'}
                                    {@const duration = task.durationMinutes ?? 30}
                                    {@const points = task.points ?? 30}
                                    {@const rating = Math.min(5, Math.max(0, task.rating ?? 0))}
                                    <div 
                                        class="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 transition-colors cursor-pointer relative"
                                        role="button"
                                        tabindex="0"
                                        aria-label={`Abrir ${task.title}`}
                                        onclick={() => goto(`/tasks/${task.id}`)}
                                        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goto(`/tasks/${task.id}`); } }}
                                    >
                                        <button 
                                            aria-label="Done" 
                                            class="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 border-2 border-emerald-400/50 text-white flex items-center justify-center shadow-lg hover:shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-200 hover:rotate-12 z-10" 
                                            onclick={(e) => { e.stopPropagation(); handleTaskDone(new CustomEvent('done', { detail: { id: task.id } })); }}
                                        >
                                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                        </button>
                                        <div class="flex items-center mb-2">
                                            <span class="text-2xl">{icon}</span>
                                        </div>
                                        <div class="text-sm font-semibold text-white mb-1">{task.title}</div>
                                        {#if task.summary}
                                            <div class="text-xs text-neutral-400">{task.summary}</div>
                                        {/if}
                                        <div class="text-xs text-neutral-500 mt-1">Time: {duration}m</div>
                                        <div class="mt-2 flex items-center justify-between">
                                            <div class="flex items-center gap-0.5">
                                                {#each Array(5) as _, idx}
                                                    <svg class={`w-3 h-3 ${idx < rating ? 'text-yellow-300' : 'text-neutral-600'}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                                                    </svg>
                                                {/each}
                                            </div>
                                            <span class="text-xs text-emerald-300 font-bold">+{points}</span>
                                        </div>
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Add Task Button for Desktop -->
        <AddTaskButton position="bottom-right" color="purple" on:click={handleAddTaskClick} />
</div>

<!-- Task Recommendation Modal -->
<TaskRecommendationModal 
    bind:isOpen={showRecommendationsModal}
    {recommendations}
    category="mind"
    isLoading={isLoadingRecommendations}
    on:select={handleRecommendationSelect}
    on:createCustom={handleCustomTaskCreate}
    on:close={handleModalClose}
/>
