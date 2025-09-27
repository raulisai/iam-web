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
    export let goals: Goal[] = [];
    
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
</script>

<div class="relative">
    <!-- Línea vertical central -->
    <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/20 via-white/10 to-transparent"></div>
    
    <div class="space-y-8 relative">
        {#each goals as goal, i}
            <div class="flex items-center {i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}">
                <!-- Card -->
                <div class="w-5/12">
                    <div class="rounded-xl border border-white/10 bg-neutral-900/60 p-3 relative">
                        <div class="absolute -top-2 -right-2 text-xl">{statusIcons[goal.status]}</div>
                        <div class="flex items-center gap-2 mb-2">
                            <div class="w-2 h-2 rounded-full {typeColors[goal.type]}"></div>
                            <span class="text-[10px] text-white/50 uppercase">{goal.type} term</span>
                        </div>
                        <h3 class="text-sm font-semibold text-white mb-1">{goal.title}</h3>
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
        {/each}
    </div>
</div>
