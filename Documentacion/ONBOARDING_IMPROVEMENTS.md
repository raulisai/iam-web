# 🎯 Mejoras al Sistema de Onboarding

## Resumen de Cambios

Se ha mejorado significativamente el sistema de onboarding para hacer preguntas más precisas y proporcionar una mejor experiencia al usuario con cálculos automáticos y validaciones inteligentes.

---

## 📋 Cambios Implementados

### 1. **StepProfileInfo.svelte** - Información Personal Mejorada

#### Nuevos Campos Agregados:

**Sección de Horario Laboral:**
- ⏰ **Horario de Trabajo**: Selección de hora de inicio y fin con inputs tipo `time`
  - Input de hora de inicio (default: 09:00)
  - Input de hora de fin (default: 17:00)
  
- 📅 **Días Laborales**: Grid interactivo de 7 días
  - Botones visuales para cada día (Dom-Sáb)
  - Iconos emoji para cada día (☀️ Dom, 1️⃣ Lun, etc.)
  - Indicadores visuales de selección con checkmarks
  - Validación: mínimo 1 día requerido

**Calculadora Automática de Horas:**
- 📊 **Cálculo en Tiempo Real**:
  - Horas de trabajo por día (basado en horario inicio-fin)
  - Días laborales seleccionados
  - Total de horas trabajo/semana
  - Horas libres disponibles/semana (112h despierto - horas trabajo)

- ⏳ **Horas Disponibles para Actividades IAM**:
  - Input numérico con slider visual
  - Validación: entre 1 y horas libres disponibles
  - Sugerencia inteligente: 10% del tiempo libre
  - Barra de progreso visual del porcentaje
  - Muestra X% de tu tiempo libre

#### Validaciones Mejoradas:
```typescript
✅ Fecha de nacimiento (requerido)
✅ Género (requerido)
✅ Al menos 1 día laboral (requerido)
✅ Horas disponibles > 0 (requerido)
```

#### Estructura de Datos del Perfil:
```typescript
{
  // Datos personales
  birth_date: string;        // YYYY-MM-DD
  gender: 'male' | 'female' | 'other';
  weight_kg: number | null;
  height_cm: number | null;
  timezone: string;
  preferred_language: 'es' | 'en';
  
  // Horario laboral (NUEVOS)
  work_schedules: string;              // "9:00-17:00"
  day_work: string;                    // "L,M,M,J,V"
  hours_available_to_week: number;     // 10
  current_status: string;              // "active"
}
```

---

### 2. **StepSchedules.svelte** - Horarios Preferidos Más Precisos

#### Horarios del Día Expandidos:
Se cambió de 4 a **5 franjas horarias más específicas**:

| Franja | Icono | Horario | Descripción |
|--------|-------|---------|-------------|
| **Mañana Temprano** | 🌅 | 6:00-9:00 | Antes del trabajo |
| **Mediodía** | ☀️ | 12:00-14:00 | Hora de comida |
| **Tarde** | 🌤️ | 14:00-18:00 | Después del trabajo |
| **Noche** | 🌆 | 18:00-22:00 | En la noche |
| **Noche Tarde** | 🌙 | 22:00-6:00 | Antes de dormir |

#### Mejoras Visuales:
- Cards más amplias con descripción del momento del día
- Mejor layout: grid de 3 columnas en desktop
- Tip informativo: "Selecciona varios horarios para más flexibilidad"
- Nota aclaratoria: "Estas son las franjas FUERA de tu horario de trabajo"

#### Resumen Inteligente Mejorado:
Nuevo panel con 3 métricas visuales:

```
┌─────────────────────────────────────────────────┐
│ 🎯 Resumen de tu Configuración                  │
├─────────────┬─────────────┬─────────────────────┤
│ Horarios    │ Días        │ Reglas automáticas  │
│ seleccionados│ seleccionados│                     │
│ 3           │ 5           │ 15                  │
│ Mañana,     │ Lun, Mar,   │ Combinaciones       │
│ Tarde,      │ Mié, Jue,   │ horario × día       │
│ Noche       │ Vie         │                     │
└─────────────┴─────────────┴─────────────────────┘

⚡ El bot sugerirá tareas en estos horarios basándose
   en tus actividades favoritas
```

#### Atajos Rápidos Mejorados:
```
🏢 L-V (Laborales)  |  🏖️ S-D (Fin de semana)  |  ✅ Todos
```

---

### 3. **generateBotRules()** - Lógica de Reglas Mejorada

#### Mejoras en la Generación de Reglas:

**Mapeo de Días Corregido:**
```typescript
const dayMap = {
  'monday'    → 'mon',
  'tuesday'   → 'tue',
  'wednesday' → 'wed',
  'thursday'  → 'thu',
  'friday'    → 'fri',
  'saturday'  → 'sat',
  'sunday'    → 'sun'
};
```

**Mapeo de Franjas Horarias:**
```typescript
const timeSlotMap = {
  'morning'   → '06:00',
  'midday'    → '12:00',
  'afternoon' → '14:00',
  'evening'   → '18:00',
  'night'     → '22:00'
};
```

**Estructura de Reglas Generadas:**
```typescript
{
  rule_key: `auto_${activity}_${timeSlot}_${timestamp}`,
  name: "🤖 Meditación - Mañana",
  descr: "Sugerencia automática de Meditación durante Mañana (6:00-9:00) en días: mon,tue,wed,thu,fri",
  condition: {
    time: "06:00",
    days: ["mon", "tue", "wed", "thu", "fri"]
  },
  action: {
    type: "create_task",
    activity: "meditation",
    category: "mind",
    duration: 15
  },
  is_active: true
}
```

**Logs de Depuración:**
```typescript
✅ Generated 15 bot rules from 3 activities × 5 time slots
📋 Creando 15 reglas de bot...
✅ Regla creada: 🤖 Meditación - Mañana
✅ Regla creada: 🤖 Ejercicio - Tarde
...
```

---

### 4. **+page.svelte** - Orquestador Principal

#### Datos del Perfil Extendidos:
```typescript
let profileData = $state({
  // Campos existentes
  timezone: 'America/Mexico_City',
  preferred_language: 'es',
  gender: '',
  birth_date: '',
  weight_kg: null,
  height_cm: null,
  
  // NUEVOS campos
  work_schedules: '9:00-17:00',
  day_work: 'L,M,M,J,V',
  hours_available_to_week: 10,
  current_status: 'active'
});
```

#### Logging Mejorado:
```typescript
console.log('💾 Guardando perfil...', profileData);
console.log('🤖 Generando reglas de bot...', {
  activities: 3,
  schedules: 5,
  days: 5
});
console.log('📋 Creando 15 reglas de bot...');
```

---

## 🎯 Beneficios de las Mejoras

### Para el Usuario:
1. ✅ **Preguntas más claras y específicas**
   - Sabe exactamente qué información se le pide
   - Entiende por qué es importante cada dato

2. 📊 **Calculadora automática**
   - Ve en tiempo real cuántas horas trabaja
   - Conoce su tiempo libre disponible
   - Recibe sugerencias inteligentes

3. 🎨 **Experiencia visual mejorada**
   - Feedback inmediato en cada selección
   - Resúmenes visuales claros
   - Iconos y colores descriptivos

4. 🎯 **Configuración más precisa**
   - Horarios específicos por franja del día
   - Días laborales vs días de actividades
   - Reglas de bot más inteligentes

### Para el Sistema:
1. 🤖 **Reglas de bot más precisas**
   - Sugerencias en horarios reales del usuario
   - Respeta días laborales vs libres
   - Considera tiempo disponible real

2. 📈 **Mejor tracking**
   - Logs detallados de cada paso
   - Validación robusta de datos
   - Manejo de errores por regla

3. 🔄 **Integración con backend**
   - Datos estructurados correctamente
   - Formato de días compatible con API
   - Horarios en formato ISO

---

## 📊 Ejemplo de Flujo Completo

### Usuario: Juan Developer
```
👤 Información Personal:
- Fecha nacimiento: 1995-03-15
- Género: Masculino
- Peso: 75 kg, Altura: 180 cm
- Zona horaria: America/Mexico_City
- Idioma: Español

💼 Horario Laboral:
- Trabaja: 9:00 - 18:00
- Días: L, M, Mi, J, V (5 días)
- Horas trabajo/semana: 45h
- Horas libres/semana: 67h
- Quiere dedicar: 8h/semana a IAM (12% tiempo libre)

🎯 Actividades:
- 🧘 Meditación
- 💪 Ejercicio
- 📚 Lectura

⏰ Horarios Preferidos:
- 🌅 Mañana Temprano (6:00-9:00)
- 🌆 Noche (18:00-22:00)

📅 Días:
- Lunes a Viernes

🤖 Resultado:
- 6 reglas de bot creadas (3 actividades × 2 horarios)
- Reglas activas en L-V
- Sugerencias automáticas mañana y noche
```

---

## 🔧 Configuración de API

### Endpoints Actualizados:

#### POST /api/profile/
```json
{
  "birth_date": "1995-03-15",
  "gender": "male",
  "weight_kg": 75,
  "height_cm": 180,
  "timezone": "America/Mexico_City",
  "preferred_language": "es",
  "work_schedules": "9:00-18:00",
  "day_work": "L,M,M,J,V",
  "hours_available_to_week": 8,
  "current_status": "active"
}
```

#### POST /api/bot-rules/
```json
{
  "rule_key": "auto_meditation_morning_1728123456789",
  "name": "🤖 Meditación - Mañana",
  "descr": "Sugerencia automática de Meditación durante Mañana (6:00-9:00) en días: mon,tue,wed,thu,fri",
  "condition": {
    "time": "06:00",
    "days": ["mon", "tue", "wed", "thu", "fri"]
  },
  "action": {
    "type": "create_task",
    "activity": "meditation",
    "category": "mind",
    "duration": 15
  },
  "is_active": true
}
```

---

## 🎨 Mejoras Visuales Implementadas

### Calculadora de Horas (Nueva):
```
┌──────────────────────────────────────────┐
│ 📊 Cálculo Automático                    │
├──────────────────┬───────────────────────┤
│ Horas trabajo/día│ Días laborales        │
│ 9.0h             │ 5 días                │
├──────────────────┴───────────────────────┤
│ Total trabajo/semana  │ Horas libres/sem │
│ 45h                   │ 67h              │
└───────────────────────┴──────────────────┘
```

### Barra de Progreso Visual:
```
⏳ Horas disponibles para actividades IAM: [  8  ] de 67h
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  12% de tu tiempo libre

💡 Recomendamos comenzar con 7h semanales (10% de tu tiempo libre)
```

### Resumen de Configuración:
```
🎯 Resumen de tu Configuración
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Horarios        │  │ Días            │  │ Reglas          │
│ seleccionados   │  │ seleccionados   │  │ automáticas     │
│                 │  │                 │  │                 │
│      2          │  │      5          │  │     10          │
│                 │  │                 │  │                 │
│ Mañana, Noche   │  │ Lun-Vie         │  │ horario × día   │
└─────────────────┘  └─────────────────┘  └─────────────────┘

⚡ El bot sugerirá tareas en estos horarios basándose en tus actividades
```

---

## 🚀 Próximas Mejoras Sugeridas

1. **Validación de Horarios**
   - Detectar conflictos entre trabajo y actividades
   - Sugerir automáticamente horarios libres
   - Advertir si horas disponibles < suma de templates

2. **Previsualización de Agenda**
   - Mostrar cómo se vería una semana típica
   - Timeline visual con trabajo + actividades
   - Ajustar horarios arrastrando bloques

3. **Sincronización con Calendario**
   - Importar eventos de Google Calendar
   - Detectar horas libres reales
   - Evitar conflictos automáticamente

4. **Perfil de Usuario Inteligente**
   - "Cronotipos" (matutino/vespertino)
   - Nivel de energía por horario
   - Preferencias de actividad por momento

5. **Recomendaciones Personalizadas**
   - "Usuarios como tú dedican 10h/semana"
   - "Con tu horario, recomendamos mañanas"
   - "Actividades populares en tu zona horaria"

---

## 📝 Notas de Implementación

### Campos Opcionales vs Requeridos:
```typescript
Requeridos:
✅ birth_date
✅ gender
✅ day_work (al menos 1 día)
✅ hours_available_to_week (> 0)

Opcionales:
⚪ weight_kg
⚪ height_cm
⚪ work_schedules (default: 9:00-17:00)
⚪ timezone (default: America/Mexico_City)
⚪ preferred_language (default: es)
```

### Cálculos Utilizados:
```typescript
// Horas trabajo diarias
dailyWorkHours = (endTime - startTime) / 60

// Horas trabajo semanales
weeklyWorkHours = dailyWorkHours × workDaysCount

// Horas libres semanales
freeHours = (16h × 7 días) - weeklyWorkHours
// Asumimos 16h despierto por día, 8h durmiendo

// Porcentaje de tiempo libre usado
percentageUsed = (hoursAvailable / freeHours) × 100
```

---

## ✅ Checklist de Testing

- [x] Calculadora muestra valores correctos
- [x] Validación de campos requeridos funciona
- [x] Días laborales se guardan correctamente
- [x] Horarios se mapean a formato API
- [x] Reglas de bot se crean con días correctos
- [x] Barra de progreso refleja porcentaje real
- [x] Sugerencia automática es razonable
- [x] Perfil existente se carga correctamente
- [x] Transiciones entre pasos son suaves
- [x] Resumen muestra datos correctos

---

## 🎓 Lecciones Aprendidas

1. **UX es Clave**: Usuarios necesitan entender el "por qué" de cada pregunta
2. **Feedback Visual**: Cálculos en tiempo real mejoran confianza
3. **Validaciones Tempranas**: Prevenir errores en lugar de corregirlos
4. **Datos Precisos**: Mejor pocas preguntas precisas que muchas genéricas
5. **Contexto Importa**: Mostrar relación entre inputs (ej: trabajo vs tiempo libre)

---

## 📚 Documentación Relacionada

- [ONBOARDING_README.md](./ONBOARDING_README.md) - Documentación general
- [PROFILE_README.md](./PROFILE_README.md) - API de perfil
- [AUTH_README.md](./AUTH_README.md) - Sistema de autenticación
- [ONBOARDING_MODULAR.md](./ONBOARDING_MODULAR.md) - Componentes modulares

---

**Fecha de Actualización**: 11 de octubre, 2025  
**Versión**: 2.0  
**Autor**: Sistema IAM Team
