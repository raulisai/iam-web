# 🎤 Voice Assistant Integration

## Descripción

El asistente de IA ahora incluye capacidades completas de voz utilizando la **Web Speech API** nativa del navegador. Esta es una API gratuita y de código abierto integrada directamente en los navegadores modernos, sin necesidad de librerías externas o servicios de terceros.

## ✨ Características

### 1. **Voice-to-Text (Reconocimiento de Voz)**
- Convierte tu voz en texto en tiempo real
- Soporte para múltiples idiomas
- Transcripción continua mientras hablas
- Resultados intermedios y finales

### 2. **Text-to-Speech (Síntesis de Voz)**
- El asistente puede leer sus respuestas en voz alta
- Control de reproducción (play/pause/stop)
- Modo "Auto-speak" para respuestas automáticas
- Personalizable (velocidad, tono, volumen)

## 🎯 Cómo Usar

### Entrada de Voz (Voice Input)

1. **Haz click en el botón del micrófono** 🎤
2. **Habla claramente** - tu voz se convertirá en texto automáticamente
3. **El texto aparecerá** en el campo de entrada
4. **Presiona enviar** o haz click nuevamente en el micrófono para detener

**Indicadores visuales:**
- 🔴 Rojo pulsante = Escuchando activamente
- ⚪ Gris = Inactivo

### Reproducción de Voz (Voice Output)

1. **Haz click en el botón de altavoz** 🔊
2. **El último mensaje de la IA** se reproducirá
3. **Haz click nuevamente** para detener

**Modo Auto-speak:**
- Activa la casilla "Auto-speak" 
- Todas las respuestas de la IA se reproducirán automáticamente
- Ideal para uso manos libres

## 🌐 Compatibilidad de Navegadores

### Reconocimiento de Voz (Speech Recognition)
✅ **Chrome/Edge** - Soporte completo ⚠️ **Requiere internet**  
✅ **Safari** (iOS 14.5+) - Soporte completo ⚠️ **Requiere internet**  
⚠️ **Firefox** - Soporte experimental (requiere activación manual)  
❌ **Opera** - Limitado  

> **⚠️ IMPORTANTE**: El reconocimiento de voz requiere una conexión a internet activa porque utiliza los servidores de Google para procesar el audio.

### Síntesis de Voz (Text-to-Speech)
✅ **Chrome/Edge** - Soporte completo ✅ **Funciona offline**  
✅ **Safari** - Soporte completo ✅ **Funciona offline**  
✅ **Firefox** - Soporte completo ✅ **Funciona offline**  
✅ **Opera** - Soporte completo ✅ **Funciona offline**  

## 🔧 Configuración Técnica

### Ubicación de Archivos

```
src/
├── lib/
│   └── services/
│       └── speech.ts          # Servicio de voz
└── routes/
    └── assistant/
        └── +page.svelte        # Integración UI
```

### API Utilizada

**Web Speech API** es una API nativa del navegador que incluye:

1. **SpeechRecognition** (Voice-to-Text)
   - `webkitSpeechRecognition` (Chrome/Safari)
   - `SpeechRecognition` (Firefox experimental)

2. **SpeechSynthesis** (Text-to-Speech)
   - `window.speechSynthesis`
   - `SpeechSynthesisUtterance`

### Configuración Actual

```typescript
// Reconocimiento de Voz
recognition.continuous = true;      // Transcripción continua
recognition.interimResults = true;  // Resultados intermedios
recognition.lang = 'en-US';        // Idioma inglés

// Síntesis de Voz
utterance.rate = 1.0;    // Velocidad normal
utterance.pitch = 1.0;   // Tono normal
utterance.volume = 1.0;  // Volumen máximo
utterance.lang = 'en-US'; // Idioma inglés
```

## 🎨 Controles de la Interfaz

### Móvil
- **Botón Micrófono**: Inicia/detiene grabación de voz
- **Botón Altavoz**: Reproduce/detiene último mensaje
- **Checkbox Auto-speak**: Activa reproducción automática
- Los controles aparecen encima del campo de entrada

### Escritorio
- **Botón Micrófono**: Lado derecho, junto a sugerencias
- **Botón Altavoz**: Lado derecho, junto a micrófono
- **Checkbox Auto-speak**: Lado derecho, junto a altavoz
- Tooltips informativos en hover

## 🔐 Permisos

### Primera Vez
El navegador solicitará permiso para acceder al micrófono:
1. Haz click en "Permitir" cuando aparezca el prompt
2. El permiso se guardará para futuras sesiones
3. Si se niega, las funciones de voz estarán deshabilitadas

### Gestión de Permisos
- **Chrome**: Settings > Privacy and security > Site settings > Microphone
- **Safari**: Settings > Websites > Microphone
- **Firefox**: Settings > Privacy & Security > Permissions > Microphone

## 🚀 Características Avanzadas

### Detección Automática de Soporte
```typescript
speechSupported = speechRecognition.isSupported();
ttsSupported = textToSpeech.isSupported();
```

Los botones solo aparecen si el navegador soporta la funcionalidad.

### Auto-detención al Enviar
Al enviar un mensaje mientras se está grabando:
- La grabación se detiene automáticamente
- El mensaje se envía con el texto capturado
- Previene errores de estado

### Limpieza de Recursos
```typescript
onDestroy(() => {
    stopListening();
    stopSpeaking();
});
```

Los recursos de voz se liberan correctamente al destruir el componente.

## 💡 Tips de Uso

1. **Habla claro y a un ritmo normal** - mejora la precisión
2. **Usa en ambiente silencioso** - reduce errores de transcripción
3. **Prueba diferentes navegadores** - Chrome suele tener mejor precisión
4. **Ajusta el volumen del dispositivo** - para mejor experiencia TTS
5. **Usa auriculares** - previene retroalimentación de audio

## 🐛 Solución de Problemas

### Error de red (Network Error)
- ✅ **Verifica tu conexión a internet** - El reconocimiento de voz requiere internet
- ✅ Recarga la página si la conexión se interrumpió
- ✅ El sistema detecta automáticamente cuando recuperas la conexión
- ✅ La síntesis de voz (reproducción) sí funciona offline

### El micrófono no funciona
- ✅ Verifica permisos del navegador
- ✅ Asegúrate de usar HTTPS (requerido por la API)
- ✅ Revisa que el micrófono esté conectado
- ✅ **Verifica tu conexión a internet**
- ✅ Prueba en otro navegador

### La voz no se reproduce
- ✅ Verifica el volumen del sistema
- ✅ Verifica el volumen del navegador
- ✅ Asegúrate que no esté en mute
- ✅ Prueba cerrar y reabrir el navegador

### Transcripción incorrecta
- ✅ Habla más despacio
- ✅ Acércate más al micrófono
- ✅ Reduce ruido de fondo
- ✅ **Verifica que tu conexión a internet sea estable**
- ✅ Considera cambiar el idioma de reconocimiento

## 📚 Recursos Adicionales

- [MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Speech Recognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [Can I Use - Web Speech API](https://caniuse.com/speech-recognition)

## ⚠️ Requisitos Importantes

### Reconocimiento de Voz (Voice-to-Text)
- ⚠️ **Requiere conexión a internet activa**
- El audio se envía a los servidores de Google para procesamiento
- La aplicación detecta automáticamente si pierdes la conexión
- Se muestra un mensaje de error claro si no hay internet

### Síntesis de Voz (Text-to-Speech)
- ✅ **Funciona completamente offline**
- El procesamiento es 100% local en el navegador
- No requiere conexión a internet

## 🎉 Ventajas

✅ **Gratis** - API nativa del navegador, sin costos  
✅ **Privado** - Text-to-Speech se procesa localmente  
✅ **Rápido** - Respuesta inmediata del TTS  
✅ **Sin dependencias** - No requiere librerías externas  
✅ **Open Source** - Parte del estándar web abierto  
✅ **Detección automática** - Detecta estado de red y permisos  

---

¡Disfruta hablando con tu asistente de IA! 🎤🤖
