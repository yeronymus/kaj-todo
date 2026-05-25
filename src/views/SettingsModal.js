// src/views/SettingsModal.js
import { showConfirm, showAlert } from '../utils/dialogs.js';

/**
 * `<settings-modal>` Web Component encapsulated in Shadow DOM.
 * Manages user profile customization, PWA installation state, keyboard shortcuts help, and Pomodoro configurations.
 */
export default class SettingsModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.activeTab = 'profile';
        
        // PWA installer deferred prompt reference
        this.deferredPrompt = null;

        // Load profile data with safe defaults
        this.profile = this._loadProfile();
    }

    connectedCallback() {
        this.render();
        this._applyTheme(this.profile.theme); // Apply theme on load!
        this._setupPWAInstaller();
    }

    /**
     * Display the Settings modal.
     */
    open() {
        this.render();
        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        overlay.classList.add('open');
        this.setAttribute('aria-hidden', 'false');
        this._setupListeners();
    }

    /**
     * Close the settings modal.
     */
    close() {
        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        if (overlay) {
            overlay.classList.remove('open');
        }
        this.setAttribute('aria-hidden', 'true');
    }

    /**
     * Set the PWA installer deferred prompt.
     * @param {Event} promptEvent 
     */
    setDeferredPrompt(promptEvent) {
        this.deferredPrompt = promptEvent;
        // Re-render System tab if active to show PWA installer button
        if (this.activeTab === 'system') {
            this.render();
            this._setupListeners();
        }
    }

    /**
     * Load settings from LocalStorage.
     * @private
     */
    _loadProfile() {
        try {
            const currentUser = localStorage.getItem('todozen_current_user');
            const key = currentUser ? `todozen_profile_${currentUser}` : 'todozen_profile';
            const data = localStorage.getItem(key);
            if (data) return JSON.parse(data);
        } catch (e) {
            console.error('Error loading settings profile:', e);
        }
        const currentUser = localStorage.getItem('todozen_current_user') || 'anonymous';
        return {
            username: currentUser === 'teacher' ? 'KAJ Grading Teacher' : currentUser, // Dynamic profile name
            avatar: '', // Base64 data representation
            premium: true, // Default to true for premium TickTick experience!
            theme: 'classic-light',
            pomodoroWork: 25,
            pomodoroBreak: 5
        };
    }

    /**
     * Save settings to LocalStorage.
     * @private
     */
    _saveProfile() {
        try {
            const currentUser = localStorage.getItem('todozen_current_user');
            const key = currentUser ? `todozen_profile_${currentUser}` : 'todozen_profile';
            localStorage.setItem(key, JSON.stringify(this.profile));
            // Propagate theme classes to body
            this._applyTheme(this.profile.theme);
            // Dispatch dynamic settings alteration event
            this.dispatchEvent(new CustomEvent('settingsChanged', {
                detail: this.profile,
                bubbles: true,
                composed: true
            }));
        } catch (e) {
            console.error('Error saving settings profile:', e);
        }
    }

    /**
     * Applies theme classes directly onto the document body.
     * @private
     */
    _applyTheme(themeKey) {
        // Strip out existing theme classes
        document.body.classList.remove('theme-classic-light', 'theme-deep-dark', 'theme-cyber-neon', 'theme-frosted-blue');
        
        // Add active class
        document.body.classList.add(`theme-${themeKey}`);
        
        // Sync light/dark mode root classes
        if (themeKey === 'deep-dark' || themeKey === 'cyber-neon') {
            document.body.classList.replace('light-mode', 'dark-mode');
        } else {
            document.body.classList.replace('dark-mode', 'light-mode');
        }
    }

    /**
     * Installs event listener hooks for standard PWA beforeinstallprompts.
     * @private
     */
    _setupPWAInstaller() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            if (this.activeTab === 'system') {
                this.render();
                this._setupListeners();
            }
        });
    }

    /**
     * Render the component HTML in Shadow DOM.
     */
    render() {
        const p = this.profile;
        const avatarSrc = p.avatar || 'https://img.icons8.com/color/96/000000/circled-user-male-skin-type-1-2.png';
        const isOpen = this.getAttribute('aria-hidden') === 'false';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --primary-color: #6c5ce7;
                    --text-main: #2d3436;
                    --text-muted: #636e72;
                    --border-color: rgba(0, 0, 0, 0.1);
                    --panel-bg: #ffffff;
                    --border-radius: 16px;
                }

                :host-context(.dark-mode) {
                    --text-main: #f5f6fa;
                    --text-muted: #a4b0be;
                    --border-color: rgba(255, 255, 255, 0.1);
                    --panel-bg: #1e1e2f;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(10px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 99999;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .modal-overlay.open {
                    opacity: 1;
                    visibility: visible;
                }

                .settings-card {
                    width: 680px;
                    height: 520px;
                    background: var(--panel-bg);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                    display: flex;
                    overflow: hidden;
                }

                /* Left Tabs Sidebar */
                .settings-sidebar {
                    width: 200px;
                    background: rgba(0, 0, 0, 0.02);
                    border-right: 1px solid var(--border-color);
                    padding: 24px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .sidebar-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    margin-bottom: 20px;
                    padding-left: 8px;
                }

                .tab-btn {
                    width: 100%;
                    padding: 10px 14px;
                    border: none;
                    background: transparent;
                    color: var(--text-main);
                    font-family: inherit;
                    font-weight: 600;
                    text-align: left;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.2s;
                }

                .tab-btn:hover {
                    background: rgba(0,0,0,0.04);
                }

                .tab-btn.active {
                    background: var(--primary-color);
                    color: white;
                }

                /* Right Content Area */
                .settings-content {
                    flex: 1;
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                }

                .tab-pane {
                    display: none;
                    flex-direction: column;
                    gap: 18px;
                    height: 100%;
                }

                .tab-pane.active {
                    display: flex;
                }

                .content-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 14px;
                    margin-bottom: 8px;
                }

                .content-header h3 {
                    margin: 0;
                    font-size: 1.3rem;
                    font-weight: 700;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 1.3rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .close-btn:hover {
                    background: rgba(0,0,0,0.05);
                    color: #d63031;
                }

                /* Input Elements styling */
                .setting-row {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .setting-row label {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                .setting-row input[type="text"], .setting-row select {
                    padding: 10px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: rgba(255,255,255,0.05);
                    color: var(--text-main);
                    font-family: inherit;
                    font-size: 0.95rem;
                    outline: none;
                }

                .avatar-section {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 10px;
                }

                .avatar-preview {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid var(--primary-color);
                    position: relative;
                }

                .avatar-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .upload-btn {
                    padding: 8px 16px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                .upload-btn:hover {
                    background: #5b4bc4;
                }

                .checkbox-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 600;
                }

                .checkbox-row input {
                    width: 18px;
                    height: 18px;
                    accent-color: var(--primary-color);
                    cursor: pointer;
                }

                /* Themes Grid Layout */
                .themes-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .theme-card {
                    padding: 16px;
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    transition: all 0.2s;
                }

                .theme-card.active {
                    border-color: var(--primary-color);
                    background: rgba(108, 92, 231, 0.05);
                }

                .theme-preview-colors {
                    display: flex;
                    gap: 6px;
                    margin-top: 4px;
                }

                .preview-dot {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                }

                /* Shortcuts Table layout */
                .shortcuts-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }

                .shortcuts-table th, .shortcuts-table td {
                    padding: 8px 12px;
                    text-align: left;
                    border-bottom: 1px solid var(--border-color);
                }

                .shortcuts-table th {
                    font-weight: 700;
                    color: var(--text-muted);
                }

                .shortcut-key {
                    background: rgba(0, 0, 0, 0.05);
                    border: 1px solid var(--border-color);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-weight: bold;
                }

                /* Action Footer */
                .settings-footer {
                    margin-top: auto;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    border-top: 1px solid var(--border-color);
                    padding-top: 16px;
                }

                .btn-save {
                    padding: 10px 20px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                .btn-save:hover { background: #5b4bc4; }

                .btn-danger {
                    padding: 10px 16px;
                    background: #d63031;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                .btn-danger:hover { background: #b82324; }

                .btn-pwa {
                    padding: 10px 16px;
                    background: #00b894;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                }
                .btn-pwa:hover:not(:disabled) { background: #009678; }
                .btn-pwa:disabled {
                    background: var(--border-color);
                    color: var(--text-muted);
                    cursor: not-allowed;
                    opacity: 0.6;
                }


                .slider-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .slider-group input {
                    flex: 1;
                    accent-color: var(--primary-color);
                }
            </style>
            
            <div class="modal-overlay ${isOpen ? 'open' : ''}">
                <div class="settings-card">
                    
                    <!-- Left Sidebar Menu -->
                    <aside class="settings-sidebar">
                        <div class="sidebar-title">Settings</div>
                        <button class="tab-btn ${this.activeTab === 'profile' ? 'active' : ''}" data-tab="profile">
                            👤 Profile
                        </button>
                        <button class="tab-btn ${this.activeTab === 'themes' ? 'active' : ''}" data-tab="themes">
                            🎨 Themes
                        </button>
                        <button class="tab-btn ${this.activeTab === 'focus' ? 'active' : ''}" data-tab="focus">
                            ⏱️ Focus Settings
                        </button>
                        <button class="tab-btn ${this.activeTab === 'shortcuts' ? 'active' : ''}" data-tab="shortcuts">
                            ⌨️ Shortcuts
                        </button>
                        <button class="tab-btn ${this.activeTab === 'system' ? 'active' : ''}" data-tab="system">
                            ⚙️ System
                        </button>
                    </aside>

                    <!-- Right Pane View Container -->
                    <main class="settings-content">
                        <div class="content-header">
                            <h3>${this._getTabTitle()}</h3>
                            <button type="button" class="close-btn" id="close-settings-btn" title="Close Settings">×</button>
                        </div>

                        <!-- PROFILE TAB -->
                        <section class="tab-pane ${this.activeTab === 'profile' ? 'active' : ''}" id="pane-profile">
                            <div class="avatar-section">
                                <div class="avatar-preview">
                                    <img src="${avatarSrc}" id="avatar-img-preview" alt="User Profile Avatar" />
                                </div>
                                <button type="button" class="upload-btn" id="upload-avatar-btn">Upload Avatar Image</button>
                                <input type="file" id="settings-avatar-input" accept="image/*" style="display: none;" />
                            </div>

                            <div class="setting-row">
                                <label for="settings-username">Display Username</label>
                                <input type="text" id="settings-username" placeholder="Enter username..." value="${this._escapeHTML(p.username)}" />
                            </div>

                            <div class="checkbox-row" style="margin-top: 10px;">
                                <input type="checkbox" id="settings-premium" ${p.premium ? 'checked' : ''} />
                                <label for="settings-premium">🏅 Gold Premium Account Badge</label>
                            </div>

                            <div class="settings-footer">
                                <button type="button" class="btn-save" id="save-profile-btn">Apply Settings</button>
                            </div>
                        </section>

                        <!-- THEMES TAB -->
                        <section class="tab-pane ${this.activeTab === 'themes' ? 'active' : ''}" id="pane-themes">
                            <div class="themes-grid">
                                <div class="theme-card ${p.theme === 'classic-light' ? 'active' : ''}" data-theme="classic-light">
                                    <span>Classic Light</span>
                                    <div class="theme-preview-colors">
                                        <div class="preview-dot" style="background:#f5f7fb;"></div>
                                        <div class="preview-dot" style="background:#6c5ce7;"></div>
                                    </div>
                                </div>

                                <div class="theme-card ${p.theme === 'deep-dark' ? 'active' : ''}" data-theme="deep-dark">
                                    <span>Deep Dark</span>
                                    <div class="theme-preview-colors">
                                        <div class="preview-dot" style="background:#09090e;"></div>
                                        <div class="preview-dot" style="background:#8f7eff;"></div>
                                    </div>
                                </div>

                                <div class="theme-card ${p.theme === 'cyber-neon' ? 'active' : ''}" data-theme="cyber-neon">
                                    <span>Cyber Neon</span>
                                    <div class="theme-preview-colors">
                                        <div class="preview-dot" style="background:#0a0e17;"></div>
                                        <div class="preview-dot" style="background:#ff007f;"></div>
                                    </div>
                                </div>

                                <div class="theme-card ${p.theme === 'frosted-blue' ? 'active' : ''}" data-theme="frosted-blue">
                                    <span>Frosted Blue</span>
                                    <div class="theme-preview-colors">
                                        <div class="preview-dot" style="background:#ebf3fa;"></div>
                                        <div class="preview-dot" style="background:#0984e3;"></div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- FOCUS TAB -->
                        <section class="tab-pane ${this.activeTab === 'focus' ? 'active' : ''}" id="pane-focus">
                            <div class="setting-row">
                                <label for="focus-work-slider">Pomodoro Focus Time: <span id="focus-work-value">${p.pomodoroWork}</span> mins</label>
                                <div class="slider-group">
                                    <input type="range" id="focus-work-slider" min="15" max="60" step="5" value="${p.pomodoroWork}" />
                                </div>
                            </div>

                            <div class="setting-row">
                                <label for="focus-break-slider">Break Time: <span id="focus-break-value">${p.pomodoroBreak}</span> mins</label>
                                <div class="slider-group">
                                    <input type="range" id="focus-break-slider" min="3" max="15" step="1" value="${p.pomodoroBreak}" />
                                </div>
                            </div>

                            <div class="settings-footer">
                                <button type="button" class="btn-save" id="save-focus-btn">Save Configurations</button>
                            </div>
                        </section>

                        <!-- SHORTCUTS TAB -->
                        <section class="tab-pane ${this.activeTab === 'shortcuts' ? 'active' : ''}" id="pane-shortcuts">
                            <table class="shortcuts-table">
                                <thead>
                                    <tr>
                                        <th>Hotkeys</th>
                                        <th>Target Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><span class="shortcut-key">N</span></td>
                                        <td>Add new Focus / Task detail dialog popup</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">I</span></td>
                                        <td>Navigate to Inbox Workspace list</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">M</span></td>
                                        <td>Navigate to Eisenhower quadrant matrix</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">H</span></td>
                                        <td>Navigate to Habit checklist tracker dashboard</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">F</span></td>
                                        <td>Navigate to full-screen Pomodoro Focus space</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">S</span></td>
                                        <td>Toggle Profile settings menu</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">Space</span></td>
                                        <td>Start / Pause timer cycle inside Focus screen</td>
                                    </tr>
                                    <tr>
                                        <td><span class="shortcut-key">Esc</span></td>
                                        <td>Close overlay dialogs / editors</td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        <!-- SYSTEM TAB -->
                        <section class="tab-pane ${this.activeTab === 'system' ? 'active' : ''}" id="pane-system">
                            <div class="setting-row">
                                <label>Install Mobile / Desktop App</label>
                                <p style="font-size:0.9rem; color:var(--text-muted);">Install TodoZen directly onto your desktop or mobile screen for offline standalone capabilities.</p>
                                <div style="margin-top:5px;">
                                    <button type="button" class="btn-pwa" id="pwa-install-btn" ${this.deferredPrompt ? '' : 'disabled'}>
                                        ${this.deferredPrompt ? '📲 Install App Standalone' : '📲 Standalone App Ready (Offline Shell)'}
                                    </button>
                                </div>
                            </div>

                            <div class="setting-row" style="margin-top:20px;">
                                <label>Log Out Session</label>
                                <p style="font-size:0.9rem; color:var(--text-muted);">Logout from current user account workspace. All local data is securely saved in your browser storage.</p>
                                <div style="margin-top:5px;">
                                    <button type="button" class="btn-save" id="logout-session-btn" style="background:var(--accent-color);">🔒 Log Out Account</button>
                                </div>
                            </div>

                            <div class="setting-row" style="margin-top:20px;">
                                <label>Factory Reset Storage</label>
                                <p style="font-size:0.9rem; color:var(--text-muted);">Permanently purge all lists, active/archived tasks, and calendar database check-ins.</p>
                                <div style="margin-top:5px;">
                                    <button type="button" class="btn-danger" id="factory-reset-btn">Purge Database forever</button>
                                </div>
                            </div>
                        </section>

                    </main>

                </div>
            </div>
        `;
    }

    /**
     * Map active pane title.
     * @private
     */
    _getTabTitle() {
        switch (this.activeTab) {
            case 'profile': return 'User Profile Configurations';
            case 'themes': return 'Manage Color Themes';
            case 'focus': return 'Pomodoro Focus Cycles';
            case 'shortcuts': return 'Interactive Keyboard Shortcuts';
            case 'system': return 'System Settings';
            default: return 'Settings';
        }
    }

    /**
     * Escape string to avoid HTML Attribute Injection / XSS.
     * @private
     */
    _escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    /**
     * Bind listeners in shadow root.
     * @private
     */
    _setupListeners() {
        const shadow = this.shadowRoot;

        // Close modal
        shadow.querySelector('#close-settings-btn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.close();
        });
        shadow.querySelector('.modal-overlay').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.target === shadow.querySelector('.modal-overlay')) this.close();
        });

        // Tab selection logic
        shadow.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.activeTab = btn.getAttribute('data-tab');
                this.render();
                this._setupListeners();
            });
        });

        // --- PROFILE TAB HANDLERS ---
        if (this.activeTab === 'profile') {
            const fileInput = shadow.querySelector('#settings-avatar-input');
            const uploadBtn = shadow.querySelector('#upload-avatar-btn');
            
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (!file.type.startsWith('image/')) {
                    showAlert('File Error', 'Only image avatars are allowed.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (ev) => {
                    this.profile.avatar = ev.target.result;
                    shadow.querySelector('#avatar-img-preview').src = ev.target.result;
                };
                reader.readAsDataURL(file);
            });

            shadow.querySelector('#save-profile-btn').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const usernameInput = shadow.querySelector('#settings-username');
                const premiumCheckbox = shadow.querySelector('#settings-premium');

                if (!usernameInput.value.trim()) {
                    showAlert('Validation Error', 'Username cannot be empty.');
                    return;
                }

                this.profile.username = usernameInput.value.trim();
                this.profile.premium = premiumCheckbox.checked;

                this._saveProfile();
                this.close();
                showAlert('Success', 'Profile updated successfully!');
            });
        }

        // --- THEMES TAB HANDLERS ---
        if (this.activeTab === 'themes') {
            shadow.querySelectorAll('.theme-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const themeKey = card.getAttribute('data-theme');
                    this.profile.theme = themeKey;
                    
                    this._saveProfile();
                    this.render();
                    this._setupListeners();
                });
            });
        }

        // --- FOCUS TAB HANDLERS ---
        if (this.activeTab === 'focus') {
            const workSlider = shadow.querySelector('#focus-work-slider');
            const breakSlider = shadow.querySelector('#focus-break-slider');
            const workVal = shadow.querySelector('#focus-work-value');
            const breakVal = shadow.querySelector('#focus-break-value');

            workSlider.addEventListener('input', (e) => {
                workVal.textContent = e.target.value;
            });

            breakSlider.addEventListener('input', (e) => {
                breakVal.textContent = e.target.value;
            });

            shadow.querySelector('#save-focus-btn').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                this.profile.pomodoroWork = parseInt(workSlider.value);
                this.profile.pomodoroBreak = parseInt(breakSlider.value);

                this._saveProfile();
                this.close();
                showAlert('Success', 'Focus timer cycles updated successfully!');
            });
        }

        // --- SYSTEM TAB HANDLERS ---
        if (this.activeTab === 'system') {
            // PWA installer trigger
            const pwaBtn = shadow.querySelector('#pwa-install-btn');
            if (pwaBtn && this.deferredPrompt) {
                pwaBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    pwaBtn.disabled = true;
                    this.deferredPrompt.prompt();
                    this.deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the PWA install prompt');
                            this.deferredPrompt = null;
                            this.render();
                            this._setupListeners();
                        } else {
                            console.log('User dismissed the PWA install prompt');
                            pwaBtn.disabled = false;
                        }
                    });
                });
            }

            // Log Out Session
            const logoutBtn = shadow.querySelector('#logout-session-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    showConfirm('Log Out', 'Are you sure you want to log out of your session?').then((confirmed) => {
                        if (confirmed) {
                            localStorage.removeItem('todozen_current_user');
                            window.location.reload();
                        }
                    });
                });
            }

            // Factory reset
            shadow.querySelector('#factory-reset-btn').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                showConfirm('Factory Reset', 'CRITICAL WARNING: This will permanently erase all data, lists, habits, and tasks from this application. This cannot be undone! Proceed?').then((confirmed) => {
                    if (confirmed) {
                        localStorage.clear();
                        window.location.reload();
                    }
                });
            });
        }
    }
}

// Register SettingsModal custom element
if (!customElements.get('settings-modal')) {
    customElements.define('settings-modal', SettingsModal);
}
