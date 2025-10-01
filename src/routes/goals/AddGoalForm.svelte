<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    let showForm = false;
    let title = '';
    let description = '';
    let metricKey = '';
    let targetValue = '';
    let startDate = '';
    let endDate = '';

    const dispatch = createEventDispatcher();

    function openForm() {
        showForm = true;
    }

    function closeForm() {
        showForm = false;
        // Reset form
        title = '';
        description = '';
        metricKey = '';
        targetValue = '';
        startDate = '';
        endDate = '';
    }

    function submitForm() {
        if (!title.trim()) return; // Basic validation

        const goal = {
            title: title.trim(),
            description: description.trim(),
            metric_key: metricKey.trim(),
            target_value: parseFloat(targetValue) || null,
            start_date: startDate || null,
            end_date: endDate || null
        };

        dispatch('submit', goal);
        closeForm();
    }
</script>

<!-- Floating Button -->
<button
    class="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center text-2xl hover:scale-105 transition-transform"
    on:click={openForm}
>
    +
</button>

<!-- Modal Form -->
{#if showForm}
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-neutral-900 rounded-lg p-6 w-full max-w-md border border-white/10">
        <h2 class="text-xl font-bold text-white mb-4">Add New Goal</h2>

        <form on:submit|preventDefault={submitForm} class="space-y-4">
            <!-- Title -->
            <div>
                <label for="title" class="block text-sm font-medium text-white/80 mb-1">Title *</label>
                <input
                    id="title"
                    type="text"
                    bind:value={title}
                    required
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter goal title"
                />
            </div>

            <!-- Description -->
            <div>
                <label for="description" class="block text-sm font-medium text-white/80 mb-1">Description</label>
                <textarea
                    id="description"
                    bind:value={description}
                    rows="3"
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Optional description"
                ></textarea>
            </div>

            <!-- Metric Key -->
            <div>
                <label for="metricKey" class="block text-sm font-medium text-white/80 mb-1">Metric Key</label>
                <input
                    id="metricKey"
                    type="text"
                    bind:value={metricKey}
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., workouts, books, savings"
                />
            </div>

            <!-- Target Value -->
            <div>
                <label for="targetValue" class="block text-sm font-medium text-white/80 mb-1">Target Value</label>
                <input
                    id="targetValue"
                    type="number"
                    bind:value={targetValue}
                    step="0.01"
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Numeric target"
                />
            </div>

            <!-- Start Date -->
            <div>
                <label for="startDate" class="block text-sm font-medium text-white/80 mb-1">Start Date</label>
                <input
                    id="startDate"
                    type="date"
                    bind:value={startDate}
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            <!-- End Date -->
            <div>
                <label for="endDate" class="block text-sm font-medium text-white/80 mb-1">End Date</label>
                <input
                    id="endDate"
                    type="date"
                    bind:value={endDate}
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
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
                    class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-md hover:from-purple-600 hover:to-purple-700 transition-colors"
                >
                    Create Goal
                </button>
            </div>
        </form>
    </div>
</div>
{/if}