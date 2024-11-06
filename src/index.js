import './styles/styles.css'; // Import your CSS
import { handleChatSubmit } from '../public/controller/chatController.js'; // Import your main controller
import { initializeTableSchema } from '../config/config.js'; // Import the function to initialize the table schema
import { setupEventListeners } from '../public/modules/uiUtils.js'; // Import utility functions for UI interactions

// Initialize the table schema when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("index.js loaded");
    initializeTableSchema(); // Load the table schema
    setupEventListeners(handleChatSubmit); // Set up event listeners for chat interactions
});