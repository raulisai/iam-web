<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	
	interface Props {
		recommendedTemplates: any[];
		selectedTemplateIds: string[];
		onNext: () => void;
		onBack: () => void;
	}
	
	let { recommendedTemplates, selectedTemplateIds = $bindable(), onNext, onBack }: Props = $props();
	
	function toggleTemplate(id: string) {
		console.log('🔄 Toggle template:', id, 'Current selection:', $state.snapshot(selectedTemplateIds));
		if (selectedTemplateIds.includes(id)) {
			// Remove this template
			selectedTemplateIds = selectedTemplateIds.filter(templateId => templateId !== id);
			console.log('➖ Removed. New selection:', $state.snapshot(selectedTemplateIds));
		} else {
			// Add this template
			selectedTemplateIds = [...selectedTemplateIds, id];
			console.log('➕ Added. New selection:', $state.snapshot(selectedTemplateIds));
		}
	}
	
	function selectAll() {
		console.log('✅ Selecting all templates');
		selectedTemplateIds = recommendedTemplates.map(t => t.id);
	}
	
	function clearAll() {
		console.log('❌ Clearing all templates');
		selectedTemplateIds = [];
	}
	
	function getCategoryColor(category: string) {
		return category === 'mind' ? 'purple' : 'orange';
	}
	
	function getDifficultyStars(level: number) {
		return '⭐'.repeat(level);
	}
</script>

<div 
	class="w-full max-w-6xl mx-auto"
	in:fly={{ x: 300, duration: 400, easing: quintOut }}
	out:fly={{ x: -300, duration: 300, easing: quintOut }}
>
	<!-- Header -->
	<div class="text-center mb-8">
		<div class="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-orange-500/10 border border-purple-500/30 rounded-full px-6 py-3 mb-4">
			<span class="text-3xl">✨</span>
			<span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400 font-semibold">
				Templates Recomendados
			</span>
		</div>
		<p class="text-white/60 text-sm mb-4">
			🎁 Basados en tus preferencias, estos son los mejores para ti
		</p>
		
		<div class="flex items-center justify-center gap-4">
			<div class="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2">
				<span class="text-purple-400 font-bold text-lg">{selectedTemplateIds.length}</span>
				<span class="text-white/60 text-sm">seleccionados</span>
			</div>
			
			<div class="flex gap-2">
				<button
					type="button"
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						selectAll();
					}}
					class="text-xs px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full hover:bg-green-500/30 transition-colors"
				>
					✓ Todos
				</button>
				<button
					type="button"
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						clearAll();
					}}
					class="text-xs px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full hover:bg-red-500/30 transition-colors"
				>
					✗ Ninguno
				</button>
			</div>
		</div>
	</div>
	
	<!-- Templates Grid -->
	{#if recommendedTemplates.length === 0}
		<div class="bg-neutral-900/50 border border-white/10 rounded-2xl p-12 text-center">
			<span class="text-6xl mb-4 block">🤔</span>
			<p class="text-white/60">No hay templates recomendados para tus selecciones</p>
			<p class="text-white/40 text-sm mt-2">Puedes crear tus propias tareas personalizadas</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
			{#each recommendedTemplates as template, i}
				{@const isSelected = selectedTemplateIds.includes(template.id)}
				{@const isMind = template.category === 'mind'}
				<button
					type="button"
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						toggleTemplate(template.id);
					}}
					style="animation-delay: {i * 50}ms"
					class="group relative bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border-2 rounded-2xl p-6 text-left hover:scale-105 transition-all duration-300 animate-slide-in
						{isSelected
							? isMind
								? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20' 
								: 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20'
							: 'border-white/10 hover:border-white/20'}"
				>
					<!-- Animated background glow -->
					<div class="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
						<div class="absolute inset-0 bg-gradient-to-br {isMind ? 'from-purple-500/10' : 'from-orange-500/10'} to-transparent"></div>
					</div>
					
					<!-- Content -->
					<div class="relative">
						<!-- Header -->
						<div class="flex items-start justify-between mb-3">
							<div class="flex items-center gap-2">
								<span class="text-3xl">{template.icon}</span>
								<div>
									<div class="font-semibold text-sm">{template.name}</div>
									<div class="text-xs text-white/40">{getDifficultyStars(template.difficulty)}</div>
								</div>
							</div>
							
							{#if isSelected}
								<div class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
									<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
										<path d="M5 13l4 4L19 7"/>
									</svg>
								</div>
							{/if}
						</div>
						
						<!-- Description -->
						<p class="text-white/60 text-xs mb-4 line-clamp-2">
							{template.description}
						</p>
						
						<!-- Footer -->
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="text-xs px-2 py-1 rounded-full 
									{isMind
										? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
										: 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}">
									{isMind ? '🧠 Mente' : '💪 Cuerpo'}
								</span>
							</div>
							<div class="text-xs text-white/40">
								⏱️ {template.duration} min
							</div>
						</div>
					</div>
					
					<!-- Hover effect overlay -->
					<div class="absolute inset-0 rounded-2xl border-2 {isMind ? 'border-purple-500/0 group-hover:border-purple-500/50' : 'border-orange-500/0 group-hover:border-orange-500/50'} transition-all duration-300 pointer-events-none"></div>
				</button>
			{/each}
		</div>
	{/if}
	
	<!-- Info Box -->
	<div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8">
		<div class="flex items-start gap-3">
			<span class="text-2xl">💡</span>
			<div class="flex-1">
				<h4 class="font-semibold mb-1">Tip Pro</h4>
				<p class="text-white/60 text-sm">
					Puedes modificar estos templates más tarde o crear tus propias tareas personalizadas en el siguiente paso
				</p>
			</div>
		</div>
	</div>
	
	<!-- Navigation -->
	<div class="flex justify-between">
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
			class="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-500 hover:to-pink-500 hover:scale-105 transition-all shadow-lg shadow-purple-500/25"
		>
			<span class="font-semibold">Continuar</span>
			<svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M12 5l7 7-7 7"/>
			</svg>
		</button>
	</div>
</div>

<style>
	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	@keyframes bounce-in {
		0% {
			opacity: 0;
			transform: scale(0) rotate(-180deg);
		}
		50% {
			transform: scale(1.2) rotate(10deg);
		}
		100% {
			opacity: 1;
			transform: scale(1) rotate(0deg);
		}
	}
	
	.animate-slide-in {
		animation: slide-in 0.4s ease-out forwards;
		opacity: 0;
	}
	
	.animate-bounce-in {
		animation: bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}
	
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
