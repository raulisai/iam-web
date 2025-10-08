# Onboarding/Calibration System

Sistema interactivo de onboarding tipo wizard para configurar el perfil del usuario, sus preferencias y crear automáticamente reglas de bot y plantillas de tareas personalizadas.

## 🎯 Características

### ✨ Experiencia Gamificada
- Wizard de 4 pasos con barra de progreso visual
- Animaciones fluidas con Svelte transitions
- Diseño tipo videojuego similar al modal de recomendaciones
- Feedback visual inmediato en cada selección
- UI responsive para mobile y desktop

### 📋 Pasos del Wizard

#### **Paso 1: Información Personal** 👤
Recopila datos del perfil del usuario:
- Fecha de nacimiento
- Género (con botones visuales)
- Peso y altura (opcional)
- Zona horaria
- Idioma preferido
- Horas disponibles por semana
- Horario de trabajo

**Validaciones:**
- Fecha de nacimiento y género son obligatorios
- Campos numéricos con rangos válidos

#### **Paso 2: Preferencias de Actividades** 🎯
Permite seleccionar actividades de interés:

**Mente (🧠):**
- Meditación 🧘
- Lectura 📚
- Aprendizaje 🎓
- Creatividad 🎨

**Cuerpo (💪):**
- Ejercicio 💪
- Yoga 🧘‍♀️
- Running 🏃
- Natación 🏊
- Ciclismo 🚴
- Nutrición 🥗

**Características:**
- Selección múltiple
- Cards interactivas con hover effects
- Indicador visual de selección
- Colores por categoría (purple para mind, orange para body)

**Validación:**
- Al menos una actividad debe ser seleccionada

#### **Paso 3: Preferencias de Horario** ⏰
Configura cuándo realizar las actividades:

**Horarios del Día:**
- Madrugada 🌅 (05:00-07:00)
- Mañana ☀️ (07:00-12:00)
- Tarde 🌤️ (12:00-18:00)
- Noche 🌙 (18:00-22:00)
- Noche Tarde 🌃 (22:00-00:00)

**Días de la Semana:**
- Selección múltiple de días
- Opción de dejar vacío = todos los días

**Validación:**
- Al menos un horario debe ser seleccionado

#### **Paso 4: Tareas Personalizadas** ✨
Crea plantillas de tareas específicas:

**Formulario de Tarea:**
- Nombre de la tarea
- Categoría (Mind/Body)
- Duración en minutos
- Dificultad (1-5 estrellas)
- Descripción

**Características:**
- Agregar múltiples tareas
- Vista previa de tareas creadas
- Eliminar tareas antes de finalizar
- Este paso es opcional

## 🔌 Integración con Backend

### Endpoints Utilizados

#### 1. **Profile API** (`/api/profile/`)
```typescript
POST /api/profile/
```
Crea el perfil del usuario con los datos del Paso 1.

#### 2. **Bot Rules API** (`/api/bot-rules/`)
```typescript
POST /api/bot-rules/
```
Crea reglas automáticas basadas en:
- Actividades seleccionadas (Paso 2)
- Horarios preferidos (Paso 3)
- Días de la semana seleccionados

**Ejemplo de Regla Creada:**
```json
{
  "rule_key": "auto_meditation_morning",
  "name": "Auto-schedule Meditación - Mañana",
  "descr": "Automatically create Meditación task during Mañana (07:00-12:00)",
  "condition": {
    "time": "07:00",
    "days": ["mon", "tue", "wed", "thu", "fri"]
  },
  "action": {
    "type": "create_task",
    "activity": "meditation",
    "category": "mind",
    "duration": 30
  },
  "is_active": true
}
```

#### 3. **Task Templates API** (`/api/task-templates/`)
```typescript
POST /api/task-templates/
```
Crea plantillas personalizadas con los datos del Paso 4.

**Ejemplo de Template Creado:**
```json
{
  "key": "custom_practica_guitarra_1234567890",
  "name": "Práctica de guitarra",
  "category": "mind",
  "descr": "Sesión diaria de práctica musical",
  "estimated_minutes": 45,
  "difficulty": 3,
  "reward_xp": 60,
  "created_by": "user"
}
```

## 📁 Archivos Creados

### Services
```
src/lib/services/
├── bot_rules.ts          # Service para bot rules API
└── task_templates.ts     # Service para task templates API
```

### Routes
```
src/routes/onboarding/
└── +page.svelte          # Wizard de onboarding
```

## 🎨 Características de UI/UX

### Barra de Progreso
- Muestra paso actual con anillo de color
- Pasos completados con checkmark
- Líneas de conexión con gradientes
- Labels descriptivos debajo

### Validaciones
- Feedback inmediato en cada paso
- Mensajes de error claros
- Botón "Siguiente" deshabilitado si faltan datos

### Animaciones
- Entrada de pasos con `scale` transition
- Mensajes de error con `fly` transition
- Cards con hover effects
- Loading spinner durante submit

### Responsive Design
- Grid adaptable (1 columna mobile, 2-4 desktop)
- Cards que se expanden en hover
- Botones táctiles amigables para mobile

## 🚀 Flujo Completo

```
Usuario accede a /onboarding
    ↓
Paso 1: Completa información personal
    ↓
Paso 2: Selecciona actividades favoritas (mind + body)
    ↓
Paso 3: Selecciona horarios y días preferidos
    ↓
Paso 4: (Opcional) Crea tareas personalizadas
    ↓
Click en "Completar Configuración"
    ↓
Backend:
  1. Crea perfil de usuario
  2. Crea N reglas de bot (actividad × horario)
  3. Crea M templates personalizados
    ↓
Muestra mensaje de éxito
    ↓
Redirige a Home (/) después de 2 segundos
```

## 🔐 Seguridad y Validación

### Cliente (Frontend)
- Validación de campos requeridos por paso
- Rangos válidos para números (peso, altura, duración)
- Prevención de envío múltiple durante submit
- Limpieza de formularios después de agregar

### Servidor (Backend)
- Token JWT requerido en todos los endpoints
- Validación de datos en controllers
- Manejo de errores con mensajes descriptivos

## 📱 Accesibilidad

- Navegación por teclado
- Labels descriptivos en todos los inputs
- Feedback visual y textual
- Colores con suficiente contraste
- Botones con estados disabled claros

## 🎯 Próximas Mejoras

- [ ] Opción de "Saltar" pasos opcionales
- [ ] Guardar progreso en localStorage
- [ ] Previsualización final antes de confirmar
- [ ] Editar configuración después del onboarding
- [ ] Sugerencias inteligentes basadas en selecciones previas
- [ ] Importar preferencias de otros usuarios
- [ ] Templates predefinidos por tipo de usuario (estudiante, profesional, atleta)
- [ ] Tutorial interactivo después del onboarding

## 💡 Uso

### Acceso Directo
```
/onboarding
```

### Integración con Registro
Después de registrarse, el usuario puede ser redirigido automáticamente:
```typescript
// En la página de registro exitoso
goto('/onboarding');
```

### Verificación de Perfil
El componente verifica si el usuario ya tiene perfil:
```typescript
onMount(async () => {
    const existingProfile = await getUserProfile();
    if (existingProfile) {
        goto('/'); // Ya configurado, ir a home
    }
});
```

## 🧪 Testing

### Casos de Prueba

1. **Validaciones por Paso**
   - Intentar avanzar sin completar campos requeridos
   - Verificar mensajes de error

2. **Selecciones Múltiples**
   - Seleccionar/deseleccionar actividades
   - Verificar indicadores visuales

3. **Tareas Personalizadas**
   - Agregar múltiples tareas
   - Eliminar tareas
   - Verificar límites de duración y dificultad

4. **Submit Final**
   - Verificar creación de perfil
   - Verificar creación de reglas (N reglas = actividades × horarios)
   - Verificar creación de templates
   - Verificar redirección

5. **Navegación**
   - Ir atrás y adelante entre pasos
   - Verificar persistencia de datos al navegar

## 📚 Ejemplos de Combinaciones

### Ejemplo 1: Usuario Matutino Enfocado en Mente
- **Actividades:** Meditación, Lectura
- **Horarios:** Madrugada, Mañana
- **Días:** Lunes a Viernes
- **Resultado:** 4 reglas de bot (2 actividades × 2 horarios)

### Ejemplo 2: Atleta de Tarde
- **Actividades:** Ejercicio, Running, Natación
- **Horarios:** Tarde
- **Días:** Todos (vacío)
- **Resultado:** 3 reglas de bot (3 actividades × 1 horario)

### Ejemplo 3: Usuario Balanceado
- **Actividades:** Meditación, Yoga, Lectura
- **Horarios:** Mañana, Noche
- **Días:** Lunes, Miércoles, Viernes
- **Tareas Custom:** "Práctica de piano (30min, dificultad 3)"
- **Resultado:** 6 reglas de bot + 1 template personalizado

## 🎮 Inspiración de Diseño

El diseño está inspirado en:
- Onboarding de apps fitness (Nike Training, Strava)
- Character creation de videojuegos RPG
- Setup wizards de herramientas de productividad (Notion, Todoist)
- Interfaces tipo "loot box" pero éticas y transparentes

Cada interacción busca ser satisfactoria y dar feedback inmediato, convirtiendo la configuración en una experiencia divertida en lugar de una tarea tediosa.
