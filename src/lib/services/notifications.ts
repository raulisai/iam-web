import { apiCall } from '$lib/config';

export interface DeviceToken {
	id: string;
	user_id: string;
	token: string;
	platform: 'android' | 'ios' | 'web';
	device_info?: any;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface RegisterTokenData {
	token: string;
	platform?: 'android' | 'ios' | 'web';
	device_info?: {
		model?: string;
		os_version?: string;
		app_version?: string;
	};
}

export interface SendNotificationData {
	user_id: string;
	title: string;
	body: string;
	data?: Record<string, any>;
}

export interface SendAlarmData {
	data: {
		mensaje: string;
		title?: string;
		body?: string;
		[key: string]: any;
	};
}

/**
 * Register or update a device token for push notifications
 */
export async function registerDeviceToken(authStore: any, tokenData: RegisterTokenData): Promise<any> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall('/api/notification/register-token', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(tokenData)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to register device token');
		}

		return await response.json();
	} catch (error) {
		console.error('Error registering device token:', error);
		throw error;
	}
}

/**
 * Get all active device tokens for the authenticated user
 */
export async function getUserTokens(authStore: any): Promise<DeviceToken[]> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall('/api/notification/tokens', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		const result = await response.json();
		return result.data || [];
	} catch (error) {
		console.error('Error fetching user tokens:', error);
		return [];
	}
}

/**
 * Remove a device token
 */
export async function removeDeviceToken(authStore: any, deviceToken: string, hardDelete: boolean = false): Promise<boolean> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall('/api/notification/remove-token', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({
				token: deviceToken,
				hard_delete: hardDelete
			})
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		return true;
	} catch (error) {
		console.error('Error removing device token:', error);
		return false;
	}
}

/**
 * Send a push notification to a specific user
 */
export async function sendNotification(authStore: any, notificationData: SendNotificationData): Promise<any> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall('/api/notification/send', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(notificationData)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to send notification');
		}

		return await response.json();
	} catch (error) {
		console.error('Error sending notification:', error);
		throw error;
	}
}

/**
 * Send an alarm notification to the authenticated user's devices
 */
export async function sendAlarm(authStore: any, alarmData: SendAlarmData): Promise<any> {
	try {
		const token = authStore.getToken();
		if (!token) {
			throw new Error('No authentication token');
		}

		const response = await apiCall('/api/notification/send-alarm', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(alarmData)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to send alarm');
		}

		return await response.json();
	} catch (error) {
		console.error('Error sending alarm:', error);
		throw error;
	}
}
