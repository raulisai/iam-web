<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    let showForm = false;
    let taskTable = '';
    let taskId = '';
    let reason = '';
    let severity = 'minor';

    const dispatch = createEventDispatcher();

    function openForm() {
        showForm = true;
    }

    function closeForm() {
        showForm = false;
        // Reset form
        taskTable = '';
        taskId = '';
        reason = '';
        severity = 'minor';
    }

    function submitForm() {
        if (!reason.trim()) return; // Basic validation

        const failure = {
            task_table: taskTable.trim(),
            task_id: taskId.trim() || null,
            reason: reason.trim(),
            severity
        };

        dispatch('submit', failure);
        closeForm();
    }
</script>

<!-- Floating Button -->
<button
    class="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 flex items-center justify-center text-2xl hover:scale-105 transition-transform"
    on:click={openForm}
>
    +
</button>

<!-- Modal Form -->
{#if showForm}
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-neutral-900 rounded-lg p-6 w-full max-w-md border border-white/10">
        <h2 class="text-xl font-bold text-white mb-4">Add New Failure</h2>

        <form on:submit|preventDefault={submitForm} class="space-y-4">
            <!-- Task Table -->
            <div>
                <label for="taskTable" class="block text-sm font-medium text-white/80 mb-1">Task Table</label>
                <input
                    id="taskTable"
                    type="text"
                    bind:value={taskTable}
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., goals, tasks"
                />
            </div>

            <!-- Task ID -->
            <div>
                <label for="taskId" class="block text-sm font-medium text-white/80 mb-1">Task ID</label>
                <input
                    id="taskId"
                    type="text"
                    bind:value={taskId}
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="UUID of the related task"
                />
            </div>

            <!-- Reason -->
            <div>
                <label for="reason" class="block text-sm font-medium text-white/80 mb-1">Reason *</label>
                <textarea
                    id="reason"
                    bind:value={reason}
                    rows="3"
                    required
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Describe what went wrong"
                ></textarea>
            </div>

            <!-- Severity -->
            <div>
                <label for="severity" class="block text-sm font-medium text-white/80 mb-1">Severity</label>
                <select
                    id="severity"
                    bind:value={severity}
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="minor">Minor</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
                <button
                    type="button"
                    on:click={closeForm}
                    class="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    class="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-colors"
                >
                    Add Failure
                </button>
            </div>
        </form>
    </div>
</div>
{/if}