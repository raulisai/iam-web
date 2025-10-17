<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	
	interface Reminder {
		id: string;
		name: string;
		times_per_day: number;
		start_time: string;
		end_time: string;
		days: number[];
		enabled: boolean;
		source_type: 'mind' | 'body' | 'goal' | 'custom';
		notification_title: string;
		notification_body: string;
	}
	
	interface Props {
		reminders: Reminder[];
		onNext: () => void;
		onBack: () => void;
	}
	
	let { reminders = $bindable(), onNext, onBack }: Props = $props();
	
	const daysOfWeek = [
		{ id: 0, label: 'D', name: 'Domingo' },
		{ id: 1, label: 'L', name: 'Lunes' },
		{ id: 2, label: 'M', name: 'Martes' },
		{ id: 3, label: 'M', name: 'Miércoles' },
		{ id: 4, label: 'J', name: 'Jueves' },
		{ id: 5, label: 'V', name: 'Viernes' },
		{ id: 6, label: 'S', name: 'Sábado' }
	];
	
	const sourceTypeIcons: Record<string, string> = {
		mind: '🧠',
		body: '💪',
		goal: '🎯',
		custom: '⚙️'
	};
	
	function addReminder() {
		const newReminder: Reminder = {
			id: `reminder-${Date.now()}`,
			name: 'Nuevo Recordatorio',
			times_per_day: 3,
			start_time: '08:00',
			end_time: '22:00',
			days: [1, 2, 3, 4, 5, 6, 0],
			enabled: true,
			source_type: 'custom',
			notification_title: 'Recordatorio',
			notification_body: '¡No olvides!'
		};
		reminders = [...reminders, newReminder];
	}
	
	function removeReminder(id: string) {
		reminders = reminders.filter(r => r.id !== id);
	}
	
	function toggleDay(reminder: Reminder, dayId: number) {
		const index = reminders.findIndex(r => r.id === reminder.id);
		if (index === -1) return;
		
		const updatedReminder = { ...reminder };
		if (updatedReminder.days.includes(dayId)) {
			updatedReminder.days = updatedReminder.days.filter(d => d !== dayId);
		} else {
			updatedReminder.days = [...updatedReminder.days, dayId].sort();
		}
		
		reminders[index] = updatedReminder;
	}
	
	function toggleReminder(reminder: Reminder) {
		const index = reminders.findIndex(r => r.id === reminder.id);
		if (index === -1) return;
		reminders[index] = { ...reminder, enabled: !reminder.enabled };
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
			<span class="text-3xl">🔔</span>
			<span class="text-blue-400 font-semibold">Recordatorios</span>
		</div>
		<p class="text-white/60 text-sm max-w-2xl mx-auto">
			Configura recordatorios periódicos para mantener tus hábitos. Los recordatorios se repiten automáticamente durante el día.
		</p>
		<div class="mt-4 inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2">
			<span class="text-blue-400 font-bold text-lg">{reminders.length}</span>
			<span class="text-white/60 text-sm">recordatorios configurados</span>
		</div>
	</div>
	
	<!-- Reminders List -->
	<div class="space-y-4 mb-8">
		{#each reminders as reminder, i (reminder.id)}
			<div 
				class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
				style="animation-delay: {i * 50}ms"
			>
				<div class="flex flex-col md:flex-row gap-4">
					<!-- Left: Icon & Toggle -->
					<div class="flex items-center gap-4">
						<div class="text-4xl">
							{sourceTypeIcons[reminder.source_type]}
						</div>
						<button
							type="button"
							onclick={() => toggleReminder(reminder)}
							class="relative w-14 h-8 rounded-full transition-colors {reminder.enabled ? 'bg-green-500' : 'bg-neutral-700'}"
						>
							<div class="absolute top-1 {reminder.enabled ? 'right-1' : 'left-1'} w-6 h-6 bg-white rounded-full transition-all shadow-lg"></div>
						</button>
					</div>
					
					<!-- Center: Info -->
					<div class="flex-1 space-y-3">
						<input
							type="text"
							bind:value={reminder.name}
							class="w-full bg-neutral-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500/50 focus:outline-none"
							placeholder="Nombre del recordatorio"
						/>
						
						<div class="flex flex-wrap gap-2 items-center">
							<div class="flex items-center gap-2">
								<label class="text-sm text-white/60">Veces al día:</label>
								<input
									type="number"
									min="1"
									max="24"
									bind:value={reminder.times_per_day}
									class="w-20 bg-neutral-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 focus:outline-none"
								/>
							</div>
							
							<div class="flex items-center gap-2">
								<label class="text-sm text-white/60">Desde:</label>
								<input
									type="time"
									bind:value={reminder.start_time}
									class="bg-neutral-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 focus:outline-none"
								/>
							</div>
							
							<div class="flex items-center gap-2">
								<label class="text-sm text-white/60">Hasta:</label>
								<input
									type="time"
									bind:value={reminder.end_time}
									class="bg-neutral-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-blue-500/50 focus:outline-none"
								/>
							</div>
						</div>
						
						<div class="flex gap-1">
							{#each daysOfWeek as day}
								<button
									type="button"
									onclick={() => toggleDay(reminder, day.id)}
									class="w-10 h-10 rounded-full border-2 transition-all text-sm font-semibold
										{reminder.days.includes(day.id) 
											? 'border-blue-500 bg-blue-500/20 text-blue-400' 
											: 'border-white/10 text-white/40 hover:border-white/30'}"
									title={day.name}
								>
									{day.label}
								</button>
							{/each}
						</div>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
							<input
								type="text"
								bind:value={reminder.notification_title}
								class="bg-neutral-800/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none"
								placeholder="Título de notificación"
							/>
							<input
								type="text"
								bind:value={reminder.notification_body}
								class="bg-neutral-800/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none"
								placeholder="Mensaje de notificación"
							/>
						</div>
					</div>
					
					<!-- Right: Delete -->
					<div class="flex items-start">
						<button
							type="button"
							onclick={() => removeReminder(reminder.id)}
							class="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
							title="Eliminar recordatorio"
						>
							<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		{/each}
		
		<!-- Add Reminder Button -->
		<button
			type="button"
			onclick={addReminder}
			class="w-full border-2 border-dashed border-white/20 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
		>
			<div class="flex items-center justify-center gap-3 text-white/60 group-hover:text-blue-400">
				<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 5v14M5 12h14"/>
				</svg>
				<span class="font-semibold">Agregar Recordatorio</span>
			</div>
		</button>
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
			onclick={onNext}
			class="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:from-blue-500 hover:to-cyan-500 hover:scale-105 transition-all shadow-lg shadow-blue-500/25"
		>
			<span class="font-semibold">Continuar</span>
			<svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M12 5l7 7-7 7"/>
			</svg>
		</button>
	</div>
</div>
