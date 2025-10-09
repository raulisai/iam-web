import { BACKEND_URL } from '../config';

/**
 * Goal type definition
 */
export type Goal = {
	id: string;
	title: string;
	description?: string;
	type: 'short' | 'medium' | 'long';
	desc_short?: string;
	metric_key: string;
	target_value: number;
	progress: number;
	start_date: string;
	end_date?: string;
	is_active: boolean;
	// ...other properties if any
};

export type CreateGoalData = Omit<Goal, 'id' | 'progress' | 'start_date' | 'end_date'>;

/**
 * Fetch all goals for authenticated user
 */
export async function fetchGoals(token: string, isActive?: boolean): Promise<Goal[]> {
	const params = new URLSearchParams();
	if (isActive !== undefined) {
		params.append('is_active', String(isActive));
	}

	const url = `${BACKEND_URL}/api/goals/${params.toString() ? '?' + params.toString() : ''}`;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Accept': 'application/json'
		}
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
	const response = await fetch(`${BACKEND_URL}/api/goals/`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json',
			'Accept': 'application/json'
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
export async function updateGoal(token: string, goalId: string, updates: Partial<CreateGoalData>): Promise<Goal> {
	const response = await fetch(`${BACKEND_URL}/api/goals/${goalId}`, {
		method: 'PUT',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json',
			'Accept': 'application/json'
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
	const response = await fetch(`${BACKEND_URL}/api/goals/${goalId}`, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Accept': 'application/json'
		}
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
