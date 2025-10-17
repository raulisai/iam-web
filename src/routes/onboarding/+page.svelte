<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { initializeAuthStore } from '$lib/stores/auth.svelte';
	import { getUserProfile, saveOrUpdateUserProfile } from '$lib/services/profile';
	import { createBotRule } from '$lib/services/bot_rules';
	import { createTaskTemplate } from '$lib/services/task_templates';
	import type { CreateBotRuleData, CreateTaskTemplateData } from '$lib/types';
	import { generateBotRules, getRecommendedTemplates } from '$lib/utils/onboarding';
	
	// Components
	import ProgressBar from './ProgressBar.svelte';
	import StepProfileInfo from './StepProfileInfo.svelte';
	import StepActivities from './StepActivities.svelte';
	import StepSchedules from './StepSchedules.svelte';
	import StepAlarms from './StepAlarms.svelte';
	import StepReminders from './StepReminders.svelte';
	import StepTemplates from './StepTemplates.svelte';
	import StepCustomTasks from './StepCustomTasks.svelte';
	import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
	
	// Services
	import { createRoutineAlarm } from '$lib/services/routine_alarms';
	import { createRoutineReminder } from '$lib/services/routine_reminders';
	
	const authStore = initializeAuthStore();
	
	// State
	let currentStep = $state(1);
	const totalSteps = 7;
	const stepLabels = ['Perfil', 'Actividades', 'Horarios', 'Alarmas', 'Recordatorios', 'Templates', 'Personalizar'];
	
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);
	let isLoadingProfile = $state(true);
	let hasExistingProfile = $state(false);
	
	// Step 1: Profile Data
	let profileData = $state({
		timezone: 'America/Mexico_City',
		preferred_language: 'es',
		gender: '',
		birth_date: '',
		weight_kg: null as number | null,
		height_cm: null as number | null,
		work_schedules: '9:00-17:00',
		day_work: 'L,M,M,J,V',
		hours_available_to_week: 10,
		current_status: 'active'
	});
	
	// Step 2: Activities
	let selectedActivities = $state<string[]>([]);
	
	// Step 3: Schedules
	let selectedTimes = $state<string[]>([]);
	let selectedDays = $state<string[]>([]);
	
	// Step 4: Alarmas
	let alarms = $state<any[]>([]);
	
	// Step 5: Recordatorios
	let reminders = $state<any[]>([]);
	
	// Step 6: Templates
	let recommendedTemplates = $state<any[]>([]);
	let selectedTemplateIds = $state<string[]>([]);
	
	// Step 7: Custom Tasks
	let customTasks = $state<any[]>([]);
	
	// Check authentication and load existing profile
	onMount(() => {
		if (!authStore.isAuthenticated) {
			goto('/login');
			return;
		}
		
		// Load profile async
		(async () => {
			try {
				const existingProfile = await getUserProfile();
				
				if (existingProfile && existingProfile.id) {
					hasExistingProfile = true;
					
					// Pre-fill profile data with existing info
					profileData = {
						timezone: existingProfile.timezone || 'America/Mexico_City',
						preferred_language: existingProfile.preferred_language || 'es',
						gender: existingProfile.gender || '',
						birth_date: existingProfile.birth_date || '',
						weight_kg: existingProfile.weight_kg || null,
						height_cm: existingProfile.height_cm || null,
						work_schedules: existingProfile.work_schedules || '9:00-17:00',
						day_work: (existingProfile as any).day_work || 'L,M,M,J,V',
						hours_available_to_week: existingProfile.hours_available_to_week || 10,
						current_status: existingProfile.current_status || 'active'
					};
					
					console.log('✅ Perfil existente cargado:', existingProfile);
				}
			} catch (err) {
				// No profile exists yet, that's fine
				console.log('ℹ️ No hay perfil existente, creando uno nuevo');
				hasExistingProfile = false;
			} finally {
				isLoadingProfile = false;
			}
		})();
	});
	
	// Navigate functions
	function goToStep(step: number) {
		currentStep = step;
	}
	
	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep++;
		}
	}
	
	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}
	
	// Step 2 -> Step 3
	function handleActivitiesNext() {
		nextStep();
	}
	
	// Step 3 -> Step 4
	function handleSchedulesNext() {
		nextStep();
	}
	
	// Step 4 -> Step 5
	function handleAlarmsNext() {
		nextStep();
	}
	
	// Step 5 -> Step 6
	function handleRemindersNext() {
		// Generate recommended templates based on selected activities
		recommendedTemplates = getRecommendedTemplates(selectedActivities);
		// Don't pre-select any templates - let user choose
		selectedTemplateIds = [];
		nextStep();
	}
	
	// Step 6 -> Step 7
	function handleTemplatesNext() {
		nextStep();
	}
	
	// Final submission
	async function handleComplete() {
		isSubmitting = true;
		error = null;
		
		try {
			// 1. Create or update profile (auto-detects)
			console.log('💾 Guardando perfil...', profileData);
			await saveOrUpdateUserProfile({
				...profileData,
				weight_kg: profileData.weight_kg ?? undefined,
				height_cm: profileData.height_cm ?? undefined
			});
			
			// 2. Generate and create bot rules
			// Transform time IDs to schedule objects with updated mappings
			const timeSlotMap: Record<string, { id: string; time: string }> = {
				morning: { id: 'morning', time: '6:00-9:00' },
				midday: { id: 'midday', time: '12:00-14:00' },
				afternoon: { id: 'afternoon', time: '14:00-18:00' },
				evening: { id: 'evening', time: '18:00-22:00' },
				night: { id: 'night', time: '22:00-6:00' }
			};
			
			const selectedSchedules = selectedTimes.map(timeId => timeSlotMap[timeId]).filter(Boolean);
			
			// Transform activity IDs to activity objects
			const activityMap: Record<string, { id: string; name: string; category: 'mind' | 'body' }> = {
				meditation: { id: 'meditation', name: 'Meditación', category: 'mind' },
				reading: { id: 'reading', name: 'Lectura', category: 'mind' },
				learning: { id: 'learning', name: 'Aprendizaje', category: 'mind' },
				creativity: { id: 'creativity', name: 'Creatividad', category: 'mind' },
				exercise: { id: 'exercise', name: 'Ejercicio', category: 'body' },
				yoga: { id: 'yoga', name: 'Yoga', category: 'body' },
				running: { id: 'running', name: 'Running', category: 'body' },
				swimming: { id: 'swimming', name: 'Natación', category: 'body' },
				cycling: { id: 'cycling', name: 'Ciclismo', category: 'body' },
				nutrition: { id: 'nutrition', name: 'Nutrición', category: 'body' }
			};
			
			const selectedActivityObjects = selectedActivities.map(actId => activityMap[actId]).filter(Boolean);
			
			console.log('🤖 Generando reglas de bot...', {
				activities: selectedActivityObjects.length,
				schedules: selectedSchedules.length,
				days: selectedDays.length
			});
			
			const botRules = generateBotRules(selectedActivityObjects, selectedSchedules, selectedDays);
			
			console.log(`📋 Creando ${botRules.length} reglas de bot...`);
			for (const ruleData of botRules) {
				try {
					await createBotRule(authStore, ruleData);
					console.log('✅ Regla creada:', ruleData.name);
				} catch (err) {
					console.error('❌ Error creando regla:', ruleData.name, err);
				}
			}
			
			// 3. Create alarms
			console.log(`⏰ Creando ${alarms.length} alarmas...`);
			for (const alarm of alarms) {
				try {
					await createRoutineAlarm(authStore, {
						name: alarm.name,
						description: alarm.description,
						alarm_time: alarm.time,
						days_of_week: alarm.days,
						notification_title: alarm.notification_title,
						notification_body: alarm.notification_body,
						notification_icon: alarm.notification_icon,
						notification_color: alarm.notification_color,
						sound_enabled: alarm.sound_enabled,
						sound_uri: alarm.sound_uri,
						vibration_enabled: alarm.vibration_enabled,
						vibration_pattern: alarm.vibration_pattern,
						snooze_enabled: alarm.snooze_enabled,
						snooze_duration_min: alarm.snooze_duration_min,
						max_snoozes: alarm.max_snoozes,
						priority: alarm.priority,
						can_dismiss: alarm.can_dismiss,
						auto_dismiss_minutes: alarm.auto_dismiss_minutes,
						source_type: alarm.source_type || 'custom',
						task_id: alarm.task_id,
						is_active: alarm.enabled
					});
					console.log('✅ Alarma creada:', alarm.name);
				} catch (err) {
					console.error('❌ Error creando alarma:', alarm.name, err);
				}
			}
			
			// 4. Create reminders
			console.log(`🔔 Creando ${reminders.length} recordatorios...`);
			for (const reminder of reminders) {
				try {
					await createRoutineReminder(authStore, {
						name: reminder.name,
						description: reminder.description,
						times_per_day: reminder.times_per_day,
						start_time: reminder.start_time,
						end_time: reminder.end_time,
						days_of_week: reminder.days,
						notification_title: reminder.notification_title,
						notification_body: reminder.notification_body,
						notification_icon: reminder.notification_icon,
						notification_color: reminder.notification_color,
						sound_enabled: reminder.sound_enabled,
						vibration_enabled: reminder.vibration_enabled,
						priority: reminder.priority,
						source_type: reminder.source_type || 'custom',
						task_id: reminder.task_id,
						is_active: reminder.enabled
					});
					console.log('✅ Recordatorio creado:', reminder.name);
				} catch (err) {
					console.error('❌ Error creando recordatorio:', reminder.name, err);
				}
			}
			
			// 5. Create selected templates
			const selectedTemplateData = recommendedTemplates.filter(t => 
				selectedTemplateIds.includes(t.id)
			);
			
			for (const template of selectedTemplateData) {
				// Convert UI format to API format
				await createTaskTemplate(authStore, {
					key: template.id,
					name: template.name,
					desc: template.description || template.name,
					category: template.category,
					estimated_minutes: template.duration,
					difficulty: template.difficulty,
					reward_xp: template.difficulty * 20
				});
			}
			
			// 6. Create custom tasks
			for (const task of customTasks) {
				await createTaskTemplate(authStore, {
					key: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					name: task.name,
					desc: task.description || `Tarea personalizada de ${task.category === 'mind' ? 'mente' : 'cuerpo'}`,
					category: task.category,
					estimated_minutes: task.duration,
					difficulty: task.difficulty,
					reward_xp: task.difficulty * 10
				});
			}
			
			// Success! Redirect to dashboard
			goto('/');
		} catch (err: any) {
			error = err.message || 'Error al completar el onboarding';
			console.error('Onboarding error:', err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Onboarding - IAM</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white py-4 md:py-12 px-3 md:px-4">
	<div class="max-w-7xl mx-auto pb-4">
		<!-- Progress Bar -->
		<ProgressBar {currentStep} {totalSteps} {stepLabels} onStepClick={goToStep} />
		
		<!-- Floating Action Button (FAB) - Mobile -->
		<FloatingActionButton>
			{#if currentStep > 1}
				<button
					type="button"
					onclick={prevStep}
					class="flex items-center gap-2 px-3 py-2 bg-neutral-800/95 border-2 border-white/20 rounded-l-full rounded-r-full hover:scale-105 transition-all backdrop-blur-md shadow-lg text-xs"
				>
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
					<span class="font-semibold">Atrás</span>
				</button>
			{/if}
			
			{#if currentStep < totalSteps}
				<button
					type="button"
					onclick={nextStep}
					class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-l-full rounded-r-full hover:scale-105 transition-all shadow-lg shadow-green-500/40 backdrop-blur-md text-xs"
				>
					<span class="font-bold">Continuar</span>
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				</button>
			{:else}
				<button
					type="button"
					onclick={handleComplete}
					disabled={isSubmitting}
					class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-l-full rounded-r-full hover:scale-105 transition-all shadow-lg shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md text-xs"
				>
					<span class="font-bold">
						{isSubmitting ? 'Guardando...' : '✨ Finalizar'}
					</span>
				</button>
			{/if}
		</FloatingActionButton>
		
		<!-- Existing Profile Notice -->
		{#if hasExistingProfile && !isLoadingProfile}
			<div class="max-w-3xl mx-auto mb-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 flex items-center gap-3">
				<span class="text-3xl">ℹ️</span>
				<div class="flex-1">
					<h4 class="font-semibold mb-1">Ya tienes un perfil</h4>
					<p class="text-blue-300 text-sm">Hemos cargado tu información existente. Puedes revisarla y actualizarla si lo deseas.</p>
				</div>
			</div>
		{/if}
		
		<!-- Error Message -->
		{#if error}
			<div class="max-w-3xl mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-3">
				<span class="text-3xl">⚠️</span>
				<div class="flex-1">
					<h4 class="font-semibold mb-1">Error</h4>
					<p class="text-red-400 text-sm">{error}</p>
				</div>
				<button
					onclick={() => error = null}
					class="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
					aria-label="Cerrar mensaje de error"
				>
					<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 6L6 18M6 6l12 12"/>
					</svg>
				</button>
			</div>
		{/if}

		<!-- Step Content -->
		<div class="relative">
			{#if isLoadingProfile}
				<div class="max-w-3xl mx-auto bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/20 rounded-2xl p-12 text-center">
					<div class="w-16 h-16 mx-auto border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
					<h3 class="text-xl font-bold mb-2">🔍 Verificando tu perfil...</h3>
					<p class="text-white/60 text-sm">Estamos cargando tu información</p>
				</div>
			{:else if currentStep === 1}
				<StepProfileInfo 
					bind:profileData={profileData}
					onNext={nextStep}
				/>
			{:else if currentStep === 2}
				<StepActivities
					bind:selectedActivities={selectedActivities}
					onNext={handleActivitiesNext}
					onBack={prevStep}
				/>
			{:else if currentStep === 3}
				<StepSchedules
					bind:selectedTimes={selectedTimes}
					bind:selectedDays={selectedDays}
					onNext={handleSchedulesNext}
					onBack={prevStep}
				/>
			{:else if currentStep === 4}
				<StepAlarms
					bind:alarms={alarms}
					onNext={handleAlarmsNext}
					onBack={prevStep}
				/>
			{:else if currentStep === 5}
				<StepReminders
					bind:reminders={reminders}
					onNext={handleRemindersNext}
					onBack={prevStep}
				/>
			{:else if currentStep === 6}
				<StepTemplates
					{recommendedTemplates}
					bind:selectedTemplateIds={selectedTemplateIds}
					onNext={handleTemplatesNext}
					onBack={prevStep}
				/>
			{:else if currentStep === 7}
				<StepCustomTasks
					bind:customTasks={customTasks}
					onComplete={handleComplete}
					onBack={prevStep}
				/>
			{/if}
		</div>
		
		<!-- Loading Overlay -->
		{#if isSubmitting}
			<div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
				<div class="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
					<div class="w-20 h-20 mx-auto mb-6 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
					<h3 class="text-2xl font-bold mb-2">✨ Creando tu experiencia</h3>
					<p class="text-white/60 text-sm mb-4">Estamos configurando todo para ti...</p>
					<div class="space-y-2">
						<div class="flex items-center gap-2 text-sm text-white/40">
							<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
							<span>Guardando perfil</span>
						</div>
						<div class="flex items-center gap-2 text-sm text-white/40">
							<div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
							<span>Generando reglas automáticas</span>
						</div>
						<div class="flex items-center gap-2 text-sm text-white/40">
							<div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
							<span>Creando templates</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		overflow-x: hidden;
	}
</style>
