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
        <!-- Header con saludo -->
        <div class="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-neutral-900 to-neutral-950">
            <div class="flex items-center justify-between">
                <div class="transition-all duration-700" class:translate-y-0={isVisible} class:-translate-y-4={!isVisible} class:opacity-100={isVisible} class:opacity-0={!isVisible}>
                    <h1 class="text-2xl font-bold text-white">Performance Hub</h1>
                    <p class="text-xs text-white/60 mt-1">
                        {#if !isLoadingStats}
                            Overall Score: {overallScore}% • {todayTasks} tasks today
                        {:else}
                            Loading your data...
                        {/if}
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        onclick={() => goto("/onboarding")}
                        class="px-3 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 border border-purple-400/30 flex items-center justify-center gap-2 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 hover:scale-105"
                        title="Recalibrar Perfil"
                    >
                        <span class="text-sm">🎯</span>
                        <span class="text-xs font-semibold text-white">Setup</span>
                    </button>
                    <button
                        onclick={() => goto("/profile")}
                        class="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center hover:bg-neutral-700 transition-all duration-300 hover:scale-110"
                        title="Mi Perfil"
                    >
                        <span class="text-lg">👤</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Contenido scrolleable -->
        <div class="flex-1 overflow-y-auto">
            <!-- Tasks Now Carousel - Mobile -->
            <div class="px-4 py-4">
                <TasksNowCarousel 
                    token={getAuthContext().getToken() ?? ''} 
                    carouselHeight="350px"
                    onTaskClick={(task) => {
                        // Redirigir según el tipo de tarea
                        if (task.type === 'goal') goto(`/goals/${task.task_id}`);
                        else if (task.type === 'mind') goto('/minde');
                        else if (task.type === 'body') goto('/body');
                    }}
                />
            </div>

            <!-- Mind & Body Visualization -->
            <div class="px-4 py-4">
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <!-- Mind Component -->
                    <div 
                        role="button"
                        tabindex="0"
                        class="relative bg-gradient-to-br from-blue-950/40 to-purple-950/40 rounded-2xl p-3 border border-blue-500/20 overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer"
                        onclick={() => goto("/minde")}
                        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto('/minde')}
                        class:translate-x-0={isVisible} 
                        class:-translate-x-full={!isVisible}
                        class:opacity-100={isVisible} 
                        class:opacity-0={!isVisible}
                    >
                        <div class="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
                        <div class="relative z-10">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-bold text-blue-300">MIND</span>
                                <span class="text-lg font-bold text-white">{mindScore}%</span>
                            </div>
                            <div class="w-full h-32 relative">
                                <Brain fillLevel={mindScore} />
                            </div>
                            <div class="mt-2 text-[10px] text-white/60">
                                Attention: {attention}%
                            </div>
                        </div>
                    </div>

                    <!-- Body Component -->
                    <div 
                        role="button"
                        tabindex="0"
                        class="relative bg-gradient-to-br from-green-950/40 to-emerald-950/40 rounded-2xl p-3 border border-green-500/20 overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer"
                        onclick={() => goto("/body")}
                        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto('/body')}
                        class:translate-x-0={isVisible} 
                        class:translate-x-full={!isVisible}
                        class:opacity-100={isVisible} 
                        class:opacity-0={!isVisible}
                    >
                        <div class="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent"></div>
                        <div class="relative z-10">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-lg font-bold text-white">{bodyScore}%</span>
                            </div>
                            <div class="w-full h-32 relative">
                                <Body energy={energy} stamina={stamina} fillLevel={bodyScore} />
                            </div>
                            <div class="mt-2 text-[10px] text-white/60">
                                Energy: {energy}%
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Overall Progress Ring -->
                <div class="flex justify-center py-2">
                    <div class="relative transition-all duration-700" class:scale-100={isVisible} class:scale-0={!isVisible}>
                        <ProgressRing
                            progress={overallScore}
                            size={120}
                            strokeWidth={10}
                            label="Overall"
                            sublabel={isLoadingStats ? "Loading..." : `${overallScore}%`}
                        />
                    </div>
                </div>
            </div>

            <!-- Detailed Health Metrics -->
            <div class="px-4 mb-4">
                <h2 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span class="text-lg">📊</span>
                    Detailed Metrics
                </h2>
                <div class="space-y-2">
                    <HealthBar value={energy} max={100} label="Energy" color="green" />
                    <HealthBar value={stamina} max={100} label="Stamina" color="blue" />
                    <HealthBar value={strength} max={100} label="Strength" color="red" />
                    <HealthBar value={flexibility} max={100} label="Flexibility" color="yellow" />
                    <HealthBar value={attention} max={100} label="Attention" color="blue" />
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="px-4 mb-4">
                <h2 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span class="text-lg">📈</span>
                    Today's Stats
                </h2>
                <div class="grid grid-cols-2 gap-3">
                    <StatsCard
                        title="Tasks"
                        value={`${todayTasks}`}
                        subtitle={`${mindTasks.length} mind • ${bodyTasks.length} body`}
                        icon="📋"
                        trend="neutral"
                        color="blue"
                    />
                    <StatsCard
                        title="Goals"
                        value={`${activeGoals.length}`}
                        subtitle="Active goals"
                        icon="🎯"
                        trend="up"
                        color="amber"
                    />
                    <StatsCard
                        title="Calories"
                        value={caloriesBurned}
                        subtitle="Burned today"
                        icon="🔥"
                        trend="up"
                        color="red"
                    />
                    <StatsCard
                        title="Steps"
                        value={stepsDailyValue}
                        subtitle="Daily steps"
                        icon="👟"
                        trend="neutral"
                        color="emerald"
                    />
                    <StatsCard
                        title="Heart Rate"
                        value={`${heartRate}`}
                        subtitle="BPM resting"
                        icon="❤️"
                        trend="down"
                        color="red"
                    />
                    <StatsCard
                        title="Sleep"
                        value={`${sleepScore}%`}
                        subtitle="Sleep quality"
                        icon="💤"
                        trend="up"
                        color="blue"
                    />
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="px-4 mb-4">
                <h2 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span class="text-lg">⚡</span>
                    Quick Actions
                </h2>
                <div class="grid grid-cols-4 gap-2">
                    {#each quickActions as action}
                        <QuickAction {...action} />
                    {/each}
                </div>
            </div>

            <!-- Task Overview -->
            <div class="px-4 pb-6">
                <h2 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span class="text-lg">✅</span>
                    Today's Tasks
                </h2>
                <div class="space-y-2">
                    {#if mindTasks.length > 0}
                        <div class="p-3 rounded-lg bg-gradient-to-r from-blue-950/40 to-purple-950/40 border border-blue-500/20">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="text-xs font-semibold text-blue-300">Mind Tasks</div>
                                    <div class="text-sm text-white mt-1">{mindTasks.length} tasks pending</div>
                                </div>
                                <button 
                                    onclick={() => goto("/minde")}
                                    class="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-semibold hover:bg-blue-500/30 transition-colors"
                                >
                                    View →
                                </button>
                            </div>
                        </div>
                    {/if}
                    {#if bodyTasks.length > 0}
                        <div class="p-3 rounded-lg bg-gradient-to-r from-green-950/40 to-emerald-950/40 border border-green-500/20">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="text-xs font-semibold text-green-300">Body Tasks</div>
                                    <div class="text-sm text-white mt-1">{bodyTasks.length} tasks pending</div>
                                </div>
                                <button 
                                    onclick={() => goto("/body")}
                                    class="px-3 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs font-semibold hover:bg-green-500/30 transition-colors"
                                >
                                    View →
                                </button>
                            </div>
                        </div>
                    {/if}
                    {#if activeGoals.length > 0}
                        <div class="p-3 rounded-lg bg-gradient-to-r from-amber-950/40 to-yellow-950/40 border border-amber-500/20">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="text-xs font-semibold text-amber-300">Active Goals</div>
                                    <div class="text-sm text-white mt-1">{activeGoals.length} goals in progress</div>
                                </div>
                                <button 
                                    onclick={() => goto("/goals")}
                                    class="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors"
                                >
                                    View →
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Vista escritorio -->
<div class="hidden md:block bg-neutral-950 min-h-screen">
    <div class="max-w-7xl mx-auto p-8">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
            <div class="transition-all duration-700" class:translate-y-0={isVisible} class:-translate-y-4={!isVisible} class:opacity-100={isVisible} class:opacity-0={!isVisible}>
                <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Performance Hub
                </h1>
                <p class="text-sm text-white/60 mt-2">
                    {#if !isLoadingStats}
                        Overall Score: {overallScore}% • {todayTasks} tasks today • {activeGoals.length} active goals
                    {:else}
                        Loading your performance data...
                    {/if}
                </p>
            </div>
            <div class="flex items-center gap-3">
                <button
                    onclick={() => goto("/onboarding")}
                    class="px-4 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 border border-purple-400/30 flex items-center justify-center gap-2 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/20"
                    title="Recalibrar Perfil / Setup Inicial"
                >
                    <span class="text-lg">🎯</span>
                    <span class="text-sm font-semibold text-white">Recalibrar</span>
                </button>
                <button
                    onclick={() => goto("/profile")}
                    class="w-12 h-12 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center hover:bg-neutral-700 transition-all duration-300 hover:scale-110"
                    title="Mi Perfil"
                >
                    <span class="text-xl">👤</span>
                </button>
            </div>
        </div>

        <!-- Tasks Now Carousel - Desktop -->
        <div class="mb-8">
            <TasksNowCarousel 
                token={getAuthContext().getToken() ?? ''} 
                carouselHeight="420px"
                onTaskClick={(task) => {
                    // Redirigir según el tipo de tarea
                    if (task.type === 'goal') goto(`/goals/${task.task_id}`);
                    else if (task.type === 'mind') goto('/minde');
                    else if (task.type === 'body') goto('/body');
                }}
            />
        </div>

        <!-- Main Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <!-- Columna Izquierda: Mind & Body Visualizations -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Mind & Body Cards -->
                <div class="grid grid-cols-2 gap-6">
                    <!-- Mind Visualization -->
                    <div 
                        role="button"
                        tabindex="0"
                        class="relative bg-gradient-to-br from-blue-950/40 to-purple-950/40 rounded-2xl p-6 border border-blue-500/20 overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer group"
                        onclick={() => goto("/minde")}
                        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto('/minde')}
                        class:translate-x-0={isVisible} 
                        class:-translate-x-full={!isVisible}
                        class:opacity-100={isVisible} 
                        class:opacity-0={!isVisible}
                    >
                        <div class="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent group-hover:from-blue-500/20 transition-all duration-300"></div>
                        <div class="relative z-10">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <span class="text-sm font-bold text-blue-300">MIND SYSTEM</span>
                                    <div class="text-3xl font-bold text-white mt-1">{mindScore}%</div>
                                </div>
                                <div class="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <span class="text-3xl">🧠</span>
                                </div>
                            </div>
                            <div class="w-full h-48 relative mb-4">
                                <Brain fillLevel={mindScore} />
                            </div>
                            <div class="flex justify-between text-xs">
                                <div>
                                    <div class="text-white/60">Attention</div>
                                    <div class="text-white font-semibold">{attention}%</div>
                                </div>
                                <div>
                                    <div class="text-white/60">Tasks</div>
                                    <div class="text-white font-semibold">{mindTasks.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Body Visualization -->
                    <div 
                        role="button"
                        tabindex="0"
                        class="relative bg-gradient-to-br from-green-950/40 to-emerald-950/40 rounded-2xl p-6 border border-green-500/20 overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer group"
                        onclick={() => goto("/body")}
                        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto('/body')}
                        class:translate-x-0={isVisible} 
                        class:translate-x-full={!isVisible}
                        class:opacity-100={isVisible} 
                        class:opacity-0={!isVisible}
                    >
                        <div class="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent group-hover:from-green-500/20 transition-all duration-300"></div>
                        <div class="relative z-10">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <span class="text-sm font-bold text-green-300">BODY SYSTEM</span>
                                    <div class="text-3xl font-bold text-white mt-1">{bodyScore}%</div>
                                </div>
                                <div class="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <span class="text-3xl">💪</span>
                                </div>
                            </div>
                            <div class="w-full h-48 relative mb-4">
                                <Body energy={energy} stamina={stamina} fillLevel={bodyScore} />
                            </div>
                            <div class="flex justify-between text-xs">
                                <div>
                                    <div class="text-white/60">Energy</div>
                                    <div class="text-white font-semibold">{energy}%</div>
                                </div>
                                <div>
                                    <div class="text-white/60">Tasks</div>
                                    <div class="text-white font-semibold">{bodyTasks.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Detailed Health Metrics -->
                <div class="bg-neutral-900/40 rounded-2xl p-6 border border-white/10">
                    <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span class="text-xl">📊</span>
                        Detailed Performance Metrics
                    </h2>
                    <div class="space-y-3">
                        <HealthBar value={energy} max={100} label="Energy" color="green" />
                        <HealthBar value={stamina} max={100} label="Stamina" color="blue" />
                        <HealthBar value={strength} max={100} label="Strength" color="red" />
                        <HealthBar value={flexibility} max={100} label="Flexibility" color="yellow" />
                        <HealthBar value={attention} max={100} label="Attention" color="blue" />
                    </div>
                </div>
            </div>

            <!-- Columna Derecha: Overall Score & Stats -->
            <div class="space-y-6">
                <!-- Overall Score Ring -->
                <div class="bg-neutral-900/40 rounded-2xl p-6 border border-white/10 flex flex-col items-center">
                    <div class="relative transition-all duration-700" class:scale-100={isVisible} class:scale-0={!isVisible}>
                        <ProgressRing
                            progress={overallScore}
                            size={180}
                            strokeWidth={12}
                            label="Overall"
                            sublabel={isLoadingStats ? "Loading..." : `${overallScore}%`}
                        />
                        <div class="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 border-2 border-neutral-950 flex items-center justify-center animate-pulse">
                            <span class="text-sm font-bold text-white">↑</span>
                        </div>
                    </div>
                    <div class="mt-4 text-center">
                        <div class="text-sm text-white/60">Performance Score</div>
                        <div class="text-xs text-white/40 mt-1">Mind: {mindScore}% • Body: {bodyScore}%</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-neutral-900/40 rounded-2xl p-6 border border-white/10">
                    <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span class="text-xl">⚡</span>
                        Quick Actions
                    </h2>
                    <div class="grid grid-cols-2 gap-3">
                        {#each quickActions as action}
                            <QuickAction {...action} />
                        {/each}
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="mb-8">
            <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span class="text-xl">📈</span>
                Today's Statistics
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatsCard
                    title="Tasks"
                    value={`${todayTasks}`}
                    subtitle={`${mindTasks.length + bodyTasks.length} pending`}
                    icon="📋"
                    trend="neutral"
                    color="blue"
                />
                <StatsCard
                    title="Goals"
                    value={`${activeGoals.length}`}
                    subtitle="Active"
                    icon="🎯"
                    trend="up"
                    color="amber"
                />
                <StatsCard
                    title="Calories"
                    value={caloriesBurned}
                    subtitle="Burned"
                    icon="🔥"
                    trend="up"
                    color="red"
                />
                <StatsCard
                    title="Steps"
                    value={stepsDailyValue}
                    subtitle="Daily"
                    icon="👟"
                    trend="neutral"
                    color="emerald"
                />
                <StatsCard
                    title="Heart Rate"
                    value={`${heartRate}`}
                    subtitle="BPM"
                    icon="❤️"
                    trend="down"
                    color="red"
                />
                <StatsCard
                    title="Sleep"
                    value={`${sleepScore}%`}
                    subtitle="Quality"
                    icon="💤"
                    trend="up"
                    color="blue"
                />
            </div>
        </div>

        <!-- Task Overview -->
        <div class="mb-8">
            <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span class="text-xl">✅</span>
                Active Tasks & Goals
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                {#if mindTasks.length > 0}
                    <div role="button" tabindex="0" class="p-6 rounded-xl bg-gradient-to-br from-blue-950/40 to-purple-950/40 border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer" onclick={() => goto("/minde")} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto('/minde')}>
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <span class="text-2xl">🧠</span>
                            </div>
                            <div>
                                <div class="text-sm font-semibold text-blue-300">Mind Tasks</div>
                                <div class="text-2xl font-bold text-white">{mindTasks.length}</div>
                            </div>
                        </div>
                        <div class="text-xs text-white/60">Pending tasks</div>
                    </div>
                {/if}
                {#if bodyTasks.length > 0}
                    <div role="button" tabindex="0" class="p-6 rounded-xl bg-gradient-to-br from-green-950/40 to-emerald-950/40 border border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer" onclick={() => goto("/body")} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto('/body')}>
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                <span class="text-2xl">💪</span>
                            </div>
                            <div>
                                <div class="text-sm font-semibold text-green-300">Body Tasks</div>
                                <div class="text-2xl font-bold text-white">{bodyTasks.length}</div>
                            </div>
                        </div>
                        <div class="text-xs text-white/60">Pending tasks</div>
                    </div>
                {/if}
                {#if activeGoals.length > 0}
                    <div role="button" tabindex="0" class="p-6 rounded-xl bg-gradient-to-br from-amber-950/40 to-yellow-950/40 border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer" onclick={() => goto("/goals")} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goto('/goals')}>
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <span class="text-2xl">🎯</span>
                            </div>
                            <div>
                                <div class="text-sm font-semibold text-amber-300">Active Goals</div>
                                <div class="text-2xl font-bold text-white">{activeGoals.length}</div>
                            </div>
                        </div>
                        <div class="text-xs text-white/60">In progress</div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    /* Animaciones personalizadas */
    @keyframes pulse-glow {
        0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
        }
    }

    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    /* Aplicar animaciones suaves a elementos interactivos */
    :global(.animate-pulse-glow) {
        animation: pulse-glow 3s ease-in-out infinite;
    }

    :global(.animate-float) {
        animation: float 3s ease-in-out infinite;
    }

    /* Transiciones suaves para todos los elementos */
    :global(.transition-all) {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 300ms;
    }

    /* Efecto hover mejorado */
    :global(.hover\:scale-105:hover) {
        transform: scale(1.05);
    }

    :global(.hover\:scale-110:hover) {
        transform: scale(1.1);
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
</style>
