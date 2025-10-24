import { BACKEND_URL } from '$lib/config';
import type { AuthStore, Task, TaskDetail, UpdateTaskPayload } from '$lib/types';
import { mapTaskData } from './tasks_common';

/**
 * Get all pending mind tasks
 */
export async function getMindTasks(authStore: AuthStore): Promise<Task[]> {
    try {
        const response = await authStore.authenticatedFetch(
            `${BACKEND_URL}/api/tasks/mind/?status=pending`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch mind tasks: ${response.status}`);
        }

        const data = await response.json();
        return data.map(mapTaskData);
    } catch (error) {
        console.error('Error fetching mind tasks:', error);
        return [];
    }
}

/**
 * Get a specific mind task by ID
 */
export async function getMindTaskDetail(authStore: AuthStore, taskId: string): Promise<TaskDetail | null> {
    try {
        const response = await authStore.authenticatedFetch(
            `${BACKEND_URL}/api/tasks/mind/${taskId}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch mind task detail: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching mind task detail:', error);
        return null;
    }
}

/**
 * Update a mind task
 */
export async function updateMindTask(
    authStore: AuthStore,
    taskId: string,
    payload: UpdateTaskPayload
): Promise<TaskDetail | null> {
    try {
        const response = await authStore.authenticatedFetch(
            `${BACKEND_URL}/api/tasks/mind/${taskId}`,
            {
                method: 'PUT',
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to update mind task: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating mind task:', error);
        return null;
    }
}

/**
 * Complete a mind task
 */
export async function completeMindTask(authStore: AuthStore, taskId: string): Promise<boolean> {
    try {
        const response = await authStore.authenticatedFetch(
            `${BACKEND_URL}/api/tasks/mind/${taskId}/complete`,
            {
                method: 'POST'
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to complete mind task: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error completing mind task:', error);
        return false;
    }
}

/**
 * Uncomplete (revert) a mind task
 */
export async function uncomplateMindTask(authStore: AuthStore, taskId: string): Promise<boolean> {
    try {
        const response = await authStore.authenticatedFetch(
            `${BACKEND_URL}/api/tasks/mind/${taskId}/uncomplete`,
            {
                method: 'POST'
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to uncomplete mind task: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error uncompleting mind task:', error);
        return false;
    }
}