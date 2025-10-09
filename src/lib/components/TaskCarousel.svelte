<script lang="ts">
    import { goto } from '$app/navigation';
    import { createEventDispatcher } from 'svelte';

    type Task = {
        id: string;
        title: string;
        durationMinutes?: number; // e.g. 30
        points?: number; // e.g. 30
        summary?: string;
        rating?: number; // 0..5
        icon?: string; // emoji or short text
    };

    export let tasks: Task[] = [];
    export let title: string = 'Tasks';
    export let isLoading: boolean = false;
    export let category: 'mind' | 'body' = 'mind';

    const dispatch = createEventDispatcher<{ 
        done: { id: string };
        addTask: void;
    }>();
    const onDone = (id: string) => dispatch('done', { id });
    const onAddTask = () => dispatch('addTask');
</script>

<section class="w-full h-48">
    <div class="px-4 pt-2">
        <h2 class="text-white/90 font-semibold tracking-wide">{title}</h2>
    </div>
    <div class="relative h-[calc(100%-1.75rem)]">
        <div class="absolute inset-0 overflow-x-auto overflow-y-hidden px-4">
            <div class="flex h-full items-center gap-3 py-1 pr-4 will-change-transform {tasks.length === 0 && !isLoading ? 'justify-center' : ''}">
                {#if isLoading}
                    <!-- Skeleton Loader -->
                    {#each Array(4) as _, i}
                        <div class="shrink-0 w-36 h-32 rounded-xl border border-white/10 bg-gradient-to-br from-neutral-800 to-neutral-900 animate-pulse">
                            <div class="h-full p-2 flex flex-col">
                                <div class="flex items-center gap-2">
                                    <div class="w-6 h-6 bg-neutral-700 rounded-full"></div>
                                    <div class="flex-1">
                                        <div class="h-3 bg-neutral-700 rounded w-3/4"></div>
                                    </div>
                                </div>
                                <div class="mt-2 h-2 bg-neutral-700 rounded w-1/2"></div>
                                <div class="mt-1 h-2 bg-neutral-700 rounded w-full"></div>
                                <div class="mt-1 h-2 bg-neutral-700 rounded w-4/5"></div>
                                <div class="mt-auto flex items-center justify-between">
                                    <div class="flex gap-1">
                                        {#each Array(5) as _}
                                            <div class="w-3 h-3 bg-neutral-700 rounded-full"></div>
                                        {/each}
                                    </div>
                                    <div class="h-3 bg-neutral-700 rounded w-8"></div>
                                </div>
                            </div>
                        </div>
                    {/each}
                {:else if tasks.length === 0}
                    <!-- Empty State con botón de agregar -->
                    <div 
                        class="shrink-0 w-56 h-32 rounded-xl border-2 border-dashed {category === 'body' ? 'border-orange-500/30 bg-gradient-to-br from-orange-950/20 to-neutral-900/50' : 'border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-neutral-900/50'} flex flex-col items-center justify-center p-4 cursor-pointer hover:scale-105 transition-transform duration-200"
                        role="button"
                        tabindex="0"
                        aria-label="Add new task"
                        on:click={onAddTask}
                        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAddTask(); } }}
                    >
                        <div class="text-3xl mb-1">{category === 'body' ? '🏃' : '🧠'}</div>
                        <div class="text-xs font-semibold text-white text-center mb-2">No Tasks Yet</div>
                        <button 
                            class="px-3 py-1.5 rounded-lg bg-gradient-to-r {category === 'body' ? 'from-orange-500 to-red-500' : 'from-purple-500 to-indigo-500'} text-white text-[10px] font-semibold flex items-center gap-1 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
                            on:click|stopPropagation={onAddTask}
                        >
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                            Add Task
                        </button>
                    </div>
                {:else}
                    {#each tasks as t (t.id)}
                        {@const icon = t.icon ?? '⭐'}
                        {@const duration = t.durationMinutes ?? 30}
                        {@const points = t.points ?? 30}
                        {@const rating = Math.min(5, Math.max(0, t.rating ?? 0))}
                        <div
                            class="shrink-0 w-40 h-32 rounded-xl border border-white/10 bg-gradient-to-br from-neutral-800 to-neutral-900 shadow-[0_6px_20px_-8px_rgba(0,0,0,0.8)] relative overflow-hidden"
                            role="button"
                            tabindex="0"
                            aria-label={`Abrir ${t.title}`}
                            on:click={() => goto(`/tasks/${t.id}`)}
                            on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goto(`/tasks/${t.id}`); } }}
                        >
                            <div class="absolute inset-0 pointer-events-none">
                                <div class="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-amber-500/10 blur-xl"></div>
                                <div class="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-yellow-400/10 blur-xl"></div>
                            </div>
                            <div class="relative h-full p-2 flex flex-col">
                                <button 
                                    aria-label="Done" 
                                    class="absolute top-1 right-1 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 border-2 border-emerald-400/50 text-white flex items-center justify-center shadow-lg hover:shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-200 hover:rotate-12" 
                                    on:click|stopPropagation={() => onDone(t.id)}
                                >
                                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                </button>
                                <div class="flex items-center gap-2">
                                    <div class="w-6 h-6 rounded-full bg-neutral-700/80 border border-white/10 flex items-center justify-center text-sm">{icon}</div>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-[11px] font-semibold text-white/90 truncate">{t.title}</div>
                                    </div>
                                </div>
                                <div class="mt-1 text-[10px] text-neutral-300/80 flex items-center gap-2">
                                    <span>Time: {duration}m</span>
                                </div>
                                {#if t.summary}
                                    <div class="mt-1 text-[10px] text-neutral-200/80 line-clamp-2 leading-snug">{t.summary}</div>
                                {/if}
                                <div class="mt-auto pt-1 flex items-center justify-between">
                                    <div class="flex items-center gap-0.5">
                                        {#each Array(5) as _, idx}
                                            <svg class={`w-3.5 h-3.5 ${idx < rating ? 'text-yellow-300' : 'text-neutral-600'}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                                            </svg>
                                        {/each}
                                    </div>
                                    <div class="text-[11px] text-emerald-300/90 font-bold">+{points}</div>
                                </div>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</section>


