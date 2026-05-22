// src/router.js

/**
 * SPA client-side router driven by the History API.
 */
export default class Router {
    constructor() {
        this.routes = {};
        this.currentPath = null;
        
        // Listen to standard popstate back/forward browser events
        window.addEventListener('popstate', (event) => {
            const path = event.state && event.state.path ? event.state.path : '/';
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
        
        // Support deploying to github pages under a subpath (e.g. /kaj-todo/)
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
            // Respect browser base path configurations if we are in github pages subfolder
            const isGitHubPages = window.location.hostname.includes('github.io');
            const basePath = isGitHubPages ? window.location.pathname.split('/').slice(0, -1).join('/') : '';
            const finalPath = basePath ? `${basePath}${path}` : path;
            
            window.history.pushState({ path }, "", finalPath);
        }

        if (handler) {
            handler();
        }
    }

    /**
     * Strip base URL subfolders (like GitHub Pages repo names) to match path keys like '/'
     * @private
     */
    _normalizePath(fullPath) {
        const isGitHubPages = window.location.hostname.includes('github.io');
        if (!isGitHubPages) return fullPath;

        // Extracts trailing paths if running under a subdirectory
        const segments = fullPath.split('/');
        // Assuming the repository name is the second segment: /kaj-todo/matrix -> /matrix
        if (segments.length > 2 && segments[1] === 'kaj-todo') {
            return '/' + segments.slice(2).join('/');
        }
        return fullPath;
    }
}
