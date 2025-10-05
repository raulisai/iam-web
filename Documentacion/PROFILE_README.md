# Documentación del Módulo de Perfil de Usuario

## Descripción

El módulo de perfil de usuario permite a los usuarios gestionar su información personal, física y de disponibilidad. Se integra con el backend de Flask para almacenar y recuperar datos del perfil.

## Estructura de Archivos

```
src/
├── lib/
│   └── services/
│       └── profile.ts          # Servicio para llamadas a la API de perfil
└── routes/
    └── profile/
        ├── +page.svelte        # Página principal del perfil
        └── CreateProfileForm.svelte  # Formulario de creación de perfil
```

## Funcionalidades

### 1. Ver Perfil
- Muestra toda la información del perfil del usuario
- Calcula edad automáticamente desde fecha de nacimiento
- Calcula IMC (Índice de Masa Corporal) desde peso y altura
- Muestra progreso de horas semanales usadas vs disponibles

### 2. Crear Perfil
- Formulario completo para crear un nuevo perfil
- Validaciones de campos requeridos
- Se muestra automáticamente si el usuario no tiene perfil

### 3. Editar Perfil
- Modo de edición inline en la misma página
- Actualización parcial (solo campos modificados)
- Confirmación visual de cambios guardados

## API Endpoints

El módulo se conecta con los siguientes endpoints del backend:

### GET /api/profile/
Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "timezone": "America/Mexico_City",
  "birth_date": "1990-01-15",
  "gender": "male",
  "weight_kg": 75.5,
  "height_cm": 175,
  "preferred_language": "es",
  "hours_available_to_week": 40,
  "work_schedules": "9:00-17:00",
  "current_status": "active",
  "hours_used_to_week": 25.5,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### POST /api/profile/
Crea un nuevo perfil para el usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "timezone": "America/Mexico_City",
  "birth_date": "1990-01-15",
  "gender": "male",
  "weight_kg": 75.5,
  "height_cm": 175,
  "preferred_language": "es",
  "hours_available_to_week": 40,
  "work_schedules": "9:00-17:00",
  "current_status": "active"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  ...
}
```

### PUT /api/profile/
Actualiza el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (campos a actualizar):**
```json
{
  "weight_kg": 76.0,
  "current_status": "busy"
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  ...
}
```

### DELETE /api/profile/
Elimina el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": "uuid",
  "user_id": "uuid"
}
```

## Campos del Perfil

### Información Personal
- **timezone** (string): Zona horaria (ej: "America/Mexico_City")
- **birth_date** (date): Fecha de nacimiento (requerido)
- **gender** (string): Género - "male", "female", "other" (requerido)
- **preferred_language** (string): Idioma preferido - "es", "en" (default: "es")

### Información Física
- **weight_kg** (number): Peso en kilogramos
- **height_cm** (number): Altura en centímetros

### Horarios y Disponibilidad
- **hours_available_to_week** (number): Horas disponibles por semana (default: 40)
- **work_schedules** (string): Horarios de trabajo (ej: "9:00-17:00")
- **current_status** (string): Estado actual - "active", "busy", "away", "offline"
- **hours_used_to_week** (number): Horas usadas en la semana (solo lectura)

## Acceso al Perfil

### Desde el Dashboard Principal
1. **Vista Móvil**: Icono de usuario (👤) en la esquina superior derecha
2. **Vista Desktop**: Icono de usuario (👤) junto al icono de configuración

### Desde el Menú de Usuario (NavBar)
1. Clic en el avatar del usuario en la barra de navegación
2. Seleccionar "Mi Perfil" en el menú desplegable

## Cálculos Automáticos

### Edad
Se calcula automáticamente a partir de la fecha de nacimiento:
```typescript
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
```

### IMC (Índice de Masa Corporal)
Se calcula a partir del peso y altura:
```typescript
function calculateBMI(weight: number | undefined, height: number | undefined): string {
  if (!weight || !height) return 'N/A';
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return bmi.toFixed(1);
}
```

## Manejo de Errores

### Perfil No Encontrado (404)
Cuando el usuario no tiene perfil, se muestra automáticamente el formulario de creación.

### Errores de Autenticación (401)
Si el token es inválido o ha expirado, se redirige al login.

### Errores de Validación (400)
Se muestran mensajes de error específicos en el formulario.

## Estilo y UX

### Diseño Responsivo
- Mobile-first design
- Adaptación automática a pantallas grandes
- Grid layout para organización de campos

### Modo de Edición
- Toggle entre vista y edición
- Botones de guardar/cancelar claramente visibles
- Mensaje de confirmación al guardar

### Feedback Visual
- Mensajes de éxito (verde)
- Mensajes de error (rojo)
- Loading states durante peticiones
- Animación de spinner para carga

## Consideraciones de Seguridad

1. **Autenticación Requerida**: Todos los endpoints requieren token JWT
2. **Validación del Token**: Se verifica en cada petición
3. **Datos Sensibles**: No se almacenan contraseñas ni datos financieros
4. **CORS**: Configurado en el backend para permitir peticiones del frontend

## Futuras Mejoras

1. Carga de foto de perfil
2. Historial de cambios de peso
3. Notificaciones de perfil incompleto
4. Verificación de email
5. Configuración de privacidad
6. Exportación de datos
7. Integración con wearables para datos físicos
8. Sugerencias automáticas basadas en perfil

## Uso del Servicio

```typescript
import { getUserProfile, updateUserProfile, createUserProfile } from '$lib/services/profile';

// Obtener perfil
const profile = await getUserProfile();

// Actualizar perfil
const updated = await updateUserProfile({ weight_kg: 76.0 });

// Crear perfil
const newProfile = await createUserProfile({
  birth_date: "1990-01-15",
  gender: "male",
  // ... otros campos
});
```

## Testing

Para probar la funcionalidad:

1. **Crear Perfil**: Acceder a `/profile` sin tener perfil
2. **Ver Perfil**: Navegar desde el dashboard o NavBar
3. **Editar Perfil**: Hacer clic en "Editar" y modificar campos
4. **Validaciones**: Intentar guardar sin campos requeridos

## Troubleshooting

### El perfil no carga
- Verificar que el backend esté corriendo
- Revisar token en localStorage
- Verificar CORS en el backend
- Revisar console del navegador

### Error al guardar cambios
- Verificar formato de fechas (YYYY-MM-DD)
- Verificar tipos de datos (números, strings)
- Revisar logs del backend

### Estilos no se aplican
- Limpiar caché del navegador
- Verificar que Tailwind esté compilando
- Revisar clases CSS en DevTools
