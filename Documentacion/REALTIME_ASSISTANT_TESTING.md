# 🧪 Asistente en Tiempo Real - Guía de Pruebas

## 🚀 Quick Start

### 1. Iniciar el Servidor de Desarrollo

```bash
cd c:\Users\raul_\Documents\code\iam-web
npm run dev
```

### 2. Abrir el Asistente

Navega a: `http://localhost:5173/assistant/realtime`

---

## ✅ Checklist de Pruebas Manuales

### Prueba 1: Cargar la Página
- [ ] La página carga sin errores
- [ ] TasksNowCarousel aparece arriba
- [ ] Se muestran los 3 botones (Goal, Mind, Body)
- [ ] VoiceOrb aparece abajo centrado
- [ ] Todos los elementos tienen animaciones suaves

### Prueba 2: Permisos del Navegador
- [ ] Al hacer clic en VoiceOrb, el navegador pide permiso de micrófono
- [ ] Al aceptar, VoiceOrb cambia a verde (listening)
- [ ] Al denegar, se muestra un error apropiado

### Prueba 3: Botón Goal
- [ ] Hacer clic en botón "Goal" 🎯
- [ ] TimelineWizard aparece con 4 pasos
- [ ] Primer paso está activo (azul)
- [ ] Resto de pasos no son visibles
- [ ] Botón "Reiniciar" aparece arriba

### Prueba 4: Botón Mind
- [ ] Hacer clic en botón "Mind" 🧠
- [ ] TimelineWizard aparece con 2 pasos
- [ ] Primer paso está activo
- [ ] Input de texto está enfocado

### Prueba 5: Botón Body
- [ ] Hacer clic en botón "Body" 💪
- [ ] TimelineWizard aparece con 2 pasos
- [ ] Similar comportamiento a Mind

### Prueba 6: VoiceOrb Estados
- [ ] **Idle**: Círculo púrpura, icono 💬
- [ ] **Listening**: Círculo verde, icono 🎤, ondas rápidas
- [ ] **Processing**: Círculo naranja, icono ⏳
- [ ] **Speaking**: Círculo azul, icono 🔊

### Prueba 7: Reconocimiento de Voz
- [ ] Activar micrófono (clic en VoiceOrb)
- [ ] Decir algo en español
- [ ] La transcripción aparece abajo en verde
- [ ] Al terminar de hablar, se envía al backend

### Prueba 8: Wizard Manual
- [ ] Iniciar wizard de Goal
- [ ] Escribir título manualmente
- [ ] Después de ~500ms, el paso se marca como completado ✅
- [ ] Siguiente paso se hace visible y activo
- [ ] Repetir hasta completar todos los pasos

### Prueba 9: Reiniciar Wizard
- [ ] Iniciar cualquier wizard
- [ ] Hacer clic en botón "Reiniciar"
- [ ] Wizard desaparece
- [ ] Vuelven a aparecer los 3 botones
- [ ] Estado se resetea correctamente

### Prueba 10: Responsividad
- [ ] Probar en desktop (>1024px)
- [ ] Probar en tablet (768px-1024px)
- [ ] Probar en móvil (<768px)
- [ ] VoiceOrb escala correctamente
- [ ] Botones se reorganizan en grid
- [ ] Texto es legible en todos los tamaños

---

## 🔧 Pruebas de Integración con Backend

### Prerequisitos
```bash
# Backend debe estar corriendo en localhost:5000
# Con los endpoints:
# - POST /api/chat/realtime/sessions
# - POST /api/chat/realtime/sessions/<id>/stream
```

### Prueba Backend 1: Crear Sesión
```bash
# Test manual con curl
curl -X POST http://localhost:5000/api/chat/realtime/sessions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Session"}'

# Debería retornar:
# {
#   "id": "uuid",
#   "user_id": "uuid",
#   "title": "Test Session",
#   "created_at": "2025-10-12T...",
#   "updated_at": "2025-10-12T..."
# }
```

### Prueba Backend 2: Stream de Mensajes
```bash
# Test manual con curl (SSE)
curl -N -X POST http://localhost:5000/api/chat/realtime/sessions/SESSION_ID/stream \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"content": "Hola IA"}'

# Debería retornar eventos:
# data: {"type": "start", "session_id": "..."}
# 
# data: {"type": "content", "content": "Hola"}
# 
# data: {"type": "content", "content": ", ¿cómo"}
# 
# data: {"type": "content", "content": " estás?"}
# 
# data: {"type": "done", "message_id": "...", "full_content": "Hola, ¿cómo estás?"}
```

### Prueba Backend 3: Flujo Completo en UI
- [ ] Abrir página
- [ ] Presionar botón Goal
- [ ] Activar micrófono
- [ ] Decir: "Quiero crear un objetivo de ejercicio"
- [ ] Verificar en Network tab:
  - [ ] POST a `/api/chat/realtime/sessions` (201)
  - [ ] POST a `/api/chat/realtime/sessions/<id>/stream` (200)
  - [ ] Eventos SSE llegando correctamente
- [ ] VoiceOrb cambia de listening → processing → speaking
- [ ] Respuesta de IA aparece en pantalla
- [ ] Wizard se actualiza con datos parseados

---

## 🐛 Debugging Común

### Error: "Speech Recognition not supported"
**Causa:** Navegador no soporta Web Speech API
**Solución:** 
- Usar Chrome o Edge
- En Firefox/Safari: funcionalidad limitada

### Error: Permiso de micrófono denegado
**Causa:** Usuario rechazó permiso
**Solución:**
- Ir a configuración del navegador
- Permitir micrófono para localhost

### Error: No se reciben eventos SSE
**Causa:** Backend no retorna eventos correctamente
**Debug:**
```javascript
// En realtime.service.ts, agregar logs:
console.log('SSE raw data:', data);
console.log('SSE parsed event:', event);
```

### Error: Wizard no se actualiza
**Causa:** Parser de respuestas no encuentra patterns
**Debug:**
```javascript
// En +page.svelte, agregar logs:
function updateWizardFromResponse(response: string) {
  console.log('Parsing response:', response);
  // ... resto del código
}
```

### Error: Canvas no anima
**Causa:** requestAnimationFrame no se ejecuta
**Debug:**
```javascript
// En VoiceOrb.svelte
function drawWaves(ctx: CanvasRenderingContext2D) {
  console.log('Drawing frame', time);
  // ... resto del código
}
```

---

## 📊 Métricas a Observar

### Performance
- [ ] FPS del Canvas > 50fps
- [ ] Tiempo de respuesta de SSE < 2s
- [ ] Tiempo de reconocimiento de voz < 1s

### UX
- [ ] Animaciones suaves sin lag
- [ ] Transiciones visuales claras
- [ ] Feedback inmediato al interactuar

### Funcionalidad
- [ ] 100% de pasos del wizard funcionan
- [ ] 100% de tipos (Goal/Mind/Body) funcionan
- [ ] 100% de estados de VoiceOrb funcionan

---

## 🔍 Testing Avanzado

### Test con Voz Real

1. **Goal de Ejercicio:**
   - Decir: "Quiero correr un maratón en 6 meses"
   - Verificar: título="Correr un Maratón", type="medium", deadline=+6 meses

2. **Mind Task:**
   - Decir: "Necesito estudiar JavaScript por 2 horas"
   - Verificar: título="Estudiar JavaScript", duration=120

3. **Body Task:**
   - Decir: "Voy a hacer yoga 30 minutos cada mañana"
   - Verificar: título="Yoga Matutino", duration=30

### Test de Edge Cases

1. **Múltiples idiomas:**
   - Cambiar navegador a inglés
   - Verificar que sigue funcionando

2. **Conexión lenta:**
   - Throttle network a 3G
   - Verificar timeout y retry

3. **Backend caído:**
   - Apagar backend
   - Verificar mensaje de error amigable

4. **Permisos revocados:**
   - Revocar permiso de micrófono
   - Verificar que muestra instrucciones

---

## 🎯 Casos de Prueba Específicos

### Caso 1: Usuario Completa Goal con Voz
```
1. Abrir /assistant/realtime
2. Clic en "Goal"
3. Clic en VoiceOrb
4. Decir: "Crear objetivo de aprender React en 3 meses"
5. Esperar respuesta IA
6. Verificar que Paso 1 (título) se completa
7. Clic en VoiceOrb de nuevo
8. Decir: "Es un objetivo de mediano plazo"
9. Verificar que Paso 3 (tipo) se completa
10. Repetir hasta finalizar
```

**Resultado Esperado:**
- Todos los pasos completados ✅
- Goal creado en backend
- Usuario redirigido a /goals

### Caso 2: Usuario Cancela a Mitad de Camino
```
1. Abrir /assistant/realtime
2. Clic en "Mind"
3. Completar Paso 1
4. En Paso 2, clic en "Reiniciar"
5. Verificar wizard desaparece
6. Verificar estado limpio
```

**Resultado Esperado:**
- Wizard desaparece
- Botones reaparecen
- No hay datos guardados

### Caso 3: Usuario Usa Solo Teclado
```
1. Abrir /assistant/realtime
2. Tab hasta botón "Goal"
3. Enter para seleccionar
4. Tab hasta input
5. Escribir título
6. Esperar auto-advance
7. Repetir
```

**Resultado Esperado:**
- Navegación completa por teclado
- Focus visible en todo momento
- Wizard funciona sin mouse

---

## 📝 Reporte de Bugs

### Template de Bug Report

```markdown
## 🐛 Bug Report

**Descripción:**
[Describe el problema]

**Pasos para Reproducir:**
1. ...
2. ...
3. ...

**Resultado Esperado:**
[Qué debería pasar]

**Resultado Actual:**
[Qué pasó realmente]

**Navegador:**
- Chrome 118
- Firefox 119
- etc.

**Screenshots:**
[Si aplica]

**Console Errors:**
```
[Errores de consola]
```

**Network Tab:**
[Requests relevantes]
```

---

## ✅ Checklist Final Antes de Deploy

- [ ] Todas las pruebas manuales pasadas
- [ ] Backend integrado y funcionando
- [ ] No hay errores en consola
- [ ] No hay warnings en consola
- [ ] Performance aceptable (>50fps)
- [ ] Responsivo en todos los tamaños
- [ ] Accesible (ARIA, keyboard)
- [ ] Permisos manejados correctamente
- [ ] Errores muestran mensajes amigables
- [ ] Documentación actualizada

---

## 🎉 ¡Listo para Probar!

1. Inicia el backend
2. Inicia el frontend
3. Abre `http://localhost:5173/assistant/realtime`
4. Sigue el checklist
5. Reporta cualquier issue

**¡Buena suerte con las pruebas! 🚀**
