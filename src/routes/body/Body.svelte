<script lang="ts">

export let energy:number = 75;
export let stamina:number = 60;


let image = "/img/body-status-dark.png";
export let fillLevel = 50;
    
// Aseguramos que el nivel de llenado esté entre 0 y 100
$: clampedFillLevel = Math.max(0, Math.min(100, fillLevel));

</script>



<div class="body-container">
    <div 
        class="body-background" 
        style="--fill-height: {100 - clampedFillLevel}%;"
    ></div>
    
   
        <img src={image} alt="Body Status" class="body-image" />
        <!-- Indicadores sobre la imagen -->
        <div class="absolute top-2 left-2 z-10">
            <div class="bg-neutral-900/80 backdrop-blur rounded-lg px-2 py-1">
                <div class="text-[10px] text-emerald-400 font-bold">Energy</div>
                <div class="text-lg font-bold text-white">{energy}%</div>
            </div>
        </div>
        <div class="absolute bottom-2 right-2 z-10">
            <div class="bg-neutral-900/80 backdrop-blur rounded-lg px-2 py-1">
                <div class="text-[10px] text-blue-400 font-bold">Stamina</div>
                <div class="text-lg font-bold text-white">{stamina}%</div>
            </div>
        </div>
        
</div>

<style>
    .body-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: inline-block;
    }
    
    .body-image {
        position: relative;
        width: 100%;
        height: auto;
        z-index: 2;
    }
    
    .body-background {
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
