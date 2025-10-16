<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { 
		getTasksForNow, 
		formatTime, 
		formatDuration,
		getTaskTypeColor,
		getTaskTypeIcon,
		getTaskTypeLabel
	} from '$lib/services/time-optimizer';
	import type { TasksNowResponse, TaskNow } from '$lib/types';

	// Props
	interface Props {
		token: string;
		onTaskClick?: (task: TaskNow) => void;
		onTaskComplete?: (task: TaskNow) => void;
		carouselHeight?: string;
	}
	
	let { token, onTaskClick, onTaskComplete, carouselHeight = '100px' }: Props = $props();

	// State
	let loading = $state(true);
	let error = $state<string | null>(null);
	let data = $state<TasksNowResponse | null>(null);
	let selectedTaskId = $state<string | null>(null);
	let scrollContainer = $state<HTMLDivElement | undefined>();
	let canScrollLeft = $state(false);
	let canScrollRight = $state(true);

	// Computed - todas las tareas en orden cronológico
	let allTasks = $derived(() => {
		if (!data) return [];
		return [
			...data.goal_tasks.map(t => ({ ...t, type: 'goal' as const })),
			...data.mind_tasks.map(t => ({ ...t, type: 'mind' as const })),
			...data.body_tasks.map(t => ({ ...t, type: 'body' as const }))
		].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
	});

	onMount(() => {
		loadTasks();
		updateScrollButtons();
	});

	async function loadTasks() {
		try {
			loading = true;
			error = null;
			data = await getTasksForNow(token);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load tasks';
			console.error('Error loading tasks:', e);
		} finally {
			loading = false;
		}
	}

	function handleTaskClick(task: TaskNow) {
		selectedTaskId = task.id;
		if (onTaskClick) {
			onTaskClick(task);
		}
	}

	async function handleTaskComplete(task: TaskNow, event: Event) {
		event.stopPropagation(); // Prevent triggering task click
		
		// TODO: Call completion API here when provided
		console.log('Completing task:', task.id);
		
		if (onTaskComplete) {
			onTaskComplete(task);
		}
		
		// Optimistically remove from UI
		if (data) {
			if (task.type === 'goal') {
				data.goal_tasks = data.goal_tasks.filter(t => t.id !== task.id);
			} else if (task.type === 'mind') {
				data.mind_tasks = data.mind_tasks.filter(t => t.id !== task.id);
			} else if (task.type === 'body') {
				data.body_tasks = data.body_tasks.filter(t => t.id !== task.id);
			}
		}
	}

	function scroll(direction: 'left' | 'right') {
		if (!scrollContainer) return;
		const scrollAmount = scrollContainer.offsetWidth * 0.8;
		scrollContainer.scrollBy({
			left: direction === 'left' ? -scrollAmount : scrollAmount,
			behavior: 'smooth'
		});
	}

	function updateScrollButtons() {
		if (!scrollContainer) return;
		canScrollLeft = scrollContainer.scrollLeft > 0;
		canScrollRight = 
			scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.offsetWidth - 10;
	}

	function getUrgencyBadge(task: TaskNow) {
		if (task.type === 'goal' && task.days_until_deadline !== undefined) {
			if (task.days_until_deadline <= 7) {
				return { text: `${task.days_until_deadline}d left`, color: 'bg-red-500/20 text-red-400 border-red-500/30' };
			} else if (task.days_until_deadline <= 14) {
				return { text: `${task.days_until_deadline}d left`, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
			}
		}
		return null;
	}

	function getUtilizationColor(percentage: number): string {
		if (percentage >= 85) return 'text-emerald-400';
		if (percentage >= 70) return 'text-blue-400';
		if (percentage >= 50) return 'text-amber-400';
		return 'text-red-400';
	}
</script>

<div class="w-full">
	{#if data && !loading}
		<!-- Barra compacta con todo integrado -->
		<div class="mb-3 sm:mb-4" transition:fade>
			<div class="relative rounded-lg bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 p-2.5 sm:p-3 overflow-hidden backdrop-blur-sm">
				<!-- Background animated gradient -->
				<div class="absolute inset-0 opacity-20">
					<div class="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 animate-gradient"></div>
				</div>
				
				<div class="relative z-10 flex items-center justify-between gap-2 sm:gap-3">
					<!-- Lado izquierdo: Icono + Título + Progreso -->
					<div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
						<!-- Icono -->
						<span class="text-xl sm:text-2xl flex-shrink-0">⚡</span>
						
						<!-- Título y progreso circular compacto -->
						<div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
							<div class="flex-shrink-0">
								<h2 class="text-sm sm:text-base md:text-lg font-bold text-white whitespace-nowrap">
									Tareas para Ahora
								</h2>
								<div class="text-[10px] sm:text-xs text-neutral-400">
									Optimización del tiempo
								</div>
							</div>
							
							<!-- Progreso circular compacto -->
							<div class="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
								<svg class="transform -rotate-90 w-full h-full">
									<circle
										cx="50%"
										cy="50%"
										r="16"
										stroke="currentColor"
										stroke-width="3"
										fill="none"
										class="text-neutral-700/50"
									/>
									<circle
										cx="50%"
										cy="50%"
										r="16"
										stroke="currentColor"
										stroke-width="3"
										fill="none"
										stroke-linecap="round"
										class="{getUtilizationColor(data.utilization_percentage)} transition-all duration-1000"
										style="stroke-dasharray: {2 * Math.PI * 16}; stroke-dashoffset: {2 * Math.PI * 16 * (1 - data.utilization_percentage / 100)};"
									/>
								</svg>
								<div class="absolute inset-0 flex items-center justify-center">
									<span class="text-[10px] sm:text-xs font-bold {getUtilizationColor(data.utilization_percentage)}">
										{data.utilization_percentage.toFixed(0)}%
									</span>
								</div>
							</div>
						</div>
					</div>
					
					<!-- Lado derecho: Contador de tareas + Botón actualizar -->
					<div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
						<!-- Contador de tareas -->
						<div class="flex flex-col items-center">
							<div class="text-xl sm:text-2xl font-bold text-white leading-none">
								{allTasks().length}
							</div>
							<div class="text-[9px] sm:text-[10px] text-neutral-400 leading-none mt-0.5">
								{allTasks().length === 1 ? 'tarea' : 'tareas'}
							</div>
						</div>
						
						<!-- Botón actualizar -->
						<button
							onclick={loadTasks}
							disabled={loading}
							class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-700/50 hover:bg-neutral-600/50 text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group flex-shrink-0"
							aria-label="Refresh tasks"
							title="Actualizar"
						>
							<svg 
								class="w-4 h-4 transition-transform group-hover:rotate-180 {loading ? 'animate-spin' : ''}"
								viewBox="0 0 24 24" 
								fill="none" 
								stroke="currentColor" 
								stroke-width="2"
							>
								<path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if loading}
		<!-- Loading State -->
		<div class="flex flex-col items-center justify-center py-20" transition:fade>
			<div class="relative">
				<div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
				<div class="absolute inset-0 flex items-center justify-center">
					<span class="text-2xl">⚡</span>
				</div>
			</div>
			<p class="text-neutral-400 mt-4">Optimizando tu horario...</p>
		</div>
	{:else if error}
		<!-- Error State -->
		<div 
			class="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center"
			transition:fly={{ y: 20, duration: 300 }}
		>
			<div class="text-5xl mb-4">⚠️</div>
			<h3 class="text-xl font-bold text-red-400 mb-2">¡Algo salió mal!</h3>
			<p class="text-neutral-300 mb-4">{error}</p>
			<button
				onclick={loadTasks}
				class="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-all"
			>
				Intentar de nuevo
			</button>
		</div>
	{:else if data && allTasks().length === 0}
		<!-- Empty State -->
		<div class="rounded-xl border border-neutral-700 bg-neutral-800/50 p-12 text-center" transition:fade>
			<div class="text-6xl mb-4">🎉</div>
			<h3 class="text-2xl font-bold text-white mb-2">¡Todo listo!</h3>
			<p class="text-neutral-400">No tienes tareas programadas para este momento.</p>
		</div>
	{:else if data && allTasks().length > 0}
		<!-- Carrusel de tareas -->
		<div class="relative group" style="height: {carouselHeight}">
			<!-- Botón izquierdo -->
			{#if canScrollLeft}
				<button
					onclick={() => scroll('left')}
					class="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-neutral-800/90 backdrop-blur-sm border border-neutral-700 flex items-center justify-center text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-neutral-700"
					aria-label="Scroll left"
					transition:fade
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
					</svg>
				</button>
			{/if}

			<!-- Botón derecho -->
			{#if canScrollRight}
				<button
					onclick={() => scroll('right')}
					class="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-neutral-800/90 backdrop-blur-sm border border-neutral-700 flex items-center justify-center text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-neutral-700"
					aria-label="Scroll right"
					transition:fade
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
					</svg>
				</button>
			{/if}

			<!-- Container del carrusel -->
			<div 
				bind:this={scrollContainer}
				onscroll={updateScrollButtons}
				class="flex gap-2 overflow-x-auto h-full px-2 py-2 scroll-smooth snap-x snap-mandatory hide-scrollbar"
				style="scrollbar-width: none; -ms-overflow-style: none;"
			>
				{#each allTasks() as task, index (task.id)}
					<div 
						class="flex-shrink-0 w-52 h-36 sm:w-64 sm:h-40 md:w-72 md:h-44 snap-start"
						transition:fly={{ x: 50, delay: index * 50, duration: 400 }}
					>
						<div
							onclick={() => handleTaskClick(task)}
							role="button"
							tabindex="0"
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleTaskClick(task);
								}
							}}
							class="w-full h-full rounded-lg border-2 transition-all p-2 sm:p-3 text-left relative overflow-hidden group/card cursor-pointer {selectedTaskId === task.id 
								? `border-${getTaskTypeColor(task.type)}-500 bg-${getTaskTypeColor(task.type)}-500/10 scale-105 shadow-2xl shadow-${getTaskTypeColor(task.type)}-500/20` 
								: 'border-neutral-700 bg-gradient-to-br from-neutral-800 to-neutral-900 hover:border-neutral-600 hover:scale-[1.02] hover:shadow-xl'}"
						>
							<!-- Background pattern -->
							<div class="absolute inset-0 opacity-5">
								<div class="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
							</div>

							<div class="relative z-10">
								<!-- Header con botón de completado -->
								<div class="flex items-start justify-between mb-1.5">
									<div class="flex items-center gap-1.5">
										<span class="text-lg sm:text-xl">{getTaskTypeIcon(task.type)}</span>
										<div>
											<div class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-{getTaskTypeColor(task.type)}-400">
												{getTaskTypeLabel(task.type)}
											</div>
											<div class="text-[10px] sm:text-xs text-neutral-400">
												{formatTime(task.start_time)}
											</div>
										</div>
									</div>
									
									<!-- Botón de completado -->
									<button
										onclick={(e) => handleTaskComplete(task, e)}
										class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500/30 hover:bg-emerald-500/50 border-2 border-emerald-500/50 hover:border-emerald-500/70 flex items-center justify-center text-emerald-400 hover:text-white transition-all group/complete hover:scale-110 shadow-lg hover:shadow-emerald-500/25"
										aria-label="Mark task as complete"
										title="Marcar como completada"
									>
										<svg class="w-4 h-4 sm:w-5 sm:h-5 group-hover/complete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
										</svg>
									</button>
								</div>
								
								{#if getUrgencyBadge(task)}
									{@const badge = getUrgencyBadge(task)}
									{#if badge}
										<span class="px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border {badge.color} mb-1 inline-block">
											{badge.text}
										</span>
									{/if}
								{/if}
								
								<!-- Título -->
								<h3 class="text-sm sm:text-base font-bold text-white mb-0.5 sm:mb-1 line-clamp-2 group-hover/card:text-{getTaskTypeColor(task.type)}-400 transition-colors">
									{task.title}
								</h3>

								<!-- Descripción compacta -->
								{#if task.description}
									<p class="text-[10px] sm:text-xs text-neutral-400 mb-1 sm:mb-1.5 line-clamp-1">
										{task.description}
									</p>
								{/if}

								<!-- Metadata compacta -->
								<div class="space-y-0.5 mb-1.5">
									<div class="flex items-center gap-1.5 text-[10px] sm:text-xs">
										<span class="text-neutral-500">⏱️</span>
										<span class="text-neutral-300">{formatDuration(task.estimated_duration_minutes)}m</span>
									</div>
									{#if task.type === 'goal' && task.goal_title}
										<div class="flex items-center gap-1.5 text-[10px] sm:text-xs">
											<span class="text-neutral-500">🎯</span>
											<span class="text-neutral-300 truncate">{task.goal_title}</span>
										</div>
									{/if}
								</div>
								<!-- Footer compacto -->
								<div class="flex items-center justify-between pt-1 border-t border-neutral-700/50">
									<div class="flex items-center gap-1.5">
										<span class="text-[10px] sm:text-xs text-neutral-500">Prioridad</span>
										<div class="flex gap-0.5 sm:gap-1">
											{#each Array(3) as _, i}
												<div class="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full {i < Math.floor(task.priority_score / 33) ? `bg-${getTaskTypeColor(task.type)}-400` : 'bg-neutral-700'}"></div>
											{/each}
										</div>
									</div>
									<div class="text-[10px] sm:text-xs text-neutral-500">
										#{index + 1}
									</div>
								</div>

								<!-- Hover effect indicator -->
								<div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-{getTaskTypeColor(task.type)}-500 to-{getTaskTypeColor(task.type)}-400 transform scale-x-0 group-hover/card:scale-x-100 transition-transform origin-left"></div>
								</div>
							</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Indicadores de scroll (mobile) -->
		<div class="flex justify-center gap-1 mt-2 sm:hidden">
			{#each allTasks() as _, i}
				<button
					onclick={() => {
						if (scrollContainer) {
							scrollContainer.scrollTo({
								left: i * (scrollContainer.offsetWidth * 0.9),
								behavior: 'smooth'
							});
						}
					}}
					class="w-1.5 h-1.5 rounded-full transition-all {Math.floor(scrollContainer?.scrollLeft / (scrollContainer?.offsetWidth * 0.9)) === i ? 'bg-emerald-500 w-4' : 'bg-neutral-600'}"
					aria-label="Scroll to task {i + 1}"
				></button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
	
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
	
	.animate-gradient {
		background-size: 200% 200%;
		animation: gradient 8s ease infinite;
	}
</style>
