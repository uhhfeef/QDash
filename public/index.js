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
import { createLoginPage } from './components/Login.js';

// Make Plotly available globally
window.Plotly = Plotly;

async function checkAuth() {
    try {
        const response = await fetch('/api/auth-status', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.isAuthenticated;
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}

function clearPage() {
    const root = document.querySelector('.min-h-screen');
    if (root) {
        root.remove();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const isAuthenticated = await checkAuth();
        
        if (!isAuthenticated) {
            // Clear existing content and show login
            clearPage();
            document.body.appendChild(createLoginPage());
            return;
        }

        // Initialize app only if authenticated
        const connection = await initDuckDB();
        await initialize(connection); 
        setupEventListeners(handleChatSubmit);
        
        // Set up logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch('/api/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        window.location.reload();
                    }
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            });
        }
        
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