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
        if (!this.synthesis) {
            console.error('Text-to-speech not supported');
            return;
        }

        // Stop any ongoing speech
        this.stop();

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
    }

    stop() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
        }
    }

    pause() {
        if (this.synthesis && this.isSpeaking) {
            this.synthesis.pause();
        }
    }

    resume() {
        if (this.synthesis) {
            this.synthesis.resume();
        }
    }

    getIsSpeaking(): boolean {
        return this.isSpeaking;
    }

    getVoices(): SpeechSynthesisVoice[] {
        if (!this.synthesis) return [];
        return this.synthesis.getVoices();
    }
}

// Create singleton instances
export const speechRecognition = new SpeechRecognitionService();
export const textToSpeech = new TextToSpeechService();
