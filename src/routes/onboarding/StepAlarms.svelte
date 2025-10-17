<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { quintOut, backOut } from 'svelte/easing';
	
	interface Alarm {
		id: string;
		name: string;
		description?: string;
		time: string;
		days: number[];
		enabled: boolean;
		source_type: 'mind' | 'body' | 'goal' | 'custom';
		notification_title: string;
		notification_body: string;
		notification_icon?: string;
		notification_color?: string;
		sound_enabled: boolean;
		sound_uri?: string;
		vibration_enabled: boolean;
		vibration_pattern?: number[];
		snooze_enabled: boolean;
		snooze_duration_min: number;
		max_snoozes: number;
		priority: 'min' | 'low' | 'default' | 'high' | 'max';
		can_dismiss: boolean;
		auto_dismiss_minutes?: number;
		task_id?: string;
	}
	
	interface Props {
		alarms: Alarm[];
		onNext: () => void;
		onBack: () => void;
	}
	
	let { alarms = $bindable(), onNext, onBack }: Props = $props();
	
	// Recomendaciones predefinidas
	const recommendedAlarms = [
		{
			emoji: '🌅',
			name: 'Despertar Productivo',
			description: 'Empieza el día con energía',
			time: '06:30',
			days: [1, 2, 3, 4, 5],
			source_type: 'mind' as const,
			notification_title: '¡Buenos días! 🌅',
			notification_body: 'Es hora de conquistar el día',
			notification_icon: 'sunrise_icon',
			notification_color: '#FF9800',
			priority: 'max' as const,
			sound_enabled: true,
			vibration_enabled: true,
			snooze_enabled: true,
			badge: 'Popular'
		},
		{
			emoji: '💪',
			name: 'Hora de Ejercicio',
			description: 'No te saltes tu entrenamiento',
			time: '07:00',
			days: [1, 2, 3, 4, 5],
			source_type: 'body' as const,
			notification_title: '💪 ¡A moverse!',
			notification_body: 'Tu cuerpo te lo agradecerá',
			notification_icon: 'fitness_icon',
			notification_color: '#FF5722',
			priority: 'high' as const,
			sound_enabled: true,
			vibration_enabled: true,
			snooze_enabled: false,
			badge: 'Recomendado'
		},
		{
			emoji: '🧘',
			name: 'Meditación Matutina',
			description: 'Calma tu mente antes de empezar',
			time: '06:00',
			days: [1, 2, 3, 4, 5, 6, 0],
			source_type: 'mind' as const,
			notification_title: '🧘 Momento zen',
			notification_body: 'Respira profundo y medita',
			notification_icon: 'meditation_icon',
			notification_color: '#9C27B0',
			priority: 'default' as const,
			sound_enabled: true,
			vibration_enabled: false,
			snooze_enabled: true,
			badge: 'Zen'
		},
		{
			emoji: '📚',
			name: 'Lectura Nocturna',
			description: 'Lee antes de dormir',
			time: '21:30',
			days: [1, 2, 3, 4, 5, 6, 0],
			source_type: 'mind' as const,
			notification_title: '📚 Hora de leer',
			notification_body: '30 minutos de lectura antes de dormir',
			notification_icon: 'book_icon',
			notification_color: '#3F51B5',
			priority: 'default' as const,
			sound_enabled: true,
			vibration_enabled: true,
			snooze_enabled: true,
			badge: 'Nuevo'
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
	
	const sourceTypeColors: Record<string, string> = {
		mind: 'purple',
		body: 'orange',
		goal: 'blue',
		custom: 'green'
	};
	
	const sourceTypeIcons: Record<string, string> = {
		mind: '🧠',
		body: '💪',
		goal: '🎯',
		custom: '⚙️'
	};
	
	function addAlarm() {
		const newAlarm: Alarm = {
			id: `alarm-${Date.now()}`,
			name: 'Nueva Alarma',
			description: '',
			time: '07:00',
			days: [1, 2, 3, 4, 5],
			enabled: true,
			source_type: 'custom',
			notification_title: 'Alarma',
			notification_body: '¡Es hora!',
			notification_icon: 'alarm_icon',
			notification_color: '#FF9800',
			sound_enabled: true,
			vibration_enabled: true,
			snooze_enabled: true,
			snooze_duration_min: 10,
			max_snoozes: 3,
			priority: 'max',
			can_dismiss: true,
			auto_dismiss_minutes: 5
		};
		alarms = [...alarms, newAlarm];
	}
	
	function addRecommendedAlarm(recommended: typeof recommendedAlarms[0]) {
		const newAlarm: Alarm = {
			id: `alarm-${Date.now()}`,
			name: recommended.name,
			description: recommended.description,
			time: recommended.time,
			days: recommended.days,
			enabled: true,
			source_type: recommended.source_type,
			notification_title: recommended.notification_title,
			notification_body: recommended.notification_body,
			notification_icon: recommended.notification_icon,
			notification_color: recommended.notification_color,
			sound_enabled: recommended.sound_enabled,
			vibration_enabled: recommended.vibration_enabled,
			snooze_enabled: recommended.snooze_enabled,
			snooze_duration_min: 10,
			max_snoozes: 3,
			priority: recommended.priority,
			can_dismiss: true,
			auto_dismiss_minutes: 5
		};
		alarms = [...alarms, newAlarm];
	}
	
	function removeAlarm(id: string) {
		alarms = alarms.filter(a => a.id !== id);
	}
	
	function toggleDay(alarm: Alarm, dayId: number) {
		const index = alarms.findIndex(a => a.id === alarm.id);
		if (index === -1) return;
		
		const updatedAlarm = { ...alarm };
		if (updatedAlarm.days.includes(dayId)) {
			updatedAlarm.days = updatedAlarm.days.filter(d => d !== dayId);
		} else {
			updatedAlarm.days = [...updatedAlarm.days, dayId].sort();
		}
		
		alarms[index] = updatedAlarm;
	}
	
	function toggleAlarm(alarm: Alarm) {
		const index = alarms.findIndex(a => a.id === alarm.id);
		if (index === -1) return;
		alarms[index] = { ...alarm, enabled: !alarm.enabled };
	}
</script>

<div 
	class="w-full max-w-6xl mx-auto"
	in:fly={{ x: 300, duration: 400, easing: quintOut }}
	out:fly={{ x: -300, duration: 300, easing: quintOut }}
>
	<!-- Header Gamificado -->
	<div class="text-center mb-8">
		<div class="inline-block relative">
			<div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-lg animate-bounce">
				⏰
			</div>
			<h2 class="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent mb-2">
				Alarmas Épicas
			</h2>
		</div>
		<p class="text-white/70 text-base max-w-2xl mx-auto mb-4">
			¡Nunca vuelvas a perderte algo importante! Crea alarmas poderosas que te mantendrán en el camino 🚀
		</p>
		<div class="flex gap-3 justify-center flex-wrap">
			<div class="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/40 rounded-2xl px-5 py-2.5 backdrop-blur-sm">
				<div class="flex items-center gap-2">
					<span class="text-3xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{alarms.length}</span>
					<span class="text-white/80 font-semibold">Alarmas activas</span>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Recomendaciones -->
	{#if showRecommendations && alarms.length === 0}
		<div class="mb-8" transition:scale={{ duration: 300, easing: backOut }}>
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-xl font-bold text-white flex items-center gap-2">
					<span>✨</span>
					<span>Alarmas Recomendadas</span>
				</h3>
				<button
					onclick={() => showRecommendations = false}
					class="text-white/40 hover:text-white/60 text-sm"
				>
					Ocultar
				</button>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each recommendedAlarms as recommended, i}
					<button
						onclick={() => addRecommendedAlarm(recommended)}
						class="group relative bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-2 border-white/10 rounded-3xl p-5 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105 transition-all text-left"
						style="animation-delay: {i * 100}ms"
					>
						<!-- Badge -->
						<div class="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg">
							{recommended.badge}
						</div>
						
						<div class="flex items-start gap-4">
							<div class="text-5xl group-hover:scale-110 transition-transform">
								{recommended.emoji}
							</div>
							<div class="flex-1">
								<h4 class="font-bold text-white text-lg mb-1">{recommended.name}</h4>
								<p class="text-white/60 text-sm mb-3">{recommended.description}</p>
								<div class="flex items-center gap-3 text-sm">
									<span class="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full font-semibold">
										{recommended.time}
									</span>
									<span class="text-white/40">
										{recommended.days.length === 7 ? 'Todos los días' : `${recommended.days.length} días`}
									</span>
								</div>
							</div>
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Alarms List -->
	<div class="space-y-5 mb-8">
		{#each alarms as alarm, i (alarm.id)}
			<div 
				class="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 border-2 border-white/10 rounded-3xl p-6 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/10 transition-all group"
				transition:scale={{ duration: 300, delay: i * 50, easing: backOut }}
			>
				<!-- Status Badge -->
				<div class="absolute -top-3 left-6 px-4 py-1 rounded-full text-xs font-bold shadow-lg {alarm.enabled ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-neutral-700 text-white/60'}">
					{alarm.enabled ? '✓ Activa' : '○ Pausada'}
				</div>
				
				<div class="flex flex-col gap-5 mt-2">
					<!-- Header Row -->
					<div class="flex items-center gap-4">
						<div class="flex-shrink-0">
							<div class="text-6xl group-hover:scale-110 transition-transform">
								{sourceTypeIcons[alarm.source_type]}
							</div>
						</div>
						
						<div class="flex-1">
							<input
								type="text"
								bind:value={alarm.name}
								class="w-full bg-transparent border-0 border-b-2 border-white/10 focus:border-orange-500 px-0 py-2 text-xl font-bold text-white focus:outline-none placeholder-white/30"
								placeholder="Nombre épico de la alarma"
							/>
						</div>
						
						<div class="flex gap-2">
							<!-- Toggle -->
							<button
								type="button"
								onclick={() => toggleAlarm(alarm)}
								class="relative w-16 h-9 rounded-full transition-all shadow-lg {alarm.enabled ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-neutral-700'}"
								aria-label="{alarm.enabled ? 'Desactivar' : 'Activar'} alarma"
							>
								<div class="absolute top-1 {alarm.enabled ? 'right-1' : 'left-1'} w-7 h-7 bg-white rounded-full transition-all shadow-md"></div>
							</button>
							
							<!-- Delete -->
							<button
								type="button"
								onclick={() => removeAlarm(alarm.id)}
								class="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
								title="Eliminar alarma"
								aria-label="Eliminar alarma"
							>
								<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
								</svg>
							</button>
						</div>
					</div>
					
					<!-- Time and Days -->
					<div class="flex flex-wrap gap-3 items-center">
						<div class="flex items-center gap-2">
							<span class="text-white/60 text-sm font-semibold">⏰</span>
							<input
								type="time"
								bind:value={alarm.time}
								class="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 rounded-xl px-4 py-2.5 text-white font-bold text-lg focus:border-orange-500 focus:outline-none"
							/>
						</div>
						
						<div class="flex gap-1.5">
							{#each daysOfWeek as day}
								<button
									type="button"
									onclick={() => toggleDay(alarm, day.id)}
									class="w-11 h-11 rounded-full border-2 transition-all text-sm font-bold shadow-md
										{alarm.days.includes(day.id) 
											? 'border-orange-500 bg-gradient-to-br from-orange-500 to-red-500 text-white scale-110' 
											: 'border-white/20 text-white/40 hover:border-white/40 hover:scale-105'}"
									title={day.name}
								>
									{day.label}
								</button>
							{/each}
						</div>
					</div>
					
					<!-- Notifications -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<input
							type="text"
							bind:value={alarm.notification_title}
							class="bg-neutral-800/50 border-2 border-white/10 rounded-xl px-4 py-3 text-white font-semibold focus:border-orange-500/50 focus:outline-none placeholder-white/30"
							placeholder="💬 Título de notificación"
						/>
						<input
							type="text"
							bind:value={alarm.notification_body}
							class="bg-neutral-800/50 border-2 border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500/50 focus:outline-none placeholder-white/30"
							placeholder="✉️ Mensaje"
						/>
					</div>
					
					<!-- Options Row -->
					<div class="flex flex-wrap gap-3 pt-2 border-t border-white/10">
						<label class="flex items-center gap-2 cursor-pointer group/opt">
							<input type="checkbox" bind:checked={alarm.sound_enabled} class="w-5 h-5 rounded-lg accent-orange-500" />
							<span class="text-sm text-white/70 group-hover/opt:text-white transition-colors">🔊 Sonido</span>
						</label>
						
						<label class="flex items-center gap-2 cursor-pointer group/opt">
							<input type="checkbox" bind:checked={alarm.vibration_enabled} class="w-5 h-5 rounded-lg accent-orange-500" />
							<span class="text-sm text-white/70 group-hover/opt:text-white transition-colors">📳 Vibración</span>
						</label>
						
						<label class="flex items-center gap-2 cursor-pointer group/opt">
							<input type="checkbox" bind:checked={alarm.snooze_enabled} class="w-5 h-5 rounded-lg accent-orange-500" />
							<span class="text-sm text-white/70 group-hover/opt:text-white transition-colors">😴 Posponer</span>
						</label>
						
						<div class="flex items-center gap-2">
							<span class="text-sm text-white/60">Prioridad:</span>
							<select bind:value={alarm.priority} class="bg-neutral-800 border border-white/20 rounded-lg px-3 py-1 text-sm text-white focus:border-orange-500 focus:outline-none">
								<option value="min">Mín</option>
								<option value="low">Baja</option>
								<option value="default">Normal</option>
								<option value="high">Alta</option>
								<option value="max">Máx</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		{/each}
		
		<!-- Add Alarm Button -->
		<button
			type="button"
			onclick={addAlarm}
			class="w-full border-3 border-dashed border-orange-500/30 rounded-3xl p-8 hover:border-orange-500 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-red-500/10 transition-all group hover:scale-105"
		>
			<div class="flex items-center justify-center gap-4">
				<div class="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
					<svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
						<path d="M12 5v14M5 12h14"/>
					</svg>
				</div>
				<span class="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent group-hover:from-orange-300 group-hover:to-red-300">
					Crear Alarma Personalizada
				</span>
			</div>
		</button>
	</div>
	
	<!-- Navigation -->
	<div class="flex justify-between gap-4">
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
			class="group flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl hover:from-orange-500 hover:via-red-500 hover:to-pink-500 hover:scale-105 transition-all shadow-xl shadow-orange-500/30"
		>
			<span class="font-bold text-lg">Continuar</span>
			<svg class="w-6 h-6 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<path d="M5 12h14M12 5l7 7-7 7"/>
			</svg>
		</button>
	</div>
</div>
