// src/main.js
import './style.scss';
import AppController from './controllers/AppController.js';

// Wait for DOM layout to load fully
document.addEventListener('DOMContentLoaded', () => {
    console.log('TodoZen Premium Suite Initializing...');

    // 1. Initialize Theme Engine (Light / Dark Modes)
    const initThemeEngine = () => {
        const savedProfile = localStorage.getItem('todozen_profile');
        let theme = 'classic-light';
        
        if (savedProfile) {
            try {
                const profileObj = JSON.parse(savedProfile);
                theme = profileObj.theme || 'classic-light';
            } catch (e) {
                console.warn('Could not parse profile theme settings:', e);
            }
        }
        
        // Apply initial theme class
        document.body.classList.remove('theme-classic-light', 'theme-deep-dark', 'theme-cyber-neon', 'theme-frosted-blue');
        document.body.classList.add(`theme-${theme}`);
        
        if (theme === 'deep-dark' || theme === 'cyber-neon') {
            document.body.classList.replace('light-mode', 'dark-mode');
        } else {
            document.body.classList.replace('dark-mode', 'light-mode');
        }
    };

    // 2. Register Service Worker for PWA compliance (Offline Capability)
    const registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            if (isLocalhost) {
                // Instantly unregister service worker on localhost to prevent dev-server caching lags
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (let registration of registrations) {
                        registration.unregister();
                        console.log('Unregistered active Service Worker on localhost for maximum dev performance.');
                    }
                });
                return;
            }

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
