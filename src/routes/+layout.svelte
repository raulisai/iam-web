<script lang="ts">
	import "../app.css";
	import favicon from '$lib/assets/favicon.svg';
	import MobileMenu from '$lib/components/MobileMenu.svelte';
	import { initializeAuthStore, setAuthContext } from '$lib/stores/auth.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import NavBar from '$lib/components/NavBar.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	
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
	setAuthContext(authStore);
	
	// Verificar si estamos en una página pública y redirigir si no hay sesión
	$effect(() => {
		const publicPages = ['/login', '/auth-required'];
		const isPublicPage = publicPages.includes($page.url.pathname);
		
		// Si no está autenticado y no está en una página pública, redirigir
		if (browser && !authStore.isAuthenticated && !isPublicPage) {
			goto('/auth-required');
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="bg-neutral-950 text-white min-h-dvh">
	{#if authStore.isAuthenticated}
		<!-- Layout para usuarios autenticados -->
		<div class="min-h-dvh flex flex-col">
			<!-- Navbar con información del usuario y logout -->
			<NavBar user={authStore.user} />
			
			<!-- Contenido principal -->
			<div class="flex-1 mb-20">
				{@render children?.()}
			</div>

			<!-- Menú móvil global -->
			<div class="md:hidden">
				<MobileMenu />
			</div>
		</div>
	{:else}
		<!-- Layout para páginas públicas (login/register) -->
		<div class="min-h-dvh">
			{@render children?.()}
		</div>
	{/if}
	
	<!-- Toast notifications -->
	<ToastContainer />
</div>
