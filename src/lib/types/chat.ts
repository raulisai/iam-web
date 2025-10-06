export interface ChatSession {
    id: string;
    user_id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
}

export interface ChatMessage {
    id: string;
    session_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface CreateSessionData {
    title?: string;
}

export interface UpdateSessionData {
    title: string;
}

export interface CreateMessageData {
    role: 'user' | 'assistant';
    content: string;
}
