/**
 * Common utility functions for task services
 */

/**
 * Get icon for task category
 */
export function getIconForCategory(category: string): string {
    const iconMap: Record<string, string> = {
        'body': '🧘',
        'mind': '🧠',
        'goals': '🎯',
        'failures': '💥',
        'assistant': '🤖'
    };
    return iconMap[category] || '⭐';
}

/**
 * Map raw task data to Task interface
 */
export function mapTaskData(task: any): any {
    return {
        id: task.id,
        title: task.task_templates.name,
        durationMinutes: task.task_templates.estimated_minutes,
        points: task.task_templates.reward_xp,
        summary: task.task_templates.desc,
        rating: task.task_templates.difficulty,
        icon: getIconForCategory(task.task_templates.category)
    };
}
