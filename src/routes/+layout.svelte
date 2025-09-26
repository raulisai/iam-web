<script lang="ts">
	import "../app.css";
	import favicon from '$lib/assets/favicon.svg';
	import MobileMenu from '$lib/components/MobileMenu.svelte';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="bg-neutral-950 text-white h-dvh overflow-hidden">
	<!-- Contenido principal -->
	<div class="h-full md:h-auto">
		{@render children?.()}
	</div>

	<!-- Menú móvil global -->
	<div class="md:hidden">
		<MobileMenu />
	</div>
</div>
