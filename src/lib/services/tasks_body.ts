import { BACKEND_URL } from '$lib/config';
import type { AuthStore, Task, TaskDetail, UpdateTaskPayload } from '$lib/types';
import { mapTaskData } from './tasks_common';

/**
 * Get all pending body tasks
 */
export async function getBodyTasks(authStore: AuthStore): Promise<Task[]> {
    try {
        const response = await authStore.authenticatedFetch(
            `${BACKEND_URL}/api/tasks/body/?status=pending`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch body tasks: ${response.status}`);
        }

        const data = await response.json();
        return data.map(mapTaskData);
    } catch (error) {
        console.error('Error fetching body tasks:', error);
        return [];
    }
}

/**
 * Get a specific body task by ID
 */
export async function getBodyTaskDetail(authStore: AuthStore, taskId: string): Promise<TaskDetail | null> {
    try {
        const response = await authStore.authenticatedFetch(
            `${BACKEND_URL}/api/tasks/body/${taskId}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch body task detail: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching body task detail:', error);
        return null;
    }
}

/**
 * Update a body task
 */
export async function updateBodyTask(
    authStore: AuthStore,
    taskId: string,
    payload: UpdateTaskPayload
): Promise<TaskDetail | null> {
    try {
        const response = await authStore.authenticatedFetch(
            `${BACKEND_URL}/api/tasks/body/${taskId}`,
            {
                method: 'PUT',
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to update body task: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating body task:', error);
        return null;
    }
}

/**
 * Complete a body task
 */
export async function completeBodyTask(authStore: AuthStore, taskId: string): Promise<boolean> {
    try {
        const response = await authStore.authenticatedFetch(
            `${BACKEND_URL}/api/tasks/body/${taskId}/complete`,
            {
                method: 'POST'
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to complete body task: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error completing body task:', error);
        return false;
    }
}
