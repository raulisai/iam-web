<script lang="ts">
  import { page } from '$app/stores';
  let { children } = $props();
</script>

<div class="min-h-[100dvh] bg-neutral-950 text-white">
  <header class="sticky top-0 z-10 h-12 md:h-16 flex items-center gap-3 px-4 md:px-8 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur">
    <a href="/minde" class="text-neutral-300 hover:text-white text-sm md:text-base transition-colors">← Back</a>
    <h1 class="text-sm md:text-lg font-semibold tracking-wide">Editar tarea</h1>
    <div class="ml-auto text-xs md:text-sm text-neutral-400">ID: {$page.params.id}</div>
  </header>

  <main class="p-4 md:p-8">
    <section class="max-w-2xl mx-auto rounded-xl border border-white/10 bg-neutral-900/60 p-4 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
      <p class="text-neutral-300 text-sm md:text-base">Pantalla de edición/consulta para la tarea.</p>
      <p class="text-neutral-400 text-xs md:text-sm mt-2">Aquí podrás modificar título, duración, puntos, resumen y rating. Por ahora es un placeholder minimalista.</p>
    </section>
  </main>
</div>
