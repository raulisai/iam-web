<script lang="ts">
    import TaskCarousel from '../../lib/components/TaskCarousel.svelte';
    import StatsCard from '../../lib/components/StatsCard.svelte';
    import HealthBar from '../../lib/components/HealthBar.svelte';
    import ProgressRing from '../../lib/components/ProgressRing.svelte';
    import Body from './Body.svelte';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { getAuthContext } from '$lib/stores/auth.svelte';
    import { getBodyTasks, completeTask, type Task } from '$lib/services/tasks';

    let bodyTasks = $state<Task[]>([]);

    // Stats de ejemplo
    let energy = 35;
    let stamina = 60;
    let strength = 45;
    let flexibility = 80;
    
    let dailyProgress = 65;
    let weeklyGoal = 280;
    let weeklyProgress = 165;

    onMount(async () => {
        const authStore = getAuthContext();
        await loadBodyTasks();
    });

    async function loadBodyTasks() {
        const authStore = getAuthContext();
        bodyTasks = await getBodyTasks(authStore);
        console.log('Body tasks obtenidas:', bodyTasks);
    }

    async function handleTaskDone(e: CustomEvent<{ id: string }>) {
        const authStore = getAuthContext();
        const taskId = e.detail.id;
        console.log('Completando tarea física:', taskId);
        
        const success = await completeTask(authStore, taskId, 'body');
        
        if (success) {
            console.log('Tarea completada exitosamente');
            // Recargar las tareas para actualizar la lista
            await loadBodyTasks();
        } else {
            console.error('Error al completar la tarea');
        }
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
                   <Body energy={energy} stamina={stamina} fillLevel={energy} />
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
                <StatsCard title="Calories Burned" value="450" subtitle="Today" icon="🔥" trend="up" color="red" />
                <StatsCard title="Steps" value="8,234" subtitle="Goal: 10,000" icon="👟" trend="neutral" color="blue" />
                <StatsCard title="Heart Rate" value="72 bpm" subtitle="Resting" icon="❤️" trend="down" color="emerald" />
                <StatsCard title="Sleep Score" value="85%" subtitle="Last night" icon="💤" trend="up" color="amber" />
            </div>
        </div>
    </div>
</div>

<!-- Vista escritorio -->
<div class="hidden md:block bg-neutral-950">
    <div class="max-w-7xl mx-auto p-8">
            <h1 class="text-3xl font-bold text-white mb-8">Body Analytics</h1>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Columna izquierda: Body visualization -->
                <div class="flex flex-col gap-6">
                    <div class="w-full max-w-md mx-auto aspect-[3/4]">
                        <Body energy={energy} stamina={stamina} fillLevel={energy} />
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
                        <StatsCard title="Calories Burned" value="450" subtitle="Today" icon="🔥" trend="up" color="red" />
                        <StatsCard title="Steps" value="8,234" subtitle="Goal: 10,000" icon="👟" trend="neutral" color="blue" />
                        <StatsCard title="Heart Rate" value="72 bpm" subtitle="Resting" icon="❤️" trend="down" color="emerald" />
                        <StatsCard title="Sleep Score" value="85%" subtitle="Last night" icon="💤" trend="up" color="amber" />
                    </div>
                    
                    <!-- Body Tasks Grid -->
                    <div>
                        <h2 class="text-lg font-semibold text-white mb-4">Physical Tasks</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {#if bodyTasks.length === 0}
                                {#each Array(6) as _, i}
                                    <div class="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-neutral-800 to-neutral-900">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-2xl">🏃</span>
                                            <span class="text-xs text-emerald-300 font-semibold">+50</span>
                                        </div>
                                        <div class="text-sm font-semibold text-white mb-1">Physical Task {i + 1}</div>
                                        <div class="text-xs text-neutral-400">Complete body exercise</div>
                                        <div class="text-xs text-neutral-500 mt-1">Time: 30m</div>
                                    </div>
                                {/each}
                            {:else}
                                {#each bodyTasks as task (task.id)}
                                    {@const icon = task.icon ?? '🏃'}
                                    {@const duration = task.durationMinutes ?? 30}
                                    {@const points = task.points ?? 30}
                                    {@const rating = Math.min(5, Math.max(0, task.rating ?? 0))}
                                    <div 
                                        class="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 transition-colors cursor-pointer"
                                        role="button"
                                        tabindex="0"
                                        aria-label={`Abrir ${task.title}`}
                                        on:click={() => goto(`/tasks/${task.id}`)}
                                        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goto(`/tasks/${task.id}`); } }}
                                    >
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-2xl">{icon}</span>
                                            <span class="text-xs text-emerald-300 font-semibold">+{points}</span>
                                        </div>
                                        <div class="text-sm font-semibold text-white mb-1">{task.title}</div>
                                        {#if task.summary}
                                            <div class="text-xs text-neutral-400">{task.summary}</div>
                                        {/if}
                                        <div class="text-xs text-neutral-500 mt-1">Time: {duration}m</div>
                                        <div class="mt-2 flex items-center gap-0.5">
                                            {#each Array(5) as _, idx}
                                                <svg class={`w-3 h-3 ${idx < rating ? 'text-yellow-300' : 'text-neutral-600'}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                                                </svg>
                                            {/each}
                                        </div>
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>
</div>