<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getUserProfile, updateUserProfile, type UserProfile } from '$lib/services/profile';
    import { initializeAuthStore, setAuthContext } from '$lib/stores/auth.svelte';
	import CreateProfileForm from './CreateProfileForm.svelte';

	let profile = $state<UserProfile | null>(null);
	let isLoading = $state(true);
	let isEditing = $state(false);
	let error = $state<string | null>(null);
	let successMessage = $state<string | null>(null);
	let profileNotFound = $state(false);

    // Inicializar store de autenticación
	const authStore = initializeAuthStore();

	// Formulario de edición
	let editForm = $state<UserProfile>({});

	onMount(async () => {
		await loadProfile();
        console.log('Auth Store:', authStore.user);
	});

	async function loadProfile() {
		try {
			isLoading = true;
			error = null;
			profileNotFound = false;
			profile = await getUserProfile();
			editForm = { ...profile };
		} catch (err: any) {
			// Si el perfil no existe (404), mostrar formulario de creación
			if (err.message?.includes('not found') || err.message?.includes('404')) {
				profileNotFound = true;
			} else {
				error = err.message || 'Error al cargar el perfil';
			}
			console.error('Error loading profile:', err);
		} finally {
			isLoading = false;
		}
	}

	function startEditing() {
		editForm = { ...profile };
		isEditing = true;
		successMessage = null;
		error = null;
	}

	function cancelEditing() {
		isEditing = false;
		editForm = { ...profile };
		error = null;
	}

	async function saveProfile() {
		try {
			error = null;
			successMessage = null;
			
			// Preparar datos para enviar (solo campos editables)
			const updateData: Partial<UserProfile> = {
				timezone: editForm.timezone,
				birth_date: editForm.birth_date,
				gender: editForm.gender,
				weight_kg: editForm.weight_kg,
				height_cm: editForm.height_cm,
				preferred_language: editForm.preferred_language,
				hours_available_to_week: editForm.hours_available_to_week,
				work_schedules: editForm.work_schedules,
				current_status: editForm.current_status
			};

			profile = await updateUserProfile(updateData);
			editForm = { ...profile };
			isEditing = false;
			successMessage = '✅ Perfil actualizado exitosamente';
			
			// Ocultar mensaje después de 3 segundos
			setTimeout(() => {
				successMessage = null;
			}, 3000);
		} catch (err: any) {
			error = err.message || 'Error al actualizar el perfil';
			console.error('Error updating profile:', err);
		}
	}

	function calculateAge(birthDate: string): number {
		if (!birthDate) return 0;
		const today = new Date();
		const birth = new Date(birthDate);
		let age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
			age--;
		}
		return age;
	}

	function calculateBMI(weight: number | undefined, height: number | undefined): string {
		if (!weight || !height) return 'N/A';
		const heightInMeters = height / 100;
		const bmi = weight / (heightInMeters * heightInMeters);
		return bmi.toFixed(1);
	}
</script>

<div class="min-h-screen bg-neutral-950">
	<div class="max-w-4xl mx-auto p-4 md:p-8">
		<!-- Header -->
		<div class="mb-8">
			<button
				onclick={() => goto('/')}
				class="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
			>
				<span>←</span>
				<span>Volver al inicio</span>
			</button>
			<h1 class="text-3xl md:text-4xl font-bold text-white mb-2">Mi Perfil</h1>
			<p class="text-white/60">Gestiona tu información personal</p>
		</div>

		{#if isLoading}
			<div class="flex items-center justify-center py-20">
				<div class="text-center">
					<div class="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
					<p class="text-white/60">Cargando perfil...</p>
				</div>
			</div>
		{:else if profileNotFound}
			<!-- Mostrar formulario para crear perfil -->
			<CreateProfileForm />
		{:else if error && !profile}
			<div class="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
				<p class="text-red-400 mb-4">❌ {error}</p>
				<button
					onclick={loadProfile}
					class="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
				>
					Reintentar
				</button>
			</div>
		{:else if profile}
			<!-- Mensajes -->
			{#if successMessage}
				<div class="mb-6 bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-4 text-emerald-400">
					{successMessage}
				</div>
			{/if}
			
			{#if error}
				<div class="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
					❌ {error}
				</div>
			{/if}

			<!-- Tarjeta de perfil -->
			<div class="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
				<!-- Header de la tarjeta con avatar y acciones -->
				<div class="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-white/10">
					<div class="flex items-start justify-between">
						<div class="flex items-center gap-4">
							<div class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl">
								{authStore.user?.name?.charAt(0).toUpperCase() || '👤'}
							</div>
							<div>
								<h2 class="text-xl font-bold text-white">
									{authStore.user?.name || 'Usuario'}
								</h2>
								<p class="text-white/60 text-sm">{authStore.user?.email || ''}</p>
								<p class="text-white/40 text-xs mt-1">Miembro desde {new Date(profile.created_at || '').toLocaleDateString('es-ES')}</p>
							</div>
						</div>
						
						{#if !isEditing}
							<button
								onclick={startEditing}
								class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
							>
								<span>✏️</span>
								<span>Editar</span>
							</button>
						{/if}
					</div>
				</div>

				<!-- Contenido del perfil -->
				<div class="p-6">
					{#if !isEditing}
						<!-- Modo visualización -->
						<div class="grid md:grid-cols-2 gap-6">
							<!-- Información Personal -->
							<div class="space-y-4">
								<h3 class="text-lg font-semibold text-white mb-4">📋 Información Personal</h3>
								
								<div class="bg-neutral-800 rounded-lg p-4">
									<label class="text-white/40 text-sm">Fecha de Nacimiento</label>
									<p class="text-white mt-1">
										{profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('es-ES') : 'No especificada'}
										{#if profile.birth_date}
											<span class="text-white/60 text-sm ml-2">({calculateAge(profile.birth_date)} años)</span>
										{/if}
									</p>
								</div>

								<div class="bg-neutral-800 rounded-lg p-4">
									<label class="text-white/40 text-sm">Género</label>
									<p class="text-white mt-1 capitalize">{profile.gender || 'No especificado'}</p>
								</div>

								<div class="bg-neutral-800 rounded-lg p-4">
									<label class="text-white/40 text-sm">Idioma Preferido</label>
									<p class="text-white mt-1">{profile.preferred_language?.toUpperCase() || 'ES'}</p>
								</div>

								<div class="bg-neutral-800 rounded-lg p-4">
									<label class="text-white/40 text-sm">Zona Horaria</label>
									<p class="text-white mt-1">{profile.timezone || 'No especificada'}</p>
								</div>
							</div>

							<!-- Información Física -->
							<div class="space-y-4">
								<h3 class="text-lg font-semibold text-white mb-4">💪 Información Física</h3>
								
								<div class="bg-neutral-800 rounded-lg p-4">
									<label class="text-white/40 text-sm">Peso</label>
									<p class="text-white mt-1">{profile.weight_kg ? `${profile.weight_kg} kg` : 'No especificado'}</p>
								</div>

								<div class="bg-neutral-800 rounded-lg p-4">
									<label class="text-white/40 text-sm">Altura</label>
									<p class="text-white mt-1">{profile.height_cm ? `${profile.height_cm} cm` : 'No especificada'}</p>
								</div>

								<div class="bg-neutral-800 rounded-lg p-4">
									<label class="text-white/40 text-sm">IMC (Índice de Masa Corporal)</label>
									<p class="text-white mt-1 text-2xl font-bold">{calculateBMI(profile.weight_kg, profile.height_cm)}</p>
								</div>
							</div>

							<!-- Horarios y Disponibilidad -->
							<div class="space-y-4 md:col-span-2">
								<h3 class="text-lg font-semibold text-white mb-4">⏰ Horarios y Disponibilidad</h3>
								
								<div class="grid md:grid-cols-3 gap-4">
									<div class="bg-neutral-800 rounded-lg p-4">
										<label class="text-white/40 text-sm">Horario de Trabajo</label>
										<p class="text-white mt-1">{profile.work_schedules || 'No especificado'}</p>
									</div>

									<div class="bg-neutral-800 rounded-lg p-4">
										<label class="text-white/40 text-sm">Horas Disponibles/Semana</label>
										<p class="text-white mt-1">{profile.hours_available_to_week || 0} hrs</p>
									</div>

									<div class="bg-neutral-800 rounded-lg p-4">
										<label class="text-white/40 text-sm">Horas Usadas/Semana</label>
										<p class="text-white mt-1">{profile.hours_used_to_week || 0} hrs</p>
									</div>
								</div>

								<!-- Barra de progreso de horas -->
								{#if profile.hours_available_to_week && profile.hours_available_to_week > 0}
									<div class="bg-neutral-800 rounded-lg p-4">
										<div class="flex justify-between mb-2">
											<span class="text-white/60 text-sm">Uso de horas semanales</span>
											<span class="text-white text-sm font-medium">
												{Math.round(((profile.hours_used_to_week || 0) / profile.hours_available_to_week) * 100)}%
											</span>
										</div>
										<div class="w-full bg-neutral-700 rounded-full h-2">
											<div 
												class="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
												style="width: {Math.min(((profile.hours_used_to_week || 0) / profile.hours_available_to_week) * 100, 100)}%"
											></div>
										</div>
									</div>
								{/if}
							</div>

							<!-- Estado Actual -->
							<div class="md:col-span-2">
								<h3 class="text-lg font-semibold text-white mb-4">📊 Estado Actual</h3>
								<div class="bg-neutral-800 rounded-lg p-4">
									<label class="text-white/40 text-sm">Estado</label>
									<p class="text-white mt-1 capitalize">{profile.current_status || 'No especificado'}</p>
								</div>
							</div>
						</div>
					{:else}
						<!-- Modo edición -->
						<form onsubmit={(e) => { e.preventDefault(); saveProfile(); }} class="space-y-6">
							<!-- Información Personal -->
							<div class="space-y-4">
								<h3 class="text-lg font-semibold text-white mb-4">📋 Información Personal</h3>
								
								<div class="grid md:grid-cols-2 gap-4">
									<div>
										<label class="block text-white/60 text-sm mb-2">Fecha de Nacimiento</label>
										<input
											type="date"
											bind:value={editForm.birth_date}
											class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
										/>
									</div>

									<div>
										<label class="block text-white/60 text-sm mb-2">Género</label>
										<select
											bind:value={editForm.gender}
											class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
										>
											<option value="">Seleccionar</option>
											<option value="male">Masculino</option>
											<option value="female">Femenino</option>
											<option value="other">Otro</option>
										</select>
									</div>

									<div>
										<label class="block text-white/60 text-sm mb-2">Idioma Preferido</label>
										<select
											bind:value={editForm.preferred_language}
											class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
										>
											<option value="es">Español</option>
											<option value="en">English</option>
										</select>
									</div>

									<div>
										<label class="block text-white/60 text-sm mb-2">Zona Horaria</label>
										<input
											type="text"
											bind:value={editForm.timezone}
											placeholder="America/Mexico_City"
											class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
										/>
									</div>
								</div>
							</div>

							<!-- Información Física -->
							<div class="space-y-4">
								<h3 class="text-lg font-semibold text-white mb-4">💪 Información Física</h3>
								
								<div class="grid md:grid-cols-2 gap-4">
									<div>
										<label class="block text-white/60 text-sm mb-2">Peso (kg)</label>
										<input
											type="number"
											step="0.1"
											bind:value={editForm.weight_kg}
											placeholder="75.5"
											class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
										/>
									</div>

									<div>
										<label class="block text-white/60 text-sm mb-2">Altura (cm)</label>
										<input
											type="number"
											bind:value={editForm.height_cm}
											placeholder="175"
											class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
										/>
									</div>
								</div>
							</div>

							<!-- Horarios y Disponibilidad -->
							<div class="space-y-4">
								<h3 class="text-lg font-semibold text-white mb-4">⏰ Horarios y Disponibilidad</h3>
								
								<div class="grid md:grid-cols-2 gap-4">
									<div>
										<label class="block text-white/60 text-sm mb-2">Horario de Trabajo</label>
										<input
											type="text"
											bind:value={editForm.work_schedules}
											placeholder="9:00-17:00"
											class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
										/>
									</div>

									<div>
										<label class="block text-white/60 text-sm mb-2">Horas Disponibles/Semana</label>
										<input
											type="number"
											bind:value={editForm.hours_available_to_week}
											placeholder="40"
											class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
										/>
									</div>
								</div>
							</div>

							<!-- Estado Actual -->
							<div class="space-y-4">
								<h3 class="text-lg font-semibold text-white mb-4">📊 Estado Actual</h3>
								
								<div>
									<label class="block text-white/60 text-sm mb-2">Estado</label>
									<select
										bind:value={editForm.current_status}
										class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
									>
										<option value="active">Activo</option>
										<option value="busy">Ocupado</option>
										<option value="away">Ausente</option>
										<option value="offline">Desconectado</option>
									</select>
								</div>
							</div>

							<!-- Botones de acción -->
							<div class="flex gap-4 pt-4">
								<button
									type="submit"
									class="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
								>
									💾 Guardar Cambios
								</button>
								<button
									type="button"
									onclick={cancelEditing}
									class="flex-1 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
								>
									❌ Cancelar
								</button>
							</div>
						</form>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	input[type="date"]::-webkit-calendar-picker-indicator {
		filter: invert(1);
		cursor: pointer;
	}
</style>
