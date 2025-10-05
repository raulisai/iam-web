# Sistema de Autenticación con Backend Python - IAM Web

## Descripción

El proyecto está integrado con un backend Python/Supabase con las siguientes características:

- ✅ Login contra backend Python en localhost:5000
- ✅ Protección de rutas (todas las rutas requieren autenticación excepto /login)
- ✅ Gestión de sesiones con tokens del backend
- ✅ Store de autenticación con Svelte 5 (runes)
- ✅ Navbar con información del usuario y logout
- ✅ Integración con Supabase a través del backend Python

## Configuración inicial

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   - Copia `.env.example` a `.env`
   - Por defecto el backend está en `http://localhost:5000`
   - Si tu backend está en otro puerto/host, modifica `VITE_BACKEND_URL`

3. **Backend Python requerido**
   - Asegúrate de que tu backend Python esté corriendo en el puerto 5000
   - El endpoint `/login` debe aceptar `{email, password}` y retornar `{token}`

## Estructura del sistema

### Frontend

- **Store de autenticación** (`/src/lib/stores/auth.svelte.ts`)
  - Maneja el estado del usuario
  - Login, registro y logout
  - Verificación de tokens

- **Páginas públicas**
  - `/login` - Página de inicio de sesión
  - `/register` - Página de registro

- **Componentes**
  - `NavBar.svelte` - Barra de navegación con menú de usuario
  - Layout principal actualizado con verificación de autenticación

### Backend

- **API Routes** (`/src/routes/api/auth/`)
  - `/api/auth/login` - Endpoint de login
  - `/api/auth/register` - Endpoint de registro
  - `/api/auth/verify` - Verificación de token

- **Hooks** (`/src/hooks.server.ts`)
  - Protección de rutas
  - Verificación de tokens
  - Redirección automática

- **Utilidades** (`/src/lib/utils/auth.ts`)
  - Hashing de contraseñas
  - Generación y verificación de JWT

- **Base de datos** (`/src/lib/db/users.ts`)
  - Base de datos en memoria (solo para desarrollo)
  - Gestión de usuarios

## Flujo de autenticación

1. El usuario accede a cualquier ruta
2. `hooks.server.ts` verifica si tiene token válido
3. Si no está autenticado, redirige a `/login`
4. Tras login exitoso, se genera JWT y se almacena
5. El layout principal muestra el contenido según el estado de autenticación
6. El navbar muestra información del usuario y opción de logout

## Seguridad

- Contraseñas hasheadas con PBKDF2
- Tokens JWT con expiración de 7 días
- Verificación de tokens en cada request
- Protección automática de todas las rutas

## Próximos pasos recomendados

1. **Base de datos real**
   - Implementar PostgreSQL o MongoDB
   - Migrar de la base de datos en memoria

2. **Mejoras de seguridad**
   - Implementar refresh tokens
   - Rate limiting en endpoints de autenticación
   - 2FA (autenticación de dos factores)

3. **Funcionalidades adicionales**
   - Recuperación de contraseña
   - Verificación de email
   - Perfil de usuario editable
   - Gestión de sesiones activas

## Desarrollo

Para ejecutar el proyecto:

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5173`

## Notas importantes

- La base de datos actual es en memoria y se reinicia con cada restart del servidor
- Para producción, implementa una base de datos persistente
- Cambia `JWT_SECRET` en producción por una clave segura y única
- Considera usar servicios como Auth0, Firebase Auth o Supabase para producción

## Personalización

### Cambiar el diseño del login/registro

Edita los archivos:
- `/src/routes/login/+page.svelte`
- `/src/routes/register/+page.svelte`

### Modificar la lógica de autenticación

Edita:
- `/src/lib/stores/auth.svelte.ts` para el cliente
- `/src/routes/api/auth/*` para los endpoints
- `/src/hooks.server.ts` para la protección de rutas

### Agregar rutas públicas

En `/src/hooks.server.ts`, agrega las rutas al array `publicRoutes`:

```typescript
const publicRoutes = [
	'/login',
	'/register',
	'/tu-ruta-publica',
	// ...
];
```
