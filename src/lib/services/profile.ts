import { apiCall } from '$lib/config';
import type { UserProfile } from '$lib/types';

// Re-export the type for convenience
export type { UserProfile };

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
		// Include status code for 409 detection
		if (response.status === 409) {
			throw new Error('409: Profile already exists');
		}
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
 * Save or update user profile (auto-detects if profile exists)
 */
export async function saveOrUpdateUserProfile(profileData: UserProfile): Promise<UserProfile> {
	const token = localStorage.getItem('token');
	
	if (!token) {
		throw new Error('No authentication token found');
	}

	// First, check if profile already exists
	try {
		const existingProfile = await getUserProfile();
		
		// Profile exists, use update
		if (existingProfile && existingProfile.id) {
			console.log('Profile exists, updating...');
			return await updateUserProfile(profileData);
		}
	} catch (err) {
		// Profile doesn't exist or error fetching, try to create
		console.log('Profile not found, creating new one...');
	}

	// Try to create new profile
	try {
		return await createUserProfile(profileData);
	} catch (err: any) {
		// If we get a 409 conflict, it means profile was created concurrently, try update
		if (err.message && err.message.includes('409')) {
			console.log('Profile exists (409), retrying with update...');
			return await updateUserProfile(profileData);
		}
		throw err;
	}
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
