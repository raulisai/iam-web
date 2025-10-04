<script context="module" lang="ts">
    export type Message = {
        id: string;
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp?: string;
        status?: 'sending' | 'sent' | 'error' | 'failed';
        agentName?: string;
    };
</script>

<script lang="ts">
    export let message: Message;
    
    const roleStyles = {
        user: 'bg-blue-500/10 border-blue-500/20 ml-8',
        assistant: 'bg-purple-500/10 border-purple-500/20 mr-8',
        system: 'bg-neutral-800/50 border-neutral-700/50 mx-4 text-center'
    };
    
    const roleIcons = {
        user: '👤',
        assistant: '🤖',
        system: '⚙️'
    };
</script>

<div class="px-4 py-2">
    <div class="rounded-xl border p-3 {roleStyles[message.role]} relative">
        {#if message.role !== 'system'}
            <div class="flex items-start gap-2 mb-1">
                <span class="text-lg">{roleIcons[message.role]}</span>
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-semibold text-white/70">
                            {message.role === 'user' ? 'You' : message.agentName || 'Assistant'}
                        </span>
                        {#if message.timestamp}
                            <span class="text-[9px] text-white/40">{message.timestamp}</span>
                        {/if}
                        {#if message.status === 'sending'}
                            <span class="text-[9px] text-amber-400">Sending...</span>
                        {:else if message.status === 'error' || message.status === 'failed'}
                            <span class="text-[9px] text-red-400">Failed</span>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
        
        <div class="text-xs text-white/90 leading-relaxed {message.role === 'system' ? 'text-white/60' : ''}">
            {message.content}
        </div>
        
        {#if message.status === 'sending'}
            <div class="absolute bottom-2 right-2">
                <div class="w-2 h-2 rounded-full bg-white/30 animate-pulse"></div>
            </div>
        {/if}
    </div>
</div>
