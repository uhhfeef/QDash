import './styles/styles.css';
import Plotly from 'plotly.js-dist';
import { initDuckDB } from '../config/duckDbConfig.js';
import { handleChatSubmit } from './controller/chatController.js';
import { setupEventListeners } from './modules/uiUtils.js';
import { initializeTableSchema } from './config/config.js';
import { initialize } from './services/duckDbService.js';

// Make Plotly available globally
window.Plotly = Plotly;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const connection = await initDuckDB();  // Initialize DuckDB once
        await initialize(connection);           // Pass the connection to service
        await initializeTableSchema();
        setupEventListeners(handleChatSubmit);
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});