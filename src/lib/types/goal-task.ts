export type TaskPriority = 'low' | 'medium' | 'high';

export interface GoalTask {
	id?: string;
	goal_id?: string;
	user_id?: string;
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
	created_at?: string;
	updated_at?: string;
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
	completed_at?: string | null;
	notes?: string;
	value?: number;
	scheduled_at?: string;
}

export interface TaskOccurrenceWithStatus extends TaskOccurrence {
	status?: string;
	last_action?: string;
	last_value?: number | null;
}

export interface TaskOccurrenceLog extends TaskLog {
	occurrence_id?: string;
}

export interface GoalProgressSummary {
	goal_id: string;
	progress_percent: number;
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
