// src/controllers/AppController.js
import TaskModel from '../models/TaskModel.js';
import HabitModel from '../models/HabitModel.js';
import PomodoroModel from '../models/PomodoroModel.js';

import Router from '../router.js';

import InboxView from '../views/InboxView.js';
import MatrixView from '../views/MatrixView.js';
import HabitsView from '../views/HabitsView.js';
import PomodoroView from '../views/PomodoroView.js';

import '../views/TaskModal.js';
import '../views/SettingsModal.js';

import { showConfirm, showAlert } from '../utils/dialogs.js';

/**
 * AppController orchestrates the entire application lifecycle, linking MVC components, PWA installs, and key down hotkeys.
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
        this.settingsModal = document.getElementById('settings-modal');

        this.currentView = null;
        this.currentListId = 'inbox'; // Selected active list category ID

        // 3. Custom lists observers
        this.taskModel.on('listsChanged', (lists) => this._renderCustomLists(lists));
        this.taskModel.on('listDeleted', () => {
            this._renderCustomLists(this.taskModel.getAllLists());
            this._updateSmartListCounts();
        });

        // 4. Setup Router
        this.router = new Router();
        this._setupRoutes();

        // 5. Setup Offline / Online triggers
        this._setupConnectionMonitoring();
    }

    /**
     * Launch the routing engine and register global window observers.
     */
    start() {
        // Authenticate check
        const currentUser = localStorage.getItem('todozen_current_user');
        if (!currentUser) {
            this._showLoginOverlay();
            return;
        }

        // Display authenticated workspace layout grid
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.style.display = 'grid';
        }

        this._renderCustomLists(this.taskModel.getAllLists());
        this._renderTags();
        this._renderFilters();
        this._setupSidebarNav();
        this._setupDesktopUIControls();
        this._setupKeyboardShortcuts();
        
        // Initial profile sync
        const profile = this.settingsModal.profile;
        this._updateProfileUI(profile);
        
        // Sync durations in pomodoro model from profile defaults
        this.pomodoroModel.configureDurations(profile.pomodoroWork, profile.pomodoroBreak);

        // Bind settings adjustments
        this.settingsModal.addEventListener('settingsChanged', (e) => {
            this._updateProfileUI(e.detail);
            this.pomodoroModel.configureDurations(e.detail.pomodoroWork, e.detail.pomodoroBreak);
        });

        // Dynamic model counts listeners
        const triggerCountsUpdate = () => {
            this._updateSmartListCounts();
            this._renderTags();
        };

        this.taskModel.on('taskAdded', triggerCountsUpdate);
        this.taskModel.on('taskUpdated', triggerCountsUpdate);
        this.taskModel.on('taskDeleted', triggerCountsUpdate);
        this.taskModel.on('listDeleted', triggerCountsUpdate);

        this.router.start();
        
        // Initial counts update
        triggerCountsUpdate();
    }

    /**
     * Display a premium glassmorphic authentication screen before accessing the workspace.
     * @private
     */
    _showLoginOverlay() {
        // Hide the main application container to isolate the login UI
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.style.display = 'none';
        }

        // Auto-seed teacher evaluator account in mock account database
        const accounts = JSON.parse(localStorage.getItem('todozen_accounts') || '[]');
        if (!accounts.some(acc => acc.username === 'teacher')) {
            accounts.push({ username: 'teacher', password: 'kaj' });
            localStorage.setItem('todozen_accounts', JSON.stringify(accounts));
        }

        // Construct the login overlay container
        const overlay = document.createElement('div');
        overlay.className = 'login-overlay';
        overlay.innerHTML = `
            <div class="login-card">
                <div class="login-brand">
                    <div class="brand-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;color:white;">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h1>TodoZen</h1>
                    <p>A premium task management & focus dashboard</p>
                </div>

                <div class="login-tabs">
                    <button type="button" class="login-tab-btn active" data-tab="login">Sign In</button>
                    <button type="button" class="login-tab-btn" data-tab="register">Sign Up</button>
                </div>

                <form class="login-form" id="login-auth-form">
                    <div class="login-row">
                        <label for="auth-username">Username</label>
                        <input type="text" id="auth-username" placeholder="Enter your username..." required autocomplete="off" />
                    </div>
                    
                    <div class="login-row">
                        <label for="auth-password">Password</label>
                        <input type="password" id="auth-password" placeholder="Enter your password..." required />
                    </div>

                    <button type="submit" class="btn-submit" id="auth-submit-btn">Sign In Account</button>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        // Bind interactive elements
        let activeTab = 'login';
        const tabBtns = overlay.querySelectorAll('.login-tab-btn');
        const submitBtn = overlay.querySelector('#auth-submit-btn');
        const usernameInput = overlay.querySelector('#auth-username');
        const passwordInput = overlay.querySelector('#auth-password');
        const authForm = overlay.querySelector('#login-auth-form');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeTab = btn.getAttribute('data-tab');

                if (activeTab === 'login') {
                    submitBtn.textContent = 'Sign In Account';
                } else {
                    submitBtn.textContent = 'Create Workspace';
                }
            });
        });

        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = usernameInput.value.trim().toLowerCase();
            const password = passwordInput.value;

            if (!username) {
                showAlert('Validation Error', 'Username cannot be empty.');
                return;
            }

            if (password.length < 3) {
                showAlert('Validation Error', 'Password must be at least 3 characters.');
                return;
            }

            const currentAccounts = JSON.parse(localStorage.getItem('todozen_accounts') || '[]');

            if (activeTab === 'login') {
                const user = currentAccounts.find(u => u.username === username);
                if (user && user.password === password) {
                    localStorage.setItem('todozen_current_user', username);
                    window.location.reload();
                } else {
                    showAlert('Authentication Failed', 'Invalid username or password.');
                }
            } else {
                // Register
                const userExists = currentAccounts.some(u => u.username === username);
                if (userExists) {
                    showAlert('Registration Failed', 'This username is already registered. Please choose another.');
                } else {
                    currentAccounts.push({ username, password });
                    localStorage.setItem('todozen_accounts', JSON.stringify(currentAccounts));
                    localStorage.setItem('todozen_current_user', username);
                    window.location.reload();
                }
            }
        });
    }

    /**
     * Map SPA paths to dynamic rendering actions.
     * @private
     */
    _setupRoutes() {
        // Tasks (Main List View)
        this.router.addRoute('/', () => {
            this._cleanupCurrentView();
            this.currentView = new InboxView(this.routerViewContainer, this.taskModel, this.taskModalElement, this.currentListId);
            this.currentView.render();
            this._updateActiveNav('/');
        });

        // Focus (Pomodoro Space)
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
     * Dynamic counts logic for Smart lists.
     * @private
     */
    _updateSmartListCounts() {
        const tasks = this.taskModel.getAllTasks().filter(t => !t.completed && !t.deleted);
        
        // Today count
        const todayStr = new Date().toLocaleDateString('sv');
        const countToday = tasks.filter(t => t.dueDate === todayStr).length;

        // Next 7 days count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);

        const countNextWeek = tasks.filter(t => {
            if (!t.dueDate) return false;
            const d = new Date(t.dueDate);
            return d >= today && d <= nextWeek;
        }).length;

        // Inbox count
        const countInbox = tasks.filter(t => t.listId === 'inbox').length;

        // Inject to UI
        const todayEl = document.getElementById('count-today');
        const nextEl = document.getElementById('count-next-7-days');
        const inboxEl = document.getElementById('count-inbox');

        if (todayEl) todayEl.textContent = countToday > 0 ? countToday : '0';
        if (nextEl) nextEl.textContent = countNextWeek > 0 ? countNextWeek : '0';
        if (inboxEl) inboxEl.textContent = countInbox > 0 ? countInbox : '0';
    }

    /**
     * Render active tag listings inside middle sidebar.
     * @private
     */
    _renderTags() {
        const container = document.getElementById('tags-container');
        if (!container) return;

        const tags = this.taskModel.getAllTags();

        if (tags.length === 0) {
            container.innerHTML = `<li style="padding: 10px 14px; font-size: 0.85rem; color: var(--text-muted); font-style: italic;">No tags added</li>`;
            return;
        }

        container.innerHTML = tags.map(tag => `
            <li>
                <a href="#" data-tag-name="${tag}" class="${this.currentListId === `tag-${tag}` ? 'active' : ''}">
                    <span class="list-icon">🏷️</span> #${tag}
                </a>
            </li>
        `).join('');
    }

    /**
     * Render standard filters inside sidebar.
     * @private
     */
    _renderFilters() {
        const container = document.getElementById('filters-container');
        if (!container) return;

        const filters = [
            { id: 'priority-high', name: 'High Priority', icon: '🔥' },
            { id: 'has-date', name: 'Has Due Date', icon: '📅' },
            { id: 'has-location', name: 'Has Location', icon: '📍' },
            { id: 'has-image', name: 'Has Images', icon: '🖼️' }
        ];

        container.innerHTML = filters.map(f => `
            <li>
                <a href="#" data-filter-id="${f.id}" class="${this.currentListId === `filter-${f.id}` ? 'active' : ''}">
                    <span class="list-icon">${f.icon}</span> ${f.name}
                </a>
            </li>
        `).join('');
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
                    showConfirm('Delete List', 'Are you sure you want to delete this list and all its tasks?').then((confirmed) => {
                        if (confirmed) {
                            this.taskModel.deleteList(listId);
                            if (this.currentListId === listId) {
                                this._selectList('inbox');
                            }
                        }
                    });
                    return;
                }

                // 2. Select List category (Today, Inbox, Next 7 days, Completed, Trash, or Custom)
                const listLink = e.target.closest('a[data-list-id]');
                if (listLink) {
                    e.preventDefault();
                    const listId = listLink.getAttribute('data-list-id');
                    this._selectList(listId);
                    return;
                }

                // 3. Select Tag filter
                const tagLink = e.target.closest('a[data-tag-name]');
                if (tagLink) {
                    e.preventDefault();
                    const tagName = tagLink.getAttribute('data-tag-name');
                    this._selectList(`tag-${tagName}`);
                    return;
                }

                // 4. Select Filter option
                const filterLink = e.target.closest('a[data-filter-id]');
                if (filterLink) {
                    e.preventDefault();
                    const filterId = filterLink.getAttribute('data-filter-id');
                    this._selectList(`filter-${filterId}`);
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
                        showAlert('Error Creating List', err.message);
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
     * Binds click triggers to the avatar and leftmost bottom-left Sync / Notifications / Settings buttons.
     * @private
     */
    _setupDesktopUIControls() {
        // Open Settings Modal on Avatar click
        document.getElementById('sidebar-profile-btn').addEventListener('click', () => {
            this.settingsModal.open();
        });

        // Open Settings Modal on Settings Cog click
        document.getElementById('sidebar-settings-btn').addEventListener('click', () => {
            this.settingsModal.open();
        });

        // Sync Trigger: Spin animation & toast popup
        const syncBtn = document.getElementById('sidebar-sync-btn');
        syncBtn.addEventListener('click', () => {
            syncBtn.classList.add('rotating');
            
            // Connection Toast popup
            const toast = document.getElementById('connection-toast');
            toast.className = 'toast-notification show online';
            toast.querySelector('.toast-text').textContent = 'Synchronizing tasks and habits data with cloud...';
            toast.querySelector('.toast-icon').textContent = '🔄';

            setTimeout(() => {
                syncBtn.classList.remove('rotating');
                toast.classList.remove('show');
            }, 1200);
        });

        // Notification Bell Trigger
        document.getElementById('sidebar-bell-btn').addEventListener('click', () => {
            const tasks = this.taskModel.getAllTasks().filter(t => !t.completed && !t.deleted);
            const todayStr = new Date().toLocaleDateString('sv');
            const tasksToday = tasks.filter(t => t.dueDate === todayStr);

            const toast = document.getElementById('connection-toast');
            toast.className = 'toast-notification show online';
            toast.querySelector('.toast-icon').textContent = '🔔';
            
            if (tasksToday.length > 0) {
                toast.querySelector('.toast-text').textContent = `Reminder: You have ${tasksToday.length} tasks scheduled for today!`;
            } else {
                toast.querySelector('.toast-text').textContent = 'All clean! No scheduled tasks pending for today.';
            }

            setTimeout(() => toast.classList.remove('show'), 3500);
        });
    }

    /**
     * Binds keyboard shortcuts for extremely modern accessibility and power-user feel.
     * @private
     */
    _setupKeyboardShortcuts() {
        // Recursive helper to get deeply focused element inside Shadow DOM boundaries
        const getDeepActiveElement = (root = document) => {
            const activeEl = root.activeElement;
            if (!activeEl) return null;
            if (activeEl.shadowRoot && activeEl.shadowRoot.activeElement) {
                return getDeepActiveElement(activeEl.shadowRoot);
            }
            return activeEl;
        };

        document.addEventListener('keydown', (e) => {
            const key = e.code;

            // Avoid capturing key events if user is typing in inputs or textareas
            const activeEl = getDeepActiveElement();
            if (activeEl) {
                const activeTag = activeEl.tagName;
                if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeEl.isContentEditable) {
                    return;
                }
            }

            // Block all global keyboard shortcuts if a modal or dialog is open (except Escape to let them close)
            const isSettingsOpen = this.settingsModal && this.settingsModal.getAttribute('aria-hidden') === 'false';
            const isTaskModalOpen = this.taskModalElement && this.taskModalElement.getAttribute('aria-hidden') === 'false';
            const isDialogOpen = document.querySelector('.custom-dialog-overlay');

            if (isSettingsOpen || isTaskModalOpen || isDialogOpen) {
                if (key !== 'Escape') {
                    return;
                }
            }

            // N -> Open New Task Modal
            if (key === 'KeyN') {
                e.preventDefault();
                // Close settings modal if open first
                this.settingsModal.close();
                
                let targetListId = 'inbox';
                let dueDate = '';
                if (this.currentListId !== 'today' && this.currentListId !== 'next-7-days' && this.currentListId !== 'completed' && this.currentListId !== 'trash') {
                    targetListId = this.currentListId;
                }
                if (this.currentListId === 'today') {
                    dueDate = new Date().toLocaleDateString('sv');
                }

                this.taskModalElement.open(null, (taskData) => {
                    this.taskModel.addTask({ ...taskData, listId: targetListId, dueDate });
                });
            }

            // I -> Navigate to Inbox
            else if (key === 'KeyI') {
                e.preventDefault();
                this._selectList('inbox');
            }

            // M -> Navigate to Matrix view
            else if (key === 'KeyM') {
                e.preventDefault();
                this.router.navigate('/matrix');
            }

            // H -> Navigate to Habits view
            else if (key === 'KeyH') {
                e.preventDefault();
                this.router.navigate('/habits');
            }

            // F -> Navigate to Focus Pomodoro space
            else if (key === 'KeyF') {
                e.preventDefault();
                this.router.navigate('/focus');
            }

            // S -> Open Settings profile
            else if (key === 'KeyS') {
                e.preventDefault();
                this.settingsModal.open();
            }

            // Space -> Play/Pause Pomodoro if on focus view
            else if (key === 'Space' && this.router.currentPath === '/focus') {
                e.preventDefault();
                const timerState = this.pomodoroModel.getState();
                if (timerState.isRunning) {
                    this.pomodoroModel.pause();
                } else {
                    this.pomodoroModel.start();
                }
            }

            // Escape -> Close modals
            else if (key === 'Escape') {
                this.settingsModal.close();
                this.taskModalElement.close();
            }
        });
    }

    /**
     * Redraw Profile details in the leftmost sidebar panel.
     * @private
     */
    _updateProfileUI(p) {
        const avatarWrapper = document.getElementById('sidebar-avatar-wrapper');
        const fallbackSvg = document.getElementById('sidebar-avatar-fallback');
        const premiumBadge = document.getElementById('sidebar-premium-badge');

        if (!avatarWrapper) return;

        // Sync Premium Status Gold Badge
        if (p.premium) {
            premiumBadge.style.display = 'block';
            avatarWrapper.style.borderColor = 'var(--warning-color)';
        } else {
            premiumBadge.style.display = 'none';
            avatarWrapper.style.borderColor = 'var(--primary-color)';
        }

        // Sync Custom Avatar FileReader upload image
        let img = avatarWrapper.querySelector('.avatar-img-element');
        if (p.avatar) {
            if (!img) {
                img = document.createElement('img');
                img.className = 'avatar-img-element';
                avatarWrapper.appendChild(img);
            }
            img.src = p.avatar;
            fallbackSvg.style.display = 'none';
        } else {
            if (img) img.remove();
            fallbackSvg.style.display = 'block';
        }
    }

    /**
     * Switch active task category selection and trigger list updates.
     * @private
     */
    _selectList(listId) {
        this.currentListId = listId;

        // Visual update on all sidebar anchors
        const allLinks = document.querySelectorAll('.sidebar a[data-list-id], .sidebar a[data-tag-name], .sidebar a[data-filter-id]');
        allLinks.forEach(link => {
            const hasListId = link.getAttribute('data-list-id') === listId;
            const hasTagName = link.getAttribute('data-tag-name') && `tag-${link.getAttribute('data-tag-name')}` === listId;
            const hasFilterId = link.getAttribute('data-filter-id') && `filter-${link.getAttribute('data-filter-id')}` === listId;

            if (hasListId || hasTagName || hasFilterId) {
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
     * Highlight active navigation sidebar anchor links inside leftmost sidebar.
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
