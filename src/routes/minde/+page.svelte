<script>
    import Brain from './Brain.svelte';
    import { onMount } from 'svelte';
    
    // Ejemplo de nivel de llenado que se puede ajustar manualmente
    let fillLevel = 50;
    
    onMount(() => {
      
    });
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">STATUS OF BRAIN</h1>
    <div class="w-96 h-96">
        <Brain {fillLevel} />
    </div>
    
   
</div>
