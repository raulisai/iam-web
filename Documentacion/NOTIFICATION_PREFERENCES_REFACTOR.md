# Refactorización: Preferencias de Notificación

## Resumen del Cambio

Se ha refactorizado el sistema de alarmas y recordatorios del onboarding para usar un enfoque basado en **preferencias de notificación** en lugar de crear alarmas y recordatorios individuales.

## Motivación

El enfoque anterior permitía a los usuarios crear alarmas y recordatorios individuales sin contexto, lo cual no tenía mucho sentido. El nuevo enfoque pregunta al usuario **cuánto quiere ser molestado** para completar sus tareas, lo cual es más intuitivo y útil.

## Cambios Principales

### 1. Nuevo Componente: `StepNotificationPreferences.svelte`

Reemplaza los componentes `StepAlarms.svelte` y `StepReminders.svelte` con una interfaz unificada que configura:

#### **Recordatorios por Tareas Atrasadas**
- 0-3 recordatorios cuando el usuario tiene tareas pendientes
- Permite al usuario elegir qué tan insistente quiere que sea el sistema

#### **Alarmas de Urgencia**
- 0-2 alarmas cuando el usuario está MUY atrasado
- Alarmas más insistentes que los recordatorios normales

#### **Frecuencia General**
- **Low (Relajado)**: Pocas notificaciones
- **Medium (Balanceado)**: Equilibrio perfecto
- **High (Motivado)**: Muchas notificaciones

#### **Intensidad de Alarmas**
- **Gentle (Suave)**: Discreto y tranquilo
- **Normal**: Estándar
- **Insistent (Insistente)**: Difícil de ignorar

#### **Horario de Silencio**
- Opción para definir un horario donde no se recibirán notificaciones
- Configurable con hora de inicio y fin

### 2. Nuevo Servicio: `notification_preferences.ts`

```typescript
export interface NotificationPreferences {
	task_overdue_reminders: number;      // 0-3
	task_overdue_alarms: number;         // 0-2
	reminder_frequency: 'low' | 'medium' | 'high';
	alarm_intensity: 'gentle' | 'normal' | 'insistent';
	quiet_hours_enabled: boolean;
	quiet_hours_start: string;
	quiet_hours_end: string;
}
```

Funciones disponibles:
- `getNotificationPreferences(authStore)`: Obtener preferencias del usuario
- `saveNotificationPreferences(authStore, preferences)`: Guardar preferencias
- `updateNotificationPreferences(authStore, updates)`: Actualizar campos específicos

### 3. Flujo del Onboarding Actualizado

**Antes (7 pasos):**
1. Perfil
2. Actividades
3. Horarios
4. **Alarmas** ⏰
5. **Recordatorios** 🔔
6. Templates
7. Personalizar

**Ahora (6 pasos):**
1. Perfil
2. Actividades
3. Horarios
4. **Notificaciones** 🔔 (unificado)
5. Templates
6. Personalizar

### 4. Integración con Backend

Durante el onboarding, ahora se guarda:
```typescript
await saveNotificationPreferences(authStore, {
	task_overdue_reminders: 2,
	task_overdue_alarms: 1,
	reminder_frequency: 'medium',
	alarm_intensity: 'normal',
	quiet_hours_enabled: false,
	quiet_hours_start: '22:00',
	quiet_hours_end: '07:00'
});
```

## Endpoints del Backend Requeridos

### GET `/api/notification/preferences`
Obtener las preferencias de notificación del usuario autenticado.

**Response:**
```json
{
	"id": "uuid",
	"user_id": "uuid",
	"task_overdue_reminders": 2,
	"task_overdue_alarms": 1,
	"reminder_frequency": "medium",
	"alarm_intensity": "normal",
	"quiet_hours_enabled": false,
	"quiet_hours_start": "22:00:00",
	"quiet_hours_end": "07:00:00",
	"created_at": "2024-01-01T00:00:00Z",
	"updated_at": "2024-01-01T00:00:00Z"
}
```

### POST `/api/notification/preferences`
Crear o actualizar preferencias de notificación.

**Request Body:**
```json
{
	"task_overdue_reminders": 2,
	"task_overdue_alarms": 1,
	"reminder_frequency": "medium",
	"alarm_intensity": "normal",
	"quiet_hours_enabled": true,
	"quiet_hours_start": "22:00",
	"quiet_hours_end": "07:00"
}
```

### PATCH `/api/notification/preferences`
Actualizar campos específicos de las preferencias.

**Request Body:**
```json
{
	"task_overdue_reminders": 3,
	"reminder_frequency": "high"
}
```

## Archivos Modificados

### Nuevos Archivos
- ✅ `src/routes/onboarding/StepNotificationPreferences.svelte`
- ✅ `src/lib/services/notification_preferences.ts`

### Archivos Actualizados
- ✅ `src/routes/onboarding/+page.svelte`
  - Reemplazado `StepAlarms` y `StepReminders` con `StepNotificationPreferences`
  - Actualizado flujo de 7 a 6 pasos
  - Actualizado `handleComplete()` para guardar preferencias en lugar de crear alarmas/recordatorios

### Archivos Deprecados (aún existen pero no se usan)
- ⚠️ `src/routes/onboarding/StepAlarms.svelte`
- ⚠️ `src/routes/onboarding/StepReminders.svelte`
- ⚠️ `src/lib/services/routine_alarms.ts` (aún útil para otras funcionalidades)
- ⚠️ `src/lib/services/routine_reminders.ts` (aún útil para otras funcionalidades)

## Beneficios del Nuevo Enfoque

### 1. **Más Intuitivo**
- El usuario entiende claramente qué está configurando
- Enfoque en "cuánto quiero ser molestado" vs "crear alarmas individuales"

### 2. **Mejor UX**
- Un solo paso en lugar de dos
- Resumen visual de la configuración elegida
- Opciones predefinidas fáciles de entender

### 3. **Más Flexible**
- El backend puede usar estas preferencias para generar alarmas dinámicamente
- Permite ajustar el comportamiento sin que el usuario cree alarmas manualmente

### 4. **Menos Confuso**
- No hay listas vacías de alarmas/recordatorios
- Configuración clara y directa

## Uso de las Preferencias en el Backend

El backend puede usar estas preferencias para:

1. **Generar alarmas automáticamente** cuando una tarea está atrasada
2. **Ajustar la frecuencia** de recordatorios según `reminder_frequency`
3. **Configurar la intensidad** de las notificaciones según `alarm_intensity`
4. **Respetar horarios de silencio** cuando `quiet_hours_enabled` es true
5. **Escalar notificaciones** según el nivel de atraso:
   - Tareas ligeramente atrasadas → recordatorios normales (hasta `task_overdue_reminders`)
   - Tareas muy atrasadas → alarmas urgentes (hasta `task_overdue_alarms`)

## Ejemplo de Implementación Backend

```python
def should_send_notification(user_id, task):
    prefs = get_user_notification_preferences(user_id)
    
    # Verificar horario de silencio
    if prefs.quiet_hours_enabled:
        current_time = datetime.now().time()
        if is_in_quiet_hours(current_time, prefs.quiet_hours_start, prefs.quiet_hours_end):
            return False
    
    # Calcular cuánto está atrasado
    days_overdue = (datetime.now() - task.due_date).days
    
    # Determinar tipo de notificación
    if days_overdue > 3:
        # Muy atrasado - usar alarmas
        notifications_sent = count_notifications_today(user_id, task.id)
        return notifications_sent < prefs.task_overdue_alarms
    elif days_overdue > 0:
        # Atrasado - usar recordatorios
        notifications_sent = count_notifications_today(user_id, task.id)
        return notifications_sent < prefs.task_overdue_reminders
    
    return False
```

## Migración de Datos

Si ya existen usuarios con alarmas/recordatorios creados:

1. **Opción 1**: Mantener las alarmas existentes y solo usar preferencias para nuevas
2. **Opción 2**: Migrar alarmas existentes a preferencias basándose en patrones
3. **Opción 3**: Pedir a los usuarios que reconfiguren (más limpio)

## Próximos Pasos

1. ✅ Implementar endpoint `/api/notification/preferences` en el backend
2. ✅ Crear modelo de base de datos para `NotificationPreferences`
3. ✅ Implementar lógica de generación de notificaciones basada en preferencias
4. ⏳ Agregar pantalla de configuración de preferencias en el dashboard
5. ⏳ Implementar sistema de notificaciones que respete las preferencias
