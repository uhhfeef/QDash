/**
 * @fileoverview Main chat handling module that coordinates AI interactions and tool execution
 * @module chatHandler
 * 
 * @requires ./modules/config
 * @requires ./modules/uiUtils
 * @requires ./modules/toolHandler
 * 
 * @description
 * This module handles the main chat functionality including:
 * - Processing user input
 * - Managing conversation with OpenAI API
 * - Coordinating tool executions
 * - Managing chat iterations
 * - Error handling
 * 
 * @example
 * // The module auto-initializes on DOMContentLoaded
 * // Manual usage:
 * import { handleChatSubmit } from './chatHandler.js';
 * await handleChatSubmit();
 */

import { tools, initializeTableSchema } from './modules/config.js';
import { addMessageToChat, setupEventListeners } from './modules/uiUtils.js';
import { handleToolCall } from './modules/toolHandler.js';

let chatMessages = [];

export async function handleChatSubmit() {
    const chatInput = document.getElementById('chat-input');
    const userMessage = chatInput.value.trim();
    
    if (!userMessage) return;
    
    addMessageToChat(userMessage, 'user');
    
    const formattedHistory = chatMessages.map(msg => 
        `${msg.role}: ${msg.content}`
    ).join('\n');
    
    let messages = [
        {"role": "system", "content": "You are a helpful assistant. Let's think step by step. You have access to a database. You can use the sql tool to fetch data from the database. You can also use the chart tool to create charts. If you need to convert data from one chart type to another, you dont need to call the sql tool again and again to fetch the same data. You will NEVER GENERATE RANDOM X AND Y VALUES for the chart tool. You will always double check and think step by step before you call the chart tool. If you're done with all steps, explicitly state 'DONE' at the end of your message. NEVER EVER INSERT OR DELETE FROM THE TABLE"},
        {"role": "user", "content": userMessage + " Context - Previous messages:\n" + formattedHistory}
    ];

    chatInput.value = '';
    let iterationCount = 0;
    const MAX_ITERATIONS = 5;

    try {
        while (iterationCount < MAX_ITERATIONS) {
            iterationCount++;
            console.log(`Iteration ${iterationCount} of ${MAX_ITERATIONS}`);

            console.log('Messages:', messages);
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

            const data = await response.json();
            console.log('Response:', data.choices[0].message);
            const message = data.choices[0].message;
            messages.push(message);
            chatMessages.push(message);

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

