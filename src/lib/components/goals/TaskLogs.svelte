<script lang="ts">
    import type { TaskLog } from '../../types';
    
    interface Props {
        logs: TaskLog[];
        isLoading?: boolean;
    }

    let { logs = [], isLoading = false }: Props = $props();

    const actionLabels: Record<string, string> = {
        started: 'Iniciado',
        paused: 'Pausado',
        resumed: 'Reanudado',
        completed: 'Completado',
        skipped: 'Omitido',
        uncompleted: 'Descompletado',
        comment: 'Comentario'
    };

    const actionIcons: Record<string, string> = {
        started: '▶️',
        paused: '⏸️',
        resumed: '▶️',
        completed: '✅',
        skipped: '⏭️',
        uncompleted: '↩️',
        comment: '💬'
    };

    const actionColors: Record<string, string> = {
        started: 'text-emerald-400 bg-emerald-500/10',
        paused: 'text-amber-400 bg-amber-500/10',
        resumed: 'text-emerald-400 bg-emerald-500/10',
        completed: 'text-emerald-400 bg-emerald-500/10',
        skipped: 'text-gray-400 bg-gray-500/10',
        uncompleted: 'text-blue-400 bg-blue-500/10',
        comment: 'text-purple-400 bg-purple-500/10'
    };

    function formatDate(timestamp: string): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        // Menos de 1 minuto
        if (diff < 60000) {
            return 'Ahora mismo';
        }
        
        // Menos de 1 hora
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `Hace ${minutes} min`;
        }
        
        // Menos de 1 día
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `Hace ${hours}h`;
        }
        
        // Menos de 7 días
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `Hace ${days}d`;
        }
        
        // Más de 7 días - mostrar fecha
        return date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    function formatDuration(seconds?: number): string {
        if (!seconds) return '';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        }
        return `${secs}s`;
    }
</script>

<div class="space-y-2">
    {#if isLoading}
        <div class="flex items-center justify-center py-4">
            <div class="inline-block w-6 h-6 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
    {:else if logs.length === 0}
        <div class="text-center py-6 text-white/60 text-sm">
            <div class="text-3xl mb-2">📝</div>
            No hay registros todavía
        </div>
    {:else}
        <div class="space-y-2 max-h-60 overflow-y-auto">
            {#each logs as log (log.id)}
                <div class="flex items-start gap-3 p-3 bg-neutral-800/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                    <!-- Icon -->
                    <div class="flex-shrink-0 w-8 h-8 rounded-lg {actionColors[log.action] || 'bg-gray-500/10'} flex items-center justify-center text-lg">
                        {actionIcons[log.action] || '📌'}
                    </div>
                    
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-sm font-medium text-white">
                                {actionLabels[log.action] || log.action}
                            </span>
                            <span class="text-xs text-white/50">
                                {formatDate(log.timestamp)}
                            </span>
                        </div>
                        
                        {#if log.metadata?.notes}
                            <p class="text-sm text-white/70 mt-1">
                                {log.metadata.notes}
                            </p>
                        {/if}
                        
                        {#if log.metadata?.duration_seconds}
                            <div class="flex items-center gap-1 mt-1">
                                <svg class="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="text-xs text-purple-400">
                                    {formatDuration(log.metadata.duration_seconds)}
                                </span>
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    /* Custom scrollbar */
    .overflow-y-auto::-webkit-scrollbar {
        width: 6px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }
</style>
