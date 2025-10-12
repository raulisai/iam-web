import { BACKEND_URL } from '$lib/config';

// Types based on the API response
export interface TaskNow {
	id: string;
	task_id: string;
	title: string;
	description: string;
	type: 'body' | 'mind' | 'goal';
	estimated_duration_minutes: number;
	priority_score: number;
	urgency_multiplier: number;
	scheduled_at: string | null;
	status: string;
	start_time: string;
	end_time: string;
	time_slot: 'morning' | 'afternoon' | 'evening';
	// Goal-specific fields
	goal_title?: string;
	goal_deadline?: string;
	days_until_deadline?: number;
	weight?: number;
}

export interface TasksNowResponse {
	body_tasks: TaskNow[];
	goal_tasks: TaskNow[];
	mind_tasks: TaskNow[];
	current_time: string;
	message: string;
	remaining_hours_in_slot_week: number;
	remaining_minutes_today: number;
	remaining_hours_today: number;
	total_body_tasks: number;
	total_goal_tasks: number;
	total_mind_tasks: number;
	total_time_used_for_tasks: number;
	remaining_minutes_in_slot_week: number;
	remaining_after_scheduling: number;
	utilization_percentage: number;
	total_available_tasks: number;
	total_scheduled_tasks: number;
	user_id: string;
	is_working_day: boolean;
	available_hours_today: number;
	work_hours_today: number;
	time_dead: number;
}

/**
 * Get optimized tasks for the remaining time today
 * Uses aggressive scheduling algorithm to maximize time utilization
 */
export async function getTasksForNow(token: string): Promise<TasksNowResponse> {
	const response = await fetch(`${BACKEND_URL}/api/time-optimizer/tasks-now`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Failed to fetch tasks' }));
		throw new Error(error.error || error.message || 'Failed to fetch tasks for now');
	}

	return response.json();
}

/**
 * Helper function to get all tasks combined in priority order
 */
export function getAllTasksInPriorityOrder(response: TasksNowResponse): TaskNow[] {
	const allTasks = [
		...response.goal_tasks,
		...response.mind_tasks,
		...response.body_tasks
	];
	
	// Already sorted by priority from backend, but we can re-sort if needed
	return allTasks.sort((a, b) => b.priority_score - a.priority_score);
}

/**
 * Format time for display (e.g., "2:30 PM")
 */
export function formatTime(dateString: string): string {
	try {
		const date = new Date(dateString);
		return date.toLocaleTimeString('en-US', { 
			hour: 'numeric', 
			minute: '2-digit',
			hour12: true 
		});
	} catch (e) {
		return dateString;
	}
}

/**
 * Get task type color
 */
export function getTaskTypeColor(type: 'body' | 'mind' | 'goal'): {
	gradient: string;
	border: string;
	text: string;
	bg: string;
} {
	switch (type) {
		case 'goal':
			return {
				gradient: 'from-blue-500 to-indigo-600',
				border: 'border-blue-400/50',
				text: 'text-blue-400',
				bg: 'bg-blue-500/10'
			};
		case 'mind':
			return {
				gradient: 'from-purple-500 to-indigo-600',
				border: 'border-purple-400/50',
				text: 'text-purple-400',
				bg: 'bg-purple-500/10'
			};
		case 'body':
			return {
				gradient: 'from-orange-500 to-red-600',
				border: 'border-orange-400/50',
				text: 'text-orange-400',
				bg: 'bg-orange-500/10'
			};
	}
}

/**
 * Get task type icon
 */
export function getTaskTypeIcon(type: 'body' | 'mind' | 'goal'): string {
	switch (type) {
		case 'goal':
			return '🎯';
		case 'mind':
			return '🧠';
		case 'body':
			return '💪';
	}
}

/**
 * Get task type label
 */
export function getTaskTypeLabel(type: 'body' | 'mind' | 'goal'): string {
	switch (type) {
		case 'goal':
			return 'Goal';
		case 'mind':
			return 'Mind';
		case 'body':
			return 'Body';
	}
}

/**
 * Get time slot icon
 */
export function getTimeSlotIcon(slot: 'morning' | 'afternoon' | 'evening'): string {
	switch (slot) {
		case 'morning':
			return '🌅';
		case 'afternoon':
			return '☀️';
		case 'evening':
			return '🌙';
	}
}

/**
 * Calculate duration text
 */
export function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${minutes}m`;
	}
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
