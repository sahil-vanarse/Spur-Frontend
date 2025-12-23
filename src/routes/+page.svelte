<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { sendMessage, getHistory, clearConversation, type LLMProvider } from '$lib/api';
  import '../app.css';

  interface Message {
    id?: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp?: Date;
  }

  let messages: Message[] = [];
  let newMessage = '';
  let sessionId: string | undefined;
  let isLoading = false;
  let isTyping = false;
  // Initialize loading state to true to check for session
  let isInitializing = true;
  let scrollContainer: HTMLElement;
  let selectedProvider: LLMProvider = 'groq';
  
  // 'home' or 'chat' view state
  let view: 'home' | 'chat' = 'home';

  const suggestions = [
    "Company Overview",
    "Tell me about Pricing.",
    "What are your core features?",
    "What integrations do you have?"
  ];

  onMount(async () => {
    try {
      sessionId = localStorage.getItem('chat_session_id') || undefined;
      selectedProvider = (localStorage.getItem('llm_provider') as LLMProvider) || 'groq';
      
      if (sessionId) {
        try {
          const history = await getHistory(sessionId);
          if (history.messages.length > 0) {
            messages = history.messages;
            view = 'chat'; 
            scrollToBottom();
          }
        } catch (e) {
          console.error('Failed to load history:', e);
          localStorage.removeItem('chat_session_id');
          sessionId = undefined;
        }
      }
    } finally {
      // Done initializing
      isInitializing = false;
    }
  });

  async function scrollToBottom() {
    await tick();
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
      // Add a small timeout for images/rendering
      setTimeout(() => {
        if(scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }, 100);
    }
  }

  function handleProviderChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedProvider = target.value as LLMProvider;
    localStorage.setItem('llm_provider', selectedProvider);
  }

  function handleStartChat() {
    view = 'chat';
    setTimeout(scrollToBottom, 50);
  }

  function handleBack() {
    view = 'home';
  }

  function handleReset() {
    messages = [];
    sessionId = undefined;
    localStorage.removeItem('chat_session_id');
    view = 'home';
  }

  async function handleClearChat() {
    if (!sessionId) return;
    
    try {
      await clearConversation(sessionId);
      messages = [];
    } catch (e: any) {
      console.error('Failed to clear conversation:', e);
      alert('Failed to clear conversation: ' + e.message);
    }
  }

  async function handleSuggestion(text: string) {
    view = 'chat';
    newMessage = text;
    await handleSubmit();
  }

  async function handleSubmit() {
    if (!newMessage.trim() || isLoading) return;

    const userMsg = newMessage;
    newMessage = '';
    messages = [...messages, { sender: 'user', text: userMsg }];
    isLoading = true;
    isTyping = true;
    scrollToBottom();

    try {
      const result = await sendMessage(userMsg, sessionId, selectedProvider);
      
      if (!sessionId) {
        sessionId = result.sessionId;
        localStorage.setItem('chat_session_id', sessionId!);
      }

      messages = [...messages, { sender: 'ai', text: result.reply }];
    } catch (e: any) {
      messages = [...messages, { sender: 'ai', text: `Error: ${e.message}` }];
    } finally {
      isLoading = false;
      isTyping = false;
      scrollToBottom();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }

  // Simple Markdown renderer
  function renderMarkdown(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>')
      .replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, (match) => {
        if (!match.includes('<ul>')) return '<ul>' + match + '</ul>';
        return match;
      });
  }
</script>

<div class="chat-container">
  
  {#if isInitializing}
    <div style="flex: 1; display: flex; align-items: center; justify-content: center; height: 100%;">
      <!-- Simple spinner -->
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>
      <style>
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      </style>
    </div>
  {:else}
    <!-- Header -->
    <header class="chat-header">
    <div class="header-left">
      {#if view === 'chat'}
        <button class="header-btn" on:click={handleBack} title="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      {/if}
      <div class="header-icon">
        <img src="/spur-logo.png" alt="Spur Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;" />
      </div>
      <h2>Spur Support</h2>
    </div>
    
    <div class="header-actions">
      <select 
         bind:value={selectedProvider} 
         on:change={handleProviderChange}
         class="header-select"
         title="Select AI Model"
       >
         <option value="groq">Groq</option>
         <option value="openai">OpenAI</option>
       </select>

      <button class="header-btn" on:click={handleNewChat} title="New Chat">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>

      <button class="header-btn" on:click={handleClearChat} title="Clear Chat" disabled={!sessionId || messages.length === 0}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
           <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  </header>

  <!-- Content -->
  {#if view === 'home'}
    <div class="home-view">
      <div class="hero-section">
        <div class="hero-title">Hey 👋, how can we help you today?</div>
      </div>

      <div style="flex: 1; padding-top: 2rem;">
        <div class="action-cards">
          <!-- Start Conversation -->
          <div 
            class="action-card primary-card" 
            role="button" 
            tabindex="0" 
            on:click={handleStartChat}
            on:keydown={(e) => e.key === 'Enter' && handleStartChat()}
          >
            <h3>Start a conversation</h3>
            <p>We usually respond within 10 minutes</p>
            <div style="margin-top: 1rem;">
               <button class="primary-btn">
                 Chat with us 
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
               </button>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-questions-section">
        <span class="section-label">Ask Quick Questions</span>
        <div class="chips-container">
          {#each suggestions as suggestion}
            <button class="chip" on:click={() => handleSuggestion(suggestion)}>
              {suggestion}
            </button>
          {/each}
        </div>
      </div>
      
    </div>
  {:else}
    <!-- Chat View -->
    <div class="chat-content">
      <div class="chat-messages" bind:this={scrollContainer}>
        <!-- Initial Greeting Message (Fake) -->
         <div class="message-wrapper ai">
           <img src="/spur-logo.png" class="ai-avatar" alt="AI" />
           <div class="message ai">
             Hey 👋, how can we help you today?
           </div>
         </div>

        {#each messages as msg}
          <div class="message-wrapper {msg.sender}">
            {#if msg.sender === 'ai'}
              <img src="/spur-logo.png" class="ai-avatar" alt="AI" />
            {/if}
            <div class="message {msg.sender}">
              {#if msg.sender === 'ai'}
                {@html renderMarkdown(msg.text)}
              {:else}
                {msg.text}
              {/if}
            </div>
          </div>
        {/each}
        
        {#if isTyping}
          <div class="message-wrapper ai">
             <img src="/spur-logo.png" class="ai-avatar" alt="AI" />
             <div class="typing-indicator" style="padding: 0; background: transparent;">Agent is typing...</div>
          </div>
        {/if}
      </div>

      <div class="chat-input-wrapper">
        <div class="input-container">
          <input
            type="text"
            placeholder="Type your message..."
            bind:value={newMessage}
            on:keydown={handleKeydown}
            disabled={isLoading}
            autoFocus
          />
          <button class="send-btn" on:click={handleSubmit} disabled={isLoading || !newMessage.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Footer -->
  <div class="footer">
     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
     Made by Sahil Vanarse
  </div>
  {/if}
</div>
