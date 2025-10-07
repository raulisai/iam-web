import { apiCall } from '$lib/config';

/**
 * Get authenticated user's profile
 */
export async function getUserProfile() {
	const token = localStorage.getItem('token');
	
	if (!token) {
		throw new Error('No authentication token found');
	}

	const response = await apiCall('/api/profile/', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to fetch profile');
	}

	return await response.json();
}

/**
 * Create user profile
 */
export async function createUserProfile(profileData: UserProfile) {
	const token = localStorage.getItem('token');
	
	if (!token) {
		throw new Error('No authentication token found');
	}

	const response = await apiCall('/api/profile/', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(profileData)
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to create profile');
	}

	return await response.json();
}

/**
 * Update user profile
 */
export async function updateUserProfile(profileData: UserProfile) {
	const token = localStorage.getItem('token');
	
	if (!token) {
		throw new Error('No authentication token found');
	}

	const response = await apiCall('/api/profile/', {
		method: 'PUT',
		headers: {
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(profileData)
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to update profile');
	}

	return await response.json();
}

/**
 * Delete user profile
 */
export async function deleteUserProfile() {
	const token = localStorage.getItem('token');
	
	if (!token) {
		throw new Error('No authentication token found');
	}

	const response = await apiCall('/api/profile/', {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to delete profile');
	}

	return await response.json();
}

/**
 * User profile type
 */
export interface UserProfile {
	id?: string;
	user_id?: string;
	timezone?: string;
	birth_date?: string;
	gender?: string;
	weight_kg?: number;
	height_cm?: number;
	preferred_language?: string;
	hours_available_to_week?: number;
	hours_used_to_week?: number;
	work_schedules?: string;
	current_status?: string;
	created_at?: string;
	updated_at?: string;
}
