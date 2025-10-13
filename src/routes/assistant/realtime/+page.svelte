<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import TasksNowCarousel from '$lib/components/TasksNowCarousel.svelte';
	import ActionButtons from './components/ActionButtons.svelte';
	import TimelineWizard from './components/TimelineWizard.svelte';
	import VoiceOrb from './components/VoiceOrb.svelte';
	import { VoiceService, type VoiceState } from './services/voice.service';
	import { RealtimeService } from './services/realtime.service';
	import { BACKEND_URL } from '$lib/config';
	import type { WizardStep } from './components/TimelineWizard.svelte';

	// Auth
	const authStore = getAuthContext();
	const token = authStore.getToken() ?? '';

	// Services
	let voiceService: VoiceService | null = null;
	let realtimeService: RealtimeService | null = null;

	// State
	let voiceState = $state<VoiceState>('idle');
	let isListening = $state(false);
	let currentMode = $state<'idle' | 'goal' | 'mind' | 'body'>('idle');
	let currentTranscript = $state('');
	let aiResponse = $state('');
	let sessionId = $state<string | null>(null);

	// Wizard state
	let wizardSteps = $state<WizardStep[]>([]);
	let currentStepIndex = $state(0);

	// Configuration
	const API_BASE_URL = BACKEND_URL;

	// Auth check
	let isAuthenticated = $state(false);

	onMount(() => {
		// Check authentication
		isAuthenticated = !!token && token.length > 0;
		console.log('Authentication status:', isAuthenticated, 'Token length:', token.length);

		if (isAuthenticated) {
			initializeServices();
		}
	});

	onDestroy(() => {
		cleanup();
	});

	function initializeServices() {
		// Initialize Voice Service
		voiceService = new VoiceService({
			lang: 'es-ES',
			continuous: true,
			interimResults: true
		});

		voiceService.onStateChange((state) => {
			voiceState = state;
		});

		voiceService.onTranscript((transcript, isFinal) => {
			if (isFinal) {
				currentTranscript = transcript;
				handleTranscript(transcript);
			}
		});

		voiceService.onError((error) => {
			console.error('Voice error:', error);
			// TODO: Show toast notification
		});

		// Initialize Realtime Service
		realtimeService = new RealtimeService(API_BASE_URL, token);
	}

	function cleanup() {
		voiceService?.destroy();
		realtimeService?.destroy();
	}

	function handleVoiceToggle() {
		if (!voiceService) return;

		if (isListening) {
			voiceService.stopListening();
			isListening = false;
		} else {
			voiceService.startListening();
			isListening = true;
		}
	}

	async function handleTranscript(transcript: string) {
		if (!realtimeService) {
			console.error('RealtimeService not initialized');
			return;
		}

		if (!transcript || transcript.trim().length === 0) {
			console.warn('Empty transcript received');
			return;
		}

		console.log('handleTranscript called with:', transcript);
		console.log('Current sessionId:', sessionId);
		console.log('Token present:', !!token, 'Length:', token?.length);

		// Validate token before proceeding
		if (!token || token.length < 10) {
			console.error('Invalid or missing token. Token length:', token?.length);
			voiceState = 'idle';
			// TODO: Show toast notification
			return;
		}

		// If no session, create one
		if (!sessionId) {
			console.log('Creating new session...');
			voiceState = 'processing';
			
			try {
				const session = await realtimeService.createSession(
					`Asistente ${currentMode === 'idle' ? 'General' : currentMode}`,
					transcript
				);
				
				if (!session || !session.id) {
					throw new Error('Respuesta de sesión inválida');
				}
				
				sessionId = session.id;
				console.log('Session created successfully:', sessionId);
			} catch (error) {
				console.error('Failed to create session:', error);
				const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear sesión';
				console.error('Error message:', errorMessage);
				// TODO: Show toast notification with errorMessage
				voiceState = 'idle';
				return;
			}
		}

		// Stream message to AI
		console.log('Starting stream with sessionId:', sessionId);
		voiceState = 'processing';
		aiResponse = '';

		realtimeService.streamMessage(sessionId, transcript, {
			onStart: (sid) => {
				console.log('Stream started:', sid);
			},
			onContent: (chunk) => {
				console.log('Received content chunk:', chunk);
				aiResponse += chunk;
				
				// Auto-fill wizard steps based on AI response
				updateWizardFromResponse(aiResponse);
			},
			onDone: (messageId, fullContent) => {
				console.log('Stream complete:', messageId, 'Full content length:', fullContent.length);
				voiceState = 'speaking';
				
				// Speak the response
				voiceService?.speak(fullContent, () => {
					voiceState = 'idle';
				});
			},
			onError: (error) => {
				console.error('Stream error:', error);
				voiceState = 'idle';
			}
		});
	}

	function updateWizardFromResponse(response: string) {
		// TODO: Parse AI response and update wizard steps
		// This is a simplified version - you'd want more sophisticated parsing
		
		// Example: Extract title from response
		if (response.toLowerCase().includes('título') && wizardSteps[0]) {
			const titleMatch = response.match(/título[:\s]+"([^"]+)"/i);
			if (titleMatch && titleMatch[1]) {
				wizardSteps[0].value = titleMatch[1];
				if (!wizardSteps[0].isCompleted) {
					wizardSteps[0].isCompleted = true;
					moveToNextStep();
				}
			}
		}
	}

	function initializeGoalWizard() {
		currentMode = 'goal';
		wizardSteps = [
			{
				id: 'title',
				label: 'Título del Objetivo',
				description: 'Dime qué quieres lograr',
				icon: '🎯',
				isActive: true,
				isCompleted: false,
				isVisible: true
			},
			{
				id: 'description',
				label: 'Descripción',
				description: 'Cuéntame más detalles',
				icon: '📝',
				isActive: false,
				isCompleted: false,
				isVisible: false
			},
			{
				id: 'type',
				label: 'Tipo de Objetivo',
				description: '¿Es corto, mediano o largo plazo?',
				icon: '⏱️',
				isActive: false,
				isCompleted: false,
				isVisible: false
			},
			{
				id: 'deadline',
				label: 'Fecha Límite',
				description: '¿Cuándo quieres lograrlo?',
				icon: '📅',
				isActive: false,
				isCompleted: false,
				isVisible: false
			}
		];
		currentStepIndex = 0;
	}

	function initializeMindWizard() {
		currentMode = 'mind';
		wizardSteps = [
			{
				id: 'title',
				label: 'Tarea Mental',
				description: '¿Qué actividad mental quieres realizar?',
				icon: '🧠',
				isActive: true,
				isCompleted: false,
				isVisible: true
			},
			{
				id: 'duration',
				label: 'Duración',
				description: '¿Cuánto tiempo le dedicarás?',
				icon: '⏱️',
				isActive: false,
				isCompleted: false,
				isVisible: false
			}
		];
		currentStepIndex = 0;
	}

	function initializeBodyWizard() {
		currentMode = 'body';
		wizardSteps = [
			{
				id: 'title',
				label: 'Tarea Física',
				description: '¿Qué actividad física harás?',
				icon: '💪',
				isActive: true,
				isCompleted: false,
				isVisible: true
			},
			{
				id: 'duration',
				label: 'Duración',
				description: '¿Cuánto tiempo le dedicarás?',
				icon: '⏱️',
				isActive: false,
				isCompleted: false,
				isVisible: false
			}
		];
		currentStepIndex = 0;
	}

	function moveToNextStep() {
		if (currentStepIndex < wizardSteps.length - 1) {
			wizardSteps[currentStepIndex].isActive = false;
			currentStepIndex++;
			wizardSteps[currentStepIndex].isActive = true;
			wizardSteps[currentStepIndex].isVisible = true;
		}
	}

	function handleStepValueChange(stepId: string, value: string) {
		const step = wizardSteps.find(s => s.id === stepId);
		if (step) {
			step.value = value;
			
			// Auto-advance if value is valid
			if (value.trim().length > 0) {
				setTimeout(() => {
					step.isCompleted = true;
					moveToNextStep();
				}, 500);
			}
		}
	}

	function resetWizard() {
		currentMode = 'idle';
		wizardSteps = [];
		currentStepIndex = 0;
		currentTranscript = '';
		aiResponse = '';
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white">
	<div class="max-w-7xl mx-auto px-4 py-6 space-y-8">
		<!-- Header -->
		<div class="text-center space-y-2" transition:fade>
			<h1 class="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
				Asistente en Tiempo Real
			</h1>
			<p class="text-neutral-400 text-sm sm:text-base">
				Habla conmigo y te ayudaré a crear tus objetivos y tareas paso a paso
			</p>
		</div>

		<!-- Authentication Check -->
		{#if !isAuthenticated}
			<div class="flex items-center justify-center min-h-[400px]">
				<div class="text-center space-y-4">
					<div class="text-6xl">🔐</div>
					<h2 class="text-2xl font-bold text-white">Autenticación Requerida</h2>
					<p class="text-neutral-400 max-w-md">
						Necesitas iniciar sesión para usar el asistente en tiempo real.
						Por favor, ve a la página de login para continuar.
					</p>
					<a
						href="/login"
						class="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
					>
						Ir al Login
					</a>
				</div>
			</div>
		{:else}
		<div transition:fade={{ delay: 100 }}>
			<TasksNowCarousel 
				{token}
				carouselHeight="180px"
				onTaskClick={(task) => {
					console.log('Task clicked:', task);
				}}
			/>
		</div>

		<!-- Action Buttons (only show when idle) -->
		{#if currentMode === 'idle'}
			<div transition:fade>
				<ActionButtons
					onGoalClick={initializeGoalWizard}
					onMindClick={initializeMindWizard}
					onBodyClick={initializeBodyWizard}
					disabled={isListening}
				/>
			</div>
		{/if}

		<!-- Timeline Wizard (show when mode is active) -->
		{#if currentMode !== 'idle' && wizardSteps.length > 0}
			<div transition:fade>
				<!-- Reset Button -->
				<div class="flex justify-end mb-4">
					<button
						onclick={resetWizard}
						class="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-400 hover:text-white text-sm transition-all"
					>
						🔄 Reiniciar
					</button>
				</div>

				<TimelineWizard
					steps={wizardSteps}
					{currentStepIndex}
					onStepValueChange={handleStepValueChange}
				/>
			</div>
		{/if}

		<!-- AI Response Display -->
		{#if aiResponse}
			<div 
				class="max-w-2xl mx-auto p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30"
				transition:fade
			>
				<div class="flex items-start gap-3">
					<div class="text-2xl">🤖</div>
					<div class="flex-1">
						<h4 class="font-semibold text-purple-400 mb-2">Asistente IA</h4>
						<p class="text-sm text-neutral-300 leading-relaxed">
							{aiResponse}
						</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Voice Orb (always at bottom) -->
		<div class="flex justify-center py-8" transition:fade={{ delay: 200 }}>
			<VoiceOrb
				voiceState={voiceState}
				{isListening}
				onToggle={handleVoiceToggle}
			/>
		</div>

		<!-- Current Transcript Display -->
		{#if currentTranscript && isListening}
			<div 
				class="max-w-2xl mx-auto p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center"
				transition:fade
			>
				<p class="text-sm text-emerald-400">
					"<span class="font-medium">{currentTranscript}</span>"
				</p>
			</div>
		{/if}
		{/if}
	</div>
</div>
