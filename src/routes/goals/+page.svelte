<script lang="ts">
    import Timeline from '../../lib/components/Timeline.svelte';
    import type { Goal } from '../../lib/components/Timeline.svelte';
    import StatsCard from '../../lib/components/StatsCard.svelte';
    import AddGoalForm from './AddGoalForm.svelte';

    const goals: Goal[] = [
        {
            id: 'g1',
            title: 'Complete 5 workouts',
            description: 'Mantener rutina de ejercicio esta semana',
            deadline: '2024-01-07',
            status: 'in-progress',
            points: 50,
            type: 'short',
            progress: 60
        },
        {
            id: 'g2',
            title: 'Learn TypeScript',
            description: 'Completar curso y proyecto personal',
            deadline: '2024-02-15',
            status: 'in-progress',
            points: 200,
            type: 'medium',
            progress: 35
        },
        {
            id: 'g3',
            title: 'Save $10,000',
            description: 'Fondo de emergencia completo',
            deadline: '2024-06-30',
            status: 'pending',
            points: 500,
            type: 'long',
            progress: 15
        },
        {
            id: 'g4',
            title: 'Read 12 books',
            description: 'Un libro por mes durante 2024',
            deadline: '2024-12-31',
            status: 'in-progress',
            points: 300,
            type: 'long',
            progress: 8
        },
        {
            id: 'g5',
            title: 'Meditate daily',
            description: '10 minutos cada mañana',
            deadline: '2024-01-14',
            status: 'in-progress',
            points: 30,
            type: 'short',
            progress: 85
        }
    ];

    // Estadísticas de goals
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const totalPoints = goals.reduce((sum, g) => sum + g.points, 0);
    const earnedPoints = goals
        .filter(g => g.status === 'completed')
        .reduce((sum, g) => sum + g.points, 0);

    function handleGoalSubmit(event: CustomEvent) {
        console.log('New goal submitted:', event.detail);
        // TODO: Add to goals array or send to server
    }
</script>

<!-- Vista mobile-only -->
<div class="md:hidden h-[calc(100dvh-4rem)] overflow-hidden bg-neutral-950">
    <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-white/10">
            <h1 class="text-xl font-bold text-white">Goals Timeline</h1>
            <p class="text-xs text-white/60 mt-1">Track your short, medium and long term goals</p>
        </div>

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

        <!-- Timeline scroll -->
        <div class="flex-1 overflow-y-auto px-4 pb-4">
            <Timeline {goals} />
        </div>

        <!-- Add Goal Form -->
        <AddGoalForm on:submit={handleGoalSubmit} />
    </div>
</div>

<!-- Vista escritorio -->
<div class="hidden md:flex h-screen bg-neutral-950">
    <div class="flex-1 overflow-y-auto">
        <div class="max-w-6xl mx-auto p-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-4xl font-bold text-white">Goals Timeline</h1>
                <p class="text-sm text-white/60 mt-2">Track your short, medium and long term goals</p>
            </div>

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

            <!-- Timeline -->
            <div class="mb-8">
                <Timeline {goals} />
            </div>

            <!-- Add Goal Form -->
            <AddGoalForm on:submit={handleGoalSubmit} />
        </div>
    </div>
</div>