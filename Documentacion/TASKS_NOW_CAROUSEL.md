# Tasks Now Carousel - Guía Rápida

## 📋 Descripción
Componente de carrusel horizontal que muestra las tareas optimizadas para el tiempo restante del día. Utiliza el endpoint `/api/time-optimizer/tasks-now` para obtener un horario inteligente que maximiza la utilización del tiempo disponible.

## 🎯 Características

### Visualización
- **Carrusel horizontal** con scroll suave
- **Botones de navegación** (izquierda/derecha) que aparecen al hover
- **Snap points** para alineación perfecta de tarjetas
- **Indicadores de scroll** en vista móvil
- **Altura ajustable** mediante prop

### Información Mostrada
- ⚡ **Estadísticas compactas**: Utilización, tareas por tipo (Goal, Mind, Body)
- 🎯 **Tarjetas de tareas** con:
  - Tipo de tarea con icono y color distintivo
  - Hora de inicio y fin
  - Título y descripción
  - Duración estimada
  - Objetivo asociado (para tareas tipo goal)
  - Badges de urgencia (para deadlines cercanos)
  - Nivel de prioridad visual

### Tipos de Tareas
- **🎯 Goal**: Tareas relacionadas con objetivos (azul)
- **🧠 Mind**: Tareas de desarrollo mental (púrpura)
- **💪 Body**: Tareas de bienestar físico (naranja)

## 📦 Archivos del Sistema

### Componente Principal
```
src/lib/components/TasksNowCarousel.svelte
```

### Servicio
```
src/lib/services/time-optimizer.ts
src/lib/services/time-optimizer.mock.ts (datos de prueba)
```

### Tipos
```
src/lib/types/time-optimizer.ts
```

## 🚀 Uso

### Importación
```svelte
import TasksNowCarousel from "$lib/components/TasksNowCarousel.svelte";
import { getAuthContext } from "$lib/stores/auth.svelte";
```

### Uso Básico
```svelte
<TasksNowCarousel 
    token={getAuthContext().getToken() ?? ''} 
/>
```

### Con Opciones
```svelte
<TasksNowCarousel 
    token={getAuthContext().getToken() ?? ''} 
    carouselHeight="420px"
    onTaskClick={(task) => {
        // Manejar click en tarea
        if (task.type === 'goal') goto(`/goals/${task.task_id}`);
        else if (task.type === 'mind') goto('/minde');
        else if (task.type === 'body') goto('/body');
    }}
/>
```

## 🎨 Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `token` | `string` | ✅ | - | Token JWT de autenticación |
| `carouselHeight` | `string` | ❌ | `"400px"` | Altura del carrusel |
| `onTaskClick` | `(task: TaskNow) => void` | ❌ | - | Callback al hacer click en una tarea |

## 🔌 API Endpoint

### Request
```bash
GET /api/time-optimizer/tasks-now
Authorization: Bearer {token}
```

### Response
```typescript
{
  body_tasks: TaskNow[];          // Tareas de Body
  goal_tasks: TaskNow[];          // Tareas de Goals
  mind_tasks: TaskNow[];          // Tareas de Mind
  
  // Información de tiempo
  current_time: string;           // Hora actual ISO
  remaining_minutes_today: number;// Minutos restantes hoy
  remaining_hours_today: number;  // Horas restantes hoy
  
  // Estadísticas
  total_scheduled_tasks: number;  // Total de tareas programadas
  total_available_tasks: number;  // Total de tareas disponibles
  utilization_percentage: number; // % de utilización del tiempo
  
  // Totales por tipo
  total_body_tasks: number;
  total_goal_tasks: number;
  total_mind_tasks: number;
  
  // Información del usuario
  user_id: string;
  is_working_day: boolean;        // Si es día laboral
  available_hours_today: number;  // Horas disponibles
  work_hours_today: number;       // Horas de trabajo
  time_dead: number;              // Tiempo no disponible
  
  message: string;                // Mensaje de resumen
}
```

### TaskNow Type
```typescript
interface TaskNow {
  id: string;                      // ID de la instancia
  task_id: string;                 // ID de la tarea original
  title: string;                   // Título
  description: string;             // Descripción
  type: 'body' | 'mind' | 'goal'; // Tipo
  
  // Tiempos
  start_time: string;              // Hora de inicio (ISO)
  end_time: string;                // Hora de fin (ISO)
  estimated_duration_minutes: number;
  time_slot: 'morning' | 'afternoon' | 'evening';
  
  // Prioridad
  priority_score: number;          // Score de prioridad
  urgency_multiplier: number;      // Multiplicador de urgencia
  status: string;                  // Estado de la tarea
  
  // Campos específicos de Goal
  goal_title?: string;             // Título del objetivo
  goal_deadline?: string;          // Deadline del objetivo
  days_until_deadline?: number;    // Días hasta el deadline
  weight?: number;                 // Peso del objetivo
}
```

## 💡 Algoritmo de Optimización

El backend utiliza un algoritmo inteligente que:

1. **Calcula tiempo disponible**: 
   - Tiempo total del día - horas de trabajo - tiempo muerto
   
2. **Prioriza tareas**:
   - Goals con deadline cercano (mayor prioridad)
   - Tareas con alto priority_score
   - Tareas con urgency_multiplier > 1

3. **Optimiza utilización**:
   - Objetivo: 85-95% de utilización del tiempo
   - Incluye buffers de 10 minutos entre tareas
   - Respeta slots de tiempo (morning, afternoon, evening)

4. **Balancea tipos**:
   - Distribuye tareas de Body, Mind y Goal
   - Asegura variedad en el horario

## 🎯 Integración en Dashboard

El componente está integrado en el dashboard principal (`src/routes/+page.svelte`):

- **Vista Móvil**: Arriba del contenido, después del header
- **Vista Desktop**: Después del header, antes del grid principal

## 📱 Responsive Design

- **Mobile**: 
  - Tarjetas de 320px de ancho
  - Altura de 350px
  - Indicadores de scroll visibles
  
- **Desktop**: 
  - Tarjetas de 384px de ancho
  - Altura de 420px
  - Botones de navegación al hover

## 🎨 Personalización

### Cambiar Altura
```svelte
<TasksNowCarousel 
    token={token} 
    carouselHeight="500px"  <!-- Más alto -->
/>
```

### Cambiar Colores
Los colores se definen en `src/lib/services/time-optimizer.ts`:
```typescript
const TASK_TYPE_CONFIGS = {
  goal: { /* azul */ },
  mind: { /* púrpura */ },
  body: { /* naranja */ }
}
```

## 🔄 Estados del Componente

1. **Loading**: Spinner con icono ⚡
2. **Error**: Mensaje de error con botón de retry
3. **Empty**: "No hay tareas programadas"
4. **Success**: Carrusel con tareas

## 📊 Métricas Mostradas

- **📊 Utilización**: Porcentaje de tiempo utilizado
- **🎯 Objetivos**: Número de tareas de goals
- **🧠 Desarrollo**: Número de tareas de mind
- **💪 Bienestar**: Número de tareas de body

## 🐛 Debugging

### Problema: 404 Not Found
**Solución**: Verificar que el backend esté corriendo y el endpoint sea `/api/time-optimizer/tasks-now`

### Problema: No se muestran tareas
**Solución**: 
1. Verificar que el token sea válido
2. Revisar que haya tareas disponibles en el backend
3. Comprobar la consola del navegador

### Problema: El carrusel no se desplaza
**Solución**: Verificar que haya múltiples tareas (más de las que caben en pantalla)

## 🎓 Ejemplos de Uso

### En una página de perfil
```svelte
<div class="section">
  <h2>Tus Tareas Optimizadas</h2>
  <TasksNowCarousel token={$user.token} carouselHeight="400px" />
</div>
```

### En un widget lateral
```svelte
<aside class="sidebar">
  <TasksNowCarousel 
    token={$user.token} 
    carouselHeight="300px"
    onTaskClick={(task) => showTaskDetails(task)}
  />
</aside>
```

## 📄 Licencia y Créditos

Desarrollado para el sistema IAM Web
Utiliza SvelteKit 5 con Runes Mode
Estilos con Tailwind CSS
