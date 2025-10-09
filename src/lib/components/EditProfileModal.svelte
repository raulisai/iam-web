<script lang="ts">
	import { onMount } from 'svelte';
	import * as profileService from '$lib/services/profile';
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	
	interface Props {
		onClose: () => void;
		onSave?: () => void;
	}
	
	let { onClose, onSave }: Props = $props();
	
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state(false);
	
	let formData = $state({
		birth_date: '',
		gender: '',
		preferred_language: 'es',
		timezone: 'America/Mexico_City',
		weight_kg: null as number | null,
		height_cm: null as number | null,
		work_schedules: '',
		hours_available_to_week: null as number | null
	});
	
	onMount(async () => {
		try {
			const profile = await profileService.getUserProfile();
			if (profile) {
				formData = {
					birth_date: profile.birth_date || '',
					gender: profile.gender || '',
					preferred_language: profile.preferred_language || 'es',
					timezone: profile.timezone || 'America/Mexico_City',
					weight_kg: profile.weight_kg ?? null,
					height_cm: profile.height_cm ?? null,
					work_schedules: profile.work_schedules || '',
					hours_available_to_week: profile.hours_available_to_week ?? null
				};
			}
		} catch (err: any) {
			error = err.message || 'Error al cargar el perfil';
		} finally {
			loading = false;
		}
	});
	
	async function handleSave() {
		if (!formData.birth_date) {
			error = '⚠️ La fecha de nacimiento es requerida';
			return;
		}
		if (!formData.gender) {
			error = '⚠️ El género es requerido';
			return;
		}
		
		saving = true;
		error = '';
		
		try {
			// Convertir null a undefined para que coincida con Partial<UserProfile>
			const profileData = {
				...formData,
				weight_kg: formData.weight_kg ?? undefined,
				height_cm: formData.height_cm ?? undefined,
				hours_available_to_week: formData.hours_available_to_week ?? undefined
			};
			await profileService.updateUserProfile(profileData);
			success = true;
			setTimeout(() => {
				onSave?.();
				onClose();
			}, 1500);
		} catch (err: any) {
			error = err.message || 'Error al guardar el perfil';
		} finally {
			saving = false;
		}
	}
</script>

<!-- Modal Backdrop -->
<div 
	class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
	role="button"
	tabindex="0"
	onclick={onClose}
	onkeydown={(e) => e.key === 'Escape' && onClose()}
	in:scale={{ duration: 200, start: 0.95, opacity: 0 }}
	out:scale={{ duration: 200, start: 0.95, opacity: 0 }}
>
	<!-- Modal Content -->
	<div 
		class="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/20 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-labelledby="modal-title"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
		in:fly={{ y: 20, duration: 300, easing: quintOut }}
	>
		<!-- Header -->
		<div class="sticky top-0 bg-gradient-to-br from-neutral-900 to-neutral-800 border-b border-white/10 p-6 flex items-center justify-between backdrop-blur-sm">
			<div class="flex items-center gap-3">
				<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
					<span class="text-2xl">✏️</span>
				</div>
				<div>
					<h2 id="modal-title" class="text-xl font-bold">Editar Perfil</h2>
					<p class="text-sm text-white/60">Actualiza tu información personal</p>
				</div>
			</div>
			
			<button
				type="button"
				onclick={onClose}
				aria-label="Cerrar modal"
				class="p-2 hover:bg-white/10 rounded-lg transition-colors"
			>
				<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6L6 18M6 6l12 12"/>
				</svg>
			</button>
		</div>
		
		<!-- Content -->
		<div class="p-6">
			{#if loading}
				<div class="flex flex-col items-center justify-center py-12">
					<div class="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
					<p class="text-white/60">Cargando perfil...</p>
				</div>
			{:else}
				<form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="space-y-6">
					<!-- Error Message -->
					{#if error}
						<div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3" in:fly={{ y: -10, duration: 200 }}>
							<span class="text-2xl">⚠️</span>
							<p class="text-red-400 text-sm">{error}</p>
						</div>
					{/if}
					
					<!-- Success Message -->
					{#if success}
						<div class="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3" in:scale={{ duration: 300 }}>
							<span class="text-2xl">✅</span>
							<p class="text-green-400 text-sm">¡Perfil actualizado exitosamente!</p>
						</div>
					{/if}
					
					<!-- Form Fields -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<!-- Birth Date -->
						<div class="group">
							<label for="edit-birth-date" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-purple-400 transition-colors">
								🎂 Fecha de Nacimiento *
							</label>
							<input 
								id="edit-birth-date"
								type="date" 
								bind:value={formData.birth_date}
								required
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
										onclick={() => formData.gender = option.value}
										class="px-3 py-2 rounded-lg border-2 transition-all
											{formData.gender === option.value 
												? 'border-purple-500 bg-purple-500/20 scale-105' 
												: 'border-white/10 hover:border-purple-500/50'}"
									>
										<span class="text-lg">{option.icon}</span>
										<span class="block text-xs mt-1 font-medium">{option.label}</span>
									</button>
								{/each}
							</div>
						</div>
						
						<!-- Weight -->
						<div class="group">
							<label for="edit-weight" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-orange-400 transition-colors">
								⚖️ Peso (kg)
							</label>
							<input 
								id="edit-weight"
								type="number" 
								bind:value={formData.weight_kg}
								min="30"
								max="300"
								step="0.1"
								placeholder="75.0"
								class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all hover:border-white/20"
							/>
						</div>
						
						<!-- Height -->
						<div class="group">
							<label for="edit-height" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-orange-400 transition-colors">
								📏 Altura (cm)
							</label>
							<input 
								id="edit-height"
								type="number" 
								bind:value={formData.height_cm}
								min="100"
								max="250"
								placeholder="175"
								class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all hover:border-white/20"
							/>
						</div>
						
						<!-- Timezone -->
						<div class="group">
							<label for="edit-timezone" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-blue-400 transition-colors">
								🌍 Zona Horaria
							</label>
							<select 
								id="edit-timezone"
								bind:value={formData.timezone}
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
							<label for="edit-language" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-blue-400 transition-colors">
								🗣️ Idioma Preferido
							</label>
							<select 
								id="edit-language"
								bind:value={formData.preferred_language}
								class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-white/20 cursor-pointer"
							>
								<option value="es">🇪🇸 Español</option>
								<option value="en">🇬🇧 English</option>
							</select>
						</div>
						
						<!-- Work Schedule -->
						<div class="group">
							<label for="edit-work-schedule" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-cyan-400 transition-colors">
								💼 Horario de Trabajo
							</label>
							<input 
								id="edit-work-schedule"
								type="text" 
								bind:value={formData.work_schedules}
								placeholder="9:00-17:00"
								class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all hover:border-white/20"
							/>
						</div>
						
						<!-- Hours Available -->
						<div class="group">
							<label for="edit-hours-available" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-cyan-400 transition-colors">
								⏰ Horas Disponibles/Semana
							</label>
							<input 
								id="edit-hours-available"
								type="number" 
								bind:value={formData.hours_available_to_week}
								min="1"
								max="168"
								placeholder="40"
								class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all hover:border-white/20"
							/>
						</div>
					</div>
					
					<!-- Action Buttons -->
					<div class="flex gap-4 pt-4">
						<button
							type="button"
							onclick={onClose}
							disabled={saving}
							class="flex-1 px-6 py-3 bg-neutral-800/50 border border-white/10 rounded-xl hover:border-white/20 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Cancelar
						</button>
						
						<button
							type="submit"
							disabled={saving || success}
							class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-500 hover:to-pink-500 hover:scale-105 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
						>
							{#if saving}
								<span class="flex items-center justify-center gap-2">
									<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									Guardando...
								</span>
							{:else if success}
								✅ Guardado
							{:else}
								💾 Guardar Cambios
							{/if}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</div>

<style>
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
