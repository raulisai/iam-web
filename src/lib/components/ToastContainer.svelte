<script lang="ts">
    import { toastStore } from '$lib/stores/toast.svelte';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    const typeStyles = {
        success: 'bg-gradient-to-r from-emerald-500 to-green-500 border-emerald-400',
        error: 'bg-gradient-to-r from-red-500 to-rose-500 border-red-400',
        info: 'bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-400'
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };
</script>

<div class="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    {#each toastStore.toasts as toast (toast.id)}
        <div
            class="pointer-events-auto"
            transition:fly={{ y: -20, duration: 300, easing: quintOut }}
        >
            <div class={`${typeStyles[toast.type]} border-2 rounded-2xl shadow-2xl backdrop-blur-sm p-4 min-w-[280px] max-w-[400px]`}>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-bounce-subtle">
                        <span class="text-2xl text-white font-bold">{icons[toast.type]}</span>
                    </div>
                    
                    <div class="flex-1">
                        <p class="text-white font-semibold text-sm leading-tight">{toast.message}</p>
                        {#if toast.points && toast.points > 0}
                            <div class="mt-1 flex items-center gap-1">
                                <span class="text-yellow-300 text-lg animate-pulse">⭐</span>
                                <span class="text-yellow-200 font-bold text-base">+{toast.points} puntos</span>
                            </div>
                        {/if}
                    </div>

                    <button
                        onclick={() => toastStore.remove(toast.id)}
                        class="text-white/70 hover:text-white transition-colors"
                        aria-label="Cerrar"
                    >
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    {/each}
</div>

<style>
    @keyframes bounce-subtle {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-5px);
        }
    }

    .animate-bounce-subtle {
        animation: bounce-subtle 0.6s ease-in-out;
    }
</style>
