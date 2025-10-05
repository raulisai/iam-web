<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import ChatMessage from '../../lib/components/ChatMessage.svelte';
    import type { Message } from '../../lib/components/ChatMessage.svelte';
    import { 
        getChatSessions, 
        createChatSession, 
        getChatMessages, 
        createChatMessage,
        deleteChatSession,
        type ChatSession,
        type ChatMessage as ChatMessageType
    } from '../../lib/services/chat';
    import { speechRecognition, textToSpeech } from '../../lib/services/speech';
    
    let messages: Message[] = [];
    let inputValue = '';
    let isTyping = false;
    let currentSession: ChatSession | null = null;
    let allSessions: ChatSession[] = [];
    let isLoading = true;
    let error = '';
    let isSidebarOpen = false;
    
    // Voice features
    let isListening = false;
    let isSpeaking = false;
    let speechSupported = false;
    let ttsSupported = false;
    let autoSpeak = false; // Auto-speak AI responses
    let isOnline = true; // Network status
    
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
            
            // Check voice support
            speechSupported = speechRecognition.isSupported();
            ttsSupported = textToSpeech.isSupported();
            
            // Check network status (only in browser)
            if (typeof navigator !== 'undefined') {
                isOnline = navigator.onLine;
            }
            
            // Listen for online/offline events (only in browser)
            if (typeof window !== 'undefined') {
                window.addEventListener('online', handleOnline);
                window.addEventListener('offline', handleOffline);
            }
            
            // Get existing sessions
            await loadAllSessions();
            
            if (allSessions.length > 0) {
                // Use the most recent session
                currentSession = allSessions[0];
                await loadMessages();
            } else {
                // Create a new session
                await createNewChat();
            }
        } catch (err) {
            console.error('Error initializing chat:', err);
            error = 'Failed to initialize chat. Please try again.';
        } finally {
            isLoading = false;
        }
    });
    
    onDestroy(() => {
        // Clean up speech services
        stopListening();
        stopSpeaking();
        
        // Remove event listeners (only in browser)
        if (typeof window !== 'undefined') {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        }
    });
    
    function handleOnline() {
        isOnline = true;
        console.log('Network connection restored');
    }
    
    function handleOffline() {
        isOnline = false;
        if (isListening) {
            stopListening();
        }
        error = 'Network connection lost. Voice recognition requires an active internet connection.';
        setTimeout(() => error = '', 5000);
    }
    
    async function loadAllSessions() {
        try {
            allSessions = await getChatSessions();
            // Sort by most recent first
            allSessions.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        } catch (err) {
            console.error('Error loading sessions:', err);
            error = 'Failed to load chat sessions.';
        }
    }
    
    async function createNewChat() {
        try {
            currentSession = await createChatSession({
                title: 'New Chat'
            });
            
            // Reload sessions list
            await loadAllSessions();
            
            // Add welcome message
            messages = [{
                id: 'welcome',
                role: 'system',
                content: 'Connected to your AI assistant. How can I help you today?',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }];
            
            // Close sidebar on mobile
            isSidebarOpen = false;
        } catch (err) {
            console.error('Error creating new chat:', err);
            error = 'Failed to create new chat.';
        }
    }
    
    async function selectSession(session: ChatSession) {
        currentSession = session;
        await loadMessages();
        isSidebarOpen = false;
    }
    
    async function deleteSession(sessionId: string, event: Event) {
        event.stopPropagation();
        
        if (!confirm('Are you sure you want to delete this conversation?')) {
            return;
        }
        
        try {
            await deleteChatSession(sessionId);
            await loadAllSessions();
            
            // If we deleted the current session, create a new one
            if (currentSession?.id === sessionId) {
                if (allSessions.length > 0) {
                    currentSession = allSessions[0];
                    await loadMessages();
                } else {
                    await createNewChat();
                }
            }
        } catch (err) {
            console.error('Error deleting session:', err);
            error = 'Failed to delete conversation.';
        }
    }
    
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
            // Create user message in backend - backend automatically generates AI response
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
            
            // Wait a bit for the backend to process the AI response
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Reload messages to get the AI response
            await loadMessages();
            
            // Auto-speak AI response if enabled
            if (autoSpeak && messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                if (lastMessage.role === 'assistant') {
                    speakText(lastMessage.content);
                }
            }
            
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
    
    // Voice to Text - Start listening
    function startListening() {
        if (!speechSupported) {
            error = 'Speech recognition is not supported in your browser.';
            setTimeout(() => error = '', 5000);
            return;
        }
        
        // Check network status
        if (!isOnline) {
            error = 'No internet connection. Voice recognition requires an active internet connection.';
            setTimeout(() => error = '', 5000);
            return;
        }
        
        // Clear any previous errors
        error = '';
        
        // Stop any current speech
        stopSpeaking();
        
        speechRecognition.start(
            (text) => {
                inputValue = text;
                // Clear error if transcription is working
                error = '';
            },
            () => {
                isListening = false;
            },
            (err) => {
                // Only log network errors once, not repeatedly
                if (!err.includes('Network error')) {
                    console.error('Speech recognition error:', err);
                }
                error = err;
                isListening = false;
                
                // Auto-clear error after 8 seconds
                setTimeout(() => {
                    if (error === err) {
                        error = '';
                    }
                }, 8000);
            }
        );
        
        isListening = true;
    }
    
    // Stop listening
    function stopListening() {
        try {
            speechRecognition.stop();
        } catch (err) {
            console.error('Error stopping speech recognition:', err);
        } finally {
            isListening = false;
        }
    }
    
    // Toggle listening
    function toggleListening() {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }
    
    // Text to Speech - Speak text
    function speakText(text: string) {
        if (!ttsSupported) {
            error = 'Text-to-speech is not supported in your browser.';
            return;
        }
        
        textToSpeech.speak(text, {
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            onEnd: () => {
                isSpeaking = false;
            },
            onError: (err) => {
                console.error('Text-to-speech error:', err);
                isSpeaking = false;
            }
        });
        
        isSpeaking = true;
    }
    
    // Stop speaking
    function stopSpeaking() {
        textToSpeech.stop();
        isSpeaking = false;
    }
    
    // Speak the last AI message
    function speakLastMessage() {
        const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
        if (lastAssistantMessage) {
            if (isSpeaking) {
                stopSpeaking();
            } else {
                speakText(lastAssistantMessage.content);
            }
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
<div class="md:hidden h-[calc(100dvh-4rem)] overflow-hidden bg-neutral-950 relative">
    <!-- Sidebar móvil -->
    {#if isSidebarOpen}
        <div class="absolute inset-0 z-50 flex">
            <!-- Overlay -->
            <div class="absolute inset-0 bg-black/60" on:click={() => isSidebarOpen = false} on:keydown={(e) => e.key === 'Escape' && (isSidebarOpen = false)} role="button" tabindex="0" aria-label="Close sidebar"></div>
            
            <!-- Sidebar content -->
            <div class="relative w-64 bg-neutral-900 border-r border-white/10 flex flex-col">
                <!-- Header del sidebar -->
                <div class="p-4 border-b border-white/10">
                    <button 
                        on:click={createNewChat}
                        class="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        New Chat
                    </button>
                </div>
                
                <!-- Lista de conversaciones -->
                <div class="flex-1 overflow-y-auto p-2">
                    {#each allSessions as session}
                        <div 
                            class="w-full px-3 py-3 rounded-lg mb-1 transition-all flex items-center justify-between group cursor-pointer
                                   {currentSession?.id === session.id 
                                     ? 'bg-purple-500/20 text-white' 
                                     : 'text-white/70 hover:bg-white/5'}"
                            on:click={() => selectSession(session)}
                            on:keydown={(e) => e.key === 'Enter' && selectSession(session)}
                            role="button"
                            tabindex="0"
                        >
                            <div class="flex-1 min-w-0">
                                <div class="text-sm truncate">{session.title || 'New Chat'}</div>
                                <div class="text-xs text-white/40 mt-0.5">
                                    {new Date(session.updated_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div 
                                on:click={(e) => deleteSession(session.id, e)}
                                on:keydown={(e) => e.key === 'Enter' && deleteSession(session.id, e)}
                                class="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-red-500/20 rounded transition-all cursor-pointer"
                                role="button"
                                tabindex="0"
                                aria-label="Delete chat">
                                <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
    
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
                <div class="flex items-center gap-2">
                    <button 
                        on:click={() => isSidebarOpen = !isSidebarOpen}
                        class="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        aria-label="Toggle sidebar">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                    <h1 class="text-lg font-bold text-white">AI Assistant</h1>
                </div>
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
            <!-- Voice controls -->
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                    {#if speechSupported}
                        <div class="relative group">
                            <button
                                on:click={toggleListening}
                                class="p-2 rounded-lg transition-all {isListening ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800/50 text-white/70 hover:bg-neutral-800'}"
                                aria-label={isListening ? 'Stop listening' : 'Start voice input (requires internet)'}>
                                {#if isListening}
                                    <svg class="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                                    </svg>
                                {:else}
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                                    </svg>
                                {/if}
                            </button>
                            <!-- Tooltip -->
                            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                Voice input (requires internet)
                            </div>
                        </div>
                    {/if}
                    
                    {#if ttsSupported}
                        <button
                            on:click={speakLastMessage}
                            class="p-2 rounded-lg transition-all {isSpeaking ? 'bg-purple-500/20 text-purple-400' : 'bg-neutral-800/50 text-white/70 hover:bg-neutral-800'}"
                            aria-label={isSpeaking ? 'Stop speaking' : 'Speak last message'}>
                            {#if isSpeaking}
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                </svg>
                            {:else}
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                                </svg>
                            {/if}
                        </button>
                        
                        <label class="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                bind:checked={autoSpeak}
                                class="w-3.5 h-3.5 rounded bg-neutral-800 border-white/10 text-purple-500 focus:ring-purple-500/50"
                            />
                            <span class="text-xs text-white/60">Auto-speak</span>
                        </label>
                    {/if}
                </div>
            </div>
            
            <div class="flex gap-2">
                <div class="flex-1 relative">
                    <input
                        type="text"
                        bind:value={inputValue}
                        on:keydown={handleKeydown}
                        placeholder={isListening ? 'Listening...' : 'Ask your AI assistant...'}
                        class="w-full px-4 py-3 rounded-xl bg-neutral-900/60 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                        disabled={isListening}
                    />
                </div>
                
                <button 
                    on:click={sendMessage}
                    aria-label="Send message"
                    class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
                    disabled={isListening}
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
<div class="hidden md:flex h-[calc(100dvh-4rem)] bg-neutral-950">
    <!-- Sidebar escritorio -->
    <div class="w-64 bg-neutral-900 border-r border-white/10 flex flex-col">
        <!-- Header del sidebar -->
        <div class="p-4 border-b border-white/10">
            <button 
                on:click={createNewChat}
                class="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-purple-500/20">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                New Chat
            </button>
        </div>
        
        <!-- Lista de conversaciones -->
        <div class="flex-1 overflow-y-auto p-3">
            <h3 class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">Recent Chats</h3>
            {#each allSessions as session}
                <div 
                    class="w-full px-3 py-3 rounded-lg mb-1 transition-all flex items-center justify-between group cursor-pointer
                           {currentSession?.id === session.id 
                             ? 'bg-purple-500/20 text-white' 
                             : 'text-white/70 hover:bg-white/5'}"
                    on:click={() => selectSession(session)}
                    on:keydown={(e) => e.key === 'Enter' && selectSession(session)}
                    role="button"
                    tabindex="0"
                >
                    <div class="flex-1 min-w-0">
                        <div class="text-sm truncate font-medium">{session.title || 'New Chat'}</div>
                        <div class="text-xs text-white/40 mt-0.5">
                            {new Date(session.updated_at).toLocaleDateString()}
                        </div>
                    </div>
                    <div 
                        on:click={(e) => deleteSession(session.id, e)}
                        on:keydown={(e) => e.key === 'Enter' && deleteSession(session.id, e)}
                        class="opacity-0 group-hover:opacity-100 ml-2 p-1.5 hover:bg-red-500/20 rounded transition-all cursor-pointer"
                        role="button"
                        tabindex="0"
                        aria-label="Delete chat">
                        <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </div>
                </div>
            {/each}
        </div>
    </div>
    
    <!-- Main chat area -->
    <div class="flex-1 flex flex-col">
        <!-- Error message -->
        {#if error}
            <div class="px-8 py-3 bg-red-500/10 border-b border-red-500/30">
                <p class="text-sm text-red-400">{error}</p>
            </div>
        {/if}
        
        <!-- Header con selector de agente -->
        <div class="px-8 py-6 border-b border-white/10">
            <div class="flex items-center justify-between mb-4">
                <h1 class="text-3xl font-bold text-white">{currentSession?.title || 'New Chat'}</h1>
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
            <!-- Voice controls and suggested prompts -->
            <div class="flex items-center justify-between mb-4">
                <div class="flex gap-3">
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
                </div>
                
                <!-- Voice controls -->
                <div class="flex items-center gap-3">
                    {#if speechSupported}
                        <button
                            on:click={toggleListening}
                            class="p-2.5 rounded-lg transition-all {isListening ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800/50 text-white/70 hover:bg-neutral-800'}"
                            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                            title={isListening ? 'Stop listening' : 'Start voice input'}>
                            {#if isListening}
                                <svg class="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                                </svg>
                            {:else}
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                                </svg>
                            {/if}
                        </button>
                    {/if}
                    
                    {#if ttsSupported}
                        <button
                            on:click={speakLastMessage}
                            class="p-2.5 rounded-lg transition-all {isSpeaking ? 'bg-purple-500/20 text-purple-400' : 'bg-neutral-800/50 text-white/70 hover:bg-neutral-800'}"
                            aria-label={isSpeaking ? 'Stop speaking' : 'Speak last message'}
                            title={isSpeaking ? 'Stop speaking' : 'Speak last message'}>
                            {#if isSpeaking}
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                </svg>
                            {:else}
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                                </svg>
                            {/if}
                        </button>
                        
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                bind:checked={autoSpeak}
                                class="w-4 h-4 rounded bg-neutral-800 border-white/10 text-purple-500 focus:ring-purple-500/50"
                            />
                            <span class="text-sm text-white/60">Auto-speak</span>
                        </label>
                    {/if}
                </div>
            </div>

            <div class="flex gap-3">
                <div class="flex-1 relative">
                    <input
                        type="text"
                        bind:value={inputValue}
                        on:keydown={handleKeydown}
                        placeholder={isListening ? 'Listening...' : 'Ask your AI assistant...'}
                        class="w-full px-5 py-4 rounded-xl bg-neutral-900/60 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
                        disabled={isListening}
                    />
                </div>
                
                <button 
                    on:click={sendMessage}
                    aria-label="Send message"
                    class="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isListening}
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
