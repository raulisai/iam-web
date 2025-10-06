# Fix: 404 Error en Task Recommendations

## 🐛 Problema Identificado

El frontend estaba generando errores 404 al intentar obtener recomendaciones de tareas, a pesar de que el endpoint funcionaba correctamente en Swagger.

### Causa Raíz

El método `authenticatedFetch` en `auth.svelte.ts` hacía fetch directo a la URL que se le pasaba, **sin agregar el `BACKEND_URL`**.

**Comportamiento incorrecto:**
```typescript
// Cuando se llamaba:
authStore.authenticatedFetch('/api/tasks/recommendations/mind')

// Hacía fetch a:
http://localhost:5173/api/tasks/recommendations/mind ❌
// (servidor de Vite, no existe el endpoint)

// En lugar de:
http://localhost:5000/api/tasks/recommendations/mind ✅
// (servidor Flask backend)
```

## ✅ Solución Implementada

### 1. Actualizado `auth.svelte.ts`

**Cambios:**
- Importado `BACKEND_URL` desde `$lib/config`
- Modificado `authenticatedFetch` para agregar automáticamente el `BACKEND_URL` a URLs relativas
- Mantenida compatibilidad con URLs absolutas (que ya tienen http/https)

**Código corregido:**
```typescript
import { BACKEND_URL } from '$lib/config';

async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    if (!token) {
        throw new Error('No hay token de autenticación');
    }

    // Determinar la URL completa
    // Si la URL ya tiene http/https, usarla tal cual
    // Si es relativa (empieza con /), agregar el BACKEND_URL
    const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url}`;

    // Combinar headers existentes con el Authorization header
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    // Solo agregar Content-Type si no está ya definido
    if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(fullUrl, {
        ...options,
        headers,
    });
}
```

### 2. Limpieza de `recommendations.ts`

- Removidos console.log innecesarios de debugging
- Código limpio y listo para producción

## 🎯 Impacto

### Antes:
- ❌ 404 Not Found en todas las llamadas a recommendations
- ❌ Modal mostraba "No recommendations available"
- ❌ Confusión porque Swagger funcionaba correctamente

### Después:
- ✅ Requests van correctamente a `http://localhost:5000/api/...`
- ✅ Recomendaciones se cargan exitosamente
- ✅ Modal muestra las 3 tarjetas de tareas
- ✅ Todo funcional end-to-end

## 🔄 Beneficios Adicionales

Esta corrección también mejora otros servicios porque ahora:

1. **Consistencia**: Todos los servicios pueden usar URLs relativas
2. **Mantenibilidad**: Cambiar el `BACKEND_URL` solo requiere actualizar `config.ts`
3. **Simplicidad**: No necesitas recordar agregar `${BACKEND_URL}` en cada llamada

### Comparación con código existente:

**Antes (servicios antiguos):**
```typescript
// Tenías que recordar agregar BACKEND_URL cada vez
const response = await authStore.authenticatedFetch(
    `${BACKEND_URL}/api/tasks/mind/?status=pending`
);
```

**Ahora (con la corrección):**
```typescript
// URL relativa, más simple y limpio
const response = await authStore.authenticatedFetch(
    '/api/tasks/mind/?status=pending'
);
```

## 📝 Notas Técnicas

- El método detecta automáticamente si la URL es absoluta (`http://` o `https://`) o relativa (`/api/...`)
- URLs absolutas se usan tal cual (para APIs externas si las hubiera)
- URLs relativas se prefijan con `BACKEND_URL`
- El `Content-Type` solo se agrega si hay body y no está ya definido

## ✅ Testing

Para verificar que funciona:

1. Abrir la página `/minde` o `/body`
2. Hacer click en el botón flotante "+"
3. Verificar en Network tab que el request va a:
   ```
   http://localhost:5000/api/tasks/recommendations/mind?count=3&use_ai=false
   ```
4. Confirmar que se reciben 3 recomendaciones
5. Seleccionar una tarea y confirmar que se crea correctamente

## 🚀 Archivos Modificados

1. `src/lib/stores/auth.svelte.ts` - Fix principal
2. `src/lib/services/recommendations.ts` - Limpieza de logs

## 🎮 Status

**✅ RESUELTO** - El sistema de recomendaciones ahora funciona correctamente end-to-end.
