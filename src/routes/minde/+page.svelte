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
        <div class="shrink-0">
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

<!-- Opcional: placeholder en escritorio -->
<div class="hidden md:flex items-center justify-center h-screen text-neutral-400">
    <p>Esta vista está optimizada para móvil.</p>
    
</div>
