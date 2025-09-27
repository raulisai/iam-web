<script lang="ts">
    import ChatMessage from '../../lib/components/ChatMessage.svelte';
    import type { Message } from '../../lib/components/ChatMessage.svelte';
    
    let messages: Message[] = [
        {
            id: '1',
            role: 'system',
            content: 'Connected to your AI assistant. How can I help you today?',
            timestamp: '10:00'
        },
        {
            id: '2', 
            role: 'user',
            content: 'What should I focus on today?',
            timestamp: '10:01',
            status: 'sent'
        },
        {
            id: '3',
            role: 'assistant',
            content: 'Based on your current stats, I recommend focusing on: 1) Complete your morning workout (Body score is 75%), 2) Finish the pending project task (High severity failure), and 3) Do your daily meditation (Mind health boost). Would you like me to create a detailed schedule?',
            timestamp: '10:01',
            status: 'sent',
            agentName: 'Coach AI'
        }
    ];
    
    let inputValue = '';
    let isTyping = false;
    
    // Agent profiles
    const agents = [
        { id: 'coach', name: 'Coach AI', icon: '🏆', status: 'online' },
        { id: 'health', name: 'Health Monitor', icon: '❤️', status: 'online' },
        { id: 'planner', name: 'Task Planner', icon: '📋', status: 'offline' },
        { id: 'analyst', name: 'Data Analyst', icon: '📊', status: 'online' }
    ];
    
    let selectedAgent = agents[0];
    
    function sendMessage() {
        if (!inputValue.trim()) return;
        
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'sending'
        };
        
        messages = [...messages, newMessage];
        inputValue = '';
        isTyping = true;
        
        // Simulate assistant response
        setTimeout(() => {
            messages = messages.map(m => 
                m.id === newMessage.id ? { ...m, status: 'sent' } : m
            );
            
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I understand your request. Let me analyze this for you...',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                status: 'sent',
                agentName: selectedAgent.name
            };
            
            messages = [...messages, assistantMessage];
            isTyping = false;
        }, 1500);
    }
    
    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
</script>

<!-- Vista mobile-only -->
<div class="md:hidden h-[calc(100dvh-4rem)] overflow-hidden bg-neutral-950">
    <div class="flex flex-col h-full">
        <!-- Header con selector de agente -->
        <div class="px-4 py-3 border-b border-white/10">
            <div class="flex items-center justify-between mb-2">
                <h1 class="text-lg font-bold text-white">AI Assistant</h1>
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full {selectedAgent.status === 'online' ? 'bg-emerald-400' : 'bg-neutral-500'}"></span>
                    <span class="text-xs text-white/60">{selectedAgent.status}</span>
                </div>
            </div>
            
            <!-- Agent selector -->
            <div class="flex gap-2 overflow-x-auto pb-1">
                {#each agents as agent}
                    <button 
                        class="flex items-center gap-1 px-3 py-1.5 rounded-lg border whitespace-nowrap text-xs transition-all
                               {selectedAgent.id === agent.id 
                                 ? 'bg-purple-500/20 border-purple-500/30 text-white' 
                                 : 'bg-neutral-900/60 border-white/10 text-white/60'}"
                        on:click={() => selectedAgent = agent}
                    >
                        <span>{agent.icon}</span>
                        <span>{agent.name}</span>
                        {#if agent.status === 'online'}
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Chat messages -->
        <div class="flex-1 overflow-y-auto">
            {#each messages as message}
                <ChatMessage {message} />
            {/each}
            
            {#if isTyping}
                <div class="px-4 py-2">
                    <div class="flex items-center gap-2 text-white/50">
                        <span class="text-sm">{selectedAgent.name} is typing</span>
                        <div class="flex gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style="animation-delay: 0ms"></span>
                            <span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style="animation-delay: 150ms"></span>
                            <span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style="animation-delay: 300ms"></span>
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Input area -->
        <div class="border-t border-white/10 p-4">
            <div class="flex gap-2">
                <div class="flex-1 relative">
                    <input
                        type="text"
                        bind:value={inputValue}
                        on:keydown={handleKeydown}
                        placeholder="Ask your AI assistant..."
                        class="w-full px-4 py-3 rounded-xl bg-neutral-900/60 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                    />
                    
                    <!-- Quick actions -->
                    <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button class="w-7 h-7 rounded-lg bg-neutral-800/50 flex items-center justify-center text-xs">
                            📎
                        </button>
                    </div>
                </div>
                
                <button 
                    on:click={sendMessage}
                    class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                </button>
            </div>
            
            <!-- Suggested prompts -->
            <div class="flex gap-2 mt-3 overflow-x-auto">
                <button class="px-3 py-1 rounded-lg bg-neutral-900/60 border border-white/10 text-[10px] text-white/70 whitespace-nowrap">
                    📊 Analyze my progress
                </button>
                <button class="px-3 py-1 rounded-lg bg-neutral-900/60 border border-white/10 text-[10px] text-white/70 whitespace-nowrap">
                    💡 Suggest improvements
                </button>
                <button class="px-3 py-1 rounded-lg bg-neutral-900/60 border border-white/10 text-[10px] text-white/70 whitespace-nowrap">
                    📅 Plan my day
                </button>
                <button class="px-3 py-1 rounded-lg bg-neutral-900/60 border border-white/10 text-[10px] text-white/70 whitespace-nowrap">
                    ❓ Help with failures
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Placeholder escritorio -->
<div class="hidden md:flex items-center justify-center h-screen bg-neutral-950 text-neutral-400">
    <p>AI Assistant Chat - Optimizado para móvil</p>
</div>
