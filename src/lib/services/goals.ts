import { BACKEND_URL } from '../config';

export interface Goal {
	id: string;
	user_id: string;
	title: string;
	description: string;
	type: 'short' | 'medium' | 'long';
	progress: number;
	desc_short: string | null;
	metric_key: string;
	target_value: number;
	is_active: boolean;
	start_date: string;
	end_date: string | null;
	created_at: string;
}

export interface CreateGoalData {
	title: string;
	description?: string;
	type: 'short' | 'medium' | 'long';
	progress?: string;
	desc_short?: string;
	metric_key: string;
	target_value: number;
	is_active?: boolean;
	start_date: string;
	end_date?: string;
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

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Accept': 'application/json'
		}
	});

	if (!response.ok) {
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
		const error = await response.json();
		throw new Error(error.error || `Failed to delete goal: ${response.statusText}`);
	}
}
