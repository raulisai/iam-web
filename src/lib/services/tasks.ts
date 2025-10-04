interface AuthStore {
    authenticatedFetch(url: string, options?: RequestInit): Promise<Response>;
}

export interface Task {
    id: string;
    title: string;
    durationMinutes?: number;
    points?: number;
    summary?: string;
    rating?: number;
    icon?: string;
}

export async function getMindTasks(authStore: AuthStore): Promise<Task[]> {
    try {
        const response = await authStore.authenticatedFetch('http://localhost:5000/api/tasks/mind/?status=pending');

        if (!response.ok) {
            throw new Error(`Failed to fetch tasks: ${response.status}`);
        }

        const data = await response.json();

        return data.map((task: any) => ({
            id: task.id,
            title: task.task_templates.name,
            durationMinutes: task.task_templates.estimated_minutes,
            points: task.task_templates.reward_xp,
            summary: task.task_templates.desc,
            rating: task.task_templates.difficulty, // assuming difficulty 1-5 maps to rating
            icon: getIconForCategory(task.task_templates.category)
        }));
    } catch (error) {
        console.error('Error fetching mind tasks:', error);
        return [];
    }
}

function getIconForCategory(category: string): string {
    const iconMap: Record<string, string> = {
        'body': '🧘',
        'mind': '🧠',
        'goals': '🎯',
        'failures': '💥',
        'assistant': '🤖'
    };
    return iconMap[category] || '⭐';
}

export interface TaskDetail {
    id: string;
    template_id: string;
    user_id: string;
    status: string;
    scheduled_at: string | null;
    completed_at: string | null;
    created_at: string;
    created_by: string;
    xp_awarded: number;
    params: {
        duration?: number;
        notes?: string;
        [key: string]: any;
    };
    task_templates: {
        id: string;
        key: string;
        name: string;
        desc: string;
        category: string;
        difficulty: number;
        estimated_minutes: number;
        reward_xp: number;
        default_params: any;
        created_at: string;
        created_by: string;
    };
}

export interface UpdateTaskPayload {
    params?: {
        duration?: number;
        notes?: string;
        [key: string]: any;
    };
    scheduled_at?: string;
    status?: string;
}

export async function getTaskDetail(authStore: AuthStore, taskId: string): Promise<TaskDetail | null> {
    try {
        const response = await authStore.authenticatedFetch(`http://localhost:5000/api/tasks/mind/${taskId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch task detail: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching task detail:', error);
        return null;
    }
}

export async function updateTask(authStore: AuthStore, taskId: string, payload: UpdateTaskPayload): Promise<TaskDetail | null> {
    try {
        const response = await authStore.authenticatedFetch(
            `http://localhost:5000/api/tasks/mind/${taskId}`,
            {
                method: 'PUT',
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to update task: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating task:', error);
        return null;
    }
}