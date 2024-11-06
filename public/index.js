/**
 * @fileoverview Main entry point for the application
 */

import './styles/styles.css';
import Plotly from 'plotly.js-dist';
import { initDuckDB } from '../config/duckDbConfig.js';
import { handleChatSubmit } from './controller/chatController.js';
import { setupEventListeners } from './modules/uiUtils.js';
import { initialize } from './services/duckDbService.js';
import { updateTools } from '../config/config.js';
import { handleCsvUpload } from './services/duckDbService.js';

// Make Plotly available globally
window.Plotly = Plotly;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const connection = await initDuckDB();
        await initialize(connection); 
        setupEventListeners(handleChatSubmit);
        
        // Set up CSV upload listener
        const csvUpload = document.getElementById('csv-upload');
        if (csvUpload) {
            csvUpload.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (file) {
                    try {
                        await handleCsvUpload(file);
                        await updateTools(); // Update tools after CSV upload
                    } catch (error) {
                        console.error("Failed to upload CSV:", error);
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});