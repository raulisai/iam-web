<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { getMindTasks, getBodyTasks, type Task } from '$lib/services/tasks';
    import { getAuthStore } from '$lib/stores/auth.svelte';

    const authStore = getAuthStore();

    let showForm = false;
    let taskTable: 'tasks_mind' | 'tasks_body' = 'tasks_mind';
    let taskId = '';
    let reason = '';
    let severity: 'minor' | 'major' | 'critical' = 'minor';
    let notes = '';
    let title = '';
    let rootCause = '';
    let prevention = '';
    
    let mindTasks: Task[] = [];
    let bodyTasks: Task[] = [];
    let loading = false;
    let error = '';
    let currentStep = 1;

    $: availableTasks = taskTable === 'tasks_mind' ? mindTasks : bodyTasks;
    $: selectedTask = availableTasks.find(t => t.id === taskId);

    const dispatch = createEventDispatcher();

    async function loadTasks() {
        loading = true;
        error = '';
        try {
            const [mind, body] = await Promise.all([
                getMindTasks(authStore),
                getBodyTasks(authStore)
            ]);
            mindTasks = mind;
            bodyTasks = body;
        } catch (err) {
            error = 'Error loading tasks. Please try again.';
            console.error('Error loading tasks:', err);
        } finally {
            loading = false;
        }
    }

    function openForm() {
        showForm = true;
        currentStep = 1;
        loadTasks();
    }

    function closeForm() {
        showForm = false;
        resetForm();
    }

    function resetForm() {
        taskTable = 'tasks_mind';
        taskId = '';
        reason = '';
        severity = 'minor';
        notes = '';
        title = '';
        rootCause = '';
        prevention = '';
        error = '';
        currentStep = 1;
    }

    function nextStep() {
        if (currentStep === 1 && !taskId) {
            error = 'Please select a task';
            return;
        }
        if (currentStep === 2 && !reason.trim()) {
            error = 'Please describe what happened';
            return;
        }
        error = '';
        currentStep++;
    }

    function prevStep() {
        error = '';
        currentStep--;
    }

    function submitForm() {
        if (!taskId || !reason.trim()) {
            error = 'Please complete all required fields';
            return;
        }

        const failure = {
            task_table: taskTable,
            task_id: taskId,
            reason: reason.trim(),
            severity,
            notes: notes.trim() || undefined,
            title: title.trim() || undefined,
            rootCause: rootCause.trim() || undefined,
            prevention: prevention.trim() || undefined
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
<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div class="bg-neutral-900 rounded-xl p-6 w-full max-w-2xl border border-white/10 shadow-2xl my-8">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold text-white">Record Failure</h2>
                <p class="text-sm text-white/60 mt-1">Learn from what didn't work</p>
            </div>
            <button
                type="button"
                on:click={closeForm}
                class="text-white/60 hover:text-white transition-colors"
                aria-label="Close form"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Progress Steps -->
        <div class="flex items-center justify-between mb-8">
            <div class="flex items-center flex-1">
                <div class="flex items-center justify-center w-10 h-10 rounded-full {currentStep >= 1 ? 'bg-red-500' : 'bg-neutral-700'} text-white font-semibold">
                    1
                </div>
                <div class="h-1 flex-1 mx-2 {currentStep >= 2 ? 'bg-red-500' : 'bg-neutral-700'}"></div>
            </div>
            <div class="flex items-center flex-1">
                <div class="flex items-center justify-center w-10 h-10 rounded-full {currentStep >= 2 ? 'bg-red-500' : 'bg-neutral-700'} text-white font-semibold">
                    2
                </div>
                <div class="h-1 flex-1 mx-2 {currentStep >= 3 ? 'bg-red-500' : 'bg-neutral-700'}"></div>
            </div>
            <div class="flex items-center justify-center w-10 h-10 rounded-full {currentStep >= 3 ? 'bg-red-500' : 'bg-neutral-700'} text-white font-semibold">
                3
            </div>
        </div>

        <!-- Error Message -->
        {#if error}
        <div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
        </div>
        {/if}

        <!-- Loading State -->
        {#if loading}
        <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
        {:else}

        <form on:submit|preventDefault={submitForm} class="space-y-6">
            <!-- Step 1: Select Task -->
            {#if currentStep === 1}
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-white mb-4">Select the task that failed</h3>
                
                <!-- Task Type Selector -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <button
                        type="button"
                        on:click={() => { taskTable = 'tasks_mind'; taskId = ''; }}
                        class="p-4 rounded-lg border-2 transition-all {taskTable === 'tasks_mind' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-neutral-800'}"
                    >
                        <div class="text-3xl mb-2">🧠</div>
                        <div class="text-white font-semibold">Mind Tasks</div>
                        <div class="text-xs text-white/60 mt-1">{mindTasks.length} tasks</div>
                    </button>
                    <button
                        type="button"
                        on:click={() => { taskTable = 'tasks_body'; taskId = ''; }}
                        class="p-4 rounded-lg border-2 transition-all {taskTable === 'tasks_body' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-neutral-800'}"
                    >
                        <div class="text-3xl mb-2">💪</div>
                        <div class="text-white font-semibold">Body Tasks</div>
                        <div class="text-xs text-white/60 mt-1">{bodyTasks.length} tasks</div>
                    </button>
                </div>

                <!-- Task List -->
                {#if availableTasks.length === 0}
                <div class="text-center py-8 text-white/60">
                    <p>No pending tasks available</p>
                </div>
                {:else}
                <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {#each availableTasks as task}
                    <button
                        type="button"
                        on:click={() => taskId = task.id}
                        class="w-full p-4 rounded-lg border-2 transition-all text-left {taskId === task.id ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-neutral-800 hover:border-white/20'}"
                    >
                        <div class="flex items-start gap-3">
                            <div class="text-2xl">{task.icon || '📋'}</div>
                            <div class="flex-1">
                                <div class="text-white font-semibold">{task.title}</div>
                                {#if task.summary}
                                <div class="text-sm text-white/60 mt-1">{task.summary}</div>
                                {/if}
                                <div class="flex gap-3 mt-2 text-xs">
                                    {#if task.durationMinutes}
                                    <span class="text-white/50">⏱️ {task.durationMinutes} min</span>
                                    {/if}
                                    {#if task.points}
                                    <span class="text-white/50">⭐ {task.points} XP</span>
                                    {/if}
                                </div>
                            </div>
                            {#if taskId === task.id}
                            <div class="text-red-500">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            {/if}
                        </div>
                    </button>
                    {/each}
                </div>
                {/if}
            </div>
            {/if}

            <!-- Step 2: Describe Failure -->
            {#if currentStep === 2}
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-white mb-4">What happened?</h3>

                {#if selectedTask}
                <div class="p-4 bg-neutral-800 rounded-lg border border-white/10 mb-4">
                    <div class="flex items-center gap-3">
                        <div class="text-2xl">{selectedTask.icon || '📋'}</div>
                        <div>
                            <div class="text-white font-semibold">{selectedTask.title}</div>
                            <div class="text-xs text-white/60">{taskTable === 'tasks_mind' ? 'Mind Task' : 'Body Task'}</div>
                        </div>
                    </div>
                </div>
                {/if}

                <!-- Title -->
                <div>
                    <label for="title" class="block text-sm font-medium text-white/80 mb-2">
                        Title <span class="text-white/50">(optional)</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        bind:value={title}
                        class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., Skipped morning workout"
                    />
                </div>

                <!-- Reason -->
                <div>
                    <label for="reason" class="block text-sm font-medium text-white/80 mb-2">
                        What happened? <span class="text-red-400">*</span>
                    </label>
                    <textarea
                        id="reason"
                        bind:value={reason}
                        rows="4"
                        class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder="Describe what went wrong and why you couldn't complete the task..."
                    ></textarea>
                </div>

                <!-- Severity -->
                <div>
                    <div class="block text-sm font-medium text-white/80 mb-3">Severity</div>
                    <div class="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            on:click={() => severity = 'minor'}
                            class="p-3 rounded-lg border-2 transition-all {severity === 'minor' ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 bg-neutral-800'}"
                        >
                            <div class="text-2xl mb-1">⚠️</div>
                            <div class="text-white font-semibold text-sm">Minor</div>
                        </button>
                        <button
                            type="button"
                            on:click={() => severity = 'major'}
                            class="p-3 rounded-lg border-2 transition-all {severity === 'major' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-neutral-800'}"
                        >
                            <div class="text-2xl mb-1">⚡</div>
                            <div class="text-white font-semibold text-sm">Major</div>
                        </button>
                        <button
                            type="button"
                            on:click={() => severity = 'critical'}
                            class="p-3 rounded-lg border-2 transition-all {severity === 'critical' ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-neutral-800'}"
                        >
                            <div class="text-2xl mb-1">🚨</div>
                            <div class="text-white font-semibold text-sm">Critical</div>
                        </button>
                    </div>
                </div>

                <!-- Notes -->
                <div>
                    <label for="notes" class="block text-sm font-medium text-white/80 mb-2">
                        Additional Notes <span class="text-white/50">(optional)</span>
                    </label>
                    <textarea
                        id="notes"
                        bind:value={notes}
                        rows="2"
                        class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder="Any other relevant information..."
                    ></textarea>
                </div>
            </div>
            {/if}

            <!-- Step 3: Analysis & Prevention -->
            {#if currentStep === 3}
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-white mb-4">Learn from it</h3>

                <!-- Root Cause -->
                <div>
                    <label for="rootCause" class="block text-sm font-medium text-white/80 mb-2">
                        Root Cause <span class="text-white/50">(optional)</span>
                    </label>
                    <textarea
                        id="rootCause"
                        bind:value={rootCause}
                        rows="3"
                        class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder="What was the underlying cause? Why did this really happen?"
                    ></textarea>
                    <p class="text-xs text-white/50 mt-1">💡 Ask yourself "Why?" 5 times to find the root cause</p>
                </div>

                <!-- Prevention Strategy -->
                <div>
                    <label for="prevention" class="block text-sm font-medium text-white/80 mb-2">
                        Prevention Strategy <span class="text-white/50">(optional)</span>
                    </label>
                    <textarea
                        id="prevention"
                        bind:value={prevention}
                        rows="3"
                        class="w-full px-4 py-3 bg-neutral-800 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder="What will you do differently next time to prevent this?"
                    ></textarea>
                    <p class="text-xs text-white/50 mt-1">💪 Be specific with actionable steps</p>
                </div>

                <!-- Summary Card -->
                <div class="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg">
                    <div class="text-sm text-white/80 space-y-2">
                        <div class="flex items-center gap-2">
                            <span class="font-semibold">Task:</span>
                            <span>{selectedTask?.title || 'N/A'}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-semibold">Severity:</span>
                            <span class="capitalize">{severity}</span>
                        </div>
                        {#if reason}
                        <div>
                            <span class="font-semibold">Reason:</span>
                            <p class="text-white/60 mt-1">{reason.slice(0, 100)}{reason.length > 100 ? '...' : ''}</p>
                        </div>
                        {/if}
                    </div>
                </div>
            </div>
            {/if}

            <!-- Navigation Buttons -->
            <div class="flex gap-3 pt-6 border-t border-white/10">
                {#if currentStep > 1}
                <button
                    type="button"
                    on:click={prevStep}
                    class="flex-1 px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors font-medium"
                >
                    ← Previous
                </button>
                {/if}
                
                {#if currentStep < 3}
                <button
                    type="button"
                    on:click={nextStep}
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-medium"
                >
                    Next →
                </button>
                {:else}
                <button
                    type="submit"
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-medium"
                >
                    ✓ Record Failure
                </button>
                {/if}
            </div>
        </form>
        {/if}
    </div>
</div>
{/if}