<script lang="ts">
    import { goto } from '$app/navigation';
    import StatsCard from '../lib/components/StatsCard.svelte';
    import ProgressRing from '../lib/components/ProgressRing.svelte';
    import QuickAction from '../lib/components/QuickAction.svelte';
    import HealthBar from '../lib/components/HealthBar.svelte';
    
    // Dashboard data
    let overallScore = 78;
    let todayTasks = 8;
    let completedTasks = 5;
    let weeklyPoints = 245;
    let weeklyGoal = 400;
    
    // Quick stats
    let mindScore = 82;
    let bodyScore = 75;
    let goalsProgress = 68;
    
    // Recent activity
    const recentActivity = [
        { icon: '✅', title: 'Morning Meditation', time: '07:30', points: '+15' },
        { icon: '🏃', title: 'Cardio Session', time: '08:00', points: '+30' },
        { icon: '🧠', title: 'Focus Sprint', time: '09:30', points: '+25' },
        { icon: '💧', title: 'Hydration Goal', time: '11:00', points: '+10' }
    ];
    
    // Quick actions handlers
    const quickActions = [
        { icon: '🧠', label: 'Mind', sublabel: '82% health', color: 'purple' as const, onClick: () => goto('/minde') },
        { icon: '💪', label: 'Body', sublabel: '75% health', color: 'green' as const, onClick: () => goto('/body') },
        { icon: '🎯', label: 'Goals', sublabel: '5 active', color: 'blue' as const, onClick: () => goto('/goals') },
        { icon: '💣', label: 'Failures', sublabel: '2 pending', color: 'red' as const, onClick: () => goto('/failures') }
    ];
</script>

<!-- Vista mobile-only -->
<div class="md:hidden h-[calc(100dvh-4rem)] overflow-hidden bg-neutral-950">
    <div class="flex flex-col h-full">
        <!-- Header con saludo -->
        <div class="px-4 py-4 border-b border-white/10">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-white">Welcome back!</h1>
                    <p class="text-xs text-white/60 mt-1">Let's make today count</p>
                </div>
                <button class="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center">
                    <span class="text-lg">⚙️</span>
                </button>
            </div>
        </div>

        <!-- Contenido scrolleable -->
        <div class="flex-1 overflow-y-auto">
            <!-- Overall Score Ring -->
            <div class="flex justify-center py-6">
                <div class="relative">
                    <ProgressRing progress={overallScore} size={140} strokeWidth={10} label="Overall Score" sublabel="Great progress!" />
                    <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-2 border-neutral-950 flex items-center justify-center">
                        <span class="text-xs font-bold text-white">↑</span>
                    </div>
                </div>
            </div>

            <!-- Quick Stats Grid -->
            <div class="px-4 mb-6">
                <div class="grid grid-cols-2 gap-3">
                    <StatsCard 
                        title="Today's Tasks" 
                        value={`${completedTasks}/${todayTasks}`} 
                        subtitle="62% complete"
                        icon="📋" 
                        trend="up"
                        color="blue"
                    />
                    <StatsCard 
                        title="Weekly Points" 
                        value={weeklyPoints} 
                        subtitle={`Goal: ${weeklyGoal}`}
                        icon="⭐" 
                        trend="up"
                        color="amber"
                    />
                </div>
            </div>

            <!-- Health Bars Section -->
            <div class="px-4 mb-6">
                <h2 class="text-sm font-semibold text-white mb-3">System Health</h2>
                <div class="space-y-2">
                    <HealthBar value={mindScore} max={100} label="Mind Health" color="blue" />
                    <HealthBar value={bodyScore} max={100} label="Body Health" color="green" />
                    <HealthBar value={goalsProgress} max={100} label="Goals Progress" color="yellow" />
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="px-4 mb-6">
                <h2 class="text-sm font-semibold text-white mb-3">Quick Actions</h2>
                <div class="grid grid-cols-4 gap-2">
                    {#each quickActions as action}
                        <QuickAction {...action} />
                    {/each}
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="px-4 pb-6">
                <h2 class="text-sm font-semibold text-white mb-3">Recent Activity</h2>
                <div class="space-y-2">
                    {#each recentActivity as activity}
                        <div class="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 border border-white/5">
                            <div class="flex items-center gap-3">
                                <span class="text-xl">{activity.icon}</span>
                                <div>
                                    <div class="text-xs font-medium text-white">{activity.title}</div>
                                    <div class="text-[10px] text-white/50">{activity.time}</div>
                                </div>
                            </div>
                            <span class="text-xs font-semibold text-emerald-400">{activity.points}</span>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Vista escritorio -->
<div class="hidden md:flex h-screen bg-neutral-950">
    <div class="flex-1 overflow-y-auto">
        <div class="max-w-6xl mx-auto p-8">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-4xl font-bold text-white">Welcome back!</h1>
                    <p class="text-sm text-white/60 mt-2">Let's make today count</p>
                </div>
                <button class="w-12 h-12 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center hover:bg-neutral-700 transition-colors">
                    <span class="text-xl">⚙️</span>
                </button>
            </div>

            <!-- Overall Score y Quick Stats -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <!-- Overall Score Ring -->
                <div class="flex justify-center items-center">
                    <div class="relative">
                        <ProgressRing progress={overallScore} size={180} strokeWidth={12} label="Overall Score" sublabel="Great progress!" />
                        <div class="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 border-2 border-neutral-950 flex items-center justify-center">
                            <span class="text-sm font-bold text-white">↑</span>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats Grid -->
                <div class="lg:col-span-2 grid grid-cols-2 gap-4">
                    <StatsCard 
                        title="Today's Tasks" 
                        value={`${completedTasks}/${todayTasks}`} 
                        subtitle="62% complete"
                        icon="📋" 
                        trend="up"
                        color="blue"
                    />
                    <StatsCard 
                        title="Weekly Points" 
                        value={weeklyPoints} 
                        subtitle={`Goal: ${weeklyGoal}`}
                        icon="⭐" 
                        trend="up"
                        color="amber"
                    />
                </div>
            </div>

            <!-- Health Bars Section -->
            <div class="mb-8">
                <h2 class="text-lg font-semibold text-white mb-4">System Health</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <HealthBar value={mindScore} max={100} label="Mind Health" color="blue" />
                    <HealthBar value={bodyScore} max={100} label="Body Health" color="green" />
                    <HealthBar value={goalsProgress} max={100} label="Goals Progress" color="yellow" />
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="mb-8">
                <h2 class="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {#each quickActions as action}
                        <QuickAction {...action} />
                    {/each}
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="mb-8">
                <h2 class="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {#each recentActivity as activity}
                        <div class="flex items-center justify-between p-4 rounded-lg bg-neutral-900/60 border border-white/5 hover:bg-neutral-900 transition-colors">
                            <div class="flex items-center gap-4">
                                <span class="text-2xl">{activity.icon}</span>
                                <div>
                                    <div class="text-sm font-medium text-white">{activity.title}</div>
                                    <div class="text-xs text-white/50">{activity.time}</div>
                                </div>
                            </div>
                            <span class="text-sm font-semibold text-emerald-400">{activity.points}</span>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
