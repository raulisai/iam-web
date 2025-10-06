<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    
    interface Props {
        position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
        size?: 'sm' | 'md' | 'lg';
        color?: 'emerald' | 'purple' | 'orange' | 'blue';
    }
    
    let { 
        position = 'bottom-right',
        size = 'lg',
        color = 'emerald'
    }: Props = $props();
    
    const dispatch = createEventDispatcher<{ click: void }>();
    
    let isHovered = $state(false);
    
    const positionClasses = {
        'bottom-right': 'bottom-20 md:bottom-8 right-4 md:right-8',
        'bottom-left': 'bottom-20 md:bottom-8 left-4 md:left-8',
        'top-right': 'top-4 md:top-8 right-4 md:right-8',
        'top-left': 'top-4 md:top-8 left-4 md:left-8'
    };
    
    const sizeClasses = {
        'sm': 'w-12 h-12',
        'md': 'w-14 h-14',
        'lg': 'w-16 h-16 md:w-18 md:h-18'
    };
    
    const iconSizeClasses = {
        'sm': 'w-5 h-5',
        'md': 'w-6 h-6',
        'lg': 'w-7 h-7'
    };
    
    const colorClasses = {
        'emerald': 'from-emerald-500 to-green-500 shadow-emerald-500/50 hover:shadow-emerald-500/70',
        'purple': 'from-purple-500 to-indigo-500 shadow-purple-500/50 hover:shadow-purple-500/70',
        'orange': 'from-orange-500 to-red-500 shadow-orange-500/50 hover:shadow-orange-500/70',
        'blue': 'from-blue-500 to-cyan-500 shadow-blue-500/50 hover:shadow-blue-500/70'
    };
    
    function handleClick() {
        dispatch('click');
    }
</script>

<button
    onclick={handleClick}
    onmouseenter={() => isHovered = true}
    onmouseleave={() => isHovered = false}
    class="fixed {positionClasses[position]} {sizeClasses[size]} rounded-full bg-gradient-to-br {colorClasses[color]} shadow-2xl z-40 flex items-center justify-center text-white font-bold text-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
    aria-label="Add new task"
    transition:scale={{ duration: 300, easing: quintOut }}
>
    <!-- Plus Icon con rotación en hover -->
    <svg 
        class="{iconSizeClasses[size]} transition-transform duration-300 {isHovered ? 'rotate-90' : 'rotate-0'}" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="3" 
        stroke-linecap="round"
    >
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    
    <!-- Pulse ring effect -->
    <span class="absolute inset-0 rounded-full bg-gradient-to-br {colorClasses[color]} animate-ping opacity-20"></span>
    
    <!-- Tooltip -->
    {#if isHovered}
        <div 
            class="absolute {position.includes('right') ? 'right-full mr-3' : 'left-full ml-3'} whitespace-nowrap px-3 py-2 rounded-lg bg-neutral-800 text-white text-sm font-semibold shadow-xl border border-white/10"
            transition:scale={{ duration: 200, easing: quintOut, start: 0.8 }}
        >
            Add Task
            <div class="absolute top-1/2 -translate-y-1/2 {position.includes('right') ? 'left-full -ml-1' : 'right-full -mr-1'} w-2 h-2 rotate-45 bg-neutral-800 border-r border-t border-white/10"></div>
        </div>
    {/if}
</button>

<style>
    @keyframes ping {
        0% {
            transform: scale(1);
            opacity: 0.2;
        }
        50% {
            transform: scale(1.1);
            opacity: 0;
        }
        100% {
            transform: scale(1.2);
            opacity: 0;
        }
    }
    
    .animate-ping {
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
</style>
