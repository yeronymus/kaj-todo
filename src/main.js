// src/main.js
import './style.scss';

// Základní event naslouchající dokončení načtení DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('TickTick Clone nastartován');

    // Inicializace jednoduchého přepínání Dark/Light mode (localStorage)
    const initTheme = () => {
        const themeBtn = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        if(currentTheme === 'dark') {
            document.body.classList.replace('light-mode', 'dark-mode');
        }

        themeBtn.addEventListener('click', () => {
            if (document.body.classList.contains('light-mode')) {
                document.body.classList.replace('light-mode', 'dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.replace('dark-mode', 'light-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    };

    // Inicializace jednoduchého klienta routeru (History API)
    const initRouter = () => {
        const navLinks = document.querySelectorAll('#main-nav a');
        const routerView = document.getElementById('router-view');

        const renderRoute = (path) => {
            // Zde později budeme propojovat View Controller
            routerView.innerHTML = `<h2>${path === '/' ? 'Inbox' : path.substring(1)}</h2><p>Zde bude obsah dané sekce...</p>`;
        };

        // Zachycení kliknutí na odkazy
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = e.target.getAttribute('data-route');
                
                // History API: pushState
                window.history.pushState({ path }, "", path);
                renderRoute(path);
            });
        });

        // Zachycení tlačítek zpět/vpřed v prohlížeči (popstate)
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.path) {
                renderRoute(e.state.path);
            } else {
                renderRoute('/');
            }
        });

        // Úvodní render
        renderRoute(window.location.pathname);
    };

    initTheme();
    initRouter();
});
