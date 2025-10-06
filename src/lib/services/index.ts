/**
 * Services Index
 * 
 * Central export point for all service modules.
 * Use this to import multiple services at once.
 */

// Task Services
export * from './tasks_mind';
export * from './tasks_body';
export * from './tasks_common';

// Other Services
export * from './goals';
export * from './failures';
export * from './profile';
export * from './chat';
export * from './speech';

// Legacy (backward compatibility)
// Import from specific files instead of tasks.ts
export {
    getTaskDetail,
    updateTask,
    completeTask
} from './tasks';
