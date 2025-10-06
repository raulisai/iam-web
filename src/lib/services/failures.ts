import { BACKEND_URL } from '$lib/config';
import type { AuthStore, Failure, CreateFailurePayload } from '$lib/types';

export async function getFailures(authStore: AuthStore, severity?: string): Promise<Failure[]> {
    try {
        const url = severity 
            ? `${BACKEND_URL}/api/failures/?severity=${severity}`
            : `${BACKEND_URL}/api/failures/`;
        
        const response = await authStore.authenticatedFetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch failures: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching failures:', error);
        return [];
    }
}

export async function createFailure(authStore: AuthStore, payload: CreateFailurePayload): Promise<Failure | null> {
    try {
        const response = await authStore.authenticatedFetch(`${BACKEND_URL}/api/failures/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to create failure: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating failure:', error);
        throw error;
    }
}

export async function deleteFailure(authStore: AuthStore, failureId: string): Promise<boolean> {
    try {
        const response = await authStore.authenticatedFetch(`${BACKEND_URL}/api/failures/${failureId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete failure: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error deleting failure:', error);
        return false;
    }
}
