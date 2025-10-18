<script lang="ts">
    import type { GoalTask } from '../../types';

    interface Props {
        task: GoalTask;
        isCompleted?: boolean;
        oncomplete?: (taskId: string) => void;
        onedit?: (taskId: string) => void;
        ondelete?: (taskId: string) => void;
    }

    let { task, isCompleted = false, oncomplete, onedit, ondelete }: Props = $props();

    const taskType = $derived((task.type || 'habit') as 'mind' | 'body' | 'habit' | 'one_off');
    const taskWeight = $derived((() => {
        const weight = task.weight ?? 1;
        return (typeof weight === 'number' && weight > 0 && isFinite(weight)) ? weight : 1;
    })());

    const typeColors = {
        mind: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
        body: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
        habit: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
        one_off: 'from-amber-500/20 to-amber-600/20 border-amber-500/30'
    };

    const typeIcons = {
        mind: '🧠',
        body: '💪',
        habit: '🔄',
        one_off: '⚡'
    };

    const typeLabels = {
        mind: 'Mental',
        body: 'Físico',
        habit: 'Hábito',
        one_off: 'Única'
    };

    let showMenu = $state(false);
    let isAnimating = $state(false);

    function handleComplete() {
        if (isCompleted) return;
        isAnimating = true;
        setTimeout(() => {
            oncomplete?.(task.id || '');
        }, 300);
    }

    function handleEdit() {
        showMenu = false;
        onedit?.(task.id || '');
    }

    function handleDelete() {
        showMenu = false;
        ondelete?.(task.id || '');
    }
</script>

<div 
    class="group relative bg-gradient-to-br {typeColors[taskType]} rounded-xl border backdrop-blur-sm transition-all duration-300 {isCompleted ? 'opacity-60 scale-95' : 'hover:scale-[1.02]'} {isAnimating ? 'animate-bounce-out' : ''}"
>
    <!-- Glow effect on hover -->
    {#if !isCompleted}
        <div class="absolute inset-0 bg-gradient-to-br {typeColors[taskType]} opacity-0 group-hover:opacity-50 blur-xl rounded-xl transition-opacity pointer-events-none"></div>
    {/if}

    <div class="relative z-10 p-4">
        <div class="flex items-start gap-3">
            <!-- Checkbox -->
            <button
                onclick={handleComplete}
                disabled={isCompleted}
                class="flex-shrink-0 w-6 h-6 rounded-full border-2 {isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 hover:border-white/60 hover:bg-white/5'} transition-all flex items-center justify-center group/check"
                aria-label={isCompleted ? 'Completada' : 'Marcar como completada'}
            >
                {#if isCompleted}
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                {:else}
                    <div class="w-3 h-3 bg-white rounded-full opacity-0 group-hover/check:opacity-30 transition-opacity"></div>
                {/if}
            </button>

            <!-- Content -->
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xl">{typeIcons[taskType]}</span>
                    <span class="text-xs font-medium text-white/60 px-2 py-0.5 bg-white/10 rounded-full">
                        {typeLabels[taskType]}
                    </span>
                    {#if task.required}
                        <span class="text-xs font-medium text-red-400/80 px-2 py-0.5 bg-red-500/10 rounded-full border border-red-500/20">
                            Requerida
                        </span>
                    {/if}
                </div>
                <h4 class="text-white font-semibold mb-1 {isCompleted ? 'line-through' : ''}">{task.title}</h4>
                {#if task.description}
                    <p class="text-white/70 text-sm line-clamp-2">{task.description}</p>
                {/if}

                <!-- Weight indicator -->
                {#if taskWeight > 1}
                    <div class="mt-2 flex items-center gap-1">
                        <span class="text-xs text-white/50">Peso:</span>
                        <div class="flex gap-0.5">
                            {#each Array(Math.min(Math.max(Math.floor(taskWeight), 1), 5)) as _}
                                <div class="w-1.5 h-3 bg-amber-400 rounded-sm"></div>
                            {/each}
                        </div>
                        {#if taskWeight > 5}
                            <span class="text-xs text-amber-400 font-bold">×{Math.floor(taskWeight)}</span>
                        {/if}
                    </div>
                {/if}
            </div>

            <!-- Menu -->
            {#if !isCompleted}
                <div class="relative z-30">
                    <button
                        onclick={(e) => { e.stopPropagation(); showMenu = !showMenu; }}
                        class="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Opciones"
                    >
                        <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>

                    {#if showMenu}
                        <div class="absolute right-0 top-8 bg-neutral-800 border border-white/10 rounded-lg shadow-xl py-1 z-[250] min-w-[120px]">
                            <button
                                onclick={(e) => { e.stopPropagation(); handleEdit(); }}
                                class="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                            </button>
                            <button
                                onclick={(e) => { e.stopPropagation(); handleDelete(); }}
                                class="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                            </button>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</div>


<style>
    @keyframes bounce-out {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }

    .animate-bounce-out {
        animation: bounce-out 0.3s ease-out;
    }

    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
