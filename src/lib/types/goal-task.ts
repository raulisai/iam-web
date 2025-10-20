export type TaskPriority = 'low' | 'medium' | 'high';

export interface GoalTask {
	id?: string;
	title: string;
	description: string;
	priority: TaskPriority;
	estimated_duration?: string;
	type?: string;
	required?: boolean;
	weight?: number;
	order?: number;
	schedule_rrule?: string;
	due_at?: string;
}

export interface GoalTaskRecommendation extends GoalTask {
	reason?: string;
	template_id?: string | null;
}

export interface GoalTaskRecommendationResponse {
	success: boolean;
	goal: {
		id: string;
		title: string;
		description: string;
	};
	recommendations: GoalTaskRecommendation[];
	method: 'ai_powered' | 'pattern_based';
	generated_at: string;
	existing_task_count: number;
	ai_metadata?: {
		tokens_used: number;
		model: string;
	};
}

export interface TaskOccurrence {
	id?: string;
	task_id: string;
	goal_id: string;
	user_id?: string;
	completed_at: string;
	notes?: string;
	value?: number;
	scheduled_at?: string;
}

export type TaskLogAction = 'started' | 'paused' | 'resumed' | 'completed' | 'skipped' | 'uncompleted' | 'comment';

export interface TaskLog {
	id?: string;
	task_table: string;
	task_id: string;
	user_id?: string;
	action: TaskLogAction;
	timestamp: string;
	metadata?: {
		value?: number;
		notes?: string;
		duration_seconds?: number;
		timer_start?: string;
		timer_end?: string;
	};
}

export interface TaskTimer {
	taskId: string;
	startTime: number;
	elapsedSeconds: number;
	isRunning: boolean;
	isPaused: boolean;
}
