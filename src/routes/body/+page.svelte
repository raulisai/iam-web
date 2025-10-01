<script lang="ts">
    import TaskCarousel from '../../lib/components/TaskCarousel.svelte';
    import StatsCard from '../../lib/components/StatsCard.svelte';
    import HealthBar from '../../lib/components/HealthBar.svelte';
    import ProgressRing from '../../lib/components/ProgressRing.svelte';
    import Body from './Body.svelte';

    // Datos de ejemplo para tareas físicas
    const bodyTasks = [
        { id: 'bt-1', title: 'Morning Stretch', durationMinutes: 15, points: 15, summary: 'Estiramiento matutino completo', rating: 4, icon: '🧘' },
        { id: 'bt-2', title: 'Cardio Session', durationMinutes: 30, points: 50, summary: '30 min de cardio moderado', rating: 5, icon: '🏃' },
        { id: 'bt-3', title: 'Strength Training', durationMinutes: 45, points: 60, summary: 'Rutina de fuerza upper body', rating: 3, icon: '💪' },
        { id: 'bt-4', title: 'Hydration Goal', durationMinutes: 5, points: 10, summary: 'Beber 2L de agua', rating: 5, icon: '💧' },
        { id: 'bt-5', title: 'Sleep 8 Hours', durationMinutes: 480, points: 100, summary: 'Descanso completo', rating: 4, icon: '😴' }
    ];

    // Stats de ejemplo
    let energy = 35;
    let stamina = 60;
    let strength = 45;
    let flexibility = 80;
    
    let dailyProgress = 65;
    let weeklyGoal = 280;
    let weeklyProgress = 165;

    function handleTaskDone(e: CustomEvent<{ id: string }>) {
        console.log('Tarea física completada:', e.detail.id);
        // Aquí actualizarías el estado o llamarías a tu API
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
<div class="hidden md:flex h-screen bg-neutral-950">
    <div class="flex-1 p-8 overflow-auto">
        <div class="max-w-7xl mx-auto">
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
                    
                    <!-- Task carousel -->
                    <div class="mt-4">
                        <TaskCarousel title="Physical Tasks" tasks={bodyTasks} on:done={handleTaskDone} />
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>