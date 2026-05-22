// src/models/EventEmitter.js

/**
 * Custom EventEmitter implementing the observer pattern.
 * Enables loose coupling between Models and Views.
 */
export default class EventEmitter {
    constructor() {
        this._events = {};
    }

    /**
     * Subscribe to an event.
     * @param {string} event 
     * @param {Function} listener 
     * @returns {Function} Unsubscribe function
     */
    on(event, listener) {
        if (!this._events[event]) {
            this._events[event] = [];
        }
        this._events[event].push(listener);
        
        // Return unsubscribe function
        return () => this.off(event, listener);
    }

    /**
     * Unsubscribe from an event.
     * @param {string} event 
     * @param {Function} listener 
     */
    off(event, listener) {
        if (!this._events[event]) return;
        this._events[event] = this._events[event].filter(l => l !== listener);
    }

    /**
     * Trigger an event.
     * @param {string} event 
     * @param {*} data 
     */
    emit(event, data) {
        if (!this._events[event]) return;
        this._events[event].forEach(listener => {
            try {
                listener(data);
            } catch (e) {
                console.error(`Error executing listener for event "${event}":`, e);
            }
        });
    }
}
