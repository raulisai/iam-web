<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	
	interface Props {
		selectedActivities: string[];
		onNext: () => void;
		onBack: () => void;
	}
	
	let { selectedActivities = $bindable(), onNext, onBack }: Props = $props();
	
	const activities = [
		{ id: 'meditation', icon: '🧘', label: 'Meditación', color: 'purple', desc: 'Calma mental' },
		{ id: 'exercise', icon: '💪', label: 'Ejercicio', color: 'orange', desc: 'Fuerza física' },
		{ id: 'reading', icon: '📚', label: 'Lectura', color: 'blue', desc: 'Conocimiento' },
		{ id: 'yoga', icon: '🧘‍♀️', label: 'Yoga', color: 'green', desc: 'Flexibilidad' },
		{ id: 'running', icon: '🏃', label: 'Running', color: 'red', desc: 'Cardio' },
		{ id: 'swimming', icon: '🏊', label: 'Natación', color: 'cyan', desc: 'Resistencia' },
		{ id: 'cycling', icon: '🚴', label: 'Ciclismo', color: 'yellow', desc: 'Velocidad' },
		{ id: 'walking', icon: '🚶', label: 'Caminar', color: 'teal', desc: 'Movilidad' },
		{ id: 'stretching', icon: '🤸', label: 'Estiramiento', color: 'pink', desc: 'Flexibilidad' },
		{ id: 'nutrition', icon: '🥗', label: 'Nutrición', color: 'lime', desc: 'Salud' }
	];
	
	function toggleActivity(id: string) {
		if (selectedActivities.includes(id)) {
			selectedActivities = selectedActivities.filter(a => a !== id);
		} else {
			selectedActivities = [...selectedActivities, id];
		}
	}
	
	function handleNext() {
		if (selectedActivities.length === 0) {
			alert('⚠️ Selecciona al menos una actividad');
			return;
		}
		onNext();
	}
</script>

<div 
	class="w-full max-w-5xl mx-auto"
	in:fly={{ x: 300, duration: 400, easing: quintOut }}
	out:fly={{ x: -300, duration: 300, easing: quintOut }}
>
	<!-- Header -->
	<div class="text-center mb-8">
		<div class="inline-flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 rounded-full px-6 py-3 mb-4">
			<span class="text-3xl">🎯</span>
			<span class="text-purple-400 font-semibold">Tus Actividades</span>
		</div>
		<p class="text-white/60 text-sm">
			🌟 Selecciona las actividades que te interesan
		</p>
		<div class="mt-4 inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2">
			<span class="text-purple-400 font-bold text-lg">{selectedActivities.length}</span>
			<span class="text-white/60 text-sm">seleccionadas</span>
		</div>
	</div>
	
	<!-- Activities Grid -->
	<div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
		{#each activities as activity, i}
			<button
				type="button"
				onclick={() => toggleActivity(activity.id)}
				style="animation-delay: {i * 50}ms"
				class="group relative bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 border-2 rounded-2xl p-6 hover:scale-110 transition-all duration-300 cursor-pointer animate-fade-in
					{selectedActivities.includes(activity.id) 
						? `border-${activity.color}-500 bg-${activity.color}-500/20 shadow-lg shadow-${activity.color}-500/25` 
						: 'border-white/10 hover:border-white/20'}"
			>
				<!-- Animated background -->
				<div class="absolute inset-0 rounded-2xl overflow-hidden">
					<div class="absolute inset-0 bg-gradient-to-br from-transparent to-{activity.color}-500/0 group-hover:to-{activity.color}-500/20 transition-all duration-500"></div>
				</div>
				
				<!-- Content -->
				<div class="relative flex flex-col items-center gap-2">
					<span class="text-4xl group-hover:scale-125 transition-transform duration-300">
						{activity.icon}
					</span>
					<span class="font-semibold text-sm text-center">{activity.label}</span>
					<span class="text-xs text-white/40 text-center">{activity.desc}</span>
				</div>
				
				<!-- Check indicator -->
				{#if selectedActivities.includes(activity.id)}
					<div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
						<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
							<path d="M5 13l4 4L19 7"/>
						</svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>
	
	<!-- Navigation -->
	<div class="flex justify-between">
		<button
			type="button"
			onclick={onBack}
			class="group flex items-center gap-2 px-6 py-3 bg-neutral-800/50 border border-white/10 rounded-xl hover:border-white/20 hover:scale-105 transition-all"
		>
			<svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 12H5M12 19l-7-7 7-7"/>
			</svg>
			<span>Atrás</span>
		</button>
		
		<button
			type="button"
			onclick={handleNext}
			class="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-500 hover:to-pink-500 hover:scale-105 transition-all shadow-lg shadow-purple-500/25"
		>
			<span class="font-semibold">Continuar</span>
			<svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M12 5l7 7-7 7"/>
			</svg>
		</button>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@keyframes bounce-in {
		0% {
			opacity: 0;
			transform: scale(0);
		}
		50% {
			transform: scale(1.2);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}
	
	.animate-fade-in {
		animation: fade-in 0.4s ease-out forwards;
		opacity: 0;
	}
	
	.animate-bounce-in {
		animation: bounce-in 0.3s ease-out forwards;
	}
</style>
