<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { scale, fade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import type { TaskRecommendation } from '$lib/services/recommendations';
    
    interface Props {
        isOpen: boolean;
        recommendations: TaskRecommendation[];
        category: 'mind' | 'body' | 'general';
        isLoading?: boolean;
    }
    
    let { isOpen = $bindable(), recommendations, category, isLoading = false }: Props = $props();
    
    const dispatch = createEventDispatcher<{
        select: TaskRecommendation;
        close: void;
        createCustom: {
            name: string;
            desc: string;
            reward_xp: number;
            estimated_minutes: number;
        };
    }>();
    
    let selectedCard = $state<string | null>(null);
    let editingCard = $state<string | null>(null);
    let editedData = $state<Record<string, any>>({});
    
    // Custom task form
    let showCustomForm = $state(true);
    let customTaskName = $state('');
    let customTaskDesc = $state('');
    let customTaskXP = $state(30);
    let customTaskMinutes = $state(30);
    
    function handleSelectCard(recommendation: TaskRecommendation) {
        if (selectedCard === recommendation.id) {
            // Si ya está seleccionada, despachar el evento
            dispatch('select', recommendation);
            selectedCard = null;
        } else {
            selectedCard = recommendation.id;
        }
    }
    
    function handleEditCard(e: Event, recommendation: TaskRecommendation) {
        e.stopPropagation();
        editingCard = recommendation.id;
        editedData[recommendation.id] = {
            name: recommendation.name,
            desc: recommendation.desc,
            reward_xp: recommendation.reward_xp
        };
    }
    
    function handleSaveEdit(recommendation: TaskRecommendation) {
        const edited = editedData[recommendation.id];
        if (edited) {
            recommendation.name = edited.name;
            recommendation.desc = edited.desc;
            recommendation.reward_xp = edited.reward_xp;
        }
        editingCard = null;
    }
    
    function handleCancelEdit() {
        editingCard = null;
    }
    
    function handleClose() {
        isOpen = false;
        dispatch('close');
    }
    
    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }
    
    function getCategoryIcon(cat: string): string {
        if (cat === 'mind') return '🧠';
        if (cat === 'body') return '💪';
        return '⭐';
    }
    
    function getCategoryColor(cat: string): string {
        if (cat === 'mind') return 'from-purple-500 to-indigo-600';
        if (cat === 'body') return 'from-orange-500 to-red-600';
        return 'from-emerald-500 to-green-600';
    }
    
    function getCategoryBorder(cat: string): string {
        if (cat === 'mind') return 'border-purple-400/50';
        if (cat === 'body') return 'border-orange-400/50';
        return 'border-emerald-400/50';
    }
    
    function handleCreateCustomTask() {
        if (!customTaskName.trim()) return;
        
        dispatch('createCustom', {
            name: customTaskName,
            desc: customTaskDesc,
            reward_xp: customTaskXP,
            estimated_minutes: customTaskMinutes
        });
        
        // Reset form
        customTaskName = '';
        customTaskDesc = '';
        customTaskXP = 30;
        customTaskMinutes = 30;
    }
</script>

{#if isOpen}
    <!-- Backdrop con blur -->
    <div 
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        transition:fade={{ duration: 200 }}
        onclick={handleBackdropClick}
        onkeydown={(e) => e.key === 'Escape' && handleClose()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="-1"
    >
        <!-- Modal Container -->
        <div 
            class="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            transition:scale={{ duration: 300, easing: quintOut, start: 0.8 }}
        >
            <!-- Header -->
            <div class="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-t-2xl border-b border-white/10 p-6 sticky top-0 z-10">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 id="modal-title" class="text-2xl font-bold text-white flex items-center gap-3">
                            <span class="text-3xl">{getCategoryIcon(category)}</span>
                            <span>Recommended Missions</span>
                        </h2>
                        <p class="text-sm text-neutral-400 mt-1">Select a mission to add to your quest log</p>
                    </div>
                    <button
                        onclick={handleClose}
                        class="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-all hover:scale-110"
                        aria-label="Close modal"
                    >
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Content -->
            <div class="bg-neutral-900 rounded-b-2xl p-6">
                <!-- Custom Task Form -->
                {#if showCustomForm}
                    <div class="mb-8 p-6 rounded-xl border-2 border-dashed {getCategoryBorder(category)} bg-gradient-to-br from-neutral-800/50 to-neutral-900/50">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                                <svg class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
                                Create Custom Task
                            </h3>
                            <button
                                onclick={() => showCustomForm = false}
                                class="text-neutral-400 hover:text-white transition-colors"
                                aria-label="Hide custom form"
                            >
                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 12h14"/>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="space-y-4">
                            <!-- Task Name -->
                            <div>
                                <label class="block text-sm font-medium text-neutral-300 mb-2">
                                    Task Name *
                                </label>
                                <input
                                    type="text"
                                    bind:value={customTaskName}
                                    placeholder="e.g., Morning Meditation, 30-min Run"
                                    class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                            
                            <!-- Task Description -->
                            <div>
                                <label class="block text-sm font-medium text-neutral-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    bind:value={customTaskDesc}
                                    rows="2"
                                    placeholder="Describe your task..."
                                    class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                ></textarea>
                            </div>
                            
                            <!-- XP and Duration -->
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-neutral-300 mb-2">
                                        Reward XP
                                    </label>
                                    <input
                                        type="number"
                                        bind:value={customTaskXP}
                                        min="10"
                                        max="100"
                                        step="10"
                                        class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-neutral-300 mb-2">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        bind:value={customTaskMinutes}
                                        min="5"
                                        max="180"
                                        step="5"
                                        class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            
                            <!-- Create Button -->
                            <button
                                onclick={handleCreateCustomTask}
                                disabled={!customTaskName.trim()}
                                class="w-full py-3 rounded-lg bg-gradient-to-r {getCategoryColor(category)} text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                <span class="flex items-center justify-center gap-2">
                                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 5v14M5 12h14"/>
                                    </svg>
                                    Create Custom Task
                                </span>
                            </button>
                        </div>
                    </div>
                {:else}
                    <button
                        onclick={() => showCustomForm = true}
                        class="w-full mb-6 py-3 rounded-lg border-2 border-dashed {getCategoryBorder(category)} bg-neutral-800/50 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
                    >
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        <span class="font-medium">Create Custom Task</span>
                    </button>
                {/if}
                
                <!-- AI Recommendations Section -->
                <div class="mb-4">
                    <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                        <svg class="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        AI-Powered Recommendations
                    </h3>
                    <p class="text-sm text-neutral-400 mt-1">Personalized suggestions based on your activity</p>
                </div>
                
                {#if isLoading}
                    <div class="flex items-center justify-center py-20">
                        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                {:else if recommendations.length === 0}
                    <div class="text-center py-20">
                        <div class="text-6xl mb-4">🎮</div>
                        <p class="text-xl text-neutral-400">No recommendations available</p>
                        <p class="text-sm text-neutral-500 mt-2">Complete more tasks to get personalized recommendations</p>
                    </div>
                {:else}
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {#each recommendations as recommendation, index (recommendation.id)}
                            {@const isSelected = selectedCard === recommendation.id}
                            {@const isEditing = editingCard === recommendation.id}
                            {@const cardData = editedData[recommendation.id] || recommendation}
                            
                            <div
                                class="relative group"
                                style="animation-delay: {index * 100}ms"
                                transition:scale={{ duration: 300, delay: index * 50, easing: quintOut }}
                            >
                                <!-- Game Card -->
                                <div
                                    onclick={() => !isEditing && handleSelectCard(recommendation)}
                                    onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && !isEditing && handleSelectCard(recommendation)}
                                    role="button"
                                    tabindex={isEditing ? -1 : 0}
                                    class="w-full text-left relative overflow-hidden rounded-xl border-2 transition-all duration-300 {isSelected ? 'scale-105 shadow-2xl' : 'scale-100 hover:scale-105 hover:shadow-xl'} {getCategoryBorder(recommendation.category)} cursor-pointer"
                                    class:ring-4={isSelected}
                                    class:ring-emerald-400={isSelected}
                                    class:ring-opacity-50={isSelected}
                                    class:cursor-not-allowed={isEditing}
                                    class:opacity-90={isEditing}
                                >
                                    <!-- Card Background Gradient -->
                                    <div class="absolute inset-0 bg-gradient-to-br {getCategoryColor(recommendation.category)} opacity-10"></div>
                                    
                                    <!-- Shine Effect -->
                                    <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    
                                    <!-- Card Content -->
                                    <div class="relative bg-neutral-800/90 backdrop-blur-sm p-6">
                                        <!-- Header con icono y XP -->
                                        <div class="flex items-start justify-between mb-4">
                                            <div class="text-4xl filter drop-shadow-lg">
                                                {getCategoryIcon(recommendation.category)}
                                            </div>
                                            <div class="flex flex-col items-end gap-2">
                                                <div class="px-3 py-1 rounded-full bg-gradient-to-r {getCategoryColor(recommendation.category)} text-white text-xs font-bold flex items-center gap-1 shadow-lg">
                                                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                                    </svg>
                                                    {#if isEditing}
                                                        <input
                                                            type="number"
                                                            bind:value={editedData[recommendation.id].reward_xp}
                                                            class="w-12 bg-transparent text-white text-center outline-none"
                                                            onclick={(e) => e.stopPropagation()}
                                                        />
                                                    {:else}
                                                        <span>+{recommendation.reward_xp} XP</span>
                                                    {/if}
                                                </div>
                                                <!-- Edit Button -->
                                                {#if !isEditing}
                                                    <button
                                                        onclick={(e) => handleEditCard(e, recommendation)}
                                                        class="p-1.5 rounded-lg bg-neutral-700/50 hover:bg-neutral-600 text-neutral-300 hover:text-white transition-colors"
                                                        aria-label="Edit task"
                                                    >
                                                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                        </svg>
                                                    </button>
                                                {/if}
                                            </div>
                                        </div>
                                        
                                        <!-- Title -->
                                        {#if isEditing}
                                            <input
                                                type="text"
                                                bind:value={editedData[recommendation.id].name}
                                                class="w-full text-lg font-bold text-white bg-neutral-700 rounded px-2 py-1 mb-2 outline-none focus:ring-2 focus:ring-emerald-500"
                                                onclick={(e) => e.stopPropagation()}
                                            />
                                        {:else}
                                            <h3 class="text-lg font-bold text-white mb-2 line-clamp-2">
                                                {recommendation.name}
                                            </h3>
                                        {/if}
                                        
                                        <!-- Description -->
                                        {#if isEditing}
                                            <textarea
                                                bind:value={editedData[recommendation.id].desc}
                                                rows="3"
                                                class="w-full text-sm text-neutral-300 bg-neutral-700 rounded px-2 py-1 mb-3 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                                onclick={(e) => e.stopPropagation()}
                                            ></textarea>
                                        {:else}
                                            <p class="text-sm text-neutral-300 mb-3 line-clamp-3">
                                                {recommendation.desc}
                                            </p>
                                        {/if}
                                        
                                        <!-- Reason Badge -->
                                        {#if recommendation.reason && !isEditing}
                                            <div class="flex items-start gap-2 p-2 rounded-lg bg-neutral-700/50 border border-neutral-600/50 mb-3">
                                                <svg class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                </svg>
                                                <p class="text-xs text-neutral-300 leading-tight">{recommendation.reason}</p>
                                            </div>
                                        {/if}
                                        
                                        <!-- Task Info: Duration & Difficulty -->
                                        {#if !isEditing && (recommendation.estimated_minutes || recommendation.difficulty)}
                                            <div class="flex flex-wrap gap-2 mb-3">
                                                {#if recommendation.estimated_minutes}
                                                    <span class="px-2 py-1 rounded bg-neutral-700/50 text-xs text-neutral-400 flex items-center gap-1">
                                                        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                            <circle cx="12" cy="12" r="10"/>
                                                            <path d="M12 6v6l4 2"/>
                                                        </svg>
                                                        <span class="text-white">{recommendation.estimated_minutes}m</span>
                                                    </span>
                                                {/if}
                                                {#if recommendation.difficulty}
                                                    <span class="px-2 py-1 rounded bg-neutral-700/50 text-xs text-neutral-400 flex items-center gap-1">
                                                        <span class="text-neutral-500">Difficulty:</span>
                                                        <span class="text-white flex items-center gap-0.5">
                                                            {#each Array(5) as _, idx}
                                                                <svg class={`w-2.5 h-2.5 ${idx < recommendation.difficulty ? 'text-amber-400' : 'text-neutral-600'}`} viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                                                </svg>
                                                            {/each}
                                                        </span>
                                                    </span>
                                                {/if}
                                            </div>
                                        {/if}
                                        
                                        <!-- Params Preview -->
                                        {#if recommendation.default_params && Object.keys(recommendation.default_params).length > 0 && !isEditing}
                                            <div class="flex flex-wrap gap-2 mb-3">
                                                {#each Object.entries(recommendation.default_params).slice(0, 3) as [key, value]}
                                                    <span class="px-2 py-1 rounded bg-neutral-700/50 text-xs text-neutral-400 flex items-center gap-1">
                                                        <span class="text-neutral-500">•</span>
                                                        <span class="capitalize">{key}:</span>
                                                        <span class="text-white">{typeof value === 'boolean' ? (value ? '✓' : '✗') : value}</span>
                                                    </span>
                                                {/each}
                                            </div>
                                        {/if}
                                        
                                        <!-- Action Buttons -->
                                        {#if isEditing}
                                            <div class="flex gap-2 mt-4">
                                                <button
                                                    onclick={(e) => { e.stopPropagation(); handleSaveEdit(recommendation); }}
                                                    class="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold hover:from-emerald-600 hover:to-green-600 transition-all"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onclick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                                                    class="flex-1 py-2 px-4 rounded-lg bg-neutral-700 text-white font-semibold hover:bg-neutral-600 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        {:else}
                                            <!-- Selection indicator -->
                                            <div class="flex items-center justify-between mt-4 pt-3 border-t border-neutral-700">
                                                <span class="text-xs text-neutral-500">
                                                    {#if isSelected}
                                                        Click again to confirm
                                                    {:else}
                                                        Click to select
                                                    {/if}
                                                </span>
                                                {#if isSelected}
                                                    <div class="flex items-center gap-1 text-emerald-400 animate-pulse">
                                                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                                            <path d="M20 6L9 17l-5-5"/>
                                                        </svg>
                                                        <span class="text-xs font-bold">Selected</span>
                                                    </div>
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                    
                                    <!-- Glow effect when selected -->
                                    {#if isSelected}
                                        <div class="absolute inset-0 rounded-xl bg-emerald-400/20 animate-pulse pointer-events-none"></div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .grid > div {
        animation: slideIn 0.5s ease-out forwards;
        opacity: 0;
    }
</style>
