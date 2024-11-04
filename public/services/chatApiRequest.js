/**
 * @fileoverview Handles all API communication for the chat
 */

export async function sendChatRequest(messages, tools) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: messages,
            tools: tools,
            tool_choice: "auto"
        })
    });

    return await response.json();
} 