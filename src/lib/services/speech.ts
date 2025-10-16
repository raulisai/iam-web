/**
 * Speech Recognition and Text-to-Speech Service
 * Uses Web Speech API (built-in browser API)
 */

// Speech Recognition (Voice to Text)
export class SpeechRecognitionService {
    private recognition: any = null;
    private isListening = false;
    private onResultCallback: ((text: string) => void) | null = null;
    private onEndCallback: (() => void) | null = null;
    private onErrorCallback: ((error: string) => void) | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = 'en-US';

                this.recognition.onresult = (event: any) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    if (this.onResultCallback) {
                        this.onResultCallback(finalTranscript || interimTranscript);
                    }
                };

                this.recognition.onerror = (event: any) => {
                    // Only log non-network errors to avoid console spam
                    if (event.error !== 'network') {
                        console.error('Speech recognition error:', event.error);
                    }
                    
                    // Stop listening on error
                    this.isListening = false;
                    
                    if (this.onErrorCallback) {
                        // Provide user-friendly error messages
                        let errorMessage = '';
                        switch (event.error) {
                            case 'network':
                                errorMessage = 'Network error. Speech recognition requires an active internet connection.';
                                break;
                            case 'not-allowed':
                            case 'permission-denied':
                                errorMessage = 'Microphone access denied. Please grant permission in your browser settings.';
                                break;
                            case 'no-speech':
                                errorMessage = 'No speech detected. Please try again.';
                                break;
                            case 'audio-capture':
                                errorMessage = 'No microphone found. Please connect a microphone and try again.';
                                break;
                            case 'aborted':
                                errorMessage = 'Speech recognition aborted.';
                                break;
                            default:
                                errorMessage = `Speech recognition error: ${event.error}`;
                        }
                        this.onErrorCallback(errorMessage);
                    }
                };

                this.recognition.onend = () => {
                    this.isListening = false;
                    if (this.onEndCallback) {
                        this.onEndCallback();
                    }
                };
            }
        }
    }

    isSupported(): boolean {
        return this.recognition !== null;
    }

    start(
        onResult: (text: string) => void,
        onEnd: () => void,
        onError: (error: string) => void
    ) {
        if (!this.recognition) {
            onError('Speech recognition not supported');
            return;
        }

        // Check if already listening to prevent multiple starts
        if (this.isListening) {
            console.warn('Speech recognition already running');
            return;
        }

        this.onResultCallback = onResult;
        this.onEndCallback = onEnd;
        this.onErrorCallback = onError;

        try {
            this.recognition.start();
            this.isListening = true;
        } catch (error: any) {
            console.error('Error starting speech recognition:', error);
            this.isListening = false;
            
            // Handle specific error cases
            if (error.message && error.message.includes('already started')) {
                onError('Speech recognition is already running');
            } else {
                onError('Failed to start speech recognition. Please try again.');
            }
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Error stopping speech recognition:', error);
            } finally {
                this.isListening = false;
            }
        }
    }

    abort() {
        if (this.recognition) {
            try {
                this.recognition.abort();
            } catch (error) {
                console.error('Error aborting speech recognition:', error);
            } finally {
                this.isListening = false;
            }
        }
    }

    getIsListening(): boolean {
        return this.isListening;
    }
}

// Text-to-Speech Service
export class TextToSpeechService {
    private synthesis: SpeechSynthesis | null = null;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private isSpeaking = false;

    constructor() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        }
    }

    isSupported(): boolean {
        // Verificar si existe el bridge nativo de Android
        if (typeof window !== 'undefined' && (window as any).AndroidTTS) {
            return true;
        }
        // Verificar Web Speech API
        return this.synthesis !== null;
    }

    speak(text: string, options?: {
        rate?: number;
        pitch?: number;
        volume?: number;
        lang?: string;
        onEnd?: () => void;
        onError?: (error: any) => void;
    }) {
        // Stop any ongoing speech
        this.stop();

        // Priorizar Android TTS nativo si está disponible
        if (typeof window !== 'undefined' && (window as any).AndroidTTS) {
            try {
                console.log('Using Android native TTS for:', text.substring(0, 50));
                console.log('AndroidTTS object:', (window as any).AndroidTTS);
                console.log('Calling AndroidTTS.speak()...');
                this.isSpeaking = true;
                (window as any).AndroidTTS.speak(text);
                console.log('AndroidTTS.speak() called successfully');
                
                // Simular callback onEnd después de un tiempo estimado
                const estimatedDuration = text.length * 50; // ~50ms por carácter
                setTimeout(() => {
                    this.isSpeaking = false;
                    if (options?.onEnd) {
                        options.onEnd();
                    }
                }, estimatedDuration);
                
                return;
            } catch (error) {
                console.error('Error using Android TTS:', error);
                this.isSpeaking = false;
                if (options?.onError) {
                    options.onError(error);
                }
                return;
            }
        }

        // Fallback a Web Speech API
        if (!this.synthesis) {
            console.error('Text-to-speech not supported');
            if (options?.onError) {
                options.onError(new Error('TTS not supported'));
            }
            return;
        }

        try {
            // En Android WebView, las voces pueden no estar disponibles inmediatamente
            // Esperamos a que se carguen si es necesario
            const voices = this.synthesis.getVoices();
            if (voices.length === 0) {
                // Intentar cargar voces primero
                this.synthesis.addEventListener('voiceschanged', () => {
                    this.speakInternal(text, options);
                }, { once: true });
                
                // Timeout de seguridad: intentar hablar de todos modos después de 1 segundo
                setTimeout(() => {
                    if (!this.isSpeaking) {
                        this.speakInternal(text, options);
                    }
                }, 1000);
            } else {
                this.speakInternal(text, options);
            }
        } catch (error) {
            console.error('Error preparing speech:', error);
            // Intentar hablar de todos modos como fallback
            this.speakInternal(text, options);
        }
    }

    private speakInternal(text: string, options?: {
        rate?: number;
        pitch?: number;
        volume?: number;
        lang?: string;
        onEnd?: () => void;
        onError?: (error: any) => void;
    }) {
        // Solo Web Speech API (Android TTS se maneja en speak())
        if (!this.synthesis) return;

        try {
            this.currentUtterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance.rate = options?.rate ?? 1.0;
            this.currentUtterance.pitch = options?.pitch ?? 1.0;
            this.currentUtterance.volume = options?.volume ?? 1.0;
            this.currentUtterance.lang = options?.lang ?? 'en-US';

            this.currentUtterance.onstart = () => {
                this.isSpeaking = true;
            };

            this.currentUtterance.onend = () => {
                this.isSpeaking = false;
                if (options?.onEnd) {
                    options.onEnd();
                }
            };

            this.currentUtterance.onerror = (event) => {
                this.isSpeaking = false;
                console.error('Speech synthesis error:', event);
                if (options?.onError) {
                    options.onError(event);
                }
            };

            this.synthesis.speak(this.currentUtterance);
        } catch (error) {
            console.error('Error calling speak():', error);
            this.isSpeaking = false;
            if (options?.onError) {
                options.onError(error);
            }
        }
    }

    stop() {
        // Usar bridge nativo de Android si está disponible
        if (typeof window !== 'undefined' && (window as any).AndroidTTS) {
            try {
                // stop() es opcional en Android TTS
                if (typeof (window as any).AndroidTTS.stop === 'function') {
                    (window as any).AndroidTTS.stop();
                } else {
                    console.log('AndroidTTS.stop() not available, TTS will finish naturally');
                }
            } catch (error) {
                console.error('Error stopping Android TTS:', error);
            } finally {
                this.isSpeaking = false;
            }
            return;
        }
        
        // Fallback a Web Speech API
        if (this.synthesis) {
            try {
                this.synthesis.cancel();
            } catch (error) {
                console.error('Error stopping speech:', error);
            } finally {
                this.isSpeaking = false;
            }
        }
    }

    pause() {
        if (this.synthesis && this.isSpeaking) {
            try {
                this.synthesis.pause();
            } catch (error) {
                console.error('Error pausing speech:', error);
            }
        }
    }

    resume() {
        if (this.synthesis) {
            try {
                this.synthesis.resume();
            } catch (error) {
                console.error('Error resuming speech:', error);
            }
        }
    }

    getIsSpeaking(): boolean {
        return this.isSpeaking;
    }

    getVoices(): SpeechSynthesisVoice[] {
        if (!this.synthesis) return [];
        try {
            return this.synthesis.getVoices();
        } catch (error) {
            console.error('Error getting voices:', error);
            return [];
        }
    }
}

// Create singleton instances
export const speechRecognition = new SpeechRecognitionService();
export const textToSpeech = new TextToSpeechService();
