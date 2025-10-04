<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { getAuthStore } from '../../../lib/stores/auth.svelte';
    import { fetchGoals, updateGoal, deleteGoal, type Goal as ApiGoal } from '../../../lib/services/goals';
    
    const authStore = getAuthStore();
    let goalId: string = '';
    
    $: goalId = $page.params.id || '';

    let goal: ApiGoal | null = null;
    let isLoading = true;
    let isSaving = false;
    let isDeleting = false;
    let error = '';
    let successMessage = '';
    let showDeleteConfirm = false;

    // Form fields
    let title = '';
    let description = '';
    let type: 'short' | 'medium' | 'long' = 'short';
    let descShort = '';
    let metricKey = '';
    let targetValue = 0;
    let progress = 0;
    let startDate = '';
    let endDate = '';
    let isActive = true;

    const typeColors = {
        short: 'from-blue-500 to-blue-600',
        medium: 'from-amber-500 to-amber-600',
        long: 'from-purple-500 to-purple-600'
    };

    const typeLabels = {
        short: 'Short Term (1-4 weeks)',
        medium: 'Medium Term (1-3 months)',
        long: 'Long Term (3+ months)'
    };

    async function loadGoal() {
        isLoading = true;
        error = '';
        
        try {
            const token = authStore.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const goals = await fetchGoals(token);
            goal = goals.find(g => g.id === goalId) || null;

            if (!goal) {
                error = 'Goal not found';
                return;
            }

            // Populate form fields
            title = goal.title;
            description = goal.description || '';
            type = goal.type;
            descShort = goal.desc_short || '';
            metricKey = goal.metric_key;
            targetValue = goal.target_value;
            progress = goal.progress;
            startDate = goal.start_date;
            endDate = goal.end_date || '';
            isActive = goal.is_active;

        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load goal';
            console.error('Error loading goal:', err);
        } finally {
            isLoading = false;
        }
    }

    async function handleSave() {
        if (!title.trim() || !metricKey.trim() || !targetValue || !startDate) {
            error = 'Please fill in all required fields';
            return;
        }

        isSaving = true;
        error = '';
        successMessage = '';

        try {
            const token = authStore.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const updates = {
                title: title.trim(),
                description: description.trim(),
                type,
                desc_short: descShort.trim() || undefined,
                metric_key: metricKey.trim(),
                target_value: targetValue,
                progress: String(progress),
                is_active: isActive,
                end_date: endDate || undefined
            };

            const updatedGoal = await updateGoal(token, goalId, updates);
            goal = updatedGoal;
            
            successMessage = 'Goal updated successfully!';
            setTimeout(() => {
                successMessage = '';
            }, 3000);

        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to update goal';
            console.error('Error updating goal:', err);
        } finally {
            isSaving = false;
        }
    }

    async function handleDelete() {
        isDeleting = true;
        error = '';

        try {
            const token = authStore.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            await deleteGoal(token, goalId);
            goto('/goals');
            
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to delete goal';
            console.error('Error deleting goal:', err);
        } finally {
            isDeleting = false;
            showDeleteConfirm = false;
        }
    }

    onMount(() => {
        loadGoal();
    });
</script>

<svelte:head>
    <title>{goal?.title || 'Edit Goal'} - IAM Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-neutral-950 pb-20">
    {#if isLoading}
        <!-- Loading State -->
        <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
                <div class="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                <p class="text-white/60 text-lg">Loading goal...</p>
            </div>
        </div>
    {:else if error && !goal}
        <!-- Error State -->
        <div class="flex items-center justify-center min-h-screen px-4">
            <div class="text-center">
                <div class="text-6xl mb-4">😕</div>
                <h2 class="text-2xl font-bold text-white mb-2">Goal Not Found</h2>
                <p class="text-white/60 mb-6">{error}</p>
                <a href="/goals" class="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all">
                    Back to Goals
                </a>
            </div>
        </div>
    {:else if goal}
        <!-- Header -->
        <div class="sticky top-0 z-10 bg-neutral-950/80 backdrop-blur-lg border-b border-white/10">
            <div class="max-w-4xl mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <a href="/goals" class="text-white/60 hover:text-white transition-colors" aria-label="Back to goals">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </a>
                        <div>
                            <h1 class="text-xl md:text-2xl font-bold text-white">Edit Goal</h1>
                            <p class="text-xs text-white/60 mt-0.5">Modify your goal details and track progress</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button
                            on:click={() => showDeleteConfirm = true}
                            disabled={isDeleting}
                            class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                            title="Delete goal"
                            aria-label="Delete goal"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-4xl mx-auto px-4 py-6">
            <!-- Messages -->
            {#if error}
            <div class="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 flex items-start justify-between">
                <div class="flex items-start gap-2">
                    <span class="text-xl">⚠️</span>
                    <span>{error}</span>
                </div>
                <button on:click={() => error = ''} class="text-red-200 hover:text-white">✕</button>
            </div>
            {/if}

            {#if successMessage}
            <div class="mb-4 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-200 flex items-start justify-between">
                <div class="flex items-start gap-2">
                    <span class="text-xl">✅</span>
                    <span>{successMessage}</span>
                </div>
                <button on:click={() => successMessage = ''} class="text-emerald-200 hover:text-white">✕</button>
            </div>
            {/if}

            <!-- Goal Header Card -->
            <div class="mb-6 rounded-2xl bg-gradient-to-br {typeColors[type]} p-6 text-white shadow-lg">
                <div class="flex items-center gap-2 mb-2">
                    <div class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                        {typeLabels[type]}
                    </div>
                    <div class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1">
                        <span>{isActive ? '✓ Active' : '○ Inactive'}</span>
                    </div>
                </div>
                <h2 class="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
                <p class="text-white/90 text-sm">{description || 'No description'}</p>
                
                <!-- Progress Bar -->
                <div class="mt-4">
                    <div class="flex items-center justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span class="font-bold">{progress}%</span>
                    </div>
                    <div class="h-3 bg-white/20 rounded-full overflow-hidden">
                        <div class="h-full bg-white transition-all duration-300" style="width: {progress}%"></div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-3 gap-3 mt-4">
                    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div class="text-xs text-white/70">Target</div>
                        <div class="text-lg font-bold">{targetValue}</div>
                    </div>
                    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div class="text-xs text-white/70">Start</div>
                        <div class="text-sm font-semibold">{new Date(startDate).toLocaleDateString()}</div>
                    </div>
                    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div class="text-xs text-white/70">End</div>
                        <div class="text-sm font-semibold">{endDate ? new Date(endDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                </div>
            </div>

            <!-- Edit Form -->
            <div class="bg-neutral-900 rounded-2xl border border-white/10 p-6 mb-6">
                <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Goal Details
                </h3>

                <form on:submit|preventDefault={handleSave} class="space-y-4">
                    <!-- Title -->
                    <div>
                        <label for="title" class="block text-sm font-medium text-white/80 mb-2">Title *</label>
                        <input
                            id="title"
                            type="text"
                            bind:value={title}
                            required
                            class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="Enter goal title"
                        />
                    </div>

                    <!-- Description -->
                    <div>
                        <label for="description" class="block text-sm font-medium text-white/80 mb-2">Description</label>
                        <textarea
                            id="description"
                            bind:value={description}
                            rows="3"
                            class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                            placeholder="Describe your goal in detail"
                        ></textarea>
                    </div>

                    <!-- Type and Active Status -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="type" class="block text-sm font-medium text-white/80 mb-2">Goal Type *</label>
                            <select
                                id="type"
                                bind:value={type}
                                class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            >
                                <option value="short">Short Term</option>
                                <option value="medium">Medium Term</option>
                                <option value="long">Long Term</option>
                            </select>
                        </div>
                        <div>
                            <label for="isActive" class="block text-sm font-medium text-white/80 mb-2">Status</label>
                            <select
                                id="isActive"
                                bind:value={isActive}
                                class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            >
                                <option value={true}>Active</option>
                                <option value={false}>Inactive</option>
                            </select>
                        </div>
                    </div>

                    <!-- Short Description -->
                    <div>
                        <label for="descShort" class="block text-sm font-medium text-white/80 mb-2">Short Description</label>
                        <input
                            id="descShort"
                            type="text"
                            bind:value={descShort}
                            class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="Brief summary"
                        />
                    </div>

                    <!-- Metric and Target -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="metricKey" class="block text-sm font-medium text-white/80 mb-2">Metric Key *</label>
                            <input
                                id="metricKey"
                                type="text"
                                bind:value={metricKey}
                                required
                                class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="e.g., workouts"
                            />
                        </div>
                        <div>
                            <label for="targetValue" class="block text-sm font-medium text-white/80 mb-2">Target Value *</label>
                            <input
                                id="targetValue"
                                type="number"
                                bind:value={targetValue}
                                required
                                step="0.01"
                                min="0"
                                class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="30"
                            />
                        </div>
                    </div>

                    <!-- Progress Slider -->
                    <div>
                        <label for="progress" class="block text-sm font-medium text-white/80 mb-2">
                            Current Progress: <span class="text-emerald-400 font-bold">{progress}%</span>
                        </label>
                        <input
                            id="progress"
                            type="range"
                            bind:value={progress}
                            min="0"
                            max="100"
                            step="1"
                            class="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <div class="flex justify-between text-xs text-white/50 mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <!-- Dates -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="startDate" class="block text-sm font-medium text-white/80 mb-2">Start Date *</label>
                            <input
                                id="startDate"
                                type="date"
                                bind:value={startDate}
                                required
                                class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label for="endDate" class="block text-sm font-medium text-white/80 mb-2">End Date</label>
                            <input
                                id="endDate"
                                type="date"
                                bind:value={endDate}
                                class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <!-- Save Button -->
                    <button
                        type="submit"
                        disabled={isSaving}
                        class="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                    >
                        {#if isSaving}
                            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Saving...
                        {:else}
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                        {/if}
                    </button>
                </form>
            </div>

            <!-- Tasks Section (Placeholder) -->
            <div class="bg-neutral-900 rounded-2xl border border-white/10 p-6">
                <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Tasks to Complete
                </h3>
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">📝</div>
                    <p class="text-white/60 mb-4">Tasks functionality coming soon!</p>
                    <p class="text-sm text-white/40">You'll be able to break down your goal into actionable tasks</p>
                </div>
            </div>
        </div>
    {/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div class="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-red-500/30 shadow-2xl">
        <div class="text-center mb-6">
            <div class="text-6xl mb-4">⚠️</div>
            <h3 class="text-xl font-bold text-white mb-2">Delete Goal?</h3>
            <p class="text-white/60">This action cannot be undone. All associated tasks will also be deleted.</p>
        </div>
        
        <div class="flex gap-3">
            <button
                on:click={() => showDeleteConfirm = false}
                disabled={isDeleting}
                class="flex-1 px-4 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors disabled:opacity-50 font-medium"
            >
                Cancel
            </button>
            <button
                on:click={handleDelete}
                disabled={isDeleting}
                class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
                {#if isDeleting}
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deleting...
                {:else}
                    Delete Goal
                {/if}
            </button>
        </div>
    </div>
</div>
{/if}

<style>
    input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%);
        cursor: pointer;
        box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
    }

    input[type="range"]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%);
        cursor: pointer;
        border: none;
        box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
    }
</style>
