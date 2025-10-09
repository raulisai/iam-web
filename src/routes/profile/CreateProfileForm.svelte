<script lang="ts">
	import { goto } from '$app/navigation';
	import { createUserProfile } from '$lib/services/profile';
	import type { UserProfile } from '$lib/types';

	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	// Formulario
	let formData = $state<UserProfile>({
		timezone: 'America/Mexico_City',
		preferred_language: 'es',
		gender: '',
		birth_date: '',
		weight_kg: undefined,
		height_cm: undefined,
		hours_available_to_week: 40,
		work_schedules: '',
		current_status: 'active'
	});

	async function handleSubmit() {
		try {
			isSubmitting = true;
			error = null;

			// Validaciones básicas
			if (!formData.birth_date) {
				error = 'La fecha de nacimiento es requerida';
				return;
			}

			if (!formData.gender) {
				error = 'El género es requerido';
				return;
			}

			await createUserProfile(formData);
			
			// Redirigir al perfil después de crear
			goto('/profile');
		} catch (err: any) {
			error = err.message || 'Error al crear el perfil';
			console.error('Error creating profile:', err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="bg-neutral-900 border border-white/10 rounded-2xl p-6">
	<div class="text-center mb-6">
		<div class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl mx-auto mb-4">
			👤
		</div>
		<h2 class="text-2xl font-bold text-white mb-2">Crea tu Perfil</h2>
		<p class="text-white/60">Completa tu información para comenzar</p>
	</div>

	{#if error}
		<div class="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
			❌ {error}
		</div>
	{/if}

	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
		<!-- Información Personal -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold text-white mb-4">📋 Información Personal</h3>
			
		<div class="grid md:grid-cols-2 gap-4">
			<div>
				<label for="birth-date" class="block text-white/60 text-sm mb-2">Fecha de Nacimiento *</label>
				<input
					id="birth-date"
					type="date"
					bind:value={formData.birth_date}
					required
					class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
				/>
			</div>			<div>
				<label for="create-gender" class="block text-white/60 text-sm mb-2">Género *</label>
				<select
					id="create-gender"
					bind:value={formData.gender}
					required
					class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
				>
					<option value="">Seleccionar</option>
					<option value="male">Masculino</option>
					<option value="female">Femenino</option>
					<option value="other">Otro</option>
				</select>
			</div>			<div>
				<label for="create-language" class="block text-white/60 text-sm mb-2">Idioma Preferido</label>
				<select
					id="create-language"
					bind:value={formData.preferred_language}
					class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
					>
						<option value="es">Español</option>
						<option value="en">English</option>
					</select>
				</div>

				<div>
					<label for="create-timezone" class="block text-white/60 text-sm mb-2">Zona Horaria</label>
					<input
						id="create-timezone"
						type="text"
						bind:value={formData.timezone}
						placeholder="America/Mexico_City"
						class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
					/>
				</div>
			</div>
		</div>

		<!-- Información Física -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold text-white mb-4">💪 Información Física (Opcional)</h3>
			
			<div class="grid md:grid-cols-2 gap-4">
			<div>
				<label for="create-weight" class="block text-white/60 text-sm mb-2">Peso (kg)</label>
				<input
					id="create-weight"
					type="number"
					step="0.1"
					bind:value={formData.weight_kg}
					placeholder="75.5"
					class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
				/>
			</div>				<div>
					<label for="create-height" class="block text-white/60 text-sm mb-2">Altura (cm)</label>
					<input
						id="create-height"
						type="number"
						bind:value={formData.height_cm}
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
				<label for="create-work-schedule" class="block text-white/60 text-sm mb-2">Horario de Trabajo</label>
				<input
					id="create-work-schedule"
					type="text"
					bind:value={formData.work_schedules}
					placeholder="9:00-17:00"
					class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
				/>
			</div>				<div>
					<label for="create-hours-available" class="block text-white/60 text-sm mb-2">Horas Disponibles/Semana</label>
					<input
						id="create-hours-available"
						type="number"
						bind:value={formData.hours_available_to_week}
						placeholder="40"
						class="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
					/>
				</div>
			</div>
		</div>

		<!-- Botones de acción -->
		<div class="flex gap-4 pt-4">
			<button
				type="submit"
				disabled={isSubmitting}
				class="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
			>
				{isSubmitting ? '⏳ Creando...' : '✅ Crear Perfil'}
			</button>
			<button
				type="button"
				onclick={() => goto('/')}
				disabled={isSubmitting}
				class="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-800/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
			>
				Cancelar
			</button>
		</div>
	</form>
</div>

<style>
	input[type="date"]::-webkit-calendar-picker-indicator {
		filter: invert(1);
		cursor: pointer;
	}
</style>
