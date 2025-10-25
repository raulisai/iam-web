<script lang="ts">
    import { createEventDispatcher, onDestroy } from 'svelte';

    type Mode = 'focus' | 'short_break' | 'long_break';

    interface Props {
        workMinutes?: number;
        shortBreakMinutes?: number;
        longBreakMinutes?: number;
        longBreakInterval?: number;
        autoContinue?: boolean;
    }

    const dispatch = createEventDispatcher<{
        sessionComplete: { mode: Mode };
        modeChange: { mode: Mode };
    }>();

    let {
        workMinutes = 25,
        shortBreakMinutes = 5,
        longBreakMinutes = 15,
        longBreakInterval = 4,
        autoContinue = true
    }: Props = $props();

    const modeConfig: Record<Mode, { label: string; icon: string; gradient: string; border: string }> = {
        focus: {
            label: 'Pomodoro',
            icon: '🎯',
            gradient: 'from-emerald-500/10 via-emerald-500/5 to-cyan-500/10',
            border: 'border-emerald-500/40'
        },
        short_break: {
            label: 'Descanso corto',
            icon: '☕',
            gradient: 'from-blue-500/10 via-blue-500/5 to-indigo-500/10',
            border: 'border-blue-500/40'
        },
        long_break: {
            label: 'Descanso largo',
            icon: '🌙',
            gradient: 'from-purple-500/10 via-purple-500/5 to-fuchsia-500/10',
            border: 'border-purple-500/40'
        }
    };

    function getDurationForMode(mode: Mode): number {
        if (mode === 'focus') return workMinutes * 60;
        if (mode === 'short_break') return shortBreakMinutes * 60;
        return longBreakMinutes * 60;
    }

    let mode = $state<Mode>('focus');
    let isRunning = $state(false);
    let secondsRemaining = $state(getDurationForMode(mode));
    let completedPomodoros = $state(0);
    let cycleCount = $state(0);
    let intervalId: number | null = null;

    const totalSecondsForMode = $derived(getDurationForMode(mode));
    const progress = $derived(
        totalSecondsForMode > 0
            ? Math.min(100, Math.max(0, ((totalSecondsForMode - secondsRemaining) / totalSecondsForMode) * 100))
            : 0
    );

    const minutesDisplay = $derived(Math.floor(secondsRemaining / 60));
    const secondsDisplay = $derived(secondsRemaining % 60);
    const formattedTime = $derived(
        `${minutesDisplay.toString().padStart(2, '0')}:${secondsDisplay.toString().padStart(2, '0')}`
    );

    function start() {
        if (isRunning || typeof window === 'undefined') return;
        isRunning = true;
        if (intervalId !== null) {
            clearInterval(intervalId);
        }
        intervalId = window.setInterval(tick, 1000);
    }

    function pause() {
        if (intervalId !== null && typeof window !== 'undefined') {
            clearInterval(intervalId);
            intervalId = null;
        }
        isRunning = false;
    }

    function reset() {
        pause();
        mode = 'focus';
        secondsRemaining = getDurationForMode('focus');
        completedPomodoros = 0;
        cycleCount = 0;
        dispatch('modeChange', { mode });
    }

    function skip() {
        completeSession(true);
    }

    function tick() {
        if (secondsRemaining <= 0) {
            completeSession();
            return;
        }
        secondsRemaining = secondsRemaining - 1;
    }

    function completeSession(forceNext = false) {
        dispatch('sessionComplete', { mode });

        if (mode === 'focus') {
            completedPomodoros = completedPomodoros + 1;
            cycleCount = cycleCount + 1;
            const shouldTakeLongBreak = cycleCount % longBreakInterval === 0;
            const nextMode: Mode = shouldTakeLongBreak ? 'long_break' : 'short_break';
            switchMode(nextMode, forceNext);
        } else {
            switchMode('focus', forceNext);
        }
    }

    function switchMode(nextMode: Mode, keepRunning: boolean) {
        mode = nextMode;
        secondsRemaining = getDurationForMode(nextMode);
        dispatch('modeChange', { mode: nextMode });

        if (!autoContinue && !keepRunning) {
            pause();
            return;
        }

        if (isRunning && typeof window !== 'undefined') {
            if (intervalId !== null) {
                clearInterval(intervalId);
            }
            intervalId = window.setInterval(tick, 1000);
        }
    }

    onDestroy(() => {
        if (intervalId !== null && typeof window !== 'undefined') {
            clearInterval(intervalId);
        }
    });
</script>

<div class="pomodoro {modeConfig[mode].border} bg-gradient-to-br {modeConfig[mode].gradient}">
    <div class="pomodoro__header">
        <span class="pomodoro__badge">
            <span class="pomodoro__icon">{modeConfig[mode].icon}</span>
            {modeConfig[mode].label}
        </span>
        <span class="pomodoro__cycles">
            Completados: <strong>{completedPomodoros}</strong>
        </span>
    </div>

    <div class="pomodoro__timer">
        <span class="pomodoro__time">{formattedTime}</span>
    </div>

    <div class="pomodoro__progress">
        <div class="pomodoro__progress-bar" style={`width: ${progress}%`}></div>
    </div>

    <div class="pomodoro__actions">
        {#if !isRunning}
            <button type="button" class="primary" onclick={start}>
                {secondsRemaining === totalSecondsForMode ? 'Iniciar' : 'Reanudar'}
            </button>
        {:else}
            <button type="button" class="secondary" onclick={pause}>
                Pausar
            </button>
        {/if}
        <button type="button" class="ghost" onclick={skip}>
            Siguiente fase
        </button>
        <button type="button" class="ghost" onclick={reset}>
            Reiniciar
        </button>
    </div>
</div>

<style>
    .pomodoro {
        border-radius: 18px;
        border-width: 1px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        background-color: rgba(15, 16, 18, 0.4);
    }

    .pomodoro__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .pomodoro__badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        background: rgba(15, 16, 18, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 0.85rem;
        font-weight: 600;
        color: #f5f5f5;
    }

    .pomodoro__icon {
        font-size: 1rem;
        line-height: 1;
    }

    .pomodoro__cycles {
        color: rgba(245, 245, 245, 0.7);
        font-size: 0.85rem;
    }

    .pomodoro__timer {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    .pomodoro__time {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: clamp(2.5rem, 4vw, 3.5rem);
        font-weight: 700;
        color: #f5f5f5;
        letter-spacing: 0.04em;
    }

    .pomodoro__progress {
        width: 100%;
        height: 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
        overflow: hidden;
    }

    .pomodoro__progress-bar {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #34d399, #60a5fa, #a855f7);
        transition: width 0.4s ease;
    }

    .pomodoro__actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .pomodoro__actions button {
        border-radius: 999px;
        padding: 0.6rem 1.2rem;
        font-size: 0.9rem;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .pomodoro__actions button:active {
        transform: scale(0.98);
    }

    .pomodoro__actions button.primary {
        background: linear-gradient(135deg, #34d399, #10b981);
        color: #0f1012;
        box-shadow: 0 10px 25px -15px rgba(16, 185, 129, 0.7);
    }

    .pomodoro__actions button.secondary {
        background: rgba(243, 156, 18, 0.15);
        color: #fbbf24;
        border: 1px solid rgba(251, 191, 36, 0.4);
    }

    .pomodoro__actions button.ghost {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(245, 245, 245, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .pomodoro__actions button:hover {
        opacity: 0.85;
    }

    @media (max-width: 520px) {
        .pomodoro {
            padding: 1.25rem;
        }

        .pomodoro__actions button {
            flex: 1;
            text-align: center;
        }
    }
</style>
