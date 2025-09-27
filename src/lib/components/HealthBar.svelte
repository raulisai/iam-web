<script lang="ts">
    export let value: number = 50;
    export let max: number = 100;
    export let label: string = '';
    export let color: 'green' | 'yellow' | 'red' | 'blue' = 'green';
    
    $: percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    const colors = {
        green: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
        yellow: 'bg-gradient-to-r from-amber-400 to-amber-500',
        red: 'bg-gradient-to-r from-red-400 to-red-500',
        blue: 'bg-gradient-to-r from-blue-400 to-blue-500'
    };
</script>

<div class="w-full">
    {#if label}
        <div class="flex justify-between items-center mb-1">
            <span class="text-[11px] text-white/70 font-medium">{label}</span>
            <span class="text-[10px] text-white/50">{value}/{max}</span>
        </div>
    {/if}
    <div class="h-3 bg-neutral-800 rounded-full overflow-hidden border border-white/10">
        <div 
            class="h-full {colors[color]} transition-all duration-500 ease-out relative"
            style="width: {percentage}%"
        >
            <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
    </div>
</div>
