/**
 * Task Recommendations Service
 * Maneja las recomendaciones de tareas desde la API
 */

import { apiCall } from '$lib/config';
import type { AuthStore } from '$lib/types';

export interface TaskRecommendation {
    id: string;
    key: string;
    name: string;
    category: 'mind' | 'body';
    desc: string;
    reward_xp: number;  // La API devuelve reward_xp, no default_xp
    default_params: Record<string, any>;
    suggested_schedule?: string;
    reason?: string;
    difficulty?: number;
    estimated_minutes?: number;
    created_at?: string;
    created_by?: string;
}

export interface RecommendationsResponse {
    recommendations: TaskRecommendation[];
    method: 'pattern_based' | 'ai_powered';
    generated_at: string;
    task_history_count: number;
    category?: 'mind' | 'body';
}

/**
 * Obtiene recomendaciones generales de tareas
 */
export async function getTaskRecommendations(
    authStore: AuthStore,
    useAI: boolean = false
): Promise<RecommendationsResponse | null> {
    try {
        const endpoint = `/api/tasks/recommendations?use_ai=${useAI}`;
        const response = await authStore.authenticatedFetch(endpoint, {
            method: 'GET'
        });

        if (!response.ok) {
            console.error('Error fetching recommendations:', response.statusText);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting task recommendations:', error);
        return null;
    }
}

/**
 * Obtiene recomendaciones de tareas mentales
 */
export async function getMindRecommendations(
    authStore: AuthStore,
    count: number = 3,
    useAI: boolean = false
): Promise<RecommendationsResponse | null> {
    try {
        const endpoint = `/api/tasks/recommendations/mind?count=${count}&use_ai=${useAI}`;
        const response = await authStore.authenticatedFetch(endpoint, {
            method: 'GET'
        });

        if (!response.ok) {
            console.error('Error fetching mind recommendations:', response.statusText);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting mind recommendations:', error);
        return null;
    }
}

/**
 * Obtiene recomendaciones de tareas físicas
 */
export async function getBodyRecommendations(
    authStore: AuthStore,
    count: number = 3,
    useAI: boolean = false
): Promise<RecommendationsResponse | null> {
    try {
        const endpoint = `/api/tasks/recommendations/body?count=${count}&use_ai=${useAI}`;
        const response = await authStore.authenticatedFetch(endpoint, {
            method: 'GET'
        });

        if (!response.ok) {
            console.error('Error fetching body recommendations:', response.statusText);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting body recommendations:', error);
        return null;
    }
}

/**
 * Crea una tarea desde una recomendación
 */
export async function createTaskFromRecommendation(
    authStore: AuthStore,
    recommendation: TaskRecommendation,
    scheduledAt?: string
): Promise<boolean> {
    try {
        const endpoint = recommendation.category === 'mind' 
            ? '/api/tasks/mind' 
            : '/api/tasks/body';

        const payload = {
            template_id: recommendation.id,
            scheduled_at: scheduledAt || recommendation.suggested_schedule || new Date().toISOString(),
            created_by: 'user',
            status: 'pending',
            params: recommendation.default_params || {}
        };

        const response = await authStore.authenticatedFetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error('Error creating task from recommendation:', response.statusText);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error creating task from recommendation:', error);
        return false;
    }
}
