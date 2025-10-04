<script lang="ts">
    import { onMount } from 'svelte';
    import ChatMessage from '../../lib/components/ChatMessage.svelte';
    import type { Message } from '../../lib/components/ChatMessage.svelte';
    import { 
        getChatSessions, 
        createChatSession, 
        getChatMessages, 
        createChatMessage,
        type ChatSession,
        type ChatMessage as ChatMessageType
    } from '../../lib/services/chat';
    
    let messages: Message[] = [];
    let inputValue = '';
    let isTyping = false;
    let currentSession: ChatSession | null = null;
    let isLoading = true;
    let error = '';
    
    // Agent profiles
    const agents = [
        { id: 'coach', name: 'Coach AI', icon: '🏆', status: 'online' },
        { id: 'health', name: 'Health Monitor', icon: '❤️', status: 'online' },
        { id: 'planner', name: 'Task Planner', icon: '📋', status: 'offline' },
        { id: 'analyst', name: 'Data Analyst', icon: '📊', status: 'online' }
    ];
    
    let selectedAgent = agents[0];
    
    // Load or create chat session on mount
    onMount(async () => {
        try {
            isLoading = true;
            error = '';
            
            // Get existing sessions
            const sessions = await getChatSessions();
            
            if (sessions.length > 0) {
                // Use the most recent session
                currentSession = sessions[0];
                await loadMessages();
            } else {
                // Create a new session
                currentSession = await createChatSession({
                    title: 'New Chat'
                });
                
                // Add welcome message
                messages = [{
                    id: '1',
                    role: 'system',
                    content: 'Connected to your AI assistant. How can I help you today?',
                    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }];
            }
        } catch (err) {
            console.error('Error initializing chat:', err);
            error = 'Failed to initialize chat. Please try again.';
        } finally {
            isLoading = false;
        }
    });
    
    async function loadMessages() {
        if (!currentSession) return;
        
        try {
            const chatMessages = await getChatMessages(currentSession.id);
            
            // Convert backend messages to UI messages
            messages = chatMessages.map((msg: ChatMessageType) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.created_at).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }),
                status: 'sent',
                agentName: msg.role === 'assistant' ? selectedAgent.name : undefined
            }));
            
            // Add welcome message if no messages exist
            if (messages.length === 0) {
                messages = [{
                    id: 'welcome',
                    role: 'system',
                    content: 'Connected to your AI assistant. How can I help you today?',
                    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }];
            }
        } catch (err) {
            console.error('Error loading messages:', err);
            error = 'Failed to load messages.';
        }
    }
    
    async function sendMessage() {
        if (!inputValue.trim() || !currentSession) return;
        
        const userMessageContent = inputValue;
        const tempId = `temp-${Date.now()}`;
        
        const newMessage: Message = {
            id: tempId,
            role: 'user',
            content: userMessageContent,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'sending'
        };
        
        messages = [...messages, newMessage];
        inputValue = '';
        isTyping = true;
        
        try {
            // Create user message in backend
            const userMsg = await createChatMessage(currentSession.id, {
                role: 'user',
                content: userMessageContent
            });
            
            // Update message with real ID
            messages = messages.map(m => 
                m.id === tempId ? { 
                    ...m, 
                    id: userMsg.id, 
                    status: 'sent' 
                } : m
            );
            
            // Simulate AI processing (you'll need to integrate with actual AI service)
            await simulateAIResponse(userMessageContent);
            
        } catch (err) {
            console.error('Error sending message:', err);
            error = 'Failed to send message.';
            
            // Mark message as failed
            messages = messages.map(m => 
                m.id === tempId ? { ...m, status: 'failed' } : m
            );
        } finally {
            isTyping = false;
        }
    }
    
    async function simulateAIResponse(userMessage: string) {
        if (!currentSession) return;
        
        // TODO: Replace with actual AI service call
        const aiResponse = generateMockAIResponse(userMessage);
        
        try {
            const assistantMsg = await createChatMessage(currentSession.id, {
                role: 'assistant',
                content: aiResponse
            });
            
            const assistantMessage: Message = {
                id: assistantMsg.id,
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date(assistantMsg.created_at).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }),
                status: 'sent',
                agentName: selectedAgent.name
            };
            
            messages = [...messages, assistantMessage];
        } catch (err) {
            console.error('Error creating AI response:', err);
            error = 'Failed to get AI response.';
        }
    }
    
    function generateMockAIResponse(userMessage: string): string {
        const lowerMsg = userMessage.toLowerCase();
        
        if (lowerMsg.includes('focus') || lowerMsg.includes('today')) {
            return 'Based on your current stats, I recommend focusing on: 1) Complete your morning workout (Body score is 75%), 2) Finish the pending project task (High severity failure), and 3) Do your daily meditation (Mind health boost). Would you like me to create a detailed schedule?';
        } else if (lowerMsg.includes('progress') || lowerMsg.includes('analyze')) {
            return "I've analyzed your progress this week. You're doing great! Your Mind score has improved by 15%, and you've completed 80% of your tasks. Keep up the good work!";
        } else if (lowerMsg.includes('help') || lowerMsg.includes('improve')) {
            return 'I can help you with several things: tracking your goals, analyzing your progress, suggesting improvements, planning your day, and helping you overcome failures. What would you like to focus on?';
        } else {
            return `I understand you're asking about "${userMessage}". Let me analyze this for you. As your AI assistant, I'm here to help you optimize your mind, body, and soul journey. Could you provide more details about what specific aspect you'd like help with?`;
        }
    }
    
    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
    
    function handleSuggestedPrompt(prompt: string) {
        inputValue = prompt;
        sendMessage();
    }
</script>

<!-- Loading state -->
{#if isLoading}
    <div class="flex items-center justify-center h-[calc(100dvh-4rem)] bg-neutral-950">
        <div class="text-center">
            <div class="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-white/60">Loading chat...</p>
        </div>
    </div>
{:else}

<!-- Vista mobile-only -->
<div class="md:hidden h-[calc(100dvh-4rem)] overflow-hidden bg-neutral-950">
    <div class="flex flex-col h-full">
        <!-- Error message -->
        {#if error}
            <div class="px-4 py-2 bg-red-500/10 border-b border-red-500/30">
                <p class="text-sm text-red-400">{error}</p>
            </div>
        {/if}
        
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
                    aria-label="Send message"
                    class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                </button>
            </div>
            
            <!-- Suggested prompts -->
            <div class="flex gap-2 mt-3 overflow-x-auto">
                <button 
                    on:click={() => handleSuggestedPrompt('Analyze my progress this week')}
                    class="px-3 py-1 rounded-lg bg-neutral-900/60 border border-white/10 text-[10px] text-white/70 whitespace-nowrap active:scale-95 transition-transform">
                    📊 Analyze my progress
                </button>
                <button 
                    on:click={() => handleSuggestedPrompt('Suggest improvements for my goals')}
                    class="px-3 py-1 rounded-lg bg-neutral-900/60 border border-white/10 text-[10px] text-white/70 whitespace-nowrap active:scale-95 transition-transform">
                    💡 Suggest improvements
                </button>
                <button 
                    on:click={() => handleSuggestedPrompt('Plan my day')}
                    class="px-3 py-1 rounded-lg bg-neutral-900/60 border border-white/10 text-[10px] text-white/70 whitespace-nowrap active:scale-95 transition-transform">
                    📅 Plan my day
                </button>
                <button 
                    on:click={() => handleSuggestedPrompt('Help me with my failures')}
                    class="px-3 py-1 rounded-lg bg-neutral-900/60 border border-white/10 text-[10px] text-white/70 whitespace-nowrap active:scale-95 transition-transform">
                    ❓ Help with failures
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Vista escritorio -->
<div class="hidden md:flex h-screen bg-neutral-950">
    <div class="flex-1 flex flex-col max-w-5xl mx-auto w-full">
        <!-- Error message -->
        {#if error}
            <div class="px-8 py-3 bg-red-500/10 border-b border-red-500/30">
                <p class="text-sm text-red-400">{error}</p>
            </div>
        {/if}
        
        <!-- Header con selector de agente -->
        <div class="px-8 py-6 border-b border-white/10">
            <div class="flex items-center justify-between mb-4">
                <h1 class="text-3xl font-bold text-white">AI Assistant</h1>
                <div class="flex items-center gap-3">
                    <span class="w-2.5 h-2.5 rounded-full {selectedAgent.status === 'online' ? 'bg-emerald-400' : 'bg-neutral-500'}"></span>
                    <span class="text-sm text-white/60">{selectedAgent.status}</span>
                </div>
            </div>
            
            <!-- Agent selector -->
            <div class="flex gap-3">
                {#each agents as agent}
                    <button 
                        class="flex items-center gap-2 px-4 py-2 rounded-lg border whitespace-nowrap text-sm transition-all hover:scale-105
                               {selectedAgent.id === agent.id 
                                 ? 'bg-purple-500/20 border-purple-500/30 text-white' 
                                 : 'bg-neutral-900/60 border-white/10 text-white/60 hover:bg-neutral-900'}"
                        on:click={() => selectedAgent = agent}
                    >
                        <span class="text-lg">{agent.icon}</span>
                        <span>{agent.name}</span>
                        {#if agent.status === 'online'}
                            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Chat messages -->
        <div class="flex-1 overflow-y-auto px-8 py-6">
            {#each messages as message}
                <ChatMessage {message} />
            {/each}
            
            {#if isTyping}
                <div class="py-4">
                    <div class="flex items-center gap-3 text-white/50">
                        <span class="text-sm">{selectedAgent.name} is typing</span>
                        <div class="flex gap-1">
                            <span class="w-2 h-2 rounded-full bg-white/50 animate-bounce" style="animation-delay: 0ms"></span>
                            <span class="w-2 h-2 rounded-full bg-white/50 animate-bounce" style="animation-delay: 150ms"></span>
                            <span class="w-2 h-2 rounded-full bg-white/50 animate-bounce" style="animation-delay: 300ms"></span>
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Input area -->
        <div class="border-t border-white/10 px-8 py-6">
            <!-- Suggested prompts -->
            <div class="flex gap-3 mb-4">
                <button 
                    on:click={() => handleSuggestedPrompt('Analyze my progress this week')}
                    class="px-4 py-2 rounded-lg bg-neutral-900/60 border border-white/10 text-sm text-white/70 whitespace-nowrap hover:bg-neutral-900 transition-colors">
                    📊 Analyze my progress
                </button>
                <button 
                    on:click={() => handleSuggestedPrompt('Suggest improvements for my goals')}
                    class="px-4 py-2 rounded-lg bg-neutral-900/60 border border-white/10 text-sm text-white/70 whitespace-nowrap hover:bg-neutral-900 transition-colors">
                    💡 Suggest improvements
                </button>
                <button 
                    on:click={() => handleSuggestedPrompt('Plan my day')}
                    class="px-4 py-2 rounded-lg bg-neutral-900/60 border border-white/10 text-sm text-white/70 whitespace-nowrap hover:bg-neutral-900 transition-colors">
                    📅 Plan my day
                </button>
                <button 
                    on:click={() => handleSuggestedPrompt('Help me with my failures')}
                    class="px-4 py-2 rounded-lg bg-neutral-900/60 border border-white/10 text-sm text-white/70 whitespace-nowrap hover:bg-neutral-900 transition-colors">
                    ❓ Help with failures
                </button>
            </div>

            <div class="flex gap-3">
                <div class="flex-1 relative">
                    <input
                        type="text"
                        bind:value={inputValue}
                        on:keydown={handleKeydown}
                        placeholder="Ask your AI assistant..."
                        class="w-full px-5 py-4 rounded-xl bg-neutral-900/60 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                    />
                    
                    <!-- Quick actions -->
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button class="w-8 h-8 rounded-lg bg-neutral-800/50 flex items-center justify-center text-sm hover:bg-neutral-800 transition-colors">
                            📎
                        </button>
                    </div>
                </div>
                
                <button 
                    on:click={sendMessage}
                    aria-label="Send message"
                    class="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-transform"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</div>
{/if}
