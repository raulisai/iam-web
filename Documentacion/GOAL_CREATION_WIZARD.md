# Goal Creation Wizard - Documentación

## Overview
Formulario multi-paso avanzado para crear objetivos (goals) con tareas integradas y recomendaciones IA.

## Características principales

### 🎯 **4 Pasos del Wizard**

#### Paso 0: Selección de Plantilla
- **6 plantillas precargadas** con configuraciones optimizadas
- Categorías: Mente, Aprendizaje, Cuerpo, Habilidades, Hábitos, Custom
- Cada plantilla incluye:
  - Título y descripción
  - Tipo de goal (short/medium/long)
  - Métrica sugerida
  - Valor objetivo
  - Duración en días
  - Icono y categoría
- Vista de selección con cards clickeables y feedback visual

#### Paso 1: Detalles del Goal
- **Formulario completo** con todos los campos del goal:
  - Título (requerido)
  - Descripción larga
  - Tipo visual (Quick Win / Momentum / Epic Quest)
  - Métrica personalizable con sugerencias
  - Valor objetivo numérico
  - Fechas de inicio y fin
- **Sugerencias contextuales** basadas en el tipo de goal
- Validación en tiempo real

#### Paso 2: Gestión de Tareas
- **Recomendaciones IA**:
  - Botón para generar 5 tareas sugeridas
  - Cada recomendación incluye:
    - Título y descripción
    - Prioridad (low/medium/high)
    - Duración estimada
    - Razón de por qué es importante
    - Orden sugerido
  - Un click para agregar tareas recomendadas
  
- **Editor de tareas manual**:
  - Formulario inline para crear/editar tareas
  - Campos: título, descripción, prioridad, duración
  - Drag & drop simulado con botones arriba/abajo
  - Badges de prioridad con colores
  - Iconos de editar/eliminar por tarea
  
- **Lista de tareas activas**:
  - Vista numerada con orden
  - Hover effects para mostrar controles
  - Indicadores visuales de prioridad
  - Contador de tareas agregadas

#### Paso 3: Revisión Final
- **Resumen completo** antes de crear:
  - Todos los detalles del goal
  - Lista de tareas con prioridades
  - Estadísticas (número de tareas, fechas, etc.)
  - Confirmación visual con iconos
- Estado final antes de submit

### 🎨 **Vista Previa Dinámica (Sidebar)**

Panel lateral adaptativo que muestra:

- **En Paso 0**: Detalles de la plantilla seleccionada
- **En Paso 1+**: Preview del goal con:
  - Tipo y métrica
  - Título y descripción
  - Valores objetivo
  - Fechas configuradas
  - Primeras 3 tareas (si existen)
  
- **Tips contextuales** por paso:
  - Paso 0: Info de plantillas
  - Paso 1: Consejos de configuración
  - Paso 2: Explicación de tareas IA
  - Paso 3: Notas finales

### ✨ **Animaciones y Transiciones**

- `fade` en overlay del modal
- `scale` con elastic easing en apertura del modal
- `fly` en cambios de paso (efecto slide-up)
- `slide` en listas de tareas (expand/collapse)
- Hover effects en todos los elementos clickeables
- Badges animados con `scale` y `elasticOut`

### 🎛️ **Componentes Interactivos**

1. **Goal Preset Cards**
   - Selección visual con check animado
   - Hover scales
   - Bordered highlight en selección

2. **Type Selection Buttons**
   - 3 cards con gradientes por tipo
   - Active state con gradiente de fondo
   - Responsive grid

3. **Task Recommendation Panel**
   - Loading state con spinner
   - Cards expandibles
   - Botón de agregar por tarea
   - Razón de la sugerencia en italic

4. **Task List Management**
   - New task form inline
   - Edit/delete buttons con iconos SVG
   - Move up/down controls
   - Priority badges con colores

5. **Progress Bar**
   - Gradient animado
   - Porcentaje dinámico
   - Step indicators

### 📦 **Datos y Estado**

```typescript
// Goal Form Data
{
  title: string;
  description: string;
  type: 'short' | 'medium' | 'long';
  desc_short: string;
  metric_key: string;
  target_value: string;
  start_date: string;
  end_date: string;
}

// Task Data
{
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimated_duration: string;
  type?: string;
  required?: boolean;
  weight?: number;
  order?: number;
  reason?: string; // Solo para recomendaciones
}
```

### 🔄 **Flujo de Creación**

1. Usuario abre formulario (FAB button)
2. Selecciona plantilla o custom (Paso 0)
3. Personaliza detalles del goal (Paso 1)
4. Genera recomendaciones IA o agrega tareas manualmente (Paso 2)
5. Revisa resumen completo (Paso 3)
6. Confirma y crea goal con todas las tareas

### 🚀 **Integración API**

#### Endpoints utilizados:

- `POST /api/goals/` - Crear goal
- `POST /api/goals/{goal_id}/tasks` - Crear cada tarea
- `GET /api/goals/{goal_id}/recommendations` - Obtener recomendaciones IA (pendiente)

#### Flujo de submit:
1. Crear goal primero
2. Con el `goal_id` recibido, crear todas las tareas en paralelo
3. Actualizar UI con el nuevo goal
4. Resetear formulario

### 🎯 **Mejoras Futuras**

- [ ] Conectar endpoint real de recomendaciones IA
- [ ] Drag & drop real para reordenar tareas
- [ ] Templates guardados por usuario
- [ ] Preview de métricas con gráficas
- [ ] Validación de fechas más avanzada
- [ ] Auto-save en localStorage
- [ ] Import/export de goals con tareas
- [ ] Duplicar goals existentes

### 🎨 **Paleta de Colores por Tipo**

- **Short (Quick Win)**: Sky → Indigo (`from-sky-500 to-indigo-500`)
- **Medium (Momentum)**: Purple → Fuchsia (`from-purple-500 to-fuchsia-500`)
- **Long (Epic Quest)**: Amber → Orange (`from-amber-500 to-orange-500`)

### 📱 **Responsividad**

- Modal se adapta de fullscreen (mobile) a max-width (desktop)
- Grid de 1 columna en mobile, 2 en desktop
- Sidebar oculto en mobile
- Cards apiladas en mobile, grid en desktop
- Scroll interno en el modal para contenido largo

## Archivos Creados/Modificados

1. **`src/lib/services/goalTasks.ts`** - Nuevo servicio para tareas
2. **`src/routes/goals/AddGoalForm.svelte`** - Wizard completo
3. **`src/routes/goals/+page.svelte`** - Handler de submit actualizado

## Testing Checklist

- [ ] Crear goal desde cada plantilla
- [ ] Crear goal custom desde cero
- [ ] Generar recomendaciones IA
- [ ] Agregar tareas manualmente
- [ ] Editar tareas existentes
- [ ] Reordenar tareas (up/down)
- [ ] Eliminar tareas
- [ ] Validación de campos requeridos
- [ ] Preview actualizado en cada paso
- [ ] Navegación entre pasos
- [ ] Submit final con tareas
- [ ] Responsive en mobile
- [ ] Animaciones suaves
