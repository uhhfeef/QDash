/**
 * @fileoverview UI utility functions module
 * @module uiUtils
 * 
 * @description
 * Provides utility functions for UI interactions:
 * - Adding messages to chat display
 * - Setting up event listeners
 * - Managing chat scroll behavior
 * 
 * @example
 * import { addMessageToChat, setupEventListeners } from './modules/uiUtils.js';
 * addMessageToChat('Hello', 'user');
 * setupEventListeners(handleChatSubmit);
 */

export function addMessageToChat(content, role) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function setupEventListeners(handleChatSubmit) {
    const sendButton = document.getElementById('send-button');
    const chatInput = document.getElementById('chat-input');
    
    if (sendButton) {
        sendButton.addEventListener('click', () => handleChatSubmit());
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleChatSubmit();
            }
        });
    }
} 