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
		{ id: 'morning', icon: '🌅', label: 'Mañana Temprano', time: '6:00-9:00', color: 'yellow', desc: 'Antes del trabajo' },
		{ id: 'midday', icon: '☀️', label: 'Mediodía', time: '12:00-14:00', color: 'orange', desc: 'Hora de comida' },
		{ id: 'afternoon', icon: '🌤️', label: 'Tarde', time: '14:00-18:00', color: 'amber', desc: 'Después del trabajo' },
		{ id: 'evening', icon: '🌆', label: 'Noche', time: '18:00-22:00', color: 'purple', desc: 'En la noche' },
		{ id: 'night', icon: '🌙', label: 'Noche Tarde', time: '22:00-6:00', color: 'blue', desc: 'Antes de dormir' }
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
			<span class="text-blue-400 font-semibold">Horarios Preferidos</span>
		</div>
		<p class="text-white/60 text-sm">
			📅 Selecciona cuándo prefieres hacer tus actividades de mente y cuerpo
		</p>
		<p class="text-white/40 text-xs mt-2">
			💡 Estas son las franjas horarias FUERA de tu horario de trabajo
		</p>
	</div>
	
	<!-- Time Slots -->
	<div class="mb-12">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-lg font-semibold flex items-center gap-2">
				<span>🕐</span>
				<span>¿En qué momentos del día prefieres hacer tus actividades?</span>
			</h3>
			<div class="text-sm text-white/40">
				{selectedTimes.length} / {timeSlots.length}
			</div>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each timeSlots as slot}
				<button
					type="button"
					onclick={() => toggleTime(slot.id)}
					class="group relative bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 border-2 rounded-2xl p-6 hover:scale-105 transition-all duration-300 text-left
						{selectedTimes.includes(slot.id) 
							? `border-${slot.color}-500 bg-${slot.color}-500/20 shadow-lg shadow-${slot.color}-500/25` 
							: 'border-white/10 hover:border-white/20'}"
				>
					<div class="flex items-center gap-4">
						<span class="text-4xl group-hover:scale-125 transition-transform">
							{slot.icon}
						</span>
						<div class="flex-1">
							<div class="font-semibold mb-1">{slot.label}</div>
							<div class="text-xs text-white/60">{slot.time}</div>
							<div class="text-xs text-white/40 mt-1">{slot.desc}</div>
						</div>
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
		
		<div class="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
			<p class="text-sm text-white/70 text-center">
				💡 <strong>Tip:</strong> Selecciona varios horarios para tener más flexibilidad en tu día
			</p>
		</div>
	</div>
	
	<!-- Days of Week -->
	<div class="mb-8">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-lg font-semibold flex items-center gap-2">
				<span>📆</span>
				<span>¿Qué días quieres hacer tus actividades?</span>
			</h3>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={selectWeekdays}
					class="text-xs px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full hover:bg-blue-500/30 transition-colors font-medium"
				>
					🏢 L-V (Laborales)
				</button>
				<button
					type="button"
					onclick={selectWeekend}
					class="text-xs px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full hover:bg-purple-500/30 transition-colors font-medium"
				>
					🏖️ S-D (Fin de semana)
				</button>
				<button
					type="button"
					onclick={selectAllDays}
					class="text-xs px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full hover:bg-green-500/30 transition-colors font-medium"
				>
					✅ Todos
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
			<div class="flex items-center gap-3 mb-3">
				<span class="text-3xl">🎯</span>
				<div>
					<div class="font-semibold text-lg">Resumen de tu Configuración</div>
					<div class="text-xs text-white/40 mt-0.5">El sistema creará reglas inteligentes automáticamente</div>
				</div>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
				<div class="bg-black/30 rounded-lg p-4">
					<div class="text-xs text-white/60 mb-1">Horarios seleccionados</div>
					<div class="text-2xl font-bold text-cyan-400">{selectedTimes.length}</div>
					<div class="text-xs text-white/40 mt-1">
						{selectedTimes.map(id => timeSlots.find(s => s.id === id)?.label).join(', ')}
					</div>
				</div>
				<div class="bg-black/30 rounded-lg p-4">
					<div class="text-xs text-white/60 mb-1">Días seleccionados</div>
					<div class="text-2xl font-bold text-purple-400">{selectedDays.length}</div>
					<div class="text-xs text-white/40 mt-1">
						{selectedDays.map(id => weekDays.find(d => d.id === id)?.label).join(', ')}
					</div>
				</div>
				<div class="bg-black/30 rounded-lg p-4">
					<div class="text-xs text-white/60 mb-1">Reglas automáticas</div>
					<div class="text-2xl font-bold text-green-400">{selectedTimes.length * selectedDays.length}</div>
					<div class="text-xs text-white/40 mt-1">
						Combinaciones horario × día
					</div>
				</div>
			</div>
			
			<div class="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
				<p class="text-xs text-white/70 text-center">
					⚡ El bot sugerirá tareas en estos horarios basándose en tus actividades favoritas
				</p>
			</div>
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
