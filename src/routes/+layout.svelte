<script lang="ts">
	import "../app.css";
	import favicon from '$lib/assets/favicon.svg';
	import MobileMenu from '$lib/components/MobileMenu.svelte';
	import { initializeAuthStore, setAuthContext } from '$lib/stores/auth.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import NavBar from '$lib/components/NavBar.svelte';
	
	let { children, data } = $props();
	
	// Inicializar store de autenticación
	const authStore = initializeAuthStore();
	
	// Actualizar store con datos del servidor
	if (data?.user) {
		authStore.user = data.user;
		authStore.isAuthenticated = true;
		authStore.isLoading = false;
	}
	
	// Hacer el store disponible para todos los componentes hijos
	if (browser) {
		setAuthContext(authStore);
	}
	
	// Verificar si estamos en una página pública
	$effect(() => {
		const publicPages = ['/login'];
		const isPublicPage = publicPages.includes($page.url.pathname);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="bg-neutral-950 text-white h-dvh overflow-hidden">
	{#if authStore.isAuthenticated}
		<!-- Layout para usuarios autenticados -->
		<div class="h-full flex flex-col">
			<!-- Navbar con información del usuario y logout -->
			<NavBar user={authStore.user} />
			
			<!-- Contenido principal -->
			<div class="flex-1 overflow-auto">
				{@render children?.()}
			</div>

			<!-- Menú móvil global -->
			<div class="md:hidden">
				<MobileMenu />
			</div>
		</div>
	{:else}
		<!-- Layout para páginas públicas (login/register) -->
		<div class="h-full">
			{@render children?.()}
		</div>
	{/if}
</div>
