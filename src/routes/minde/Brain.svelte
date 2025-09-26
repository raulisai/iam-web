<script>
    // Importamos la imagen del cerebro
    let image = "/human-brain.png";
    
    // Parámetro para controlar el nivel de llenado (0 a 100)
    export let fillLevel = 50;
    
    // Aseguramos que el nivel de llenado esté entre 0 y 100
    $: clampedFillLevel = Math.max(0, Math.min(100, fillLevel));
</script>

<div class="brain-container">
    <div 
        class="brain-background" 
        style="--fill-height: {100 - clampedFillLevel}%;"
    ></div>
    
    <img 
        src={image} 
        alt="Human Brain" 
        class="brain-image"
    />
</div>

<style>
    .brain-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: inline-block;
    }
    
    .brain-image {
        position: relative;
        width: 100%;
        height: auto;
        z-index: 2;
    }
    
    .brain-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            to top,
            rgba(0, 123, 255, 0.7) 0%,
            rgba(0, 123, 255, 0.7) calc(var(--fill-height) * -1 + 100%),
            transparent calc(var(--fill-height) * -1 + 100%)
        );
        z-index: 1;
        border-radius: 5px;
        transition: all 0.5s ease;
    }
</style>
