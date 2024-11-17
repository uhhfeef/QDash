/**
 * @fileoverview Main entry point for the application
 */

import './styles/styles.css';

// Defer loading heavy dependencies
const loadAppDependencies = async () => {
    const Plotly = await import('plotly.js-dist');
    const { initDuckDB } = await import('./services/duckDbConfig.js');
    const { handleChatSubmit } = await import('./controller/chatController.js');
    const { setupEventListeners } = await import('./modules/uiUtils.js');
    const { initialize } = await import('./services/duckDbService.js');
    const { updateTools } = await import('./services/config.js');
    const { handleCsvUpload } = await import('./services/duckDbService.js');
    
    window.Plotly = Plotly.default;
    return {
        initDuckDB,
        handleChatSubmit,
        setupEventListeners,
        initialize,
        updateTools,
        handleCsvUpload
    };
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // If on login page, do nothing (let login.js handle it)
    if (window.location.pathname === '/login') {
        return;
    }
    
    // Only load app if we're on main page
    if (window.location.pathname === '/') {
        try {
            const {
                initDuckDB,
                handleChatSubmit,
                setupEventListeners,
                initialize,
                updateTools,
                handleCsvUpload
            } = await loadAppDependencies();

            // Initialize app
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
            window.location.href = '/login'; // Redirect to login if initialization fails
        }
    }
});