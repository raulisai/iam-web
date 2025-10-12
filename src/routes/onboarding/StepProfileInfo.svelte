<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	
	interface Props {
		profileData: any;
		onNext: () => void;
		onBack?: () => void;
		isEdit?: boolean;
	}
	
	let { profileData = $bindable(), onNext, onBack, isEdit = false }: Props = $props();
	
	// Valores por defecto si no existen
	if (!profileData.work_schedules) profileData.work_schedules = '9:00-17:00';
	if (!profileData.day_work) profileData.day_work = 'L,M,M,J,V';
	if (!profileData.hours_available_to_week) profileData.hours_available_to_week = 10;
	
	// Estado local para días de trabajo
	let workDays = $state({
		D: false, // Domingo
		L: true,  // Lunes
		M: true,  // Martes
		Mi: true, // Miércoles (usamos Mi para diferenciar de Martes)
		J: true,  // Jueves
		V: true,  // Viernes
		S: false  // Sábado
	});
	
	// Sincronizar workDays con profileData.day_work al montar
	$effect(() => {
		if (profileData.day_work) {
			const days = profileData.day_work.split(',');
			workDays = {
				D: days.includes('D'),
				L: days.includes('L'),
				M: days.includes('M'),
				Mi: days.includes('M') && days.filter((d: string) => d === 'M').length === 2,
				J: days.includes('J'),
				V: days.includes('V'),
				S: days.includes('S')
			};
		}
	});
	
	// Función para normalizar formato de hora (de "800" a "08:00", de "1900" a "19:00")
	function normalizeTimeFormat(time: string): string {
		if (!time) return '09:00';
		
		// Si ya tiene formato HH:MM, devolverlo
		if (time.includes(':') && time.length >= 4) {
			const parts = time.split(':');
			const hours = parts[0].padStart(2, '0');
			const minutes = parts[1]?.padStart(2, '0') || '00';
			return `${hours}:${minutes}`;
		}
		
		// Si es formato sin dos puntos (ej: "800", "1900")
		const numStr = time.padStart(4, '0');
		const hours = numStr.slice(0, 2);
		const minutes = numStr.slice(2, 4);
		return `${hours}:${minutes}`;
	}
	
	// Inicializar horarios de trabajo desde profileData
	let workStart = $state('09:00');
	let workEnd = $state('17:00');
	
	// Inicializar una sola vez desde profileData (sin crear ciclo)
	if (profileData.work_schedules && profileData.work_schedules.includes('-')) {
		const [start, end] = profileData.work_schedules.split('-');
		workStart = normalizeTimeFormat(start.trim());
		workEnd = normalizeTimeFormat(end.trim());
	}
	
	// Calcular horas de trabajo diarias
	function calculateDailyWorkHours(): number {
		const start = workStart.split(':').map(Number);
		const end = workEnd.split(':').map(Number);
		const startMinutes = start[0] * 60 + start[1];
		const endMinutes = end[0] * 60 + end[1];
		return Math.max(0, (endMinutes - startMinutes) / 60);
	}
	
	// Calcular días laborales
	function getWorkDaysCount(): number {
		return Object.values(workDays).filter(Boolean).length;
	}
	
	// Calcular horas de trabajo semanales
	const totalWorkHoursPerWeek = $derived(() => {
		const dailyHours = calculateDailyWorkHours();
		const workDaysCount = getWorkDaysCount();
		return Math.round(dailyHours * workDaysCount * 10) / 10;
	});
	
	// Horas disponibles para actividades (despierto 16h/día promedio)
	const availableHoursPerWeek = $derived(() => {
		const totalAwakeHours = 16 * 7; // 112 horas despierto por semana
		const workHours = totalWorkHoursPerWeek();
		const available = totalAwakeHours - workHours;
		return Math.round(available * 10) / 10;
	});
	
	// Actualizar profileData cuando cambian los campos (usando untrack para evitar ciclo)
	$effect(() => {
		// Normalizar los valores antes de guardar
		const normalizedStart = normalizeTimeFormat(workStart);
		const normalizedEnd = normalizeTimeFormat(workEnd);
		profileData.work_schedules = `${normalizedStart}-${normalizedEnd}`;
		
		// Construir day_work string
		const selectedDays: string[] = [];
		if (workDays.D) selectedDays.push('D');
		if (workDays.L) selectedDays.push('L');
		if (workDays.M) selectedDays.push('M');
		if (workDays.Mi) selectedDays.push('M');
		if (workDays.J) selectedDays.push('J');
		if (workDays.V) selectedDays.push('V');
		if (workDays.S) selectedDays.push('S');
		profileData.day_work = selectedDays.join(',');
	});
	
	function toggleWorkDay(day: keyof typeof workDays) {
		workDays[day] = !workDays[day];
	}
	
	function validate() {
		if (!profileData.birth_date) {
			alert('⚠️ La fecha de nacimiento es requerida');
			return false;
		}
		if (!profileData.gender) {
			alert('⚠️ Por favor selecciona tu género');
			return false;
		}
		if (getWorkDaysCount() === 0) {
			alert('⚠️ Selecciona al menos un día de trabajo');
			return false;
		}
		if (!profileData.hours_available_to_week || profileData.hours_available_to_week <= 0) {
			alert('⚠️ Ingresa las horas que deseas dedicar a tus actividades por semana');
			return false;
		}
		return true;
	}
	
	function handleNext() {
		if (validate()) {
			onNext();
		}
	}
</script>

<div 
	class="w-full max-w-4xl mx-auto"
	in:fly={{ x: 300, duration: 400, easing: quintOut }}
	out:fly={{ x: -300, duration: 300, easing: quintOut }}
>
	<!-- Header con gamificación -->
	<div class="text-center mb-8">
		<div class="inline-flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 rounded-full px-6 py-3 mb-4">
			<span class="text-3xl">👤</span>
			<span class="text-purple-400 font-semibold">Información Personal</span>
		</div>
		<p class="text-white/60 text-sm">
			{isEdit ? '✏️ Actualiza tu información personal' : '🎯 Cuéntanos sobre ti para personalizar tu experiencia'}
		</p>
	</div>
	
	<!-- Formulario con diseño de juego -->
	<div class="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm space-y-8">
		<!-- Información Personal -->
		<div>
			<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
				<span>👤</span>
				<span>Información Personal</span>
			</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- Birth Date -->
				<div class="group">
					<label for="onb-birth-date" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-purple-400 transition-colors">
						🎂 Fecha de Nacimiento *
					</label>
					<input 
						id="onb-birth-date"
						type="date" 
						bind:value={profileData.birth_date}
						class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:border-white/20"
					/>
				</div>
			
			<!-- Gender -->
			<div class="group">
				<span class="block text-sm font-medium mb-2 text-white/80">⚧️ Género *</span>
				<div class="grid grid-cols-3 gap-2">
					{#each [
						{ value: 'male', icon: '👨', label: 'Masc' },
						{ value: 'female', icon: '👩', label: 'Fem' },
						{ value: 'other', icon: '⚧️', label: 'Otro' }
					] as option}
						<button
							type="button"
							onclick={() => profileData.gender = option.value}
							class="group/btn relative px-4 py-3 rounded-xl border-2 transition-all duration-300 overflow-hidden
								{profileData.gender === option.value 
									? 'border-purple-500 bg-purple-500/20 scale-105' 
									: 'border-white/10 hover:border-purple-500/50 hover:scale-105'}"
						>
							<div class="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover/btn:from-purple-500/10 group-hover/btn:to-pink-500/10 transition-all"></div>
							<span class="relative text-lg">{option.icon}</span>
							<span class="relative block text-xs mt-1 font-medium">{option.label}</span>
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Weight -->
			<div class="group">
				<label for="onb-weight" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-orange-400 transition-colors">
					⚖️ Peso (kg)
				</label>
				<div class="relative">
					<input 
						id="onb-weight"
						type="number" 
						bind:value={profileData.weight_kg}
						min="30"
						max="300"
						step="0.1"
						placeholder="75.0"
						class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all hover:border-white/20"
					/>
					{#if profileData.weight_kg}
						<div class="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 text-xs font-semibold">
							kg
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Height -->
			<div class="group">
				<label for="onb-height" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-orange-400 transition-colors">
					📏 Altura (cm)
				</label>
				<div class="relative">
					<input 
						id="onb-height"
						type="number" 
						bind:value={profileData.height_cm}
						min="100"
						max="250"
						placeholder="175"
						class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all hover:border-white/20"
					/>
					{#if profileData.height_cm}
						<div class="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 text-xs font-semibold">
							cm
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Timezone -->
			<div class="group">
				<label for="onb-timezone" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-blue-400 transition-colors">
					🌍 Zona Horaria
				</label>
				<select 
					id="onb-timezone"
					bind:value={profileData.timezone}
					class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-white/20 cursor-pointer"
				>
					<option value="America/Mexico_City">🇲🇽 Ciudad de México (GMT-6)</option>
					<option value="America/New_York">🇺🇸 Nueva York (GMT-5)</option>
					<option value="America/Los_Angeles">🇺🇸 Los Ángeles (GMT-8)</option>
					<option value="Europe/Madrid">🇪🇸 Madrid (GMT+1)</option>
					<option value="Europe/London">🇬🇧 Londres (GMT+0)</option>
				</select>
			</div>
			
				<!-- Language -->
				<div class="group">
					<label for="onb-language" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-blue-400 transition-colors">
						🗣️ Idioma Preferido
					</label>
					<select 
						id="onb-language"
						bind:value={profileData.preferred_language}
						class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-white/20 cursor-pointer"
					>
						<option value="es">🇪🇸 Español</option>
						<option value="en">🇬🇧 English</option>
					</select>
				</div>
			</div>
		</div>
		
		<!-- Información Laboral -->
		<div class="border-t border-white/10 pt-6">
			<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
				<span>💼</span>
				<span>Horario de Trabajo</span>
			</h3>
			
			<div class="space-y-6">
				<!-- Horario de trabajo -->
				<fieldset>
					<legend class="block text-sm font-medium mb-3 text-white/80">
						⏰ ¿En qué horario trabajas o estudias?
					</legend>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="work-start" class="block text-xs text-white/60 mb-2">Hora de inicio</label>
							<input 
								id="work-start"
								type="time" 
								bind:value={workStart}
								class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all hover:border-white/20"
							/>
						</div>
						<div>
							<label for="work-end" class="block text-xs text-white/60 mb-2">Hora de fin</label>
							<input 
								id="work-end"
								type="time" 
								bind:value={workEnd}
								class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all hover:border-white/20"
							/>
						</div>
					</div>
				</fieldset>
				
				<!-- Días de trabajo -->
				<fieldset>
					<legend class="block text-sm font-medium mb-3 text-white/80">
						📅 ¿Qué días trabajas o estudias? *
					</legend>
					<div class="grid grid-cols-7 gap-2">
						{#each [
							{ key: 'D', label: 'Dom', icon: '☀️' },
							{ key: 'L', label: 'Lun', icon: '1️⃣' },
							{ key: 'M', label: 'Mar', icon: '2️⃣' },
							{ key: 'Mi', label: 'Mié', icon: '3️⃣' },
							{ key: 'J', label: 'Jue', icon: '4️⃣' },
							{ key: 'V', label: 'Vie', icon: '5️⃣' },
							{ key: 'S', label: 'Sáb', icon: '6️⃣' }
						] as day}
							<button
								type="button"
								onclick={() => toggleWorkDay(day.key as keyof typeof workDays)}
								class="group/day relative bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 border-2 rounded-xl p-3 hover:scale-105 transition-all duration-300
									{workDays[day.key as keyof typeof workDays] 
										? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/25' 
										: 'border-white/10 hover:border-white/20'}"
							>
								<div class="flex flex-col items-center gap-1">
									<span class="text-lg">{day.icon}</span>
									<span class="text-xs font-semibold">{day.label}</span>
								</div>
								{#if workDays[day.key as keyof typeof workDays]}
									<div class="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
										<svg class="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
											<path d="M5 13l4 4L19 7"/>
										</svg>
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</fieldset>
				
				<!-- Calculadora de horas -->
				<div class="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
					<div class="flex items-center gap-3 mb-4">
						<span class="text-2xl">📊</span>
						<h4 class="font-semibold">Cálculo Automático</h4>
					</div>
					
					<div class="grid grid-cols-2 gap-4 mb-4">
						<div class="bg-black/20 rounded-lg p-4">
							<div class="text-xs text-white/60 mb-1">Horas trabajo/día</div>
							<div class="text-2xl font-bold text-cyan-400">{calculateDailyWorkHours().toFixed(1)}h</div>
						</div>
						<div class="bg-black/20 rounded-lg p-4">
							<div class="text-xs text-white/60 mb-1">Días laborales</div>
							<div class="text-2xl font-bold text-cyan-400">{getWorkDaysCount()} días</div>
						</div>
					</div>
					
					<div class="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4">
						<div class="flex items-center justify-between">
							<div>
								<div class="text-xs text-white/60 mb-1">Total trabajo/semana</div>
								<div class="text-3xl font-bold text-orange-400">{totalWorkHoursPerWeek()}h</div>
							</div>
							<div class="text-right">
								<div class="text-xs text-white/60 mb-1">Horas libres/semana</div>
								<div class="text-3xl font-bold text-green-400">{availableHoursPerWeek()}h</div>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Horas disponibles para actividades -->
				<div>
					<label for="onb-available-hours" class="block text-sm font-medium mb-3 text-white/80">
						⏳ ¿Cuántas horas por semana quieres dedicar a tus actividades de IAM? *
					</label>
					<div class="flex items-center gap-4">
						<input 
							id="onb-available-hours"
							type="number" 
							bind:value={profileData.hours_available_to_week}
							min="1"
							max={availableHoursPerWeek()}
							step="0.5"
							class="flex-1 bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:border-white/20"
						/>
						<div class="text-sm text-white/60">
							de {availableHoursPerWeek()}h disponibles
						</div>
					</div>
					<div class="mt-2 text-xs text-white/40">
						💡 Recomendamos comenzar con {Math.min(10, Math.round(availableHoursPerWeek() * 0.1))}h semanales (10% de tu tiempo libre)
					</div>
					
					<!-- Barra de progreso visual -->
					<div class="mt-4 bg-neutral-800/50 rounded-full h-3 overflow-hidden">
						<div 
							class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 rounded-full"
							style="width: {Math.min(100, (profileData.hours_available_to_week / availableHoursPerWeek()) * 100)}%"
						></div>
					</div>
					<div class="mt-2 text-xs text-center text-white/60">
						{Math.round((profileData.hours_available_to_week / availableHoursPerWeek()) * 100)}% de tu tiempo libre
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Navigation Buttons -->
	<div class="flex justify-between mt-8">
		{#if onBack}
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
		{:else}
			<div></div>
		{/if}
		
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
