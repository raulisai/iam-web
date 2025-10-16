<script context="module" lang="ts">
    export type Goal = {
        id: string;
        title: string;
        description?: string;
        deadline: string;
        status: 'pending' | 'in-progress' | 'completed' | 'failed';
        points: number;
        type: 'short' | 'medium' | 'long';
        progress?: number;
    };
</script>

<script lang="ts">
    import { slide } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { fetchGoalTasks, fetchCompletedTaskIds } from '../services/goalTasks';
    import type { GoalTask } from '../types';
    import { getAuthStore } from '../stores/auth.svelte';
    
    export let goals: Goal[] = [];
    
    const authStore = getAuthStore();
    
    const typeColors = {
        short: 'bg-blue-500',
        medium: 'bg-amber-500', 
        long: 'bg-purple-500'
    };
    
    const statusIcons = {
        pending: '⏳',
        'in-progress': '🚀',
        completed: '✅',
        failed: '❌'
    };
    
    const priorityColors: Record<string, string> = {
        low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        high: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    
    type TaskPriority = 'low' | 'medium' | 'high';
    
    // Track expanded goals and their tasks
    let expandedGoals: Record<string, boolean> = {};
    let goalTasks: Record<string, any[]> = {};
    let loadingTasks: Record<string, boolean> = {};
    
    async function toggleGoalTasks(goalId: string) {
        expandedGoals[goalId] = !expandedGoals[goalId];
        
        // Load tasks if expanding and not already loaded
        if (expandedGoals[goalId] && !goalTasks[goalId]) {
            loadingTasks[goalId] = true;
            try {
                const token = authStore.getToken();
                if (!token) {
                    throw new Error('No authentication token found');
                }
                
                const tasks = await fetchGoalTasks(token, goalId);
                
                // Load occurrences and filter out completed tasks
                try {
                    const completedTaskIds = await fetchCompletedTaskIds(token, tasks);
                    // Filter out completed tasks from timeline
                    goalTasks[goalId] = tasks.filter(task => !completedTaskIds.has(task.id || ''));
                } catch (err) {
                    console.log('Could not load occurrences, showing all tasks:', err);
                    // If occurrences can't be loaded, show all tasks
                    goalTasks[goalId] = tasks;
                }
            } catch (err) {
                console.error('Error loading tasks for goal', goalId, ':', err);
                goalTasks[goalId] = [];
            } finally {
                loadingTasks[goalId] = false;
            }
        }
    }
</script>

<div class="relative">
    <!-- Línea vertical central -->
    <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/20 via-white/10 to-transparent"></div>
    
    <div class="space-y-8 relative">
        {#each goals as goal, i}
            <div class="mb-8">
                <div class="flex items-center {i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}">
                    <!-- Card -->
                    <div class="w-5/12">
                        <div class="rounded-xl border border-white/10 bg-neutral-900/60 relative">
                            <a href="/goals/{goal.id}" class="block p-3 hover:bg-neutral-900/80 transition-all cursor-pointer group rounded-t-xl">
                                <div class="absolute -top-2 -right-2 text-xl">{statusIcons[goal.status]}</div>
                                <div class="flex items-center gap-2 mb-2">
                                    <div class="w-2 h-2 rounded-full {typeColors[goal.type]}"></div>
                                    <span class="text-[10px] text-white/50 uppercase">{goal.type} term</span>
                                </div>
                                <h3 class="text-sm font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">{goal.title}</h3>
                                {#if goal.description}
                                    <p class="text-[11px] text-white/60 mb-2">{goal.description}</p>
                                {/if}
                                <div class="flex items-center justify-between text-[10px]">
                                    <span class="text-white/50">📅 {goal.deadline}</span>
                                    <span class="text-emerald-400 font-semibold">+{goal.points} pts</span>
                                </div>
                                {#if goal.progress !== undefined}
                                    <div class="mt-2">
                                        <div class="h-1 bg-neutral-700 rounded-full overflow-hidden">
                                            <div class="h-full bg-gradient-to-r from-emerald-400 to-emerald-500" style="width: {goal.progress}%"></div>
                                        </div>
                                        <div class="text-[9px] text-white/40 mt-1">{goal.progress}% completo</div>
                                    </div>
                                {/if}
                            </a>
                            
                            <!-- Tasks accordion toggle -->
                            <button
                                type="button"
                                class="w-full px-3 py-2 border-t border-white/10 flex items-center justify-between text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all rounded-b-xl"
                                on:click={() => toggleGoalTasks(goal.id)}
                            >
                                <span class="flex items-center gap-2">
                                    <span>📋</span>
                                    <span>Tareas</span>
                                    {#if goalTasks[goal.id]}
                                        <span class="text-emerald-400">({goalTasks[goal.id].length})</span>
                                    {/if}
                                </span>
                                <svg 
                                    class="w-4 h-4 transition-transform duration-200 {expandedGoals[goal.id] ? 'rotate-180' : ''}"
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            <!-- Tasks list -->
                            {#if expandedGoals[goal.id]}
                                <div class="border-t border-white/10" transition:slide={{ duration: 300, easing: cubicOut }}>
                                    {#if loadingTasks[goal.id]}
                                        <div class="p-4 flex items-center justify-center">
                                            <div class="flex items-center gap-2 text-white/60">
                                                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span class="text-xs">Cargando tareas...</span>
                                            </div>
                                        </div>
                                    {:else if goalTasks[goal.id] && goalTasks[goal.id].length > 0}
                                        <div class="p-3 space-y-2 bg-neutral-900/40">
                                            {#each goalTasks[goal.id] as task, taskIndex}
                                                <div class="flex items-start gap-2 p-2 rounded-lg bg-neutral-800/40 border border-white/5 hover:border-white/10 transition-all">
                                                    <div class="flex-shrink-0 w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-white/40">
                                                        {taskIndex + 1}
                                                    </div>
                                                    <div class="flex-1 min-w-0">
                                                        <div class="flex items-center gap-2 mb-1">
                                                            <h4 class="text-xs font-semibold text-white">{task.title}</h4>
                                                            {#if task.priority}
                                                                <span class="px-1.5 py-0.5 rounded text-[9px] border {priorityColors[task.priority] || priorityColors.medium}">
                                                                    {task.priority}
                                                                </span>
                                                            {/if}
                                                        </div>
                                                        {#if task.description}
                                                            <p class="text-[10px] text-white/50 mb-1">{task.description}</p>
                                                        {/if}
                                                        <div class="flex items-center gap-3 text-[9px] text-white/40">
                                                            {#if task.estimated_duration}
                                                                <span>⏱️ {task.estimated_duration}</span>
                                                            {/if}
                                                            {#if task.type}
                                                                <span>📌 {task.type}</span>
                                                            {/if}
                                                            {#if task.required}
                                                                <span class="text-red-400">★ Requerida</span>
                                                            {/if}
                                                        </div>
                                                    </div>
                                                </div>
                                            {/each}
                                        </div>
                                    {:else}
                                        <div class="p-4 text-center">
                                            <div class="text-2xl mb-1">📝</div>
                                            <p class="text-[10px] text-white/50">No hay tareas definidas</p>
                                        </div>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    </div>
                    
                    <!-- Centro con punto -->
                    <div class="w-2/12 flex justify-center">
                        <div class="w-4 h-4 rounded-full {typeColors[goal.type]} border-2 border-neutral-950 relative z-10">
                            <div class="absolute inset-0 rounded-full {typeColors[goal.type]} animate-ping opacity-30"></div>
                        </div>
                    </div>
                    
                    <!-- Espacio vacío -->
                    <div class="w-5/12"></div>
                </div>
            </div>
        {/each}
    </div>
</div>
