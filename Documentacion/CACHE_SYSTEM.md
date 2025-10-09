# Sistema de Caché y Stores - IAM Web

## 📦 Sistema de Caché

El proyecto ahora incluye un sistema de caché completo que permite:

1. **Mostrar datos instantáneamente** desde caché mientras se cargan datos frescos del backend
2. **Persistencia en localStorage** con expiración automática (30 minutos)
3. **Actualizaciones inteligentes** que solo refrescan datos cuando es necesario
4. **Fallback a caché** si las peticiones al backend fallan

### Estructura de Stores

```
src/lib/stores/
├── cache.svelte.ts       # Sistema de caché genérico
├── auth.svelte.ts        # Autenticación (ya existía)
├── goals.svelte.ts       # Store de goals con caché
├── tasks.svelte.ts       # Store de tasks con caché
└── toast.svelte.ts       # Notificaciones (ya existía)
```

## 🎯 Goals Store

### Uso Básico

```typescript
import { initializeGoalsStore } from '$lib/stores/goals.svelte';

const goalsStore = initializeGoalsStore();

// Los datos se cargan automáticamente desde caché al inicializar
// Luego puedes refrescarlos:
await goalsStore.fetchAll(); // Usa caché si es reciente
await goalsStore.fetchAll(true); // Fuerza actualización

// Acceso reactivo a los datos
const goals = $derived(goalsStore.goals);
const isLoading = $derived(goalsStore.isLoading);
```

### Métodos Disponibles

```typescript
// Obtener todos los goals
await goalsStore.fetchAll(forceRefresh?: boolean)

// Obtener goal por ID
const goal = goalsStore.getById(id: string)

// Crear goal
await goalsStore.create(goalData: any)

// Actualizar goal
await goalsStore.update(id: string, goalData: Partial<Goal>)

// Eliminar goal
await goalsStore.remove(id: string)

// Filtros útiles
const shortTermGoals = goalsStore.getByType('short')
const activeGoals = goalsStore.getActive()

// Estadísticas
const stats = goalsStore.getStats()
// { total, active, completed, avgProgress }
```

## ✅ Tasks Store

### Uso Básico

```typescript
import { initializeTasksStore } from '$lib/stores/tasks.svelte';

const tasksStore = initializeTasksStore();

// Cargar tasks de un goal específico
await tasksStore.fetchForGoal(goalId);

// Acceso reactivo
const tasks = $derived(tasksStore.getForGoal(goalId));
const completedIds = $derived(tasksStore.completedTaskIds);
```

### Métodos Disponibles

```typescript
// Obtener tasks de un goal
await tasksStore.fetchForGoal(goalId: string, forceRefresh?: boolean)

// Obtener tasks desde memoria
const tasks = tasksStore.getForGoal(goalId: string)

// Verificar si está completada
const isCompleted = tasksStore.isCompleted(taskId: string)

// Obtener solo incompletas
const incomplete = tasksStore.getIncompleteForGoal(goalId: string)

// Crear task
await tasksStore.create(goalId: string, taskData: GoalTask)

// Actualizar task
await tasksStore.update(goalId: string, taskId: string, taskData: Partial<GoalTask>)

// Eliminar task
await tasksStore.remove(goalId: string, taskId: string)

// Marcar como completada
await tasksStore.complete(goalId: string, taskId: string, notes?: string)

// Obtener estadísticas
const stats = tasksStore.getGoalStats(goalId)
// { total, completed, remaining, progress }
```

## 🔄 Flujo de Datos con Caché

### Patrón de Carga

1. **Inicialización**: Al crear el store, los datos se cargan automáticamente desde caché
2. **Visualización Inmediata**: El usuario ve datos instantáneamente
3. **Actualización en Background**: Se hace fetch al backend
4. **Actualización UI**: Los datos frescos reemplazan al caché

### Ejemplo Completo

```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import { initializeGoalsStore } from '$lib/stores/goals.svelte';
    import { initializeTasksStore } from '$lib/stores/tasks.svelte';

    const goalsStore = initializeGoalsStore();
    const tasksStore = initializeTasksStore();

    // Datos reactivos - se actualizan automáticamente
    const goals = $derived(goalsStore.goals);
    const isLoading = $derived(goalsStore.isLoading);
    const stats = $derived(goalsStore.getStats());

    onMount(async () => {
        // Esto mostrará caché primero, luego actualizará
        await goalsStore.fetchAll();
    });
</script>

{#if goals.length > 0}
    <!-- Los datos del caché se muestran inmediatamente -->
    {#each goals as goal}
        <GoalCard {goal} />
    {/each}
{/if}

{#if isLoading}
    <LoadingSpinner />
{/if}
```

## 📁 Reorganización de Componentes

### Componentes Compartidos
Ubicación: `src/lib/components/`

Componentes que se usan en múltiples rutas:
- `NavBar.svelte`
- `MobileMenu.svelte`
- `StatsCard.svelte`
- `HealthBar.svelte`
- `ProgressRing.svelte`
- etc.

### Componentes de Goals
Ubicación: `src/lib/components/goals/`

Componentes específicos de la funcionalidad de goals:
- `GoalHeader.svelte`
- `ProgressBar.svelte`
- `TaskCard.svelte`
- `RecommendationCard.svelte`

### Componentes de Ruta Específicos
Ubicación: `src/routes/[ruta]/components/`

Ejemplo: `src/routes/goals/components/`
- Componentes que solo se usan en esa ruta específica
- Mantener cohesión de código por característica

## 🚀 Ventajas del Sistema

### Performance
- ⚡ **Carga instantánea**: Los usuarios ven datos inmediatamente
- 🔄 **Menos peticiones**: Solo se actualiza cuando es necesario
- 📦 **Offline-first**: Funciona sin conexión usando caché

### Experiencia de Usuario
- ✨ **Sin pantallas en blanco**: Siempre hay algo que mostrar
- 🎯 **Feedback visual**: Loading states solo para actualizaciones
- 💪 **Resiliente**: Si falla el backend, usa caché

### Desarrollo
- 🧩 **Código más limpio**: Lógica centralizada en stores
- 🔧 **Fácil mantenimiento**: Un solo lugar para cambiar lógica
- 🧪 **Testeable**: Stores independientes y aislados

## 🔧 Cache Manager

### API del Cache Manager

```typescript
import { CacheManager } from '$lib/stores/cache.svelte';

// Guardar datos
CacheManager.set('key', data);

// Obtener datos
const data = CacheManager.get<Type>('key');

// Verificar existencia
if (CacheManager.has('key')) { ... }

// Obtener edad del caché
const age = CacheManager.getAge('key'); // en milisegundos

// Eliminar item
CacheManager.remove('key');

// Limpiar todo el caché
CacheManager.clear();
```

### Configuración

El caché expira automáticamente después de **30 minutos**. Puedes cambiar esto en `cache.svelte.ts`:

```typescript
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutos
```

## 📝 Migración de Código Existente

### Antes (sin stores)

```svelte
<script lang="ts">
    import { fetchGoals } from '$lib/services/goals';
    import { getAuthStore } from '$lib/stores/auth.svelte';

    const authStore = getAuthStore();
    let goals = $state([]);
    let isLoading = $state(true);

    async function loadGoals() {
        const token = authStore.getToken();
        goals = await fetchGoals(token);
        isLoading = false;
    }

    onMount(loadGoals);
</script>
```

### Después (con stores)

```svelte
<script lang="ts">
    import { initializeGoalsStore } from '$lib/stores/goals.svelte';

    const goalsStore = initializeGoalsStore();
    
    // Datos reactivos automáticamente
    const goals = $derived(goalsStore.goals);
    const isLoading = $derived(goalsStore.isLoading);

    onMount(() => goalsStore.fetchAll());
</script>
```

## 🐛 Debugging

### Ver estado del caché

```javascript
// En la consola del navegador
console.log(localStorage);

// Ver solo caché de IAM
Object.keys(localStorage)
    .filter(k => k.startsWith('iam_cache_'))
    .forEach(k => console.log(k, localStorage.getItem(k)));
```

### Limpiar caché manualmente

```javascript
// En la consola del navegador
import { CacheManager } from './src/lib/stores/cache.svelte';
CacheManager.clear();
```

## 🔐 Seguridad

- ⚠️ **No cachees datos sensibles**: El caché usa localStorage (sin cifrado)
- 🔄 **Los tokens NO se cachean**: Se manejan por el auth store
- ⏰ **Expiración automática**: Los datos viejos se eliminan automáticamente

## 📚 Próximos Pasos

1. Implementar stores para otras entidades (profile, tasks mind/body, etc.)
2. Agregar sincronización en background
3. Implementar estrategias de cache más avanzadas (LRU, etc.)
4. Agregar métricas de performance del caché
