// src/models/TaskModel.js
import BaseModel from './BaseModel.js';

/**
 * TaskModel manages the list of tasks, attachments, location metadata, and Eisenhower Matrix quadrants.
 */
export default class TaskModel extends BaseModel {
    constructor() {
        super('todozen_tasks');
        this.tasks = this.load([]);
        this.lists = this._loadLists();
    }

    /**
     * Load custom list entries from LocalStorage.
     * @private
     */
    _loadLists() {
        try {
            const data = localStorage.getItem('todozen_custom_lists');
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Error loading custom lists:', e);
        }
        // Defaults matching TickTick screenshot perfectly
        return [
            { id: 'study', name: 'Study', icon: '📝', color: '#74b9ff' },
            { id: 'life', name: 'Life', icon: '🏡', color: '#00b894' },
            { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#ffeaa7' },
            { id: 'wishlist', name: 'Wishlist', icon: '🦄', color: '#a29bfe' },
            { id: 'work', name: 'Work', icon: '💼', color: '#ff7675' }
        ];
    }

    /**
     * Save custom lists to LocalStorage.
     * @private
     */
    _saveLists() {
        try {
            localStorage.setItem('todozen_custom_lists', JSON.stringify(this.lists));
            this.emit('listsChanged', this.lists);
        } catch (e) {
            console.error('Error saving custom lists:', e);
        }
    }

    /**
     * Get all custom lists.
     * @returns {Array} List of all lists
     */
    getAllLists() {
        return this.lists;
    }

    /**
     * Add a new custom list.
     * @param {string} name 
     */
    addList(name) {
        if (!name || name.trim() === '') {
            throw new Error('List name cannot be empty.');
        }
        const id = name.trim().toLowerCase().replace(/\s+/g, '-');
        
        // Prevent duplicate list IDs
        if (this.lists.some(l => l.id === id)) {
            throw new Error('List name already exists.');
        }

        const newList = {
            id,
            name: name.trim(),
            icon: '📂',
            color: '#8f7eff'
        };

        this.lists.push(newList);
        this._saveLists();
        return newList;
    }

    /**
     * Delete a list and all associated tasks.
     * @param {string} id 
     * @returns {boolean} True if deleted
     */
    deleteList(id) {
        const lengthBefore = this.lists.length;
        this.lists = this.lists.filter(l => l.id !== id);

        if (this.lists.length !== lengthBefore) {
            this._saveLists();
            
            // Delete tasks under this list
            const tasksBefore = this.tasks.length;
            this.tasks = this.tasks.filter(t => t.listId !== id);
            if (this.tasks.length !== tasksBefore) {
                this.save(this.tasks);
            }
            this.emit('listDeleted', id);
            return true;
        }
        return false;
    }

    /**
     * Get all tasks.
     * @returns {Array} List of all tasks
     */
    getAllTasks() {
        return this.tasks;
    }

    /**
     * Get a specific task by ID.
     * @param {string} id 
     * @returns {Object|null}
     */
    getTaskById(id) {
        return this.tasks.find(task => task.id === id) || null;
    }

    /**
     * Create and add a new task.
     * @param {Object} taskData 
     * @returns {Object} Added task
     */
    addTask({ title, notes = '', quadrant = 4, priority = 'medium', dueDate = '', location = null, attachments = [], listId = 'inbox' }) {
        if (!title || title.trim() === '') {
            throw new Error('Task title cannot be empty.');
        }

        const newTask = {
            id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : this._generateId(),
            title: title.trim(),
            notes: notes.trim(),
            quadrant: parseInt(quadrant) || 4, // 1 to 4 matching Eisenhower Matrix quadrants
            priority, // 'low', 'medium', 'high'
            completed: false,
            dueDate,
            location, // { latitude, longitude, name }
            attachments, // [{ name, type, data }] (data represents base64 content)
            listId,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.save(this.tasks);
        this.emit('taskAdded', newTask);
        return newTask;
    }

    /**
     * Update an existing task.
     * @param {string} id 
     * @param {Object} updates 
     * @returns {Object|null} Updated task
     */
    updateTask(id, updates) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index === -1) return null;

        const updatedTask = {
            ...this.tasks[index],
            ...updates,
            // Ensure title remains valid if updated
            title: updates.title !== undefined ? updates.title.trim() : this.tasks[index].title
        };

        if (updates.title !== undefined && updatedTask.title === '') {
            throw new Error('Task title cannot be empty.');
        }

        this.tasks[index] = updatedTask;
        this.save(this.tasks);
        this.emit('taskUpdated', updatedTask);
        return updatedTask;
    }

    /**
     * Toggle the completion state of a task.
     * @param {string} id 
     * @returns {Object|null}
     */
    toggleTask(id) {
        const task = this.getTaskById(id);
        if (!task) return null;
        return this.updateTask(id, { completed: !task.completed });
    }

    /**
     * Delete a task.
     * @param {string} id 
     * @returns {boolean} True if deleted
     */
    deleteTask(id) {
        const lengthBefore = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.id !== id);
        
        if (this.tasks.length !== lengthBefore) {
            this.save(this.tasks);
            this.emit('taskDeleted', id);
            return true;
        }
        return false;
    }

    /**
     * Fallback ID generator if crypto.randomUUID is not available.
     * @private
     */
    _generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}
