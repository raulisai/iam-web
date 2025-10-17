<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	
	interface NotificationPreferences {
		task_overdue_reminders: number;
		task_overdue_alarms: number;
		reminder_frequency: 'low' | 'medium' | 'high';
		alarm_intensity: 'gentle' | 'normal' | 'insistent';
		quiet_hours_enabled: boolean;
		quiet_hours_start: string;
		quiet_hours_end: string;
	}
	
	interface Props {
		preferences: NotificationPreferences;
		onNext: () => void;
		onBack: () => void;
	}
	
	let { preferences = $bindable(), onNext, onBack }: Props = $props();
	
	const reminderOptions = [
		{ value: 0, label: 'Ninguno', desc: 'No me molestes', icon: '🔕' },
		{ value: 1, label: '1 recordatorio', desc: 'Solo uno', icon: '🔔' },
		{ value: 2, label: '2 recordatorios', desc: 'Un par', icon: '🔔🔔' },
		{ value: 3, label: '3 recordatorios', desc: 'Insistente', icon: '🔔🔔🔔' }
	];
	
	const alarmOptions = [
		{ value: 0, label: 'Sin alarmas', desc: 'Solo notificaciones', icon: '🔕' },
		{ value: 1, label: '1 alarma', desc: 'Una advertencia', icon: '⏰' },
		{ value: 2, label: '2 alarmas', desc: 'Muy insistente', icon: '⏰⏰' }
	];
	
	const frequencyOptions: Array<{ value: 'low' | 'medium' | 'high'; label: string; desc: string; icon: string; color: string }> = [
		{ value: 'low', label: 'Relajado', desc: 'Pocas notificaciones', icon: '😌', color: 'green' },
		{ value: 'medium', label: 'Balanceado', desc: 'Equilibrio perfecto', icon: '😊', color: 'blue' },
		{ value: 'high', label: 'Motivado', desc: 'Muchas notificaciones', icon: '🔥', color: 'orange' }
	];
	
	const intensityOptions: Array<{ value: 'gentle' | 'normal' | 'insistent'; label: string; desc: string; icon: string; color: string }> = [
		{ value: 'gentle', label: 'Suave', desc: 'Discreto y tranquilo', icon: '🌸', color: 'pink' },
		{ value: 'normal', label: 'Normal', desc: 'Estándar', icon: '🔔', color: 'blue' },
		{ value: 'insistent', label: 'Insistente', desc: 'Difícil de ignorar', icon: '🚨', color: 'red' }
	];
</script>

<div 
	class="w-full max-w-4xl mx-auto"
	in:fly={{ x: 300, duration: 400, easing: quintOut }}
	out:fly={{ x: -300, duration: 300, easing: quintOut }}
>
	<!-- Header -->
	<div class="text-center mb-8">
		<div class="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-full px-6 py-3 mb-4">
			<span class="text-3xl">🔔</span>
			<span class="text-blue-400 font-semibold">Preferencias de Notificaciones</span>
		</div>
		<p class="text-white/60 text-sm max-w-2xl mx-auto">
			Configura cuánto quieres que te recordemos completar tus tareas. Encuentra el balance perfecto entre motivación y tranquilidad.
		</p>
	</div>
	
	<div class="space-y-6">
		<!-- Recordatorios cuando estás atrasado -->
		<div class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-white/10 rounded-2xl p-6">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
					<span class="text-2xl">📬</span>
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-white">Recordatorios por Tareas Atrasadas</h3>
					<p class="text-sm text-white/60">¿Cuántas notificaciones quieres recibir cuando tengas tareas pendientes?</p>
				</div>
			</div>
			
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
				{#each reminderOptions as option}
					<button
						type="button"
						onclick={() => preferences.task_overdue_reminders = option.value}
						class="relative p-4 rounded-xl border-2 transition-all hover:scale-105
							{preferences.task_overdue_reminders === option.value
								? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/25'
								: 'border-white/10 hover:border-white/20 bg-neutral-800/50'}"
					>
						<div class="text-3xl mb-2">{option.icon}</div>
						<div class="text-sm font-semibold text-white mb-1">{option.label}</div>
						<div class="text-xs text-white/60">{option.desc}</div>
						
						{#if preferences.task_overdue_reminders === option.value}
							<div class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
								<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
									<path d="M5 13l4 4L19 7"/>
								</svg>
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
		
		<!-- Alarmas cuando estás MUY atrasado -->
		<div class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-white/10 rounded-2xl p-6">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
					<span class="text-2xl">⏰</span>
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-white">Alarmas de Urgencia</h3>
					<p class="text-sm text-white/60">¿Cuántas alarmas más insistentes quieres cuando estés MUY atrasado?</p>
				</div>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
				{#each alarmOptions as option}
					<button
						type="button"
						onclick={() => preferences.task_overdue_alarms = option.value}
						class="relative p-4 rounded-xl border-2 transition-all hover:scale-105
							{preferences.task_overdue_alarms === option.value
								? 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/25'
								: 'border-white/10 hover:border-white/20 bg-neutral-800/50'}"
					>
						<div class="text-3xl mb-2">{option.icon}</div>
						<div class="text-sm font-semibold text-white mb-1">{option.label}</div>
						<div class="text-xs text-white/60">{option.desc}</div>
						
						{#if preferences.task_overdue_alarms === option.value}
							<div class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
								<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
									<path d="M5 13l4 4L19 7"/>
								</svg>
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
		
		<!-- Frecuencia general -->
		<div class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-white/10 rounded-2xl p-6">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
					<span class="text-2xl">📊</span>
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-white">Frecuencia General</h3>
					<p class="text-sm text-white/60">¿Con qué frecuencia quieres recibir notificaciones en general?</p>
				</div>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
				{#each frequencyOptions as option}
					<button
						type="button"
						onclick={() => preferences.reminder_frequency = option.value as 'low' | 'medium' | 'high'}
						class="relative p-4 rounded-xl border-2 transition-all hover:scale-105
							{preferences.reminder_frequency === option.value
								? `border-${option.color}-500 bg-${option.color}-500/20 shadow-lg shadow-${option.color}-500/25`
								: 'border-white/10 hover:border-white/20 bg-neutral-800/50'}"
					>
						<div class="text-3xl mb-2">{option.icon}</div>
						<div class="text-sm font-semibold text-white mb-1">{option.label}</div>
						<div class="text-xs text-white/60">{option.desc}</div>
						
						{#if preferences.reminder_frequency === option.value}
							<div class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
								<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
									<path d="M5 13l4 4L19 7"/>
								</svg>
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
		
		<!-- Intensidad de alarmas -->
		<div class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-white/10 rounded-2xl p-6">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
					<span class="text-2xl">🔊</span>
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-white">Intensidad de Alarmas</h3>
					<p class="text-sm text-white/60">¿Qué tan insistentes deben ser las alarmas?</p>
				</div>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
				{#each intensityOptions as option}
					<button
						type="button"
						onclick={() => preferences.alarm_intensity = option.value as 'gentle' | 'normal' | 'insistent'}
						class="relative p-4 rounded-xl border-2 transition-all hover:scale-105
							{preferences.alarm_intensity === option.value
								? `border-${option.color}-500 bg-${option.color}-500/20 shadow-lg shadow-${option.color}-500/25`
								: 'border-white/10 hover:border-white/20 bg-neutral-800/50'}"
					>
						<div class="text-3xl mb-2">{option.icon}</div>
						<div class="text-sm font-semibold text-white mb-1">{option.label}</div>
						<div class="text-xs text-white/60">{option.desc}</div>
						
						{#if preferences.alarm_intensity === option.value}
							<div class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
								<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
									<path d="M5 13l4 4L19 7"/>
								</svg>
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
		
		<!-- Horario de silencio -->
		<div class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-white/10 rounded-2xl p-6">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
					<span class="text-2xl">🌙</span>
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-white">Horario de Silencio</h3>
					<p class="text-sm text-white/60">Define un horario donde no recibirás notificaciones</p>
				</div>
				<button
					type="button"
					onclick={() => preferences.quiet_hours_enabled = !preferences.quiet_hours_enabled}
					class="relative w-14 h-8 rounded-full transition-colors {preferences.quiet_hours_enabled ? 'bg-green-500' : 'bg-neutral-700'}"
				>
					<div class="absolute top-1 {preferences.quiet_hours_enabled ? 'right-1' : 'left-1'} w-6 h-6 bg-white rounded-full transition-all shadow-lg"></div>
				</button>
			</div>
			
			{#if preferences.quiet_hours_enabled}
				<div class="flex flex-col md:flex-row gap-4 mt-4">
					<div class="flex-1">
						<label class="block text-sm text-white/60 mb-2">Desde</label>
						<input
							type="time"
							bind:value={preferences.quiet_hours_start}
							class="w-full bg-neutral-800/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-indigo-500/50 focus:outline-none"
						/>
					</div>
					<div class="flex-1">
						<label class="block text-sm text-white/60 mb-2">Hasta</label>
						<input
							type="time"
							bind:value={preferences.quiet_hours_end}
							class="w-full bg-neutral-800/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-indigo-500/50 focus:outline-none"
						/>
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Resumen -->
		<div class="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6">
			<div class="flex items-center gap-3 mb-3">
				<span class="text-2xl">📋</span>
				<h3 class="text-lg font-semibold text-white">Tu Configuración</h3>
			</div>
			<div class="space-y-2 text-sm">
				<p class="text-white/80">
					• <span class="font-semibold text-purple-400">{preferences.task_overdue_reminders}</span> recordatorios cuando tengas tareas atrasadas
				</p>
				<p class="text-white/80">
					• <span class="font-semibold text-orange-400">{preferences.task_overdue_alarms}</span> alarmas de urgencia cuando estés muy atrasado
				</p>
				<p class="text-white/80">
					• Frecuencia <span class="font-semibold text-blue-400">{preferences.reminder_frequency}</span> de notificaciones
				</p>
				<p class="text-white/80">
					• Intensidad <span class="font-semibold text-red-400">{preferences.alarm_intensity}</span> en las alarmas
				</p>
				{#if preferences.quiet_hours_enabled}
					<p class="text-white/80">
						• Silencio de <span class="font-semibold text-indigo-400">{preferences.quiet_hours_start}</span> a <span class="font-semibold text-indigo-400">{preferences.quiet_hours_end}</span>
					</p>
				{/if}
			</div>
		</div>
	</div>
	
	<!-- Navigation -->
	<div class="flex justify-between mt-8">
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
			class="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-500 hover:to-purple-500 hover:scale-105 transition-all shadow-lg shadow-blue-500/25"
		>
			<span class="font-semibold">Continuar</span>
			<svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M12 5l7 7-7 7"/>
			</svg>
		</button>
	</div>
</div>
