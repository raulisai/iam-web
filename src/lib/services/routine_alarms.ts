import { apiCall } from '$lib/config';

export interface RoutineAlarm {
	id: string;
	user_id: string;
	name: string;
	description?: string;
	source_type: 'mind' | 'body' | 'goal' | 'custom';
	task_id?: string;
	alarm_time: string;
	days_of_week: number[];
	notification_title: string;
	notification_body: string;
	notification_icon?: string;
	notification_color?: string;
	sound_enabled: boolean;
	sound_uri?: string;
	vibration_enabled: boolean;
	vibration_pattern?: number[];
	snooze_enabled: boolean;
	snooze_duration_min: number;
	max_snoozes: number;
	priority: 'min' | 'low' | 'default' | 'high' | 'max';
	can_dismiss: boolean;
	auto_dismiss_minutes?: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface CreateRoutineAlarmData {
	name: string;
	description?: string;
	source_type?: 'mind' | 'body' | 'goal' | 'custom';
	task_id?: string;
	alarm_time: string;
	days_of_week?: number[];
	notification_title: string;
	notification_body: string;
	notification_icon?: string;
	notification_color?: string;
	sound_enabled?: boolean;
	sound_uri?: string;
	vibration_enabled?: boolean;
	vibration_pattern?: number[];
	snooze_enabled?: boolean;
	snooze_duration_min?: number;
	max_snoozes?: number;
	priority?: 'min' | 'low' | 'default' | 'high' | 'max';
	can_dismiss?: boolean;
	auto_dismiss_minutes?: number;
	is_active?: boolean;
}

/**
 * Get all routine alarms for authenticated user
 */
export async function getRoutineAlarms(authStore: any, filters?: { source_type?: string; is_active?: boolean }): Promise<RoutineAlarm[]> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		let url = '/api/routine/alarms/';
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
		console.error('Error fetching routine alarms:', error);
		return [];
	}
}

/**
 * Get specific routine alarm by ID
 */
export async function getRoutineAlarm(authStore: any, alarmId: string): Promise<RoutineAlarm | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall(`/api/routine/alarms/${alarmId}`, {
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
		console.error('Error fetching routine alarm:', error);
		return null;
	}
}

/**
 * Create new routine alarm
 */
export async function createRoutineAlarm(authStore: any, alarmData: CreateRoutineAlarmData): Promise<RoutineAlarm | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall('/api/routine/alarms/', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(alarmData)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to create routine alarm');
		}

		return await response.json();
	} catch (error) {
		console.error('Error creating routine alarm:', error);
		throw error;
	}
}

/**
 * Update routine alarm
 */
export async function updateRoutineAlarm(authStore: any, alarmId: string, updates: Partial<CreateRoutineAlarmData>): Promise<RoutineAlarm | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall(`/api/routine/alarms/${alarmId}`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(updates)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to update routine alarm');
		}

		return await response.json();
	} catch (error) {
		console.error('Error updating routine alarm:', error);
		throw error;
	}
}

/**
 * Toggle alarm active status
 */
export async function toggleAlarmStatus(authStore: any, alarmId: string, isActive: boolean): Promise<RoutineAlarm | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall(`/api/routine/alarms/${alarmId}/status`, {
			method: 'PATCH',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ is_active: isActive })
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to toggle alarm status');
		}

		return await response.json();
	} catch (error) {
		console.error('Error toggling alarm status:', error);
		throw error;
	}
}

/**
 * Delete routine alarm
 */
export async function deleteRoutineAlarm(authStore: any, alarmId: string): Promise<boolean> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall(`/api/routine/alarms/${alarmId}`, {
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
		console.error('Error deleting routine alarm:', error);
		return false;
	}
}
