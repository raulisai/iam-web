import { BACKEND_URL } from '$lib/config';
import type { TaskNow, TasksNowResponse } from '../types/time-optimizer';

/**
 * Get optimized tasks for the remaining time today
 * Uses aggressive scheduling algorithm to maximize time utilization
 */
export async function getTasksForNow(token: string): Promise<TasksNowResponse> {
	// Obtener authStore para usar authenticatedFetch que maneja CORS correctamente
	const { getAuthStore } = await import('../stores/auth.svelte');
	const authStore = getAuthStore();
	
	const response = await authStore.authenticatedFetch(
		`${BACKEND_URL}/api/time-optimizer/tasks-now`,
		{
			method: 'GET'
		}
	);

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
