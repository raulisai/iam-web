<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	
	interface Props {
		profileData: any;
		onNext: () => void;
		onBack?: () => void;
		isEdit?: boolean;
	}
	
	let { profileData = $bindable(), onNext, onBack, isEdit = false }: Props = $props();
	
	function validate() {
		if (!profileData.birth_date) {
			alert('⚠️ La fecha de nacimiento es requerida');
			return false;
		}
		if (!profileData.gender) {
			alert('⚠️ Por favor selecciona tu género');
			return false;
		}
		return true;
	}
	
	function handleNext() {
		if (validate()) {
			onNext();
		}
	}
</script>

<div 
	class="w-full max-w-4xl mx-auto"
	in:fly={{ x: 300, duration: 400, easing: quintOut }}
	out:fly={{ x: -300, duration: 300, easing: quintOut }}
>
	<!-- Header con gamificación -->
	<div class="text-center mb-8">
		<div class="inline-flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 rounded-full px-6 py-3 mb-4">
			<span class="text-3xl">👤</span>
			<span class="text-purple-400 font-semibold">Información Personal</span>
		</div>
		<p class="text-white/60 text-sm">
			{isEdit ? '✏️ Actualiza tu información personal' : '🎯 Cuéntanos sobre ti para personalizar tu experiencia'}
		</p>
	</div>
	
	<!-- Formulario con diseño de juego -->
	<div class="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- Birth Date -->
			<div class="group">
				<label for="onb-birth-date" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-purple-400 transition-colors">
					🎂 Fecha de Nacimiento *
				</label>
				<input 
					id="onb-birth-date"
					type="date" 
					bind:value={profileData.birth_date}
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
							onclick={() => profileData.gender = option.value}
							class="group/btn relative px-4 py-3 rounded-xl border-2 transition-all duration-300 overflow-hidden
								{profileData.gender === option.value 
									? 'border-purple-500 bg-purple-500/20 scale-105' 
									: 'border-white/10 hover:border-purple-500/50 hover:scale-105'}"
						>
							<div class="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover/btn:from-purple-500/10 group-hover/btn:to-pink-500/10 transition-all"></div>
							<span class="relative text-lg">{option.icon}</span>
							<span class="relative block text-xs mt-1 font-medium">{option.label}</span>
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Weight -->
			<div class="group">
				<label for="onb-weight" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-orange-400 transition-colors">
					⚖️ Peso (kg)
				</label>
				<div class="relative">
					<input 
						id="onb-weight"
						type="number" 
						bind:value={profileData.weight_kg}
						min="30"
						max="300"
						step="0.1"
						placeholder="75.0"
						class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all hover:border-white/20"
					/>
					{#if profileData.weight_kg}
						<div class="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 text-xs font-semibold">
							kg
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Height -->
			<div class="group">
				<label for="onb-height" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-orange-400 transition-colors">
					📏 Altura (cm)
				</label>
				<div class="relative">
					<input 
						id="onb-height"
						type="number" 
						bind:value={profileData.height_cm}
						min="100"
						max="250"
						placeholder="175"
						class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all hover:border-white/20"
					/>
					{#if profileData.height_cm}
						<div class="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 text-xs font-semibold">
							cm
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Timezone -->
			<div class="group">
				<label for="onb-timezone" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-blue-400 transition-colors">
					🌍 Zona Horaria
				</label>
				<select 
					id="onb-timezone"
					bind:value={profileData.timezone}
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
				<label for="onb-language" class="block text-sm font-medium mb-2 text-white/80 group-hover:text-blue-400 transition-colors">
					🗣️ Idioma Preferido
				</label>
				<select 
					id="onb-language"
					bind:value={profileData.preferred_language}
					class="w-full bg-neutral-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-white/20 cursor-pointer"
				>
					<option value="es">🇪🇸 Español</option>
					<option value="en">🇬🇧 English</option>
				</select>
			</div>
		</div>
	</div>
	
	<!-- Navigation Buttons -->
	<div class="flex justify-between mt-8">
		{#if onBack}
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
		{:else}
			<div></div>
		{/if}
		
		<button
			type="button"
			onclick={handleNext}
			class="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-500 hover:to-pink-500 hover:scale-105 transition-all shadow-lg shadow-purple-500/25"
		>
			<span class="font-semibold">Continuar</span>
			<svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M12 5l7 7-7 7"/>
			</svg>
		</button>
	</div>
</div>
