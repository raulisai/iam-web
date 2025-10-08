<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	
	interface Props {
		selectedTimes: string[];
		selectedDays: string[];
		onNext: () => void;
		onBack: () => void;
	}
	
	let { selectedTimes = $bindable(), selectedDays = $bindable(), onNext, onBack }: Props = $props();
	
	const timeSlots = [
		{ id: 'morning', icon: '🌅', label: 'Mañana', time: '6-12 AM', color: 'yellow' },
		{ id: 'afternoon', icon: '☀️', label: 'Tarde', time: '12-6 PM', color: 'orange' },
		{ id: 'evening', icon: '🌆', label: 'Noche', time: '6-10 PM', color: 'purple' },
		{ id: 'night', icon: '🌙', label: 'Madrugada', time: '10 PM-6 AM', color: 'blue' }
	];
	
	const weekDays = [
		{ id: 'monday', icon: '1️⃣', label: 'Lun', full: 'Lunes' },
		{ id: 'tuesday', icon: '2️⃣', label: 'Mar', full: 'Martes' },
		{ id: 'wednesday', icon: '3️⃣', label: 'Mié', full: 'Miércoles' },
		{ id: 'thursday', icon: '4️⃣', label: 'Jue', full: 'Jueves' },
		{ id: 'friday', icon: '5️⃣', label: 'Vie', full: 'Viernes' },
		{ id: 'saturday', icon: '6️⃣', label: 'Sáb', full: 'Sábado' },
		{ id: 'sunday', icon: '7️⃣', label: 'Dom', full: 'Domingo' }
	];
	
	function toggleTime(id: string) {
		if (selectedTimes.includes(id)) {
			selectedTimes = selectedTimes.filter(t => t !== id);
		} else {
			selectedTimes = [...selectedTimes, id];
		}
	}
	
	function toggleDay(id: string) {
		if (selectedDays.includes(id)) {
			selectedDays = selectedDays.filter(d => d !== id);
		} else {
			selectedDays = [...selectedDays, id];
		}
	}
	
	function selectAllDays() {
		selectedDays = weekDays.map(d => d.id);
	}
	
	function selectWeekdays() {
		selectedDays = weekDays.slice(0, 5).map(d => d.id);
	}
	
	function selectWeekend() {
		selectedDays = weekDays.slice(5).map(d => d.id);
	}
	
	function handleNext() {
		if (selectedTimes.length === 0) {
			alert('⚠️ Selecciona al menos un horario');
			return;
		}
		if (selectedDays.length === 0) {
			alert('⚠️ Selecciona al menos un día');
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
		<div class="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-full px-6 py-3 mb-4">
			<span class="text-3xl">⏰</span>
			<span class="text-blue-400 font-semibold">Tu Horario</span>
		</div>
		<p class="text-white/60 text-sm">
			📅 Define cuándo prefieres realizar tus actividades
		</p>
	</div>
	
	<!-- Time Slots -->
	<div class="mb-12">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-lg font-semibold flex items-center gap-2">
				<span>🕐</span>
				<span>Horarios del Día</span>
			</h3>
			<div class="text-sm text-white/40">
				{selectedTimes.length} / {timeSlots.length}
			</div>
		</div>
		
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			{#each timeSlots as slot}
				<button
					type="button"
					onclick={() => toggleTime(slot.id)}
					class="group relative bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 border-2 rounded-2xl p-6 hover:scale-105 transition-all duration-300
						{selectedTimes.includes(slot.id) 
							? `border-${slot.color}-500 bg-${slot.color}-500/20 shadow-lg shadow-${slot.color}-500/25` 
							: 'border-white/10 hover:border-white/20'}"
				>
					<div class="flex flex-col items-center gap-2">
						<span class="text-4xl group-hover:scale-125 transition-transform">
							{slot.icon}
						</span>
						<span class="font-semibold">{slot.label}</span>
						<span class="text-xs text-white/40">{slot.time}</span>
					</div>
					
					{#if selectedTimes.includes(slot.id)}
						<div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
							<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
								<path d="M5 13l4 4L19 7"/>
							</svg>
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
	
	<!-- Days of Week -->
	<div class="mb-8">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-lg font-semibold flex items-center gap-2">
				<span>📆</span>
				<span>Días de la Semana</span>
			</h3>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={selectWeekdays}
					class="text-xs px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full hover:bg-blue-500/30 transition-colors"
				>
					L-V
				</button>
				<button
					type="button"
					onclick={selectWeekend}
					class="text-xs px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full hover:bg-purple-500/30 transition-colors"
				>
					S-D
				</button>
				<button
					type="button"
					onclick={selectAllDays}
					class="text-xs px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full hover:bg-green-500/30 transition-colors"
				>
					Todos
				</button>
			</div>
		</div>
		
		<div class="grid grid-cols-7 gap-2">
			{#each weekDays as day}
				<button
					type="button"
					onclick={() => toggleDay(day.id)}
					class="group relative bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 border-2 rounded-xl p-4 hover:scale-105 transition-all duration-300
						{selectedDays.includes(day.id) 
							? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/25' 
							: 'border-white/10 hover:border-white/20'}"
					title={day.full}
				>
					<div class="flex flex-col items-center gap-1">
						<span class="text-2xl">{day.icon}</span>
						<span class="text-xs font-semibold">{day.label}</span>
					</div>
					
					{#if selectedDays.includes(day.id)}
						<div class="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
							<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
								<path d="M5 13l4 4L19 7"/>
							</svg>
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
	
	<!-- Summary -->
	{#if selectedTimes.length > 0 && selectedDays.length > 0}
		<div class="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6 mb-8 animate-fade-in">
			<div class="flex items-center gap-3 mb-2">
				<span class="text-2xl">🎯</span>
				<span class="font-semibold">Resumen</span>
			</div>
			<p class="text-white/60 text-sm">
				Generaremos <span class="text-purple-400 font-bold">{selectedTimes.length * selectedDays.length}</span> reglas automáticas basadas en tus preferencias
			</p>
		</div>
	{/if}
	
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
			class="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:from-blue-500 hover:to-cyan-500 hover:scale-105 transition-all shadow-lg shadow-blue-500/25"
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
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
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
		animation: fade-in 0.3s ease-out;
	}
	
	.animate-bounce-in {
		animation: bounce-in 0.3s ease-out;
	}
</style>
