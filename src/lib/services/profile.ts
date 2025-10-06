import { apiCall } from '$lib/config';
import type { UserProfile } from '$lib/types';

/**
 * Get authenticated user's profile
 */
export async function getUserProfile(): Promise<UserProfile> {
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
export async function createUserProfile(profileData: UserProfile): Promise<UserProfile> {
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
export async function updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
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
export async function deleteUserProfile(): Promise<{ id: string; user_id: string }> {
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
