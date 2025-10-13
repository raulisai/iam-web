<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { scale, fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { initializeAuthStore } from '$lib/stores/auth.svelte';
	import { createUserProfile, getUserProfile } from '$lib/services/profile';
	import type { UserProfile } from '$lib/types';
	import { createBotRule, type CreateBotRuleData } from '$lib/services/bot_rules';
	import { createTaskTemplate, type CreateTaskTemplateData } from '$lib/services/task_templates';
	import { generateBotRules, getRecommendedTemplates, calculateXP } from '$lib/utils/onboarding';

	const authStore = initializeAuthStore();
	
	// Pasos del wizard
	let currentStep = $state(1);
	const totalSteps = 5;
	
	// Loading states
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);
	let successMessage = $state<string | null>(null);
	
	// Step 1: Profile Data
	let profileData = $state<UserProfile>({
		timezone: 'America/Mexico_City',
		preferred_language: 'es',
		gender: '',
		birth_date: '',
		weight_kg: undefined,
		height_cm: undefined,
		hours_available_to_week: 40,
		work_schedules: '9:00-17:00',
		current_status: 'active'
	});
	
	// Step 2: Activity Preferences
	interface ActivityPreference {
		id: string;
		name: string;
		icon: string;
		category: 'mind' | 'body';
		selected: boolean;
	}
	
	let activityPreferences = $state<ActivityPreference[]>([
		{ id: 'meditation', name: 'Meditación', icon: '🧘', category: 'mind', selected: false },
		{ id: 'reading', name: 'Lectura', icon: '📚', category: 'mind', selected: false },
		{ id: 'learning', name: 'Aprendizaje', icon: '🎓', category: 'mind', selected: false },
		{ id: 'creativity', name: 'Creatividad', icon: '🎨', category: 'mind', selected: false },
		{ id: 'exercise', name: 'Ejercicio', icon: '💪', category: 'body', selected: false },
		{ id: 'yoga', name: 'Yoga', icon: '🧘‍♀️', category: 'body', selected: false },
		{ id: 'running', name: 'Running', icon: '🏃', category: 'body', selected: false },
		{ id: 'swimming', name: 'Natación', icon: '🏊', category: 'body', selected: false },
		{ id: 'cycling', name: 'Ciclismo', icon: '🚴', category: 'body', selected: false },
		{ id: 'nutrition', name: 'Nutrición', icon: '🥗', category: 'body', selected: false }
	]);
	
	// Step 3: Schedule Preferences
	interface SchedulePreference {
		id: string;
		label: string;
		time: string;
		icon: string;
		selected: boolean;
	}
	
	let schedulePreferences = $state<SchedulePreference[]>([
		{ id: 'early_morning', label: 'Madrugada', time: '05:00-07:00', icon: '🌅', selected: false },
		{ id: 'morning', label: 'Mañana', time: '07:00-12:00', icon: '☀️', selected: false },
		{ id: 'afternoon', label: 'Tarde', time: '12:00-18:00', icon: '🌤️', selected: false },
		{ id: 'evening', label: 'Noche', time: '18:00-22:00', icon: '🌙', selected: false },
		{ id: 'late_night', label: 'Noche Tarde', time: '22:00-00:00', icon: '🌃', selected: false }
	]);
	
	let selectedDays = $state<string[]>([]);
	const daysOfWeek = [
		{ id: 'mon', label: 'Lun', fullName: 'Lunes' },
		{ id: 'tue', label: 'Mar', fullName: 'Martes' },
		{ id: 'wed', label: 'Mié', fullName: 'Miércoles' },
		{ id: 'thu', label: 'Jue', fullName: 'Jueves' },
		{ id: 'fri', label: 'Vie', fullName: 'Viernes' },
		{ id: 'sat', label: 'Sáb', fullName: 'Sábado' },
		{ id: 'sun', label: 'Dom', fullName: 'Domingo' }
	];
	
	// Step 4: Recommended Templates
	let recommendedTemplates = $state<CreateTaskTemplateData[]>([]);
	let selectedTemplates = $state<Set<string>>(new Set());
	
	// Step 5: Custom Tasks
	interface CustomTask {
		name: string;
		category: 'mind' | 'body';
		duration: number;
		difficulty: number;
		description: string;
	}
	
	let customTasks = $state<CustomTask[]>([]);
	let newTask = $state<CustomTask>({
		name: '',
		category: 'mind',
		duration: 30,
		difficulty: 3,
		description: ''
	});
	
	onMount(async () => {
		// Check if user already has a profile
		try {
			const existingProfile = await getUserProfile();
			if (existingProfile) {
				// Usuario ya tiene perfil, redirigir
				goto('/');
			}
		} catch (err) {
			// No profile found, continue with onboarding
			console.log('No existing profile, starting onboarding');
		}
	});
	
	function nextStep() {
		if (currentStep < totalSteps) {
			error = null;
			// Si estamos pasando del paso 2 al 3, generar templates recomendados
			if (currentStep === 2) {
				const selectedActivityIds = activityPreferences
					.filter(a => a.selected)
					.map(a => a.id);
				recommendedTemplates = getRecommendedTemplates(selectedActivityIds);
			}
			currentStep++;
		}
	}
	
	function prevStep() {
		if (currentStep > 1) {
			error = null;
			currentStep--;
		}
	}
	
	function toggleActivity(id: string) {
		const activity = activityPreferences.find(a => a.id === id);
		if (activity) {
			activity.selected = !activity.selected;
		}
	}
	
	function toggleSchedule(id: string) {
		const schedule = schedulePreferences.find(s => s.id === id);
		if (schedule) {
			schedule.selected = !schedule.selected;
		}
	}
	
	function toggleDay(dayId: string) {
		const index = selectedDays.indexOf(dayId);
		if (index > -1) {
			selectedDays = selectedDays.filter(d => d !== dayId);
		} else {
			selectedDays = [...selectedDays, dayId];
		}
	}
	
	function toggleTemplate(templateKey: string) {
		if (selectedTemplates.has(templateKey)) {
			selectedTemplates.delete(templateKey);
		} else {
			selectedTemplates.add(templateKey);
		}
		selectedTemplates = selectedTemplates; // Trigger reactivity
	}
	
	function addCustomTask() {
		if (newTask.name && newTask.description) {
			customTasks = [...customTasks, { ...newTask }];
			newTask = {
				name: '',
				category: 'mind',
				duration: 30,
				difficulty: 3,
				description: ''
			};
		}
	}
	
	function removeCustomTask(index: number) {
		customTasks = customTasks.filter((_, i) => i !== index);
	}
	
	async function completeOnboarding() {
		try {
			isSubmitting = true;
			error = null;
			
			// Step 1: Create Profile
			const profile = await createUserProfile(profileData);
			if (!profile) {
				throw new Error('Failed to create profile');
			}
			
			// Step 2: Create Bot Rules using helper function
			const selectedActivitiesData = activityPreferences
				.filter(a => a.selected)
				.map(a => ({ id: a.id, name: a.name, category: a.category }));
			
			const selectedSchedulesData = schedulePreferences
				.filter(s => s.selected)
				.map(s => ({ id: s.id, time: s.time }));
			
			const botRules = generateBotRules(
				selectedActivitiesData,
				selectedSchedulesData,
				selectedDays
			);
			
			for (const rule of botRules) {
				await createBotRule(authStore, rule);
			}
			
			// Step 3: Create Selected Recommended Templates
			const templatesToCreate = recommendedTemplates.filter(t => 
				selectedTemplates.has(t.key)
			);
			
			for (const template of templatesToCreate) {
				await createTaskTemplate(authStore, template);
			}
			
			// Step 4: Create Custom Task Templates
			for (const task of customTasks) {
				const templateData: CreateTaskTemplateData = {
					key: `custom_${task.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
					name: task.name,
					category: task.category,
					desc: task.description,
					estimated_minutes: task.duration,
					difficulty: task.difficulty,
					reward_xp: calculateXP(task.difficulty, task.duration),
					created_by: 'user'
				};
				
				await createTaskTemplate(authStore, templateData);
			}
			
			successMessage = '¡Configuración completada! Redirigiendo...';
			
			// Redirect to home after 2 seconds
			setTimeout(() => {
				goto('/');
			}, 2000);
			
		} catch (err: any) {
			error = err.message || 'Error al completar la configuración';
			console.error('Error completing onboarding:', err);
		} finally {
			isSubmitting = false;
		}
	}
	
	function validateStep(): boolean {
		switch (currentStep) {
			case 1:
				if (!profileData.birth_date || !profileData.gender) {
					error = 'Por favor completa fecha de nacimiento y género';
					return false;
				}
				break;
			case 2:
				if (!activityPreferences.some(a => a.selected)) {
					error = 'Selecciona al menos una actividad';
					return false;
				}
				break;
			case 3:
				if (!schedulePreferences.some(s => s.selected)) {
					error = 'Selecciona al menos un horario';
					return false;
				}
				break;
		}
		return true;
	}
	
	function handleNext() {
		if (validateStep()) {
			nextStep();
		}
	}
	
	function getCategoryColor(category: 'mind' | 'body'): string {
		return category === 'mind' ? 'from-purple-500 to-indigo-600' : 'from-orange-500 to-red-600';
	}
	
	function getCategoryBorder(category: 'mind' | 'body'): string {
		return category === 'mind' ? 'border-purple-400' : 'border-orange-400';
	}
</script>

<div class="min-h-screen bg-neutral-950 text-white py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="text-center mb-8" in:fade={{ duration: 300 }}>
			<h1 class="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
				¡Bienvenido a IAM! 🎮
			</h1>
			<p class="text-white/60">Configuremos tu experiencia personalizada</p>
		</div>
		
		<!-- Progress Bar -->
		<div class="mb-8">
			<div class="flex justify-between items-center mb-2">
				{#each Array(totalSteps) as _, i}
					<div class="flex items-center flex-1">
						<div 
							class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 {currentStep > i + 1 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : currentStep === i + 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500 ring-4 ring-purple-400/30' : 'bg-neutral-800 text-white/40'}"
						>
							{#if currentStep > i + 1}
								<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
									<path d="M20 6L9 17l-5-5"/>
								</svg>
							{:else}
								{i + 1}
							{/if}
						</div>
						{#if i < totalSteps - 1}
							<div class="flex-1 h-1 mx-2 rounded-full {currentStep > i + 1 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-neutral-800'}"></div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="flex justify-between text-xs text-white/60 px-2">
				<span>Perfil</span>
				<span>Actividades</span>
				<span>Horarios</span>
				<span>Templates</span>
				<span>Custom</span>
			</div>
		</div>
		
		<!-- Error Message -->
		{#if error}
			<div class="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400" transition:fly={{ y: -20, duration: 300 }}>
				❌ {error}
			</div>
		{/if}
		
		<!-- Success Message -->
		{#if successMessage}
			<div class="mb-6 bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-4 text-emerald-400" transition:fly={{ y: -20, duration: 300 }}>
				✅ {successMessage}
			</div>
		{/if}
		
		<!-- Content Card -->
		<div class="bg-neutral-900 rounded-2xl border border-white/10 p-8 shadow-2xl">
			<!-- Step 1: Profile Information -->
			{#if currentStep === 1}
				<div in:scale={{ duration: 300, easing: quintOut, start: 0.95 }}>
					<div class="text-center mb-8">
						<div class="text-6xl mb-4">👤</div>
						<h2 class="text-2xl font-bold mb-2">Información Personal</h2>
						<p class="text-white/60">Cuéntanos un poco sobre ti</p>
					</div>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Birth Date -->
					<div>
						<label for="onb-birth-date" class="block text-sm font-medium mb-2">Fecha de Nacimiento *</label>
						<input 
							id="onb-birth-date"
							type="date" 
							bind:value={profileData.birth_date}
								class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
							/>
						</div>
						
					<!-- Gender -->
					<div>
						<span class="block text-sm font-medium mb-2">Género *</span>
						<div class="grid grid-cols-3 gap-2">
								<button
									type="button"
									onclick={() => profileData.gender = 'male'}
									class="px-4 py-3 rounded-lg border-2 transition-all {profileData.gender === 'male' ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 hover:border-white/20'}"
								>
									👨 Masculino
								</button>
								<button
									type="button"
									onclick={() => profileData.gender = 'female'}
									class="px-4 py-3 rounded-lg border-2 transition-all {profileData.gender === 'female' ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 hover:border-white/20'}"
								>
									👩 Femenino
								</button>
								<button
									type="button"
									onclick={() => profileData.gender = 'other'}
									class="px-4 py-3 rounded-lg border-2 transition-all {profileData.gender === 'other' ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 hover:border-white/20'}"
								>
									⚧️ Otro
								</button>
							</div>
						</div>
						
					<!-- Weight -->
					<div>
						<label for="onb-weight" class="block text-sm font-medium mb-2">Peso (kg)</label>
						<input 
							id="onb-weight"
							type="number" 
							bind:value={profileData.weight_kg}
								min="30"
								max="300"
								step="0.1"
								placeholder="75.0"
								class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
							/>
						</div>
						
					<!-- Height -->
					<div>
						<label for="onb-height" class="block text-sm font-medium mb-2">Altura (cm)</label>
						<input 
							id="onb-height"
							type="number" 
							bind:value={profileData.height_cm}
								min="100"
								max="250"
								placeholder="175"
								class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
							/>
						</div>
						
					<!-- Timezone -->
					<div>
						<label for="onb-timezone" class="block text-sm font-medium mb-2">Zona Horaria</label>
						<select 
							id="onb-timezone"
							bind:value={profileData.timezone}
								class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
							>
								<option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
								<option value="America/New_York">Nueva York (GMT-5)</option>
								<option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
								<option value="Europe/Madrid">Madrid (GMT+1)</option>
								<option value="Europe/London">Londres (GMT+0)</option>
							</select>
						</div>
						
					<!-- Language -->
					<div>
						<label for="onb-language" class="block text-sm font-medium mb-2">Idioma Preferido</label>
						<select 
							id="onb-language"
							bind:value={profileData.preferred_language}
								class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
							>
								<option value="es">🇪🇸 Español</option>
								<option value="en">🇺🇸 English</option>
								<option value="fr">🇫🇷 Français</option>
								<option value="de">🇩🇪 Deutsch</option>
							</select>
						</div>
						
						<!-- Hours Available -->
						<div>
							<label class="block text-sm font-medium mb-2">Horas Disponibles por Semana</label>
							<input 
								type="number" 
								bind:value={profileData.hours_available_to_week}
								min="1"
								max="168"
								class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
							/>
						</div>
						
						<!-- Work Schedule -->
						<div>
							<label class="block text-sm font-medium mb-2">Horario de Trabajo</label>
							<input 
								type="text" 
								bind:value={profileData.work_schedules}
								placeholder="9:00-17:00"
								class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
							/>
						</div>
					</div>
				</div>
			{/if}
			
			<!-- Step 2: Activity Preferences -->
			{#if currentStep === 2}
				<div in:scale={{ duration: 300, easing: quintOut, start: 0.95 }}>
					<div class="text-center mb-8">
						<div class="text-6xl mb-4">🎯</div>
						<h2 class="text-2xl font-bold mb-2">¿Qué Actividades te Interesan?</h2>
						<p class="text-white/60">Selecciona las que más te gusten</p>
					</div>
					
					<!-- Mind Activities -->
					<div class="mb-8">
						<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
							<span>🧠</span>
							<span>Mente</span>
						</h3>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
							{#each activityPreferences.filter(a => a.category === 'mind') as activity}
								<button
									type="button"
									onclick={() => toggleActivity(activity.id)}
									class="relative p-6 rounded-xl border-2 transition-all duration-300 {activity.selected ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 scale-105 shadow-lg shadow-purple-500/30' : 'border-white/10 hover:border-purple-400/50 hover:scale-105'}"
								>
									<div class="text-4xl mb-2">{activity.icon}</div>
									<div class="text-sm font-medium">{activity.name}</div>
									{#if activity.selected}
										<div class="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
											<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
												<path d="M20 6L9 17l-5-5"/>
											</svg>
										</div>
									{/if}
								</button>
							{/each}
						</div>
					</div>
					
					<!-- Body Activities -->
					<div>
						<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
							<span>💪</span>
							<span>Cuerpo</span>
						</h3>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
							{#each activityPreferences.filter(a => a.category === 'body') as activity}
								<button
									type="button"
									onclick={() => toggleActivity(activity.id)}
									class="relative p-6 rounded-xl border-2 transition-all duration-300 {activity.selected ? 'border-orange-500 bg-gradient-to-br from-orange-500/20 to-red-500/20 scale-105 shadow-lg shadow-orange-500/30' : 'border-white/10 hover:border-orange-400/50 hover:scale-105'}"
								>
									<div class="text-4xl mb-2">{activity.icon}</div>
									<div class="text-sm font-medium">{activity.name}</div>
									{#if activity.selected}
										<div class="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
											<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
												<path d="M20 6L9 17l-5-5"/>
											</svg>
										</div>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				</div>
			{/if}
			
			<!-- Step 3: Schedule Preferences -->
			{#if currentStep === 3}
				<div in:scale={{ duration: 300, easing: quintOut, start: 0.95 }}>
					<div class="text-center mb-8">
						<div class="text-6xl mb-4">⏰</div>
						<h2 class="text-2xl font-bold mb-2">¿Cuándo Prefieres Entrenar?</h2>
						<p class="text-white/60">Selecciona tus horarios ideales</p>
					</div>
					
					<!-- Time Slots -->
					<div class="mb-8">
						<h3 class="text-lg font-semibold mb-4">Horarios del Día</h3>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							{#each schedulePreferences as schedule}
								<button
									type="button"
									onclick={() => toggleSchedule(schedule.id)}
									class="relative p-6 rounded-xl border-2 transition-all duration-300 {schedule.selected ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/20 to-green-500/20 scale-105 shadow-lg shadow-emerald-500/30' : 'border-white/10 hover:border-emerald-400/50 hover:scale-105'}"
								>
									<div class="text-4xl mb-2">{schedule.icon}</div>
									<div class="font-medium mb-1">{schedule.label}</div>
									<div class="text-sm text-white/60">{schedule.time}</div>
									{#if schedule.selected}
										<div class="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
											<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
												<path d="M20 6L9 17l-5-5"/>
											</svg>
										</div>
									{/if}
								</button>
							{/each}
						</div>
					</div>
					
					<!-- Days of Week -->
					<div>
						<h3 class="text-lg font-semibold mb-4">Días de la Semana</h3>
						<div class="flex flex-wrap gap-3">
							{#each daysOfWeek as day}
								<button
									type="button"
									onclick={() => toggleDay(day.id)}
									class="px-6 py-3 rounded-lg border-2 transition-all duration-300 {selectedDays.includes(day.id) ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 shadow-lg shadow-blue-500/30' : 'border-white/10 hover:border-blue-400/50'}"
								>
									<div class="font-medium">{day.label}</div>
								</button>
							{/each}
						</div>
						{#if selectedDays.length === 0}
							<p class="text-sm text-white/40 mt-4">💡 Deja vacío para todos los días</p>
						{/if}
					</div>
				</div>
			{/if}
			
			<!-- Step 4: Recommended Templates -->
			{#if currentStep === 4}
				<div in:scale={{ duration: 300, easing: quintOut, start: 0.95 }}>
					<div class="text-center mb-8">
						<div class="text-6xl mb-4">📦</div>
						<h2 class="text-2xl font-bold mb-2">Templates Recomendados</h2>
						<p class="text-white/60">Selecciona los que te gustaría usar</p>
					</div>
					
					{#if recommendedTemplates.length > 0}
						<!-- Mind Templates -->
						{#if recommendedTemplates.some(t => t.category === 'mind')}
							<div class="mb-8">
								<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
									<span>🧠</span>
									<span>Mente</span>
								</h3>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									{#each recommendedTemplates.filter(t => t.category === 'mind') as template}
										<button
											type="button"
											onclick={() => toggleTemplate(template.key)}
											class="relative p-6 rounded-xl border-2 transition-all duration-300 text-left {selectedTemplates.has(template.key) ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 scale-105 shadow-lg shadow-purple-500/30' : 'border-white/10 hover:border-purple-400/50 hover:scale-105'}"
										>
											<div class="flex items-start justify-between mb-2">
												<h4 class="font-bold text-white">{template.name}</h4>
												{#if selectedTemplates.has(template.key)}
													<div class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
														<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
															<path d="M20 6L9 17l-5-5"/>
														</svg>
													</div>
												{/if}
											</div>
											<p class="text-sm text-white/60 mb-3">{template.desc}</p>
											<div class="flex gap-3 text-xs text-white/40">
												<span class="flex items-center gap-1">
													<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
														<circle cx="12" cy="12" r="10"/>
														<path d="M12 6v6l4 2"/>
													</svg>
													{template.estimated_minutes}min
												</span>
												<span class="flex items-center gap-1">
													{#each Array(template.difficulty || 3) as _}
														⭐
													{/each}
												</span>
												<span class="flex items-center gap-1 text-emerald-400">
													<svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
														<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
													</svg>
													+{template.reward_xp} XP
												</span>
											</div>
										</button>
									{/each}
								</div>
							</div>
						{/if}
						
						<!-- Body Templates -->
						{#if recommendedTemplates.some(t => t.category === 'body')}
							<div>
								<h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
									<span>💪</span>
									<span>Cuerpo</span>
								</h3>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									{#each recommendedTemplates.filter(t => t.category === 'body') as template}
										<button
											type="button"
											onclick={() => toggleTemplate(template.key)}
											class="relative p-6 rounded-xl border-2 transition-all duration-300 text-left {selectedTemplates.has(template.key) ? 'border-orange-500 bg-gradient-to-br from-orange-500/20 to-red-500/20 scale-105 shadow-lg shadow-orange-500/30' : 'border-white/10 hover:border-orange-400/50 hover:scale-105'}"
										>
											<div class="flex items-start justify-between mb-2">
												<h4 class="font-bold text-white">{template.name}</h4>
												{#if selectedTemplates.has(template.key)}
													<div class="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
														<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
															<path d="M20 6L9 17l-5-5"/>
														</svg>
													</div>
												{/if}
											</div>
											<p class="text-sm text-white/60 mb-3">{template.desc}</p>
											<div class="flex gap-3 text-xs text-white/40">
												<span class="flex items-center gap-1">
													<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
														<circle cx="12" cy="12" r="10"/>
														<path d="M12 6v6l4 2"/>
													</svg>
													{template.estimated_minutes}min
												</span>
												<span class="flex items-center gap-1">
													{#each Array(template.difficulty || 3) as _}
														⭐
													{/each}
												</span>
												<span class="flex items-center gap-1 text-emerald-400">
													<svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
														<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
													</svg>
													+{template.reward_xp} XP
												</span>
											</div>
										</button>
									{/each}
								</div>
							</div>
						{/if}
						
						<div class="mt-6 text-center text-sm text-white/40">
							💡 Seleccionados: {selectedTemplates.size} / {recommendedTemplates.length}
						</div>
					{:else}
						<div class="text-center py-12 text-white/40">
							<div class="text-5xl mb-4">🎯</div>
							<p>No hay templates específicos para tus actividades seleccionadas</p>
							<p class="text-sm mt-2">Puedes crear templates personalizados en el siguiente paso</p>
						</div>
					{/if}
				</div>
			{/if}
			
			<!-- Step 5: Custom Tasks -->
			{#if currentStep === 5}
				<div in:scale={{ duration: 300, easing: quintOut, start: 0.95 }}>
					<div class="text-center mb-8">
						<div class="text-6xl mb-4">✨</div>
						<h2 class="text-2xl font-bold mb-2">Tareas Personalizadas</h2>
						<p class="text-white/60">Crea tareas específicas para tus objetivos (opcional)</p>
					</div>
					
					<!-- Add Custom Task Form -->
					<div class="bg-neutral-800/50 rounded-xl p-6 mb-6 border border-white/5">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
					<div class="md:col-span-2">
						<label for="task-name" class="block text-sm font-medium mb-2">Nombre de la Tarea</label>
						<input 
							id="task-name"
							type="text" 
							bind:value={newTask.name}
							placeholder="Ej: Práctica de guitarra"
							class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
						/>
					</div>							<div>
								<span class="block text-sm font-medium mb-2">Categoría</span>
								<div class="grid grid-cols-2 gap-2">
									<button
										type="button"
										onclick={() => newTask.category = 'mind'}
										class="px-4 py-3 rounded-lg border-2 transition-all {newTask.category === 'mind' ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 hover:border-white/20'}"
									>
										🧠 Mente
									</button>
									<button
										type="button"
										onclick={() => newTask.category = 'body'}
										class="px-4 py-3 rounded-lg border-2 transition-all {newTask.category === 'body' ? 'border-orange-500 bg-orange-500/20' : 'border-white/10 hover:border-white/20'}"
									>
										💪 Cuerpo
									</button>
								</div>
							</div>
							
					<div>
						<label for="task-duration" class="block text-sm font-medium mb-2">Duración (min)</label>
						<input 
							id="task-duration"
							type="number" 
							bind:value={newTask.duration}
							min="5"
							max="180"
							step="5"
							class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
						/>
					</div>							<div class="md:col-span-2">
								<span class="block text-sm font-medium mb-2">Dificultad</span>
								<div class="flex gap-2">
									{#each [1, 2, 3, 4, 5] as level}
										<button
											type="button"
											onclick={() => newTask.difficulty = level}
											class="flex-1 py-3 rounded-lg border-2 transition-all {newTask.difficulty === level ? 'border-amber-500 bg-amber-500/20' : 'border-white/10 hover:border-white/20'}"
										>
											<div class="flex justify-center gap-0.5">
												{#each Array(level) as _}
													<svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
														<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
													</svg>
												{/each}
											</div>
										</button>
									{/each}
								</div>
							</div>
						
						<div class="md:col-span-2">
							<label for="task-description" class="block text-sm font-medium mb-2">Descripción</label>
							<textarea 
								id="task-description"
								bind:value={newTask.description}
								rows="3"
								placeholder="Describe la tarea..."
								class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors resize-none"
							></textarea>
						</div>
						</div>
						
						<button
							type="button"
							onclick={addCustomTask}
							disabled={!newTask.name || !newTask.description}
							class="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed font-semibold transition-all"
						>
							➕ Agregar Tarea
						</button>
					</div>
					
					<!-- Custom Tasks List -->
					{#if customTasks.length > 0}
						<div class="space-y-4">
							<h3 class="text-lg font-semibold mb-4">Tareas Creadas ({customTasks.length})</h3>
							{#each customTasks as task, i}
								<div class="bg-neutral-800/50 rounded-xl p-4 border border-white/10 flex items-start gap-4" transition:scale={{ duration: 200 }}>
									<div class="text-3xl">{task.category === 'mind' ? '🧠' : '💪'}</div>
									<div class="flex-1">
										<h4 class="font-semibold mb-1">{task.name}</h4>
										<p class="text-sm text-white/60 mb-2">{task.description}</p>
										<div class="flex gap-4 text-xs text-white/40">
											<span>⏱️ {task.duration} min</span>
											<span>
												{#each Array(task.difficulty) as _}
													⭐
												{/each}
											</span>
									</div>
								</div>
								<button
									type="button"
									onclick={() => removeCustomTask(i)}
									aria-label="Eliminar tarea"
									class="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
								>
									<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M18 6L6 18M6 6l12 12"/>
									</svg>
								</button>
							</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-12 text-white/40">
							<div class="text-5xl mb-4">📝</div>
							<p>No hay tareas personalizadas aún</p>
							<p class="text-sm mt-2">¡Agrega algunas para personalizar tu experiencia!</p>
						</div>
					{/if}
				</div>
			{/if}
			
			<!-- Navigation Buttons -->
			<div class="flex gap-4 mt-8 pt-8 border-t border-white/10">
				{#if currentStep > 1}
					<button
						type="button"
						onclick={prevStep}
						disabled={isSubmitting}
						class="flex-1 py-3 px-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all flex items-center justify-center gap-2"
					>
						<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M19 12H5M12 19l-7-7 7-7"/>
						</svg>
						Anterior
					</button>
				{/if}
				
				{#if currentStep < totalSteps}
					<button
						type="button"
						onclick={handleNext}
						disabled={isSubmitting}
						class="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all flex items-center justify-center gap-2"
					>
						Siguiente
						<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7"/>
						</svg>
					</button>
				{:else}
					<button
						type="button"
						onclick={completeOnboarding}
						disabled={isSubmitting}
						class="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all flex items-center justify-center gap-2"
					>
						{#if isSubmitting}
							<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							Configurando...
						{:else}
							✨ Completar Configuración
						{/if}
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
