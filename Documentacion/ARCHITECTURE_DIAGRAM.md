# Arquitectura de Servicios y Tipos

## 📊 Estructura Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    APLICACIÓN SVELTE                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Pages/     │  │  Components/ │  │   Stores/    │    │
│  │   Routes     │  │              │  │              │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                            │                               │
└────────────────────────────┼───────────────────────────────┘
                             │
                ┌────────────▼────────────┐
                │    IMPORTACIONES        │
                └────────────┬────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
┌─────────▼─────────┐              ┌───────────▼───────────┐
│  $lib/types/      │              │  $lib/services/       │
│  ================  │              │  ==================   │
│                   │              │                       │
│  • index.ts  ◄────┼──────────────┼─────┐                │
│  • auth.ts        │              │     │                │
│  • task.ts        │  TYPE IMPORT │     │ FUNCTION       │
│  • goal.ts        │◄─────────────┼─────┤ CALLS          │
│  • failure.ts     │              │     │                │
│  • profile.ts     │              │     │                │
│  • chat.ts        │              │     │                │
└───────────────────┘              │     │                │
                                   │  • tasks_mind.ts     │
                                   │  • tasks_body.ts     │
                                   │  • tasks_common.ts   │
                                   │  • goals.ts          │
                                   │  • failures.ts       │
                                   │  • profile.ts        │
                                   │  • chat.ts           │
                                   │  • speech.ts         │
                                   │  • index.ts          │
                                   └──────────┬───────────┘
                                              │
                                   ┌──────────▼───────────┐
                                   │    API CALLS         │
                                   │  (BACKEND_URL)       │
                                   └──────────────────────┘
```

## 🔄 Flujo de Importación

### Patrón Nuevo (Recomendado)

```typescript
// 1. Importar tipos desde $lib/types
import type { Task, TaskDetail, AuthStore } from '$lib/types';

// 2. Importar servicios específicos
import { getMindTasks, updateMindTask } from '$lib/services/tasks_mind';
import { getBodyTasks, updateBodyTask } from '$lib/services/tasks_body';

// 3. Usar en el código
const tasks: Task[] = await getMindTasks(authStore);
const updated: TaskDetail | null = await updateMindTask(authStore, id, payload);
```

### Patrón Alternativo (Index)

```typescript
// Importar desde el index centralizado
import type { Task, TaskDetail } from '$lib/types';
import { getMindTasks, getBodyTasks } from '$lib/services';

const mindTasks = await getMindTasks(authStore);
const bodyTasks = await getBodyTasks(authStore);
```

## 🎯 Separación de Responsabilidades

### Tipos (`/types`)
**Responsabilidad:** Definir la estructura de datos  
**No contiene:** Lógica de negocio, llamadas API  
**Exporta:** Interfaces, Types, Enums

```typescript
// ✅ CORRECTO en types/
export interface Task {
    id: string;
    title: string;
    // ...
}

// ❌ INCORRECTO en types/
export async function getTasks() { /* ... */ }
```

### Servicios (`/services`)
**Responsabilidad:** Lógica de API y transformación de datos  
**No contiene:** Definiciones de tipos complejas  
**Exporta:** Funciones async, utilidades

```typescript
// ✅ CORRECTO en services/
export async function getMindTasks(authStore: AuthStore): Promise<Task[]> {
    // lógica de API
}

// ❌ INCORRECTO en services/
export interface Task { /* ... */ }
```

## 📦 Organización por Dominio

```
Domain: TASKS
├── Types:        $lib/types/task.ts
├── Services:     
│   ├── $lib/services/tasks_mind.ts    (Mind-specific)
│   ├── $lib/services/tasks_body.ts    (Body-specific)
│   └── $lib/services/tasks_common.ts  (Shared utilities)
└── Components:   src/routes/tasks/*, src/routes/minde/*, src/routes/body/*

Domain: GOALS
├── Types:        $lib/types/goal.ts
├── Services:     $lib/services/goals.ts
└── Components:   src/routes/goals/*

Domain: FAILURES
├── Types:        $lib/types/failure.ts
├── Services:     $lib/services/failures.ts
└── Components:   src/routes/failures/*

Domain: PROFILE
├── Types:        $lib/types/profile.ts
├── Services:     $lib/services/profile.ts
└── Components:   src/routes/profile/*

Domain: CHAT
├── Types:        $lib/types/chat.ts
├── Services:     $lib/services/chat.ts
└── Components:   src/routes/assistant/*
```

## 🔀 Comparación: Antes vs Después

### ANTES (Monolítico)
```
services/tasks.ts (200+ líneas)
├── interface Task
├── interface TaskDetail
├── interface UpdateTaskPayload
├── interface AuthStore
├── getMindTasks()
├── getBodyTasks()
├── getTaskDetail()
├── updateTask()
├── completeTask()
└── getIconForCategory()
```

### DESPUÉS (Modular)
```
types/task.ts
├── interface Task
├── interface TaskDetail
├── interface UpdateTaskPayload
└── type TaskType

types/auth.ts
└── interface AuthStore

services/tasks_common.ts
├── getIconForCategory()
└── mapTaskData()

services/tasks_mind.ts
├── getMindTasks()
├── getMindTaskDetail()
├── updateMindTask()
└── completeMindTask()

services/tasks_body.ts
├── getBodyTasks()
├── getBodyTaskDetail()
├── updateBodyTask()
└── completeBodyTask()

services/tasks.ts (compatibility layer)
└── Wrappers deprecated
```

## 📈 Beneficios Cuantificables

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Líneas por archivo (avg) | ~200 | ~80 | 60% ↓ |
| Archivos de tipos | 0 | 6 | +6 |
| Reutilización de tipos | Baja | Alta | ↑↑ |
| Separación de dominios | No | Sí | ✅ |
| Tree-shaking | Limitado | Óptimo | ↑ |
| Mantenibilidad | Media | Alta | ↑↑ |

## 🎨 Convenciones de Nomenclatura

```typescript
// Archivos de tipos: sustantivos singulares
task.ts, goal.ts, failure.ts

// Archivos de servicios: sustantivos plurales o específicos
tasks_mind.ts, tasks_body.ts, goals.ts

// Interfaces: PascalCase
Task, TaskDetail, CreateGoalData

// Funciones de servicio: verbNounSpecifier
getMindTasks, updateBodyTask, createGoal

// Utilidades: verbNoun
getIconForCategory, mapTaskData
```

---

**Este diagrama ayuda a entender:**
- 🎯 Separación clara entre tipos y lógica
- 🔄 Flujo de datos en la aplicación
- 📦 Organización por dominios
- ✅ Mejores prácticas de arquitectura
