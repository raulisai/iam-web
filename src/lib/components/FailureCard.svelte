<script context="module" lang="ts">
    export type Failure = {
        id: string;
        title: string;
        date: string;
        category: 'habit' | 'goal' | 'health' | 'productivity' | 'relationship' | 'mind' | 'body' | 'critical';
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        rootCause?: string;
        prevention?: string[];
        resolved: boolean;
    };
</script>

<script lang="ts">
    export let failure: Failure;
    
    const categoryColors = {
        habit: 'border-blue-500/30 bg-blue-500/10',
        goal: 'border-purple-500/30 bg-purple-500/10',
        health: 'border-red-500/30 bg-red-500/10',
        productivity: 'border-amber-500/30 bg-amber-500/10',
        relationship: 'border-pink-500/30 bg-pink-500/10',
        mind: 'border-purple-500/30 bg-purple-500/10',
        body: 'border-blue-500/30 bg-blue-500/10',
        critical: 'border-red-600/30 bg-red-600/10'
    };
    
    const severityColors = {
        low: 'text-yellow-400',
        medium: 'text-orange-400',
        high: 'text-red-400',
        critical: 'text-red-600'
    };
    
    const categoryIcons = {
        habit: '🔄',
        goal: '🎯',
        health: '❤️',
        productivity: '⚡',
        relationship: '🤝',
        mind: '🧠',
        body: '💪',
        critical: '🚨'
    };
</script>

<div class="rounded-xl border {categoryColors[failure.category]} p-4 relative">
    <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
            <span class="text-2xl">{categoryIcons[failure.category]}</span>
            <div>
                <h3 class="text-sm font-semibold text-white">{failure.title}</h3>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-[10px] text-white/50">{failure.date}</span>
                    <span class="text-[10px] {severityColors[failure.severity]}">● {failure.severity}</span>
                </div>
            </div>
        </div>
        {#if failure.resolved}
            <span class="text-emerald-400 text-xs">✓ Resolved</span>
        {/if}
    </div>
    
    <p class="text-[11px] text-white/70 mb-3">{failure.description}</p>
    
    {#if failure.rootCause}
        <div class="mb-3">
            <h4 class="text-[10px] text-white/50 uppercase mb-1">Root Cause</h4>
            <p class="text-[11px] text-white/80">{failure.rootCause}</p>
        </div>
    {/if}
    
    {#if failure.prevention && failure.prevention.length > 0}
        <div>
            <h4 class="text-[10px] text-white/50 uppercase mb-1">Prevention Strategy</h4>
            <ul class="space-y-1">
                {#each failure.prevention as step}
                    <li class="text-[11px] text-white/80 flex items-start gap-1">
                        <span class="text-emerald-400 mt-0.5">→</span>
                        <span>{step}</span>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>
