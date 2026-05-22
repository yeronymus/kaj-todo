// src/controllers/AppController.js
import TaskModel from '../models/TaskModel.js';
import HabitModel from '../models/HabitModel.js';
import PomodoroModel from '../models/PomodoroModel.js';

import Router from '../router.js';

import InboxView from '../views/InboxView.js';
import MatrixView from '../views/MatrixView.js';
import HabitsView from '../views/HabitsView.js';
import PomodoroView from '../views/PomodoroView.js';

import '../views/TaskModal.js'; // Ensure Web Component is imported/loaded

/**
 * AppController orchestrates the entire application lifecycle, linking MVC components.
 */
export default class AppController {
    constructor() {
        // 1. Models initialization
        this.taskModel = new TaskModel();
        this.habitModel = new HabitModel();
        this.pomodoroModel = new PomodoroModel();

        // 2. DOM Containers Cache
        this.routerViewContainer = document.getElementById('router-view');
        this.taskModalElement = document.getElementById('task-detail-modal');

        this.currentView = null;
        this.currentListId = 'inbox'; // Selected active list category ID

        // 3. Custom lists observers
        this.taskModel.on('listsChanged', (lists) => this._renderCustomLists(lists));
        this.taskModel.on('listDeleted', () => {
            this._renderCustomLists(this.taskModel.getAllLists());
        });

        // 4. Setup Router
        this.router = new Router();
        this._setupRoutes();

        // 5. Setup Offline / Online triggers
        this._setupConnectionMonitoring();
    }

    /**
     * Launch the routing engine.
     */
    start() {
        this._renderCustomLists(this.taskModel.getAllLists());
        this._setupSidebarNav();
        this.router.start();
    }

    /**
     * Map SPA paths to dynamic rendering actions.
     * @private
     */
    _setupRoutes() {
        // Tasks View
        this.router.addRoute('/', () => {
            this._cleanupCurrentView();
            this.currentView = new InboxView(this.routerViewContainer, this.taskModel, this.taskModalElement, this.currentListId || 'inbox');
            this.currentView.render();
            this._updateActiveNav('/');
        });

        // Focus (Pomodoro) View
        this.router.addRoute('/focus', () => {
            this._cleanupCurrentView();
            this.currentView = new PomodoroView(this.routerViewContainer, this.pomodoroModel);
            this.currentView.render();
            this._updateActiveNav('/focus');
        });

        // Eisenhower Matrix View
        this.router.addRoute('/matrix', () => {
            this._cleanupCurrentView();
            this.currentView = new MatrixView(this.routerViewContainer, this.taskModel, this.taskModalElement);
            this.currentView.render();
            this._updateActiveNav('/matrix');
        });

        // Habit Tracker View
        this.router.addRoute('/habits', () => {
            this._cleanupCurrentView();
            this.currentView = new HabitsView(this.routerViewContainer, this.habitModel);
            this.currentView.render();
            this._updateActiveNav('/habits');
        });
    }

    /**
     * Render the custom lists section inside the middle sidebar navigation dynamically.
     * @private
     */
    _renderCustomLists(lists) {
        const container = document.getElementById('custom-lists-container');
        if (!container) return;

        container.innerHTML = lists.map(list => `
            <li class="custom-list-item">
                <a href="#" data-list-id="${list.id}" class="${this.currentListId === list.id ? 'active' : ''}">
                    <span class="list-icon">${list.icon || '📂'}</span>
                    <span class="list-name">${list.name}</span>
                </a>
                <button class="delete-list-btn" data-list-id="${list.id}" title="Delete List">×</button>
            </li>
        `).join('');
    }

    /**
     * Binds events on sidebar links (both smart lists and custom categories) and the new list creator form.
     * @private
     */
    _setupSidebarNav() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.addEventListener('click', (e) => {
                // 1. Delete Custom List category
                const deleteBtn = e.target.closest('.delete-list-btn');
                if (deleteBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const listId = deleteBtn.getAttribute('data-list-id');
                    if (confirm('Are you sure you want to delete this list and all its tasks?')) {
                        this.taskModel.deleteList(listId);
                        if (this.currentListId === listId) {
                            this._selectList('inbox');
                        }
                    }
                    return;
                }

                // 2. Select List category
                const listLink = e.target.closest('a[data-list-id]');
                if (listLink) {
                    e.preventDefault();
                    const listId = listLink.getAttribute('data-list-id');
                    this._selectList(listId);
                    return;
                }
            });
        }

        // List creation controls
        const addListBtn = document.getElementById('add-list-btn');
        const createListForm = document.getElementById('create-list-form');
        const newListInput = document.getElementById('new-list-name');

        if (addListBtn && createListForm) {
            addListBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                createListForm.classList.toggle('hidden');
                if (!createListForm.classList.contains('hidden')) {
                    newListInput.focus();
                }
            });

            createListForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = newListInput.value.trim();
                if (name) {
                    try {
                        const newList = this.taskModel.addList(name);
                        newListInput.value = '';
                        createListForm.classList.add('hidden');
                        this._selectList(newList.id);
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });

            // Auto-hide list creator form when clicking outside
            document.addEventListener('click', (e) => {
                if (!createListForm.contains(e.target) && e.target !== addListBtn) {
                    createListForm.classList.add('hidden');
                }
            });
        }
    }

    /**
     * Switch active task category selection and trigger list updates.
     * @private
     */
    _selectList(listId) {
        this.currentListId = listId;

        // Visual update on all sidebar anchors
        const allLinks = document.querySelectorAll('.sidebar a[data-list-id]');
        allLinks.forEach(link => {
            if (link.getAttribute('data-list-id') === listId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Navigate back to task main workspace if we're on other full screens
        if (this.router.currentPath !== '/') {
            this.router.navigate('/');
        } else {
            // View exists and is InboxView, trigger inner setList transition
            if (this.currentView && typeof this.currentView.setList === 'function') {
                this.currentView.setList(listId);
            }
        }
    }

    /**
     * Clear observers on view change to prevent memory leaks.
     * @private
     */
    _cleanupCurrentView() {
        if (this.currentView) {
            this.currentView.destroy();
            this.currentView = null;
        }
        
        // Always auto-close task detail drawer when changing views for visual cleanliness
        if (this.taskModalElement) {
            this.taskModalElement.close();
        }
    }

    /**
     * Highlight active navigation sidebar anchor links.
     * @private
     */
    _updateActiveNav(activePath) {
        const links = document.querySelectorAll('#mini-nav a');
        links.forEach(link => {
            const route = link.getAttribute('data-route');
            if (route === activePath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Monitor online/offline states and show nice glassmorphic toast notifications.
     * @private
     */
    _setupConnectionMonitoring() {
        const toast = document.getElementById('connection-toast');
        const text = toast.querySelector('.toast-text');
        const icon = toast.querySelector('.toast-icon');

        const showToast = (status, msg) => {
            toast.className = `toast-notification show ${status}`;
            text.textContent = msg;
            icon.textContent = status === 'online' ? '⚡️' : '⚠️';

            setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        };

        window.addEventListener('online', () => {
            showToast('online', 'Connection Restored! Data synchronized offline.');
        });

        window.addEventListener('offline', () => {
            showToast('offline', 'You are offline. Running on local cache.');
        });

        // Trigger initial check if starting offline
        if (!navigator.onLine) {
            setTimeout(() => showToast('offline', 'Starting in offline mode.'), 500);
        }
    }
}
