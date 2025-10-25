<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { getAuthStore } from '$lib/stores/auth.svelte';
    import { initializeGoalsStore } from '$lib/stores/goals.svelte';
    import {
        fetchGoalTaskById,
        fetchGoalProgress,
        fetchTaskOccurrencesWithStatus,
        fetchOccurrenceLogs
    } from '$lib/services/goalTasks';
    import type {
        GoalTask,
        Goal,
        GoalProgressSummary,
        TaskOccurrenceWithStatus,
        TaskOccurrenceLog
    } from '$lib/types';

    const goalsStore = initializeGoalsStore();

    let taskId = $derived($page.params.id || '');
    let loading = $state(true);
    let loadingLogs = $state(false);
    let error = $state<string | null>(null);

    let task = $state<GoalTask | null>(null);
    let parentGoal = $state<Goal | null>(null);
    let goalProgress = $state<GoalProgressSummary | null>(null);
    let occurrences = $state<TaskOccurrenceWithStatus[]>([]);
    let recentLogs = $state<TaskOccurrenceLog[]>([]);

    const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    onMount(() => {
        loadData();
    });

    async function loadData() {
        const authStore = getAuthStore();
        const token = authStore.getToken();

        if (!token) {
            error = 'No hay token de autenticación.';
            loading = false;
            return;
        }

        loading = true;
        error = null;

        try {
            if (goalsStore.goals.length === 0) {
                await goalsStore.fetchAll();
            }

            const taskDetail = await fetchGoalTaskById(token, taskId);

            if (!taskDetail) {
                error = 'Tarea no encontrada.';
                loading = false;
                return;
            }

            task = taskDetail;

            parentGoal = taskDetail.goal_id
                ? goalsStore.getById(taskDetail.goal_id) ?? null
                : null;

            const [occurrenceList, progress] = await Promise.all([
                fetchTaskOccurrencesWithStatus(token, taskId, { include_status: true }),
                taskDetail.goal_id ? fetchGoalProgress(token, taskDetail.goal_id) : Promise.resolve(null)
            ]);

            occurrences = occurrenceList
                .slice()
                .sort((a, b) => getOccurrenceTime(b) - getOccurrenceTime(a));

            goalProgress = progress;

            if (occurrences.length > 0 && occurrences[0].id) {
                loadingLogs = true;
                const logs = await fetchOccurrenceLogs(token, occurrences[0].id!);
                recentLogs = logs.slice(0, 5);
            } else {
                recentLogs = [];
            }
        } catch (err) {
            console.error('Error loading goal task detail:', err);
            error = err instanceof Error ? err.message : 'No se pudo cargar la tarea.';
        } finally {
            loading = false;
            loadingLogs = false;
        }
    }

    function getOccurrenceTime(occurrence: TaskOccurrenceWithStatus): number {
        if (occurrence.scheduled_at) return new Date(occurrence.scheduled_at).getTime();
        if (occurrence.completed_at) return new Date(occurrence.completed_at).getTime();
        return 0;
    }

    function formatDateTime(date?: string | null): string {
        if (!date) return '—';
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return '—';
        return dateTimeFormatter.format(parsed);
    }

    function formatDuration(ms: number): string {
        const totalMinutes = Math.max(0, Math.floor(ms / 60000));
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;

        const parts: string[] = [];
        if (days) parts.push(`${days}d`);
        if (hours) parts.push(`${hours}h`);
        if (!days && minutes) parts.push(`${minutes}m`);

        return parts.length > 0 ? parts.join(' ') : '0m';
    }

    function timeSince(date?: string | null): string {
        if (!date) return '—';
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return '—';
        return formatDuration(Date.now() - parsed.getTime());
    }

    function delaySince(due?: string | null): { label: string; tone: 'neutral' | 'positive' | 'negative' } {
        if (!due) {
            return { label: 'Sin fecha límite', tone: 'neutral' };
        }
        const parsed = new Date(due);
        if (Number.isNaN(parsed.getTime())) {
            return { label: 'Fecha inválida', tone: 'neutral' };
        }
        const diff = Date.now() - parsed.getTime();
        if (diff < 0) {
            return { label: `Faltan ${formatDuration(-diff)}`, tone: 'positive' };
        }
        if (diff === 0) {
            return { label: 'Vence hoy', tone: 'neutral' };
        }
        return { label: `Retraso de ${formatDuration(diff)}`, tone: 'negative' };
    }

    let overdueInfo = $state<{ label: string; tone: 'neutral' | 'positive' | 'negative' }>({
        label: 'Sin datos',
        tone: 'neutral'
    });
    let elapsedSinceStart = $state('—');
    let latestOccurrence = $state<TaskOccurrenceWithStatus | null>(null);

    $effect(() => {
        const currentTask = task;
        const currentOccurrences = occurrences;

        overdueInfo = delaySince(currentTask?.due_at);
        elapsedSinceStart = timeSince(currentTask?.created_at);
        latestOccurrence = currentOccurrences.length > 0 ? currentOccurrences[0] : null;
    });
</script>

<div class="page">
    {#if loading}
        <div class="loading">Cargando tarea…</div>
    {:else if error}
        <div class="error">
            <p>{error}</p>
            <button type="button" onclick={loadData}>Reintentar</button>
        </div>
    {:else if task}
        <div class="layout">
            <header class="header">
                <div class="title-block">
                    <span class="badge">Goal Task</span>
                    <h1>{task.title}</h1>
                    <p class="subtitle">{task.description || 'Sin descripción'}</p>
                </div>
                <div class="goal-info">
                    <span class="goal-label">Goal asociado</span>
                    <h2>{parentGoal?.title || '—'}</h2>
                    {#if goalProgress}
                        <span class="progress">Progreso: {goalProgress.progress_percent?.toFixed(1) ?? 0}%</span>
                    {/if}
                </div>
            </header>

            <section class="grid">
                <article class="card">
                    <h3>Estado general</h3>
                    <ul class="stats">
                        <li>
                            <span class="label">Iniciada</span>
                            <span class="value">{formatDateTime(task.created_at)}</span>
                        </li>
                        <li>
                            <span class="label">Tiempo transcurrido</span>
                            <span class="value">{elapsedSinceStart}</span>
                        </li>
                        <li class={overdueInfo.tone}>
                            <span class="label">Estado de entrega</span>
                            <span class="value">{overdueInfo.label}</span>
                        </li>
                        <li>
                            <span class="label">Prioridad</span>
                            <span class="value">{task.priority ?? '—'}</span>
                        </li>
                    </ul>
                </article>

                <article class="card">
                    <h3>Última ocurrencia</h3>
                    {#if latestOccurrence}
                        {@const occ = latestOccurrence}
                        <div class="occurrence">
                            <div>
                                <span class="label">Programada</span>
                                <span class="value">{formatDateTime(occ.scheduled_at)}</span>
                            </div>
                            <div>
                                <span class="label">Estado actual</span>
                                <span class="value">{occ.status || 'pendiente'}</span>
                            </div>
                            <div>
                                <span class="label">Última acción</span>
                                <span class="value">{occ.last_action || '—'}</span>
                            </div>
                        </div>
                    {:else}
                        <p class="placeholder">Aún no hay ocurrencias registradas.</p>
                    {/if}
                </article>

                <article class="card">
                    <h3>Metadatos</h3>
                    <ul class="stats">
                        <li>
                            <span class="label">Peso</span>
                            <span class="value">{task.weight ?? 1}</span>
                        </li>
                        <li>
                            <span class="label">Requerida</span>
                            <span class="value">{task.required ? 'Sí' : 'No'}</span>
                        </li>
                        <li>
                            <span class="label">Tipo</span>
                            <span class="value">{task.type || '—'}</span>
                        </li>
                        <li>
                            <span class="label">Última actualización</span>
                            <span class="value">{formatDateTime(task.updated_at)}</span>
                        </li>
                    </ul>
                </article>
            </section>

            <section class="card activity">
                <div class="section-header">
                    <h3>Actividad reciente</h3>
                    {#if loadingLogs}
                        <span class="muted">Cargando notas…</span>
                    {/if}
                </div>
                {#if recentLogs.length === 0}
                    <p class="placeholder">Sin registros todavía.</p>
                {:else}
                    <ul class="logs">
                        {#each recentLogs as log}
                            <li>
                                <div>
                                    <span class="log-action">{log.action}</span>
                                    <span class="log-time">{formatDateTime(log.timestamp)}</span>
                                </div>
                                {#if log.metadata?.notes}
                                    <p class="log-notes">{log.metadata.notes}</p>
                                {/if}
                                {#if typeof log.metadata?.value === 'number'}
                                    <span class="log-value">Valor: {log.metadata.value}</span>
                                {/if}
                            </li>
                        {/each}
                    </ul>
                {/if}
            </section>

            <section class="card">
                <h3>Historial de ocurrencias</h3>
                {#if occurrences.length === 0}
                    <p class="placeholder">Sin ocurrencias programadas.</p>
                {:else}
                    <ul class="occurrences">
                        {#each occurrences as occurrence}
                            <li>
                                <span class="occurrence-date">{formatDateTime(occurrence.scheduled_at)}</span>
                                <span class="occurrence-status">{occurrence.status || 'pendiente'}</span>
                                <span class="occurrence-action">{occurrence.last_action || '—'}</span>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </section>
        </div>
    {/if}
</div>

<style>
    .page {
        min-height: 100vh;
        padding: 2.5rem 1.5rem 4rem;
        background: #0f1012;
        color: #f5f5f5;
    }

    .loading,
    .error {
        max-width: 420px;
        margin: 6rem auto;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        text-align: center;
    }

    .error button {
        margin-top: 1.5rem;
        padding: 0.6rem 1.5rem;
        border-radius: 999px;
        border: none;
        background: #f97316;
        color: #0f1012;
        font-weight: 600;
        cursor: pointer;
    }

    .layout {
        max-width: 960px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .header {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.75rem;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(16, 185, 129, 0.12));
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .title-block h1 {
        margin: 0.25rem 0 0;
        font-size: clamp(1.8rem, 2.4vw, 2.6rem);
        font-weight: 700;
    }

    .subtitle {
        margin-top: 0.35rem;
        color: rgba(245, 245, 245, 0.72);
        font-size: 0.95rem;
    }

    .badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        background: rgba(79, 70, 229, 0.18);
        color: #c7d2fe;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    .goal-info {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    .goal-label {
        color: rgba(245, 245, 245, 0.6);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }

    .goal-info h2 {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 600;
    }

    .progress {
        color: rgba(16, 185, 129, 0.82);
        font-size: 0.9rem;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.25rem;
    }

    .card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 18px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .card h3 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 600;
    }

    .stats {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 0.75rem;
    }

    .stats li {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .stats li.positive .value {
        color: #34d399;
    }

    .stats li.negative .value {
        color: #f87171;
    }

    .label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(245, 245, 245, 0.55);
    }

    .value {
        font-size: 1rem;
        font-weight: 500;
    }

    .occurrence {
        display: grid;
        gap: 0.75rem;
    }

    .placeholder {
        margin: 0;
        color: rgba(245, 245, 245, 0.5);
    }

    .activity .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .muted {
        font-size: 0.85rem;
        color: rgba(245, 245, 245, 0.55);
    }

    .logs,
    .occurrences {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 0.85rem;
    }

    .logs li,
    .occurrences li {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .logs li:last-child,
    .occurrences li:last-child {
        border-bottom: none;
    }

    .log-action {
        font-weight: 600;
        color: rgba(250, 204, 21, 0.9);
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.08em;
    }

    .log-time {
        font-size: 0.85rem;
        color: rgba(245, 245, 245, 0.6);
        margin-left: 0.25rem;
    }

    .log-notes {
        margin: 0;
        font-size: 0.95rem;
        color: rgba(245, 245, 245, 0.8);
    }

    .log-value {
        font-size: 0.85rem;
        color: rgba(245, 245, 245, 0.6);
    }

    .occurrence-date {
        font-weight: 500;
    }

    .occurrence-status {
        color: rgba(129, 140, 248, 0.9);
        font-size: 0.9rem;
    }

    .occurrence-action {
        color: rgba(245, 245, 245, 0.6);
        font-size: 0.85rem;
    }

    @media (max-width: 640px) {
        .page {
            padding: 2rem 1rem 3rem;
        }

        .header {
            padding: 1.25rem;
        }
    }
</style>
