/**
 * Realtime Service - Server-Sent Events (SSE) Integration
 * Maneja streaming de respuestas de IA desde el backend
 */

import { BACKEND_URL } from '$lib/config';

export interface StreamEvent {
	type: 'start' | 'content' | 'done' | 'error';
	session_id?: string;
	content?: string;
	message_id?: string;
	full_content?: string;
	error?: string;
}

export interface ChatSession {
	id: string;
	user_id: string;
	title?: string;
	created_at: string;
	updated_at: string;
}

export class RealtimeService {
	private baseUrl: string;
	private token: string;
	private abortController: AbortController | null = null;

	constructor(baseUrl: string, token: string) {
		// Use the configured backend URL if none provided
		this.baseUrl = baseUrl || BACKEND_URL;
		this.token = token;
	}

	/**
	 * Create a new chat session
	 */
	async createSession(title?: string, initialMessage?: string): Promise<ChatSession> {
		if (!this.token) {
			throw new Error('Token no disponible. Por favor inicia sesión.');
		}

		const url = `${this.baseUrl}/api/chat/realtime/sessions`;
		console.log('Creating session at:', url);
		console.log('Token length:', this.token.length);

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': `Bearer ${this.token}`
				},
				body: JSON.stringify({
					title: title || 'Asistente en Tiempo Real',
					initial_message: initialMessage
				})
			});

			console.log('Create session response status:', response.status);
			console.log('Create session response headers:', Object.fromEntries(response.headers.entries()));

			if (!response.ok) {
				const errorText = await response.text();
				console.error('Create session failed:', {
					status: response.status,
					statusText: response.statusText,
					body: errorText,
					headers: Object.fromEntries(response.headers.entries())
				});
				throw new Error(`Failed to create session: ${response.status} ${response.statusText} - ${errorText}`);
			}

			const contentType = response.headers.get('content-type');
			if (!contentType || !contentType.includes('application/json')) {
				const responseText = await response.text();
				console.error('Unexpected response type:', contentType, 'Body:', responseText);
				throw new Error(`Unexpected response type: ${contentType}`);
			}

			const session = await response.json();
			console.log('Session created successfully:', session);
			return session;
		} catch (error) {
			if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
				console.error('Network error. Check backend URL:', this.baseUrl);
				throw new Error('Error de red: verifica que el backend esté ejecutándose');
			}
			throw error;
		}
	}

	/**
	 * Stream a message to the assistant
	 */
	streamMessage(
		sessionId: string,
		content: string,
		callbacks: {
			onStart?: (sessionId: string) => void;
			onContent?: (chunk: string) => void;
			onDone?: (messageId: string, fullContent: string) => void;
			onError?: (error: string) => void;
		}
	): void {
		// Cancel any existing stream
		this.cancelStream();

		// Create new abort controller for this stream
		this.abortController = new AbortController();

		this.streamWithFetch(sessionId, content, callbacks);
	}

	private async streamWithFetch(
		sessionId: string,
		content: string,
		callbacks: {
			onStart?: (sessionId: string) => void;
			onContent?: (chunk: string) => void;
			onDone?: (messageId: string, fullContent: string) => void;
			onError?: (error: string) => void;
		}
	): Promise<void> {
		if (!this.token) {
			callbacks.onError?.('Token no disponible');
			return;
		}

		if (!content || content.trim().length === 0) {
			callbacks.onError?.('El mensaje no puede estar vacío');
			return;
		}

		const url = `${this.baseUrl}/api/chat/realtime/sessions/${sessionId}/stream`;

		try {
			console.log('Starting stream to:', url);
			console.log('Session ID:', sessionId);
			console.log('Content length:', content.length);
			console.log('Request headers:', {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer [REDACTED]',
				'Accept': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			});

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'text/event-stream',
					'Authorization': `Bearer ${this.token}`,
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive'
				},
				body: JSON.stringify({ content }),
				signal: this.abortController?.signal
			});

			console.log('Response status:', response.status);
			console.log('Response headers:', Object.fromEntries(response.headers.entries()));

			if (!response.ok) {
				const contentType = response.headers.get('content-type');
				let errorText = '';
				
				try {
					if (contentType?.includes('application/json')) {
						const errorData = await response.json();
						errorText = JSON.stringify(errorData);
					} else {
						errorText = await response.text();
					}
				} catch (e) {
					errorText = 'No se pudo leer el cuerpo del error';
				}
				
				console.error('Stream request failed:', {
					status: response.status,
					statusText: response.statusText,
					body: errorText,
					headers: Object.fromEntries(response.headers.entries())
				});
				
				let userMessage = `Error ${response.status}: `;
				if (response.status === 401) {
					userMessage += 'No autorizado. Por favor inicia sesión nuevamente.';
				} else if (response.status === 403) {
					userMessage += 'No tienes permiso para acceder a esta sesión.';
				} else if (response.status === 404) {
					userMessage += 'Sesión no encontrada.';
				} else {
					userMessage += response.statusText || 'Error desconocido';
				}
				
				throw new Error(userMessage);
			}

			// Verificar que la respuesta sea SSE
			const contentType = response.headers.get('content-type');
			if (!contentType || !contentType.includes('text/event-stream')) {
				console.error('Unexpected content type for streaming:', contentType);
				throw new Error(`Tipo de respuesta inesperado: ${contentType}. Se esperaba text/event-stream`);
			}

			console.log('Stream response received, status:', response.status);

			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error('No response body reader available');
			}

			const decoder = new TextDecoder();
			let buffer = '';
			let fullContent = '';

			console.log('Starting to read stream...');

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					console.log('Stream ended normally');
					break;
				}

				// Decode the chunk and add to buffer
				const chunk = decoder.decode(value, { stream: true });
				buffer += chunk;

				// Process complete SSE events
				const events = buffer.split('\n\n');
				buffer = events.pop() || ''; // Keep incomplete event in buffer

				for (const event of events) {
					if (event.trim() === '') continue;

					const lines = event.split('\n');
					let eventData = '';

					for (const line of lines) {
						if (line.startsWith('data: ')) {
							eventData = line.slice(6).trim();
							break; // Only process the first data line
						}
					}

					if (eventData === '') continue;

					try {
						const streamEvent: StreamEvent = JSON.parse(eventData);
						console.log('Received event:', streamEvent.type, streamEvent);

						switch (streamEvent.type) {
							case 'start':
								callbacks.onStart?.(streamEvent.session_id || sessionId);
								break;

							case 'content':
								if (streamEvent.content) {
									fullContent += streamEvent.content;
									callbacks.onContent?.(streamEvent.content);
								}
								break;

							case 'done':
								callbacks.onDone?.(streamEvent.message_id || '', streamEvent.full_content || fullContent);
								break;

							case 'error':
								callbacks.onError?.(streamEvent.error || 'Unknown error');
								break;

							default:
								console.warn('Unknown event type:', streamEvent.type);
						}
					} catch (parseError) {
						console.error('Failed to parse SSE event:', eventData, parseError);
						// Don't call error callback for parse errors, just log them
					}
				}
			}
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				console.log('Stream was cancelled');
				return;
			}

			console.error('Stream error details:', {
				name: error instanceof Error ? error.name : 'Unknown',
				message: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined
			});

			// Check for specific error types
			if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
				console.error('Network/CORS error detected. Check:');
				console.error('1. Backend URL is correct:', this.baseUrl);
				console.error('2. CORS is properly configured on backend');
				console.error('3. Network connectivity to backend');
				callbacks.onError?.('Error de conexión: verifica la configuración CORS del backend');
			} else {
				const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el stream';
				callbacks.onError?.(errorMessage);
			}
		}
	}

	/**
	 * Cancel the current stream
	 */
	cancelStream(): void {
		if (this.abortController) {
			console.log('Cancelling current stream');
			this.abortController.abort();
			this.abortController = null;
		}
	}

	/**
	 * Test streaming connectivity
	 */
	async testStreamingConnectivity(sessionId: string): Promise<boolean> {
		try {
			const url = `${this.baseUrl}/api/chat/realtime/sessions/${sessionId}/stream`;
			console.log('Testing streaming connectivity to:', url);

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.token}`,
					'Accept': 'text/event-stream',
					'Cache-Control': 'no-cache'
				},
				body: JSON.stringify({ content: 'test' })
			});

			console.log('Connectivity test result:', response.status);
			return response.ok;
		} catch (error) {
			console.error('Connectivity test failed:', error);
			return false;
		}
	}

	/**
	 * Cleanup
	 */
	destroy(): void {
		this.cancelStream();
	}
}
