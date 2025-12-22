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
  let scrollContainer: HTMLElement;
  let selectedProvider: LLMProvider = 'groq';

  onMount(async () => {
    sessionId = localStorage.getItem('chat_session_id') || undefined;
    selectedProvider = (localStorage.getItem('llm_provider') as LLMProvider) || 'groq';
    
    if (sessionId) {
      try {
        const history = await getHistory(sessionId);
        messages = history.messages;
        scrollToBottom();
      } catch (e) {
        console.error('Failed to load history:', e);
        localStorage.removeItem('chat_session_id');
        sessionId = undefined;
      }
    }
  });

  async function scrollToBottom() {
    await tick();
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  function handleProviderChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedProvider = target.value as LLMProvider;
    localStorage.setItem('llm_provider', selectedProvider);
  }

  async function handleNewChat() {
    messages = [];
    sessionId = undefined;
    localStorage.removeItem('chat_session_id');
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
      // Bold text: **text** or __text__
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      // Italic text: *text* or _text_
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // Links: [text](url)
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Bullet points: * item or - item
      .replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>')
      // Wrap consecutive list items in ul
      .replace(/(<li>.*<\/li>)/gs, (match) => {
        if (!match.includes('<ul>')) {
          return '<ul>' + match + '</ul>';
        }
        return match;
      });
  }
</script>

<div class="chat-container">
  <header class="chat-header">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-weight: bold; font-size: 0.8rem;">S</span>
      </div>
      <h2>Spur Support</h2>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <select 
        id="provider-select"
        bind:value={selectedProvider}
        on:change={handleProviderChange}
        class="provider-select"
      >
        <option value="groq">Groq</option>
        <option value="openai">OpenAI</option>
      </select>
      <button on:click={handleNewChat} class="icon-btn" title="New Chat">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
      <button on:click={handleClearChat} class="icon-btn" title="Clear Chat" disabled={!sessionId || messages.length === 0}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>
      </button>
    </div>
  </header>

  <div class="chat-messages" bind:this={scrollContainer}>
    {#each messages as msg}
      <div class="message {msg.sender}">
        {#if msg.sender === 'ai'}
          {@html renderMarkdown(msg.text)}
        {:else}
          {msg.text}
        {/if}
      </div>
    {/each}
  </div>

  {#if isTyping}
    <div class="typing-indicator">Agent is typing...</div>
  {/if}

  <div class="chat-input-area">
    <input
      type="text"
      placeholder="Ask us anything..."
      bind:value={newMessage}
      on:keydown={handleKeydown}
      disabled={isLoading}
    />
    <button on:click={handleSubmit} disabled={isLoading || !newMessage.trim()}>
      Send
    </button>
  </div>
</div>
