import { apiCall } from '$lib/config';

export interface RoutineReminder {
	id: string;
	user_id: string;
	name: string;
	description?: string;
	source_type: 'mind' | 'body' | 'goal' | 'custom';
	task_id?: string;
	times_per_day: number;
	start_time: string;
	end_time: string;
	days_of_week: number[];
	notification_title: string;
	notification_body: string;
	notification_icon?: string;
	notification_color?: string;
	sound_enabled: boolean;
	vibration_enabled: boolean;
	priority: 'min' | 'low' | 'default' | 'high' | 'max';
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface CreateRoutineReminderData {
	name: string;
	description?: string;
	source_type?: 'mind' | 'body' | 'goal' | 'custom';
	task_id?: string;
	times_per_day: number;
	start_time?: string;
	end_time?: string;
	days_of_week?: number[];
	notification_title: string;
	notification_body: string;
	notification_icon?: string;
	notification_color?: string;
	sound_enabled?: boolean;
	vibration_enabled?: boolean;
	priority?: 'min' | 'low' | 'default' | 'high' | 'max';
	is_active?: boolean;
}

/**
 * Get all routine reminders for authenticated user
 */
export async function getRoutineReminders(authStore: any, filters?: { source_type?: string; is_active?: boolean }): Promise<RoutineReminder[]> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		let url = '/api/routine/reminders/';
		const params = new URLSearchParams();
		
		if (filters?.source_type) {
			params.append('source_type', filters.source_type);
		}
		if (filters?.is_active !== undefined) {
			params.append('is_active', filters.is_active.toString());
		}
		
		if (params.toString()) {
			url += `?${params.toString()}`;
		}

		const response = await apiCall(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching routine reminders:', error);
		return [];
	}
}

/**
 * Get specific routine reminder by ID
 */
export async function getRoutineReminder(authStore: any, reminderId: string): Promise<RoutineReminder | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall(`/api/routine/reminders/${reminderId}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching routine reminder:', error);
		return null;
	}
}

/**
 * Create new routine reminder
 */
export async function createRoutineReminder(authStore: any, reminderData: CreateRoutineReminderData): Promise<RoutineReminder | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall('/api/routine/reminders/', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(reminderData)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to create routine reminder');
		}

		return await response.json();
	} catch (error) {
		console.error('Error creating routine reminder:', error);
		throw error;
	}
}

/**
 * Update routine reminder
 */
export async function updateRoutineReminder(authStore: any, reminderId: string, updates: Partial<CreateRoutineReminderData>): Promise<RoutineReminder | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall(`/api/routine/reminders/${reminderId}`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(updates)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to update routine reminder');
		}

		return await response.json();
	} catch (error) {
		console.error('Error updating routine reminder:', error);
		throw error;
	}
}

/**
 * Toggle reminder active status
 */
export async function toggleReminderStatus(authStore: any, reminderId: string, isActive: boolean): Promise<RoutineReminder | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall(`/api/routine/reminders/${reminderId}/status`, {
			method: 'PATCH',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ is_active: isActive })
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to toggle reminder status');
		}

		return await response.json();
	} catch (error) {
		console.error('Error toggling reminder status:', error);
		throw error;
	}
}

/**
 * Delete routine reminder
 */
export async function deleteRoutineReminder(authStore: any, reminderId: string): Promise<boolean> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall(`/api/routine/reminders/${reminderId}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		return true;
	} catch (error) {
		console.error('Error deleting routine reminder:', error);
		return false;
	}
}
