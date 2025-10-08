import { apiCall } from '$lib/config';
import type { AuthStore } from '$lib/types';

export interface BotRule {
	id?: string;
	rule_key: string;
	name: string;
	descr?: string;
	condition: Record<string, any>;
	action: Record<string, any>;
	is_active?: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface CreateBotRuleData {
	rule_key: string;
	name: string;
	descr?: string;
	condition: Record<string, any>;
	action: Record<string, any>;
	is_active?: boolean;
}

/**
 * Get all bot rules for authenticated user
 */
export async function getBotRules(authStore: AuthStore, activeOnly?: boolean): Promise<BotRule[]> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No authentication token');
			return [];
		}

		const queryParams = activeOnly ? '?active_only=true' : '';
		const response = await apiCall(`/api/bot-rules/${queryParams}`, {
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
		console.error('Error fetching bot rules:', error);
		return [];
	}
}

/**
 * Get specific bot rule by ID
 */
export async function getBotRule(authStore: AuthStore, ruleId: string): Promise<BotRule | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No authentication token');
			return null;
		}

		const response = await apiCall(`/api/bot-rules/${ruleId}`, {
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
		console.error('Error fetching bot rule:', error);
		return null;
	}
}

/**
 * Create new bot rule
 */
export async function createBotRule(authStore: AuthStore, ruleData: CreateBotRuleData): Promise<BotRule | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No authentication token');
			return null;
		}

		const response = await apiCall('/api/bot-rules/', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(ruleData)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to create bot rule');
		}

		return await response.json();
	} catch (error) {
		console.error('Error creating bot rule:', error);
		return null;
	}
}

/**
 * Update bot rule
 */
export async function updateBotRule(authStore: AuthStore, ruleId: string, updates: Partial<BotRule>): Promise<BotRule | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No authentication token');
			return null;
		}

		const response = await apiCall(`/api/bot-rules/${ruleId}`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(updates)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to update bot rule');
		}

		return await response.json();
	} catch (error) {
		console.error('Error updating bot rule:', error);
		return null;
	}
}

/**
 * Delete bot rule
 */
export async function deleteBotRule(authStore: AuthStore, ruleId: string): Promise<boolean> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No authentication token');
			return false;
		}

		const response = await apiCall(`/api/bot-rules/${ruleId}`, {
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
		console.error('Error deleting bot rule:', error);
		return false;
	}
}
