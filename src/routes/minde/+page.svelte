<script>
    import Brain from './Brain.svelte';
    import TaskCarousel from '../../lib/components/TaskCarousel.svelte';
    import MetricsChart from '../../lib/components/MetricsChart.svelte';

    let fillLevel = 50;

    // Datos de ejemplo mínimos para la gráfica (se pueden reemplazar por reales)
    const chartData = [0.25,0.5,0.35,0.6,0.45,0.7,0.5].map((y,i,arr)=>({ x: i/(arr.length-1), y }));
</script>

<!-- Vista mobile-only -->
<div class="md:hidden h-[calc(100dvh-4rem)] overflow-hidden">
    <!-- Layout vertical sin scroll -->
    <div class="flex flex-col h-full">
        <!-- 1) Carrusel de tareas -->
        <div class="shrink-0 z-0">
            <TaskCarousel title="Missions" />
        </div>

        <!-- 2) Cerebro responsivo al centro -->
        <div class="flex-1 px-4 flex items-center justify-center">
            <div class="w-96  h-80">
                <Brain {fillLevel} />
            </div>
        </div>

        <!-- 3) Gráfica de métricas -->
        <div class="shrink-0 mb-16 px-4 pb-2">
            <MetricsChart data={chartData} />
        </div>
    </div>
    
    <!-- Nota: El menú móvil global ya está en el layout (altura 4rem) -->
</div>

<!-- Vista escritorio -->
<div class="hidden md:flex h-screen bg-neutral-950">
    <div class="flex-1 overflow-y-auto">
        <div class="max-w-6xl mx-auto p-8">
            <h1 class="text-4xl font-bold text-white mb-8">Mind Analytics</h1>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Columna izquierda: Brain visualization -->
                <div class="flex flex-col gap-6">
                    <div class="w-full max-w-md mx-auto aspect-square">
                        <Brain {fillLevel} />
                    </div>
                    
                    <!-- Metrics Chart -->
                    <div class="w-full">
                        <h2 class="text-lg font-semibold text-white mb-4">Performance Metrics</h2>
                        <svg viewBox="0 0 360 120" class="w-full h-40">
                            <defs>
                                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#22c55e" stop-opacity="0.6"/>
                                    <stop offset="100%" stop-color="#16a34a" stop-opacity="0.1"/>
                                </linearGradient>
                            </defs>
                            <rect x="0" y="0" width="100%" height="100%" rx="12" class="fill-neutral-900 stroke-white/10" />
                            {#each chartData as point, i}
                                {@const x = 12 + point.x * (360 - 24)}
                                {@const y = 12 + (1 - point.y) * (120 - 24)}
                                {#if i === 0}
                                    <path d="M {x} {y}" class="stroke-green-400 fill-none" stroke-width="2" />
                                {:else}
                                    {@const prevPoint = chartData[i-1]}
                                    {@const prevX = 12 + prevPoint.x * (360 - 24)}
                                    {@const prevY = 12 + (1 - prevPoint.y) * (120 - 24)}
                                    <line x1={prevX} y1={prevY} x2={x} y2={y} class="stroke-green-400" stroke-width="2" />
                                {/if}
                            {/each}
                            {#each [1,2,3] as i}
                                <line x1="0" x2="100%" y1={(120/4)*i} y2={(120/4)*i} class="stroke-white/5" />
                            {/each}
                        </svg>
                    </div>
                </div>
                
                <!-- Columna derecha: Tasks carousel y additional info -->
                <div class="flex flex-col gap-6">
                    <div>
                        <h2 class="text-lg font-semibold text-white mb-4">Mind Missions</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {#each Array(6) as _, i}
                                <div class="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 transition-colors cursor-pointer">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-2xl">⭐</span>
                                        <span class="text-xs text-emerald-300 font-semibold">+30</span>
                                    </div>
                                    <div class="text-sm font-semibold text-white mb-1">Mission {i + 1}</div>
                                    <div class="text-xs text-neutral-400">Complete a quick quest</div>
                                    <div class="text-xs text-neutral-500 mt-1">Time: 30m</div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
