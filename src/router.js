// src/router.js

/**
 * SPA client-side router driven by the History API.
 * Configured with a static base path matching Vite's and GitHub Pages' /kaj-todo/ base URL.
 */
export default class Router {
    constructor() {
        this.routes = {};
        this.currentPath = null;
        this.basePath = '/kaj-todo'; // Configured base prefix matching vite.config.js
        
        // Listen to standard popstate back/forward browser events
        window.addEventListener('popstate', () => {
            // Re-resolve route based on the current window pathname
            const path = this._normalizePath(window.location.pathname);
            this._handleRoute(path, false);
        });
    }

    /**
     * Map a path to a callback handler.
     * @param {string} path 
     * @param {Function} handler 
     */
    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    /**
     * Start the routing system and parse the starting URL.
     */
    start() {
        // Intercept all document body clicks for dynamic routes
        document.body.addEventListener('click', (event) => {
            const target = event.target.closest('a[data-route]');
            if (target) {
                event.preventDefault();
                const path = target.getAttribute('data-route');
                this.navigate(path);
            }
        });

        // Resolve current initial path
        const currentPath = window.location.pathname;
        const normalizedPath = this._normalizePath(currentPath);
        this._handleRoute(normalizedPath, true);
    }

    /**
     * Navigate to a route programmatically.
     * @param {string} path 
     */
    navigate(path) {
        if (this.currentPath === path) return;
        this._handleRoute(path, true);
    }

    /**
     * Handles executing the matching router route.
     * @private
     */
    _handleRoute(path, pushToHistory) {
        const handler = this.routes[path] || this.routes['/']; // Fallback to '/'
        this.currentPath = path;

        if (pushToHistory) {
            // Always prepend the base path configuration
            const finalPath = this.basePath + (path === '/' ? '/' : path);
            window.history.pushState({ path }, "", finalPath);
        }

        if (handler) {
            handler();
        }
    }

    /**
     * Strip the configured base path from the URL pathname to retrieve matching route keys.
     * @private
     */
    _normalizePath(fullPath) {
        // Strip trailing slash if present
        let cleanPath = fullPath;
        if (cleanPath.endsWith('/') && cleanPath.length > 1) {
            cleanPath = cleanPath.slice(0, -1);
        }

        if (cleanPath.startsWith(this.basePath)) {
            const subPath = cleanPath.substring(this.basePath.length);
            return subPath === '' ? '/' : subPath;
        }

        return cleanPath || '/';
    }
}
