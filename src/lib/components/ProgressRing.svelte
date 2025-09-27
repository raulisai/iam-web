<script lang="ts">
    export let progress: number = 0;
    export let size: number = 120;
    export let strokeWidth: number = 8;
    export let label: string = '';
    export let sublabel: string = '';
    
    $: radius = (size - strokeWidth) / 2;
    $: circumference = radius * 2 * Math.PI;
    $: strokeDasharray = circumference;
    $: strokeDashoffset = circumference - (progress / 100) * circumference;
</script>

<div class="relative inline-flex items-center justify-center">
    <svg width={size} height={size} class="-rotate-90">
        <!-- Background circle -->
        <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            stroke-width={strokeWidth}
            fill="none"
            class="text-neutral-700"
        />
        <!-- Progress circle -->
        <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            stroke-width={strokeWidth}
            fill="none"
            stroke-linecap="round"
            class="text-emerald-400 transition-all duration-500 ease-out"
            style="stroke-dasharray: {strokeDasharray}; stroke-dashoffset: {strokeDashoffset}"
        />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
        <div class="text-2xl font-bold text-white">{Math.round(progress)}%</div>
        {#if label}
            <div class="text-[10px] text-white/70 font-medium">{label}</div>
        {/if}
        {#if sublabel}
            <div class="text-[9px] text-white/50">{sublabel}</div>
        {/if}
    </div>
</div>
