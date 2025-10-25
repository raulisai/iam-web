<script lang="ts">
    import { onMount } from 'svelte';
    import type { GoalTask, TaskLog, TaskTimer } from '../../types';
    import TaskTimerComponent from './TaskTimer.svelte';
    import TaskLogs from './TaskLogs.svelte';

    interface Props {
        task: GoalTask;
        isCompleted?: boolean;
        timer?: TaskTimer | null;
        logs?: TaskLog[];
        isDragging?: boolean;
        oncomplete?: (taskId: string) => void;
        onuncomplete?: (taskId: string) => void;
        onedit?: (taskId: string) => void;
        ondelete?: (taskId: string) => void;
        ontimerstart?: (taskId: string) => void;
        ontimerpause?: (taskId: string) => void;
        ontimerresume?: (taskId: string) => void;
        ontimerstop?: (taskId: string, seconds: number) => void;
        onloadlogs?: (taskId: string) => void;
        onaddcomment?: (taskId: string, comment: string) => void;
        ondragstart?: (e: DragEvent, taskId: string) => void;
        ondragend?: (e: DragEvent) => void;
        ondragover?: (e: DragEvent, taskId: string) => void;
        ondrop?: (e: DragEvent, taskId: string) => void;
        onviewdetail?: (taskId: string) => void;
    }

    let { 
        task, 
        isCompleted = false, 
        timer = null,
        logs = [],
        isDragging = false,
        oncomplete, 
        onuncomplete,
        onedit, 
        ondelete,
        ontimerstart,
        ontimerpause,
        ontimerresume,
        ontimerstop,
        onloadlogs,
        onaddcomment,
        ondragstart,
        ondragend,
        ondragover,
        ondrop,
        onviewdetail
    }: Props = $props();
    
    const priorityColors = {
        low: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        high: 'text-red-400 bg-red-500/10 border-red-500/30'
    };
    
    const priorityLabels = {
        low: 'Baja',
        medium: 'Media',
        high: 'Alta'
    };

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
    let showLogs = $state(false);
    let showCommentBox = $state(false);
    let commentText = $state('');
    let isExpanded = $state(false);
    let isAnimating = $state(false);
    let showStartModal = $state(false);

    function handleComplete() {
        if (isCompleted) return;
        isAnimating = true;
        setTimeout(() => {
            oncomplete?.(task.id || '');
        }, 300);
    }

    function handleUncomplete() {
        onuncomplete?.(task.id || '');
    }

    function handleEdit() {
        showMenu = false;
        onedit?.(task.id || '');
    }

    function handleDelete() {
        showMenu = false;
        ondelete?.(task.id || '');
    }

    function handleStartWork() {
        showStartModal = true;
    }

    function handleConfirmStart(withTimer: boolean) {
        showStartModal = false;
        if (withTimer) {
            ontimerstart?.(task.id || '');
        }
        isExpanded = true;
    }

    function handleTimerStart() {
        ontimerstart?.(task.id || '');
    }

    function handleTimerPause() {
        ontimerpause?.(task.id || '');
    }

    function handleTimerResume() {
        ontimerresume?.(task.id || '');
    }

    function handleTimerStop(seconds: number) {
        ontimerstop?.(task.id || '', seconds);
    }

    function handleToggleLogs() {
        if (!showLogs) {
            onloadlogs?.(task.id || '');
        }
        showLogs = !showLogs;
    }

    function handleAddComment() {
        if (commentText.trim()) {
            onaddcomment?.(task.id || '', commentText.trim());
            commentText = '';
            showCommentBox = false;
        }
    }

    function toggleExpand() {
        isExpanded = !isExpanded;
    }
    
    function handleDragStart(e: DragEvent) {
        if (ondragstart) {
            ondragstart(e, task.id || '');
        }
    }
    
    function handleDragEnd(e: DragEvent) {
        if (ondragend) {
            ondragend(e);
        }
    }
    
    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        if (ondragover) {
            ondragover(e, task.id || '');
        }
    }
    
    function handleDrop(e: DragEvent) {
        e.preventDefault();
        if (ondrop) {
            ondrop(e, task.id || '');
        }
    }
</script>

<div 
    class="group relative bg-gradient-to-br {typeColors[taskType]} rounded-xl border backdrop-blur-sm transition-all duration-300 {isCompleted ? 'opacity-60' : 'hover:scale-[1.01] hover:shadow-2xl'} {isAnimating ? 'animate-bounce-out' : ''} {isDragging ? 'opacity-50 scale-95' : ''}"
    draggable="{!isCompleted}"
    ondragstart={handleDragStart}
    ondragend={handleDragEnd}
    ondragover={handleDragOver}
    ondrop={handleDrop}
>
    <!-- Glow effect on hover -->
    {#if !isCompleted}
        <div class="absolute inset-0 bg-gradient-to-br {typeColors[taskType]} opacity-0 group-hover:opacity-50 blur-xl rounded-xl transition-opacity pointer-events-none"></div>
    {/if}

    <div class="relative z-10 p-4">
        <!-- Header -->
        <div class="flex items-start gap-3">
            <!-- Checkbox -->
            <button
                onclick={isCompleted ? handleUncomplete : handleComplete}
                class="flex-shrink-0 w-6 h-6 rounded-full border-2 {isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 hover:border-white/60 hover:bg-white/5'} transition-all flex items-center justify-center group/check"
                aria-label={isCompleted ? 'Deshacer completado' : 'Marcar como completada'}
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
                <!-- Header con badges -->
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                    <span class="text-2xl">{typeIcons[taskType]}</span>
                    <span class="text-xs font-semibold text-white/80 px-2.5 py-1 bg-white/10 rounded-full border border-white/20">
                        {typeLabels[taskType]}
                    </span>
                    {#if task.priority}
                        <span class="text-xs font-semibold px-2.5 py-1 rounded-full border {priorityColors[task.priority]}">
                            {priorityLabels[task.priority]}
                        </span>
                    {/if}
                    {#if task.required}
                        <span class="text-xs font-semibold text-red-400 px-2.5 py-1 bg-red-500/10 rounded-full border border-red-500/30">
                            ⭐ Requerida
                        </span>
                    {/if}
                </div>
                
                <!-- Título -->
                <h4 class="text-white text-lg font-bold mb-2 {isCompleted ? 'line-through' : ''}">{task.title}</h4>
                
                <!-- Descripción -->
                {#if task.description}
                    <p class="text-white/70 text-sm mb-3 line-clamp-2">{task.description}</p>
                {/if}

                <!-- Metadata Grid -->
                <div class="grid grid-cols-2 gap-2 mt-3">
                    <!-- Duración estimada -->
                    {#if task.estimated_duration}
                        <div class="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                            <svg class="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div class="min-w-0">
                                <div class="text-xs text-white/50">Duración</div>
                                <div class="text-sm font-semibold text-white">{task.estimated_duration}</div>
                            </div>
                        </div>
                    {/if}
                    
                    <!-- Peso -->
                    {#if taskWeight > 1}
                        <div class="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                            <svg class="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <div class="min-w-0">
                                <div class="text-xs text-white/50">Peso</div>
                                <div class="text-sm font-semibold text-amber-400">×{Math.floor(taskWeight)}</div>
                            </div>
                        </div>
                    {/if}
                    
                    <!-- Fecha límite -->
                    {#if task.due_at}
                        <div class="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                            <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div class="min-w-0">
                                <div class="text-xs text-white/50">Vence</div>
                                <div class="text-sm font-semibold text-white truncate">{new Date(task.due_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</div>
                            </div>
                        </div>
                    {/if}
                    
                    <!-- Orden -->
                    {#if task.order !== undefined}
                        <div class="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                            <svg class="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            <div class="min-w-0">
                                <div class="text-xs text-white/50">Orden</div>
                                <div class="text-sm font-semibold text-blue-400">#{task.order + 1}</div>
                            </div>
                        </div>
                    {/if}
                </div>
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

        <!-- Actions Bar -->
        {#if !isCompleted}
            <div class="mt-4 flex items-center gap-2 flex-wrap">
                <!-- Start Working Button -->
                {#if !timer}
                    <button
                        onclick={handleStartWork}
                        class="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Empezar a trabajar
                    </button>
                {/if}

                {#if task.goal_id && onviewdetail}
                    <button
                        onclick={() => onviewdetail?.(task.id || '')}
                        class="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium rounded-lg transition-all border border-white/10"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ver detalle
                    </button>
                {/if}

                <!-- View/Hide Logs -->
                <button
                    onclick={handleToggleLogs}
                    class="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium rounded-lg transition-all border border-white/10"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {showLogs ? 'Ocultar' : 'Ver'} registros
                    {#if logs.length > 0}
                        <span class="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">{logs.length}</span>
                    {/if}
                </button>

                <!-- Add Comment -->
                <button
                    onclick={() => showCommentBox = !showCommentBox}
                    class="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium rounded-lg transition-all border border-white/10"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Comentar
                </button>
            </div>
        {/if}

        <!-- Timer Section -->
        {#if timer && !isCompleted}
            <div class="mt-4">
                <TaskTimerComponent
                    taskId={task.id || ''}
                    isRunning={timer.isRunning}
                    isPaused={timer.isPaused}
                    elapsedSeconds={timer.elapsedSeconds}
                    estimatedDuration={task.estimated_duration}
                    onStart={handleTimerStart}
                    onPause={handleTimerPause}
                    onResume={handleTimerResume}
                    onStop={handleTimerStop}
                />
            </div>
        {/if}

        <!-- Comment Box -->
        {#if showCommentBox && !isCompleted}
            <div class="mt-4 p-3 bg-neutral-800/50 rounded-lg border border-white/10">
                <textarea
                    bind:value={commentText}
                    placeholder="Escribe un comentario sobre esta tarea..."
                    class="w-full bg-transparent text-white text-sm outline-none resize-none"
                    rows="3"
                ></textarea>
                <div class="flex items-center justify-end gap-2 mt-2">
                    <button
                        onclick={() => { showCommentBox = false; commentText = ''; }}
                        class="px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onclick={handleAddComment}
                        disabled={!commentText.trim()}
                        class="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                    >
                        Agregar
                    </button>
                </div>
            </div>
        {/if}

        <!-- Logs Section -->
        {#if showLogs}
            <div class="mt-4 p-3 bg-neutral-800/30 rounded-lg border border-white/10">
                <h5 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Historial de actividad
                </h5>
                <TaskLogs {logs} />
            </div>
        {/if}

        <!-- Completed Badge -->
        {#if isCompleted}
            <div class="mt-4 flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-sm font-medium text-emerald-400">Tarea completada</span>
                </div>
                <button
                    onclick={handleUncomplete}
                    class="text-xs text-emerald-400/80 hover:text-emerald-400 underline"
                >
                    Deshacer
                </button>
            </div>
        {/if}
    </div>
</div>

<!-- Start Work Modal -->
{#if showStartModal}
<div 
    role="button" 
    tabindex="0"
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm" 
    onclick={() => showStartModal = false}
    onkeydown={(e) => e.key === 'Escape' && (showStartModal = false)}
>
    <div 
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        class="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-purple-500/30 shadow-2xl" 
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
    >
        <div class="text-center mb-6">
            <div class="text-6xl mb-4">⏱️</div>
            <h3 class="text-xl font-bold text-white mb-2">¿Usar cronómetro?</h3>
            <p class="text-white/60 text-sm">El cronómetro te ayuda a medir el tiempo que dedicas a esta tarea</p>
        </div>
        
        <div class="flex flex-col gap-3">
            <button
                onclick={() => handleConfirmStart(true)}
                class="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-medium"
            >
                ⏱️ Sí, usar cronómetro
            </button>
            <button
                onclick={() => handleConfirmStart(false)}
                class="w-full px-4 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors font-medium"
            >
                Empezar sin cronómetro
            </button>
            <button
                onclick={() => showStartModal = false}
                class="w-full px-4 py-3 text-white/60 hover:text-white transition-colors text-sm"
            >
                Cancelar
            </button>
        </div>
    </div>
</div>
{/if}

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
