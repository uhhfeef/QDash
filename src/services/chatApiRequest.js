/**
 * @fileoverview Handles all API communication for the chat
 */

export async function sendChatRequest(messages, tools) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                messages: messages,
                tools: tools,
                tool_choice: "auto"
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log(response);
        return await response.json();
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        throw error; 
    }
}