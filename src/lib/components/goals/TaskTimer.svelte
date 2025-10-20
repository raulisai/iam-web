<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    
    interface Props {
        taskId: string;
        isRunning: boolean;
        isPaused: boolean;
        elapsedSeconds: number;
        estimatedDuration?: string; // formato: "30m", "1h", "2h 30m"
        onStart?: () => void;
        onPause?: () => void;
        onResume?: () => void;
        onStop?: (seconds: number) => void;
    }

    let { taskId, isRunning = false, isPaused = false, elapsedSeconds = 0, estimatedDuration, onStart, onPause, onResume, onStop }: Props = $props();
    
    // Parsear duración estimada a segundos
    function parseDuration(duration?: string): number {
        if (!duration) return 0;
        
        let totalSeconds = 0;
        const hourMatch = duration.match(/(\d+)\s*h/);
        const minMatch = duration.match(/(\d+)\s*m/);
        
        if (hourMatch) totalSeconds += parseInt(hourMatch[1]) * 3600;
        if (minMatch) totalSeconds += parseInt(minMatch[1]) * 60;
        
        return totalSeconds;
    }
    
    const estimatedSeconds = $derived(parseDuration(estimatedDuration));
    const remainingSeconds = $derived(estimatedSeconds > 0 ? Math.max(0, estimatedSeconds - displaySeconds) : 0);
    const isOvertime = $derived(estimatedSeconds > 0 && displaySeconds > estimatedSeconds);
    const progressPercentage = $derived(estimatedSeconds > 0 ? Math.min(100, (displaySeconds / estimatedSeconds) * 100) : 0);

    let displaySeconds = $state(0);
    let intervalId: number | null = null;
    let startTime = $state(Date.now());

    // Formatear tiempo para display
    const hours = $derived(Math.floor(displaySeconds / 3600));
    const minutes = $derived(Math.floor((displaySeconds % 3600) / 60));
    const seconds = $derived(displaySeconds % 60);

    const formattedTime = $derived(
        hours > 0 
            ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            : `${minutes}:${seconds.toString().padStart(2, '0')}`
    );

    // Calcular progreso circular basado en estimado o en minutos
    const circleProgress = $derived(
        estimatedSeconds > 0 
            ? (displaySeconds / estimatedSeconds) * 360
            : (seconds / 60) * 360
    );

    function handleStart() {
        onStart?.();
    }

    function handlePause() {
        onPause?.();
    }

    function handleResume() {
        onResume?.();
    }

    function handleStop() {
        onStop?.(displaySeconds);
    }

    // Actualizar display en tiempo real
    function updateDisplay() {
        if (isRunning && !isPaused) {
            displaySeconds = elapsedSeconds + Math.floor((Date.now() - startTime) / 1000);
        } else {
            displaySeconds = elapsedSeconds;
        }
    }

    // Effect para manejar el intervalo
    $effect(() => {
        if (isRunning && !isPaused) {
            startTime = Date.now();
            updateDisplay();
            intervalId = window.setInterval(() => {
                updateDisplay();
            }, 1000);
        } else {
            if (intervalId !== null) {
                clearInterval(intervalId);
                intervalId = null;
            }
            displaySeconds = elapsedSeconds;
        }

        return () => {
            if (intervalId !== null) {
                clearInterval(intervalId);
            }
        };
    });

    onDestroy(() => {
        if (intervalId !== null) {
            clearInterval(intervalId);
        }
    });
</script>

<div class="relative overflow-hidden bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-purple-900/40 border-2 {isRunning && !isPaused ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20' : isPaused ? 'border-amber-500/50 shadow-lg shadow-amber-500/20' : 'border-purple-500/30'} rounded-2xl p-4 transition-all duration-300">
    <!-- Background Animation -->
    {#if isRunning && !isPaused}
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 animate-pulse-slow"></div>
    {/if}
    
    <div class="relative z-10 flex items-center gap-4">
        <!-- Circular Timer Indicator -->
        <div class="relative flex-shrink-0">
            <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                <!-- Background circle -->
                <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    stroke-width="8"
                />
                <!-- Progress circle -->
                <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="{isRunning && !isPaused ? '#10b981' : isPaused ? '#f59e0b' : '#8b5cf6'}"
                    stroke-width="8"
                    stroke-dasharray="{(circleProgress / 360) * 264} 264"
                    stroke-linecap="round"
                    class="transition-all duration-1000 ease-linear"
                />
            </svg>
            
            <!-- Center Icon -->
            <div class="absolute inset-0 flex items-center justify-center">
                {#if isRunning && !isPaused}
                    <div class="relative">
                        <div class="absolute inset-0 bg-emerald-500 rounded-full blur-md animate-pulse"></div>
                        <div class="relative w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>
                {:else if isPaused}
                    <div class="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                {:else}
                    <div class="w-6 h-6 bg-purple-500/50 rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Timer Info -->
        <div class="flex-1 min-w-0">
            <!-- Status Badge -->
            <div class="mb-2">
                {#if isRunning && !isPaused}
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-xs font-semibold text-emerald-400">
                        <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Trabajando
                    </span>
                {:else if isPaused}
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-xs font-semibold text-amber-400">
                        <span class="w-2 h-2 bg-amber-500 rounded-full"></span>
                        Pausado
                    </span>
                {:else}
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-xs font-semibold text-purple-400">
                        Listo para empezar
                    </span>
                {/if}
            </div>
            
            <!-- Time Display -->
            <div class="font-mono text-4xl font-bold bg-gradient-to-r {isOvertime ? 'from-red-400 via-orange-300 to-red-400' : 'from-white via-blue-100 to-purple-100'} bg-clip-text text-transparent">
                {formattedTime}
            </div>
            
            <!-- Progress Bar -->
            {#if estimatedSeconds > 0}
                <div class="mt-2 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                        class="h-full rounded-full transition-all duration-1000 {isOvertime ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-blue-500'}"
                        style="width: {Math.min(100, progressPercentage)}%"
                    ></div>
                </div>
            {/if}
            
            <!-- Time info -->
            <div class="mt-1 flex items-center gap-3 text-xs font-medium">
                {#if estimatedSeconds > 0}
                    {#if isOvertime}
                        <span class="text-red-400">
                            ⚠️ +{Math.floor((displaySeconds - estimatedSeconds) / 60)}m extra
                        </span>
                    {:else if remainingSeconds > 0}
                        <span class="text-emerald-400">
                            ⏱️ {Math.floor(remainingSeconds / 60)}m restantes
                        </span>
                    {/if}
                    <span class="text-white/40">·</span>
                    <span class="text-white/50">
                        de {estimatedDuration}
                    </span>
                {:else if hours > 0 || minutes > 0}
                    <span class="text-white/50">
                        {#if hours > 0}
                            {hours}h {minutes}m {seconds}s
                        {:else}
                            {minutes} minutos, {seconds} segundos
                        {/if}
                    </span>
                {/if}
            </div>
        </div>

    <!-- Controls -->
    <div class="flex items-center gap-1">
        {#if !isRunning && !isPaused}
            <!-- Start Button -->
            <button
                onclick={handleStart}
                class="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-400"
                aria-label="Iniciar cronómetro"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
        {/if}

        {#if isRunning && !isPaused}
            <!-- Pause Button -->
            <button
                onclick={handlePause}
                class="p-2 hover:bg-amber-500/20 rounded-lg transition-colors text-amber-400"
                aria-label="Pausar cronómetro"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
        {/if}

        {#if isPaused}
            <!-- Resume Button -->
            <button
                onclick={handleResume}
                class="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-400"
                aria-label="Reanudar cronómetro"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
        {/if}

        {#if (isRunning || isPaused) && displaySeconds > 0}
            <!-- Stop Button -->
            <button
                onclick={handleStop}
                class="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                aria-label="Detener cronómetro"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
            </button>
        {/if}
    </div>
    </div>
</div>

<style>
    @keyframes pulse-slow {
        0%, 100% {
            opacity: 0.3;
        }
        50% {
            opacity: 0.6;
        }
    }

    .animate-pulse-slow {
        animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
</style>
