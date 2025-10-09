<script lang="ts">
    import type { Goal } from '../../services/goals';

    interface Props {
        goal: Goal;
        isEditing?: boolean;
        onupdate?: (data: { title: string; description: string }) => void;
    }

    let { goal, isEditing = false, onupdate }: Props = $props();

    const typeColors = {
        short: 'from-blue-500 to-blue-600',
        medium: 'from-amber-500 to-amber-600',
        long: 'from-purple-500 to-purple-600'
    };

    const typeIcons = {
        short: '⚡',
        medium: '🎯',
        long: '🚀'
    };

    let editedTitle = $state(goal.title);
    let editedDescription = $state(goal.description || '');
    let isEditingLocal = $state(false);

    function startEditing() {
        editedTitle = goal.title;
        editedDescription = goal.description || '';
        isEditingLocal = true;
    }

    function cancelEditing() {
        isEditingLocal = false;
    }

    function saveEdits() {
        onupdate?.({
            title: editedTitle,
            description: editedDescription
        });
        isEditingLocal = false;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            cancelEditing();
        } else if (e.key === 'Enter' && e.ctrlKey) {
            saveEdits();
        }
    }
</script>

<div class="relative group">
    <div class="absolute inset-0 bg-gradient-to-br {typeColors[goal.type]} opacity-20 rounded-2xl blur-xl pointer-events-none"></div>
    
    <div class="relative z-10 bg-gradient-to-br {typeColors[goal.type]} rounded-2xl p-6 text-white shadow-2xl border border-white/10">
        <!-- Edit Button -->
        {#if !isEditingLocal}
            <button
                onclick={startEditing}
                class="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                aria-label="Edit goal"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>
        {/if}

        <!-- Goal Icon & Type -->
        <div class="flex items-center gap-2 mb-3">
            <span class="text-3xl">{typeIcons[goal.type]}</span>
            <div class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                {goal.type === 'short' ? 'Corto Plazo' : goal.type === 'medium' ? 'Mediano Plazo' : 'Largo Plazo'}
            </div>
            <div class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1">
                <span class="w-2 h-2 bg-emerald-400 rounded-full {goal.is_active ? 'animate-pulse' : 'opacity-30'}"></span>
                {goal.is_active ? 'Activo' : 'Inactivo'}
            </div>
        </div>

        <!-- Editable Title & Description -->
        {#if isEditingLocal}
            <div class="space-y-3">
                <input
                    type="text"
                    bind:value={editedTitle}
                    onkeydown={handleKeydown}
                    class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-2xl font-bold text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Título del goal"
                />
                <textarea
                    bind:value={editedDescription}
                    onkeydown={handleKeydown}
                    class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                    placeholder="Descripción"
                    rows="2"
                ></textarea>
                <div class="flex gap-2">
                    <button
                        onclick={saveEdits}
                        class="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-all"
                    >
                        💾 Guardar
                    </button>
                    <button
                        onclick={cancelEditing}
                        class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        {:else}
            <h1 class="text-3xl md:text-4xl font-bold mb-2">{goal.title}</h1>
            <p class="text-white/90 text-sm md:text-base">{goal.description || 'Sin descripción'}</p>
        {/if}

        <!-- Dates -->
        <div class="flex items-center gap-4 mt-4 text-sm text-white/80">
            <div class="flex items-center gap-2">
                <span>🗓️</span>
                <span>{new Date(goal.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
            </div>
            {#if goal.end_date}
                <span>→</span>
                <div class="flex items-center gap-2">
                    <span>🏁</span>
                    <span>{new Date(goal.end_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                </div>
            {/if}
        </div>
    </div>
</div>
