export interface TaskTemplate {
	id?: string;
	key: string;
	name: string;
	desc: string;
	category: 'mind' | 'body';
	difficulty: number;
	estimated_minutes: number;
	reward_xp: number;
	default_params: Record<string, any>;
	created_by?: string;
	created_at?: string;
	updated_at?: string;
}

export interface CreateTaskTemplateData {
	key: string;
	name: string;
	category: 'mind' | 'body';
	desc: string;
	difficulty: number;
	estimated_minutes: number;
	reward_xp: number;
	default_params?: Record<string, any>;
	created_by?: string;
}
