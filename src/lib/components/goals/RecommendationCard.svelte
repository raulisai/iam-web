<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { TaskRecommendation } from '../../services/goalTasks';

    const dispatch = createEventDispatcher();

    interface Props {
        recommendation: TaskRecommendation;
        index: number;
    }

    let { recommendation, index }: Props = $props();

    const priorityColors = {
        low: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
        medium: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
        high: 'from-red-500/20 to-red-600/20 border-red-500/30'
    };

    const priorityIcons = {
        low: '📋',
        medium: '⚡',
        high: '🔥'
    };

    const priorityLabels = {
        low: 'Baja',
        medium: 'Media',
        high: 'Alta'
    };

    function handleAdd() {
        dispatch('add', recommendation);
    }
</script>

<div class="group relative bg-gradient-to-br {priorityColors[recommendation.priority]} rounded-xl border backdrop-blur-sm hover:scale-[1.02] transition-all duration-300">
    <!-- Order Badge -->
    <div class="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-neutral-900">
        {index + 1}
    </div>

    <!-- Glow effect on hover -->
    <div class="absolute inset-0 bg-gradient-to-br {priorityColors[recommendation.priority]} opacity-0 group-hover:opacity-50 blur-xl rounded-xl transition-opacity"></div>

    <div class="relative p-4">
        <div class="flex items-start gap-3 mb-3">
            <span class="text-2xl">{priorityIcons[recommendation.priority]}</span>
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-medium text-white/60 px-2 py-0.5 bg-white/10 rounded-full">
                        {priorityLabels[recommendation.priority]}
                    </span>
                    <span class="text-xs text-white/50 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {recommendation.estimated_duration}
                    </span>
                </div>
                <h4 class="text-white font-semibold mb-2">{recommendation.title}</h4>
                <p class="text-white/70 text-sm mb-3">{recommendation.description}</p>
                
                <!-- Reason -->
                <div class="bg-white/5 rounded-lg p-2 mb-3 border border-white/10">
                    <div class="flex items-start gap-2">
                        <span class="text-sm">💡</span>
                        <p class="text-xs text-white/60 italic">{recommendation.reason}</p>
                    </div>
                </div>

                <!-- Add Button -->
                <button
                    onclick={handleAdd}
                    class="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Tarea
                </button>
            </div>
        </div>
    </div>
</div>
