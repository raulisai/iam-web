<script lang="ts">
    export let icon: string = '🚀';
    export let label: string = '';
    export let sublabel: string = '';
    export let color: 'blue' | 'green' | 'purple' | 'amber' | 'red' = 'blue';
    export let onClick: () => void = () => {};
    
    const colors = {
        blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 active:bg-blue-500/30',
        green: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 active:bg-emerald-500/30',
        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 active:bg-purple-500/30',
        amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 active:bg-amber-500/30',
        red: 'from-red-500/20 to-red-600/20 border-red-500/30 active:bg-red-500/30'
    };
</script>

<button 
    class="w-full rounded-xl border bg-gradient-to-br {colors[color]} p-3 transition-all active:scale-95" 
    on:click={onClick}
>
    <div class="flex flex-col items-center gap-1">
        <span class="text-2xl">{icon}</span>
        <span class="text-[11px] font-medium text-white">{label}</span>
        {#if sublabel}
            <span class="text-[9px] text-white/50">{sublabel}</span>
        {/if}
    </div>
</button>
