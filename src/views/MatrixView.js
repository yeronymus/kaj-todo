// src/views/MatrixView.js
import BaseView from './BaseView.js';
import Sortable from 'sortablejs';
import { showConfirm } from '../utils/dialogs.js';

/**
 * MatrixView manages the 4-quadrant Eisenhower Matrix Kanban layout and integrates SortableJS.
 */
export default class MatrixView extends BaseView {
    /**
     * @param {HTMLElement} container 
     * @param {TaskModel} taskModel 
     * @param {HTMLElement} modalElement 
     */
    constructor(container, taskModel, modalElement) {
        super(container);
        this.taskModel = taskModel;
        this.modalElement = modalElement;
        
        this.sortables = [];

        this.unsubscribeAdded = this.taskModel.on('taskAdded', () => this.render());
        this.unsubscribeUpdated = this.taskModel.on('taskUpdated', () => this.render());
        this.unsubscribeDeleted = this.taskModel.on('taskDeleted', () => this.render());
    }

    destroy() {
        this._destroySortable();
        this.unsubscribeAdded();
        this.unsubscribeUpdated();
        this.unsubscribeDeleted();
    }

    /**
     * Terminate active Sortable instances.
     * @private
     */
    _destroySortable() {
        this.sortables.forEach(s => s.destroy());
        this.sortables = [];
    }

    /**
     * Render the 4-quadrant Matrix grid interface.
     */
    render() {
        this._destroySortable();
        const tasks = this.taskModel.getAllTasks().filter(t => !t.completed);

        // Group tasks by quadrants
        const q1 = tasks.filter(t => t.quadrant === 1);
        const q2 = tasks.filter(t => t.quadrant === 2);
        const q3 = tasks.filter(t => t.quadrant === 3);
        const q4 = tasks.filter(t => t.quadrant === 4);

        const html = `
            <div class="matrix-container">
                <h2>Eisenhower Matrix</h2>
                <div class="matrix-grid">
                    
                    <!-- Q1: Urgent & Important -->
                    <section class="matrix-quadrant q1" aria-labelledby="q1-title">
                        <div class="quadrant-header">
                            <h3 id="q1-title">🔥 Urgent & Important</h3>
                            <span class="badge" id="q1-count">${q1.length} tasks</span>
                        </div>
                        <div class="quadrant-list" id="quadrant-1" data-quadrant="1">
                            ${q1.map(task => this._generateCardTemplate(task)).join('')}
                        </div>
                    </section>

                    <!-- Q2: Important & Not Urgent -->
                    <section class="matrix-quadrant q2" aria-labelledby="q2-title">
                        <div class="quadrant-header">
                            <h3 id="q2-title">⭐️ Important & Not Urgent</h3>
                            <span class="badge" id="q2-count">${q2.length} tasks</span>
                        </div>
                        <div class="quadrant-list" id="quadrant-2" data-quadrant="2">
                            ${q2.map(task => this._generateCardTemplate(task)).join('')}
                        </div>
                    </section>

                    <!-- Q3: Urgent & Not Important -->
                    <section class="matrix-quadrant q3" aria-labelledby="q3-title">
                        <div class="quadrant-header">
                            <h3 id="q3-title">⚡️ Urgent & Not Important</h3>
                            <span class="badge" id="q3-count">${q3.length} tasks</span>
                        </div>
                        <div class="quadrant-list" id="quadrant-3" data-quadrant="3">
                            ${q3.map(task => this._generateCardTemplate(task)).join('')}
                        </div>
                    </section>

                    <!-- Q4: Not Urgent & Not Important -->
                    <section class="matrix-quadrant q4" aria-labelledby="q4-title">
                        <div class="quadrant-header">
                            <h3 id="q4-title">💤 Not Urgent & Not Important</h3>
                            <span class="badge" id="q4-count">${q4.length} tasks</span>
                        </div>
                        <div class="quadrant-list" id="quadrant-4" data-quadrant="4">
                            ${q4.map(task => this._generateCardTemplate(task)).join('')}
                        </div>
                    </section>

                </div>
            </div>
        `;

        this.renderHTML(html);
        this._setupSortable();
        this._setupListeners();
    }

    /**
     * Card HTML Template.
     * @private
     */
    _generateCardTemplate(task) {
        return `
            <div class="matrix-card" data-id="${task.id}">
                <span class="card-text">${this._escapeHTML(task.title)}</span>
                <div class="card-actions">
                    <button class="delete-card-btn" data-id="${task.id}" title="Delete Task">×</button>
                </div>
            </div>
        `;
    }

    /**
     * Setup SortableJS instances for each quadrant list.
     * Enables active Drag & Drop updates.
     * @private
     */
    _setupSortable() {
        const self = this;
        const containers = this.container.querySelectorAll('.quadrant-list');

        containers.forEach(el => {
            const sortable = Sortable.create(el, {
                group: 'matrix-kanban',
                animation: 200,
                ghostClass: 'sortable-ghost',
                
                // Triggers when dragging finishes
                onEnd: function (evt) {
                    const taskId = evt.item.getAttribute('data-id');
                    const targetList = evt.to;
                    const newQuadrant = parseInt(targetList.getAttribute('data-quadrant'));

                    if (taskId && newQuadrant) {
                        try {
                            // Update task quadrant state inside the model
                            self.taskModel.updateTask(taskId, { quadrant: newQuadrant });
                        } catch (err) {
                            console.error('Failed to update task drag status:', err);
                            self.render(); // Revert UI
                        }
                    }
                }
            });
            this.sortables.push(sortable);
        });
    }

    /**
     * Click listeners for actions inside Matrix.
     * @private
     */
    _setupListeners() {
        const grid = this.container.querySelector('.matrix-grid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const target = e.target;

                // 1. Delete Card
                const delBtn = target.closest('.delete-card-btn');
                if (delBtn) {
                    e.stopPropagation();
                    const id = delBtn.getAttribute('data-id');
                    showConfirm('Delete Task', 'Are you sure you want to delete this task?').then((confirmed) => {
                        if (confirmed) {
                            this.taskModel.deleteTask(id);
                        }
                    });
                    return;
                }

                // 2. Open edit modal when clicking card body
                const card = target.closest('.matrix-card');
                if (card) {
                    const id = card.getAttribute('data-id');
                    const task = this.taskModel.getTaskById(id);
                    if (task) {
                        this.modalElement.open(task, (updatedData) => {
                            this.taskModel.updateTask(id, updatedData);
                        });
                    }
                }
            });
        }
    }

    /**
     * Helper to avoid XSS injections.
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
