<script lang="ts">
    import { onMount } from 'svelte';
    import FailureCard from '../../lib/components/FailureCard.svelte';
    import type { Failure } from '../../lib/components/FailureCard.svelte';
    import StatsCard from '../../lib/components/StatsCard.svelte';
    import AddFailureForm from './AddFailureForm.svelte';
    import { getFailures, createFailure, type Failure as ApiFailure } from '$lib/services/failures';
    import { getAuthStore } from '$lib/stores/auth.svelte';
    
    const authStore = getAuthStore();
    
    let failures: Failure[] = [];
    let loading = true;
    let error = '';
    let successMessage = '';

    $: totalFailures = failures.length;
    $: resolvedFailures = failures.filter(f => f.resolved).length;
    $: highSeverity = failures.filter(f => f.severity === 'high').length;
    $: criticalSeverity = failures.filter(f => f.severity === 'critical').length;
    
    // Agrupar por categoría
    $: failuresByCategory = failures.reduce((acc, f) => {
        if (!acc[f.category]) acc[f.category] = [];
        acc[f.category].push(f);
        return acc;
    }, {} as Record<string, Failure[]>);

    onMount(() => {
        loadFailures();
    });

    async function loadFailures() {
        loading = true;
        error = '';
        try {
            const apiFailures = await getFailures(authStore);
            
            // Transform API failures to UI format
            failures = apiFailures.map(f => ({
                id: f.id,
                title: f.title || 'Untitled Failure',
                date: new Date(f.created_at).toISOString().split('T')[0],
                category: f.task_table === 'tasks_mind' ? 'mind' : 'body',
                severity: f.severity === 'minor' ? 'low' : f.severity === 'major' ? 'medium' : 'high',
                description: f.reason,
                rootCause: f.rootCause || '',
                prevention: f.prevention ? f.prevention.split('\n').filter(p => p.trim()) : [],
                resolved: false // Por ahora todos son no resueltos, se puede agregar lógica después
            }));
        } catch (err) {
            error = 'Failed to load failures. Please try again.';
            console.error('Error loading failures:', err);
        } finally {
            loading = false;
        }
    }

    async function handleFailureSubmit(event: CustomEvent) {
        const payload = event.detail;
        
        try {
            error = '';
            successMessage = '';
            
            const newFailure = await createFailure(authStore, payload);
            
            if (newFailure) {
                successMessage = 'Failure recorded successfully! 🎯';
                
                // Add to local list
                failures = [{
                    id: newFailure.id,
                    title: newFailure.title || 'Untitled Failure',
                    date: new Date(newFailure.created_at).toISOString().split('T')[0],
                    category: newFailure.task_table === 'tasks_mind' ? 'mind' : 'body',
                    severity: newFailure.severity === 'minor' ? 'low' : newFailure.severity === 'major' ? 'medium' : 'high',
                    description: newFailure.reason,
                    rootCause: newFailure.rootCause || '',
                    prevention: newFailure.prevention ? newFailure.prevention.split('\n').filter(p => p.trim()) : [],
                    resolved: false
                }, ...failures];
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    successMessage = '';
                }, 3000);
            }
        } catch (err: any) {
            error = err.message || 'Failed to create failure. Please try again.';
            console.error('Error creating failure:', err);
        }
    }
</script>

<!-- Vista mobile-only -->
<div class="md:hidden h-[calc(100dvh-4rem)] overflow-hidden bg-neutral-950">
    <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-white/10">
            <h1 class="text-xl font-bold text-white">Failure Analysis</h1>
            <p class="text-xs text-white/60 mt-1">Learn from mistakes to prevent recurrence</p>
        </div>

        <!-- Success/Error Messages -->
        {#if successMessage}
        <div class="mx-4 mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm animate-pulse">
            {successMessage}
        </div>
        {/if}
        {#if error}
        <div class="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
        </div>
        {/if}

        <!-- Stats -->
        <div class="px-4 py-3">
            <div class="grid grid-cols-3 gap-2">
                <StatsCard 
                    title="Total" 
                    value={totalFailures} 
                    icon="📊" 
                    color="blue"
                />
                <StatsCard 
                    title="Resolved" 
                    value={`${resolvedFailures}/${totalFailures}`} 
                    icon="✅" 
                    color="emerald"
                />
                <StatsCard 
                    title="Critical" 
                    value={criticalSeverity} 
                    icon="⚠️" 
                    color="red"
                />
            </div>
        </div>

        <!-- Loading State -->
        {#if loading}
        <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p class="text-white/60">Loading failures...</p>
            </div>
        </div>
        {:else if failures.length === 0}
        <!-- Empty State -->
        <div class="flex-1 flex items-center justify-center px-4">
            <div class="text-center">
                <div class="text-6xl mb-4">🎯</div>
                <h3 class="text-xl font-bold text-white mb-2">No failures yet</h3>
                <p class="text-white/60 text-sm">Record your first failure to start learning and improving</p>
            </div>
        </div>
        {:else}
        <!-- Failures list -->
        <div class="flex-1 overflow-y-auto px-4 pb-4">
            <div class="space-y-4">
                {#each Object.entries(failuresByCategory) as [category, categoryFailures]}
                    <div>
                        <h2 class="text-xs font-semibold text-white/50 uppercase mb-2">{category}</h2>
                        <div class="space-y-3">
                            {#each categoryFailures as failure}
                                <FailureCard {failure} />
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        {/if}

        <!-- Floating action button -->
        <AddFailureForm on:submit={handleFailureSubmit} />
    </div>
</div>

<!-- Vista escritorio -->
<div class="hidden md:block bg-neutral-950 min-h-screen">
    <div class="max-w-6xl mx-auto p-8">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-4xl font-bold text-white">Failure Analysis</h1>
            <p class="text-sm text-white/60 mt-2">Learn from mistakes to prevent recurrence</p>
        </div>

        <!-- Success/Error Messages -->
        {#if successMessage}
        <div class="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 animate-pulse">
            {successMessage}
        </div>
        {/if}
        {#if error}
        <div class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
        </div>
        {/if}

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard 
                title="Total" 
                value={totalFailures} 
                icon="📊" 
                color="blue"
            />
            <StatsCard 
                title="Resolved" 
                value={resolvedFailures} 
                icon="✅" 
                color="emerald"
            />
            <StatsCard 
                title="Pending" 
                value={totalFailures - resolvedFailures} 
                icon="⏳" 
                color="amber"
            />
            <StatsCard 
                title="Critical" 
                value={criticalSeverity} 
                icon="⚠️" 
                color="red"
            />
        </div>

        <!-- Loading State -->
        {#if loading}
        <div class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p class="text-white/60 text-lg">Loading failures...</p>
            </div>
        </div>
        {:else if failures.length === 0}
        <!-- Empty State -->
        <div class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="text-8xl mb-6">🎯</div>
                <h3 class="text-2xl font-bold text-white mb-3">No failures recorded yet</h3>
                <p class="text-white/60 mb-6">Start tracking failures to learn and improve continuously</p>
                <p class="text-sm text-white/50">Click the + button to record your first failure</p>
            </div>
        </div>
        {:else}
        <!-- Failures list by category -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {#each Object.entries(failuresByCategory) as [category, categoryFailures]}
                <div>
                    <h2 class="text-sm font-semibold text-white/70 uppercase mb-3">{category}</h2>
                    <div class="space-y-3">
                        {#each categoryFailures as failure}
                            <FailureCard {failure} />
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
        {/if}

        <!-- Floating action button -->
        <AddFailureForm on:submit={handleFailureSubmit} />
    </div>
</div>