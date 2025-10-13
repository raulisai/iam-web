<script lang="ts">
	import { scale, fade } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';

	interface Props {
		onGoalClick: () => void;
		onMindClick: () => void;
		onBodyClick: () => void;
		disabled?: boolean;
	}

	let { onGoalClick, onMindClick, onBodyClick, disabled = false }: Props = $props();

	const buttons = [
		{
			id: 'goal',
			icon: '🎯',
			label: 'Goal',
			subtitle: 'Crear objetivo',
			gradient: 'from-blue-500/20 to-blue-600/20',
			hoverGradient: 'hover:from-blue-500/30 hover:to-blue-600/30',
			border: 'border-blue-500/30',
			hoverBorder: 'hover:border-blue-500/50',
			text: 'text-blue-400',
			onClick: onGoalClick
		},
		{
			id: 'mind',
			icon: '🧠',
			label: 'Mind',
			subtitle: 'Tarea mental',
			gradient: 'from-purple-500/20 to-purple-600/20',
			hoverGradient: 'hover:from-purple-500/30 hover:to-purple-600/30',
			border: 'border-purple-500/30',
			hoverBorder: 'hover:border-purple-500/50',
			text: 'text-purple-400',
			onClick: onMindClick
		},
		{
			id: 'body',
			icon: '💪',
			label: 'Body',
			subtitle: 'Tarea física',
			gradient: 'from-emerald-500/20 to-emerald-600/20',
			hoverGradient: 'hover:from-emerald-500/30 hover:to-emerald-600/30',
			border: 'border-emerald-500/30',
			hoverBorder: 'hover:border-emerald-500/50',
			text: 'text-emerald-400',
			onClick: onBodyClick
		}
	];
</script>

<div class="w-full max-w-2xl mx-auto">
	<h3 class="text-lg font-semibold text-white mb-4 text-center">
		¿Qué quieres crear con mi ayuda?
	</h3>
	
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
		{#each buttons as button, i}
			<button
				onclick={button.onClick}
				{disabled}
				transition:scale={{ delay: i * 100, duration: 400, easing: elasticOut }}
				class="group relative overflow-hidden rounded-xl p-4 sm:p-6 transition-all duration-300
					bg-gradient-to-br {button.gradient} {button.hoverGradient}
					border-2 {button.border} {button.hoverBorder}
					hover:scale-105 hover:shadow-xl active:scale-95
					disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
					focus:outline-none focus:ring-4 focus:ring-{button.text}/30"
			>
				<!-- Background pattern -->
				<div class="absolute inset-0 opacity-5 pointer-events-none">
					<div class="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
				</div>

				<!-- Content -->
				<div class="relative z-10 flex flex-col items-center gap-2">
					<div class="text-4xl sm:text-5xl transition-transform group-hover:scale-110 group-hover:rotate-12">
						{button.icon}
					</div>
					<div class="text-center">
						<div class="text-lg sm:text-xl font-bold {button.text} mb-1">
							{button.label}
						</div>
						<div class="text-xs text-neutral-400">
							{button.subtitle}
						</div>
					</div>
				</div>

				<!-- Hover effect indicator -->
				<div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r {button.gradient} 
					transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left">
				</div>

				<!-- Sparkle effect on hover -->
				<div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
					<div class="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping"></div>
					<div class="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white rounded-full animate-ping delay-75"></div>
				</div>
			</button>
		{/each}
	</div>

	<p class="text-xs text-center text-neutral-500 mt-4">
		💡 Tip: Di en voz alta lo que quieres lograr y te ayudaré paso a paso
	</p>
</div>

<style>
	@keyframes ping {
		75%, 100% {
			transform: scale(2);
			opacity: 0;
		}
	}

	.animate-ping {
		animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
	}

	.delay-75 {
		animation-delay: 75ms;
	}
</style>
