export interface Task {
    id: string;
    title: string;
    durationMinutes?: number;
    points?: number;
    summary?: string;
    rating?: number;
    icon?: string;
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

export type TaskType = 'mind' | 'body';
