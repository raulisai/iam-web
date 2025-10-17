# Integración Web → Android WebView

## Descripción

Este documento describe cómo la aplicación web Svelte envía el token JWT a la aplicación Android cuando el usuario inicia sesión.

## Flujo de Autenticación

```
┌──────────────────────────────────────────────┐
│ 1. Usuario ingresa credenciales              │
│    email: user@example.com                   │
│    password: ********                        │
└──────────────────────────────────────────────┘
              ▼
┌──────────────────────────────────────────────┐
│ 2. POST /api/auth/login (SvelteKit)          │
│    → Llama al backend Flask                  │
│    → Valida credenciales                     │
│    → Genera JWT                              │
│    → Devuelve: { access_token, user }        │
└──────────────────────────────────────────────┘
              ▼
┌──────────────────────────────────────────────┐
│ 3. AuthStore.login() recibe JWT              │
│    → Guarda en localStorage                  │
│    → Llama: sendTokenToAndroid()             │
└──────────────────────────────────────────────┘
              ▼
┌──────────────────────────────────────────────┐
│ 4. sendTokenToAndroid()                      │
│    → Detecta si está en Android WebView      │
│    → Llama: window.AndroidApp.saveAuthToken()│
└──────────────────────────────────────────────┘
              ▼
┌──────────────────────────────────────────────┐
│ 5. Android guarda JWT                        │
│    → EncryptedSharedPreferences              │
│    → tokenManager.saveTokens(jwt)            │
└──────────────────────────────────────────────┘
```

## Implementación en el Frontend

### Archivo: `src/lib/stores/auth.svelte.ts`

**Funciones clave:**

1. **`isAndroidWebView()`**: Detecta si la app está corriendo dentro de una WebView de Android
   - Verifica la existencia de `window.AndroidApp`
   - Retorna `true` si está disponible, `false` en caso contrario

2. **`sendTokenToAndroid(token, userId)`**: Envía el token a Android
   - Solo se ejecuta si `isAndroidWebView()` retorna `true`
   - Llama a `window.AndroidApp.saveAuthToken(token, userId)`
   - Maneja errores silenciosamente con logs

3. **`AuthStore.login()`**: Método principal de login
   - Después de recibir el JWT del backend
   - Guarda el token en `localStorage`
   - Automáticamente llama a `sendTokenToAndroid()`

## Interfaz Android → Web

### Objeto Global esperado

```typescript
window.AndroidApp = {
  saveAuthToken(token: string, userId: string): void
}
```

**Parámetros:**
- `token`: JWT de autenticación
- `userId`: ID del usuario autenticado

## Comportamiento

### En Navegador Web Normal
- `isAndroidWebView()` retorna `false`
- El token NO se envía a Android
- Log: "Android WebView no detectado, omitiendo sincronización de token"

### En Android WebView
- `isAndroidWebView()` retorna `true`
- El token se envía a Android automáticamente
- Logs:
  - "Enviando token a Android WebView..."
  - "Token enviado exitosamente a Android"

## Requisitos del lado Android

Para que esta integración funcione, la aplicación Android debe:

1. **Inyectar la interfaz JavaScript en el WebView**:
```kotlin
webView.addJavascriptInterface(AndroidApp(), "AndroidApp")
```

2. **Implementar el método `saveAuthToken`**:
```kotlin
class AndroidApp {
    @JavascriptInterface
    fun saveAuthToken(token: String, userId: String) {
        // Guardar en EncryptedSharedPreferences
        tokenManager.saveTokens(token)
        // Guardar userId si es necesario
    }
}
```

## Seguridad

- El token se transmite únicamente si el objeto `AndroidApp` está disponible
- Los errores se capturan y registran sin exponer información sensible
- El token se almacena en Android usando `EncryptedSharedPreferences`

## Testing

### Probar en Navegador
1. Abrir la consola del navegador
2. Iniciar sesión
3. Verificar el log: "Android WebView no detectado..."

### Probar en Android
1. Configurar la WebView con la interfaz JavaScript
2. Iniciar sesión desde la WebView
3. Verificar logs:
   - Frontend: "Enviando token a Android WebView..."
   - Android: Confirmación de guardado exitoso
