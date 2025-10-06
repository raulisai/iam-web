export interface Goal {
	id: string;
	user_id: string;
	title: string;
	description: string;
	type: 'short' | 'medium' | 'long';
	progress: number;
	desc_short: string | null;
	metric_key: string;
	target_value: number;
	is_active: boolean;
	start_date: string;
	end_date: string | null;
	created_at: string;
}

export interface CreateGoalData {
	title: string;
	description?: string;
	type: 'short' | 'medium' | 'long';
	progress?: string;
	desc_short?: string;
	metric_key: string;
	target_value: number;
	is_active?: boolean;
	start_date: string;
	end_date?: string;
}
