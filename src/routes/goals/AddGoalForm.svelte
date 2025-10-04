<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    let showForm = false;
    let title = '';
    let description = '';
    let type: 'short' | 'medium' | 'long' = 'short';
    let descShort = '';
    let metricKey = '';
    let targetValue = '';
    let startDate = '';
    let endDate = '';
    let isSubmitting = false;
    let error = '';

    const dispatch = createEventDispatcher();

    function openForm() {
        showForm = true;
        error = '';
    }

    function closeForm() {
        showForm = false;
        // Reset form
        title = '';
        description = '';
        type = 'short';
        descShort = '';
        metricKey = '';
        targetValue = '';
        startDate = '';
        endDate = '';
        error = '';
    }

    async function submitForm() {
        if (!title.trim() || !metricKey.trim() || !targetValue || !startDate) {
            error = 'Please fill in all required fields';
            return;
        }

        isSubmitting = true;
        error = '';

        try {
            const goal = {
                title: title.trim(),
                description: description.trim(),
                type,
                desc_short: descShort.trim() || undefined,
                metric_key: metricKey.trim(),
                target_value: parseFloat(targetValue),
                is_active: true,
                start_date: startDate,
                end_date: endDate || undefined,
                progress: '0'
            };

            dispatch('submit', goal);
            closeForm();
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to create goal';
        } finally {
            isSubmitting = false;
        }
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
            <!-- Error message -->
            {#if error}
            <div class="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200 text-sm">
                {error}
            </div>
            {/if}

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
                    placeholder="Describe your goal"
                ></textarea>
            </div>

            <!-- Type -->
            <div>
                <label for="type" class="block text-sm font-medium text-white/80 mb-1">Goal Type *</label>
                <select
                    id="type"
                    bind:value={type}
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="short">Short Term (1-4 weeks)</option>
                    <option value="medium">Medium Term (1-3 months)</option>
                    <option value="long">Long Term (3+ months)</option>
                </select>
            </div>

            <!-- Short Description -->
            <div>
                <label for="descShort" class="block text-sm font-medium text-white/80 mb-1">Short Description</label>
                <input
                    id="descShort"
                    type="text"
                    bind:value={descShort}
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Brief summary"
                />
            </div>

            <!-- Metric Key -->
            <div>
                <label for="metricKey" class="block text-sm font-medium text-white/80 mb-1">Metric Key *</label>
                <input
                    id="metricKey"
                    type="text"
                    bind:value={metricKey}
                    required
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., workouts, books, meditation_days"
                />
            </div>

            <!-- Target Value -->
            <div>
                <label for="targetValue" class="block text-sm font-medium text-white/80 mb-1">Target Value *</label>
                <input
                    id="targetValue"
                    type="number"
                    bind:value={targetValue}
                    required
                    step="0.01"
                    min="0"
                    class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="30"
                />
            </div>

            <!-- Date Range -->
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label for="startDate" class="block text-sm font-medium text-white/80 mb-1">Start Date *</label>
                    <input
                        id="startDate"
                        type="date"
                        bind:value={startDate}
                        required
                        class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div>
                    <label for="endDate" class="block text-sm font-medium text-white/80 mb-1">End Date</label>
                    <input
                        id="endDate"
                        type="date"
                        bind:value={endDate}
                        class="w-full px-3 py-2 bg-neutral-800 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
                <button
                    type="button"
                    on:click={closeForm}
                    disabled={isSubmitting}
                    class="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-md hover:from-purple-600 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                    {#if isSubmitting}
                        <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                    {/if}
                    {isSubmitting ? 'Creating...' : 'Create Goal'}
                </button>
            </div>
        </form>
    </div>
</div>
{/if}