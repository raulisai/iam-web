import { apiCall } from '../config';

interface AuthStore {
	user: any;
	isAuthenticated: boolean;
	isLoading: boolean;
	getToken(): string | null;
}

export interface PerformanceSnapshot {
	id: string;
	user_id: string;
	snapshot_at: string;
	energy: number;
	stamina: number;
	strength: number;
	flexibility: number;
	attention: number;
	score_body: number;
	score_mind: number;
	model_version: string;
	calories_burned?: string;
	steps_daily?: string;
	heart_rate?: string;
	sleep_score?: string;
	inputs?: Record<string, any>;
}

export interface StatsSummary {
	count: number;
	period_days: number;
	start_date: string;
	end_date: string;
	averages: {
		[key: string]: {
			avg: number;
			min: number;
			max: number;
			latest: number;
		};
	};
	latest: PerformanceSnapshot;
}

/**
 * Obtiene el último snapshot de performance del usuario
 */
export async function getLatestSnapshot(authStore: AuthStore): Promise<PerformanceSnapshot | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No hay token de autenticación');
			return null;
		}

		const response = await apiCall('/api/stats/snapshots/latest', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (response.status === 404) {
			console.log('No hay snapshots disponibles');
			return null;
		}

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error al obtener último snapshot:', error);
		return null;
	}
}

/**
 * Obtiene el resumen de estadísticas del usuario
 */
export async function getStatsSummary(authStore: AuthStore, days: number = 30): Promise<StatsSummary | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No hay token de autenticación');
			return null;
		}

		const response = await apiCall(`/api/stats/summary?days=${days}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error al obtener resumen de estadísticas:', error);
		return null;
	}
}

/**
 * Obtiene todos los snapshots del usuario
 */
export async function getSnapshots(
	authStore: AuthStore,
	options?: {
		start_date?: string;
		end_date?: string;
		limit?: number;
	}
): Promise<PerformanceSnapshot[]> {
	try {
		const params = new URLSearchParams();
		if (options?.start_date) params.append('start_date', options.start_date);
		if (options?.end_date) params.append('end_date', options.end_date);
		if (options?.limit) params.append('limit', options.limit.toString());

		const token = authStore.getToken();
		if (!token) {
			console.error('No hay token de autenticación');
			return [];
		}

		const queryString = params.toString();
		const endpoint = `/api/stats/snapshots${queryString ? `?${queryString}` : ''}`;

		const response = await apiCall(endpoint, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error al obtener snapshots:', error);
		return [];
	}
}

/**
 * Crea un nuevo snapshot de performance
 */
export async function createSnapshot(
	authStore: AuthStore,
	snapshot: Partial<PerformanceSnapshot>
): Promise<PerformanceSnapshot | null> {
	try {
		const token = authStore.getToken();
		if (!token) {
			console.error('No hay token de autenticación');
			return null;
		}

		const response = await apiCall('/api/stats/snapshots', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify(snapshot)
		});

		if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error al crear snapshot:', error);
		return null;
	}
}
