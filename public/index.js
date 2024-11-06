import './styles/styles.css';
import Plotly from 'plotly.js-dist';
import { initDuckDB } from '../config/duckDbConfig.js';
import { handleChatSubmit } from './controller/chatController.js';
import { setupEventListeners } from './modules/uiUtils.js';
import { initializeTableSchema } from './config/config.js';

// Make Plotly available globally
window.Plotly = Plotly;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDuckDB();  // Initialize DuckDB first
        await initializeTableSchema();
        setupEventListeners(handleChatSubmit);
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});