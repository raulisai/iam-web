<script lang="ts">
	import { goto } from '$app/navigation';
	import { getAuthStore } from '$lib/stores/auth.svelte';
	import { onMount } from 'svelte';

	const authStore = getAuthStore();
	
	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let showPassword = $state(false);

	// Si ya está autenticado, redirigir
	onMount(() => {
		if (authStore.isAuthenticated) {
			goto('/');
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		isLoading = true;

		const result = await authStore.login(email, password);
		
		if (result.success) {
			goto('/');
		} else {
			error = result.message || 'Error al iniciar sesión';
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<!-- Logo y título -->
		<div class="text-center">
			<div class="flex justify-center mb-4">
				<div class="w-20 h-20 bg-gradient-to-tr from-violet-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
					<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				</div>
			</div>
			<h2 class="text-3xl font-bold text-white">
				IAM Dashboard
			</h2>
			<p class="mt-2 text-neutral-400">
				Ingresa tus credenciales para acceder
			</p>
		</div>

		<!-- Formulario -->
		<div class="bg-neutral-900/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-neutral-800">
			<form class="space-y-6" onsubmit={handleSubmit}>
				{#if error}
					<div class="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
						{error}
					</div>
				{/if}

				<!-- Email -->
				<div>
					<label for="email" class="block text-sm font-medium text-neutral-300 mb-2">
						Correo electrónico
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						bind:value={email}
						disabled={isLoading}
						class="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
						placeholder="tu@email.com"
					/>
				</div>

				<!-- Password -->
				<div>
					<label for="password" class="block text-sm font-medium text-neutral-300 mb-2">
						Contraseña
					</label>
					<div class="relative">
						<input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							autocomplete="current-password"
							required
							bind:value={password}
							disabled={isLoading}
							class="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed pr-12"
							placeholder="••••••••"
						/>
						<button
							type="button"
							onclick={() => showPassword = !showPassword}
							class="absolute inset-y-0 right-0 px-4 flex items-center text-neutral-400 hover:text-white transition-colors"
						>
							{#if showPassword}
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
								</svg>
							{:else}
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								</svg>
							{/if}
						</button>
					</div>
				</div>

				<!-- Remember me -->
				<div class="flex items-center">
					<input
						id="remember-me"
						name="remember-me"
						type="checkbox"
						class="h-4 w-4 bg-neutral-800 border-neutral-700 rounded text-violet-600 focus:ring-violet-500"
					/>
					<label for="remember-me" class="ml-2 block text-sm text-neutral-300">
						Mantener sesión iniciada
					</label>
				</div>

				<!-- Submit button -->
				<button
					type="submit"
					disabled={isLoading}
					class="w-full flex justify-center items-center px-4 py-3 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-medium rounded-lg hover:from-violet-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
				>
					{#if isLoading}
						<svg class="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Iniciando sesión...
					{:else}
						Iniciar sesión
					{/if}
				</button>

			</form>
		</div>
	</div>
</div>
