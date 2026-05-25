// src/views/InboxView.js
import BaseView from './BaseView.js';
import { showConfirm } from '../utils/dialogs.js';

/**
 * InboxView manages standard list-based task operations, custom lists, soft-deleted Trash, Tags, Filters, and binds modal triggers.
 */
export default class InboxView extends BaseView {
    /**
     * @param {HTMLElement} container 
     * @param {TaskModel} taskModel 
     * @param {HTMLElement} modalElement - `<task-modal>` custom element
     * @param {string} listId - Active selected category/list ID
     */
    constructor(container, taskModel, modalElement, listId = 'inbox') {
        super(container);
        this.taskModel = taskModel;
        this.modalElement = modalElement;
        this.listId = listId;
        
        this.currentFilter = 'all'; // 'all', 'active', 'completed'
        
        // Listeners for model changes
        this.unsubscribeAdded = this.taskModel.on('taskAdded', () => this.render());
        this.unsubscribeUpdated = this.taskModel.on('taskUpdated', () => this.render());
        this.unsubscribeDeleted = this.taskModel.on('taskDeleted', () => this.render());
        
        // Listen for list deletion to clean up selected list if it gets deleted
        this.unsubscribeListDeleted = this.taskModel.on('listDeleted', (deletedListId) => {
            if (this.listId === deletedListId) {
                this.listId = 'inbox';
                this.render();
            }
        });
    }

    destroy() {
        this.unsubscribeAdded();
        this.unsubscribeUpdated();
        this.unsubscribeDeleted();
        this.unsubscribeListDeleted();
    }

    /**
     * Set the current active list category.
     * @param {string} listId 
     */
    setList(listId) {
        this.listId = listId;
        this.render();
    }

    /**
     * Set the current active filter.
     * @param {string} filter 
     */
    setFilter(filter) {
        this.currentFilter = filter;
        this.render();
    }

    /**
     * Render the Inbox list view interface.
     */
    render() {
        const tasks = this.taskModel.getAllTasks();
        
        // Determine active category metadata
        let listName = 'Inbox';
        let listIcon = '📥';
        
        if (this.listId === 'today') {
            listName = 'Today';
            listIcon = '📅';
        } else if (this.listId === 'next-7-days') {
            listName = 'Next 7 Days';
            listIcon = '🗓️';
        } else if (this.listId === 'completed') {
            listName = 'Completed';
            listIcon = '☑️';
        } else if (this.listId === 'trash') {
            listName = 'Trash Bin';
            listIcon = '🗑️';
        } else if (this.listId.startsWith('tag-')) {
            const tagName = this.listId.substring(4);
            listName = `Tag: #${tagName}`;
            listIcon = '🏷️';
        } else if (this.listId.startsWith('filter-')) {
            const filterId = this.listId.substring(7);
            listIcon = '⚡️';
            if (filterId === 'priority-high') listName = 'High Priority Tasks';
            else if (filterId === 'has-date') listName = 'Tasks with Due Date';
            else if (filterId === 'has-location') listName = 'Tasks with Location';
            else if (filterId === 'has-image') listName = 'Tasks with Images';
        } else {
            const customList = this.taskModel.getAllLists().find(l => l.id === this.listId);
            if (customList) {
                listName = customList.name;
                listIcon = customList.icon || '📂';
            }
        }

        // --- 1. FILTER TASKS BASED ON SELECTED CATEGORY LIST ID ---
        let filteredTasks = tasks;
        const todayStr = new Date().toLocaleDateString('sv'); // YYYY-MM-DD local format
        
        // Always filter out soft-deleted tasks UNLESS browsing the Trash Bin!
        if (this.listId === 'trash') {
            filteredTasks = tasks.filter(t => t.deleted);
        } else if (this.listId === 'completed') {
            filteredTasks = tasks.filter(t => !t.deleted && t.completed);
        } else if (this.listId === 'today') {
            filteredTasks = tasks.filter(t => !t.deleted && !t.completed && t.dueDate === todayStr);
        } else if (this.listId === 'next-7-days') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);
            nextWeek.setHours(23, 59, 59, 999);

            filteredTasks = tasks.filter(t => {
                if (t.deleted || t.completed || !t.dueDate) return false;
                const d = new Date(t.dueDate);
                return d >= today && d <= nextWeek;
            });
        } else if (this.listId.startsWith('tag-')) {
            const tagName = this.listId.substring(4);
            filteredTasks = tasks.filter(t => !t.deleted && !t.completed && Array.isArray(t.tags) && t.tags.includes(tagName));
        } else if (this.listId.startsWith('filter-')) {
            const filterId = this.listId.substring(7);
            if (filterId === 'priority-high') {
                filteredTasks = tasks.filter(t => !t.deleted && !t.completed && t.priority === 'high');
            } else if (filterId === 'has-date') {
                filteredTasks = tasks.filter(t => !t.deleted && !t.completed && t.dueDate !== '');
            } else if (filterId === 'has-location') {
                filteredTasks = tasks.filter(t => !t.deleted && !t.completed && t.location !== null);
            } else if (filterId === 'has-image') {
                filteredTasks = tasks.filter(t => !t.deleted && !t.completed && t.attachments && t.attachments.length > 0);
            }
        } else {
            // Standard inbox or custom lists
            filteredTasks = tasks.filter(t => !t.deleted && !t.completed && t.listId === this.listId);
        }

        // --- 2. FILTER TASKS BASED ON SUB-FILTERS (All, Active, Completed) ---
        // (Bypass for completed/trash/tag/filter lists to avoid blank states)
        const isUtilityList = this.listId === 'completed' || this.listId === 'trash' || this.listId.startsWith('tag-') || this.listId.startsWith('filter-');
        
        if (!isUtilityList) {
            if (this.currentFilter === 'active') {
                filteredTasks = filteredTasks.filter(t => !t.completed);
            } else if (this.currentFilter === 'completed') {
                // Show completed tasks assigned under this specific category
                filteredTasks = tasks.filter(t => !t.deleted && t.completed && t.listId === this.listId);
            }
        }

        // Sort chronologically (newest first)
        filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const isReadOnlyList = this.listId === 'completed' || this.listId === 'trash';

        const html = `
            <div class="inbox-container">
                <header class="inbox-header">
                    <h2><span class="header-icon">${listIcon}</span> ${listName}</h2>
                    ${isUtilityList ? '' : `
                        <div class="filters">
                            <button class="${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
                            <button class="${this.currentFilter === 'active' ? 'active' : ''}" data-filter="active">Active</button>
                            <button class="${this.currentFilter === 'completed' ? 'active' : ''}" data-filter="completed">Completed</button>
                        </div>
                    `}
                </header>

                ${isReadOnlyList ? '' : `
                    <form class="add-task-form" id="quick-add-form">
                        <input type="text" id="quick-title" placeholder="Add a task to ${listName}... (Press Enter)" required autocomplete="off" />
                        <button type="submit">Add Task</button>
                    </form>
                `}

                <section class="task-list" id="tasks-list-container">
                    ${filteredTasks.length === 0 ? `
                        <div class="empty-state">
                            <svg viewBox="0 0 200 200" class="empty-svg">
                                <defs>
                                    <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#8f7eff" stop-opacity="0.2"/>
                                        <stop offset="100%" stop-color="#6c5ce7" stop-opacity="0.05"/>
                                    </linearGradient>
                                </defs>
                                <circle cx="100" cy="100" r="80" fill="url(#emptyGrad)" />
                                <rect x="70" y="60" width="60" height="80" rx="8" fill="none" stroke="var(--primary-color)" stroke-width="3" />
                                <line x1="80" y1="80" x2="120" y2="80" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" />
                                <line x1="80" y1="95" x2="110" y2="95" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" />
                                <line x1="80" y1="110" x2="100" y2="110" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" />
                                <path d="M140 50 L150 60 L125 85 L115 85 L115 75 Z" fill="var(--warning-color)" />
                                <path d="M115 85 L118 78 L122 82 Z" fill="#2d3436" />
                            </svg>
                            <h3>All clear!</h3>
                            <p>No tasks found in this section.</p>
                        </div>
                    ` : filteredTasks.map(task => this._generateTaskTemplate(task)).join('')}
                </section>
            </div>
        `;

        this.renderHTML(html);
        this._setupListeners();
    }

    /**
     * Template helper for individual task items.
     * Integrates custom buttons if rendering Trash soft-deleted cards.
     * @private
     */
    _generateTaskTemplate(task) {
        // If in Trash list, show Restore / Purge triggers instead of checkboxes
        if (this.listId === 'trash') {
            return `
                <article class="task-item completed" data-id="${task.id}" style="cursor: default;">
                    <div class="task-left">
                        <span class="task-title" style="margin-left: 0;">${this._escapeHTML(task.title)}</span>
                    </div>

                    <div class="task-meta">
                        <button class="btn-restore-task" data-id="${task.id}">♻️ Restore</button>
                        <button class="btn-purge-task" data-id="${task.id}">🗑️ Purge</button>
                    </div>
                </article>
            `;
        }

        const isImportant = task.priority === 'high';
        
        return `
            <article class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-left">
                    <label class="task-checkbox-wrapper">
                        <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''} />
                    </label>
                    <span class="task-title">${this._escapeHTML(task.title)}</span>
                </div>

                <div class="task-meta">
                    ${task.tags && task.tags.length > 0 ? task.tags.map(t => `<span class="task-due-badge" style="background:rgba(108,92,231,0.06); margin-right:4px;">#${t}</span>`).join('') : ''}
                    ${task.location ? '<span title="Location Tagged">📍</span>' : ''}
                    ${task.attachments && task.attachments.length > 0 ? `<span title="${task.attachments.length} Images Attached">🖼️</span>` : ''}
                    ${task.dueDate ? `<span class="task-due-badge" title="Due Date">📅 ${task.dueDate}</span>` : ''}
                    
                    <button class="star-btn ${isImportant ? 'active' : ''}" data-id="${task.id}" title="Toggle High Priority">
                        <svg viewBox="0 0 24 24" id="star-svg-${task.id}">
                            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                        </svg>
                    </button>
                    
                    <button class="delete-btn" data-id="${task.id}" title="Delete Task">×</button>
                </div>
            </article>
        `;
    }

    /**
     * Binds active interactions and Vibration Haptic ticks.
     * @private
     */
    _setupListeners() {
        const container = this.container;

        // Quick add task submit handler
        const form = container.querySelector('#quick-add-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = container.querySelector('#quick-title');
                const title = input.value.trim();
                
                if (title !== '') {
                    let targetListId = 'inbox';
                    let dueDate = '';

                    // Categorize appropriately based on view
                    if (this.listId !== 'today' && this.listId !== 'next-7-days' && this.listId !== 'completed' && this.listId !== 'trash' && !this.listId.startsWith('tag-') && !this.listId.startsWith('filter-')) {
                        targetListId = this.listId;
                    }
                    if (this.listId === 'today') {
                        dueDate = new Date().toLocaleDateString('sv');
                    }

                    this.taskModel.addTask({ title, listId: targetListId, dueDate });
                    input.value = '';
                }
            });
        }

        // Filters handler
        const filtersBtn = container.querySelector('.filters');
        if (filtersBtn) {
            filtersBtn.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-filter]');
                if (btn) {
                    this.setFilter(btn.getAttribute('data-filter'));
                }
            });
        }

        // Event delegation on task list
        const list = container.querySelector('#tasks-list-container');
        if (list) {
            list.addEventListener('click', (e) => {
                const target = e.target;
                
                // 1. Toggle completion checkbox (with Vibration tick!)
                if (target.classList.contains('task-checkbox')) {
                    e.stopPropagation();
                    const id = target.getAttribute('data-id');
                    this.taskModel.toggleTask(id);
                    
                    // Vibration Haptics
                    if (navigator.vibrate) navigator.vibrate(15);
                    return;
                }

                // 2. Toggle importance star with SVG stroke animation (with Vibration tick!)
                const starBtn = target.closest('.star-btn');
                if (starBtn) {
                    e.stopPropagation();
                    const id = starBtn.getAttribute('data-id');
                    const task = this.taskModel.getTaskById(id);
                    const newPriority = task.priority === 'high' ? 'medium' : 'high';
                    
                    const svg = starBtn.querySelector('svg');
                    if (newPriority === 'high') {
                        svg.setAttribute('stroke-width', '1px');
                        svg.setAttribute('fill', 'var(--warning-color)');
                    } else {
                        svg.setAttribute('stroke-width', '2px');
                        svg.setAttribute('fill', 'none');
                    }

                    this.taskModel.updateTask(id, { priority: newPriority });
                    
                    // Vibration Haptics
                    if (navigator.vibrate) navigator.vibrate(15);
                    return;
                }

                // 3. Delete task (Soft-delete!)
                const deleteBtn = target.closest('.delete-btn');
                if (deleteBtn) {
                    e.stopPropagation();
                    const id = deleteBtn.getAttribute('data-id');
                    showConfirm('Move to Trash', 'Delete this task to Trash?').then((confirmed) => {
                        if (confirmed) {
                            this.taskModel.deleteTask(id);
                            if (navigator.vibrate) navigator.vibrate(20);
                        }
                    });
                    return;
                }

                // 4. Restore soft-deleted task from Trash list
                const restoreBtn = target.closest('.btn-restore-task');
                if (restoreBtn) {
                    e.stopPropagation();
                    const id = restoreBtn.getAttribute('data-id');
                    this.taskModel.restoreTask(id);
                    if (navigator.vibrate) navigator.vibrate(15);
                    return;
                }

                // 5. Permanently purge task from Trash list
                const purgeBtn = target.closest('.btn-purge-task');
                if (purgeBtn) {
                    e.stopPropagation();
                    const id = purgeBtn.getAttribute('data-id');
                    showConfirm('Permanent Delete', 'CRITICAL: This will permanently delete this task. Proceed?').then((confirmed) => {
                        if (confirmed) {
                            this.taskModel.deleteTaskPermanently(id);
                            if (navigator.vibrate) navigator.vibrate(30);
                        }
                    });
                    return;
                }

                // 6. Open edit modal when clicking card body (Ignore in Trash)
                if (this.listId !== 'trash') {
                    const card = target.closest('.task-item');
                    if (card) {
                        const id = card.getAttribute('data-id');
                        const task = this.taskModel.getTaskById(id);
                        if (task) {
                            this.modalElement.open(task, (updatedData) => {
                                this.taskModel.updateTask(id, updatedData);
                            });
                        }
                    }
                }
            });

            // Dynamic Hover effects for SVG stars via Javascript (JS SVG 2b)
            list.addEventListener('mouseover', (e) => {
                const starBtn = e.target.closest('.star-btn');
                if (starBtn && !starBtn.classList.contains('active')) {
                    const svg = starBtn.querySelector('svg');
                    svg.setAttribute('stroke-width', '1.5px');
                }
            });

            list.addEventListener('mouseout', (e) => {
                const starBtn = e.target.closest('.star-btn');
                if (starBtn && !starBtn.classList.contains('active')) {
                    const svg = starBtn.querySelector('svg');
                    svg.setAttribute('stroke-width', '2px');
                }
            });
        }
    }

    /**
     * Escape string to avoid HTML Injection / XSS.
     * @private
     */
    _escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
