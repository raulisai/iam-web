<script lang="ts">
    import type { GoalTask } from '../../types';
    
    interface Props {
        isOpen: boolean;
        mode: 'create' | 'edit';
        task?: GoalTask | null;
        onClose: () => void;
        onSubmit: (data: Partial<GoalTask>) => Promise<void>;
    }
    
    let { isOpen = $bindable(), mode, task, onClose, onSubmit }: Props = $props();
    
    let title = $state('');
    let description = $state('');
    let type: 'mind' | 'body' | 'habit' | 'one_off' = $state('habit');
    let required = $state(true);
    let weight = $state(1);
    let priority: 'low' | 'medium' | 'high' = $state('medium');
    let isSubmitting = $state(false);
    
    // Reset form when task changes
    $effect(() => {
        if (isOpen) {
            if (mode === 'edit' && task) {
                title = task.title;
                description = task.description || '';
                type = (task.type as any) || 'habit';
                required = task.required || false;
                weight = task.weight || 1;
                priority = (task.priority as any) || 'medium';
            } else {
                resetForm();
            }
        }
    });
    
    function resetForm() {
        title = '';
        description = '';
        type = 'habit';
        required = true;
        weight = 1;
        priority = 'medium';
    }
    
    async function handleSubmit() {
        if (!title.trim()) return;
        
        isSubmitting = true;
        try {
            const data: Partial<GoalTask> = {
                title: title.trim(),
                description: description.trim(),
                type,
                required,
                weight,
                priority
            };
            
            await onSubmit(data);
            resetForm();
            onClose();
        } catch (error) {
            console.error('Error submitting task:', error);
        } finally {
            isSubmitting = false;
        }
    }
    
    function handleClose() {
        if (!isSubmitting) {
            resetForm();
            onClose();
        }
    }
</script>

{#if isOpen}
<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onclick={handleClose} onkeydown={(e) => e.key === 'Escape' && handleClose()} role="button" tabindex="-1">
    <div class="bg-neutral-900 rounded-2xl p-6 w-full max-w-2xl border border-purple-500/30 shadow-2xl" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="0">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-white">
                {mode === 'edit' ? '✏️ Editar Tarea' : '➕ Nueva Tarea'}
            </h3>
            <button
                onclick={handleClose}
                disabled={isSubmitting}
                class="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
                aria-label="Cerrar modal"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <!-- Form -->
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
            <!-- Title -->
            <div>
                <label for="title" class="block text-sm font-medium text-white/80 mb-2">
                    Título *
                </label>
                <input
                    id="title"
                    type="text"
                    bind:value={title}
                    disabled={isSubmitting}
                    placeholder="Ej: Meditar 10 minutos"
                    class="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                    required
                />
            </div>
            
            <!-- Description -->
            <div>
                <label for="description" class="block text-sm font-medium text-white/80 mb-2">
                    Descripción
                </label>
                <textarea
                    id="description"
                    bind:value={description}
                    disabled={isSubmitting}
                    placeholder="Detalles adicionales sobre la tarea..."
                    rows="3"
                    class="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none disabled:opacity-50"
                ></textarea>
            </div>
            
            <!-- Type & Priority -->
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="type" class="block text-sm font-medium text-white/80 mb-2">
                        Tipo
                    </label>
                    <select
                        id="type"
                        bind:value={type}
                        disabled={isSubmitting}
                        class="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                    >
                        <option value="mind">🧠 Mind</option>
                        <option value="body">💪 Body</option>
                        <option value="habit">🔄 Habit</option>
                        <option value="one_off">✅ One-Off</option>
                    </select>
                </div>
                
                <div>
                    <label for="priority" class="block text-sm font-medium text-white/80 mb-2">
                        Prioridad
                    </label>
                    <select
                        id="priority"
                        bind:value={priority}
                        disabled={isSubmitting}
                        class="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                    >
                        <option value="low">🟢 Baja</option>
                        <option value="medium">🟡 Media</option>
                        <option value="high">🔴 Alta</option>
                    </select>
                </div>
            </div>
            
            <!-- Required & Weight -->
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="flex items-center gap-3 p-4 bg-neutral-800 border border-white/10 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors">
                        <input
                            type="checkbox"
                            bind:checked={required}
                            disabled={isSubmitting}
                            class="w-5 h-5 rounded border-white/20 bg-neutral-700 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50"
                        />
                        <div>
                            <div class="text-white font-medium">Requerida</div>
                            <div class="text-white/60 text-sm">Cuenta para progreso</div>
                        </div>
                    </label>
                </div>
                
                <div>
                    <label for="weight" class="block text-sm font-medium text-white/80 mb-2">
                        Peso ({weight}x)
                    </label>
                    <input
                        id="weight"
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.5"
                        bind:value={weight}
                        disabled={isSubmitting}
                        class="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50"
                    />
                    <div class="flex justify-between text-xs text-white/40 mt-1">
                        <span>0.5x</span>
                        <span>1.5x</span>
                        <span>3x</span>
                    </div>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="flex gap-3 pt-4">
                <button
                    type="button"
                    onclick={handleClose}
                    disabled={isSubmitting}
                    class="flex-1 px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors font-medium disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {#if isSubmitting}
                        <span class="flex items-center justify-center gap-2">
                            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Guardando...
                        </span>
                    {:else}
                        {mode === 'edit' ? 'Guardar Cambios' : 'Crear Tarea'}
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>
{/if}
