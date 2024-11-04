/**
 * @fileoverview Main chat handling module that coordinates AI interactions and tool execution
 */

import { tools, initializeTableSchema } from '../config/config.js';
import { addMessageToChat, setupEventListeners } from '../modules/uiUtils.js';
import { handleToolCall } from '../modules/toolExecutor.js';
import { createChatManager, MAX_ITERATIONS } from '../modules/chatManager.js';
import { sendChatRequest } from '../services/chatApiRequest.js';

const chatManager = createChatManager();

export async function handleChatSubmit() {
    const chatInput = document.getElementById('chat-input');
    const userMessage = chatInput.value.trim();
    
    if (!userMessage) return;
    
    addMessageToChat(userMessage, 'user');
    chatInput.value = '';

    let messages = chatManager.getInitialMessages(userMessage);
    let iterationCount = 0;

    try {
        while (iterationCount < MAX_ITERATIONS) {
            iterationCount++;
            console.log(`Iteration ${iterationCount} of ${MAX_ITERATIONS}`);

            const data = await sendChatRequest(messages, tools);
            const message = data.choices[0].message;
            
            messages.push(message);
            chatManager.addMessage(message);

            if (message.content) {
                addMessageToChat(message.content, 'assistant');
                if (message.content.includes('DONE')) break;
            }
            
            if (message.tool_calls) {
                for (const toolCall of message.tool_calls) {
                    await handleToolCall(toolCall, messages);
                }
            }
        }

        if (iterationCount >= MAX_ITERATIONS) {
            addMessageToChat("Reached maximum number of iterations. Stopping here.", 'assistant');
        }

    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('Sorry, there was an error processing your request.', 'assistant');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeTableSchema();
    setupEventListeners(handleChatSubmit);
});

