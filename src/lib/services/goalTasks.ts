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

	const method = context ? 'POST' : 'GET';
	const body = context ? JSON.stringify({ context }) : undefined;

	const response = await fetch(
		`${BACKEND_URL}/api/goals/${goalId}/recommendations?${params.toString()}`,
		{
			method,
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body
		}
	);

	if (!response.ok) {
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
		throw new Error(`Failed to fetch tasks: ${response.statusText}`);
	}

	return response.json();
}
