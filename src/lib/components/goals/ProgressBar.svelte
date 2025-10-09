<script lang="ts">
    interface Props {
        progress: number;
        completedTasks: number;
        totalTasks: number;
    }

    let { progress, completedTasks, totalTasks }: Props = $props();

    const level = $derived(Math.floor(progress / 10) + 1);
    const progressInLevel = $derived(progress % 10);
    
    const progressColor = $derived(
        progress < 25 ? 'from-red-500 to-orange-500' :
        progress < 50 ? 'from-orange-500 to-amber-500' :
        progress < 75 ? 'from-amber-500 to-yellow-500' :
        'from-green-500 to-emerald-500'
    );

    const stars = $derived(Math.min(Math.floor(progress / 20), 5));
</script>

<div class="bg-neutral-900 rounded-2xl border border-white/10 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
            <span class="text-2xl">🎮</span>
            <div>
                <h3 class="text-white font-bold">Nivel {level}</h3>
                <p class="text-xs text-white/60">{completedTasks} de {totalTasks} tareas</p>
            </div>
        </div>
        <div class="flex items-center gap-1">
            {#each Array(5) as _, i}
                <span class="text-xl {i < stars ? 'text-yellow-400' : 'text-white/20'}">
                    {i < stars ? '⭐' : '☆'}
                </span>
            {/each}
        </div>
    </div>

    <!-- Progress Bar -->
    <div class="relative">
        <div class="h-8 bg-neutral-800 rounded-full overflow-hidden border border-white/10">
            <div 
                class="h-full bg-gradient-to-r {progressColor} transition-all duration-1000 ease-out relative"
                style="width: {progress}%"
            >
                <!-- Shine effect -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
        </div>
        
        <!-- Progress Text -->
        <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-white font-bold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {progress.toFixed(1)}%
            </span>
        </div>
    </div>

    <!-- XP Bar (next level) -->
    <div class="mt-3 flex items-center gap-2">
        <span class="text-xs text-white/60 font-medium">XP</span>
        <div class="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden border border-purple-500/30">
            <div 
                class="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
                style="width: {(progressInLevel * 10)}%"
            ></div>
        </div>
        <span class="text-xs text-white/60 font-medium">{Math.floor(progressInLevel * 10)}%</span>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-2 mt-4">
        <div class="bg-neutral-800/50 rounded-lg p-2 text-center border border-white/5">
            <div class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {level}
            </div>
            <div class="text-xs text-white/60">Nivel</div>
        </div>
        <div class="bg-neutral-800/50 rounded-lg p-2 text-center border border-white/5">
            <div class="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                {completedTasks}
            </div>
            <div class="text-xs text-white/60">Completadas</div>
        </div>
        <div class="bg-neutral-800/50 rounded-lg p-2 text-center border border-white/5">
            <div class="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {totalTasks - completedTasks}
            </div>
            <div class="text-xs text-white/60">Pendientes</div>
        </div>
    </div>
</div>

<style>
    @keyframes shimmer {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }

    .animate-shimmer {
        animation: shimmer 2s infinite;
    }
</style>
