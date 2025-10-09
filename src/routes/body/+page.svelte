<script lang="ts">
    import TaskCarousel from '../../lib/components/TaskCarousel.svelte';
    import StatsCard from '../../lib/components/StatsCard.svelte';
    import HealthBar from '../../lib/components/HealthBar.svelte';
    import ProgressRing from '../../lib/components/ProgressRing.svelte';
    import Body from './Body.svelte';
    import AddTaskButton from '../../lib/components/AddTaskButton.svelte';
    import TaskRecommendationModal from '../../lib/components/TaskRecommendationModal.svelte';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { getAuthContext } from '$lib/stores/auth.svelte';
    import { getBodyTasks, completeTask, type Task } from '$lib/services/tasks';
    import { getLatestSnapshot, type PerformanceSnapshot } from '$lib/services/stats';
    import { getBodyRecommendations, createTaskFromRecommendation, type TaskRecommendation } from '$lib/services/recommendations';
    import { toastStore } from '$lib/stores/toast.svelte';

    let bodyTasks = $state<Task[]>([]);
    let snapshot = $state<PerformanceSnapshot | null>(null);
    let isLoadingStats = $state(true);
    let isLoadingTasks = $state(true);
    
    // Recommendations state
    let showRecommendationsModal = $state(false);
    let recommendations = $state<TaskRecommendation[]>([]);
    let isLoadingRecommendations = $state(false);

    // Stats iniciales (valores por defecto si no hay snapshot)
    let energy = $state(0);
    let stamina = $state(0);
    let strength = $state(0);
    let flexibility = $state(0);
    let scoreBody = $state(0);
    let attention = $state(0);
    
    let caloriesBurned = $state('0');
    let stepsDailyValue = $state('0');
    let heartRate = $state('0');
    let sleepScore = $state('0');
    
    let dailyProgress = 65;
    let weeklyGoal = 280;
    let weeklyProgress = 165;

    // Obtener authStore una vez al inicializar el componente
    const authStore = getAuthContext();

    onMount(async () => {
        await Promise.all([
            loadBodyTasks(),
            loadStats()
        ]);
    });

    async function loadBodyTasks() {
        isLoadingTasks = true;
        try {
            bodyTasks = await getBodyTasks(authStore);
            console.log('Body tasks obtenidas:', bodyTasks);
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
                
                // Actualizar métricas de body
                energy = latestSnapshot.energy ?? 0;
                stamina = latestSnapshot.stamina ?? 0;
                strength = latestSnapshot.strength ?? 0;
                flexibility = latestSnapshot.flexibility ?? 0;
                scoreBody = latestSnapshot.score_body ?? 0;
                attention = latestSnapshot.attention ?? 0;
                
                // Actualizar stats cards
                caloriesBurned = latestSnapshot.calories_burned ?? '0';
                stepsDailyValue = latestSnapshot.steps_daily ?? '0';
                heartRate = latestSnapshot.heart_rate ?? '0';
                sleepScore = latestSnapshot.sleep_score ?? '0';
                
                console.log('Stats cargadas:', latestSnapshot);
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
        const task = bodyTasks.find(t => t.id === taskId);
        const points = task?.points ?? 50;
        
        console.log('Completando tarea física:', taskId);
        
        const success = await completeTask(authStore, taskId, 'body');
        
        if (success) {
            console.log('Tarea completada exitosamente');
            toastStore.success('¡Tarea completada!', points);
            // Recargar las tareas para actualizar la lista
            await loadBodyTasks();
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
            const response = await getBodyRecommendations(authStore, 3, false);
            if (response && response.recommendations) {
                recommendations = response.recommendations;
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
            await loadBodyTasks();
        } else {
            toastStore.error('Error adding task');
        }
    }
    
    function handleModalClose() {
        showRecommendationsModal = false;
    }
</script>

<!-- Vista mobile-only -->
<div class="md:hidden h-[calc(100dvh-4rem)] overflow-hidden bg-neutral-950">
    <div class="flex flex-col h-full">
        <!-- 1) Carrusel de tareas físicas -->
        <div class="shrink-0">
            <TaskCarousel title="Physical Tasks" tasks={bodyTasks} on:done={handleTaskDone} />
        </div>

        <!-- 2) Imagen del cuerpo y stats principales -->
        <div class="flex-1 px-4 py-2 flex flex-col gap-4 overflow-y-auto">
            <!-- Contenedor de imagen y barras de salud -->
            <div class="relative flex flex-col items-center">
                <!-- Body component con altura controlada -->
                <div class="w-full max-w-sm aspect-[3/4] mx-auto">
                   <Body energy={energy} stamina={stamina} fillLevel={scoreBody} />
                </div>

                <!-- Health bars alrededor -->
                <div class="w-full mt-4 space-y-2">
                    <HealthBar value={energy} max={100} label="Energy" color="green" />
                    <HealthBar value={stamina} max={100} label="Stamina" color="blue" />
                    <HealthBar value={strength} max={100} label="Strength" color="red" />
                    <HealthBar value={flexibility} max={100} label="Flexibility" color="yellow" />
                </div>
            </div>

            <!-- Progress rings -->
            <div class="flex justify-around py-2">
                <ProgressRing progress={dailyProgress} size={80} strokeWidth={6} label="Today" />
                <ProgressRing progress={(weeklyProgress/weeklyGoal)*100} size={80} strokeWidth={6} label="Week" sublabel="{weeklyProgress}/{weeklyGoal} pts" />
            </div>

            <!-- Stats cards -->
            <div class="grid grid-cols-2 gap-3 pb-4">
                <StatsCard title="Calories Burned" value={caloriesBurned} subtitle="Today" icon="🔥" trend="up" color="red" />
                <StatsCard title="Steps" value={stepsDailyValue} subtitle="Goal: 10,000" icon="👟" trend="neutral" color="blue" />
                <StatsCard title="Heart Rate" value="{heartRate} bpm" subtitle="Resting" icon="❤️" trend="down" color="emerald" />
                <StatsCard title="Sleep Score" value="{sleepScore}%" subtitle="Last night" icon="💤" trend="up" color="amber" />
            </div>
        </div>
    </div>
    
    <!-- Add Task Button -->
    <AddTaskButton position="bottom-right" color="orange" on:click={handleAddTaskClick} />
</div>

<!-- Vista escritorio -->
<div class="hidden md:block bg-neutral-950">
    <div class="max-w-7xl mx-auto p-8">
            <h1 class="text-3xl font-bold text-white mb-8">Body Analytics</h1>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Columna izquierda: Body visualization -->
                <div class="flex flex-col gap-6">
                    <div class="w-full max-w-md mx-auto aspect-[3/4]">
                        <Body energy={energy} stamina={stamina} fillLevel={scoreBody} />
                    </div>
                    
                    <!-- Progress rings -->
                    <div class="flex justify-around">
                        <ProgressRing progress={dailyProgress} size={120} strokeWidth={8} label="Today" />
                        <ProgressRing progress={(weeklyProgress/weeklyGoal)*100} size={120} strokeWidth={8} label="Week" sublabel="{weeklyProgress}/{weeklyGoal} pts" />
                    </div>
                </div>
                
                <!-- Columna derecha: Stats y health bars -->
                <div class="flex flex-col gap-6">
                    <!-- Health bars -->
                    <div class="space-y-3">
                        <HealthBar value={energy} max={100} label="Energy" color="green" />
                        <HealthBar value={stamina} max={100} label="Stamina" color="blue" />
                        <HealthBar value={strength} max={100} label="Strength" color="red" />
                        <HealthBar value={flexibility} max={100} label="Flexibility" color="yellow" />
                    </div>
                    
                    <!-- Stats cards -->
                    <div class="grid grid-cols-2 gap-4">
                        <StatsCard title="Calories Burned" value={caloriesBurned} subtitle="Today" icon="🔥" trend="up" color="red" />
                        <StatsCard title="Steps" value={stepsDailyValue} subtitle="Goal: 10,000" icon="👟" trend="neutral" color="blue" />
                        <StatsCard title="Heart Rate" value="{heartRate} bpm" subtitle="Resting" icon="❤️" trend="down" color="emerald" />
                        <StatsCard title="Sleep Score" value="{sleepScore}%" subtitle="Last night" icon="💤" trend="up" color="amber" />
                    </div>
                    
                    <!-- Body Tasks Grid -->
                    <div>
                        <h2 class="text-lg font-semibold text-white mb-4">Physical Tasks</h2>
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
                            {:else if bodyTasks.length === 0}
                                <div class="col-span-full flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed border-orange-500/30 bg-gradient-to-br from-orange-950/20 to-neutral-900/50">
                                    <div class="text-6xl mb-4">🏃</div>
                                    <h3 class="text-xl font-semibold text-white mb-2">No Physical Tasks Yet</h3>
                                    <p class="text-neutral-400 text-center mb-6 max-w-md">Start your fitness journey! Add your first physical task to track your progress and earn rewards.</p>
                                    <button 
                                        class="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-lg shadow-lg hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                                        onclick={handleAddTaskClick}
                                    >
                                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                        Add Physical Task
                                    </button>
                                </div>
                            {:else}
                                {#each bodyTasks as task (task.id)}
                                    {@const icon = task.icon ?? '🏃'}
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
        <AddTaskButton position="bottom-right" color="orange" on:click={handleAddTaskClick} />
</div>

<!-- Task Recommendation Modal -->
<TaskRecommendationModal 
    bind:isOpen={showRecommendationsModal}
    {recommendations}
    category="body"
    isLoading={isLoadingRecommendations}
    on:select={handleRecommendationSelect}
    on:close={handleModalClose}
/>