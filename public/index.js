import './styles/styles.css'; // Import your CSS
import { handleChatSubmit } from './controller/chatController.js'; // Import your main controller
import { initializeTableSchema } from './config/config.js'; // Import the function to initialize the table schema
import { setupEventListeners } from './modules/uiUtils.js'; // Import utility functions for UI interactions

// Initialize the table schema when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTableSchema(); // Load the table schema
    setupEventListeners(handleChatSubmit); // Set up event listeners for chat interactions
});