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
