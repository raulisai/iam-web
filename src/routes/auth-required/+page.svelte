<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<div class="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
	<div class="max-w-md w-full">
		<div class="bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 p-8 text-center">
			<!-- Icono de alerta -->
			<div class="mb-6 flex justify-center">
				<svg 
					class="w-20 h-20 text-yellow-500" 
					fill="none" 
					stroke="currentColor" 
					viewBox="0 0 24 24"
				>
					<path 
						stroke-linecap="round" 
						stroke-linejoin="round" 
						stroke-width="2" 
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			</div>

			<!-- Título -->
			<h1 class="text-3xl font-bold text-white mb-4">
				Sesión Requerida
			</h1>

			<!-- Mensaje -->
			<p class="text-neutral-400 mb-8 text-lg">
				Debes iniciar sesión para usar esta aplicación. Por favor, inicia sesión para continuar.
			</p>

			<!-- Botón de login -->
			<button
				onclick={() => goto('/login')}
				class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
			>
				Ir al Login
			</button>

			<!-- Información adicional -->
			<div class="mt-6 pt-6 border-t border-neutral-800">
				<p class="text-neutral-500 text-sm">
					Si no tienes una cuenta, contacta con el administrador del sistema.
				</p>
			</div>
		</div>
	</div>
</div>
