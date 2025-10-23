import { BACKEND_URL } from '$lib/config';

/**
 * Points summary response
 */
export interface PointsSummary {
	goal_points_target: number;
	goal_points_earned: number;
	goal_points_remaining: number;
	completion_percentage: number;
}

/**
 * Target breakdown response
 */
export interface TargetBreakdown {
	mind_points: number;
	body_points: number;
	goal_points: number;
	total_target_points: number;
}

/**
 * Add points response
 */
export interface AddPointsResponse {
	previous_earned: number;
	points_added: number;
	new_earned: number;
	task_type: 'mind' | 'body' | 'goal';
}

/**
 * Subtract points response
 */
export interface SubtractPointsResponse {
	previous_earned: number;
	points_subtracted: number;
	new_earned: number;
	task_type: 'mind' | 'body' | 'goal';
}

/**
 * Recalculate response
 */
export interface RecalculateResponse {
	target_breakdown: TargetBreakdown;
	points_summary: PointsSummary;
}

/**
 * Get points summary
 */
export async function getPointsSummary(token: string): Promise<PointsSummary> {
	const response = await fetch(`${BACKEND_URL}/api/points`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Failed to fetch points' }));
		throw new Error(error.error || error.message || 'Failed to fetch points summary');
	}

	return response.json();
}

/**
 * Calculate target points
 */
export async function calculateTargetPoints(token: string): Promise<TargetBreakdown> {
	const response = await fetch(`${BACKEND_URL}/api/points/calculate-target`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Failed to calculate target' }));
		throw new Error(error.error || error.message || 'Failed to calculate target points');
	}

	return response.json();
}

/**
 * Add points
 */
export async function addPoints(
	token: string,
	points: number,
	taskType: 'mind' | 'body' | 'goal'
): Promise<AddPointsResponse> {
	const response = await fetch(`${BACKEND_URL}/api/points/add`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			points,
			task_type: taskType
		})
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Failed to add points' }));
		throw new Error(error.error || error.message || 'Failed to add points');
	}

	return response.json();
}

/**
 * Subtract points
 */
export async function subtractPoints(
	token: string,
	points: number,
	taskType: 'mind' | 'body' | 'goal'
): Promise<SubtractPointsResponse> {
	const response = await fetch(`${BACKEND_URL}/api/points/subtract`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			points,
			task_type: taskType
		})
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Failed to subtract points' }));
		throw new Error(error.error || error.message || 'Failed to subtract points');
	}

	return response.json();
}

/**
 * Recalculate all points
 */
export async function recalculatePoints(token: string): Promise<RecalculateResponse> {
	const response = await fetch(`${BACKEND_URL}/api/points/recalculate`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Failed to recalculate' }));
		throw new Error(error.error || error.message || 'Failed to recalculate points');
	}

	return response.json();
}
