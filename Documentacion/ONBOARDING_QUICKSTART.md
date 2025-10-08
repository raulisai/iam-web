# 🚀 Guía Rápida: Onboarding System

## Acceso

```
http://localhost:5173/onboarding
```

## Flujo del Usuario

### 1️⃣ **Perfil Personal** (1 min)
```
- Fecha de nacimiento
- Género  
- Peso/Altura (opcional)
- Zona horaria
- Idioma
```

### 2️⃣ **Actividades Favoritas** (30 seg)
Selecciona las que te gusten:
- 🧠 Mente: Meditación, Lectura, Aprendizaje, Creatividad
- 💪 Cuerpo: Ejercicio, Yoga, Running, Natación, Ciclismo, Nutrición

### 3️⃣ **¿Cuándo entrenas?** (30 seg)
- Horarios: Madrugada, Mañana, Tarde, Noche
- Días: Lun, Mar, Mié, Jue, Vie, Sáb, Dom (o todos)

### 4️⃣ **Templates Sugeridos** (30 seg)
El sistema sugiere templates basados en tus actividades.
Elige los que quieras usar. ¡Es opcional!

### 5️⃣ **Crea Tus Tareas** (1 min - opcional)
Agrega tareas personalizadas:
- Nombre
- Categoría (Mente/Cuerpo)
- Duración
- Dificultad
- Descripción

### ✅ **¡Listo!**
El sistema crea automáticamente:
- Tu perfil
- Reglas de automatización
- Plantillas de tareas

## Ejemplo Rápido

**Selecciono:**
- Actividades: Meditación + Ejercicio
- Horarios: Mañana + Noche
- Días: Lun, Mié, Vie

**El sistema crea:**
- 4 reglas automáticas
- Templates recomendados
- ¡Listo para empezar!

## Para Desarrolladores

### Servicios Disponibles

```typescript
import { 
  createBotRule, 
  getBotRules 
} from '$lib/services/bot_rules';

import { 
  createTaskTemplate, 
  getTaskTemplates 
} from '$lib/services/task_templates';

import { 
  generateBotRules, 
  getRecommendedTemplates 
} from '$lib/utils/onboarding';
```

### Crear Regla Manualmente

```typescript
const rule = await createBotRule(authStore, {
  rule_key: 'morning_meditation',
  name: 'Meditación Matutina',
  descr: 'Meditar cada mañana',
  condition: { time: '07:00', days: ['mon', 'wed', 'fri'] },
  action: { type: 'create_task', category: 'mind' },
  is_active: true
});
```

### Crear Template Manualmente

```typescript
const template = await createTaskTemplate(authStore, {
  key: 'my_custom_task',
  name: 'Mi Tarea Custom',
  category: 'mind',
  descr: 'Descripción',
  estimated_minutes: 30,
  difficulty: 3,
  reward_xp: 60
});
```

### Usar Helpers

```typescript
// Generar reglas automáticamente
const rules = generateBotRules(
  [{ id: 'meditation', name: 'Meditación', category: 'mind' }],
  [{ id: 'morning', time: '07:00-12:00' }],
  ['mon', 'wed', 'fri']
);

// Obtener templates recomendados
const templates = getRecommendedTemplates(['meditation', 'exercise']);

// Calcular XP
const xp = calculateXP(difficulty: 4, duration: 45); // 100 XP
```

## Testing

```bash
# 1. Inicia el proyecto
npm run dev

# 2. Ve a /onboarding
# 3. Completa los 5 pasos
# 4. Verifica en BD:
#    - profile tabla
#    - bot_rules tabla (N reglas)
#    - task_templates tabla (M templates)
```

## Endpoints Usados

```
POST /api/profile/          - Crear perfil
POST /api/bot-rules/        - Crear regla
POST /api/task-templates/   - Crear template
```

## Troubleshooting

**Error: "No authentication token"**
→ Usuario no está logueado, redirigir a /login

**Error al crear perfil**
→ Verificar campos requeridos: birth_date, gender

**No se generan reglas**
→ Verificar que haya al menos 1 actividad y 1 horario seleccionados

**Templates no aparecen**
→ Verificar que se seleccionaron actividades en Paso 2

## ¡Eso es todo! 🎉

Sistema completamente funcional y listo para usar.
