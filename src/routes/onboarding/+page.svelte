<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { initializeAuthStore } from '$lib/stores/auth.svelte';
	import { getUserProfile, saveOrUpdateUserProfile } from '$lib/services/profile';
	import { createBotRule, type CreateBotRuleData } from '$lib/services/bot_rules';
	import { createTaskTemplate, type CreateTaskTemplateData } from '$lib/services/task_templates';
	import { generateBotRules, getRecommendedTemplates } from '$lib/utils/onboarding';
	
	// Components
	import ProgressBar from './ProgressBar.svelte';
	import StepProfileInfo from './StepProfileInfo.svelte';
	import StepActivities from './StepActivities.svelte';
	import StepSchedules from './StepSchedules.svelte';
	import StepTemplates from './StepTemplates.svelte';
	import StepCustomTasks from './StepCustomTasks.svelte';
	
	const authStore = initializeAuthStore();
	
	// State
	let currentStep = $state(1);
	const totalSteps = 5;
	const stepLabels = ['Perfil', 'Actividades', 'Horarios', 'Templates', 'Personalizar'];
	
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);
	let hasExistingProfile = $state(false);
	let isLoadingProfile = $state(true);
	
	// Step 1: Profile Data
	let profileData = $state({
		timezone: 'America/Mexico_City',
		preferred_language: 'es',
		gender: '',
		birth_date: '',
		weight_kg: null as number | null,
		height_cm: null as number | null
	});
	
	// Step 2: Activities
	let selectedActivities = $state<string[]>([]);
	
	// Step 3: Schedules
	let selectedTimes = $state<string[]>([]);
	let selectedDays = $state<string[]>([]);
	
	// Step 4: Templates
	let recommendedTemplates = $state<any[]>([]);
	let selectedTemplateIds = $state<string[]>([]);
	
	// Step 5: Custom Tasks
	let customTasks = $state<any[]>([]);
	
	// Check authentication and load existing profile
	onMount(async () => {
		if (!authStore.isAuthenticated) {
			goto('/login');
			return;
		}
		
		// Try to load existing profile
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
					height_cm: existingProfile.height_cm || null
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
		// Generate recommended templates based on selected activities
		recommendedTemplates = getRecommendedTemplates(selectedActivities);
		// Don't pre-select any templates - let user choose
		selectedTemplateIds = [];
		nextStep();
	}
	
	// Step 4 -> Step 5
	function handleTemplatesNext() {
		nextStep();
	}
	
	// Final submission
	async function handleComplete() {
		isSubmitting = true;
		error = null;
		
		try {
			// 1. Create or update profile (auto-detects)
			await saveOrUpdateUserProfile(profileData);
			
			// 2. Generate and create bot rules
			const selectedSchedules = selectedTimes;
			const botRules = generateBotRules(selectedActivities, selectedSchedules, selectedDays);
			
			for (const ruleData of botRules) {
				await createBotRule(ruleData);
			}
			
			// 3. Create selected templates
			const selectedTemplateData = recommendedTemplates.filter(t => 
				selectedTemplateIds.includes(t.id)
			);
			
			for (const template of selectedTemplateData) {
				await createTaskTemplate(template);
			}
			
			// 4. Create custom tasks
			for (const task of customTasks) {
				await createTaskTemplate({
					name: task.name,
					description: task.description || '',
					category: task.category,
					duration: task.duration,
					difficulty: task.difficulty,
					icon: task.icon || (task.category === 'mind' ? '🧠' : '💪'),
					template_key: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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

<div class="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white py-12 px-4">
	<div class="max-w-7xl mx-auto">
		<!-- Progress Bar -->
		<ProgressBar {currentStep} {totalSteps} {stepLabels} />
		
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
				<StepTemplates
					{recommendedTemplates}
					bind:selectedTemplateIds={selectedTemplateIds}
					onNext={handleTemplatesNext}
					onBack={prevStep}
				/>
			{:else if currentStep === 5}
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
