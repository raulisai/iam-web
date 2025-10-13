# 💡 Asistente en Tiempo Real - Ejemplos de Uso

## 🎯 Casos de Uso Comunes

---

## 1️⃣ Crear un Goal con Voz

### **Flujo Usuario:**

1. **Abrir la página:**
   ```
   http://localhost:5173/assistant/realtime
   ```

2. **Presionar botón "Goal"** 🎯

3. **Presionar VoiceOrb** (círculo central)

4. **Hablar:** 
   > "Quiero crear un objetivo para correr un maratón en 6 meses"

5. **IA Responde:**
   > "Perfecto, veo que quieres lograr correr un maratón. El título de tu objetivo será 'Correr un Maratón' y lo completarás en 6 meses. ¿Es correcto?"

6. **Usuario confirma:**
   > "Sí, correcto"

7. **Wizard auto-rellena:**
   - ✅ Título: "Correr un Maratón"
   - ✅ Tipo: "Largo plazo"
   - ✅ Deadline: (6 meses desde hoy)

---

## 2️⃣ Crear Mind Task

### **Conversación Ejemplo:**

**Usuario:** 
> "Necesito estudiar programación funcional por 2 horas"

**IA:**
> "Entendido. Creo que quieres crear una tarea mental de 'Estudiar Programación Funcional' con duración de 2 horas. ¿Comenzamos?"

**Usuario:**
> "Sí"

**Wizard completa:**
- ✅ Título: "Estudiar Programación Funcional"
- ✅ Duración: "120 minutos"

---

## 3️⃣ Crear Body Task

### **Conversación Ejemplo:**

**Usuario:**
> "Quiero hacer yoga por 30 minutos todas las mañanas"

**IA:**
> "Excelente idea. Voy a crear una tarea física de Yoga de 30 minutos. ¿Quieres que sea un hábito diario?"

**Usuario:**
> "Sí, por favor"

**Wizard completa:**
- ✅ Título: "Yoga Matutino"
- ✅ Duración: "30 minutos"
- ✅ Frecuencia: "Diario"

---

## 🎨 Código de Integración

### **Integrar en otra página:**

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  
  function openRealtimeAssistant() {
    goto('/assistant/realtime');
  }
</script>

<button onclick={openRealtimeAssistant}>
  🎙️ Abrir Asistente de Voz
</button>
```

---

### **Usar VoiceOrb standalone:**

```svelte
<script lang="ts">
  import VoiceOrb from '$lib/components/VoiceOrb.svelte';
  import { VoiceService } from '$lib/services/voice.service';
  
  let voiceState = $state<VoiceState>('idle');
  let isListening = $state(false);
  let voiceService: VoiceService;
  
  onMount(() => {
    voiceService = new VoiceService();
    voiceService.onStateChange((state) => {
      voiceState = state;
    });
    voiceService.onTranscript((text, isFinal) => {
      if (isFinal) {
        console.log('User said:', text);
      }
    });
  });
  
  function toggleVoice() {
    voiceService.toggleListening();
    isListening = !isListening;
  }
</script>

<VoiceOrb 
  {voiceState}
  {isListening}
  onToggle={toggleVoice}
/>
```

---

### **Usar ActionButtons standalone:**

```svelte
<script lang="ts">
  import ActionButtons from '$lib/components/ActionButtons.svelte';
  
  function handleGoal() {
    console.log('Creating goal...');
  }
  
  function handleMind() {
    console.log('Creating mind task...');
  }
  
  function handleBody() {
    console.log('Creating body task...');
  }
</script>

<ActionButtons
  onGoalClick={handleGoal}
  onMindClick={handleMind}
  onBodyClick={handleBody}
/>
```

---

### **Usar TimelineWizard standalone:**

```svelte
<script lang="ts">
  import TimelineWizard, { type WizardStep } from '$lib/components/TimelineWizard.svelte';
  
  let steps: WizardStep[] = $state([
    {
      id: 'step1',
      label: 'Paso 1',
      description: 'Primer paso del proceso',
      icon: '1️⃣',
      isActive: true,
      isCompleted: false,
      isVisible: true
    },
    {
      id: 'step2',
      label: 'Paso 2',
      description: 'Segundo paso',
      icon: '2️⃣',
      isActive: false,
      isCompleted: false,
      isVisible: false
    }
  ]);
  
  let currentStep = $state(0);
  
  function handleValueChange(stepId: string, value: string) {
    const step = steps.find(s => s.id === stepId);
    if (step) {
      step.value = value;
      step.isCompleted = true;
      
      // Move to next
      if (currentStep < steps.length - 1) {
        steps[currentStep].isActive = false;
        currentStep++;
        steps[currentStep].isActive = true;
        steps[currentStep].isVisible = true;
      }
    }
  }
</script>

<TimelineWizard
  {steps}
  currentStepIndex={currentStep}
  onStepValueChange={handleValueChange}
/>
```

---

## 🔧 Personalizar Respuestas de IA

### **Parsear respuestas personalizadas:**

```typescript
function parseGoalFromAI(response: string): Partial<Goal> {
  const goal: Partial<Goal> = {};
  
  // Extraer título
  const titlePatterns = [
    /título[:\s]+"([^"]+)"/i,
    /objetivo[:\s]+"([^"]+)"/i,
    /llamar[:\s]+"([^"]+)"/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = response.match(pattern);
    if (match?.[1]) {
      goal.title = match[1];
      break;
    }
  }
  
  // Extraer tipo
  if (response.includes('corto plazo') || response.includes('semanas')) {
    goal.type = 'short';
  } else if (response.includes('mediano plazo') || response.includes('meses')) {
    goal.type = 'medium';
  } else if (response.includes('largo plazo') || response.includes('años')) {
    goal.type = 'long';
  }
  
  // Extraer deadline
  const datePatterns = [
    /en\s+(\d+)\s+(día|días|semana|semanas|mes|meses|año|años)/i,
    /(\d{4}-\d{2}-\d{2})/
  ];
  
  for (const pattern of datePatterns) {
    const match = response.match(pattern);
    if (match) {
      // Calcular fecha según el match
      // ...
      break;
    }
  }
  
  return goal;
}

// Uso:
const parsedGoal = parseGoalFromAI(aiResponse);
if (parsedGoal.title) {
  steps[0].value = parsedGoal.title;
  steps[0].isCompleted = true;
}
```

---

## 🎤 Comandos de Voz Avanzados

### **Implementar comandos especiales:**

```typescript
function handleVoiceCommand(transcript: string) {
  const lower = transcript.toLowerCase();
  
  // Comando: Cancelar
  if (lower.includes('cancelar') || lower.includes('reiniciar')) {
    resetWizard();
    voiceService.speak('He cancelado el proceso. ¿Qué más puedo hacer por ti?');
    return;
  }
  
  // Comando: Anterior
  if (lower.includes('anterior') || lower.includes('volver')) {
    goToPreviousStep();
    voiceService.speak('He vuelto al paso anterior.');
    return;
  }
  
  // Comando: Siguiente
  if (lower.includes('siguiente') || lower.includes('continuar')) {
    moveToNextStep();
    voiceService.speak('Pasemos al siguiente paso.');
    return;
  }
  
  // Comando: Ayuda
  if (lower.includes('ayuda') || lower.includes('qué hago')) {
    const helpText = 'Puedes decirme qué objetivo o tarea quieres crear y yo te ayudaré paso a paso.';
    voiceService.speak(helpText);
    return;
  }
  
  // Procesar normalmente
  processNormalInput(transcript);
}
```

---

## 📊 Métricas y Analytics

### **Trackear uso del asistente:**

```typescript
interface AssistantMetrics {
  sessionId: string;
  mode: 'goal' | 'mind' | 'body';
  startTime: Date;
  endTime?: Date;
  stepsCompleted: number;
  voiceInputs: number;
  manualInputs: number;
  completed: boolean;
}

let metrics: AssistantMetrics = {
  sessionId: crypto.randomUUID(),
  mode: currentMode,
  startTime: new Date(),
  stepsCompleted: 0,
  voiceInputs: 0,
  manualInputs: 0,
  completed: false
};

// Al completar paso
function onStepComplete(step: WizardStep, inputType: 'voice' | 'manual') {
  metrics.stepsCompleted++;
  if (inputType === 'voice') {
    metrics.voiceInputs++;
  } else {
    metrics.manualInputs++;
  }
}

// Al finalizar wizard
function onWizardComplete() {
  metrics.completed = true;
  metrics.endTime = new Date();
  
  // Enviar a analytics
  sendToAnalytics(metrics);
}
```

---

## 🌐 Internacionalización (i18n)

### **Soporte multiidioma:**

```typescript
const translations = {
  es: {
    voiceOrb: {
      idle: 'Presiona para hablar',
      listening: 'Escuchando...',
      processing: 'Procesando...',
      speaking: 'Hablando...'
    },
    actionButtons: {
      goal: 'Crear objetivo',
      mind: 'Tarea mental',
      body: 'Tarea física'
    }
  },
  en: {
    voiceOrb: {
      idle: 'Press to speak',
      listening: 'Listening...',
      processing: 'Processing...',
      speaking: 'Speaking...'
    },
    actionButtons: {
      goal: 'Create goal',
      mind: 'Mental task',
      body: 'Physical task'
    }
  }
};

// Uso
const t = (key: string) => {
  const lang = navigator.language.startsWith('es') ? 'es' : 'en';
  return translations[lang][key] || key;
};
```

---

## 🎨 Temas Personalizados

### **Dark/Light mode:**

```typescript
const themes = {
  dark: {
    background: 'from-neutral-950 via-neutral-900 to-neutral-950',
    text: 'text-white',
    border: 'border-neutral-700',
    card: 'bg-neutral-800'
  },
  light: {
    background: 'from-neutral-50 via-white to-neutral-50',
    text: 'text-neutral-900',
    border: 'border-neutral-300',
    card: 'bg-white'
  }
};

let currentTheme = $state<'dark' | 'light'>('dark');

// Aplicar
const theme = $derived(themes[currentTheme]);
```

---

## 🔔 Notificaciones

### **Feedback visual y auditivo:**

```typescript
function showSuccessNotification(message: string) {
  // Toast notification
  toastStore.success(message);
  
  // Haptic feedback (móvil)
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
  
  // Audio feedback
  const audio = new Audio('/sounds/success.mp3');
  audio.play();
  
  // Confetti animation
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}
```

---

## 🚀 Performance

### **Optimizaciones recomendadas:**

```typescript
// 1. Debounce de transcripciones
import { debounce } from '$lib/utils/debounce';

const debouncedHandleTranscript = debounce((transcript: string) => {
  handleTranscript(transcript);
}, 500);

voiceService.onTranscript((text, isFinal) => {
  if (isFinal) {
    debouncedHandleTranscript(text);
  }
});

// 2. Lazy load de Canvas
let VoiceOrbComponent: any;

onMount(async () => {
  const module = await import('./components/VoiceOrb.svelte');
  VoiceOrbComponent = module.default;
});

// 3. Suspender animaciones cuando no visible
let isVisible = $state(true);

onMount(() => {
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  });
  
  observer.observe(orbElement);
  
  return () => observer.disconnect();
});
```

---

## 🧪 Testing

### **Test unitario de VoiceService:**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { VoiceService } from './voice.service';

describe('VoiceService', () => {
  it('should initialize correctly', () => {
    const service = new VoiceService();
    expect(service).toBeDefined();
    expect(service.getIsListening()).toBe(false);
  });
  
  it('should start listening', () => {
    const service = new VoiceService();
    const onStateChange = vi.fn();
    service.onStateChange(onStateChange);
    
    service.startListening();
    
    expect(onStateChange).toHaveBeenCalledWith('listening');
  });
  
  it('should emit transcript', async () => {
    const service = new VoiceService();
    const onTranscript = vi.fn();
    service.onTranscript(onTranscript);
    
    // Simular evento de speech recognition
    // ...
    
    expect(onTranscript).toHaveBeenCalled();
  });
});
```

---

## 📖 Más Ejemplos

Revisa `REALTIME_ASSISTANT_README.md` para documentación completa.

---

**¡Feliz codificación! 🎉**
