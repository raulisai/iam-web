<script lang="ts">
    // data: puntos normalizados 0..1
    export let data: { x: number; y: number }[] = [];

    const width = 360;
    const height = 120;
    const padding = 12;

    $: points = (data?.length ? data : [0.1,0.4,0.3,0.6,0.45,0.7,0.35].map((y,i,arr)=>({
        x: i/(arr.length-1),
        y
    }))).map(p => ({
        x: padding + p.x * (width - padding*2),
        y: padding + (1 - p.y) * (height - padding*2)
    }));

    $: d = points.reduce((acc,p,i)=> acc + (i===0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '');
</script>

<section class="w-full h-40 md:hidden">
    <svg viewBox={`0 0 ${width} ${height}`} class="w-full h-full">
        <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#22c55e" stop-opacity="0.6"/>
                <stop offset="100%" stop-color="#16a34a" stop-opacity="0.1"/>
            </linearGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" rx="12" class="fill-neutral-900 stroke-white/10" />
        <path d={d} class="stroke-green-400 fill-none" stroke-width="2" />
        <path d={`${d} L ${points[points.length-1]?.x ?? 0} ${height - padding} L ${points[0]?.x ?? 0} ${height - padding} Z`} fill="url(#grad)" class="opacity-60" />
        <!-- grid -->
        {#each [1,2,3] as i}
            <line x1="0" x2="100%" y1={(height/4)*i} y2={(height/4)*i} class="stroke-white/5" />
        {/each}
    </svg>
</section>
