# Goal Edit Page - Dynamic Route

## Overview
Se ha creado una página dinámica para editar goals individuales con una interfaz moderna y funcional.

## Ruta Creada
`/goals/[id]/+page.svelte` - Ruta dinámica que permite editar cualquier goal por su ID

## Características Implementadas

### 🎨 Diseño Visual
- **Header con gradiente dinámico** que cambia según el tipo de goal (short/medium/long)
- **Barra de progreso visual** con animaciones
- **Tarjetas de estadísticas** mostrando Target, Start Date y End Date
- **Formulario de edición completo** con todos los campos del goal
- **Slider de progreso** interactivo con estilos personalizados
- **Estados visuales** para loading, error y success

### ⚙️ Funcionalidades

#### 1. Navegación
- Click en cualquier card del Timeline redirige a `/goals/{id}`
- Efecto hover en las cards del Timeline (escala y cambio de color)
- Botón "Back" para regresar a la lista de goals

#### 2. Edición de Goal
Campos editables:
- ✅ Title (requerido)
- ✅ Description
- ✅ Type (short/medium/long) - dropdown
- ✅ Status (Active/Inactive) - dropdown
- ✅ Short Description
- ✅ Metric Key (requerido)
- ✅ Target Value (requerido)
- ✅ Progress (slider 0-100%)
- ✅ Start Date (requerido)
- ✅ End Date (opcional)

#### 3. Eliminar Goal
- Botón de eliminación en el header
- Modal de confirmación con advertencia
- Redirige a `/goals` después de eliminar

#### 4. Validaciones
- Campos requeridos validados antes de guardar
- Mensajes de error descriptivos
- Mensajes de éxito temporales

#### 5. Estados de la UI
- **Loading**: Spinner mientras carga el goal
- **Error**: Mensaje si el goal no existe
- **Success**: Confirmación cuando se guarda exitosamente
- **Saving**: Indicador visual durante el guardado
- **Deleting**: Indicador visual durante la eliminación

### 🎯 Sección de Tareas (Placeholder)
Se ha incluido una sección preparada para las tareas que te llevarán a completar el goal:

```svelte
<!-- Tasks Section (Placeholder) -->
<div class="bg-neutral-900 rounded-2xl border border-white/10 p-6">
    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg>...</svg>
        Tasks to Complete
    </h3>
    <div class="text-center py-12">
        <div class="text-6xl mb-4">📝</div>
        <p class="text-white/60 mb-4">Tasks functionality coming soon!</p>
    </div>
</div>
```

Esta sección está lista para integrar los endpoints de tareas cuando los proporciones.

## Cambios en Timeline.svelte
Se modificó el componente Timeline para hacer las cards clickeables:
- Cada card ahora es un enlace `<a href="/goals/{goal.id}">`
- Efectos hover: escala, cambio de border y color del título
- Transiciones suaves

## API Integration

### GET Goal
Obtiene el goal usando `fetchGoals()` y filtrando por ID

### UPDATE Goal
```typescript
PUT /api/goals/{goalId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "type": "short" | "medium" | "long",
  "desc_short": "string",
  "metric_key": "string",
  "target_value": number,
  "progress": "string",
  "is_active": boolean,
  "end_date": "YYYY-MM-DD"
}
```

### DELETE Goal
```typescript
DELETE /api/goals/{goalId}
Authorization: Bearer {token}
```

## Estructura Visual

```
┌─────────────────────────────────────────────┐
│  ← Back to Goals    Goal Name    🗑️ Delete │
├─────────────────────────────────────────────┤
│                                             │
│  ╔═══════════════════════════════════════╗ │
│  ║  GOAL HEADER CARD (Gradient)          ║ │
│  ║  - Type Badge & Status                ║ │
│  ║  - Title & Description                ║ │
│  ║  - Progress Bar                       ║ │
│  ║  - Stats (Target, Start, End)         ║ │
│  ╚═══════════════════════════════════════╝ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ 📝 Goal Details                       │ │
│  │                                       │ │
│  │  [Edit Form with all fields]          │ │
│  │  [Progress Slider]                    │ │
│  │  [Save Changes Button]                │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ ✅ Tasks to Complete                  │ │
│  │                                       │ │
│  │  [Placeholder for tasks]              │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Próximos Pasos (Cuando proporciones los endpoints de tasks)

1. **Obtener tareas del goal**
   - Endpoint: `GET /api/goals/{id}/tasks`
   - Mostrar lista de tareas con su estado

2. **Crear nuevas tareas**
   - Endpoint: `POST /api/goals/{id}/tasks`
   - Formulario para agregar tareas

3. **Completar/Actualizar tareas**
   - Endpoint: `PUT /api/tasks/{taskId}`
   - Checkbox para marcar como completadas

4. **Eliminar tareas**
   - Endpoint: `DELETE /api/tasks/{taskId}`

## Características de Accesibilidad
- ✅ Aria labels en botones
- ✅ Labels descriptivos en formularios
- ✅ Contraste de colores apropiado
- ✅ Estados de focus visibles
- ✅ Navegación con teclado

## Responsive Design
- ✅ Mobile-first approach
- ✅ Grid adaptativo para campos del formulario
- ✅ Padding y márgenes responsivos
- ✅ Tamaños de texto escalables

## Archivos Modificados/Creados
1. ✅ `src/routes/goals/[id]/+page.svelte` - Nueva página dinámica
2. ✅ `src/lib/components/Timeline.svelte` - Cards clickeables con hover effects

¡La página está lista para recibir los endpoints de tareas! 🎉
