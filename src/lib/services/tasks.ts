/**
 * @deprecated This file is kept for backward compatibility.
 * Please use tasks_mind.ts or tasks_body.ts directly for new code.
 */

// Re-export types
export type { Task, TaskDetail, UpdateTaskPayload, TaskType, AuthStore } from '$lib/types';

// Re-export mind task functions
export {
    getMindTasks,
    getMindTaskDetail,
    updateMindTask,
    completeMindTask
} from './tasks_mind';

// Re-export body task functions
export {
    getBodyTasks,
    getBodyTaskDetail,
    updateBodyTask,
    completeBodyTask
} from './tasks_body';

// Re-export common utilities
export { getIconForCategory, mapTaskData } from './tasks_common';

// Import for backward compatibility functions
import type { AuthStore, TaskDetail, UpdateTaskPayload, TaskType } from '$lib/types';
import { getMindTaskDetail, updateMindTask, completeMindTask } from './tasks_mind';
import { getBodyTaskDetail, updateBodyTask, completeBodyTask } from './tasks_body';

/**
 * @deprecated Use getMindTaskDetail or getBodyTaskDetail instead
 */
export async function getTaskDetail(
    authStore: AuthStore,
    taskId: string,
    taskType: TaskType = 'mind'
): Promise<TaskDetail | null> {
    if (taskType === 'mind') {
        return getMindTaskDetail(authStore, taskId);
    } else {
        return getBodyTaskDetail(authStore, taskId);
    }
}

/**
 * @deprecated Use updateMindTask or updateBodyTask instead
 */
export async function updateTask(
    authStore: AuthStore,
    taskId: string,
    payload: UpdateTaskPayload,
    taskType: TaskType = 'mind'
): Promise<TaskDetail | null> {
    if (taskType === 'mind') {
        return updateMindTask(authStore, taskId, payload);
    } else {
        return updateBodyTask(authStore, taskId, payload);
    }
}

/**
 * @deprecated Use completeMindTask or completeBodyTask instead
 */
export async function completeTask(
    authStore: AuthStore,
    taskId: string,
    taskType: TaskType = 'mind'
): Promise<boolean> {
    if (taskType === 'mind') {
        return completeMindTask(authStore, taskId);
    } else {
        return completeBodyTask(authStore, taskId);
    }
}