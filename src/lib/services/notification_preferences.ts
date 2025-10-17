import { apiCall } from '$lib/config';

export interface NotificationPreferences {
	task_overdue_reminders: number;
	task_overdue_alarms: number;
	reminder_frequency: 'low' | 'medium' | 'high';
	alarm_intensity: 'gentle' | 'normal' | 'insistent';
	quiet_hours_enabled: boolean;
	quiet_hours_start: string;
	quiet_hours_end: string;
}

export interface UserNotificationPreferences extends NotificationPreferences {
	id: string;
	user_id: string;
	created_at: string;
	updated_at: string;
}

/**
 * Get notification preferences for authenticated user
 */
export async function getNotificationPreferences(authStore: any): Promise<UserNotificationPreferences | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall('/api/notification/preferences', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) {
			if (response.status === 404) {
				return null; // No preferences set yet
			}
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching notification preferences:', error);
		return null;
	}
}

/**
 * Save or update notification preferences
 */
export async function saveNotificationPreferences(authStore: any, preferences: NotificationPreferences): Promise<UserNotificationPreferences> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall('/api/notification/preferences', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(preferences)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to save notification preferences');
		}

		return await response.json();
	} catch (error) {
		console.error('Error saving notification preferences:', error);
		throw error;
	}
}

/**
 * Update specific notification preference fields
 */
export async function updateNotificationPreferences(authStore: any, updates: Partial<NotificationPreferences>): Promise<UserNotificationPreferences> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall('/api/notification/preferences', {
			method: 'PATCH',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(updates)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to update notification preferences');
		}

		return await response.json();
	} catch (error) {
		console.error('Error updating notification preferences:', error);
		throw error;
	}
}
