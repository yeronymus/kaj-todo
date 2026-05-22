// src/views/TaskModal.js

/**
 * `<task-modal>` Web Component encapsulated inside Shadow DOM.
 * Handles task creation/editing details, File API attachments, Geolocation API, and 3D card flips.
 */
export default class TaskModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.task = null;
        this.onSubmitCallback = null;
        this.tempAttachments = [];
        this.tempLocation = null;
    }

    connectedCallback() {
        this.render();
    }

    /**
     * Display the modal for creating a new task or editing an existing one.
     * @param {Object|null} task - Task object if editing, null for creating
     * @param {Function} onSubmit - Callback function on form submission
     */
    open(task = null, onSubmit = null) {
        this.task = task;
        this.onSubmitCallback = onSubmit;
        this.tempAttachments = task ? [...(task.attachments || [])] : [];
        this.tempLocation = task ? task.location : null;

        this.render();

        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        overlay.classList.add('open');
        this.setAttribute('aria-hidden', 'false');

        // Focus the title input for autofocus requirement
        setTimeout(() => {
            const titleInput = this.shadowRoot.querySelector('#task-title');
            if (titleInput) titleInput.focus();
        }, 50);

        this._setupListeners();
    }

    /**
     * Close the modal and reset temporary variables.
     */
    close() {
        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        if (overlay) {
            overlay.classList.remove('open');
        }
        this.setAttribute('aria-hidden', 'true');
        this.task = null;
        this.onSubmitCallback = null;
        this.tempAttachments = [];
        this.tempLocation = null;
    }

    /**
     * Render the template inside Shadow DOM.
     */
    render() {
        const isEditing = !!this.task;
        const title = isEditing ? 'Edit Task' : 'Add New Task';

        // Prepare values
        const taskTitle = this.task ? this.task.title : '';
        const taskNotes = this.task ? this.task.notes : '';
        const taskQuadrant = this.task ? this.task.quadrant : 4;
        const taskPriority = this.task ? this.task.priority : 'medium';
        const taskDueDate = this.task ? this.task.dueDate : '';

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

                /* Dark mode context matching body class */
                :host-context(.dark-mode) {
                    --text-main: #f5f6fa;
                    --text-muted: #a4b0be;
                    --border-color: rgba(255, 255, 255, 0.1);
                    --panel-bg: #1e1e2f;
                }

                .modal-overlay {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: transparent;
                    backdrop-filter: none;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .modal-overlay.open {
                    opacity: 1;
                    visibility: visible;
                }

                /* 3D Card Flip Box Container */
                .flip-container {
                    width: 100%;
                    height: 100%;
                    perspective: 1200px;
                }

                .flip-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transform-style: preserve-3d;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .flip-container.flipped .flip-inner {
                    transform: rotateY(180deg);
                }

                .card-front, .card-back {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    border-radius: 0;
                    background: var(--panel-bg);
                    color: var(--text-main);
                    border: none;
                    box-shadow: none;
                    display: flex;
                    flex-direction: column;
                    padding: 24px;
                    box-sizing: border-box;
                    overflow-y: auto;
                }

                .card-back {
                    transform: rotateY(180deg);
                    background: linear-gradient(135deg, rgba(108, 92, 231, 0.05) 0%, rgba(0,0,0,0) 100%), var(--panel-bg);
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 12px;
                }

                .header h3 {
                    margin: 0;
                    font-size: 1.35rem;
                    font-weight: 700;
                }

                .close-btn, .flip-trigger {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 1.2rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .close-btn:hover {
                    color: #d63031;
                    background: rgba(214, 48, 49, 0.1);
                }

                .flip-trigger:hover {
                    color: var(--primary-color);
                    background: rgba(108, 92, 231, 0.1);
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 12px;
                }

                .form-group label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .form-group input, .form-group textarea, .form-group select {
                    padding: 10px;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: rgba(255,255,255,0.05);
                    color: var(--text-main);
                    font-family: inherit;
                    font-size: 0.95rem;
                    outline: none;
                }

                .form-group textarea {
                    resize: none;
                    height: 60px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                /* File & Location widgets styling */
                .widget-section {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px;
                    border: 1px dashed var(--border-color);
                    border-radius: 8px;
                    margin-bottom: 10px;
                }

                .widget-info {
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .widget-btn {
                    padding: 6px 12px;
                    border: 1px solid var(--border-color);
                    background: rgba(0,0,0,0.02);
                    color: var(--text-main);
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                .widget-btn:hover {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }

                .attachments-preview {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-top: 6px;
                }

                .attachment-thumb {
                    position: relative;
                    width: 50px;
                    height: 50px;
                    border-radius: 6px;
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                }

                .attachment-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .attachment-thumb .remove-attachment {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    background: rgba(0, 0, 0, 0.6);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 16px;
                    height: 16px;
                    font-size: 10px;
                    cursor: pointer;
                    display: grid;
                    place-content: center;
                }

                .footer {
                    margin-top: auto;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    border-top: 1px solid var(--border-color);
                    padding-top: 14px;
                }

                .footer button {
                    padding: 10px 18px;
                    font-family: inherit;
                    font-weight: 600;
                    border-radius: 8px;
                    cursor: pointer;
                    border: none;
                }

                .cancel-btn {
                    background: transparent;
                    color: var(--text-muted);
                    border: 1px solid var(--border-color) !important;
                }

                .submit-btn {
                    background: var(--primary-color);
                    color: white;
                }

                .submit-btn:hover {
                    background: #5b4bc4;
                }

                /* Back Side Specific Styles */
                .metadata-title {
                    font-weight: 700;
                    color: var(--primary-color);
                    font-size: 1.1rem;
                    margin-bottom: 12px;
                }

                .metadata-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 8px;
                }

                .metadata-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                .metadata-value {
                    font-size: 0.95rem;
                    font-weight: 500;
                }

                .map-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--primary-color);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.9rem;
                    margin-top: 6px;
                }

                .map-link:hover {
                    text-decoration: underline;
                }
            </style>
            
            <div class="modal-overlay">
                <div class="flip-container">
                    <div class="flip-inner">
                        
                        <!-- FRONT CARD (Add / Edit Form) -->
                        <form id="task-form" class="card-front" novalidate>
                            <div class="header">
                                <h3>${title}</h3>
                                <button type="button" class="flip-trigger" id="flip-to-back" title="Show Detailed Metadata">
                                    🎴 Info
                                </button>
                            </div>

                            <div class="form-group">
                                <label for="task-title">Task Title *</label>
                                <input type="text" id="task-title" placeholder="What needs to be done?" required value="${taskTitle}" />
                            </div>

                            <div class="form-group">
                                <label for="task-notes">Description Notes</label>
                                <textarea id="task-notes" placeholder="Add descriptive notes...">${taskNotes}</textarea>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="task-priority">Priority</label>
                                    <select id="task-priority">
                                        <option value="low" ${taskPriority === 'low' ? 'selected' : ''}>Low</option>
                                        <option value="medium" ${taskPriority === 'medium' ? 'selected' : ''}>Medium</option>
                                        <option value="high" ${taskPriority === 'high' ? 'selected' : ''}>High</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="task-quadrant">Eisenhower Quadrant</label>
                                    <select id="task-quadrant">
                                        <option value="1" ${taskQuadrant === 1 ? 'selected' : ''}>Q1: Urgent & Important</option>
                                        <option value="2" ${taskQuadrant === 2 ? 'selected' : ''}>Q2: Important & Not Urgent</option>
                                        <option value="3" ${taskQuadrant === 3 ? 'selected' : ''}>Q3: Urgent & Not Important</option>
                                        <option value="4" ${taskQuadrant === 4 ? 'selected' : ''}>Q4: Not Urgent & Not Important</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="task-duedate">Due Date</label>
                                <input type="date" id="task-duedate" value="${taskDueDate}" />
                            </div>

                            <!-- File Attachments Section (File API) -->
                            <div class="widget-section">
                                <div class="widget-info" id="file-widget-text">
                                    Attachments (${this.tempAttachments.length})
                                </div>
                                <button type="button" class="widget-btn" id="attach-file-btn">Upload Image</button>
                                <input type="file" id="task-file-input" accept="image/*" style="display: none;" />
                            </div>
                            <div class="attachments-preview" id="attachments-container"></div>

                            <!-- Geolocation Tagging Section (Geolocation API) -->
                            <div class="widget-section">
                                <div class="widget-info" id="location-widget-text">
                                    ${this.tempLocation ? '📍 Location Tagged' : 'Location Not Set'}
                                </div>
                                <button type="button" class="widget-btn" id="location-btn">
                                    ${this.tempLocation ? 'Update Location' : 'Tag Location'}
                                </button>
                            </div>

                            <div class="footer">
                                <button type="button" class="cancel-btn" id="close-modal-btn">Cancel</button>
                                <button type="submit" class="submit-btn">${isEditing ? 'Save Changes' : 'Create Task'}</button>
                            </div>
                        </form>

                        <!-- BACK CARD (Detailed Metadata View & 3D Flip) -->
                        <div class="card-back">
                            <div class="header">
                                <h3 class="metadata-title">Detailed Metadata</h3>
                                <button type="button" class="flip-trigger" id="flip-to-front" title="Back to Edit">
                                    ✏️ Form
                                </button>
                            </div>

                            <div class="metadata-item">
                                <span class="metadata-label">Task Status</span>
                                <span class="metadata-value">${isEditing && this.task.completed ? '🟢 Completed' : '🔴 Active'}</span>
                            </div>

                            <div class="metadata-item">
                                <span class="metadata-label">Created Timestamp</span>
                                <span class="metadata-value">${isEditing ? new Date(this.task.createdAt).toLocaleString() : 'Saving soon...'}</span>
                            </div>

                            <div class="metadata-item">
                                <span class="metadata-label">Geographic Coordinates</span>
                                <span class="metadata-value" id="meta-coords">
                                    ${this.tempLocation ? `Lat: ${this.tempLocation.latitude.toFixed(6)}, Lng: ${this.tempLocation.longitude.toFixed(6)}` : 'No coordinates tagged.'}
                                </span>
                                ${this.tempLocation ? `
                                    <a class="map-link" href="https://www.google.com/maps/search/?api=1&query=${this.tempLocation.latitude},${this.tempLocation.longitude}" target="_blank">
                                        🌐 View on Google Maps
                                    </a>
                                ` : ''}
                            </div>

                            <div class="metadata-item" style="border-bottom: none; flex-grow: 1;">
                                <span class="metadata-label">Attached Images Preview</span>
                                <div class="attachments-preview" id="meta-attachments" style="margin-top: 10px;">
                                    ${this.tempAttachments.length === 0 ? '<span style="font-size:0.9rem; color:var(--text-muted);">No images attached.</span>' : ''}
                                </div>
                            </div>

                            <div class="footer">
                                <button type="button" class="cancel-btn" id="close-modal-back-btn">Close Info</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;

        this._renderTempAttachments();
    }

    /**
     * Render images from temporary attachments list.
     * @private
     */
    _renderTempAttachments() {
        const container = this.shadowRoot.querySelector('#attachments-container');
        const metaContainer = this.shadowRoot.querySelector('#meta-attachments');
        if (!container) return;

        container.innerHTML = '';
        if (metaContainer && this.tempAttachments.length > 0) {
            metaContainer.innerHTML = '';
        }

        this.tempAttachments.forEach((att, idx) => {
            // Front side thumbs (removable)
            const thumb = document.createElement('div');
            thumb.className = 'attachment-thumb';
            thumb.innerHTML = `
                <img src="${att.data}" alt="${att.name}" />
                <button type="button" class="remove-attachment" data-idx="${idx}">×</button>
            `;
            container.appendChild(thumb);

            // Back side thumbs (viewable)
            if (metaContainer) {
                const metaThumb = document.createElement('div');
                metaThumb.className = 'attachment-thumb';
                metaThumb.style.width = '80px';
                metaThumb.style.height = '80px';
                metaThumb.innerHTML = `
                    <a href="${att.data}" target="_blank" title="View Full Size">
                        <img src="${att.data}" alt="${att.name}" />
                    </a>
                `;
                metaContainer.appendChild(metaThumb);
            }
        });
    }

    /**
     * Set up all interactive event listeners in Shadow DOM.
     * @private
     */
    _setupListeners() {
        const shadow = this.shadowRoot;
        const form = shadow.querySelector('#task-form');
        const overlay = shadow.querySelector('.modal-overlay');
        const flipContainer = shadow.querySelector('.flip-container');

        // Close bindings
        shadow.querySelector('#close-modal-btn').addEventListener('click', () => this.close());
        shadow.querySelector('#close-modal-back-btn').addEventListener('click', () => this.close());
        
        // 3D Flip triggers
        shadow.querySelector('#flip-to-back').addEventListener('click', () => {
            flipContainer.classList.add('flipped');
        });
        shadow.querySelector('#flip-to-front').addEventListener('click', () => {
            flipContainer.classList.remove('flipped');
        });

        // Close modal when clicking backdrop overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });

        // File API: Upload Handler
        const fileInput = shadow.querySelector('#task-file-input');
        shadow.querySelector('#attach-file-btn').addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Enforce Image check
            if (!file.type.startsWith('image/')) {
                alert('Only image attachments are allowed.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                this.tempAttachments.push({
                    name: file.name,
                    type: file.type,
                    data: event.target.result // Base64 encoding
                });
                
                shadow.querySelector('#file-widget-text').textContent = `Attachments (${this.tempAttachments.length})`;
                this._renderTempAttachments();
            };
            reader.readAsDataURL(file);
        });

        // Event delegation for removing attachments
        shadow.querySelector('#attachments-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-attachment')) {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                this.tempAttachments.splice(idx, 1);
                shadow.querySelector('#file-widget-text').textContent = `Attachments (${this.tempAttachments.length})`;
                this._renderTempAttachments();
            }
        });

        // Geolocation API Handler
        const locationBtn = shadow.querySelector('#location-btn');
        const locationText = shadow.querySelector('#location-widget-text');
        
        locationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser.');
                return;
            }

            locationText.textContent = '🔄 Fetching location...';

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.tempLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    locationText.textContent = '📍 Location Tagged';
                    locationBtn.textContent = 'Update Location';

                    // Update back-side coordinates dynamically
                    const metaCoords = shadow.querySelector('#meta-coords');
                    if (metaCoords) {
                        metaCoords.innerHTML = `
                            Lat: ${this.tempLocation.latitude.toFixed(6)}, Lng: ${this.tempLocation.longitude.toFixed(6)}
                            <br/>
                            <a class="map-link" href="https://www.google.com/maps/search/?api=1&query=${this.tempLocation.latitude},${this.tempLocation.longitude}" target="_blank">
                                🌐 View on Google Maps
                            </a>
                        `;
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    locationText.textContent = '❌ Failed to get Location';
                    alert(`Failed to retrieve location: ${error.message}`);
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        });

        // Form Submit Handler & HTML5 required constraint validation
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const titleInput = shadow.querySelector('#task-title');
            
            // Native HTML5 checkValidity
            if (!titleInput.value || titleInput.value.trim() === '') {
                titleInput.style.borderColor = '#d63031';
                alert('Task title is required.');
                return;
            }

            const taskData = {
                title: titleInput.value.trim(),
                notes: shadow.querySelector('#task-notes').value.trim(),
                priority: shadow.querySelector('#task-priority').value,
                quadrant: parseInt(shadow.querySelector('#task-quadrant').value),
                dueDate: shadow.querySelector('#task-duedate').value,
                attachments: this.tempAttachments,
                location: this.tempLocation
            };

            if (this.onSubmitCallback) {
                this.onSubmitCallback(taskData);
            }

            this.close();
        });
    }
}

// Register the custom element once
if (!customElements.get('task-modal')) {
    customElements.define('task-modal', TaskModal);
}
