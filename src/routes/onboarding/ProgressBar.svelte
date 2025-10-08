<script lang="ts">
	interface Props {
		currentStep: number;
		totalSteps: number;
		stepLabels: string[];
	}
	
	let { currentStep, totalSteps, stepLabels }: Props = $props();
	
	const progress = $derived((currentStep / totalSteps) * 100);
	const xpGained = $derived(currentStep * 100);
</script>

<div class="w-full mb-8">
	<!-- XP Bar -->
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-3">
			<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
				<span class="text-xl font-bold">🎮</span>
			</div>
			<div>
				<div class="text-sm font-semibold text-white/80">Progreso del Onboarding</div>
				<div class="text-xs text-white/40">Paso {currentStep} de {totalSteps}</div>
			</div>
		</div>
		
		<div class="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-2">
			<span class="text-amber-400 font-bold">+{xpGained}</span>
			<span class="text-xs text-white/60">XP</span>
		</div>
	</div>
	
	<!-- Progress Bar -->
	<div class="relative h-3 bg-neutral-800/50 border border-white/10 rounded-full overflow-hidden">
		<div 
			class="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
			style="width: {progress}%"
		>
			<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
		</div>
	</div>
	
	<!-- Step Indicators -->
	<div class="flex justify-between mt-4 px-2">
		{#each stepLabels as label, i}
			{@const stepNum = i + 1}
			{@const isCompleted = stepNum < currentStep}
			{@const isCurrent = stepNum === currentStep}
			<div class="flex flex-col items-center gap-2 flex-1">
				<div class="relative">
					<div 
						class="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300
							{isCompleted 
								? 'bg-green-500 border-green-500 scale-110' 
								: isCurrent 
									? 'bg-purple-500 border-purple-500 scale-125 animate-pulse' 
									: 'bg-neutral-800 border-white/20'}"
					>
						{#if isCompleted}
							<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
								<path d="M5 13l4 4L19 7"/>
							</svg>
						{:else}
							<span class="font-bold text-sm">{stepNum}</span>
						{/if}
					</div>
					
					{#if isCurrent}
						<div class="absolute -inset-1 rounded-full bg-purple-500/30 animate-ping"></div>
					{/if}
				</div>
				
				<span class="text-xs text-center max-w-[80px] truncate
					{isCurrent ? 'text-purple-400 font-semibold' : isCompleted ? 'text-green-400' : 'text-white/40'}">
					{label}
				</span>
			</div>
		{/each}
	</div>
</div>

<style>
	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
	
	.animate-shimmer {
		animation: shimmer 2s infinite;
	}
</style>
