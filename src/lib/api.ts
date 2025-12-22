const API_URL = 'http://localhost:3001/chat';

export type LLMProvider = 'openai' | 'groq';

export async function sendMessage(message: string, sessionId?: string, provider: LLMProvider = 'groq') {
    const response = await fetch(`${API_URL}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, sessionId, provider }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
    }

    return response.json();
}

export async function getHistory(sessionId: string) {
    const response = await fetch(`${API_URL}/history/${sessionId}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch history');
    }

    return response.json();
}

export async function clearConversation(sessionId: string) {
    const response = await fetch(`${API_URL}/clear`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear conversation');
    }

    return response.json();
}
