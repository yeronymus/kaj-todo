// src/views/BaseView.js

/**
 * Base View class containing core rendering and utility methods.
 */
export default class BaseView {
    /**
     * @param {HTMLElement} container - The DOM parent element to render into.
     */
    constructor(container) {
        this.container = container;
    }

    /**
     * Clear container and inject HTML template content.
     * @param {string} htmlTemplate 
     */
    renderHTML(htmlTemplate) {
        this.container.innerHTML = htmlTemplate;
    }

    /**
     * Clean up any active listeners (designed to be overridden by child classes if needed).
     */
    destroy() {
        // Noop by default, children can override to clean up observers or events
    }
}
