import { BACKEND_URL } from '../config';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface GoalTask {
	id?: string;
	title: string;
	description: string;
	priority: TaskPriority;
	estimated_duration?: string;
	type?: string;
	required?: boolean;
	weight?: number;
	order?: number;
	schedule_rrule?: string;
	due_at?: string;
}

export interface TaskRecommendation extends GoalTask {
	reason?: string;
	template_id?: string | null;
}

export interface TaskRecommendationResponse {
	success: boolean;
	goal: {
		id: string;
		title: string;
		description: string;
	};
	recommendations: TaskRecommendation[];
	method: 'ai_powered' | 'pattern_based';
	generated_at: string;
	existing_task_count: number;
	ai_metadata?: {
		tokens_used: number;
		model: string;
	};
}

export interface TaskOccurrence {
	id?: string;
	task_id: string;
	goal_id: string;
	user_id?: string;
	completed_at: string;
	notes?: string;
	value?: number;
}

/**
 * Get AI-powered task recommendations for a goal
 */
export async function fetchTaskRecommendations(
	token: string,
	goalId: string,
	count: number = 5,
	useAI: boolean = true,
	context?: any
): Promise<TaskRecommendationResponse> {
	const params = new URLSearchParams();
	params.append('use_ai', String(useAI));
	params.append('count', String(count));

	// Always use POST with context (provide defaults if not specified)
	const requestBody = {
		context: context || {
			available_time: '2 horas por día',
			current_challenges: 'Mantener la consistencia',
			preferences: 'Prefiero tareas prácticas y medibles',
			resources: ['Tiempo', 'Motivación', 'Disciplina']
		}
	};

	const response = await fetch(
		`${BACKEND_URL}/api/goals/${goalId}/recommendations?${params.toString()}`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify(requestBody)
		}
	);

	if (!response.ok) {
		// Si es 401, el token expiró o es inválido
		if (response.status === 401) {
			const { getAuthStore } = await import('../stores/auth.svelte');
			const authStore = getAuthStore();
			authStore.handleUnauthorized();
			throw new Error('UNAUTHORIZED');
		}
		
		// Try to parse error as JSON, but handle HTML responses
		const contentType = response.headers.get('content-type');
		let errorMessage = `Failed to fetch recommendations: ${response.status} ${response.statusText}`;
		
		if (contentType && contentType.includes('application/json')) {
			try {
				const error = await response.json();
				errorMessage = error.error || error.message || errorMessage;
			} catch (e) {
				console.error('Failed to parse error JSON:', e);
			}
		} else {
			// Server returned HTML or other content
			const text = await response.text();
			console.error('Server returned non-JSON response:', text.substring(0, 200));
			errorMessage = `Server error (${response.status}): ${response.statusText}`;
		}
		
		throw new Error(errorMessage);
	}

	return response.json();
}

/**
 * Create a new task for a goal
 */
export async function createGoalTask(
	token: string,
	goalId: string,
	taskData: GoalTask
): Promise<GoalTask> {
	const response = await fetch(`${BACKEND_URL}/api/goals/${goalId}/tasks`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify(taskData)
	});

	if (!response.ok) {
		if (response.status === 401) {
			const { getAuthStore } = await import('../stores/auth.svelte');
			const authStore = getAuthStore();
			authStore.handleUnauthorized();
			throw new Error('UNAUTHORIZED');
		}
		const error = await response.json();
		throw new Error(error.error || `Failed to create task: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Get all tasks for a goal
 */
export async function fetchGoalTasks(token: string, goalId: string): Promise<GoalTask[]> {
	const response = await fetch(`${BACKEND_URL}/api/goals/${goalId}/tasks`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/json'
		}
	});

	if (!response.ok) {
		if (response.status === 401) {
			const { getAuthStore } = await import('../stores/auth.svelte');
			const authStore = getAuthStore();
			authStore.handleUnauthorized();
			throw new Error('UNAUTHORIZED');
		}
		throw new Error(`Failed to fetch tasks: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Update an existing task
 */
export async function updateGoalTask(
	token: string,
	goalId: string,
	taskId: string,
	taskData: Partial<GoalTask>
): Promise<GoalTask> {
	const response = await fetch(`${BACKEND_URL}/api/goals/${goalId}/tasks/${taskId}`, {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify(taskData)
	});

	if (!response.ok) {
		if (response.status === 401) {
			const { getAuthStore } = await import('../stores/auth.svelte');
			const authStore = getAuthStore();
			authStore.handleUnauthorized();
			throw new Error('UNAUTHORIZED');
		}
		const error = await response.json();
		throw new Error(error.error || `Failed to update task: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Create occurrence (mark task as completed)
 */
export async function createTaskOccurrence(
	token: string,
	goalId: string,
	taskId: string,
	notes?: string,
	value?: number
): Promise<TaskOccurrence> {
	const response = await fetch(
		`${BACKEND_URL}/api/goals/tasks/${taskId}/occurrences`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify({
				scheduled_at: new Date().toISOString(),
				notes: notes || '',
				value: value || 1
			})
		}
	);

	if (!response.ok) {
		if (response.status === 401) {
			const { getAuthStore } = await import('../stores/auth.svelte');
			const authStore = getAuthStore();
			authStore.handleUnauthorized();
			throw new Error('UNAUTHORIZED');
		}
		if (response.status === 404) {
			throw new Error('Occurrences endpoint not found (404)');
		}
		
		// Try to parse error as JSON, handle non-JSON responses
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			const error = await response.json();
			throw new Error(error.error || `Failed to create occurrence: ${response.statusText}`);
		} else {
			throw new Error(`Failed to create occurrence: ${response.status} ${response.statusText}`);
		}
	}

	return response.json();
}

/**
 * Delete a task
 */
export async function deleteGoalTask(token: string, goalId: string, taskId: string): Promise<void> {
	const response = await fetch(`${BACKEND_URL}/api/goals/${goalId}/tasks/${taskId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/json'
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
		throw new Error(error.error || `Failed to delete task: ${response.statusText}`);
	}
}
