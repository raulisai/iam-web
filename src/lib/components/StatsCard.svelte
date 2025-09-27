<script lang="ts">
    export let title: string = '';
    export let value: string | number = '';
    export let subtitle: string = '';
    export let icon: string = '📊';
    export let trend: 'up' | 'down' | 'neutral' = 'neutral';
    export let color: 'emerald' | 'amber' | 'red' | 'blue' = 'blue';
    
    const colors = {
        emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
        amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
        red: 'from-red-500/20 to-red-600/20 border-red-500/30',
        blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30'
    };
</script>

<div class="rounded-xl border border-white/10 bg-gradient-to-br {colors[color]} p-3 relative overflow-hidden">
    <div class="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/5 blur-xl"></div>
    <div class="relative">
        <div class="flex items-center justify-between mb-2">
            <span class="text-2xl">{icon}</span>
            {#if trend !== 'neutral'}
                <span class="text-xs">
                    {#if trend === 'up'}
                        <span class="text-emerald-400">↑</span>
                    {:else}
                        <span class="text-red-400">↓</span>
                    {/if}
                </span>
            {/if}
        </div>
        <div class="text-white/60 text-[10px] font-medium uppercase tracking-wider">{title}</div>
        <div class="text-white text-lg font-bold">{value}</div>
        {#if subtitle}
            <div class="text-white/50 text-[11px] mt-1">{subtitle}</div>
        {/if}
    </div>
</div>
