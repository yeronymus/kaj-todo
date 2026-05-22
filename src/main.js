// src/main.js
import './style.scss';
import AppController from './controllers/AppController.js';

// Wait for DOM layout to load fully
document.addEventListener('DOMContentLoaded', () => {
    console.log('TodoZen Premium Suite Initializing...');

    // 1. Initialize Theme Engine (Light / Dark Modes)
    const initThemeEngine = () => {
        const themeBtn = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('todozen_theme') || 'light';
        
        // Initial setup
        if (savedTheme === 'dark') {
            document.body.classList.replace('light-mode', 'dark-mode');
        } else {
            document.body.classList.replace('dark-mode', 'light-mode');
        }

        themeBtn.addEventListener('click', () => {
            if (document.body.classList.contains('light-mode')) {
                document.body.classList.replace('light-mode', 'dark-mode');
                localStorage.setItem('todozen_theme', 'dark');
            } else {
                document.body.classList.replace('dark-mode', 'light-mode');
                localStorage.setItem('todozen_theme', 'light');
            }
        });
    };

    // 2. Register Service Worker for PWA compliance (Offline Capability)
    const registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`)
                    .then(registration => {
                        console.log('TodoZen Service Worker registered with scope:', registration.scope);
                    })
                    .catch(error => {
                        console.error('TodoZen Service Worker registration failed:', error);
                    });
            });
        }
    };

    // Initialize systems
    initThemeEngine();
    registerServiceWorker();

    // 3. Bootstrap MVC orchestrator
    const app = new AppController();
    app.start();
});
