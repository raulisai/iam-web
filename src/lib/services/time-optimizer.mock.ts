/**
 * Mock Data for Time Optimizer Components
 * 
 * Use this for development and testing without backend
 */

import type { TasksNowResponse, TaskNow } from '$lib/types/time-optimizer';

/**
 * Sample task data for different scenarios
 */
export const mockTasksNow: TaskNow[] = [
	{
		id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
		task_id: 'task-001',
		title: 'Morning Meditation',
		description: 'Start your day with 15 minutes of mindfulness meditation',
		type: 'body',
		estimated_duration_minutes: 15,
		priority_score: 850,
		urgency_multiplier: 1.2,
		scheduled_at: null,
		status: 'pending',
		start_time: '2025-10-11T07:00:00-06:00',
		end_time: '2025-10-11T07:15:00-06:00',
		time_slot: 'morning'
	},
	{
		id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
		task_id: 'task-002',
		title: 'Review Pull Requests',
		description: 'Review pending PRs for IAM web project',
		type: 'mind',
		estimated_duration_minutes: 45,
		priority_score: 1200,
		urgency_multiplier: 1.0,
		scheduled_at: null,
		status: 'pending',
		start_time: '2025-10-11T09:00:00-06:00',
		end_time: '2025-10-11T09:45:00-06:00',
		time_slot: 'morning'
	},
	{
		id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
		task_id: 'task-003',
		title: 'Complete Dashboard UI',
		description: 'Finish implementing the dashboard user interface components',
		type: 'goal',
		goal_title: 'Finish IAM Web Project',
		goal_deadline: '2025-10-29',
		days_until_deadline: 18,
		weight: 100000,
		estimated_duration_minutes: 120,
		priority_score: 3500000,
		urgency_multiplier: 1.5,
		scheduled_at: null,
		status: 'in_progress',
		start_time: '2025-10-11T10:00:00-06:00',
		end_time: '2025-10-11T12:00:00-06:00',
		time_slot: 'morning'
	},
	{
		id: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
		task_id: 'task-004',
		title: 'Lunch & Walk',
		description: 'Healthy lunch followed by a 20-minute walk',
		type: 'body',
		estimated_duration_minutes: 60,
		priority_score: 600,
		urgency_multiplier: 1.0,
		scheduled_at: null,
		status: 'pending',
		start_time: '2025-10-11T13:00:00-06:00',
		end_time: '2025-10-11T14:00:00-06:00',
		time_slot: 'afternoon'
	},
	{
		id: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
		task_id: 'task-005',
		title: 'Learn React Hooks',
		description: 'Complete advanced React Hooks tutorial',
		type: 'mind',
		estimated_duration_minutes: 90,
		priority_score: 1100,
		urgency_multiplier: 1.0,
		scheduled_at: null,
		status: 'pending',
		start_time: '2025-10-11T14:10:00-06:00',
		end_time: '2025-10-11T15:40:00-06:00',
		time_slot: 'afternoon'
	},
	{
		id: '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u',
		task_id: 'task-006',
		title: 'Write API Documentation',
		description: 'Document all endpoints for the time optimizer API',
		type: 'goal',
		goal_title: 'Complete API Documentation',
		goal_deadline: '2025-10-15',
		days_until_deadline: 4,
		weight: 80000,
		estimated_duration_minutes: 60,
		priority_score: 2800000,
		urgency_multiplier: 2.0,
		scheduled_at: null,
		status: 'pending',
		start_time: '2025-10-11T16:00:00-06:00',
		end_time: '2025-10-11T17:00:00-06:00',
		time_slot: 'afternoon'
	},
	{
		id: '7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v',
		task_id: 'task-007',
		title: 'Gym Session',
		description: 'Full body workout at the gym',
		type: 'body',
		estimated_duration_minutes: 60,
		priority_score: 750,
		urgency_multiplier: 1.0,
		scheduled_at: null,
		status: 'pending',
		start_time: '2025-10-11T18:00:00-06:00',
		end_time: '2025-10-11T19:00:00-06:00',
		time_slot: 'evening'
	},
	{
		id: '8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w',
		task_id: 'task-008',
		title: 'Evening Reading',
		description: 'Read chapter 5 of "Atomic Habits"',
		type: 'mind',
		estimated_duration_minutes: 30,
		priority_score: 900,
		urgency_multiplier: 1.0,
		scheduled_at: null,
		status: 'pending',
		start_time: '2025-10-11T20:00:00-06:00',
		end_time: '2025-10-11T20:30:00-06:00',
		time_slot: 'evening'
	}
];

/**
 * Complete mock response with high utilization (optimal scenario)
 */
export const mockTasksNowResponseOptimal: TasksNowResponse = {
	body_tasks: mockTasksNow.filter(t => t.type === 'body'),
	goal_tasks: mockTasksNow.filter(t => t.type === 'goal'),
	mind_tasks: mockTasksNow.filter(t => t.type === 'mind'),
	current_time: '2025-10-11T06:30:00-06:00',
	message: 'You have 900 minutes remaining today. 810 minutes scheduled (90% utilization).',
	remaining_hours_in_slot_week: 42.5,
	remaining_minutes_today: 900,
	remaining_hours_today: 15.0,
	total_body_tasks: 3,
	total_goal_tasks: 2,
	total_mind_tasks: 3,
	total_time_used_for_tasks: 810,
	remaining_minutes_in_slot_week: 2550,
	remaining_after_scheduling: 90,
	utilization_percentage: 90.0,
	total_available_tasks: 25,
	total_scheduled_tasks: 8,
	user_id: 'user-123',
	is_working_day: false,
	available_hours_today: 15.0,
	work_hours_today: 0,
	time_dead: 9
};

/**
 * Mock response with low utilization
 */
export const mockTasksNowResponseLow: TasksNowResponse = {
	body_tasks: mockTasksNow.filter(t => t.type === 'body').slice(0, 1),
	goal_tasks: mockTasksNow.filter(t => t.type === 'goal').slice(0, 1),
	mind_tasks: mockTasksNow.filter(t => t.type === 'mind').slice(0, 1),
	current_time: '2025-10-11T06:30:00-06:00',
	message: 'You have 900 minutes remaining today. 195 minutes scheduled (22% utilization).',
	remaining_hours_in_slot_week: 42.5,
	remaining_minutes_today: 900,
	remaining_hours_today: 15.0,
	total_body_tasks: 1,
	total_goal_tasks: 1,
	total_mind_tasks: 1,
	total_time_used_for_tasks: 195,
	remaining_minutes_in_slot_week: 2550,
	remaining_after_scheduling: 705,
	utilization_percentage: 21.7,
	total_available_tasks: 8,
	total_scheduled_tasks: 3,
	user_id: 'user-123',
	is_working_day: false,
	available_hours_today: 15.0,
	work_hours_today: 0,
	time_dead: 9
};

/**
 * Mock response with no tasks (empty state)
 */
export const mockTasksNowResponseEmpty: TasksNowResponse = {
	body_tasks: [],
	goal_tasks: [],
	mind_tasks: [],
	current_time: '2025-10-11T06:30:00-06:00',
	message: 'You have 900 minutes remaining today. No tasks scheduled.',
	remaining_hours_in_slot_week: 42.5,
	remaining_minutes_today: 900,
	remaining_hours_today: 15.0,
	total_body_tasks: 0,
	total_goal_tasks: 0,
	total_mind_tasks: 0,
	total_time_used_for_tasks: 0,
	remaining_minutes_in_slot_week: 2550,
	remaining_after_scheduling: 900,
	utilization_percentage: 0.0,
	total_available_tasks: 0,
	total_scheduled_tasks: 0,
	user_id: 'user-123',
	is_working_day: false,
	available_hours_today: 15.0,
	work_hours_today: 0,
	time_dead: 9
};

/**
 * Mock response with urgent tasks
 */
export const mockTasksNowResponseUrgent: TasksNowResponse = {
	body_tasks: [],
	goal_tasks: [
		{
			...mockTasksNow[2],
			days_until_deadline: 2,
			title: 'URGENT: Submit Project Proposal',
			urgency_multiplier: 3.0,
			priority_score: 5000000
		},
		{
			...mockTasksNow[5],
			days_until_deadline: 1,
			title: 'CRITICAL: Fix Production Bug',
			urgency_multiplier: 4.0,
			priority_score: 8000000
		}
	],
	mind_tasks: [],
	current_time: '2025-10-11T06:30:00-06:00',
	message: 'You have 900 minutes remaining today. 180 minutes scheduled (20% utilization). 2 URGENT tasks!',
	remaining_hours_in_slot_week: 42.5,
	remaining_minutes_today: 900,
	remaining_hours_today: 15.0,
	total_body_tasks: 0,
	total_goal_tasks: 2,
	total_mind_tasks: 0,
	total_time_used_for_tasks: 180,
	remaining_minutes_in_slot_week: 2550,
	remaining_after_scheduling: 720,
	utilization_percentage: 20.0,
	total_available_tasks: 5,
	total_scheduled_tasks: 2,
	user_id: 'user-123',
	is_working_day: true,
	available_hours_today: 8.0,
	work_hours_today: 7,
	time_dead: 9
};

/**
 * Mock service function that returns different scenarios
 */
export async function getMockTasksNow(scenario: 'optimal' | 'low' | 'empty' | 'urgent' = 'optimal'): Promise<TasksNowResponse> {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 1000));
	
	switch (scenario) {
		case 'low':
			return mockTasksNowResponseLow;
		case 'empty':
			return mockTasksNowResponseEmpty;
		case 'urgent':
			return mockTasksNowResponseUrgent;
		case 'optimal':
		default:
			return mockTasksNowResponseOptimal;
	}
}

/**
 * Example usage in component:
 * 
 * ```typescript
 * import { getMockTasksNow } from '$lib/services/time-optimizer.mock';
 * 
 * // In development mode, use mock data
 * const data = await getMockTasksNow('optimal');
 * 
 * // Or with random scenario
 * const scenarios = ['optimal', 'low', 'empty', 'urgent'] as const;
 * const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
 * const data = await getMockTasksNow(randomScenario);
 * ```
 */
