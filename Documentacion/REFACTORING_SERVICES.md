# Refactorización de Servicios y Tipos

## 📁 Nueva Estructura

La estructura del proyecto ha sido reorganizada para mejorar la modularidad y reutilización del código:

```
src/lib/
├── types/              # 🆕 Interfaces y tipos TypeScript
│   ├── index.ts       # Re-exporta todos los tipos
│   ├── auth.ts        # Tipos de autenticación
│   ├── task.ts        # Tipos de tareas
│   ├── goal.ts        # Tipos de objetivos
│   ├── failure.ts     # Tipos de fallos
│   ├── profile.ts     # Tipos de perfil
│   └── chat.ts        # Tipos de chat
│
└── services/          # Servicios de API
    ├── tasks.ts       # ⚠️ Compatibilidad hacia atrás (deprecated)
    ├── tasks_common.ts  # 🆕 Utilidades comunes de tareas
    ├── tasks_mind.ts    # 🆕 Servicios para tareas mentales
    ├── tasks_body.ts    # 🆕 Servicios para tareas corporales
    ├── goals.ts       # ✅ Actualizado para usar tipos
    ├── failures.ts    # ✅ Actualizado para usar tipos
    ├── profile.ts     # ✅ Actualizado para usar tipos
    └── chat.ts        # ✅ Actualizado para usar tipos
```

## 🎯 Cambios Principales

### 1. Separación de Tipos
Todas las interfaces han sido movidas a `src/lib/types/` para ser reutilizables:

```typescript
// Antes
import { Task } from '$lib/services/tasks';

// Ahora
import type { Task } from '$lib/types';
// o
import type { Task } from '$lib/types/task';
```

### 2. Separación de Servicios de Tareas

**Antes:** Un solo archivo `tasks.ts` con todas las funciones mezcladas.

**Ahora:**
- **`tasks_mind.ts`**: Funciones específicas para tareas mentales
  - `getMindTasks()`
  - `getMindTaskDetail()`
  - `updateMindTask()`
  - `completeMindTask()`

- **`tasks_body.ts`**: Funciones específicas para tareas corporales
  - `getBodyTasks()`
  - `getBodyTaskDetail()`
  - `updateBodyTask()`
  - `completeBodyTask()`

- **`tasks_common.ts`**: Utilidades compartidas
  - `getIconForCategory()`
  - `mapTaskData()`

- **`tasks.ts`**: Mantiene compatibilidad hacia atrás (marcado como deprecated)

## 📝 Cómo Migrar

### Código Antiguo (aún funciona, pero deprecated)
```typescript
import { getTaskDetail, updateTask, completeTask } from '$lib/services/tasks';

const task = await getTaskDetail(authStore, taskId, 'mind');
await updateTask(authStore, taskId, payload, 'mind');
await completeTask(authStore, taskId, 'mind');
```

### Código Nuevo (recomendado)
```typescript
// Para tareas mentales
import {
    getMindTaskDetail,
    updateMindTask,
    completeMindTask
} from '$lib/services/tasks_mind';

const task = await getMindTaskDetail(authStore, taskId);
await updateMindTask(authStore, taskId, payload);
await completeMindTask(authStore, taskId);

// Para tareas corporales
import {
    getBodyTaskDetail,
    updateBodyTask,
    completeBodyTask
} from '$lib/services/tasks_body';

const task = await getBodyTaskDetail(authStore, taskId);
await updateBodyTask(authStore, taskId, payload);
await completeBodyTask(authStore, taskId);
```

### Importar Tipos
```typescript
// Todos los tipos desde un solo lugar
import type {
    Task,
    TaskDetail,
    UpdateTaskPayload,
    Goal,
    CreateGoalData,
    Failure,
    CreateFailurePayload,
    UserProfile,
    ChatSession,
    ChatMessage,
    AuthStore
} from '$lib/types';

// O importar tipos específicos
import type { Task, TaskDetail } from '$lib/types/task';
import type { Goal, CreateGoalData } from '$lib/types/goal';
```

## ✅ Beneficios

1. **Separación de Responsabilidades**: Cada archivo tiene un propósito claro
2. **Reutilización**: Las interfaces pueden usarse en cualquier parte del proyecto
3. **Mantenibilidad**: Más fácil encontrar y modificar código específico
4. **Type Safety**: Mejor autocompletado y verificación de tipos en TypeScript
5. **Tree Shaking**: Mejor optimización del bundle final
6. **Escalabilidad**: Más fácil agregar nuevos tipos de tareas o servicios

## 🔄 Compatibilidad

El código antiguo seguirá funcionando gracias a las funciones de compatibilidad en `tasks.ts`, pero se recomienda migrar gradualmente al nuevo enfoque.

## 📚 Próximos Pasos

1. Actualizar los componentes para usar los nuevos servicios específicos
2. Remover gradualmente las importaciones del archivo `tasks.ts` deprecated
3. Considerar aplicar el mismo patrón a otros servicios si crecen en complejidad

## 💡 Mejores Prácticas

```typescript
// ✅ BIEN: Importar tipos con 'type'
import type { Task } from '$lib/types';

// ✅ BIEN: Usar servicios específicos
import { getMindTasks } from '$lib/services/tasks_mind';

// ⚠️ EVITAR: Usar el servicio deprecated
import { getTaskDetail } from '$lib/services/tasks';

// ❌ MAL: Importar tipos como valores
import { Task } from '$lib/types';
```

---

**Fecha de Refactorización:** Octubre 2025  
**Mantenedor:** @raulisai
