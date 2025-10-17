<script lang="ts">
	/**
	 * Ejemplo de uso del FloatingActionButton
	 * Copia y pega este código donde lo necesites
	 */
	import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
	
	// Ejemplo: Sistema de navegación (como onboarding)
	let currentStep = $state(1);
	const totalSteps = 5;
	
	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep++;
		}
	}
	
	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}
	
	function handleComplete() {
		console.log('Completado!');
		// Tu lógica aquí
	}
</script>

<!-- Ejemplo 1: Navegación de pasos (como onboarding) -->
<FloatingActionButton>
	{#if currentStep > 1}
		<button
			type="button"
			onclick={() => { prevStep(); }}
			class="flex items-center gap-2 px-3 py-2 bg-neutral-800/95 border-2 border-white/20 rounded-l-full rounded-r-full hover:scale-105 transition-all backdrop-blur-md shadow-lg text-xs"
		>
			<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<path d="M19 12H5M12 19l-7-7 7-7"/>
			</svg>
			<span class="font-semibold">Atrás</span>
		</button>
	{/if}
	
	{#if currentStep < totalSteps}
		<button
			type="button"
			onclick={() => { nextStep(); }}
			class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-l-full rounded-r-full hover:scale-105 transition-all shadow-lg shadow-green-500/40 backdrop-blur-md text-xs"
		>
			<span class="font-bold">Continuar</span>
			<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<path d="M5 12h14M12 5l7 7-7 7"/>
			</svg>
		</button>
	{:else}
		<button
			type="button"
			onclick={() => { handleComplete(); }}
			class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-l-full rounded-r-full hover:scale-105 transition-all shadow-lg shadow-green-500/40 backdrop-blur-md text-xs"
		>
			<span class="font-bold">✨ Finalizar</span>
		</button>
	{/if}
</FloatingActionButton>

<!-- Ejemplo 2: Menú de acciones simples -->
<FloatingActionButton
	horizontalPosition="left"
	verticalPosition="bottom"
	colorFrom="purple-500"
	colorTo="pink-600"
>
	<button
		onclick={() => console.log('Compartir')}
		class="flex items-center gap-2 px-4 py-2 bg-purple-600/90 rounded-full hover:scale-105 transition-all backdrop-blur-md shadow-lg text-xs"
	>
		<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
		</svg>
		<span>Compartir</span>
	</button>
	
	<button
		onclick={() => console.log('Favorito')}
		class="flex items-center gap-2 px-4 py-2 bg-pink-600/90 rounded-full hover:scale-105 transition-all backdrop-blur-md shadow-lg text-xs"
	>
		<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
		</svg>
		<span>Favorito</span>
	</button>
</FloatingActionButton>

<!-- Ejemplo 3: Acciones rápidas (sin scroll behavior, siempre visible) -->
<FloatingActionButton
	enableScrollBehavior={false}
	miniOpacity="0.6"
	scrollOpacity="0.6"
	colorFrom="blue-500"
	colorTo="cyan-600"
	verticalPosition="bottom"
>
	<button
		onclick={() => console.log('Ayuda')}
		class="flex items-center gap-2 px-4 py-2 bg-blue-600/90 rounded-full hover:scale-105 transition-all backdrop-blur-md shadow-lg text-xs"
	>
		<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
		</svg>
		<span>Ayuda</span>
	</button>
	
	<button
		onclick={() => console.log('Soporte')}
		class="flex items-center gap-2 px-4 py-2 bg-cyan-600/90 rounded-full hover:scale-105 transition-all backdrop-blur-md shadow-lg text-xs"
	>
		<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
		</svg>
		<span>Soporte</span>
	</button>
</FloatingActionButton>

<!-- Ejemplo 4: Menú personalizado con muchas opciones -->
<FloatingActionButton
	expandedHeight="10rem"
	colorFrom="indigo-500"
	colorTo="purple-600"
>
	<button class="flex items-center gap-2 px-3 py-2 bg-indigo-600/90 rounded-full text-xs hover:scale-105 transition-all backdrop-blur-md shadow-lg">
		<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
		</svg>
		<span>Inicio</span>
	</button>
	
	<button class="flex items-center gap-2 px-3 py-2 bg-purple-600/90 rounded-full text-xs hover:scale-105 transition-all backdrop-blur-md shadow-lg">
		<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
		</svg>
		<span>Configuración</span>
	</button>
	
	<button class="flex items-center gap-2 px-3 py-2 bg-fuchsia-600/90 rounded-full text-xs hover:scale-105 transition-all backdrop-blur-md shadow-lg">
		<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
		</svg>
		<span>Perfil</span>
	</button>
	
	<button class="flex items-center gap-2 px-3 py-2 bg-pink-600/90 rounded-full text-xs hover:scale-105 transition-all backdrop-blur-md shadow-lg">
		<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
		</svg>
		<span>Salir</span>
	</button>
</FloatingActionButton>
