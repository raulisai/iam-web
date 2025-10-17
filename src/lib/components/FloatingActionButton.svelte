<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	
	interface Props {
		/** Posición vertical: 'top' | 'center' | 'bottom' */
		verticalPosition?: 'top' | 'center' | 'bottom';
		/** Posición horizontal: 'left' | 'right' */
		horizontalPosition?: 'left' | 'right';
		/** Ocultar automáticamente después de X segundos sin scroll (0 = nunca) */
		autoHideDelay?: number;
		/** Tamaño del cachito mini (en rem) */
		miniWidth?: string;
		/** Altura del cachito mini (en rem) */
		miniHeight?: string;
		/** Tamaño del cachito expandido al scrollear (en rem) */
		expandedWidth?: string;
		/** Altura del cachito expandido al scrollear (en rem) */
		expandedHeight?: string;
		/** Opacidad del cachito mini (0-1) */
		miniOpacity?: string;
		/** Opacidad al scrollear (0-1) */
		scrollOpacity?: string;
		/** Color del botón (gradiente from/to de Tailwind) */
		colorFrom?: string;
		colorTo?: string;
		/** Mostrar solo en mobile */
		mobileOnly?: boolean;
		/** Habilitar comportamiento de scroll */
		enableScrollBehavior?: boolean;
		/** Contenido personalizado (botones) */
		children?: Snippet;
	}
	
	let {
		verticalPosition = 'center',
		horizontalPosition = 'right',
		autoHideDelay = 2000,
		miniWidth = '0.5rem',
		miniHeight = '4rem',
		expandedWidth = '2.5rem',
		expandedHeight = '6rem',
		miniOpacity = '0.4',
		scrollOpacity = '0.7',
		colorFrom = 'green-500',
		colorTo = 'emerald-600',
		mobileOnly = true,
		enableScrollBehavior = true,
		children
	}: Props = $props();
	
	let fabExpanded = $state(false);
	let showFab = $state(false);
	let scrollTimeout: number;
	
	// Computed position classes
	const positionClasses = $derived(() => {
		let classes = 'fixed z-50';
		
		// Horizontal
		if (horizontalPosition === 'left') {
			classes += ' left-0';
		} else {
			classes += ' right-0';
		}
		
		// Vertical
		if (verticalPosition === 'top') {
			classes += ' top-4';
		} else if (verticalPosition === 'bottom') {
			classes += ' bottom-4';
		} else {
			classes += ' top-1/2 -translate-y-1/2';
		}
		
		// Mobile only
		if (mobileOnly) {
			classes += ' md:hidden';
		}
		
		return classes;
	});
	
	// Border radius based on position
	const borderRadius = $derived(() => {
		if (horizontalPosition === 'left') {
			return showFab ? '0 9999px 9999px 0' : '0 1rem 1rem 0';
		} else {
			return showFab ? '9999px 0 0 9999px' : '1rem 0 0 1rem';
		}
	});
	
	const pulseRadius = $derived(() => {
		if (horizontalPosition === 'left') {
			return '0 9999px 9999px 0';
		} else {
			return '9999px 0 0 9999px';
		}
	});
	
	onMount(() => {
		if (!enableScrollBehavior) return;
		
		const handleScroll = () => {
			showFab = true;
			
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}
			
			if (autoHideDelay > 0) {
				scrollTimeout = setTimeout(() => {
					if (!fabExpanded) {
						showFab = false;
					}
				}, autoHideDelay) as unknown as number;
			}
		};
		
		window.addEventListener('scroll', handleScroll);
		
		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}
		};
	});
	
	function toggleExpanded() {
		fabExpanded = !fabExpanded;
		if (fabExpanded) {
			showFab = true;
		}
	}
	
	function closeMenu() {
		fabExpanded = false;
	}
</script>

<div class={positionClasses()}>
	{#if fabExpanded}
		<!-- Expanded State - Menu con botones personalizados -->
		<div class="flex flex-col gap-2" class:items-start={horizontalPosition === 'left'} class:pl-3={horizontalPosition === 'left'} class:items-end={horizontalPosition === 'right'} class:pr-3={horizontalPosition === 'right'}>
			<!-- Slot para botones personalizados cuando está expandido -->
			{@render children?.()}
			
			<!-- Close button -->
			<button
				type="button"
				onclick={closeMenu}
				class="w-10 h-10 bg-red-500/90 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-red-500/40 backdrop-blur-md"
				aria-label="Cerrar menú"
			>
				<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path d="M18 6L6 18M6 6l12 12"/>
				</svg>
			</button>
		</div>
	{:else}
		<!-- Collapsed State - Cachito tab -->
		<button
			type="button"
			onclick={toggleExpanded}
			class="relative bg-gradient-to-br from-{colorFrom} to-{colorTo} hover:shadow-{colorFrom}/60 shadow-md shadow-{colorFrom}/30 backdrop-blur-md flex items-center justify-center group overflow-hidden hover:opacity-100"
			style="
				{horizontalPosition === 'left' ? 'border-top-left-radius: 0; border-bottom-left-radius: 0;' : 'border-top-right-radius: 0; border-bottom-right-radius: 0;'}
				width: {showFab ? expandedWidth : miniWidth};
				height: {showFab ? expandedHeight : miniHeight};
				opacity: {showFab ? scrollOpacity : miniOpacity};
				border-radius: {borderRadius()};
				transition: all 300ms ease-out;
			"
			aria-label="Abrir menú de navegación"
		>
			<!-- Pulse effect on scroll -->
			{#if showFab}
				<div class="absolute inset-0 bg-{colorFrom}/20 animate-pulse" style="border-radius: {pulseRadius()};"></div>
			{/if}
			
			<!-- Icon - Only show when scrolling -->
			{#if showFab}
				<div class="relative z-10 flex flex-col items-center gap-1">
					<svg 
						class="w-5 h-5 group-hover:scale-110 transition-transform" 
						class:rotate-180={horizontalPosition === 'left'}
						viewBox="0 0 24 24" 
						fill="none" 
						stroke="currentColor" 
						stroke-width="3"
					>
						<path d="M9 5l7 7-7 7"/>
					</svg>
					<div class="flex flex-col gap-1">
						<div class="w-1 h-1 bg-white rounded-full"></div>
						<div class="w-1 h-1 bg-white rounded-full"></div>
						<div class="w-1 h-1 bg-white rounded-full"></div>
					</div>
				</div>
			{/if}
		</button>
	{/if}
</div>
