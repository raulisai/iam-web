<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import StatsCard from "../lib/components/StatsCard.svelte";
    import ProgressRing from "../lib/components/ProgressRing.svelte";
    import QuickAction from "../lib/components/QuickAction.svelte";
    import HealthBar from "../lib/components/HealthBar.svelte";
    import Brain from "../routes/minde/Brain.svelte";
    import Body from "../routes/body/Body.svelte";
    import TasksNowCarousel from "../lib/components/TasksNowCarousel.svelte";
    import { getAuthContext } from "$lib/stores/auth.svelte";
    import { getLatestSnapshot, getStatsSummary, type PerformanceSnapshot, type StatsSummary } from "$lib/services/stats";
    import { getMindTasks, getBodyTasks } from "$lib/services/tasks";
    import { fetchGoals, type Goal } from "$lib/services/goals";
    import type { Task } from "$lib/types";

    // Dashboard data
    let overallScore = $state(0);
    let mindScore = $state(0);
    let bodyScore = $state(0);
    
    // Métricas detalladas
    let energy = $state(0);
    let stamina = $state(0);
    let strength = $state(0);
    let flexibility = $state(0);
    let attention = $state(0);
    
    // Stats cards
    let caloriesBurned = $state('0');
    let stepsDailyValue = $state('0');
    let heartRate = $state('0');
    let sleepScore = $state('0');

    // Tareas y objetivos
    let mindTasks = $state<Task[]>([]);
    let bodyTasks = $state<Task[]>([]);
    let activeGoals = $state<Goal[]>([]);
    let todayTasks = $derived(mindTasks.length + bodyTasks.length);
    let completedTasks = $state(0);

    let snapshot = $state<PerformanceSnapshot | null>(null);
    let summary = $state<StatsSummary | null>(null);
    let isLoadingStats = $state(true);
    let isLoadingTasks = $state(true);

    // Animación de entrada
    let isVisible = $state(false);

    onMount(async () => {
        setTimeout(() => isVisible = true, 100);
        await Promise.all([
            loadStats(),
            loadTasks(),
            loadGoals()
        ]);
    });

    async function loadStats() {
        const authStore = getAuthContext();
        isLoadingStats = true;
        
        try {
            const [latestSnapshot, statsSummary] = await Promise.all([
                getLatestSnapshot(authStore),
                getStatsSummary(authStore, 30)
            ]);
            
            if (latestSnapshot) {
                snapshot = latestSnapshot;
                
                // Actualizar scores
                mindScore = Math.round(latestSnapshot.score_mind ?? 0);
                bodyScore = Math.round(latestSnapshot.score_body ?? 0);
                overallScore = Math.round((mindScore + bodyScore) / 2);
                
                // Métricas detalladas
                energy = Math.round(latestSnapshot.energy ?? 0);
                stamina = Math.round(latestSnapshot.stamina ?? 0);
                strength = Math.round(latestSnapshot.strength ?? 0);
                flexibility = Math.round(latestSnapshot.flexibility ?? 0);
                attention = Math.round(latestSnapshot.attention ?? 0);
                
                // Stats cards
                caloriesBurned = latestSnapshot.calories_burned ?? '0';
                stepsDailyValue = latestSnapshot.steps_daily ?? '0';
                heartRate = latestSnapshot.heart_rate ?? '0';
                sleepScore = latestSnapshot.sleep_score ?? '0';
            }
            
            if (statsSummary) {
                summary = statsSummary;
            }
        } catch (error) {
            console.error('Error al cargar estadísticas del dashboard:', error);
        } finally {
            isLoadingStats = false;
        }
    }

    async function loadTasks() {
        const authStore = getAuthContext();
        isLoadingTasks = true;
        
        try {
            const [mind, body] = await Promise.all([
                getMindTasks(authStore),
                getBodyTasks(authStore)
            ]);
            
            mindTasks = mind;
            bodyTasks = body;
            
            // Calcular tareas completadas (las que no están en la lista son completadas)
            completedTasks = 0; // Esto podría venir del backend
        } catch (error) {
            console.error('Error al cargar tareas:', error);
        } finally {
            isLoadingTasks = false;
        }
    }

    async function loadGoals() {
        const authStore = getAuthContext();
        try {
            const token = authStore.getToken();
            if (token) {
                const goals = await fetchGoals(token, true);
                activeGoals = goals;
            }
        } catch (error) {
            console.error('Error al cargar objetivos:', error);
        }
    }

    // Quick actions handlers (computado reactivamente)
    let quickActions = $derived([
        {
            icon: "🧠",
            label: "Mind",
            sublabel: `${mindScore}% health`,
            color: "purple" as const,
            onClick: () => goto("/minde"),
        },
        {
            icon: "💪",
            label: "Body",
            sublabel: `${bodyScore}% health`,
            color: "green" as const,
            onClick: () => goto("/body"),
        },
        {
            icon: "🎯",
            label: "Goals",
            sublabel: `${activeGoals.length} active`,
            color: "blue" as const,
            onClick: () => goto("/goals"),
        },
        {
            icon: "💣",
            label: "Failures",
            sublabel: "Track them",
            color: "red" as const,
            onClick: () => goto("/failures"),
        },
    ]);
</script>

<!-- Vista mobile-only -->
<div class="md:hidden h-[calc(100dvh-4rem)] overflow-hidden bg-neutral-950">
    <div class="flex flex-col h-full">
        <!-- Header minimalista -->
        <div class="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-neutral-900 to-neutral-950">
            <div class="flex items-center justify-between">
                <div class="transition-all duration-700" class:translate-y-0={isVisible} class:-translate-y-4={!isVisible} class:opacity-100={isVisible} class:opacity-0={!isVisible}>
                    <h1 class="text-xl font-bold text-white">Performance Hub</h1>
                    <p class="text-[10px] text-white/60 mt-0.5 font-mono">
                        {#if !isLoadingStats}
                            SCORE: {overallScore}%
                        {:else}
                            LOADING...
                        {/if}
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        onclick={() => goto("/onboarding")}
                        class="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 border border-purple-400/30 flex items-center justify-center hover:from-purple-500 hover:to-blue-500 transition-all duration-300 hover:scale-105"
                        title="Setup"
                    >
                        <span class="text-sm">🎯</span>
                    </button>
                    <button
                        onclick={() => goto("/profile")}
                        class="w-9 h-9 rounded-lg bg-neutral-800 border border-white/10 flex items-center justify-center hover:bg-neutral-700 transition-all duration-300 hover:scale-110"
                        title="Profile"
                    >
                        <span class="text-sm">👤</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Contenido scrolleable -->
        <div class="flex-1 overflow-y-auto pb-1">
            <!-- Tasks Now Carousel - Mobile -->
            <div class="px-4 py-1">
                <TasksNowCarousel 
                    token={getAuthContext().getToken() ?? ''} 
                    carouselHeight="160px"
                    onTaskClick={(task) => {
                        if (task.type === 'goal') goto(`/goals/${task.task_id}`);
                        else if (task.type === 'mind') goto('/minde');
                        else if (task.type === 'body') goto('/body');
                    }}
                />
            </div>

            <!-- Mind & Body Visualization con Core en el medio -->
            <div class="px-2 py-1">
                <div class="relative h-[420px] w-full">
                    <div class="grid grid-cols-2 gap-0 h-full">
                        <!-- Mind Component - Sin marco con zoom mejorado -->
                        <div
                            role="button"
                            tabindex="0"
                            class="relative overflow-visible transition-all duration-500 active:scale-95 cursor-pointer pr-6 group/mind"
                            onclick={() => goto("/minde")}
                            onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto('/minde')}
                            class:translate-x-0={isVisible}
                            class:-translate-x-full={!isVisible}
                            class:opacity-100={isVisible}
                            class:opacity-0={!isVisible}
                        >
                            <div class="h-full flex flex-col items-center justify-center transform group-active/mind:scale-110 transition-transform duration-300">
                                <div class="text-[10px] font-bold text-blue-300 font-mono mb-1 opacity-80">MIND</div>
                                <div class="text-4xl font-bold text-white mb-3 drop-shadow-lg">{mindScore}<span class="text-lg text-blue-400">%</span></div>
                                <div class="w-full max-w-[170px] aspect-square transform group-active/mind:scale-115 transition-transform duration-300">
                                    <Brain fillLevel={mindScore} />
                                </div>
                                <div class="mt-3 text-[9px] text-white/50 font-mono">ATT: {attention}%</div>
                            </div>
                        </div>


                        <!-- Body Component - Sin marco con zoom mejorado -->
                        <div
                            role="button"
                            tabindex="0"
                            class="relative overflow-visible transition-all duration-500 active:scale-95 cursor-pointer pl-6 group/body"
                            onclick={() => goto("/body")}
                            onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto('/body')}
                            class:translate-x-0={isVisible}
                            class:translate-x-full={!isVisible}
                            class:opacity-100={isVisible}
                            class:opacity-0={!isVisible}
                        >
                            <div class="h-full flex flex-col items-center justify-center transform group-active/body:scale-110 transition-transform duration-300">
                                <div class="text-[10px] font-bold text-green-300 font-mono mb-1 opacity-80">BODY</div>
                                <div class="text-4xl font-bold text-white mb-3 drop-shadow-lg">{bodyScore}<span class="text-lg text-green-400">%</span></div>
                                <div class="w-full max-w-[170px] h-full max-h-[230px] transform group-active/body:scale-115 transition-transform duration-300">
                                    <Body fillLevel={bodyScore} />
                                </div>
                                <div class="mt-3 text-[9px] text-white/50 font-mono">NRG: {energy}%</div>
                            </div>
                        </div>
                    </div>

                    <!-- Core Progress Ring - Simple y Elegante -->
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <div class="relative transition-all duration-700" class:scale-100={isVisible} class:scale-0={!isVisible}>
                            <!-- Main container - Simple y elegante -->
                            <div class="relative bg-neutral-950/95 rounded-full p-3 border border-white/15 backdrop-blur-md shadow-xl">
                                <!-- Subtle inner glow -->
                                <div class="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>

                                <div class="relative">
                                    <ProgressRing
                                        progress={overallScore}
                                        size={75}
                                        strokeWidth={7}
                                        label="CORE"
                                        sublabel={isLoadingStats ? "..." : `${overallScore}%`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Game-style Health Bars - Ultra compactas -->
            <div class="px-4 mb-2 -mt-16">
                <h2 class="text-[9px] font-mono text-white/50 mb-1.5 tracking-wider">STATS</h2>
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold text-green-300 font-mono w-16">⚡ ENERGY</span>
                        <div class="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                            <div class="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000" style="width: {energy}%"></div>
                        </div>
                        <span class="text-[10px] font-bold text-white font-mono w-6 text-right">{energy}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold text-red-300 font-mono w-16">💪 STRENGTH</span>
                        <div class="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                            <div class="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-1000" style="width: {strength}%"></div>
                        </div>
                        <span class="text-[10px] font-bold text-white font-mono w-6 text-right">{strength}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold text-blue-300 font-mono w-16">🏃 STAMINA</span>
                        <div class="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                            <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000" style="width: {stamina}%"></div>
                        </div>
                        <span class="text-[8px] font-bold text-white font-mono w-6 text-right">{stamina}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[8px] font-bold text-yellow-300 font-mono w-16">🤸 FLEX</span>
                        <div class="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                            <div class="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-1000" style="width: {flexibility}%"></div>
                        </div>
                        <span class="text-[8px] font-bold text-white font-mono w-6 text-right">{flexibility}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[8px] font-bold text-purple-300 font-mono w-16">🎯 ATTENTION</span>
                        <div class="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                            <div class="h-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all duration-1000" style="width: {attention}%"></div>
                        </div>
                        <span class="text-[8px] font-bold text-white font-mono w-6 text-right">{attention}</span>
                    </div>
                </div>
            </div>

            <!-- Today Stats - Compact Grid -->
            <div class="px-4">
                <h2 class="text-[8px] font-mono text-white/50 mb-1 tracking-wider">TODAY</h2>
                <div class="grid grid-cols-3 gap-1">
                    <div class="mobile-stat-card">
                        <div class="text-sm mb-0.5">🔥</div>
                        <div class="text-[10px] font-bold text-white">{caloriesBurned}</div>
                        <div class="text-[6px] text-white/40 font-mono mt-0.5">CAL</div>
                    </div>
                    <div class="mobile-stat-card">
                        <div class="text-sm mb-0.5">👟</div>
                        <div class="text-[10px] font-bold text-white">{stepsDailyValue}</div>
                        <div class="text-[6px] text-white/40 font-mono mt-0.5">STEPS</div>
                    </div>
                    <div class="mobile-stat-card">
                        <div class="text-sm mb-0.5 animate-pulse">❤️</div>
                        <div class="text-[10px] font-bold text-white">{heartRate}</div>
                        <div class="text-[6px] text-white/40 font-mono mt-0.5">BPM</div>
                    </div>
                    <div class="mobile-stat-card">
                        <div class="text-sm mb-0.5">💤</div>
                        <div class="text-[10px] font-bold text-white">{sleepScore}%</div>
                        <div class="text-[6px] text-white/40 font-mono mt-0.5">SLEEP</div>
                    </div>
                    <div class="mobile-stat-card">
                        <div class="text-sm mb-0.5">📋</div>
                        <div class="text-[10px] font-bold text-white">{todayTasks}</div>
                        <div class="text-[6px] text-white/40 font-mono mt-0.5">TASKS</div>
                    </div>
                    <div class="mobile-stat-card">
                        <div class="text-sm mb-0.5">🎯</div>
                        <div class="text-[10px] font-bold text-white">{activeGoals.length}</div>
                        <div class="text-[6px] text-white/40 font-mono mt-0.5">GOALS</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Vista escritorio -->
<div class="hidden md:block bg-neutral-950 min-h-screen overflow-hidden">
    <div class="max-w-[1920px] mx-auto p-6">
        <!-- Header con botones -->
        <div class="flex items-center justify-between mb-4">
            <div class="transition-all duration-700" class:translate-y-0={isVisible} class:-translate-y-4={!isVisible} class:opacity-100={isVisible} class:opacity-0={!isVisible}>
                <h1 class="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent tracking-wider">
                    PERFORMANCE HUB
                </h1>
                <p class="text-xs text-white/40 mt-1 font-mono">
                    {#if !isLoadingStats}
                        OVERALL: {overallScore}% • TASKS: {todayTasks}
                    {:else}
                        LOADING SYSTEM...
                    {/if}
                </p>
            </div>
            <div class="flex items-center gap-3">
                <button
                    onclick={() => goto("/onboarding")}
                    class="px-4 h-10 rounded-lg bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-md border border-purple-400/30 flex items-center justify-center gap-2 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/20"
                    title="Recalibrar Perfil"
                >
                    <span class="text-sm">🎯</span>
                    <span class="text-xs font-semibold text-white">SETUP</span>
                </button>
                <button
                    onclick={() => goto("/profile")}
                    class="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all duration-300 hover:scale-110"
                    title="Perfil"
                >
                    <span class="text-lg">👤</span>
                </button>
            </div>
        </div>

        <!-- Tasks Now Carousel - Arriba -->
        <div class="mb-6">
            <TasksNowCarousel 
                token={getAuthContext().getToken() ?? ''} 
                carouselHeight="200px"
                onTaskClick={(task) => {
                    if (task.type === 'goal') goto(`/goals/${task.task_id}`);
                    else if (task.type === 'mind') goto('/minde');
                    else if (task.type === 'body') goto('/body');
                }}
            />
        </div>

        <!-- Main Section: Body + Performance Core + Mind -->
        <div class="relative mb-6">
            <!-- Barras de métricas arriba (estilo videojuego) -->
            <div class="absolute -top-2 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                <div class="game-stat-bar" class:opacity-100={isVisible} class:opacity-0={!isVisible}>
                    <div class="stat-bar-label">⚡ ENERGY</div>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill bg-gradient-to-r from-green-500 to-emerald-400" style="width: {energy}%"></div>
                    </div>
                    <div class="stat-bar-value">{energy}</div>
                </div>
                <div class="game-stat-bar" class:opacity-100={isVisible} class:opacity-0={!isVisible} style="transition-delay: 100ms">
                    <div class="stat-bar-label">💪 STRENGTH</div>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill bg-gradient-to-r from-red-500 to-orange-400" style="width: {strength}%"></div>
                    </div>
                    <div class="stat-bar-value">{strength}</div>
                </div>
                <div class="game-stat-bar" class:opacity-100={isVisible} class:opacity-0={!isVisible} style="transition-delay: 200ms">
                    <div class="stat-bar-label">🏃 STAMINA</div>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill bg-gradient-to-r from-blue-500 to-cyan-400" style="width: {stamina}%"></div>
                    </div>
                    <div class="stat-bar-value">{stamina}</div>
                </div>
                <div class="game-stat-bar" class:opacity-100={isVisible} class:opacity-0={!isVisible} style="transition-delay: 300ms">
                    <div class="stat-bar-label">🤸 FLEXIBILITY</div>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill bg-gradient-to-r from-yellow-500 to-amber-400" style="width: {flexibility}%"></div>
                    </div>
                    <div class="stat-bar-value">{flexibility}</div>
                </div>
                <div class="game-stat-bar" class:opacity-100={isVisible} class:opacity-0={!isVisible} style="transition-delay: 400ms">
                    <div class="stat-bar-label">🎯 ATTENTION</div>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill bg-gradient-to-r from-purple-500 to-pink-400" style="width: {attention}%"></div>
                    </div>
                    <div class="stat-bar-value">{attention}</div>
                </div>
            </div>

            <!-- Grid de 3 columnas: Body | Performance Core | Mind -->
            <div class="grid grid-cols-3 gap-6 mt-20">
                <!-- BODY - Izquierda -->
                <div 
                    role="button"
                    tabindex="0"
                    class="relative group cursor-pointer"
                    onclick={() => goto("/body")}
                    onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto('/body')}
                    class:translate-x-0={isVisible} 
                    class:-translate-x-full={!isVisible}
                    class:opacity-100={isVisible} 
                    class:opacity-0={!isVisible}
                >
                    <div class="glass-card h-[700px] bg-gradient-to-br from-green-950/30 to-emerald-950/30 border-green-500/30 hover:border-green-400/60 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-500 hover:scale-[1.02]">
                        <div class="absolute inset-0 bg-gradient-to-t from-green-500/10 via-transparent to-transparent"></div>
                        <div class="relative z-10 h-full flex flex-col">
                            <!-- Header -->
                            <div class="flex items-center justify-between p-6 border-b border-green-500/20">
                                <div>
                                    <div class="text-sm font-mono text-green-400">BODY SYSTEM</div>
                                    <div class="text-5xl font-bold text-white mt-1">{bodyScore}<span class="text-2xl text-green-400">%</span></div>
                                </div>
                            </div>
                            <!-- Body Visual -->
                            <div class="flex-1 flex items-center justify-center px-6 py-8 overflow-hidden min-h-0">
                                <div class="w-full max-w-xs mx-auto" style="aspect-ratio: 1/1.5;">
                                    <Body fillLevel={bodyScore} />
                                </div>
                            </div>
                            <!-- Footer Stats -->
                            <div class="grid grid-cols-2 gap-3 p-6 border-t border-green-500/20">
                                <div class="text-center">
                                    <div class="text-xs text-green-400/60 font-mono">ENERGY</div>
                                    <div class="text-2xl font-bold text-white">{energy}%</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-xs text-green-400/60 font-mono">TASKS</div>
                                    <div class="text-2xl font-bold text-white">{bodyTasks.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PERFORMANCE CORE - Centro -->
                <div class="relative flex items-center justify-center">
                    <div class="glass-card p-8 bg-gradient-to-br from-purple-950/20 to-blue-950/20 border-purple-500/30 hover:border-purple-400/60 transition-all duration-500 hover:scale-105">
                        <div class="relative transition-all duration-700" class:scale-100={isVisible} class:scale-0={!isVisible}>
                            <div class="absolute inset-0 animate-pulse-glow rounded-full"></div>
                            <ProgressRing
                                progress={overallScore}
                                size={280}
                                strokeWidth={20}
                                label="CORE"
                                sublabel={isLoadingStats ? "..." : `${overallScore}%`}
                            />
                            <!-- Indicadores alrededor -->
                            <div class="absolute -top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-400/30">
                                <span class="text-sm font-bold text-blue-300">MIND: {mindScore}%</span>
                            </div>
                            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-400/30">
                                <span class="text-sm font-bold text-green-300">BODY: {bodyScore}%</span>
                            </div>
                        </div>
                        <div class="mt-8 text-center">
                            <div class="text-xs text-white/40 font-mono">PERFORMANCE INDEX</div>
                        </div>
                    </div>
                </div>

                <!-- MIND - Derecha -->
                <div 
                    role="button"
                    tabindex="0"
                    class="relative group cursor-pointer"
                    onclick={() => goto("/minde")}
                    onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto('/minde')}
                    class:translate-x-0={isVisible} 
                    class:translate-x-full={!isVisible}
                    class:opacity-100={isVisible} 
                    class:opacity-0={!isVisible}
                >
                    <div class="glass-card h-[700px] bg-gradient-to-br from-blue-950/30 to-purple-950/30 border-blue-500/30 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02]">
                        <div class="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent"></div>
                        <div class="relative z-10 h-full flex flex-col">
                            <!-- Header -->
                            <div class="flex items-center justify-between p-6 border-b border-blue-500/20">
                                <div>
                                    <div class="text-sm font-mono text-blue-400">MIND SYSTEM</div>
                                    <div class="text-5xl font-bold text-white mt-1">{mindScore}<span class="text-2xl text-blue-400">%</span></div>
                                </div>
                            </div>
                            <!-- Brain Visual -->
                            <div class="flex-1 flex items-center justify-center px-6 py-8 overflow-hidden min-h-0">
                                <div class="w-full max-w-md mx-auto aspect-square">
                                    <Brain fillLevel={mindScore} />
                                </div>
                            </div>
                            <!-- Footer Stats -->
                            <div class="grid grid-cols-2 gap-3 p-6 border-t border-blue-500/20">
                                <div class="text-center">
                                    <div class="text-xs text-blue-400/60 font-mono">ATTENTION</div>
                                    <div class="text-2xl font-bold text-white">{attention}%</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-xs text-blue-400/60 font-mono">TASKS</div>
                                    <div class="text-2xl font-bold text-white">{mindTasks.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Today Statistics - Minimalista Glass -->
        <div class="mt-8">
            <h2 class="text-sm font-mono text-white/60 mb-3 tracking-wider">TODAY STATISTICS</h2>
            <div class="grid grid-cols-6 gap-3">
                <!-- Calories -->
                <div class="glass-stat-minimal group hover:scale-105 transition-all duration-300">
                    <div class="text-2xl mb-2">🔥</div>
                    <div class="text-2xl font-bold text-white">{caloriesBurned}</div>
                    <div class="text-[10px] text-white/40 font-mono mt-1">CALORIES</div>
                </div>
                <!-- Steps -->
                <div class="glass-stat-minimal group hover:scale-105 transition-all duration-300">
                    <div class="text-2xl mb-2">👟</div>
                    <div class="text-2xl font-bold text-white">{stepsDailyValue}</div>
                    <div class="text-[10px] text-white/40 font-mono mt-1">STEPS</div>
                </div>
                <!-- Heart Rate -->
                <div class="glass-stat-minimal group hover:scale-105 transition-all duration-300">
                    <div class="text-2xl mb-2 animate-pulse">❤️</div>
                    <div class="text-2xl font-bold text-white">{heartRate}</div>
                    <div class="text-[10px] text-white/40 font-mono mt-1">BPM</div>
                </div>
                <!-- Sleep -->
                <div class="glass-stat-minimal group hover:scale-105 transition-all duration-300">
                    <div class="text-2xl mb-2">💤</div>
                    <div class="text-2xl font-bold text-white">{sleepScore}%</div>
                    <div class="text-[10px] text-white/40 font-mono mt-1">SLEEP</div>
                </div>
                <!-- Tasks -->
                <div class="glass-stat-minimal group hover:scale-105 transition-all duration-300">
                    <div class="text-2xl mb-2">📋</div>
                    <div class="text-2xl font-bold text-white">{todayTasks}</div>
                    <div class="text-[10px] text-white/40 font-mono mt-1">TASKS</div>
                </div>
                <!-- Active Goals -->
                <div class="glass-stat-minimal group hover:scale-105 transition-all duration-300">
                    <div class="text-2xl mb-2">🎯</div>
                    <div class="text-2xl font-bold text-white">{activeGoals.length}</div>
                    <div class="text-[10px] text-white/40 font-mono mt-1">GOALS</div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* Estilos Glass Minimalistas */
    :global(.glass-card) {
        background: rgba(15, 15, 20, 0.4);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        position: relative;
        overflow: hidden;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :global(.glass-card::before) {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.7s;
    }

    :global(.glass-card:hover::before) {
        left: 100%;
    }

    :global(.glass-stat-minimal) {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
    }

    :global(.glass-stat-minimal:hover) {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    /* Barras de estadísticas estilo videojuego */
    :global(.game-stat-bar) {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 0.5rem 0.75rem;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }

    :global(.stat-bar-label) {
        font-size: 10px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.8);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
        font-family: 'Courier New', monospace;
    }

    :global(.stat-bar-bg) {
        width: 120px;
        height: 12px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        overflow: hidden;
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    :global(.stat-bar-fill) {
        height: 100%;
        transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        box-shadow: 0 0 12px currentColor;
    }

    :global(.stat-bar-fill::after) {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: shimmer 2s infinite;
    }

    :global(.stat-bar-value) {
        font-size: 12px;
        font-weight: 700;
        color: white;
        min-width: 28px;
        text-align: right;
        font-family: 'Courier New', monospace;
    }

    /* Animaciones de videojuego */
    @keyframes shimmer {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }

    @keyframes pulse-glow {
        0%, 100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }
        50% {
            box-shadow: 0 0 40px rgba(139, 92, 246, 0.6);
        }
    }

    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-8px);
        }
    }

    @keyframes pulse-slow {
        0%, 100% {
            opacity: 0.6;
        }
        50% {
            opacity: 1;
        }
    }

    @keyframes scan-line {
        0% {
            transform: translateY(-100%);
        }
        100% {
            transform: translateY(100%);
        }
    }

    /* Aplicar animaciones */
    :global(.animate-pulse-glow) {
        animation: pulse-glow 2s ease-in-out infinite;
    }

    :global(.animate-float) {
        animation: float 3s ease-in-out infinite;
    }

    :global(.animate-pulse-slow) {
        animation: pulse-slow 3s ease-in-out infinite;
    }

    /* Transiciones suaves */
    :global(.transition-all) {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
    }

    /* Hover effects */
    :global(.hover\:scale-105:hover) {
        transform: scale(1.05);
    }

    :global(.hover\:scale-110:hover) {
        transform: scale(1.1);
    }

    :global(.hover\:scale-\[1\.02\]:hover) {
        transform: scale(1.02);
    }

    /* Gradientes animados */
    @keyframes gradient-shift {
        0%, 100% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }

    :global(.animate-gradient) {
        background-size: 200% 200%;
        animation: gradient-shift 5s ease infinite;
    }

    /* Efecto de escaneo retro */
    :global(.scan-effect) {
        position: relative;
        overflow: hidden;
    }

    :global(.scan-effect::after) {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: scan-line 4s linear infinite;
        pointer-events: none;
    }

    /* Mobile Stat Cards */
    :global(.mobile-stat-card) {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 6px;
        padding: 0.35rem 0.25rem;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
    }

    :global(.mobile-stat-card:active) {
        transform: scale(0.95);
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.15);
    }
</style>
