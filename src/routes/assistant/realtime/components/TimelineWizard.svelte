<script lang="ts">
	import { fly, fade, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	export interface WizardStep {
		id: string;
		label: string;
		description: string;
		icon: string;
		value?: string;
		isActive: boolean;
		isCompleted: boolean;
		isVisible: boolean;
	}

	interface Props {
		steps: WizardStep[];
		currentStepIndex: number;
		onStepValueChange?: (stepId: string, value: string) => void;
	}

	let { steps = [], currentStepIndex = 0, onStepValueChange }: Props = $props();

	function handleInputChange(stepId: string, value: string) {
		if (onStepValueChange) {
			onStepValueChange(stepId, value);
		}
	}

	function getStepColor(step: WizardStep): string {
		if (step.isCompleted) return 'text-emerald-400 border-emerald-500';
		if (step.isActive) return 'text-blue-400 border-blue-500';
		return 'text-neutral-500 border-neutral-700';
	}

	function getConnectorColor(index: number): string {
		if (index < currentStepIndex) return 'bg-emerald-500';
		if (index === currentStepIndex) return 'bg-gradient-to-b from-emerald-500 to-neutral-700';
		return 'bg-neutral-700';
	}
</script>

<div class="w-full max-w-3xl mx-auto py-6">
	<div class="relative">
		<!-- Timeline Line -->
		<div class="absolute left-6 top-0 bottom-0 w-0.5 bg-neutral-800"></div>

		<!-- Steps -->
		<div class="space-y-6">
			{#each steps as step, index (step.id)}
				{#if step.isVisible}
					<div 
						class="relative"
						transition:slide={{ duration: 400, easing: cubicOut }}
					>
						<!-- Connector to previous step -->
						{#if index > 0}
							<div 
								class="absolute left-6 -top-6 w-0.5 h-6 {getConnectorColor(index - 1)}"
								transition:fade={{ duration: 200 }}
							></div>
						{/if}

						<!-- Step Container -->
						<div class="flex gap-4 items-start">
							<!-- Icon Circle -->
							<div 
								class="relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-2 
									flex items-center justify-center transition-all duration-300
									{getStepColor(step)}
									{step.isActive ? 'bg-neutral-800 scale-110 shadow-lg' : 'bg-neutral-900'}"
							>
								<span class="text-2xl">
									{#if step.isCompleted}
										✅
									{:else}
										{step.icon}
									{/if}
								</span>
							</div>

							<!-- Content -->
							<div 
								class="flex-1 pb-2"
								transition:fly={{ x: -20, duration: 400, delay: 100 }}
							>
								<!-- Header -->
								<div class="mb-2">
									<h4 class="text-lg font-bold text-white {step.isActive ? 'text-blue-400' : ''}">
										{step.label}
									</h4>
									<p class="text-sm text-neutral-400 mt-1">
										{step.description}
									</p>
								</div>

								<!-- Input/Display Area -->
								{#if step.isActive}
									<div 
										class="mt-3"
										transition:slide={{ duration: 300 }}
									>
										{#if step.id === 'title' || step.id === 'description'}
											<!-- Text Input -->
											<input
												type="text"
												value={step.value || ''}
												oninput={(e) => handleInputChange(step.id, e.currentTarget.value)}
												placeholder="Escribe aquí o dime en voz alta..."
												class="w-full px-4 py-3 rounded-lg bg-neutral-800 border-2 border-blue-500/50 
													text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500
													transition-all"
											/>
										{:else if step.id === 'type'}
											<!-- Type Selection -->
											<div class="grid grid-cols-3 gap-2">
												{#each [
													{ value: 'short', label: 'Corto', icon: '⚡' },
													{ value: 'medium', label: 'Mediano', icon: '🎯' },
													{ value: 'long', label: 'Largo', icon: '🏔️' }
												] as type}
													<button
														onclick={() => handleInputChange(step.id, type.value)}
														class="p-3 rounded-lg border-2 transition-all
															{step.value === type.value 
																? 'border-blue-500 bg-blue-500/20' 
																: 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'}"
													>
														<div class="text-2xl mb-1">{type.icon}</div>
														<div class="text-xs font-medium text-white">{type.label}</div>
													</button>
												{/each}
											</div>
										{:else if step.id === 'deadline'}
											<!-- Date Input -->
											<input
												type="date"
												value={step.value || ''}
												oninput={(e) => handleInputChange(step.id, e.currentTarget.value)}
												class="w-full px-4 py-3 rounded-lg bg-neutral-800 border-2 border-blue-500/50 
													text-white focus:outline-none focus:border-blue-500 transition-all"
											/>
										{/if}
									</div>
								{:else if step.isCompleted && step.value}
									<!-- Display completed value -->
									<div 
										class="mt-3 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
										transition:fade
									>
										<p class="text-sm text-emerald-400 font-medium">
											{step.value}
										</p>
									</div>
								{/if}

								<!-- Progress indicator -->
								{#if step.isActive}
									<div class="mt-3 flex items-center gap-2 text-xs text-neutral-500">
										<div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
										<span>Completa este paso para continuar</span>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>

		<!-- AI Thinking Indicator -->
		{#if steps[currentStepIndex]?.isActive}
			<div 
				class="mt-6 flex items-center justify-center gap-3 text-neutral-400"
				transition:fade
			>
				<div class="flex gap-1">
					{#each [0, 1, 2] as i}
						<div 
							class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
							style="animation-delay: {i * 150}ms"
						></div>
					{/each}
				</div>
				<span class="text-sm">IA escuchando y procesando...</span>
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	.animate-bounce {
		animation: bounce 1s infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
