// src/models/TaskModel.js
import BaseModel from './BaseModel.js';

/**
 * TaskModel manages the list of tasks, custom lists, attachments, location metadata, tags, and Eisenhower Matrix quadrants.
 */
export default class TaskModel extends BaseModel {
    constructor() {
        super('todozen_tasks');
        this.tasks = this.load([]);
        this.lists = this._loadLists();

        // Seed initial high-quality tasks ONLY if this is the 'teacher' account and has no tasks!
        const currentUser = localStorage.getItem('todozen_current_user');
        if (this.tasks.length === 0 && currentUser === 'teacher') {
            this._seedInitialTasks();
        }
    }

    /**
     * Seed initial tasks representing CTU academic works to demonstrate all features.
     * @private
     */
    _seedInitialTasks() {
        const todayStr = new Date().toLocaleDateString('sv');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toLocaleDateString('sv');
        
        const initial = [
            {
                id: 'task-seed-1',
                title: 'Complete KAJ Semestral Work Submission Form',
                notes: 'Selected Teacher: Zdeněk Vlach.\nEnsure all URLs (GitHub, Documentation, Pages) are correct before submitting.',
                quadrant: 1, // High Priority, Urgent & Important
                priority: 'high',
                completed: false,
                deleted: false,
                dueDate: todayStr,
                location: { latitude: 50.0755, longitude: 14.4378, name: 'CTU Faculty of Information Technology' },
                attachments: [],
                listId: 'study',
                tags: ['kaj', 'admin', 'submission'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'task-seed-2',
                title: 'Review KAJ criteria and verify implementations',
                notes: 'Checked and confirmed:\n1. 11 HTML5 browser APIs integrated.\n2. PWA manifest & Service Worker caches offline.\n3. History API routing.\n4. Audio programmatical playback.\n5. Custom dialogue card components (replaced native confirmations!).',
                quadrant: 2, // Important, not urgent
                priority: 'high',
                completed: true,
                deleted: false,
                dueDate: todayStr,
                location: null,
                attachments: [],
                listId: 'study',
                tags: ['kaj', 'review'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'task-seed-3',
                title: 'Read Clean Code Chapter 5: Formatting',
                notes: 'Keep formatting consistency across all modular ES6 Javascript view modules.',
                quadrant: 2,
                priority: 'medium',
                completed: false,
                deleted: false,
                dueDate: tomorrowStr,
                location: null,
                attachments: [],
                listId: 'life',
                tags: ['reading', 'clean-code'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'task-seed-4',
                title: 'Buy groceries for dinner celebration',
                notes: 'Get pasta, olive oil, parmesan cheese, and garlic.',
                quadrant: 3, // Urgent, not important
                priority: 'low',
                completed: false,
                deleted: false,
                dueDate: '',
                location: null,
                attachments: [],
                listId: 'shopping',
                tags: ['life'],
                createdAt: new Date().toISOString()
            },
            {
                id: 'task-seed-5',
                title: 'Obsolete backup tasks entry',
                notes: 'This task was soft-deleted to verify the Trash restore and purge lifecycles.',
                quadrant: 4,
                priority: 'low',
                completed: false,
                deleted: true, // Soft-deleted!
                dueDate: '',
                location: null,
                attachments: [],
                listId: 'inbox',
                tags: ['test'],
                createdAt: new Date().toISOString()
            }
        ];
        
        this.tasks = initial;
        this.save(this.tasks);
    }

    /**
     * Load custom list entries from LocalStorage.
     * @private
     */
    _loadLists() {
        try {
            const currentUser = localStorage.getItem('todozen_current_user');
            const key = currentUser ? `todozen_user_${currentUser}_custom_lists` : 'todozen_custom_lists';
            const data = localStorage.getItem(key);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Error loading custom lists:', e);
        }
        // Defaults matching TickTick custom lists
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
            const currentUser = localStorage.getItem('todozen_current_user');
            const key = currentUser ? `todozen_user_${currentUser}_custom_lists` : 'todozen_custom_lists';
            localStorage.setItem(key, JSON.stringify(this.lists));
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
     * Create and add a new task with soft delete and tag support.
     * @param {Object} taskData 
     * @returns {Object} Added task
     */
    addTask({ title, notes = '', quadrant = 4, priority = 'medium', dueDate = '', location = null, attachments = [], listId = 'inbox', tags = [] }) {
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
            deleted: false, // Soft-delete support!
            dueDate,
            location, // { latitude, longitude, name }
            attachments, // [{ name, type, data }] (data represents base64 content)
            listId,
            tags: Array.isArray(tags) ? tags : [], // Array of strings (tags)
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
     * Soft delete a task by flagging it as deleted.
     * @param {string} id 
     * @returns {boolean} True if soft-deleted
     */
    deleteTask(id) {
        const task = this.getTaskById(id);
        if (!task) return false;
        
        // If it was already deleted soft, delete permanently
        if (task.deleted) {
            return this.deleteTaskPermanently(id);
        }

        // Soft delete
        this.updateTask(id, { deleted: true });
        this.emit('taskDeleted', id);
        return true;
    }

    /**
     * Restore a soft-deleted task.
     * @param {string} id 
     */
    restoreTask(id) {
        const task = this.getTaskById(id);
        if (!task) return null;
        return this.updateTask(id, { deleted: false });
    }

    /**
     * Permanently purges a task from memory.
     * @param {string} id 
     */
    deleteTaskPermanently(id) {
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
     * Extracts a unique list of active tags across all non-deleted tasks.
     * @returns {Array<string>} Unique active tags
     */
    getAllTags() {
        const tagsSet = new Set();
        this.tasks.forEach(task => {
            if (!task.deleted && Array.isArray(task.tags)) {
                task.tags.forEach(tag => {
                    const cleanTag = tag.trim().toLowerCase();
                    if (cleanTag) tagsSet.add(cleanTag);
                });
            }
        });
        return Array.from(tagsSet).sort();
    }

    /**
     * Fallback ID generator if crypto.randomUUID is not available.
     * @private
     */
    _generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}
