<script lang="ts">
    export let tasks: { title: string }[] = [];
    export let title: string = 'Tasks';
</script>

<section class="w-full h-28 md:hidden">
    <div class="px-4 pt-2">
        <h2 class="text-white/90 font-semibold tracking-wide">{title}</h2>
    </div>
    <div class="relative h-[calc(100%-1.75rem)]">
        <div class="absolute inset-0 overflow-hidden">
            <div class="flex h-full items-center gap-3 px-4 animate-[carousel_20s_linear_infinite] will-change-transform">
                {#if tasks.length === 0}
                    {#each Array(6) as _}
                        <div class="shrink-0 w-28 h-20 rounded-xl bg-gradient-to-br from-amber-500/80 to-yellow-400/80 border border-white/10 shadow-lg shadow-amber-500/10 flex items-center justify-center">
                            <div class="flex items-center gap-1 text-yellow-100">
                                <span class="text-xl">⭐</span>
                                <span class="text-xs font-semibold">Mission</span>
                            </div>
                        </div>
                    {/each}
                {:else}
                    {#each tasks as t}
                        <div class="shrink-0 w-28 h-20 rounded-xl bg-neutral-800 border border-white/10 shadow-lg flex items-center justify-center">
                            <div class="flex items-center gap-1 text-yellow-300">
                                <span class="text-xl">⭐</span>
                                <span class="text-xs font-semibold truncate max-w-[5.5rem]">{t.title}</span>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</section>

<style>
@keyframes carousel {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
