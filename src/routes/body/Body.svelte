<script lang="ts">
export let energy: number = 75;
export let stamina: number = 60;
export let fillLevel: number = 50;

let image = "/img/body-status-dark.png";
let width: number;
    
// Aseguramos que el nivel de llenado esté entre 0 y 100
$: clampedFillLevel = Math.max(0, Math.min(100, fillLevel));

// Calculamos el ancho basado en el 30% del contenedor
$: backgroundWidth = width ? width * 0.42 : 0;
$: backgroundMargin = width ? (width - backgroundWidth) / 2 : 0;
</script>

<div class="body-container" bind:clientWidth={width}>
    <div 
        class="body-background" 
        style="--fill-height: {100 - clampedFillLevel}%; width: {backgroundWidth}px; margin-left: {backgroundMargin}px;"
    ></div>
    
    <img src={image} alt="Body Status" class="body-image" />
</div>

<style>
    .body-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    
    .body-image {
        position: relative;
        width: 100%;
        height: 100%;
        object-fit: contain;
        z-index: 2;
    }
    
    .body-background {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: linear-gradient(
            to top,
            rgba(0, 123, 255, 0.7) 0%,
            rgba(0, 123, 255, 0.7) calc(100% - var(--fill-height)),
            transparent calc(100% - var(--fill-height))
        );
        z-index: 1;
        border-radius: 8px;
        transition: all 0.5s ease;
        pointer-events: none;
    }
</style>
