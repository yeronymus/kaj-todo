// src/models/BaseModel.js
import EventEmitter from './EventEmitter.js';

/**
 * Base Model extending EventEmitter.
 * Handles automatic serialization and persistence to LocalStorage.
 */
export default class BaseModel extends EventEmitter {
    /**
     * @param {string} storageKey - Key used for LocalStorage operations
     */
    constructor(storageKey) {
        super();
        this.storageKey = storageKey;
    }

    /**
     * Loads state from LocalStorage.
     * @param {*} defaultState - Default state to fallback to if empty
     * @returns {*} Loaded state
     */
    load(defaultState) {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : defaultState;
        } catch (e) {
            console.error(`Error loading state for key "${this.storageKey}":`, e);
            return defaultState;
        }
    }

    /**
     * Saves state to LocalStorage.
     * @param {*} state - State to serialize and save
     */
    save(state) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(state));
            this.emit('change', state);
        } catch (e) {
            console.error(`Error saving state for key "${this.storageKey}":`, e);
        }
    }
}
