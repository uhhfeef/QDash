/**
 * @fileoverview Handles all API communication for the chat
 */

import { showUpgradeNotification } from '../modules/uiUtils.js';

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

        if (response.status === 402) {
            const data = await response.json();
            showUpgradeNotification(data.requestCount);
            throw new Error(data.message);
        }

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