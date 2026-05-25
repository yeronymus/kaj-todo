// src/models/BaseModel.js
import EventEmitter from './EventEmitter.js';

/**
 * Base Model extending EventEmitter.
 * Handles dynamic user-scoped serialization and persistence to LocalStorage.
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
     * Dynamically resolve storage key prefix based on logged in user session.
     * @returns {string} Fully qualified LocalStorage key
     */
    getEffectiveKey() {
        const currentUser = localStorage.getItem('todozen_current_user');
        if (currentUser) {
            return `todozen_user_${currentUser}_${this.storageKey}`;
        }
        return `todozen_anonymous_${this.storageKey}`;
    }

    /**
     * Loads state from LocalStorage.
     * @param {*} defaultState - Default state to fallback to if empty
     * @returns {*} Loaded state
     */
    load(defaultState) {
        const key = this.getEffectiveKey();
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultState;
        } catch (e) {
            console.error(`Error loading state for key "${key}":`, e);
            return defaultState;
        }
    }

    /**
     * Saves state to LocalStorage.
     * @param {*} state - State to serialize and save
     */
    save(state) {
        const key = this.getEffectiveKey();
        try {
            localStorage.setItem(key, JSON.stringify(state));
            this.emit('change', state);
        } catch (e) {
            console.error(`Error saving state for key "${key}":`, e);
        }
    }
}
