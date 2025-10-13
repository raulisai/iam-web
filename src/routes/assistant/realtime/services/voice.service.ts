/**
 * Voice Service - Web Speech API Integration
 * Maneja reconocimiento de voz y síntesis de voz del navegador
 */

// Type declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
	lang: string;
	continuous: boolean;
	interimResults: boolean;
	onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
	onend: ((this: SpeechRecognition, ev: Event) => any) | null;
	onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
	onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
	start(): void;
	stop(): void;
}

interface SpeechRecognitionErrorEvent extends Event {
	error: string;
	message: string;
}

interface SpeechRecognitionEvent extends Event {
	resultIndex: number;
	results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
	length: number;
	[index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
	isFinal: boolean;
	length: number;
	[index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
	transcript: string;
	confidence: number;
}

interface SpeechRecognitionConstructor {
	new (): SpeechRecognition;
}

declare global {
	interface Window {
		SpeechRecognition?: SpeechRecognitionConstructor;
		webkitSpeechRecognition?: SpeechRecognitionConstructor;
	}
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export interface VoiceConfig {
	lang?: string;
	continuous?: boolean;
	interimResults?: boolean;
}

export class VoiceService {
	private recognition: SpeechRecognition | null = null;
	private synthesis: SpeechSynthesis | null = null;
	private isListening = false;
	private onTranscriptCallback?: (transcript: string, isFinal: boolean) => void;
	private onStateChangeCallback?: (state: VoiceState) => void;
	private onErrorCallback?: (error: string) => void;

	constructor(config: VoiceConfig = {}) {
		// Check browser support
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		
		if (!SpeechRecognition) {
			console.error('Speech Recognition not supported in this browser');
			return;
		}

		this.recognition = new SpeechRecognition();
		this.recognition.lang = config.lang || 'es-ES';
		this.recognition.continuous = config.continuous ?? true;
		this.recognition.interimResults = config.interimResults ?? true;

		this.synthesis = window.speechSynthesis;

		this.setupRecognitionHandlers();
	}

	private setupRecognitionHandlers() {
		if (!this.recognition) return;

		this.recognition.onstart = () => {
			this.isListening = true;
			this.onStateChangeCallback?.('listening');
		};

		this.recognition.onend = () => {
			this.isListening = false;
			this.onStateChangeCallback?.('idle');
		};

		this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
			console.error('Speech recognition error:', event.error);
			this.onErrorCallback?.(event.error);
			this.onStateChangeCallback?.('idle');
		};

		this.recognition.onresult = (event: SpeechRecognitionEvent) => {
			let interimTranscript = '';
			let finalTranscript = '';

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					finalTranscript += transcript;
				} else {
					interimTranscript += transcript;
				}
			}

			if (finalTranscript) {
				this.onTranscriptCallback?.(finalTranscript, true);
			} else if (interimTranscript) {
				this.onTranscriptCallback?.(interimTranscript, false);
			}
		};
	}

	/**
	 * Start listening to user's voice
	 */
	startListening(): void {
		if (!this.recognition) {
			this.onErrorCallback?.('Speech recognition not available');
			return;
		}

		if (this.isListening) {
			console.warn('Already listening');
			return;
		}

		try {
			this.recognition.start();
		} catch (error) {
			console.error('Failed to start recognition:', error);
			this.onErrorCallback?.('Failed to start listening');
		}
	}

	/**
	 * Stop listening
	 */
	stopListening(): void {
		if (!this.recognition || !this.isListening) return;
		this.recognition.stop();
	}

	/**
	 * Toggle listening state
	 */
	toggleListening(): void {
		if (this.isListening) {
			this.stopListening();
		} else {
			this.startListening();
		}
	}

	/**
	 * Speak text using Text-to-Speech
	 */
	speak(text: string, onComplete?: () => void): void {
		if (!this.synthesis) {
			console.error('Speech synthesis not available');
			return;
		}

		// Cancel any ongoing speech
		this.synthesis.cancel();

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = 'es-ES';
		utterance.rate = 1.0;
		utterance.pitch = 1.0;
		utterance.volume = 1.0;

		utterance.onstart = () => {
			this.onStateChangeCallback?.('speaking');
		};

		utterance.onend = () => {
			this.onStateChangeCallback?.('idle');
			onComplete?.();
		};

		utterance.onerror = (event) => {
			console.error('Speech synthesis error:', event);
			this.onStateChangeCallback?.('idle');
		};

		this.synthesis.speak(utterance);
	}

	/**
	 * Stop any ongoing speech
	 */
	stopSpeaking(): void {
		if (this.synthesis) {
			this.synthesis.cancel();
		}
	}

	/**
	 * Register callback for transcript updates
	 */
	onTranscript(callback: (transcript: string, isFinal: boolean) => void): void {
		this.onTranscriptCallback = callback;
	}

	/**
	 * Register callback for state changes
	 */
	onStateChange(callback: (state: VoiceState) => void): void {
		this.onStateChangeCallback = callback;
	}

	/**
	 * Register callback for errors
	 */
	onError(callback: (error: string) => void): void {
		this.onErrorCallback = callback;
	}

	/**
	 * Check if currently listening
	 */
	getIsListening(): boolean {
		return this.isListening;
	}

	/**
	 * Cleanup
	 */
	destroy(): void {
		this.stopListening();
		this.stopSpeaking();
		this.recognition = null;
		this.synthesis = null;
	}
}
