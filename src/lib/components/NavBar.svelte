<script lang="ts">
	import { getAuthStore } from '$lib/stores/auth.svelte';
	
	interface User {
		id: string;
		email: string;
		name: string;
	}
	
	let { user }: { user: User | null } = $props();
	
	console.log(user);
	const authStore = getAuthStore();
	
	let showUserMenu = $state(false);
	
	function handleLogout() {
		authStore.logout();
	}
	
	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}
	
	// Cerrar menú al hacer clic fuera
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.user-menu-container')) {
			showUserMenu = false;
		}
	}
	
	$effect(() => {
		if (showUserMenu) {
			document.addEventListener('click', handleClickOutside);
		}
		
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<nav class="bg-neutral-900/50 backdrop-blur-lg border-b border-neutral-800 relative z-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo y nombre -->
			<div class="flex items-center space-x-4">
				<div class="w-10 h-10 bg-gradient-to-tr from-violet-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<h1 class="text-xl font-bold text-white hidden sm:block">
					IAM Djoker
				</h1>
			</div>
			
			<!-- Navegación central (solo desktop) -->
			<div class="hidden md:flex items-center space-x-6">
				<a href="/" class="text-neutral-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
					Dashboard
				</a>
				<a href="/goals" class="text-neutral-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
					Objetivos
				</a>
				<a href="/failures" class="text-neutral-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
					Failures
				</a>
				<a href="/minde" class="text-neutral-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
					Mente
				</a>
				<a href="/body" class="text-neutral-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
					Cuerpo
				</a>
				<a href="/assistant" class="text-neutral-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">
					Asistente
				</a>
			</div>
			
			<!-- Menú de usuario -->
			{#if user}
				<div class="relative user-menu-container z-[100]">
					<button
						onclick={toggleUserMenu}
						class="flex items-center space-x-3 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-full p-2 pr-4 transition-colors"
					>
						<!-- Avatar -->
						<div class="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
							{user.name.charAt(0).toUpperCase()}
						</div>
						<span class="hidden sm:block text-sm text-neutral-200">
							{user.name}
						</span>
						<svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>
					
					<!-- Dropdown menu -->
					{#if showUserMenu}
						<div class="fixed right-4 top-16 w-48 bg-neutral-900 rounded-lg shadow-xl border border-neutral-800 py-2 z-[9999]">
							{#if user}
								<div class="flex flex-col">
									<div class="px-4 py-2 border-b border-neutral-800">
										<p class="text-sm font-medium text-white">{user.name}</p>
										<p class="text-xs text-neutral-400">{user.email}</p>
									</div>
								</div>
							{/if}
							<a href="/profile" class="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">
								<div class="flex items-center space-x-2">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									<span>Mi Perfil</span>
								</div>
							</a>
							
							<a href="/settings" class="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">
								<div class="flex items-center space-x-2">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									<span>Configuración</span>
								</div>
							</a>
							
							<div class="border-t border-neutral-800 mt-2 pt-2">
								<button
									onclick={handleLogout}
									class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-800 hover:text-red-300 transition-colors"
								>
									<div class="flex items-center space-x-2">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
										</svg>
										<span>Cerrar sesión</span>
									</div>
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</nav>

<style>
	.user-menu-container {
		position: relative;
	}
</style>
