<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	
	interface Props {
		customTasks: any[];
		onComplete: () => void;
		onBack: () => void;
	}
	
	let { customTasks = $bindable(), onComplete, onBack }: Props = $props();
	
	let newTask = $state({
		name: '',
		description: '',
		category: 'mind' as 'mind' | 'body',
		duration: 30,
		difficulty: 3
	});
	
	function addTask() {
		if (!newTask.name.trim()) {
			alert('⚠️ El nombre de la tarea es requerido');
			return;
		}
		
		customTasks = [...customTasks, {
			id: `custom-${Date.now()}`,
			...newTask,
			icon: newTask.category === 'mind' ? '🧠' : '💪'
		}];
		
		// Reset form
		newTask = {
			name: '',
			description: '',
			category: 'mind',
			duration: 30,
			difficulty: 3
		};
	}
	
	function removeTask(index: number) {
		customTasks = customTasks.filter((_, i) => i !== index);
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
		<div class="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-full px-6 py-3 mb-4">
			<span class="text-3xl">🎨</span>
			<span class="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400 font-semibold">
				Tareas Personalizadas
			</span>
		</div>
		<p class="text-white/60 text-sm">
			🚀 Crea tus propias tareas únicas (opcional)
		</p>
	</div>
	
	<div class="grid lg:grid-cols-2 gap-8 mb-8">
		<!-- Form to create new task -->
		<div class="space-y-6">
			<h3 class="text-lg font-semibold flex items-center gap-2 mb-4">
				<span>➕</span>
				<span>Nueva Tarea</span>
			</h3>
			
			<div class="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 border border-white/10 rounded-2xl p-6 space-y-4">
				<!-- Task Name -->
				<div class="group">
					<label for="task-name" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-purple-400 transition-colors">
						📝 Nombre de la Tarea
					</label>
					<input 
						id="task-name"
						type="text" 
						bind:value={newTask.name}
						placeholder="Ej: Práctica de guitarra"
						class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:border-white/20"
					/>
				</div>
				
				<!-- Category -->
				<div>
					<span class="block text-sm font-medium mb-2 text-white/80">🎯 Categoría</span>
					<div class="grid grid-cols-2 gap-3">
						<button
							type="button"
							onclick={() => newTask.category = 'mind'}
							class="group/btn relative px-4 py-3 rounded-xl border-2 transition-all duration-300
								{newTask.category === 'mind' 
									? 'border-purple-500 bg-purple-500/20 scale-105' 
									: 'border-white/10 hover:border-purple-500/50 hover:scale-105'}"
						>
							<div class="flex items-center justify-center gap-2">
								<span class="text-2xl">🧠</span>
								<span class="font-semibold">Mente</span>
							</div>
						</button>
						<button
							type="button"
							onclick={() => newTask.category = 'body'}
							class="group/btn relative px-4 py-3 rounded-xl border-2 transition-all duration-300
								{newTask.category === 'body' 
									? 'border-orange-500 bg-orange-500/20 scale-105' 
									: 'border-white/10 hover:border-orange-500/50 hover:scale-105'}"
						>
							<div class="flex items-center justify-center gap-2">
								<span class="text-2xl">💪</span>
								<span class="font-semibold">Cuerpo</span>
							</div>
						</button>
					</div>
				</div>
				
				<!-- Duration -->
				<div class="group">
					<label for="task-duration" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-blue-400 transition-colors">
						⏱️ Duración (minutos)
					</label>
					<div class="flex items-center gap-3">
						<input 
							id="task-duration"
							type="range"
							bind:value={newTask.duration}
							min="5"
							max="180"
							step="5"
							class="flex-1 accent-blue-500"
						/>
						<div class="w-16 text-center bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-2 font-bold text-blue-400">
							{newTask.duration}
						</div>
					</div>
				</div>
				
				<!-- Difficulty -->
				<div>
					<span class="block text-sm font-medium mb-2 text-white/80">⭐ Dificultad</span>
					<div class="flex gap-2">
						{#each [1, 2, 3, 4, 5] as level}
							<button
								type="button"
								onclick={() => newTask.difficulty = level}
								class="flex-1 py-3 rounded-xl border-2 transition-all duration-300
									{newTask.difficulty === level 
										? 'border-amber-500 bg-amber-500/20 scale-110' 
										: 'border-white/10 hover:border-amber-500/50 hover:scale-105'}"
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
				
				<!-- Description -->
				<div class="group">
					<label for="task-description" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-purple-400 transition-colors">
						💬 Descripción
					</label>
					<textarea 
						id="task-description"
						bind:value={newTask.description}
						rows="3"
						placeholder="Describe la tarea..."
						class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all hover:border-white/20 resize-none"
					></textarea>
				</div>
				
				<!-- Add Button -->
				<button
					type="button"
					onclick={addTask}
					class="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-500 hover:to-emerald-500 hover:scale-105 transition-all shadow-lg shadow-green-500/25 font-semibold"
				>
					➕ Agregar Tarea
				</button>
			</div>
		</div>
		
		<!-- Created Tasks List -->
		<div class="space-y-4">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold flex items-center gap-2">
					<span>📋</span>
					<span>Mis Tareas</span>
				</h3>
				<div class="text-sm text-white/40">
					{customTasks.length} creadas
				</div>
			</div>
			
			{#if customTasks.length === 0}
				<div class="bg-neutral-900/50 border border-dashed border-white/10 rounded-2xl p-12 text-center">
					<span class="text-6xl mb-4 block">📝</span>
					<p class="text-white/60">Aún no has creado tareas</p>
					<p class="text-white/40 text-sm mt-2">Comienza agregando tu primera tarea personalizada</p>
				</div>
			{:else}
				<div class="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
					{#each customTasks as task, i}
						<div class="group bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all animate-slide-in">
							<div class="flex items-start gap-3">
								<!-- Icon -->
								<div class="flex-shrink-0 w-12 h-12 rounded-xl bg-{task.category === 'mind' ? 'purple' : 'orange'}-500/20 border border-{task.category === 'mind' ? 'purple' : 'orange'}-500/30 flex items-center justify-center text-2xl">
									{task.icon}
								</div>
								
								<!-- Content -->
								<div class="flex-1 min-w-0">
									<h4 class="font-semibold text-sm mb-1 truncate">{task.name}</h4>
									{#if task.description}
										<p class="text-xs text-white/60 mb-2 line-clamp-2">{task.description}</p>
									{/if}
									<div class="flex items-center gap-3 text-xs text-white/40">
										<span class="flex items-center gap-1">
											<span>{task.category === 'mind' ? '🧠' : '💪'}</span>
											<span>{task.category === 'mind' ? 'Mente' : 'Cuerpo'}</span>
										</span>
										<span>⏱️ {task.duration} min</span>
										<span>{getDifficultyStars(task.difficulty)}</span>
									</div>
								</div>
								
								<!-- Remove Button -->
								<button
									type="button"
									onclick={() => removeTask(i)}
									aria-label="Eliminar tarea"
									class="flex-shrink-0 p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors opacity-0 group-hover:opacity-100"
								>
									<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M18 6L6 18M6 6l12 12"/>
									</svg>
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
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
			onclick={onComplete}
			class="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-500 hover:to-emerald-500 hover:scale-105 transition-all shadow-lg shadow-green-500/25"
		>
			<span class="font-semibold">🎉 Finalizar</span>
			<svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 13l4 4L19 7"/>
			</svg>
		</button>
	</div>
</div>

<style>
	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
	
	.animate-slide-in {
		animation: slide-in 0.3s ease-out;
	}
	
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.custom-scrollbar::-webkit-scrollbar {
		width: 8px;
	}
	
	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
	}
	
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}
	
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
