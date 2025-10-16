/**
 * Time Optimizer Types
 * 
 * Shared type definitions for the time optimizer/scheduler system
 */

export type OptimizerTaskType = 'body' | 'mind' | 'goal';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Individual task returned by the time optimizer
 */
export interface TaskNow {
	/** Unique task instance ID */
	id: string;
	
	/** Original task template ID */
	task_id: string;
	
	/** Task title */
	title: string;
	
	/** Task description */
	description: string;
	
	/** Task type/category */
	type: OptimizerTaskType;
	
	/** Estimated duration in minutes */
	estimated_duration_minutes: number;
	
	/** Calculated priority score (higher = more urgent) */
	priority_score: number;
	
	/** Urgency multiplier (usually 1.0, higher for urgent tasks) */
	urgency_multiplier: number;
	
	/** When the task was originally scheduled (ISO 8601) */
	scheduled_at: string | null;
	
	/** Current task status */
	status: TaskStatus;
	
	/** Calculated start time for today (ISO 8601) */
	start_time: string;
	
	/** Calculated end time for today (ISO 8601) */
	end_time: string;
	
	/** Time slot category */
	time_slot: TimeSlot;
	
	// Goal-specific fields (only present if type === 'goal')
	/** Title of the associated goal */
	goal_title?: string;
	
	/** Deadline of the associated goal (ISO 8601 date) */
	goal_deadline?: string;
	
	/** Days remaining until goal deadline */
	days_until_deadline?: number;
	
	/** Weight/importance of the goal task */
	weight?: number;
}

/**
 * Response from the /api/time/tasks-now endpoint
 */
export interface TasksNowResponse {
	/** Body/wellness tasks scheduled for today */
	body_tasks: TaskNow[];
	
	/** Goal-related tasks scheduled for today */
	goal_tasks: TaskNow[];
	
	/** Mind/development tasks scheduled for today */
	mind_tasks: TaskNow[];
	
	/** Current time in user's timezone (ISO 8601) */
	current_time: string;
	
	/** Summary message about time utilization */
	message: string;
	
	/** Hours remaining in the current week slot */
	remaining_hours_in_slot_week: number;
	
	/** Minutes from now until midnight */
	remaining_minutes_today: number;
	
	/** Hours from now until midnight (decimal) */
	remaining_hours_today: number;
	
	/** Count of body tasks scheduled */
	total_body_tasks: number;
	
	/** Count of goal tasks scheduled */
	total_goal_tasks: number;
	
	/** Count of mind tasks scheduled */
	total_mind_tasks: number;
	
	/** Total minutes of scheduled tasks */
	total_time_used_for_tasks: number;
	
	/** Minutes remaining in the current week slot */
	remaining_minutes_in_slot_week: number;
	
	/** Free time after all scheduled tasks (minutes) */
	remaining_after_scheduling: number;
	
	/** Percentage of available time being used (0-100) */
	utilization_percentage: number;
	
	/** Total tasks available in database */
	total_available_tasks: number;
	
	/** Total tasks that fit in remaining time */
	total_scheduled_tasks: number;
	
	/** User ID */
	user_id: string;
	
	/** Whether today is a working day for the user */
	is_working_day: boolean;
	
	/** Total hours available today (24 - work_hours - time_dead) */
	available_hours_today: number;
	
	/** Work hours today (0 if not working day) */
	work_hours_today: number;
	
	/** Time dead from profile (sleep, personal care, etc.) */
	time_dead: number;
}

/**
 * Task type display configuration
 */
export interface TaskTypeConfig {
	/** Display label */
	label: string;
	
	/** Emoji icon */
	icon: string;
	
	/** Gradient classes */
	gradient: string;
	
	/** Border classes */
	border: string;
	
	/** Text color classes */
	text: string;
	
	/** Background classes */
	bg: string;
}

/**
 * Map of task types to their display configs
 */
export const TASK_TYPE_CONFIGS: Record<OptimizerTaskType, TaskTypeConfig> = {
	goal: {
		label: 'Goal',
		icon: '🎯',
		gradient: 'from-blue-500 to-indigo-600',
		border: 'border-blue-400/50',
		text: 'text-blue-400',
		bg: 'bg-blue-500/10'
	},
	mind: {
		label: 'Mind',
		icon: '🧠',
		gradient: 'from-purple-500 to-indigo-600',
		border: 'border-purple-400/50',
		text: 'text-purple-400',
		bg: 'bg-purple-500/10'
	},
	body: {
		label: 'Body',
		icon: '💪',
		gradient: 'from-orange-500 to-red-600',
		border: 'border-orange-400/50',
		text: 'text-orange-400',
		bg: 'bg-orange-500/10'
	}
};

/**
 * Time slot display configuration
 */
export interface TimeSlotConfig {
	/** Display label */
	label: string;
	
	/** Emoji icon */
	icon: string;
	
	/** Color classes */
	color: string;
}

/**
 * Map of time slots to their display configs
 */
export const TIME_SLOT_CONFIGS: Record<TimeSlot, TimeSlotConfig> = {
	morning: {
		label: 'Morning',
		icon: '🌅',
		color: 'text-amber-400'
	},
	afternoon: {
		label: 'Afternoon',
		icon: '☀️',
		color: 'text-yellow-400'
	},
	evening: {
		label: 'Evening',
		icon: '🌙',
		color: 'text-indigo-400'
	}
};

/**
 * Urgency level based on days until deadline
 */
export interface UrgencyLevel {
	/** Display label */
	label: string;
	
	/** Color classes */
	color: string;
	
	/** Emoji indicator */
	icon: string;
}

/**
 * Get urgency level for a task
 */
export function getUrgencyLevel(daysUntilDeadline: number | undefined): UrgencyLevel | null {
	if (daysUntilDeadline === undefined) return null;
	
	if (daysUntilDeadline <= 3) {
		return {
			label: 'Critical',
			color: 'bg-red-500/20 text-red-400 border-red-500/30',
			icon: '🚨'
		};
	} else if (daysUntilDeadline <= 7) {
		return {
			label: 'Urgent',
			color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
			icon: '🔥'
		};
	} else if (daysUntilDeadline <= 14) {
		return {
			label: 'Soon',
			color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
			icon: '⚡'
		};
	}
	
	return null;
}

/**
 * Get utilization color based on percentage
 */
export function getUtilizationColor(percentage: number): string {
	if (percentage >= 85) return 'text-emerald-400';
	if (percentage >= 70) return 'text-blue-400';
	if (percentage >= 50) return 'text-amber-400';
	return 'text-red-400';
}

/**
 * Get utilization badge config
 */
export function getUtilizationBadge(percentage: number): {
	label: string;
	color: string;
	icon: string;
} {
	if (percentage >= 85) {
		return {
			label: 'Optimal',
			color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
			icon: '✅'
		};
	} else if (percentage >= 70) {
		return {
			label: 'Good',
			color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
			icon: '👍'
		};
	} else if (percentage >= 50) {
		return {
			label: 'Fair',
			color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
			icon: '⚠️'
		};
	} else {
		return {
			label: 'Low',
			color: 'bg-red-500/20 text-red-400 border-red-500/30',
			icon: '⬇️'
		};
	}
}
