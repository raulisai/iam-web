<script lang="ts">
    import { onMount } from 'svelte';
    import Timeline from '../../lib/components/Timeline.svelte';
    import type { Goal as TimelineGoal } from '../../lib/components/Timeline.svelte';
    import StatsCard from '../../lib/components/StatsCard.svelte';
    import AddGoalForm from './AddGoalForm.svelte';
    import { fetchGoals, createGoal } from '../../lib/services/goals';
    import { getAuthStore } from '../../lib/stores/auth.svelte';

    // Define the ApiGoal type locally
    type ApiGoal = {
        id: string;
        title: string;
        description: string;
        type: 'short' | 'medium' | 'long';
        start_date: string;
        end_date?: string | null;
        progress: number;
    };

    // Define the CreateGoalData type locally
    type CreateGoalData = {
        title: string;
        description: string;
        type: 'short' | 'medium' | 'long';
        start_date: string;
        end_date?: string;
        progress?: number;
        metric_key: string;  // Added required property
        target_value: number;  // Added required property
    };

    const authStore = getAuthStore();
    
    let goals: TimelineGoal[] = [];
    let isLoading = true;
    let error = '';

    // Función para convertir goals de API a formato Timeline
    function mapApiGoalToTimeline(apiGoal: ApiGoal): TimelineGoal {
        // Calcular puntos basados en el tipo de goal
        const pointsMap = { short: 50, medium: 200, long: 500 };
        const points = pointsMap[apiGoal.type] || 100;

        // Determinar status basado en progreso
        let status: 'pending' | 'in-progress' | 'completed' = 'pending';
        if (apiGoal.progress >= 100) {
            status = 'completed';
        } else if (apiGoal.progress > 0) {
            status = 'in-progress';
        }

        return {
            id: apiGoal.id,
            title: apiGoal.title,
            description: apiGoal.description,
            deadline: apiGoal.end_date || apiGoal.start_date,
            status,
            points,
            type: apiGoal.type,
            progress: apiGoal.progress
        };
    }

    async function loadGoals() {
        isLoading = true;
        error = '';
        
        try {
            const token = authStore.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const apiGoals = await fetchGoals(token, true); // Only active goals
            goals = apiGoals.map(mapApiGoalToTimeline);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load goals';
            console.error('Error loading goals:', err);
        } finally {
            isLoading = false;
        }
    }

    async function handleGoalSubmit(event: CustomEvent<any>) {
        try {
            // If the event just contains reload flag, reload the goals
            if (event.detail?.reload) {
                await loadGoals();
                return;
            }

            const token = authStore.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const { tasks: goalTasks, ...goalData } = event.detail;

            // Add missing required properties if not provided in the event
            const completeGoalData = {
                ...goalData,
                metric_key: goalData.metric_key || 'completion',  // Default value
                target_value: goalData.target_value || 100,  // Default value
                // Convert progress to string if it exists
                progress: goalData.progress !== undefined ? String(goalData.progress) : undefined
            };

            // Create the goal first
            const newGoal = await createGoal(token, completeGoalData);
            
            // Then create tasks if any
            if (goalTasks && goalTasks.length > 0) {
                try {
                    // Import createGoalTask dynamically
                    const { createGoalTask } = await import('../../lib/services/goalTasks');
                    
                    // Create all tasks in parallel
                    await Promise.all(
                        goalTasks.map((task: any) => createGoalTask(token, newGoal.id, task))
                    );
                } catch (taskErr) {
                    console.error('Error creating tasks:', taskErr);
                    // Don't fail the whole operation if tasks fail
                    error = 'Goal created but some tasks failed to save';
                }
            }
            
            // Add new goal to the list
            goals = [...goals, mapApiGoalToTimeline(newGoal)];
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to create goal';
            console.error('Error creating goal:', err);
        }
    }

    // Estadísticas de goals
    $: totalGoals = goals.length;
    $: completedGoals = goals.filter(g => g.status === 'completed').length;
    $: totalPoints = goals.reduce((sum, g) => sum + g.points, 0);
    $: earnedPoints = goals
        .filter(g => g.status === 'completed')
        .reduce((sum, g) => sum + g.points, 0);

    onMount(() => {
        loadGoals();
    });
</script>

<!-- Vista mobile-only -->
<div class="md:hidden h-[calc(100dvh-4rem)] overflow-hidden bg-neutral-950">
    <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-white/10">
            <h1 class="text-xl font-bold text-white">Goals Timeline</h1>
            <p class="text-xs text-white/60 mt-1">Track your short, medium and long term goals</p>
        </div>

        <!-- Error message -->
        {#if error}
        <div class="mx-4 mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200 text-sm">
            {error}
            <button on:click={() => error = ''} class="float-right text-red-200 hover:text-white">✕</button>
        </div>
        {/if}

        <!-- Stats cards -->
        <div class="px-4 py-3">
            <div class="grid grid-cols-2 gap-3">
                <StatsCard 
                    title="Active Goals" 
                    value={totalGoals} 
                    icon="🎯" 
                    color="blue"
                />
                <StatsCard 
                    title="Points Available" 
                    value={totalPoints} 
                    subtitle={`Earned: ${earnedPoints}`}
                    icon="⭐" 
                    color="amber"
                />
            </div>
        </div>

        <!-- Loading state -->
        {#if isLoading}
        <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
                <div class="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-2"></div>
                <p class="text-white/60">Loading goals...</p>
            </div>
        </div>
        {:else if goals.length === 0}
        <!-- Empty state -->
        <div class="flex-1 flex items-center justify-center px-4">
            <div class="text-center">
                <div class="text-6xl mb-4">🎯</div>
                <h3 class="text-lg font-semibold text-white mb-2">No goals yet</h3>
                <p class="text-white/60 text-sm">Create your first goal to get started!</p>
            </div>
        </div>
        {:else}
        <!-- Timeline scroll -->
        <div class="flex-1 overflow-y-auto px-4 pb-4">
            <Timeline {goals} />
        </div>
        {/if}

        <!-- Add Goal Form -->
        <AddGoalForm on:submit={handleGoalSubmit} />
    </div>
</div>

<!-- Vista escritorio -->
<div class="hidden md:block bg-neutral-950">
    <div class="max-w-6xl mx-auto p-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-4xl font-bold text-white">Goals Timeline</h1>
                <p class="text-sm text-white/60 mt-2">Track your short, medium and long term goals</p>
            </div>

            <!-- Error message -->
            {#if error}
            <div class="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-md text-red-200">
                {error}
                <button on:click={() => error = ''} class="float-right text-red-200 hover:text-white">✕</button>
            </div>
            {/if}

            <!-- Stats cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatsCard 
                    title="Active Goals" 
                    value={totalGoals} 
                    icon="🎯" 
                    color="blue"
                />
                <StatsCard 
                    title="Completed" 
                    value={completedGoals} 
                    icon="✅" 
                    color="emerald"
                />
                <StatsCard 
                    title="Points Available" 
                    value={totalPoints} 
                    icon="⭐" 
                    color="amber"
                />
                <StatsCard 
                    title="Earned Points" 
                    value={earnedPoints} 
                    icon="💎" 
                    color="blue"
                />
            </div>

            <!-- Loading state -->
            {#if isLoading}
            <div class="flex items-center justify-center py-20">
                <div class="text-center">
                    <div class="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                    <p class="text-white/60 text-lg">Loading goals...</p>
                </div>
            </div>
            {:else if goals.length === 0}
            <!-- Empty state -->
            <div class="flex items-center justify-center py-20">
                <div class="text-center">
                    <div class="text-8xl mb-6">🎯</div>
                    <h3 class="text-2xl font-semibold text-white mb-3">No goals yet</h3>
                    <p class="text-white/60">Create your first goal to start tracking your progress!</p>
                </div>
            </div>
            {:else}
            <!-- Timeline -->
            <div class="mb-8">
                <Timeline {goals} />
            </div>
            {/if}

            <!-- Add Goal Form -->
            <AddGoalForm on:submit={handleGoalSubmit} />
        </div>
</div>