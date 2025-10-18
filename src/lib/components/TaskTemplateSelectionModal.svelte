<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { getTaskTemplatesByCreator, createTaskTemplate } from '$lib/services/task_templates';
    import { getAuthContext } from '$lib/stores/auth.svelte';
    import { getMindRecommendations, getBodyRecommendations } from '$lib/services/recommendations';
    import type { TaskTemplate } from '$lib/types';
    import type { TaskRecommendation } from '$lib/types';
    
    const dispatch = createEventDispatcher();
    
    interface Props {
        isOpen: boolean;
        category: 'mind' | 'body';
    }
    
    let { isOpen = $bindable(), category }: Props = $props();
    
    const authStore = getAuthContext();
    
    let systemTemplates = $state<TaskTemplate[]>([]);
    let botTemplates = $state<TaskTemplate[]>([]);
    let userTemplates = $state<TaskTemplate[]>([]);
    let isLoading = $state(false);
    let showAIRecommendations = $state(false);
    let aiRecommendations = $state<TaskRecommendation[]>([]);
    let isLoadingAI = $state(false);
    let showCreateTemplateModal = $state(false);
    let selectedTemplateToEdit = $state<TaskTemplate | null>(null);
    
    // Form data for creating/editing template
    let templateName = $state('');
    let templateDesc = $state('');
    let templateDifficulty = $state(3);
    let templateMinutes = $state(30);
    let templateXP = $state(50);
    
    onMount(() => {
        if (isOpen) {
            loadTemplates();
        }
    });
    
    $effect(() => {
        if (isOpen) {
            loadTemplates();
            showAIRecommendations = false;
            showCreateTemplateModal = false;
            selectedTemplateToEdit = null;
        }
    });
    
    async function loadTemplates() {
        isLoading = true;
        try {
            const userId = authStore.getUserId();
            const botId = `bot-${userId}`;
            
            const [system, bot, user] = await Promise.all([
                getTaskTemplatesByCreator(authStore, 'system'),
                getTaskTemplatesByCreator(authStore, botId),
                getTaskTemplatesByCreator(authStore, userId)
            ]);
            
            // Filter by category
            systemTemplates = system.filter(t => t.category === category);
            botTemplates = bot.filter(t => t.category === category);
            userTemplates = user.filter(t => t.category === category);
        } catch (error) {
            console.error('Error loading templates:', error);
        } finally {
            isLoading = false;
        }
    }
    
    function handleTemplateSelect(template: TaskTemplate) {
        dispatch('select', template);
    }
    
    function handleCreateNewTemplate() {
        selectedTemplateToEdit = null;
        templateName = '';
        templateDesc = '';
        templateDifficulty = 3;
        templateMinutes = 30;
        templateXP = 50;
        showCreateTemplateModal = true;
    }
    
    function handleEditTemplate(template: TaskTemplate) {
        selectedTemplateToEdit = template;
        templateName = template.name;
        templateDesc = template.desc;
        templateDifficulty = template.difficulty;
        templateMinutes = template.estimated_minutes;
        templateXP = template.reward_xp;
        showCreateTemplateModal = true;
    }
    
    async function handleSaveTemplate() {
        const userId = authStore.getUserId();
        
        // Generate unique key
        const baseKey = templateName.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
        const key = selectedTemplateToEdit ? `${baseKey}_${Date.now()}` : baseKey;
        
        const newTemplate = {
            key,
            name: templateName,
            desc: templateDesc,
            category,
            difficulty: templateDifficulty,
            estimated_minutes: templateMinutes,
            reward_xp: templateXP,
            default_params: {},
            created_by: userId
        };
        
        const result = await createTaskTemplate(authStore, newTemplate);
        
        if (result) {
            showCreateTemplateModal = false;
            await loadTemplates();
        }
    }
    
    async function handleShowAIRecommendations() {
        showAIRecommendations = true;
        isLoadingAI = true;
        
        try {
            const response = category === 'mind' 
                ? await getMindRecommendations(authStore, 3, true)
                : await getBodyRecommendations(authStore, 3, true);
                
            if (response && response.recommendations) {
                aiRecommendations = response.recommendations;
            } else {
                aiRecommendations = [];
            }
        } catch (error) {
            console.error('Error loading AI recommendations:', error);
            aiRecommendations = [];
        } finally {
            isLoadingAI = false;
        }
    }
    
    function handleAIRecommendationSelect(recommendation: TaskRecommendation) {
        dispatch('selectRecommendation', recommendation);
    }
    
    function handleClose() {
        isOpen = false;
        dispatch('close');
    }
    
    function getDifficultyStars(difficulty: number) {
        return '⭐'.repeat(difficulty);
    }
</script>

{#if isOpen}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onclick={handleClose}
        role="dialog"
        aria-modal="true"
    >
        <div 
            class="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
            onclick={(e) => e.stopPropagation()}
        >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-white/10">
                <h2 class="text-2xl font-bold text-white">
                    {category === 'mind' ? '🧠 Mind' : '💪 Body'} Templates
                </h2>
                <button
                    class="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    onclick={handleClose}
                    aria-label="Close"
                >
                    <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-6">
                {#if showCreateTemplateModal}
                    <!-- Create/Edit Template Form -->
                    <div class="max-w-2xl mx-auto">
                        <h3 class="text-xl font-bold text-white mb-6">
                            {selectedTemplateToEdit ? 'Edit Template' : 'Create New Template'}
                        </h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-neutral-300 mb-2">
                                    Template Name
                                </label>
                                <input
                                    type="text"
                                    bind:value={templateName}
                                    class="w-full px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g., Morning Meditation"
                                />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-neutral-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    bind:value={templateDesc}
                                    rows="3"
                                    class="w-full px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Describe this template..."
                                ></textarea>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-neutral-300 mb-2">
                                        Difficulty (1-5)
                                    </label>
                                    <input
                                        type="number"
                                        bind:value={templateDifficulty}
                                        min="1"
                                        max="5"
                                        class="w-full px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-neutral-300 mb-2">
                                        Minutes
                                    </label>
                                    <input
                                        type="number"
                                        bind:value={templateMinutes}
                                        min="1"
                                        class="w-full px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-neutral-300 mb-2">
                                        XP Reward
                                    </label>
                                    <input
                                        type="number"
                                        bind:value={templateXP}
                                        min="1"
                                        class="w-full px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            
                            <div class="flex gap-3 pt-4">
                                <button
                                    onclick={handleSaveTemplate}
                                    class="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Save Template
                                </button>
                                <button
                                    onclick={() => showCreateTemplateModal = false}
                                    class="px-6 py-3 rounded-xl bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                {:else if showAIRecommendations}
                    <!-- AI Recommendations -->
                    <div>
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-bold text-white">AI Recommendations</h3>
                            <button
                                onclick={() => showAIRecommendations = false}
                                class="text-sm text-neutral-400 hover:text-white transition-colors"
                            >
                                ← Back to Templates
                            </button>
                        </div>
                        
                        {#if isLoadingAI}
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {#each Array(3) as _}
                                    <div class="p-6 rounded-xl bg-neutral-800 animate-pulse">
                                        <div class="h-4 bg-neutral-700 rounded w-3/4 mb-3"></div>
                                        <div class="h-3 bg-neutral-700 rounded w-full mb-2"></div>
                                        <div class="h-3 bg-neutral-700 rounded w-2/3"></div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {#each aiRecommendations as rec}
                                    <button
                                        onclick={() => handleAIRecommendationSelect(rec)}
                                        class="group p-6 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all text-left"
                                    >
                                        <div class="text-3xl mb-3">🤖</div>
                                        <h4 class="text-lg font-bold text-white mb-2">{rec.name}</h4>
                                        <p class="text-sm text-neutral-400 mb-3 line-clamp-2">{rec.desc}</p>
                                        <div class="flex items-center justify-between text-xs text-neutral-500">
                                            <span>{rec.estimated_minutes}m</span>
                                            <span class="text-emerald-400 font-bold">+{rec.reward_xp} XP</span>
                                        </div>
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {:else}
                    <!-- Templates Grid -->
                    {#if isLoading}
                        <div class="text-center py-12">
                            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                            <p class="text-neutral-400 mt-4">Loading templates...</p>
                        </div>
                    {:else}
                        <div class="space-y-8">
                            <!-- User Templates -->
                            <div>
                                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span>👤</span> Your Templates
                                </h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <!-- Create New Template Card -->
                                    <button
                                        onclick={handleCreateNewTemplate}
                                        class="group aspect-[3/4] rounded-xl border-2 border-dashed border-white/20 hover:border-purple-500/50 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 hover:from-purple-900/20 hover:to-indigo-900/20 flex flex-col items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M12 5v14m-7-7h14"/>
                                            </svg>
                                        </div>
                                        <span class="text-sm font-semibold text-white">Create Template</span>
                                    </button>
                                    
                                    {#each userTemplates as template}
                                        <div class="group relative aspect-[3/4] rounded-xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 transition-all overflow-hidden">
                                            <button
                                                onclick={() => handleTemplateSelect(template)}
                                                class="w-full h-full p-4 flex flex-col justify-between text-left hover:scale-105 active:scale-95 transition-transform"
                                            >
                                                <div>
                                                    <div class="text-3xl mb-2">✨</div>
                                                    <h4 class="text-base font-bold text-white mb-2 line-clamp-2">{template.name}</h4>
                                                    <p class="text-xs text-neutral-400 line-clamp-3">{template.desc}</p>
                                                </div>
                                                <div class="space-y-2">
                                                    <div class="text-xs text-purple-300">{getDifficultyStars(template.difficulty)}</div>
                                                    <div class="flex items-center justify-between text-xs">
                                                        <span class="text-neutral-400">{template.estimated_minutes}m</span>
                                                        <span class="text-emerald-400 font-bold">+{template.reward_xp}</span>
                                                    </div>
                                                </div>
                                            </button>
                                            <button
                                                onclick={() => handleEditTemplate(template)}
                                                class="absolute top-2 right-2 p-2 rounded-lg bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label="Edit template"
                                            >
                                                <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                            
                            <!-- Bot Templates -->
                            {#if botTemplates.length > 0}
                                <div>
                                    <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span>🤖</span> Your Bot Templates
                                    </h3>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {#each botTemplates as template}
                                            <div class="group relative aspect-[3/4] rounded-xl bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-500/30 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 transition-all overflow-hidden">
                                                <button
                                                    onclick={() => handleTemplateSelect(template)}
                                                    class="w-full h-full p-4 flex flex-col justify-between text-left hover:scale-105 active:scale-95 transition-transform"
                                                >
                                                    <div>
                                                        <div class="text-3xl mb-2">🤖</div>
                                                        <h4 class="text-base font-bold text-white mb-2 line-clamp-2">{template.name}</h4>
                                                        <p class="text-xs text-neutral-400 line-clamp-3">{template.desc}</p>
                                                    </div>
                                                    <div class="space-y-2">
                                                        <div class="text-xs text-blue-300">{getDifficultyStars(template.difficulty)}</div>
                                                        <div class="flex items-center justify-between text-xs">
                                                            <span class="text-neutral-400">{template.estimated_minutes}m</span>
                                                            <span class="text-emerald-400 font-bold">+{template.reward_xp}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                                <button
                                                    onclick={() => handleEditTemplate(template)}
                                                    class="absolute top-2 right-2 p-2 rounded-lg bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label="Edit as new template"
                                                >
                                                    <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                            
                            <!-- System Templates -->
                            {#if systemTemplates.length > 0}
                                <div>
                                    <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span>⚙️</span> System Templates
                                    </h3>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {#each systemTemplates as template}
                                            <div class="group relative aspect-[3/4] rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 hover:border-white/30 hover:shadow-xl transition-all overflow-hidden">
                                                <button
                                                    onclick={() => handleTemplateSelect(template)}
                                                    class="w-full h-full p-4 flex flex-col justify-between text-left hover:scale-105 active:scale-95 transition-transform"
                                                >
                                                    <div>
                                                        <div class="text-3xl mb-2">⚙️</div>
                                                        <h4 class="text-base font-bold text-white mb-2 line-clamp-2">{template.name}</h4>
                                                        <p class="text-xs text-neutral-400 line-clamp-3">{template.desc}</p>
                                                    </div>
                                                    <div class="space-y-2">
                                                        <div class="text-xs text-neutral-300">{getDifficultyStars(template.difficulty)}</div>
                                                        <div class="flex items-center justify-between text-xs">
                                                            <span class="text-neutral-400">{template.estimated_minutes}m</span>
                                                            <span class="text-emerald-400 font-bold">+{template.reward_xp}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                                <button
                                                    onclick={() => handleEditTemplate(template)}
                                                    class="absolute top-2 right-2 p-2 rounded-lg bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label="Copy as new template"
                                                >
                                                    <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/if}
                {/if}
            </div>
            
            <!-- Footer -->
            {#if !showCreateTemplateModal && !showAIRecommendations}
                <div class="p-6 border-t border-white/10 bg-neutral-900/50">
                    <button
                        onclick={handleShowAIRecommendations}
                        class="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                    >
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z"/>
                        </svg>
                        Create Task with AI
                    </button>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
