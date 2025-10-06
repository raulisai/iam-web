import { BACKEND_URL } from '$lib/config';
import type {
    ChatSession,
    ChatMessage,
    CreateSessionData,
    UpdateSessionData,
    CreateMessageData
} from '$lib/types';

/**
 * Get all chat sessions for the authenticated user
 */
export async function getChatSessions(): Promise<ChatSession[]> {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BACKEND_URL}/api/chat/sessions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch chat sessions');
    }

    return response.json();
}

/**
 * Get a specific chat session by ID
 */
export async function getChatSession(sessionId: string): Promise<ChatSession> {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BACKEND_URL}/api/chat/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch chat session');
    }

    return response.json();
}

/**
 * Create a new chat session
 */
export async function createChatSession(data: CreateSessionData = {}): Promise<ChatSession> {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BACKEND_URL}/api/chat/sessions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error('Failed to create chat session');
    }

    return response.json();
}

/**
 * Update a chat session
 */
export async function updateChatSession(sessionId: string, data: UpdateSessionData): Promise<ChatSession> {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BACKEND_URL}/api/chat/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error('Failed to update chat session');
    }

    return response.json();
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BACKEND_URL}/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to delete chat session');
    }
}

/**
 * Get all messages in a chat session
 */
export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BACKEND_URL}/api/chat/sessions/${sessionId}/messages`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }

    return response.json();
}

/**
 * Create a new message in a chat session
 */
export async function createChatMessage(sessionId: string, data: CreateMessageData): Promise<ChatMessage> {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BACKEND_URL}/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error('Failed to create message');
    }

    return response.json();
}

/**
 * Delete a message
 */
export async function deleteChatMessage(messageId: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BACKEND_URL}/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to delete message');
    }
}
