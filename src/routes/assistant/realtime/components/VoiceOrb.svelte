<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { VoiceState } from '../services/voice.service';

	interface Props {
		voiceState: VoiceState;
		isListening: boolean;
		onToggle: () => void;
	}

	let { voiceState = 'idle', isListening = false, onToggle }: Props = $props();

	let canvas = $state<HTMLCanvasElement | undefined>(undefined);
	let animationId = $state(0);
	let time = $state(0);

	// Colors based on voiceState
	const stateColors = {
		idle: { primary: '#6366f1', secondary: '#8b5cf6' },
		listening: { primary: '#10b981', secondary: '#14b8a6' },
		processing: { primary: '#f59e0b', secondary: '#ef4444' },
		speaking: { primary: '#3b82f6', secondary: '#06b6d4' }
	};

	onMount(() => {
		if (canvas) {
			startAnimation();
		}
	});

	onDestroy(() => {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
	});

	function startAnimation() {
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const animate = () => {
			drawWaves(ctx);
			time += 0.02;
			animationId = requestAnimationFrame(animate);
		};

		animate();
	}

	function drawWaves(ctx: CanvasRenderingContext2D) {
		if (!canvas) return;

		const width = canvas.width;
		const height = canvas.height;
		const centerX = width / 2;
		const centerY = height / 2;

		// Clear canvas
		ctx.clearRect(0, 0, width, height);

		const colors = stateColors[voiceState];

		// Draw animated waves
		const waveCount = voiceState === 'listening' || voiceState === 'speaking' ? 4 : 2;
		const baseRadius = 60;

		for (let i = 0; i < waveCount; i++) {
			const offset = i * 0.5;
			const radius = baseRadius + Math.sin(time + offset) * 10;
			const opacity = 0.3 - i * 0.05;

			// Create gradient
			const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
			gradient.addColorStop(0, `${colors.primary}00`);
			gradient.addColorStop(0.5, `${colors.primary}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
			gradient.addColorStop(1, `${colors.secondary}00`);

			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(centerX, centerY, radius + i * 20, 0, Math.PI * 2);
			ctx.fill();
		}

		// Draw center orb
		const orbGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius);
		orbGradient.addColorStop(0, colors.primary);
		orbGradient.addColorStop(1, colors.secondary);

		ctx.fillStyle = orbGradient;
		ctx.beginPath();
		ctx.arc(centerX, centerY, baseRadius * 0.8, 0, Math.PI * 2);
		ctx.fill();

		// Add glow effect when active
		if (voiceState === 'listening' || voiceState === 'speaking') {
			ctx.shadowBlur = 20;
			ctx.shadowColor = colors.primary;
			ctx.fillStyle = orbGradient;
			ctx.beginPath();
			ctx.arc(centerX, centerY, baseRadius * 0.8, 0, Math.PI * 2);
			ctx.fill();
			ctx.shadowBlur = 0;
		}
	}

	function handleClick() {
		onToggle();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onToggle();
		}
	}

	// State labels
	const stateLabels = {
		idle: 'Presiona para hablar',
		listening: 'Escuchando...',
		processing: 'Procesando...',
		speaking: 'Hablando...'
	};
</script>

<div class="flex flex-col items-center gap-4">
	<!-- Canvas Container -->
	<button
		onclick={handleClick}
		onkeydown={handleKeyDown}
		tabindex="0"
		aria-pressed={isListening}
		aria-label={stateLabels[voiceState]}
		class="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-500/50 rounded-full"
	>
		<canvas
			bind:this={canvas}
			width="300"
			height="300"
			class="w-[200px] h-[200px] sm:w-[300px] sm:h-[300px]"
		></canvas>
		
		<!-- Center Icon -->
		<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
			<div class="text-4xl sm:text-6xl filter drop-shadow-lg">
				{#if voiceState === 'listening'}
					🎤
				{:else if voiceState === 'processing'}
					⏳
				{:else if voiceState === 'speaking'}
					🔊
				{:else}
					💬
				{/if}
			</div>
		</div>
	</button>

	<!-- State Label -->
	<div class="text-center">
		<p class="text-sm sm:text-base font-semibold text-white">
			{stateLabels[voiceState]}
		</p>
		<p class="text-xs text-neutral-400 mt-1">
			{#if voiceState === 'idle'}
				Toca el círculo para activar el micrófono
			{:else if voiceState === 'listening'}
				Habla ahora, te estoy escuchando
			{:else if voiceState === 'processing'}
				Analizando tu mensaje...
			{:else if voiceState === 'speaking'}
				Reproduciendo respuesta
			{/if}
		</p>
	</div>

	<!-- Quick Actions -->
	<div class="flex gap-2">
		{#if isListening || voiceState === 'speaking'}
			<button
				onclick={onToggle}
				class="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 text-sm font-medium transition-all"
			>
				{isListening ? '🛑 Detener' : '🔇 Silenciar'}
			</button>
		{/if}
	</div>
</div>

<style>
	canvas {
		image-rendering: crisp-edges;
	}
</style>
