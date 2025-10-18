# FloatingActionButton - Componente Reutilizable

Componente de botón flotante con efecto de cachito expandible, scroll behavior y totalmente personalizable.

## 🎯 Características

- ✅ **Cachito discreto** que se expande al hacer scroll
- ✅ **Totalmente personalizable**: colores, tamaños, posiciones
- ✅ **Comportamiento inteligente** de scroll
- ✅ **Slots para botones** personalizados
- ✅ **Sin "brincos"** - transiciones suaves
- ✅ **Mobile-first** con opción desktop

## 📦 Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `verticalPosition` | `'top' \| 'center' \| 'bottom'` | `'center'` | Posición vertical |
| `horizontalPosition` | `'left' \| 'right'` | `'right'` | Posición horizontal |
| `autoHideDelay` | `number` | `2000` | Milisegundos antes de ocultar (0 = nunca) |
| `miniWidth` | `string` | `'0.5rem'` | Ancho del cachito mini |
| `miniHeight` | `string` | `'4rem'` | Alto del cachito mini |
| `expandedWidth` | `string` | `'2.5rem'` | Ancho al scrollear |
| `expandedHeight` | `string` | `'6rem'` | Alto al scrollear |
| `miniOpacity` | `string` | `'0.4'` | Opacidad mini (0-1) |
| `scrollOpacity` | `string` | `'0.7'` | Opacidad al scrollear (0-1) |
| `colorFrom` | `string` | `'green-500'` | Color inicio gradiente |
| `colorTo` | `string` | `'emerald-600'` | Color fin gradiente |
| `mobileOnly` | `boolean` | `true` | Solo mostrar en mobile |
| `enableScrollBehavior` | `boolean` | `true` | Habilitar comportamiento de scroll |

## 🚀 Uso Básico

```svelte
<script>
  import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
</script>

<FloatingActionButton>
  <!-- Botones personalizados cuando se expande -->
  <button
    onclick={() => console.log('Acción 1')}
    class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full hover:scale-105 transition-all shadow-lg text-xs"
  >
    <span>Acción 1</span>
  </button>
  
  <button
    onclick={() => console.log('Acción 2')}
    class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full hover:scale-105 transition-all shadow-lg text-xs"
  >
    <span>Acción 2</span>
  </button>
</FloatingActionButton>
```

## 🎨 Ejemplo con Navegación (como onboarding)

```svelte
<script>
  import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
  
  let currentStep = $state(1);
  const totalSteps = 5;
  
  function nextStep() {
    if (currentStep < totalSteps) currentStep++;
  }
  
  function prevStep() {
    if (currentStep > 1) currentStep--;
  }
</script>

<FloatingActionButton>
  {#if currentStep > 1}
    <button
      onclick={prevStep}
      class="flex items-center gap-2 px-3 py-2 bg-neutral-800/95 border-2 border-white/20 rounded-full hover:scale-105 transition-all backdrop-blur-md shadow-lg text-xs"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span class="font-semibold">Atrás</span>
    </button>
  {/if}
  
  {#if currentStep < totalSteps}
    <button
      onclick={nextStep}
      class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full hover:scale-105 transition-all shadow-lg shadow-green-500/40 backdrop-blur-md text-xs"
    >
      <span class="font-bold">Continuar</span>
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </button>
  {/if}
</FloatingActionButton>
```

## 🎭 Ejemplo con Posición Izquierda y Colores Custom

```svelte
<FloatingActionButton
  horizontalPosition="left"
  verticalPosition="bottom"
  colorFrom="purple-500"
  colorTo="pink-600"
  autoHideDelay={3000}
>
  <button class="px-4 py-2 bg-purple-600 rounded-full text-xs">
    Compartir
  </button>
  
  <button class="px-4 py-2 bg-pink-600 rounded-full text-xs">
    Favorito
  </button>
</FloatingActionButton>
```

## 🔧 Ejemplo Siempre Visible (sin scroll behavior)

```svelte
<FloatingActionButton
  enableScrollBehavior={false}
  miniOpacity="1"
  scrollOpacity="1"
>
  <button class="px-4 py-2 bg-blue-600 rounded-full text-xs">
    Ayuda
  </button>
</FloatingActionButton>
```

## 🎪 Ejemplo con Múltiples Acciones

```svelte
<FloatingActionButton
  expandedHeight="8rem"
  colorFrom="indigo-500"
  colorTo="purple-600"
>
  <button class="flex items-center gap-2 px-3 py-2 bg-indigo-600 rounded-full text-xs">
    <svg class="w-4 h-4"><!-- Home icon --></svg>
    <span>Inicio</span>
  </button>
  
  <button class="flex items-center gap-2 px-3 py-2 bg-purple-600 rounded-full text-xs">
    <svg class="w-4 h-4"><!-- Settings icon --></svg>
    <span>Config</span>
  </button>
  
  <button class="flex items-center gap-2 px-3 py-2 bg-pink-600 rounded-full text-xs">
    <svg class="w-4 h-4"><!-- Profile icon --></svg>
    <span>Perfil</span>
  </button>
</FloatingActionButton>
```

## 📱 Tamaños Personalizados

```svelte
<!-- Cachito extra pequeño -->
<FloatingActionButton
  miniWidth="0.25rem"
  miniHeight="3rem"
  expandedWidth="2rem"
  expandedHeight="5rem"
>
  <!-- Botones -->
</FloatingActionButton>

<!-- Cachito grande -->
<FloatingActionButton
  miniWidth="1rem"
  miniHeight="6rem"
  expandedWidth="3rem"
  expandedHeight="8rem"
>
  <!-- Botones -->
</FloatingActionButton>
```

## 💡 Tips

1. **Orden de botones**: Los botones se renderizan en el orden que los declares dentro del componente
2. **Estilos consistentes**: Usa las mismas clases de Tailwind para mantener consistencia visual
3. **Iconos**: Puedes usar cualquier librería de iconos (Lucide, Heroicons, etc.)
4. **Accesibilidad**: El componente incluye aria-labels por defecto
5. **Auto-cierre**: Los botones NO cierran el menú automáticamente, debes manejarlo tú si lo deseas

## 🎨 Paletas de Colores Sugeridas

```svelte
<!-- Verde (default) -->
colorFrom="green-500" colorTo="emerald-600"

<!-- Azul -->
colorFrom="blue-500" colorTo="cyan-600"

<!-- Morado -->
colorFrom="purple-500" colorTo="fuchsia-600"

<!-- Naranja -->
colorFrom="orange-500" colorTo="red-600"

<!-- Rosa -->
colorFrom="pink-500" colorTo="rose-600"

<!-- Amarillo -->
colorFrom="yellow-500" colorTo="amber-600"
```

## 🚨 Notas Importantes

- El componente usa `position: fixed`, asegúrate de no tener conflictos con z-index
- Por defecto solo se muestra en mobile (`md:hidden`), cambia `mobileOnly={false}` para desktop
- Los botones personalizados deben manejar su propia lógica onclick
- El menú se cierra con el botón X rojo automáticamente
