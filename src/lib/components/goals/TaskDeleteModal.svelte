<script lang="ts">
    import type { GoalTask } from '../../types';
    
    interface Props {
        isOpen: boolean;
        task?: GoalTask | null;
        onClose: () => void;
        onConfirm: () => Promise<void>;
    }
    
    let { isOpen = $bindable(), task, onClose, onConfirm }: Props = $props();
    
    let isDeleting = $state(false);
    
    async function handleConfirm() {
        isDeleting = true;
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Error deleting task:', error);
        } finally {
            isDeleting = false;
        }
    }
    
    function handleClose() {
        if (!isDeleting) {
            onClose();
        }
    }
</script>

{#if isOpen && task}
<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onclick={handleClose} onkeydown={(e) => e.key === 'Escape' && handleClose()} role="button" tabindex="-1">
    <div class="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-red-500/30 shadow-2xl" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="0">
        <div class="text-center mb-6">
            <div class="text-6xl mb-4">🗑️</div>
            <h3 class="text-xl font-bold text-white mb-2">¿Eliminar Tarea?</h3>
            <p class="text-white/80 mb-2 font-medium">{task.title}</p>
            <p class="text-white/60 text-sm">Esta acción no se puede deshacer.</p>
        </div>
        
        <div class="flex gap-3">
            <button
                onclick={handleClose}
                disabled={isDeleting}
                class="flex-1 px-4 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors font-medium disabled:opacity-50"
            >
                Cancelar
            </button>
            <button
                onclick={handleConfirm}
                disabled={isDeleting}
                class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium disabled:opacity-50"
            >
                {#if isDeleting}
                    <span class="flex items-center justify-center gap-2">
                        <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Eliminando...
                    </span>
                {:else}
                    Eliminar
                {/if}
            </button>
        </div>
    </div>
</div>
{/if}
