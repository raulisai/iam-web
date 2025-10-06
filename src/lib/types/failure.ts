export interface Failure {
    id: string;
    user_id: string;
    task_table: 'tasks_mind' | 'tasks_body';
    task_id: string;
    reason: string;
    severity: 'minor' | 'major' | 'critical';
    notes?: string;
    title?: string;
    rootCause?: string;
    prevention?: string;
    created_at: string;
}

export interface CreateFailurePayload {
    task_table: 'tasks_mind' | 'tasks_body';
    task_id: string;
    reason: string;
    severity: 'minor' | 'major' | 'critical';
    notes?: string;
    title?: string;
    rootCause?: string;
    prevention?: string;
}
