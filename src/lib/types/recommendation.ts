export interface TaskRecommendation {
	id: string;
	key: string;
	name: string;
	category: 'mind' | 'body';
	desc: string;
	reward_xp: number;
	default_params: Record<string, any>;
	suggested_schedule?: string;
	reason?: string;
	difficulty?: number;
	estimated_minutes?: number;
	created_at?: string;
	created_by?: string;
}

export interface RecommendationsResponse {
	recommendations: TaskRecommendation[];
	method: 'pattern_based' | 'ai_powered';
	generated_at: string;
	task_history_count: number;
	category?: 'mind' | 'body';
}
