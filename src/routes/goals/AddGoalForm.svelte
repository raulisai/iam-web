<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade, fly, scale, slide } from 'svelte/transition';
    import { cubicOut, elasticOut } from 'svelte/easing';
    import { fetchTaskRecommendations } from '../../lib/services/goalTasks';
    import type { GoalTask, GoalTaskRecommendation } from '../../lib/types';
    import { getAuthStore } from '../../lib/stores/auth.svelte';

    type GoalType = 'short' | 'medium' | 'long';
    type TaskPriority = 'low' | 'medium' | 'high';

    // Add a new type that extends GoalTask with the isRecommended property
    type ExtendedGoalTask = GoalTask & { isRecommended?: boolean };

    type GoalFormData = {
        title: string;
        description: string;
        type: GoalType;
        desc_short: string;
        metric_key: string;
        target_value: string;
        start_date: string;
        end_date: string;
    };

    interface GoalPreset {
        title: string;
        description: string;
        type: GoalType;
        metric_key: string;
        target_value: number;
        duration_days: number;
        icon: string;
        category: string;
    }

    const authStore = getAuthStore();
    const dispatch = createEventDispatcher();

    const steps = [
        { title: 'Elige tu objetivo', subtitle: 'Empieza desde cero o usa una plantilla' },
        { title: 'Define el foco', subtitle: 'Personaliza tipo, métrica y alcance' },
        { title: 'Diseña las tareas', subtitle: 'Agrega tareas o usa recomendaciones IA' },
        { title: 'Revisión final', subtitle: 'Confirma todo antes de crear' }
    ];

    const goalPresets: GoalPreset[] = [
        {
            title: 'Meta personalizada',
            description: 'Crea tu propio objetivo desde cero con total libertad',
            type: 'short',
            metric_key: '',
            target_value: 0,
            duration_days: 30,
            icon: '🎯',
            category: 'Custom'
        },
        {
            title: 'Meditar 30 días seguidos',
            description: 'Construye una práctica diaria de meditación',
            type: 'short',
            metric_key: 'meditation_days',
            target_value: 30,
            duration_days: 30,
            icon: '🧘',
            category: 'Mente'
        },
        {
            title: 'Leer 12 libros',
            description: 'Un libro al mes durante un año',
            type: 'long',
            metric_key: 'books_completed',
            target_value: 12,
            duration_days: 365,
            icon: '📚',
            category: 'Aprendizaje'
        },
        {
            title: 'Gym 3x por semana',
            description: 'Establece rutina de ejercicio consistente',
            type: 'medium',
            metric_key: 'gym_sessions',
            target_value: 36,
            duration_days: 90,
            icon: '💪',
            category: 'Cuerpo'
        },
        {
            title: 'Aprender un idioma',
            description: '100 horas de práctica en 6 meses',
            type: 'long',
            metric_key: 'study_hours',
            target_value: 100,
            duration_days: 180,
            icon: '🌍',
            category: 'Habilidades'
        },
        {
            title: 'Construir un hábito',
            description: 'Repetición diaria durante 21 días',
            type: 'short',
            metric_key: 'habit_days',
            target_value: 21,
            duration_days: 21,
            icon: '✨',
            category: 'Hábitos'
        }
    ];

    const typeOptions: Array<{
        value: GoalType;
        label: string;
        duration: string;
        description: string;
        accent: string;
    }> = [
        {
            value: 'short',
            label: 'Quick Win',
            duration: '1-4 semanas',
            description: 'Impulsa un hábito corto y celebrable.',
            accent: 'from-sky-500 to-indigo-500'
        },
        {
            value: 'medium',
            label: 'Momentum',
            duration: '1-3 meses',
            description: 'Construye progreso sostenible.',
            accent: 'from-purple-500 to-fuchsia-500'
        },
        {
            value: 'long',
            label: 'Epic Quest',
            duration: '3+ meses',
            description: 'Transforma una meta grande en realidad.',
            accent: 'from-amber-500 to-orange-500'
        }
    ];

    const metricSuggestions: Record<GoalType, string[]> = {
        short: ['meditation_days', 'gym_sessions', 'journal_entries', 'pages_read'],
        medium: ['books_finished', 'workout_hours', 'lessons_completed', 'projects_done'],
        long: ['portfolio_projects', 'certifications', 'savings_amount', 'skill_mastery']
    };

    const priorityColors: Record<TaskPriority, string> = {
        low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        high: 'bg-red-500/20 text-red-300 border-red-500/30'
    };

    const today = new Date().toISOString().split('T')[0];

    let showForm = false;
    let currentStep = 0;
    let isSubmitting = false;
    let error = '';
    let selectedPreset: GoalPreset | null = null;
    let tasks: ExtendedGoalTask[] = []; // Change the type here
    let recommendedTasks: GoalTaskRecommendation[] = [];
    let isLoadingRecommendations = false;
    let showNewTaskForm = false;
    let editingTaskIndex: number | null = null;
    let createdGoalId: string | null = null; // Store the goal ID after creation
    let usedFallbackRecommendations = false; // Track if we used fallback instead of AI
    let canRegenerateRecommendations = false; // Track if we can regenerate recommendations

    let newTask: GoalTask = {
        title: '',
        description: '',
        priority: 'medium',
        estimated_duration: '1 hora',
        type: 'one_off',
        required: true,
        weight: 1,
        order: 0
    };

    let formData: GoalFormData = {
        title: '',
        description: '',
        type: 'short',
        desc_short: '',
        metric_key: '',
        target_value: '',
        start_date: today,
        end_date: ''
    };

    const stepCount = steps.length;

    $: progressPercent = Math.round(((currentStep + 1) / stepCount) * 100);
    $: allTasks = [...tasks, ...recommendedTasks.map(rt => ({ ...rt, isRecommended: true } as ExtendedGoalTask))];

    function openForm() {
        showForm = true;
        error = '';
    }

    function resetForm() {
        showForm = false;
        currentStep = 0;
        error = '';
        isSubmitting = false;
        selectedPreset = null;
        tasks = [];
        recommendedTasks = [];
        showNewTaskForm = false;
        editingTaskIndex = null;
        createdGoalId = null;
        usedFallbackRecommendations = false;
        canRegenerateRecommendations = false;
        formData = {
            title: '',
            description: '',
            type: 'short',
            desc_short: '',
            metric_key: '',
            target_value: '',
            start_date: today,
            end_date: ''
        };
        newTask = {
            title: '',
            description: '',
            priority: 'medium',
            estimated_duration: '1 hora',
            type: 'one_off',
            required: true,
            weight: 1,
            order: 0
        };
    }

    function applyPreset(preset: GoalPreset) {
        selectedPreset = preset;
        
        if (preset.category !== 'Custom') {
            formData.title = preset.title;
            formData.description = preset.description;
            formData.type = preset.type;
            formData.metric_key = preset.metric_key;
            formData.target_value = String(preset.target_value);
            
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + preset.duration_days);
            formData.end_date = endDate.toISOString().split('T')[0];
        }
        
        error = '';
        currentStep = 1;
    }

    function validateStep(stepIndex: number) {
        if (stepIndex === 0) {
            // Step 0 is preset selection, always valid
            return true;
        }

        if (stepIndex === 1) {
            if (!formData.title.trim()) {
                error = 'Dale un nombre a tu objetivo.';
                return false;
            }
            if (formData.title.trim().length < 3) {
                error = 'El título debe tener al menos 3 caracteres.';
                return false;
            }
            if (!formData.metric_key.trim()) {
                error = 'Selecciona o escribe una métrica para medir tu progreso.';
                return false;
            }
            const numericTarget = parseFloat(formData.target_value);
            if (!formData.target_value || Number.isNaN(numericTarget) || numericTarget <= 0) {
                error = 'Define un objetivo numérico mayor que cero.';
                return false;
            }
            if (!formData.start_date) {
                error = 'Selecciona la fecha de inicio.';
                return false;
            }
        }

        if (stepIndex === 2) {
            // Tasks step - at least warn if no tasks
            if (tasks.length === 0 && recommendedTasks.length === 0) {
                // Allow continuing without tasks, just show a note
                console.log('No tasks added yet');
            }
        }

        error = '';
        return true;
    }

    async function nextStep() {
        if (currentStep >= stepCount - 1) return;
        if (!validateStep(currentStep)) return;
        
        // If moving to step 2 (tasks), create the goal first
        if (currentStep === 1 && !createdGoalId) {
            await createGoalBeforeTasks();
        } else {
            currentStep += 1;
        }
    }

    async function createGoalBeforeTasks() {
        isSubmitting = true;
        error = '';

        try {
            const token = authStore.getToken();
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            const { createGoal } = await import('../../lib/services/goals');
            
            const goalData = {
                title: formData.title.trim(),
                description: formData.description.trim() || undefined,
                type: formData.type,
                desc_short: formData.desc_short.trim() || undefined,
                metric_key: formData.metric_key.trim(),
                target_value: parseFloat(formData.target_value),
                is_active: true,
                start_date: formData.start_date,
                end_date: formData.end_date || undefined,
                progress: '0'
            };

            const newGoal = await createGoal(token, goalData);
            createdGoalId = newGoal.id;
            
            // Move to next step
            currentStep += 1;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Error al crear el objetivo';
            console.error('Error creating goal:', err);
        } finally {
            isSubmitting = false;
        }
    }

    function previousStep() {
        if (currentStep === 0) {
            resetForm();
            return;
        }
        currentStep -= 1;
        error = '';
    }

    async function submitForm() {
        const lastStepIndex = stepCount - 1;
        if (!validateStep(lastStepIndex)) {
            return;
        }

        if (!createdGoalId) {
            error = 'Error: No se encontró el ID del objetivo';
            return;
        }

        isSubmitting = true;

        try {
            const token = authStore.getToken();
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            // Create all tasks for the already created goal
            if (tasks.length > 0 && createdGoalId) {
                const { createGoalTask } = await import('../../lib/services/goalTasks');
                const goalId = createdGoalId; // Capture in a const to help TypeScript narrowing
                
                await Promise.all(
                    tasks.map((task, index) => 
                        createGoalTask(token, goalId, {
                            title: task.title,
                            description: task.description,
                            priority: task.priority,
                            estimated_duration: task.estimated_duration,
                            type: task.type,
                            required: task.required,
                            weight: task.weight,
                            order: index
                        })
                    )
                );
            }

            // Dispatch event to refresh the goals list
            dispatch('submit', { id: createdGoalId, reload: true });
            resetForm();
        } catch (err) {
            error = err instanceof Error ? err.message : 'Error al guardar las tareas';
        } finally {
            isSubmitting = false;
        }
    }

    function setMetricSuggestion(metric: string) {
        formData.metric_key = metric;
        error = '';
    }

    function setTargetPreset(value: number | string) {
        formData.target_value = String(value);
        error = '';
    }

    async function loadRecommendations(regenerate: boolean = false) {
        if (isLoadingRecommendations || !createdGoalId) return;
        
        isLoadingRecommendations = true;
        error = '';

        try {
            const token = authStore.getToken();
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            console.log('Fetching recommendations for goal:', createdGoalId, regenerate ? '(regenerating)' : '');
            
            // Prepare context for the POST request
            const context = {
                available_time: '2 horas por día',
                current_challenges: formData.description || 'Mantener la consistencia y motivación',
                preferences: 'Prefiero tareas prácticas y medibles',
                resources: ['Tiempo dedicado', 'Compromiso personal', 'Herramientas disponibles']
            };
            
            // Use the real API to get AI-powered recommendations (always POST)
            const response = await fetchTaskRecommendations(
                token,
                createdGoalId,
                5,
                true,
                context
            );
            
            console.log('Recommendations response:', response);

            if (response.success && response.recommendations) {
                usedFallbackRecommendations = false; // Successfully got AI recommendations
                canRegenerateRecommendations = true; // Enable regenerate button
                recommendedTasks = response.recommendations.map((rec: any) => ({
                    title: rec.title,
                    description: rec.description,
                    priority: rec.priority || 'medium',
                    estimated_duration: rec.estimated_duration || '1 hora',
                    order: rec.order || 0,
                    reason: rec.reason,
                    template_id: rec.template_id
                }));
            } else {
                throw new Error('No se pudieron generar recomendaciones');
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error al cargar recomendaciones';
            console.error('Error loading recommendations for goal', createdGoalId, ':', err);
            console.error('Full error details:', errorMsg);
            
            // Show error but don't set it in the UI, just use fallback
            console.warn('Usando tareas de respaldo debido al error de API');
            
            usedFallbackRecommendations = true; // Mark that we're using fallback
            
            // Fallback to basic suggestions if AI fails (don't set error in UI to avoid disrupting flow)
            recommendedTasks = [
                {
                    title: 'Definir plan de acción',
                    description: 'Establece los pasos específicos para alcanzar tu objetivo',
                    priority: 'high',
                    estimated_duration: '30 minutos',
                    order: 1,
                    reason: 'Un plan claro aumenta las probabilidades de éxito'
                },
                {
                    title: 'Primera sesión práctica',
                    description: 'Comienza con una sesión inicial para familiarizarte',
                    priority: 'high',
                    estimated_duration: '1 hora',
                    order: 2,
                    reason: 'La acción inmediata genera momentum'
                },
                {
                    title: 'Establecer rutina',
                    description: 'Define horarios y frecuencia de práctica',
                    priority: 'medium',
                    estimated_duration: '15 minutos',
                    order: 3,
                    reason: 'La consistencia es clave para formar hábitos'
                },
                {
                    title: 'Primera revisión de progreso',
                    description: 'Evalúa cómo vas después de la primera semana',
                    priority: 'medium',
                    estimated_duration: '20 minutos',
                    order: 4,
                    reason: 'La reflexión temprana permite ajustes importantes'
                },
                {
                    title: 'Celebrar primer hito',
                    description: 'Reconoce y celebra tus primeros logros',
                    priority: 'low',
                    estimated_duration: '15 minutos',
                    order: 5,
                    reason: 'La celebración refuerza la motivación'
                }
            ];
        } finally {
            isLoadingRecommendations = false;
        }
    }

    function addRecommendedTask(task: GoalTaskRecommendation) {
        // Type assertion to ensure compatibility
        tasks = [...tasks, { ...task, isRecommended: true } as ExtendedGoalTask];
        recommendedTasks = recommendedTasks.filter(rt => rt !== task);
    }

    function openNewTaskForm() {
        showNewTaskForm = true;
        editingTaskIndex = null;
        newTask = {
            title: '',
            description: '',
            priority: 'medium',
            estimated_duration: '1 hora',
            type: 'one_off',
            required: true,
            weight: 1,
            order: tasks.length
        };
    }

    function editTask(index: number) {
        editingTaskIndex = index;
        newTask = { ...tasks[index] };
        showNewTaskForm = true;
    }

    function saveTask() {
        if (!newTask.title.trim()) {
            error = 'La tarea necesita un título';
            return;
        }

        if (editingTaskIndex !== null) {
            tasks[editingTaskIndex] = { ...newTask };
            tasks = [...tasks];
        } else {
            tasks = [...tasks, { ...newTask, order: tasks.length }];
        }

        showNewTaskForm = false;
        editingTaskIndex = null;
        error = '';
    }

    function removeTask(index: number) {
        tasks = tasks.filter((_, i) => i !== index);
    }

    function moveTaskUp(index: number) {
        if (index === 0) return;
        [tasks[index - 1], tasks[index]] = [tasks[index], tasks[index - 1]];
        tasks = [...tasks];
    }

    function moveTaskDown(index: number) {
        if (index === tasks.length - 1) return;
        [tasks[index], tasks[index + 1]] = [tasks[index + 1], tasks[index]];
        tasks = [...tasks];
    }
</script>

<!-- Floating action button -->
<button
    class="fixed bottom-20 right-4 md:bottom-6 h-14 pl-4 pr-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 flex items-center gap-3 hover:scale-[1.04] transition-transform z-40"
    on:click={openForm}
>
    <span class="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 text-2xl font-semibold">+</span>
    <span class="hidden sm:inline text-sm font-semibold tracking-wide uppercase">Nuevo goal</span>
</button>

<!-- Goal creation modal -->
{#if showForm}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" transition:fade={{ duration: 200 }}></div>

    <div
        class="relative z-10 w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/95 shadow-2xl max-h-[90vh] flex flex-col"
        transition:scale={{ duration: 200, easing: cubicOut }}
    >
        <div class="grid gap-6 p-4 md:grid-cols-[1.6fr_1fr] md:gap-10 md:p-12 overflow-y-auto">
            <div class="flex flex-col gap-8">
                <header class="flex flex-col gap-4">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <h2 class="text-3xl font-bold text-white">Diseña tu próximo goal</h2>
                            <p class="text-sm text-white/60">{steps[currentStep].subtitle}</p>
                        </div>
                        <button
                            type="button"
                            class="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                            on:click={resetForm}
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                            <span>Paso {currentStep + 1}</span>
                            <span>{progressPercent}% listo</span>
                        </div>
                        <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                class="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-amber-500 transition-all duration-300"
                                style={`width: ${progressPercent}%`}
                            ></div>
                        </div>
                    </div>
                </header>

                <form class="flex flex-col gap-6" on:submit|preventDefault={submitForm}>
                    {#if error}
                    <div class="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200" transition:fade>
                        {error}
                    </div>
                    {/if}

                    {#if currentStep === 0}
                        <!-- STEP 0: Preset Selection -->
                        <div class="space-y-6" transition:fly={{ y: 20, duration: 250, easing: cubicOut }}>
                            <!-- Destacar opción personalizada -->
                            <div class="rounded-2xl border-2 border-dashed border-purple-400/50 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-amber-500/10 p-6">
                                <button
                                    type="button"
                                    class={`w-full group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all hover:scale-[1.01] ${
                                        selectedPreset?.category === 'Custom'
                                            ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                                            : 'border-purple-400/30 bg-white/5 hover:border-purple-400/60 hover:bg-purple-500/10'
                                    }`}
                                    on:click={() => applyPreset(goalPresets[0])}
                                >
                                    <div class="flex items-center gap-4">
                                        <div class="text-5xl">{goalPresets[0].icon}</div>
                                        <div class="flex-1">
                                            <div class="flex items-center gap-2">
                                                <div class="text-xs font-bold uppercase tracking-[0.3em] text-purple-300">
                                                    ✨ Recomendado
                                                </div>
                                            </div>
                                            <h4 class="mt-2 text-xl font-bold text-white">{goalPresets[0].title}</h4>
                                            <p class="mt-2 text-white/80">{goalPresets[0].description}</p>
                                            <div class="mt-3 inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-200">
                                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Total flexibilidad
                                            </div>
                                        </div>
                                    </div>
                                    {#if selectedPreset?.category === 'Custom'}
                                        <div class="absolute right-4 top-4 rounded-full bg-purple-500 p-2 text-white shadow-lg" transition:scale={{ duration: 200, easing: elasticOut }}>
                                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    {/if}
                                </button>
                            </div>

                            <!-- Plantillas predefinidas -->
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">O usa una plantilla</h3>
                                    <span class="text-xs text-white/40">{goalPresets.length - 1} disponibles</span>
                                </div>
                                <div class="grid gap-3 md:grid-cols-2">
                                    {#each goalPresets.slice(1) as preset}
                                        <button
                                            type="button"
                                            class={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all hover:scale-[1.02] ${
                                                selectedPreset === preset
                                                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                                                    : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                            }`}
                                            on:click={() => applyPreset(preset)}
                                        >
                                            <div class="flex items-start gap-3">
                                                <div class="text-3xl">{preset.icon}</div>
                                                <div class="flex-1">
                                                    <div class="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                                                        {preset.category}
                                                    </div>
                                                    <h4 class="mt-1 font-bold text-white">{preset.title}</h4>
                                                    <p class="mt-1 text-sm text-white/60">{preset.description}</p>
                                                    <div class="mt-2 flex items-center gap-2 text-xs text-white/50">
                                                        <span>📊 {preset.target_value} {preset.metric_key}</span>
                                                        <span>•</span>
                                                        <span>⏱️ {preset.duration_days} días</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {#if selectedPreset === preset}
                                                <div class="absolute right-3 top-3 rounded-full bg-emerald-500 p-1 text-white shadow-lg" transition:scale={{ duration: 200, easing: elasticOut }}>
                                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            {/if}
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {:else if currentStep === 1}
                        <!-- STEP 1: Goal Details -->
                        <div class="space-y-6" transition:fly={{ y: 20, duration: 250, easing: cubicOut }}>
                            <div class="space-y-2">
                                <label for="goal-title" class="text-sm font-semibold uppercase tracking-wide text-white/60">Título del objetivo</label>
                                <input
                                    id="goal-title"
                                    type="text"
                                    bind:value={formData.title}
                                    class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white placeholder-white/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                    placeholder="Ej: Dominar rutinas de estiramiento"
                                    autocomplete="off"
                                />
                            </div>

                            <div class="space-y-2">
                                <label for="goal-desc" class="text-sm font-semibold uppercase tracking-wide text-white/60">Descripción completa</label>
                                <textarea
                                    id="goal-desc"
                                    bind:value={formData.description}
                                    rows="3"
                                    class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                    placeholder="Describe qué quieres lograr y por qué es importante"
                                ></textarea>
                            </div>

                            <div class="grid gap-4 md:grid-cols-3">
                                {#each typeOptions as option}
                                    <button
                                        type="button"
                                        class={`flex flex-col gap-2 rounded-2xl border px-4 py-4 text-left transition-all ${formData.type === option.value
                                            ? 'border-transparent bg-gradient-to-br ' + option.accent + ' text-white shadow-lg shadow-black/20'
                                            : 'border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10'}`}
                                        on:click={() => {
                                            formData.type = option.value;
                                            error = '';
                                        }}
                                    >
                                        <div class="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                                            {option.duration}
                                        </div>
                                        <div class="text-xl font-bold">{option.label}</div>
                                        <p class="text-sm text-white/80">{option.description}</p>
                                    </button>
                                {/each}
                            </div>

                            <div class="grid gap-4 md:grid-cols-2">
                                <div class="space-y-2">
                                    <label for="goal-metric" class="text-sm font-semibold uppercase tracking-wide text-white/60">Métrica</label>
                                    <input
                                        id="goal-metric"
                                        type="text"
                                        bind:value={formData.metric_key}
                                        class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                        placeholder="Ej: sesiones_completadas"
                                    />
                                </div>
                                <div class="space-y-2">
                                    <label for="goal-target" class="text-sm font-semibold uppercase tracking-wide text-white/60">Meta numérica</label>
                                    <input
                                        id="goal-target"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        bind:value={formData.target_value}
                                        class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                        placeholder="Ej: 30"
                                    />
                                </div>
                            </div>

                            <div class="space-y-3">
                                <div class="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Métricas sugeridas</div>
                                <div class="flex flex-wrap gap-2">
                                    {#each metricSuggestions[formData.type] as suggestion}
                                        <button
                                            type="button"
                                            class="chip"
                                            on:click={() => setMetricSuggestion(suggestion)}
                                        >
                                            {suggestion}
                                        </button>
                                    {/each}
                                </div>
                            </div>

                            <div class="grid gap-4 md:grid-cols-2">
                                <div class="space-y-2">
                                    <label for="goal-start" class="text-sm font-semibold uppercase tracking-wide text-white/60">Inicio</label>
                                    <input
                                        id="goal-start"
                                        type="date"
                                        bind:value={formData.start_date}
                                        class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                    />
                                </div>
                                <div class="space-y-2">
                                    <label for="goal-end" class="text-sm font-semibold uppercase tracking-wide text-white/60">Deadline (opcional)</label>
                                    <input
                                        id="goal-end"
                                        type="date"
                                        bind:value={formData.end_date}
                                        class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                    />
                                </div>
                            </div>
                        </div>
                    {:else if currentStep === 2}
                        <!-- STEP 2: Tasks Management -->
                        <div class="space-y-6" transition:fly={{ y: 20, duration: 250, easing: cubicOut }}>
                            <!-- AI Recommendations Section -->
                            <div class="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4">
                                <div class="flex items-start justify-between gap-4">
                                    <div class="flex-1">
                                        <h4 class="font-bold text-white">✨ Recomendaciones IA</h4>
                                        <p class="mt-1 text-sm text-white/60">Deja que la IA sugiera tareas optimizadas para tu objetivo</p>
                                    </div>
                                    <div class="flex gap-2">
                                        <button
                                            type="button"
                                            class="rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:from-purple-600 hover:to-fuchsia-600 disabled:opacity-50"
                                            on:click={() => loadRecommendations(false)}
                                            disabled={isLoadingRecommendations || (recommendedTasks.length > 0 && !canRegenerateRecommendations)}
                                        >
                                            {#if isLoadingRecommendations}
                                                <span class="flex items-center gap-2">
                                                    <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                                                    Generando...
                                                </span>
                                            {:else if recommendedTasks.length === 0}
                                                Generar tareas
                                            {:else}
                                                ✓ Cargadas
                                            {/if}
                                        </button>
                                        {#if canRegenerateRecommendations && recommendedTasks.length > 0}
                                            <button
                                                type="button"
                                                class="rounded-full border border-purple-500/50 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-200 hover:bg-purple-500/20 disabled:opacity-50"
                                                on:click={() => loadRecommendations(true)}
                                                disabled={isLoadingRecommendations}
                                                title="Generar nuevas sugerencias"
                                            >
                                                🔄 Regenerar
                                            </button>
                                        {/if}
                                    </div>
                                </div>

                                {#if recommendedTasks.length > 0}
                                    {#if usedFallbackRecommendations}
                                        <div class="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200" transition:slide>
                                            <span class="font-semibold">💡 Info:</span> Mostrando sugerencias predefinidas. La IA estará disponible pronto.
                                        </div>
                                    {/if}
                                    <div class="mt-4 space-y-2" transition:slide>
                                        {#each recommendedTasks as task, i}
                                            <div class="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10">
                                                <div class="flex-1">
                                                    <div class="flex items-center gap-2">
                                                        <span class="text-sm font-bold text-white">{task.title}</span>
                                                        <span class={`rounded-full border px-2 py-0.5 text-xs ${priorityColors[task.priority]}`}>
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                    <p class="mt-1 text-xs text-white/60">{task.description}</p>
                                                    {#if task.reason}
                                                        <p class="mt-1 text-xs italic text-purple-300">💡 {task.reason}</p>
                                                    {/if}
                                                    <div class="mt-2 text-xs text-white/40">⏱️ {task.estimated_duration}</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    class="rounded-full bg-emerald-500/20 p-2 text-emerald-300 hover:bg-emerald-500/30"
                                                    on:click={() => addRecommendedTask(task)}
                                                    title="Agregar tarea"
                                                    aria-label="Agregar tarea"
                                                >
                                                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                            </div>

                            <!-- User Tasks Section -->
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <h4 class="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Tus tareas ({tasks.length})</h4>
                                    <button
                                        type="button"
                                        class="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-white/40 hover:bg-white/10"
                                        on:click={openNewTaskForm}
                                    >
                                        + Nueva tarea
                                    </button>
                                </div>

                                {#if tasks.length === 0}
                                    <div class="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center">
                                        <div class="text-4xl mb-2">📝</div>
                                        <p class="text-white/60">No hay tareas todavía</p>
                                        <p class="text-sm text-white/40">Agrega tareas manualmente o usa las recomendaciones IA</p>
                                    </div>
                                {:else}
                                    <div class="space-y-2">
                                        {#each tasks as task, i}
                                            <div class="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10" transition:slide>
                                                <div class="flex flex-col gap-1">
                                                    <button
                                                        type="button"
                                                        class="text-white/40 hover:text-white disabled:opacity-30"
                                                        on:click={() => moveTaskUp(i)}
                                                        disabled={i === 0}
                                                        title="Mover arriba"
                                                        aria-label="Mover arriba"
                                                    >
                                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        class="text-white/40 hover:text-white disabled:opacity-30"
                                                        on:click={() => moveTaskDown(i)}
                                                        disabled={i === tasks.length - 1}
                                                        title="Mover abajo"
                                                        aria-label="Mover abajo"
                                                    >
                                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div class="flex-1">
                                                    <div class="flex items-center gap-2">
                                                        <span class="text-xs text-white/40">#{i + 1}</span>
                                                        <span class="font-bold text-white">{task.title}</span>
                                                        <span class={`rounded-full border px-2 py-0.5 text-xs ${priorityColors[task.priority]}`}>
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                    {#if task.description}
                                                        <p class="mt-1 text-sm text-white/60">{task.description}</p>
                                                    {/if}
                                                    {#if task.estimated_duration}
                                                        <div class="mt-1 text-xs text-white/40">⏱️ {task.estimated_duration}</div>
                                                    {/if}
                                                </div>
                                                <div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <button
                                                        type="button"
                                                        class="rounded-full bg-blue-500/20 p-2 text-blue-300 hover:bg-blue-500/30"
                                                        on:click={() => editTask(i)}
                                                        title="Editar"
                                                        aria-label="Editar"
                                                    >
                                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        class="rounded-full bg-red-500/20 p-2 text-red-300 hover:bg-red-500/30"
                                                        on:click={() => removeTask(i)}
                                                        title="Eliminar"
                                                        aria-label="Eliminar tarea"
                                                    >
                                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                {/if}

                                <!-- New/Edit Task Form -->
                                {#if showNewTaskForm}
                                    <div class="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4" transition:slide>
                                        <h4 class="mb-3 font-bold text-white">{editingTaskIndex !== null ? 'Editar' : 'Nueva'} tarea</h4>
                                        <div class="space-y-3">
                                            <input
                                                type="text"
                                                bind:value={newTask.title}
                                                placeholder="Título de la tarea"
                                                class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                            />
                                            <textarea
                                                bind:value={newTask.description}
                                                placeholder="Descripción (opcional)"
                                                rows="2"
                                                class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                            ></textarea>
                                            <div class="grid gap-3 md:grid-cols-2">
                                                <select
                                                    bind:value={newTask.priority}
                                                    class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                                >
                                                    <option value="low">Prioridad: Baja</option>
                                                    <option value="medium">Prioridad: Media</option>
                                                    <option value="high">Prioridad: Alta</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    bind:value={newTask.estimated_duration}
                                                    placeholder="Duración estimada"
                                                    class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                                />
                                            </div>
                                            <div class="flex gap-2">
                                                <button
                                                    type="button"
                                                    class="flex-1 rounded-xl border border-white/20 px-4 py-2 text-white hover:bg-white/10"
                                                    on:click={() => { showNewTaskForm = false; editingTaskIndex = null; }}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="button"
                                                    class="flex-1 rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-600"
                                                    on:click={saveTask}
                                                >
                                                    {editingTaskIndex !== null ? 'Actualizar' : 'Agregar'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {:else}
                        <!-- STEP 3: Final Review -->
                        <div class="space-y-6" transition:fly={{ y: 20, duration: 250, easing: cubicOut }}>
                            <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
                                <h3 class="mb-4 text-xl font-bold text-white">📋 Resumen de tu objetivo</h3>
                                
                                <div class="space-y-4">
                                    <div>
                                        <div class="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Título</div>
                                        <div class="mt-1 text-lg font-bold text-white">{formData.title}</div>
                                    </div>

                                    {#if formData.description}
                                        <div>
                                            <div class="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Descripción</div>
                                            <div class="mt-1 text-white/80">{formData.description}</div>
                                        </div>
                                    {/if}

                                    <div class="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <div class="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Tipo</div>
                                            <div class="mt-1 capitalize text-white">{formData.type === 'short' ? '🚀 Quick Win' : formData.type === 'medium' ? '⚡ Momentum' : '🏆 Epic Quest'}</div>
                                        </div>
                                        <div>
                                            <div class="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Métrica</div>
                                            <div class="mt-1 text-white">{formData.metric_key}</div>
                                        </div>
                                        <div>
                                            <div class="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Meta</div>
                                            <div class="mt-1 text-white">{formData.target_value}</div>
                                        </div>
                                    </div>

                                    <div class="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <div class="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Inicio</div>
                                            <div class="mt-1 text-white">{formData.start_date}</div>
                                        </div>
                                        <div>
                                            <div class="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Deadline</div>
                                            <div class="mt-1 text-white">{formData.end_date || 'Sin límite'}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div class="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Tareas ({tasks.length})</div>
                                        {#if tasks.length === 0}
                                            <div class="mt-2 text-sm text-white/60">Sin tareas definidas todavía</div>
                                        {:else}
                                            <div class="mt-2 space-y-1">
                                                {#each tasks as task, i}
                                                    <div class="flex items-center gap-2 text-sm text-white/80">
                                                        <span class="text-white/40">#{i + 1}</span>
                                                        <span>{task.title}</span>
                                                        <span class={`ml-auto rounded-full border px-2 py-0.5 text-xs ${priorityColors[task.priority]}`}>
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </div>

                            <div class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                                <div class="text-4xl mb-2">🎯</div>
                                <p class="font-semibold text-white">¡Todo listo!</p>
                                <p class="text-sm text-white/70">Tu objetivo será creado con todas las tareas configuradas</p>
                            </div>
                        </div>
                    {/if}

                    <div class="mt-4 flex flex-wrap-reverse items-center justify-between gap-4">
                        <button
                            type="button"
                            class="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/70 hover:border-white/40 hover:text-white"
                            on:click={previousStep}
                        >
                            {currentStep === 0 ? 'Cancelar' : 'Atrás'}
                        </button>

                        {#if currentStep < stepCount - 1}
                            <button
                                type="button"
                                class="rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-purple-500/30 hover:from-purple-500 hover:to-fuchsia-400"
                                on:click={nextStep}
                            >
                                Continuar
                            </button>
                        {:else}
                            <button
                                type="submit"
                                class="flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-8 py-3 text-sm font-bold uppercase tracking-[0.3em] text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-500 hover:to-cyan-400 disabled:opacity-60"
                                disabled={isSubmitting}
                            >
                                {#if isSubmitting}
                                    <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                                    Creando...
                                {:else}
                                    Crear goal
                                {/if}
                            </button>
                        {/if}
                    </div>
                </form>
            </div>

            <aside class="hidden flex-col gap-6 rounded-3xl border border-white/5 bg-white/5 p-6 md:flex">
                <div class="space-y-3">
                    <div class="text-xs font-semibold uppercase tracking-[0.4em] text-white/40">Vista previa</div>
                    <div class="rounded-2xl border border-white/5 bg-neutral-900/60 p-5 text-white">
                        {#if selectedPreset && currentStep === 0}
                            <div class="text-center">
                                <div class="text-5xl mb-3">{selectedPreset.icon}</div>
                                <h3 class="text-xl font-bold">{selectedPreset.title}</h3>
                                <p class="mt-2 text-sm text-white/70">{selectedPreset.description}</p>
                                {#if selectedPreset.category !== 'Custom'}
                                    <div class="mt-4 space-y-2 text-xs">
                                        <div class="flex justify-between">
                                            <span class="text-white/40">Categoría</span>
                                            <span class="text-white">{selectedPreset.category}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-white/40">Duración</span>
                                            <span class="text-white">{selectedPreset.duration_days} días</span>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        {:else}
                            <div class="flex items-center justify-between text-sm text-white/60">
                                <span>{formData.type === 'short' ? '🚀 Sprint' : formData.type === 'medium' ? '⚡ Progress' : '🏆 Journey'}</span>
                                <span>{formData.metric_key || 'metric_key'}</span>
                            </div>
                            <h3 class="mt-2 text-2xl font-bold">{formData.title || 'Tu objetivo'}</h3>
                            {#if formData.description}
                                <p class="mt-2 text-sm text-white/70 line-clamp-3">{formData.description}</p>
                            {/if}
                            <div class="mt-4 grid gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
                                <div class="flex items-center justify-between">
                                    <span>Target</span>
                                    <span class="text-white">{formData.target_value || '---'}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span>Inicio</span>
                                    <span class="text-white">{formData.start_date || '---'}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span>Deadline</span>
                                    <span class="text-white">{formData.end_date || 'Flexible'}</span>
                                </div>
                            </div>

                            {#if currentStep >= 2 && tasks.length > 0}
                                <div class="mt-4 border-t border-white/10 pt-4">
                                    <div class="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                                        Tareas ({tasks.length})
                                    </div>
                                    <div class="space-y-1">
                                        {#each tasks.slice(0, 3) as task}
                                            <div class="flex items-center gap-2 text-sm">
                                                <span class="text-emerald-400">✓</span>
                                                <span class="text-white/80 line-clamp-1">{task.title}</span>
                                            </div>
                                        {/each}
                                        {#if tasks.length > 3}
                                            <div class="text-xs text-white/40">+ {tasks.length - 3} más</div>
                                        {/if}
                                    </div>
                                </div>
                            {/if}
                        {/if}
                    </div>
                </div>

                <div class="space-y-4 text-sm text-white/70">
                    <div class="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                        {currentStep === 0 ? 'Plantillas disponibles' : currentStep === 1 ? 'Configuración' : currentStep === 2 ? 'Gestión de tareas' : 'Revisión final'}
                    </div>
                    <ul class="space-y-2">
                        {#if currentStep === 0}
                            <li>• Selecciona una plantilla o crea desde cero</li>
                            <li>• Cada plantilla incluye configuración optimizada</li>
                            <li>• Puedes personalizar todo después</li>
                        {:else if currentStep === 1}
                            <li>• Define tu objetivo con claridad</li>
                            <li>• La métrica te ayudará a medir progreso</li>
                            <li>• Elige fechas realistas</li>
                        {:else if currentStep === 2}
                            <li>• Usa IA para generar tareas inteligentes</li>
                            <li>• Agrega tareas personalizadas</li>
                            <li>• Ordena las tareas por prioridad</li>
                        {:else}
                            <li>• Revisa todos los detalles</li>
                            <li>• Podrás editar después de crear</li>
                            <li>• Las tareas se crearán automáticamente</li>
                        {/if}
                    </ul>
                </div>

                {#if currentStep >= 1}
                    <div class="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                        <div class="flex items-start gap-3">
                            <div class="text-2xl">💡</div>
                            <div class="flex-1 text-xs text-blue-200">
                                {#if currentStep === 1}
                                    Una métrica clara y un objetivo numérico específico te ayudarán a mantener el foco.
                                {:else if currentStep === 2}
                                    Las tareas recomendadas por IA están optimizadas según mejores prácticas y tu tipo de objetivo.
                                {:else}
                                    ¡Estás a un paso de comenzar tu journey! Revisa que todo esté correcto.
                                {/if}
                            </div>
                        </div>
                    </div>
                {/if}
            </aside>
        </div>
    </div>
</div>
{/if}

<style>
    .chip {
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.06);
        padding: 0.5rem 1.25rem;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.85rem;
        transition: all 0.2s ease;
    }

    .chip:hover {
        border-color: rgba(168, 85, 247, 0.8);
        color: #fff;
    }
</style>