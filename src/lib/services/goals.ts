import { BACKEND_URL } from '../config';
import type { Goal, CreateGoalData } from '../types';

async function authFetch(
	token: string | undefined,
	url: string,
	options: RequestInit = {}
): Promise<Response> {
	const { getAuthStore } = await import('../stores/auth.svelte');
	const authStore = getAuthStore();

	return authStore.authenticatedFetch(url, options, token);
}


/**
 * Fetch all goals for authenticated user
 */
export async function fetchGoals(token: string, isActive?: boolean): Promise<Goal[]> {
	const params = new URLSearchParams();
	if (isActive !== undefined) {
		params.append('is_active', String(isActive));
	}

	const url = `${BACKEND_URL}/api/goals/${params.toString() ? '?' + params.toString() : ''}`;

	const response = await authFetch(token, url, {
		method: 'GET'
	});

	if (!response.ok) {
		// Si es 401, el token expiró o es inválido
		if (response.status === 401) {
			// Importar dinámicamente para evitar ciclos
			const { getAuthStore } = await import('../stores/auth.svelte');
			const authStore = getAuthStore();
			authStore.handleUnauthorized();
			throw new Error('UNAUTHORIZED');
		}
		throw new Error(`Failed to fetch goals: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Create a new goal
 */
export async function createGoal(token: string, goalData: CreateGoalData): Promise<Goal> {
	const response = await authFetch(token, `${BACKEND_URL}/api/goals/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(goalData)
	});

	if (!response.ok) {
		if (response.status === 401) {
			const { getAuthStore } = await import('../stores/auth.svelte');
			const authStore = getAuthStore();
			authStore.handleUnauthorized();
			throw new Error('UNAUTHORIZED');
		}
		const error = await response.json();
		throw new Error(error.error || `Failed to create goal: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Update a goal
 */
export async function updateGoal(token: string, goalId: string, updates: Partial<Goal>): Promise<Goal> {
	const response = await authFetch(token, `${BACKEND_URL}/api/goals/${goalId}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(updates)
	});

	if (!response.ok) {
		if (response.status === 401) {
			const { getAuthStore } = await import('../stores/auth.svelte');
			const authStore = getAuthStore();
			authStore.handleUnauthorized();
			throw new Error('UNAUTHORIZED');
		}
		const error = await response.json();
		throw new Error(error.error || `Failed to update goal: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Delete a goal
 */
export async function deleteGoal(token: string, goalId: string): Promise<void> {
	const response = await authFetch(token, `${BACKEND_URL}/api/goals/${goalId}`, {
		method: 'DELETE'
	});

	if (!response.ok) {
		if (response.status === 401) {
			const { getAuthStore } = await import('../stores/auth.svelte');
			const authStore = getAuthStore();
			authStore.handleUnauthorized();
			throw new Error('UNAUTHORIZED');
		}
		const error = await response.json();
		throw new Error(error.error || `Failed to delete goal: ${response.statusText}`);
	}
}
