import { apiCall } from '$lib/config';

export interface TaskTemplate {
	id?: string;
	key: string;
	name: string;
	category: 'mind' | 'body';
	estimated_minutes?: number;
	difficulty?: number;
	reward_xp?: number;
	default_params?: Record<string, any>;
	created_by?: string;
	desc?: string;
	created_at?: string;
	updated_at?: string;
}

export interface CreateTaskTemplateData {
	key: string;
	name: string;
	category: 'mind' | 'body';
	desc?: string;
	estimated_minutes?: number;
	difficulty?: number;
	reward_xp?: number;
	default_params?: Record<string, any>;
	created_by?: string;
}

/**
 * Get all task templates
 */
export async function getTaskTemplates(authStore: any): Promise<TaskTemplate[]> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No authentication token');
			return [];
		}

		const response = await apiCall('/api/task-templates/', {
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
		console.error('Error fetching task templates:', error);
		return [];
	}
}

/**
 * Get task template by ID
 */
export async function getTaskTemplate(authStore: any, templateId: string): Promise<TaskTemplate | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No authentication token');
			return null;
		}

		const response = await apiCall(`/api/task-templates/${templateId}`, {
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
		console.error('Error fetching task template:', error);
		return null;
	}
}

/**
 * Get task template by key
 */
export async function getTaskTemplateByKey(authStore: any, key: string): Promise<TaskTemplate | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No authentication token');
			return null;
		}

		const response = await apiCall(`/api/task-templates/key/${key}`, {
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
		console.error('Error fetching task template by key:', error);
		return null;
	}
}

/**
 * Get task templates by category
 */
export async function getTaskTemplatesByCategory(authStore: any, category: 'mind' | 'body'): Promise<TaskTemplate[]> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No authentication token');
			return [];
		}

		const response = await apiCall(`/api/task-templates/category/${category}`, {
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
		console.error('Error fetching task templates by category:', error);
		return [];
	}
}

/**
 * Create new task template
 */
export async function createTaskTemplate(authStore: any, templateData: CreateTaskTemplateData): Promise<TaskTemplate | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No authentication token');
			return null;
		}

		const response = await apiCall('/api/task-templates/', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(templateData)
		});

		if (!response.ok) {
			let errorMsg = 'Failed to create task template';
			try {
				const error = await response.json();
				errorMsg = error.error || error.message || errorMsg;
			} catch (e) {
				// Response no es JSON válido
				errorMsg = `HTTP ${response.status}: ${response.statusText}`;
			}
			throw new Error(errorMsg);
		}

		return await response.json();
	} catch (error) {
		console.error('Error creating task template:', error);
		return null;
	}
}

/**
 * Update task template
 */
export async function updateTaskTemplate(authStore: any, templateId: string, updates: Partial<TaskTemplate>): Promise<TaskTemplate | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No authentication token');
			return null;
		}

		const response = await apiCall(`/api/task-templates/${templateId}`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(updates)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to update task template');
		}

		return await response.json();
	} catch (error) {
		console.error('Error updating task template:', error);
		return null;
	}
}

/**
 * Delete task template
 */
export async function deleteTaskTemplate(authStore: any, templateId: string): Promise<boolean> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No authentication token');
			return false;
		}

		const response = await apiCall(`/api/task-templates/${templateId}`, {
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
		console.error('Error deleting task template:', error);
		return false;
	}
}
