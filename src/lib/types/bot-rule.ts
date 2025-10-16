export interface BotRule {
	id?: string;
	rule_key: string;
	name: string;
	description?: string;
	condition: Record<string, any>;
	action: Record<string, any>;
	is_active: boolean;
	priority: number;
	created_at?: string;
	updated_at?: string;
}

export interface CreateBotRuleData {
	name: string;
	condition: Record<string, any>;
	action: Record<string, any>;
	description?: string;
	is_active?: boolean;
	active?: boolean;
	priority?: number;
}
