# 📚 Documentación del Proyecto IAM-Web

Bienvenido a la documentación completa del proyecto IAM-Web. Esta carpeta contiene guías, referencias y documentación técnica para desarrolladores.

## 📋 Índice de Documentación

### 🏗️ Arquitectura y Refactorización
- **[REFACTORING_SERVICES.md](./REFACTORING_SERVICES.md)** - Guía completa de la refactorización de servicios y tipos
- **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** - Diagramas visuales de la arquitectura del proyecto
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Guía paso a paso para migrar código existente

### 💻 Ejemplos de Código
- **[USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)** - Ejemplos prácticos de uso de servicios y tipos

### �️ Herramientas y Referencias
- **[COMMANDS.md](./COMMANDS.md)** - Comandos útiles y scripts de PowerShell
- **[CHECKLIST.md](./CHECKLIST.md)** - Lista de tareas de implementación y migración
- **[SUMMARY.md](./SUMMARY.md)** - Resumen ejecutivo de las mejoras

### �🔐 Características del Sistema
- **[AUTH_README.md](./AUTH_README.md)** - Sistema de autenticación
- **[PROFILE_README.md](./PROFILE_README.md)** - Gestión de perfiles de usuario
- **[GOALS_INTEGRATION.md](./GOALS_INTEGRATION.md)** - Integración del sistema de objetivos
- **[GOAL_EDIT_PAGE.md](./GOAL_EDIT_PAGE.md)** - Página de edición de objetivos
- **[VOICE_ASSISTANT_README.md](./VOICE_ASSISTANT_README.md)** - Asistente de voz

## 🎯 Inicio Rápido

### Para Nuevos Desarrolladores

1. **Lee primero:**
   - [REFACTORING_SERVICES.md](./REFACTORING_SERVICES.md) - Entender la estructura del proyecto
   - [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) - Visualizar la arquitectura

2. **Revisa los ejemplos:**
   - [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Ver código real en acción

3. **Si vas a modificar código existente:**
   - [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Guía de migración

### Para Desarrolladores Existentes

Si ya trabajabas en el proyecto antes de la refactorización (Octubre 2025):
1. Lee [REFACTORING_SERVICES.md](./REFACTORING_SERVICES.md) - Cambios importantes
2. Consulta [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Actualiza tu código
3. Usa [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Nuevos patrones

## 📁 Estructura del Proyecto

```
iam-web/
├── src/
│   ├── lib/
│   │   ├── types/          # 🆕 Interfaces TypeScript reutilizables
│   │   │   ├── index.ts
│   │   │   ├── auth.ts
│   │   │   ├── task.ts
│   │   │   ├── goal.ts
│   │   │   ├── failure.ts
│   │   │   ├── profile.ts
│   │   │   └── chat.ts
│   │   │
│   │   ├── services/       # Servicios de API
│   │   │   ├── index.ts
│   │   │   ├── tasks_mind.ts     # 🆕 Tareas mentales
│   │   │   ├── tasks_body.ts     # 🆕 Tareas corporales
│   │   │   ├── tasks_common.ts   # 🆕 Utilidades comunes
│   │   │   ├── tasks.ts          # ⚠️ Deprecated
│   │   │   ├── goals.ts          # ✅ Actualizado
│   │   │   ├── failures.ts       # ✅ Actualizado
│   │   │   ├── profile.ts        # ✅ Actualizado
│   │   │   ├── chat.ts           # ✅ Actualizado
│   │   │   └── speech.ts
│   │   │
│   │   ├── components/     # Componentes Svelte
│   │   └── stores/         # Stores reactivos
│   │
│   └── routes/             # Páginas y rutas
│
└── Documentacion/          # 📚 Esta carpeta
```

## 🔑 Conceptos Clave

### Separación de Tipos y Lógica

```typescript
// ✅ CORRECTO: Importar tipos desde $lib/types
import type { Task, AuthStore } from '$lib/types';
import { getMindTasks } from '$lib/services/tasks_mind';

// ❌ INCORRECTO: Mezclar importaciones
import { Task, getMindTasks } from '$lib/services/tasks';
```

### Servicios Específicos vs Genéricos

```typescript
// ✅ NUEVO: Usar servicios específicos (recomendado)
import { getMindTasks } from '$lib/services/tasks_mind';
import { getBodyTasks } from '$lib/services/tasks_body';

// ⚠️ ANTIGUO: Funciones genéricas (deprecated)
import { getTaskDetail } from '$lib/services/tasks';
const task = await getTaskDetail(authStore, id, 'mind');
```

## 🎨 Convenciones de Código

### Nomenclatura de Archivos

- **Tipos:** Sustantivos singulares (`task.ts`, `goal.ts`)
- **Servicios:** Sustantivos plurales o específicos (`tasks_mind.ts`, `goals.ts`)
- **Componentes:** PascalCase (`TaskList.svelte`)

### Nomenclatura de Código

- **Interfaces:** PascalCase (`Task`, `TaskDetail`)
- **Funciones:** camelCase con verbo (`getMindTasks`, `updateBodyTask`)
- **Constantes:** UPPER_SNAKE_CASE (`BACKEND_URL`)

## 🧪 Testing

```typescript
// Ejemplo de test con los nuevos tipos
import { expect, test } from 'vitest';
import type { Task } from '$lib/types';
import { mapTaskData } from '$lib/services/tasks_common';

test('mapTaskData transforma correctamente', () => {
  const rawTask = {
    id: '123',
    task_templates: {
      name: 'Test Task',
      estimated_minutes: 30,
      // ...
    }
  };
  
  const mapped: Task = mapTaskData(rawTask);
  expect(mapped.id).toBe('123');
  expect(mapped.title).toBe('Test Task');
});
```

## 📝 Contribuir

### Antes de hacer cambios:

1. ✅ Lee la documentación relevante
2. ✅ Sigue las convenciones establecidas
3. ✅ Usa los tipos definidos en `$lib/types`
4. ✅ Documenta funciones públicas
5. ✅ Actualiza la documentación si es necesario

### Al agregar nuevos servicios:

1. Crea las interfaces en `src/lib/types/`
2. Crea el servicio en `src/lib/services/`
3. Exporta desde `src/lib/types/index.ts` y `src/lib/services/index.ts`
4. Documenta con ejemplos de uso
5. Actualiza este README si es una característica mayor

### Al agregar nuevos tipos:

1. Colócalos en `src/lib/types/` en el archivo apropiado
2. Usa convenciones de nomenclatura consistentes
3. Documenta propiedades complejas con comentarios JSDoc
4. Exporta desde `index.ts`

## 🐛 Solución de Problemas

### Error: "Cannot find module '$lib/types'"

```bash
# Asegúrate de que el alias esté configurado en svelte.config.js
# Reinicia el servidor de desarrollo
npm run dev
```

### Error de TypeScript en importaciones

```typescript
// ✅ Usa 'type' para importar solo tipos
import type { Task } from '$lib/types';

// No mezcles tipos y valores en la misma importación
```

### Funciones deprecated no funcionan

```typescript
// Las funciones en tasks.ts son wrappers
// Considera migrar a las funciones específicas:
import { getMindTaskDetail } from '$lib/services/tasks_mind';
// en lugar de:
import { getTaskDetail } from '$lib/services/tasks';
```

## 📞 Contacto y Soporte

- **Issues:** Usa el sistema de issues de GitHub
- **Documentación:** Revisa esta carpeta primero
- **Ejemplos:** Consulta [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)

## 📅 Historial de Cambios

### Octubre 2025 - Refactorización Mayor
- ✅ Separación de tipos en `src/lib/types/`
- ✅ División de `tasks.ts` en `tasks_mind.ts` y `tasks_body.ts`
- ✅ Actualización de todos los servicios para usar tipos centralizados
- ✅ Creación de documentación completa
- ✅ Mantenimiento de compatibilidad hacia atrás

## 🎓 Recursos Adicionales

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Svelte 5 Runes](https://svelte-5-preview.vercel.app/docs/runes)

---

**Última actualización:** Octubre 2025  
**Mantenedor:** @raulisai  
**Versión de documentación:** 1.0
