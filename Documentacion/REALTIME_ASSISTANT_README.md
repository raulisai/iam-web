# 🎙️ Asistente en Tiempo Real - Documentación Completa

## 📋 Resumen
El **Asistente en Tiempo Real** es una interfaz conversacional de voz que combina un dashboard interactivo con un asistente IA para crear Goals, Mind y Body tasks de forma guiada y didáctica.

---

## 🎯 Características Principales

### 1. **Interfaz Didáctica**
- ✅ **TasksNowCarousel** reutilizado en la parte superior
- ✅ **3 Botones Minimalistas** (Goal, Mind, Body) para iniciar creación asistida
- ✅ **TimelineWizard** con pasos que aparecen/desaparecen dinámicamente
- ✅ **VoiceOrb** animado con ondas que responde a la voz

### 2. **Reconocimiento de Voz**
- 🎤 Web Speech API nativa del navegador
- 🌐 Soporte para español (es-ES)
- 🔄 Transcripción en tiempo real (interim results)
- ⚡ Estados visuales: idle, listening, processing, speaking

### 3. **Streaming de IA**
- 📡 Server-Sent Events (SSE) para respuestas en tiempo real
- 🤖 Integración con backend `/api/chat/realtime`
- ✨ Auto-relleno de formularios basado en respuestas de IA
- 🎯 Parseo inteligente de respuestas

---

## 🗂️ Estructura de Archivos

```
src/routes/assistant/realtime/
├── +page.svelte                      # Página principal
├── components/
│   ├── ActionButtons.svelte          # 3 botones Goal/Mind/Body
│   ├── TimelineWizard.svelte         # Línea de tiempo con pasos
│   └── VoiceOrb.svelte              # Círculo animado con ondas
└── services/
    ├── voice.service.ts              # Web Speech API
    └── realtime.service.ts           # SSE streaming
```

---

## 🎨 Componentes Detallados

### 1️⃣ **ActionButtons.svelte**

**Props:**
- `onGoalClick: () => void` - Handler para crear Goal
- `onMindClick: () => void` - Handler para crear Mind task
- `onBodyClick: () => void` - Handler para crear Body task
- `disabled?: boolean` - Deshabilita botones durante escucha

**Características:**
- ✨ Animaciones con `scale` y `elasticOut`
- 🎨 Gradientes únicos por tipo (blue/purple/emerald)
- 💫 Efectos de hover con sparkles animados
- ♿ Accesibilidad con focus states

**Código de Ejemplo:**
```svelte
<ActionButtons
  onGoalClick={initializeGoalWizard}
  onMindClick={initializeMindWizard}
  onBodyClick={initializeBodyWizard}
  disabled={isListening}
/>
```

---

### 2️⃣ **TimelineWizard.svelte**

**Props:**
- `steps: WizardStep[]` - Array de pasos del wizard
- `currentStepIndex: number` - Índice del paso actual
- `onStepValueChange?: (stepId: string, value: string) => void` - Callback al cambiar valores

**WizardStep Interface:**
```typescript
interface WizardStep {
  id: string;              // Identificador único
  label: string;           // Título del paso
  description: string;     // Descripción del paso
  icon: string;            // Emoji del paso
  value?: string;          // Valor actual
  isActive: boolean;       // ¿Está activo?
  isCompleted: boolean;    // ¿Está completado?
  isVisible: boolean;      // ¿Es visible?
}
```

**Características:**
- 📍 Línea vertical que conecta los pasos
- ✅ Indicadores visuales de progreso
- 🎭 Transiciones suaves (slide + fly)
- 📝 Inputs contextuales según el tipo de paso
- 🎨 Colores dinámicos según estado

**Tipos de Pasos:**
1. **Text Input** - Para título y descripción
2. **Type Selection** - Botones para corto/mediano/largo
3. **Date Input** - Para fecha límite

---

### 3️⃣ **VoiceOrb.svelte**

**Props:**
- `state: VoiceState` - Estado actual ('idle' | 'listening' | 'processing' | 'speaking')
- `isListening: boolean` - Si está escuchando
- `onToggle: () => void` - Handler para activar/desactivar

**Características:**
- 🎨 Canvas HTML5 con ondas animadas
- 🌈 Colores dinámicos según estado:
  - `idle`: Púrpura/índigo
  - `listening`: Verde/teal
  - `processing`: Naranja/rojo
  - `speaking`: Azul/cyan
- 💫 Efecto glow cuando activo
- ♿ Completamente accesible (ARIA)

**Animación:**
- Ondas radiales que pulsan desde el centro
- Frecuencia de ondas aumenta cuando está activo
- Gradientes radiales para efecto de profundidad

---

### 4️⃣ **VoiceService** (`voice.service.ts`)

**Clase principal para manejar voz:**

```typescript
const voiceService = new VoiceService({
  lang: 'es-ES',
  continuous: true,
  interimResults: true
});

// Escuchar transcripciones
voiceService.onTranscript((transcript, isFinal) => {
  if (isFinal) {
    handleUserMessage(transcript);
  }
});

// Escuchar cambios de estado
voiceService.onStateChange((state) => {
  console.log('State:', state);
});

// Iniciar/detener escucha
voiceService.startListening();
voiceService.stopListening();
voiceService.toggleListening();

// Hablar
voiceService.speak('Hola, ¿cómo estás?', () => {
  console.log('Finished speaking');
});
```

**Métodos:**
- `startListening()` - Inicia reconocimiento de voz
- `stopListening()` - Detiene reconocimiento
- `toggleListening()` - Alterna estado
- `speak(text, onComplete?)` - Text-to-Speech
- `stopSpeaking()` - Cancela TTS
- `onTranscript(callback)` - Registra callback para transcripciones
- `onStateChange(callback)` - Registra callback para cambios de estado
- `onError(callback)` - Registra callback para errores
- `destroy()` - Limpieza

---

### 5️⃣ **RealtimeService** (`realtime.service.ts`)

**Clase para streaming de IA:**

```typescript
const realtimeService = new RealtimeService(
  'http://localhost:5000',
  authToken
);

// Crear sesión
const session = await realtimeService.createSession(
  'Mi Asistente',
  'Mensaje inicial'
);

// Enviar mensaje con streaming
realtimeService.streamMessage(session.id, 'Hola IA', {
  onStart: (sessionId) => console.log('Started:', sessionId),
  onContent: (chunk) => console.log('Chunk:', chunk),
  onDone: (messageId, fullContent) => console.log('Done:', fullContent),
  onError: (error) => console.error('Error:', error)
});
```

**Métodos:**
- `createSession(title?, initialMessage?)` - Crea nueva sesión
- `streamMessage(sessionId, content, callbacks)` - Envía mensaje con streaming
- `closeStream()` - Cierra stream actual
- `destroy()` - Limpieza

**Eventos SSE:**
```typescript
interface StreamEvent {
  type: 'start' | 'content' | 'done' | 'error';
  session_id?: string;
  content?: string;        // Chunk de texto
  message_id?: string;
  full_content?: string;   // Contenido completo
  error?: string;
}
```

---

## 🔄 Flujo de Interacción

### **Flujo Completo:**

```
1. Usuario accede a /assistant/realtime
   ↓
2. Ve TasksNowCarousel con tareas actuales
   ↓
3. Presiona botón "Goal", "Mind" o "Body"
   ↓
4. Se inicializa TimelineWizard con pasos específicos
   ↓
5. Usuario presiona VoiceOrb
   ↓
6. VoiceOrb cambia a estado "listening" (verde)
   ↓
7. Usuario habla: "Quiero crear un objetivo de ejercicio"
   ↓
8. VoiceService transcribe en tiempo real
   ↓
9. Transcripción final se envía a RealtimeService
   ↓
10. Backend responde via SSE (streaming)
    ↓
11. VoiceOrb cambia a estado "processing" (naranja)
    ↓
12. Respuesta se muestra en tiempo real
    ↓
13. TimelineWizard auto-rellena campos según respuesta
    ↓
14. VoiceOrb cambia a estado "speaking" (azul)
    ↓
15. TTS lee la respuesta de la IA
    ↓
16. Usuario continúa al siguiente paso
    ↓
17. Proceso se repite hasta completar wizard
```

---

## 🎯 Wizards Específicos

### **Goal Wizard:**
```typescript
[
  { id: 'title', label: 'Título del Objetivo', icon: '🎯' },
  { id: 'description', label: 'Descripción', icon: '📝' },
  { id: 'type', label: 'Tipo de Objetivo', icon: '⏱️' },
  { id: 'deadline', label: 'Fecha Límite', icon: '📅' }
]
```

### **Mind Wizard:**
```typescript
[
  { id: 'title', label: 'Tarea Mental', icon: '🧠' },
  { id: 'duration', label: 'Duración', icon: '⏱️' }
]
```

### **Body Wizard:**
```typescript
[
  { id: 'title', label: 'Tarea Física', icon: '💪' },
  { id: 'duration', label: 'Duración', icon: '⏱️' }
]
```

---

## 🔧 Configuración

### **Variables de Entorno:**
```bash
# En .env o .env.local
PUBLIC_API_BASE_URL=http://localhost:5000
```

### **Actualizar en +page.svelte:**
```typescript
const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:5000';
```

---

## 🎨 Personalización

### **Cambiar Colores de Estados:**
```typescript
// En VoiceOrb.svelte
const stateColors = {
  idle: { primary: '#6366f1', secondary: '#8b5cf6' },
  listening: { primary: '#10b981', secondary: '#14b8a6' },
  processing: { primary: '#f59e0b', secondary: '#ef4444' },
  speaking: { primary: '#3b82f6', secondary: '#06b6d4' }
};
```

### **Cambiar Idioma de Voz:**
```typescript
const voiceService = new VoiceService({
  lang: 'en-US', // Inglés
  // o 'fr-FR', 'de-DE', etc.
});
```

### **Modificar Pasos del Wizard:**
```typescript
// Agregar nuevo paso
wizardSteps = [
  ...wizardSteps,
  {
    id: 'priority',
    label: 'Prioridad',
    description: '¿Qué tan importante es?',
    icon: '⭐',
    isActive: false,
    isCompleted: false,
    isVisible: false
  }
];
```

---

## 🐛 Debugging

### **Verificar Soporte de Web Speech API:**
```javascript
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  console.log('✅ Speech Recognition supported');
} else {
  console.error('❌ Speech Recognition NOT supported');
}
```

### **Monitorear Eventos SSE:**
```typescript
// En realtime.service.ts, agregar logs:
console.log('SSE Event:', event);
```

### **Inspeccionar Estado del Wizard:**
```svelte
<!-- En +page.svelte -->
<pre>{JSON.stringify(wizardSteps, null, 2)}</pre>
```

---

## 🚀 Optimizaciones Futuras

### **1. Parseo Inteligente de IA**
Implementar NLP para extraer campos estructurados:
```typescript
function parseAIResponse(response: string): Partial<GoalData> {
  // Extraer título
  const titleMatch = response.match(/título[:\s]+"([^"]+)"/i);
  
  // Extraer fecha
  const dateMatch = response.match(/\d{4}-\d{2}-\d{2}/);
  
  return {
    title: titleMatch?.[1],
    deadline: dateMatch?.[0]
  };
}
```

### **2. Persistencia Local**
Guardar progreso en localStorage:
```typescript
localStorage.setItem('wizard-progress', JSON.stringify(wizardSteps));
```

### **3. Gestos de Voz**
Comandos especiales:
```typescript
if (transcript.includes('cancelar')) {
  resetWizard();
} else if (transcript.includes('anterior')) {
  goToPreviousStep();
}
```

### **4. Feedback Háptico**
En dispositivos móviles:
```typescript
if ('vibrate' in navigator) {
  navigator.vibrate(50); // Vibrar al completar paso
}
```

---

## 📱 Soporte de Navegadores

| Navegador | Web Speech API | SSE | Canvas |
|-----------|----------------|-----|--------|
| Chrome    | ✅             | ✅  | ✅     |
| Firefox   | ⚠️ (parcial)   | ✅  | ✅     |
| Safari    | ⚠️ (parcial)   | ✅  | ✅     |
| Edge      | ✅             | ✅  | ✅     |

**Nota:** Firefox y Safari tienen soporte limitado de Web Speech API. Se recomienda Chrome/Edge para mejor experiencia.

---

## 🔐 Seguridad

### **Permisos de Micrófono:**
El navegador solicitará permiso antes de acceder al micrófono. Asegúrate de:
- Usar HTTPS en producción
- Explicar al usuario por qué necesitas el permiso
- Manejar el caso cuando se deniegue el permiso

### **Validación de Datos:**
```typescript
function sanitizeInput(value: string): string {
  return value.trim().replace(/[<>]/g, '');
}
```

---

## 🎓 Recursos Adicionales

- [Web Speech API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Server-Sent Events Spec](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [Canvas API Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)

---

## 📞 Soporte

Para problemas o sugerencias, contacta al equipo de desarrollo o abre un issue en el repositorio.

---

**¡Disfruta tu Asistente en Tiempo Real! 🎉**
