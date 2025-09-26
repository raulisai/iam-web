<script lang="ts">
    export let active: string = 'home';

    const items: { key: string, label: string, icon: string }[] = [
        { key: '/', label: 'Home', icon: '🏠' },
        { key: '/minde', label: 'Minder', icon: '⭐' },
        { key: '/body', label: 'Body', icon: '📈' },
        { key: '/goals', label: 'Goals', icon: '🎯' },
        { key: '/failures', label: 'Failures', icon: '💣' }
    ];

    function isActive(key: string) {
        return active === key;
    }

    function getClassnames(key: string) {
        return isActive(key) ? 'opacity-100' : 'opacity-70';
    }

    function getLabelClassnames(key: string) {
        return isActive(key) ? 'text-white' : 'text-neutral-400';
    }
  
</script>

<nav class="fixed bottom-0 inset-x-0 z-50 h-16 bg-neutral-900/90 backdrop-blur text-white border-t border-neutral-800">
    <ul class="flex h-full items-center justify-around">
        {#each items as it}
            <li>
                <a href={it.key} class="flex flex-col items-center justify-center px-3 py-1 text-xs">
                    <span class={`text-2xl leading-none ${getClassnames(it.key)}`}>{it.icon}</span>
                    <span class={`mt-1 ${getLabelClassnames(it.key)}`}>{it.label}</span>
                </a>
            </li>
        {/each}
    </ul>
</nav>
