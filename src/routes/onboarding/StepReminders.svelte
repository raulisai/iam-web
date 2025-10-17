<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { quintOut, backOut } from 'svelte/easing';
	
	interface Reminder {
		id: string;
		name: string;
		description?: string;
		times_per_day: number;
		start_time: string;
		end_time: string;
		days: number[];
		enabled: boolean;
		source_type: 'mind' | 'body' | 'goal' | 'custom';
		notification_title: string;
		notification_body: string;
		notification_icon?: string;
		notification_color?: string;
		sound_enabled: boolean;
		vibration_enabled: boolean;
		priority: 'min' | 'low' | 'default' | 'high' | 'max';
		task_id?: string;
	}
	
	interface Props {
		reminders: Reminder[];
		onNext: () => void;
		onBack: () => void;
	}
	
	let { reminders = $bindable(), onNext, onBack }: Props = $props();
	
	// Recomendaciones predefinidas
	const recommendedReminders = [
		{
			emoji: '✅',
			name: 'Tareas Pendientes',
			description: 'Revisa y completa tus tareas',
			times_per_day: 2,
			start_time: '09:00',
			end_time: '18:00',
			days: [1, 2, 3, 4, 5],
			source_type: 'goal' as const,
			notification_title: '✅ Revisa tus tareas',
			notification_body: '¿Qué tareas vas a completar ahora?',
			notification_icon: 'task_icon',
			notification_color: '#2196F3',
			priority: 'high' as const,
			sound_enabled: true,
			vibration_enabled: true,
			badge: 'Esencial'
		},
		{
			emoji: '💧',
			name: 'Hidratación',
			description: 'Bebe agua regularmente',
			times_per_day: 8,
			start_time: '08:00',
			end_time: '22:00',
			days: [1, 2, 3, 4, 5, 6, 0],
			source_type: 'body' as const,
			notification_title: '💧 Hora de hidratarte',
			notification_body: 'Bebe un vaso de agua',
			notification_icon: 'water_icon',
			notification_color: '#2196F3',
			priority: 'default' as const,
			sound_enabled: true,
			vibration_enabled: false,
			badge: 'Popular'
		},
		{
			emoji: '🧘',
			name: 'Pausas Activas',
			description: 'Estira y relájate',
			times_per_day: 4,
			start_time: '09:00',
			end_time: '18:00',
			days: [1, 2, 3, 4, 5],
			source_type: 'body' as const,
			notification_title: '🧘 Pausa activa',
			notification_body: 'Estira tu cuerpo por 5 minutos',
			notification_icon: 'stretch_icon',
			notification_color: '#9C27B0',
			priority: 'default' as const,
			sound_enabled: true,
			vibration_enabled: true,
			badge: 'Salud'
		},
		{
			emoji: '🎯',
			name: 'Objetivos Diarios',
			description: 'Revisa tu progreso',
			times_per_day: 3,
			start_time: '08:00',
			end_time: '20:00',
			days: [1, 2, 3, 4, 5, 6, 0],
			source_type: 'goal' as const,
			notification_title: '🎯 Revisa tus objetivos',
			notification_body: '¿Estás avanzando hacia tus metas?',
			notification_icon: 'goal_icon',
			notification_color: '#FF9800',
			priority: 'high' as const,
			sound_enabled: true,
			vibration_enabled: true,
			badge: 'Motivación'
		}
	];
	
	let showRecommendations = $state(true);
	
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
			description: '',
			times_per_day: 3,
			start_time: '08:00',
			end_time: '22:00',
			days: [1, 2, 3, 4, 5, 6, 0],
			enabled: true,
			source_type: 'custom',
			notification_title: 'Recordatorio',
			notification_body: '¡No olvides!',
			notification_icon: 'reminder_icon',
			notification_color: '#2196F3',
			sound_enabled: true,
			vibration_enabled: true,
			priority: 'default'
		};
		reminders = [...reminders, newReminder];
	}
	
	function addRecommendedReminder(recommended: typeof recommendedReminders[0]) {
		const newReminder: Reminder = {
			id: `reminder-${Date.now()}`,
			name: recommended.name,
			description: recommended.description,
			times_per_day: recommended.times_per_day,
			start_time: recommended.start_time,
			end_time: recommended.end_time,
			days: recommended.days,
			enabled: true,
			source_type: recommended.source_type,
			notification_title: recommended.notification_title,
			notification_body: recommended.notification_body,
			notification_icon: recommended.notification_icon,
			notification_color: recommended.notification_color,
			sound_enabled: recommended.sound_enabled,
			vibration_enabled: recommended.vibration_enabled,
			priority: recommended.priority
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
	class="w-full max-w-6xl mx-auto"
	in:fly={{ x: 300, duration: 400, easing: quintOut }}
	out:fly={{ x: -300, duration: 300, easing: quintOut }}
>
	<!-- Header Gamificado -->
	<div class="text-center mb-4 md:mb-8">
		<div class="inline-block relative">
			<div class="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-sm md:text-lg animate-bounce">
				🔔
			</div>
			<h2 class="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 bg-clip-text text-transparent mb-2">
				Recordatorios Pro
			</h2>
		</div>
		<p class="text-white/70 text-sm md:text-base max-w-2xl mx-auto mb-3 md:mb-4 px-2">
			¡Crea hábitos increíbles con recordatorios inteligentes! 🎯
		</p>
		<div class="flex gap-2 md:gap-3 justify-center flex-wrap">
			<div class="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 rounded-xl md:rounded-2xl px-3 md:px-5 py-1.5 md:py-2.5 backdrop-blur-sm">
				<div class="flex items-center gap-1.5 md:gap-2">
					<span class="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{reminders.length}</span>
					<span class="text-white/80 font-semibold text-sm md:text-base">Recordatorios activos</span>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Recomendaciones -->
	{#if showRecommendations && reminders.length === 0}
		<div class="mb-8" transition:scale={{ duration: 300, easing: backOut }}>
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-xl font-bold text-white flex items-center gap-2">
					<span>✨</span>
					<span>Recordatorios Recomendados</span>
				</h3>
				<button
					onclick={() => showRecommendations = false}
					class="text-white/40 hover:text-white/60 text-sm"
				>
					Ocultar
				</button>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each recommendedReminders as recommended, i}
					<button
						onclick={() => addRecommendedReminder(recommended)}
						class="group relative bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-2 border-white/10 rounded-3xl p-5 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all text-left"
						style="animation-delay: {i * 100}ms"
					>
						<!-- Badge -->
						<div class="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg">
							{recommended.badge}
						</div>
						
						<div class="flex items-start gap-4">
							<div class="text-5xl group-hover:scale-110 transition-transform">
								{recommended.emoji}
							</div>
							<div class="flex-1">
								<h4 class="font-bold text-white text-lg mb-1">{recommended.name}</h4>
								<p class="text-white/60 text-sm mb-3">{recommended.description}</p>
								<div class="flex items-center gap-3 text-sm flex-wrap">
									<span class="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-semibold">
										{recommended.times_per_day}x al día
									</span>
									<span class="text-white/40">
										{recommended.start_time} - {recommended.end_time}
									</span>
								</div>
							</div>
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Reminders List -->
	<div class="space-y-3 md:space-y-5 mb-6 md:mb-8">
		{#each reminders as reminder, i (reminder.id)}
			<div 
				class="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 border-2 border-white/10 rounded-2xl md:rounded-3xl p-3 md:p-6 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all group"
				transition:scale={{ duration: 300, delay: i * 50, easing: backOut }}
			>
				<!-- Status Badge -->
				<div class="absolute -top-2 md:-top-3 left-3 md:left-6 px-2 md:px-4 py-0.5 md:py-1 rounded-full text-xs font-bold shadow-lg {reminder.enabled ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-neutral-700 text-white/60'}">
					{reminder.enabled ? '✓ Activo' : '○ Pausado'}
				</div>
				
				<div class="flex flex-col gap-3 md:gap-5 mt-2">
					<!-- Header Row -->
					<div class="flex items-center gap-2 md:gap-4">
						<div class="flex-shrink-0">
							<div class="text-4xl md:text-6xl group-hover:scale-110 transition-transform">
								{sourceTypeIcons[reminder.source_type]}
							</div>
						</div>
						
						<div class="flex-1 min-w-0">
							<input
								type="text"
								bind:value={reminder.name}
								class="w-full bg-transparent border-0 border-b-2 border-white/10 focus:border-blue-500 px-0 py-1 md:py-2 text-base md:text-xl font-bold text-white focus:outline-none placeholder-white/30"
								placeholder="Nombre del recordatorio"
							/>
						</div>
						
						<div class="flex gap-1.5 md:gap-2 flex-shrink-0">
							<!-- Toggle -->
							<button
								type="button"
								onclick={() => toggleReminder(reminder)}
								class="relative w-12 h-7 md:w-16 md:h-9 rounded-full transition-all shadow-lg {reminder.enabled ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-neutral-700'}"
								aria-label="{reminder.enabled ? 'Desactivar' : 'Activar'} recordatorio"
							>
								<div class="absolute top-0.5 md:top-1 {reminder.enabled ? 'right-0.5 md:right-1' : 'left-0.5 md:left-1'} w-6 h-6 md:w-7 md:h-7 bg-white rounded-full transition-all shadow-md"></div>
							</button>
							
							<!-- Delete -->
							<button
								type="button"
								onclick={() => removeReminder(reminder.id)}
								class="p-1.5 md:p-2 text-red-400 hover:bg-red-500/20 rounded-lg md:rounded-xl transition-colors"
								title="Eliminar recordatorio"
								aria-label="Eliminar recordatorio"
							>
								<svg class="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
								</svg>
							</button>
						</div>
					</div>
					
					<!-- Frequency and Time Range -->
					<div class="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 items-start sm:items-center">
						<div class="flex items-center gap-1.5 md:gap-2 bg-blue-500/20 border-2 border-blue-500/30 rounded-lg md:rounded-xl px-3 md:px-4 py-1.5 md:py-2.5">
							<span class="text-white/60 text-xs md:text-sm font-semibold">🔄</span>
							<input
								type="number"
								min="1"
								max="24"
								bind:value={reminder.times_per_day}
								class="w-10 md:w-14 bg-transparent border-0 text-center text-white font-bold text-sm md:text-lg focus:outline-none"
							/>
							<span class="text-white/80 font-semibold text-xs md:text-sm">veces/día</span>
						</div>
						
						<div class="flex items-center gap-1.5 md:gap-2">
							<span class="text-white/60 text-xs md:text-sm font-semibold">⏰</span>
							<input
								type="time"
								bind:value={reminder.start_time}
								class="bg-neutral-800/50 border-2 border-white/20 rounded-lg md:rounded-xl px-2 md:px-3 py-1 md:py-2 text-sm md:text-base text-white font-semibold focus:border-blue-500 focus:outline-none"
							/>
							<span class="text-white/40 text-sm">-</span>
							<input
								type="time"
								bind:value={reminder.end_time}
								class="bg-neutral-800/50 border-2 border-white/20 rounded-lg md:rounded-xl px-2 md:px-3 py-1 md:py-2 text-sm md:text-base text-white font-semibold focus:border-blue-500 focus:outline-none"
							/>
						</div>
					</div>
					
					<!-- Days -->
					<div class="flex gap-1 md:gap-1.5 flex-wrap">
						{#each daysOfWeek as day}
							<button
								type="button"
								onclick={() => toggleDay(reminder, day.id)}
								class="w-8 h-8 md:w-11 md:h-11 rounded-full border-2 transition-all text-xs md:text-sm font-bold shadow-md
									{reminder.days.includes(day.id) 
										? 'border-blue-500 bg-gradient-to-br from-blue-500 to-cyan-500 text-white scale-110' 
										: 'border-white/20 text-white/40 hover:border-white/40 hover:scale-105'}"
								title={day.name}
								aria-label={`Seleccionar ${day.name}`}
							>
								{day.label}
							</button>
						{/each}
					</div>
					
					<!-- Notifications -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
						<input
							type="text"
							bind:value={reminder.notification_title}
							class="bg-neutral-800/50 border-2 border-white/10 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-white font-semibold focus:border-blue-500/50 focus:outline-none placeholder-white/30"
							placeholder="💬 Título"
						/>
						<input
							type="text"
							bind:value={reminder.notification_body}
							class="bg-neutral-800/50 border-2 border-white/10 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-white focus:border-blue-500/50 focus:outline-none placeholder-white/30"
							placeholder="✉️ Mensaje"
						/>
					</div>
					
					<!-- Options Row - Collapsible on mobile -->
					<details class="group/details">
						<summary class="flex items-center gap-2 cursor-pointer text-sm text-white/60 hover:text-white/80 transition-colors py-1 md:hidden">
							<svg class="w-4 h-4 transition-transform group-open/details:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M9 18l6-6-6-6"/>
							</svg>
							<span>Opciones avanzadas</span>
						</summary>
						<div class="flex flex-wrap gap-2 md:gap-3 pt-2 border-t border-white/10 mt-2">
							<label class="flex items-center gap-1.5 md:gap-2 cursor-pointer group/opt">
								<input type="checkbox" bind:checked={reminder.sound_enabled} class="w-4 h-4 md:w-5 md:h-5 rounded-lg accent-blue-500" />
								<span class="text-xs md:text-sm text-white/70 group-hover/opt:text-white transition-colors">🔊 Sonido</span>
							</label>
							
							<label class="flex items-center gap-1.5 md:gap-2 cursor-pointer group/opt">
								<input type="checkbox" bind:checked={reminder.vibration_enabled} class="w-4 h-4 md:w-5 md:h-5 rounded-lg accent-blue-500" />
								<span class="text-xs md:text-sm text-white/70 group-hover/opt:text-white transition-colors">📳 Vibración</span>
							</label>
							
							<div class="flex items-center gap-1.5 md:gap-2">
								<span class="text-xs md:text-sm text-white/60">Prioridad:</span>
								<select bind:value={reminder.priority} class="bg-neutral-800 border border-white/20 rounded-lg px-2 md:px-3 py-1 text-xs md:text-sm text-white focus:border-blue-500 focus:outline-none">
									<option value="min">Mín</option>
									<option value="low">Baja</option>
									<option value="default">Normal</option>
									<option value="high">Alta</option>
									<option value="max">Máx</option>
								</select>
							</div>
						</div>
					</details>
				</div>
			</div>
		{/each}
		
		<!-- Add Reminder Button -->
		<button
			type="button"
			onclick={addReminder}
			class="w-full border-2 md:border-3 border-dashed border-blue-500/30 rounded-2xl md:rounded-3xl p-4 md:p-8 hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 transition-all group hover:scale-105 mb-4 md:mb-0"
		>
			<div class="flex items-center justify-center gap-2 md:gap-4">
				<div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
					<svg class="w-5 h-5 md:w-7 md:h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
						<path d="M12 5v14M5 12h14"/>
					</svg>
				</div>
				<span class="text-base md:text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-cyan-300">
					Crear Recordatorio Personalizado
				</span>
			</div>
		</button>
	</div>
	
	<!-- Navigation - Hidden on mobile (using floating nav) -->
	<div class="hidden md:flex justify-between gap-4">
		<button
			type="button"
			onclick={onBack}
			class="group flex items-center gap-3 px-8 py-4 bg-neutral-800/50 border-2 border-white/10 rounded-2xl hover:border-white/30 hover:scale-105 transition-all"
		>
			<svg class="w-6 h-6 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 12H5M12 19l-7-7 7-7"/>
			</svg>
			<span class="font-semibold text-lg">Atrás</span>
		</button>
		
		<button
			type="button"
			onclick={onNext}
			class="group flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl hover:from-blue-500 hover:via-cyan-500 hover:to-teal-500 hover:scale-105 transition-all shadow-xl shadow-blue-500/30"
		>
			<span class="font-bold text-lg">Continuar</span>
			<svg class="w-6 h-6 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<path d="M5 12h14M12 5l7 7-7 7"/>
			</svg>
		</button>
	</div>
</div>
