<script lang="ts">
    import FailureCard from '../../lib/components/FailureCard.svelte';
    import type { Failure } from '../../lib/components/FailureCard.svelte';
    import StatsCard from '../../lib/components/StatsCard.svelte';
    
    const failures: Failure[] = [
        {
            id: 'f1',
            title: 'Skipped workout 3 days',
            date: '2024-01-05',
            category: 'health',
            severity: 'medium',
            description: 'Perdí consistencia en mi rutina de ejercicio por falta de motivación y mal clima.',
            rootCause: 'No tener un plan B para días de lluvia y depender solo de ejercicio al aire libre.',
            prevention: [
                'Tener rutina indoor preparada',
                'Usar app de recordatorios',
                'Preparar ropa la noche anterior'
            ],
            resolved: true
        },
        {
            id: 'f2',
            title: 'Project deadline missed',
            date: '2024-01-03',
            category: 'productivity',
            severity: 'high',
            description: 'No completé el proyecto a tiempo por mala estimación y procrastinación.',
            rootCause: 'Subestimé la complejidad y no dividí el trabajo en tareas pequeñas.',
            prevention: [
                'Usar método Pomodoro',
                'Breakdown de tareas en subtareas de max 2h',
                'Buffer time del 20% en estimaciones'
            ],
            resolved: false
        },
        {
            id: 'f3',
            title: 'Broke diet plan',
            date: '2024-01-04',
            category: 'habit',
            severity: 'low',
            description: 'Comí comida chatarra en evento social sin planificación.',
            rootCause: 'No preparé alternativas saludables antes del evento.',
            prevention: [
                'Comer algo saludable antes de eventos',
                'Llevar snacks propios',
                'Permitir 1 cheat meal planeado por semana'
            ],
            resolved: true
        },
        {
            id: 'f4',
            title: 'Argument with partner',
            date: '2024-01-02',
            category: 'relationship',
            severity: 'medium',
            description: 'Discusión por falta de comunicación sobre expectativas.',
            rootCause: 'Asumí en lugar de preguntar y acumule frustración.',
            prevention: [
                'Check-in semanal de 15 min',
                'Expresar necesidades claramente',
                'No asumir, siempre preguntar'
            ],
            resolved: true
        }
    ];

    const totalFailures = failures.length;
    const resolvedFailures = failures.filter(f => f.resolved).length;
    const highSeverity = failures.filter(f => f.severity === 'high').length;
    
    // Agrupar por categoría
    const failuresByCategory = failures.reduce((acc, f) => {
        if (!acc[f.category]) acc[f.category] = [];
        acc[f.category].push(f);
        return acc;
    }, {} as Record<string, Failure[]>);
</script>

<!-- Vista mobile-only -->
<div class="md:hidden h-[calc(100dvh-4rem)] overflow-hidden bg-neutral-950">
    <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-white/10">
            <h1 class="text-xl font-bold text-white">Failure Analysis</h1>
            <p class="text-xs text-white/60 mt-1">Learn from mistakes to prevent recurrence</p>
        </div>

        <!-- Stats -->
        <div class="px-4 py-3">
            <div class="grid grid-cols-3 gap-2">
                <StatsCard 
                    title="Total" 
                    value={totalFailures} 
                    icon="📊" 
                    color="blue"
                />
                <StatsCard 
                    title="Resolved" 
                    value={`${resolvedFailures}/${totalFailures}`} 
                    icon="✅" 
                    color="emerald"
                />
                <StatsCard 
                    title="Critical" 
                    value={highSeverity} 
                    icon="⚠️" 
                    color="red"
                />
            </div>
        </div>

        <!-- Failures list -->
        <div class="flex-1 overflow-y-auto px-4 pb-4">
            <div class="space-y-4">
                {#each Object.entries(failuresByCategory) as [category, categoryFailures]}
                    <div>
                        <h2 class="text-xs font-semibold text-white/50 uppercase mb-2">{category}</h2>
                        <div class="space-y-3">
                            {#each categoryFailures as failure}
                                <FailureCard {failure} />
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Floating action button -->
        <button class="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 flex items-center justify-center text-2xl">
            +
        </button>
    </div>
</div>

<!-- Placeholder escritorio -->
<div class="hidden md:flex items-center justify-center h-screen bg-neutral-950 text-neutral-400">
    <p>Failure Analysis - Optimizado para móvil</p>
</div>