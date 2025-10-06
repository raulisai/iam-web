# Task Recommendations System

Sistema de recomendaciones de tareas con interfaz estilo videojuegos y experiencia gamificada.

## 📋 Componentes Creados

### 1. **TaskRecommendationModal.svelte**
Modal interactivo que muestra tarjetas de recomendaciones de tareas estilo videojuegos.

**Características:**
- ✨ Animaciones de entrada con zoom y fade
- 🎮 Diseño de tarjetas tipo videojuego con efectos de brillo
- ✏️ Edición inline de nombre, descripción y XP
- 🎯 Selección con doble click (previene selección accidental)
- 🌈 Colores dinámicos según categoría (mind/body)
- 📱 Responsive (funciona en mobile y desktop)
- ♿ Accesibilidad completa (teclado, ARIA labels)

**Props:**
```typescript
interface Props {
    isOpen: boolean;              // Control de visibilidad del modal
    recommendations: TaskRecommendation[];  // Array de recomendaciones
    category: 'mind' | 'body' | 'general';  // Categoría para styling
    isLoading?: boolean;          // Estado de carga
}
```

**Eventos:**
- `select`: Se dispara cuando se selecciona una recomendación
- `close`: Se dispara al cerrar el modal

### 2. **AddTaskButton.svelte**
Botón flotante "+" para agregar tareas, completamente customizable.

**Características:**
- 🎨 4 variantes de color (emerald, purple, orange, blue)
- 📍 4 posiciones configurables (esquinas)
- 📏 3 tamaños (sm, md, lg)
- 🔄 Animación de rotación en hover
- 💫 Efecto de pulse ring
- 💬 Tooltip con información

**Props:**
```typescript
interface Props {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    size?: 'sm' | 'md' | 'lg';
    color?: 'emerald' | 'purple' | 'orange' | 'blue';
}
```

### 3. **recommendations.ts**
Servicio para interactuar con la API de recomendaciones.

**Funciones:**
```typescript
// Obtener recomendaciones generales
getTaskRecommendations(authStore, useAI?)

// Obtener recomendaciones de tareas mentales
getMindRecommendations(authStore, count?, useAI?)

// Obtener recomendaciones de tareas físicas
getBodyRecommendations(authStore, count?, useAI?)

// Crear tarea desde una recomendación
createTaskFromRecommendation(authStore, recommendation, scheduledAt?)
```

## 🎯 Integración

### En páginas Mind y Body

Ambas páginas ahora incluyen:

1. **Botón flotante "+"** con color específico:
   - Mind: Purple
   - Body: Orange

2. **Modal de recomendaciones** que se abre al hacer click en el botón

3. **Flujo completo:**
   ```
   Click en "+" → Carga recomendaciones → Muestra modal → 
   Selecciona tarea → Crea tarea → Recarga lista
   ```

### Ejemplo de uso:

```svelte
<script lang="ts">
    import AddTaskButton from '$lib/components/AddTaskButton.svelte';
    import TaskRecommendationModal from '$lib/components/TaskRecommendationModal.svelte';
    import { getMindRecommendations, createTaskFromRecommendation } from '$lib/services/recommendations';
    
    let showModal = $state(false);
    let recommendations = $state([]);
    let isLoading = $state(false);
    
    async function handleAddClick() {
        showModal = true;
        isLoading = true;
        const response = await getMindRecommendations(authStore, 3);
        recommendations = response?.recommendations || [];
        isLoading = false;
    }
    
    async function handleSelect(e) {
        const success = await createTaskFromRecommendation(authStore, e.detail);
        if (success) {
            showModal = false;
            // Recargar tareas
        }
    }
</script>

<AddTaskButton color="purple" on:click={handleAddClick} />
<TaskRecommendationModal 
    bind:isOpen={showModal}
    {recommendations}
    category="mind"
    {isLoading}
    on:select={handleSelect}
/>
```

## 🎨 Diseño

### Paleta de colores:
- **Mind (Purple)**: `from-purple-500 to-indigo-600`
- **Body (Orange)**: `from-orange-500 to-red-600`
- **General (Green)**: `from-emerald-500 to-green-600`

### Efectos visuales:
- Gradientes animados en hover
- Efecto de brillo (shine) que atraviesa la tarjeta
- Glow effect cuando está seleccionado
- Animaciones de entrada escalonadas
- Scale en hover

## 🔌 API Endpoints

### GET `/api/tasks/recommendations`
Obtiene 3 recomendaciones generales (mix de mind y body)

**Query params:**
- `use_ai`: boolean (default: false) - Usar AI para recomendaciones

**Response:**
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "key": "string",
      "name": "string",
      "category": "mind|body",
      "desc": "string",
      "reward_xp": 150,
      "default_params": {},
      "suggested_schedule": "2025-10-06T14:00:00",
      "reason": "string",
      "difficulty": 4,
      "estimated_minutes": 45
    }
  ],
  "method": "pattern_based|ai_powered",
  "generated_at": "2025-10-06T10:00:00",
  "task_history_count": 20
}
```

### GET `/api/tasks/recommendations/mind`
Obtiene recomendaciones de tareas mentales

**Query params:**
- `count`: number (default: 3) - Número de recomendaciones
- `use_ai`: boolean (default: false)

### GET `/api/tasks/recommendations/body`
Obtiene recomendaciones de tareas físicas

**Query params:**
- `count`: number (default: 3)
- `use_ai`: boolean (default: false)

## 📱 Responsive

El sistema funciona perfectamente en:
- **Mobile**: Modal full-screen con scroll
- **Tablet**: Grid de 2 columnas
- **Desktop**: Grid de 3 columnas

## ♿ Accesibilidad

- ✅ Navegación completa por teclado
- ✅ ARIA labels y roles
- ✅ Focus visible
- ✅ Escape para cerrar modal
- ✅ Enter/Space para seleccionar
- ✅ Tabindex correcto

## 🚀 Próximas mejoras

- [ ] Animación de "añadido al inventario"
- [ ] Sonidos al seleccionar (opcional)
- [ ] Drag & drop para ordenar
- [ ] Filtros por dificultad/duración
- [ ] Preview detallado de parámetros
- [ ] Guardado de recomendaciones favoritas
- [ ] Historial de recomendaciones rechazadas

## 📝 Notas técnicas

- El modal usa `bind:isOpen` para control bidireccional
- Las animaciones usan `svelte/transition` y `svelte/easing`
- Los eventos usan `createEventDispatcher` de Svelte
- El servicio usa `authenticatedFetch` del authStore
- Las ediciones son locales hasta que se guarde

## 🎮 UX Gamificada

El diseño está inspirado en:
- Cartas de juegos de rol (RPG)
- Interfaces de juegos móviles modernos
- Sistemas de loot boxes (pero éticos 😄)
- Notificaciones de logros

Cada interacción está diseñada para ser satisfactoria y dar feedback inmediato al usuario.
