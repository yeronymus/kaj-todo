// src/views/HabitsView.js
import BaseView from './BaseView.js';
import { showConfirm } from '../utils/dialogs.js';

/**
 * Confetti particle class for habit check-in milestone rewards.
 */
class ConfettiParticle {
    constructor(x, y, color, direction) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 8 + 6;
        
        // Shoot upwards and towards the center
        this.speedX = direction === 'left' ? Math.random() * 14 + 6 : Math.random() * -14 - 6;
        this.speedY = Math.random() * -18 - 8;
        
        this.gravity = 0.35;
        this.drag = 0.98;
        this.opacity = 1.0;
        this.fade = Math.random() * 0.015 + 0.008;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 12 - 6;
    }

    update() {
        this.speedX *= this.drag;
        this.speedY *= this.drag;
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= this.fade;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

/**
 * HabitsView displays recurring habits, check-ins, and renders an interactive HTML5 Canvas performance chart.
 */
export default class HabitsView extends BaseView {
    /**
     * @param {HTMLElement} container 
     * @param {HabitModel} habitModel 
     */
    constructor(container, habitModel) {
        super(container);
        this.habitModel = habitModel;

        this.unsubscribeAdded = this.habitModel.on('habitAdded', () => this.render());
        this.unsubscribeUpdated = this.habitModel.on('habitUpdated', () => this.render());
        this.unsubscribeDeleted = this.habitModel.on('habitDeleted', () => this.render());
        
        this.confettiActive = false;
        this.particles = [];
    }

    destroy() {
        this.unsubscribeAdded();
        this.unsubscribeUpdated();
        this.unsubscribeDeleted();
        this.confettiActive = false;
    }

    /**
     * Render the Habits dashboard layout.
     */
    render() {
        const habits = this.habitModel.getAllHabits();
        const todayStr = this._getLocalDateString(new Date());

        const html = `
            <div class="habits-container">
                <header class="habits-header">
                    <h2>Habit Tracker</h2>
                </header>

                <div class="habits-layout">
                    <!-- Left Side: Habits list and creator -->
                    <section class="habits-list-section">
                        <form class="add-task-form" id="add-habit-form" style="margin-bottom: 12px;">
                            <input type="text" id="habit-name" placeholder="Enter new habit name... (e.g. Read 15 mins)" required autocomplete="off" />
                            <button type="submit">Create Habit</button>
                        </form>

                        <div class="task-list" id="habits-list-container">
                            ${habits.length === 0 ? `
                                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                                    No habits tracked yet. Create one above to begin!
                                </div>
                            ` : habits.map(habit => {
                                const isCheckedToday = habit.historyDates.includes(todayStr);
                                return `
                                    <article class="habit-item" data-id="${habit.id}">
                                        <div class="habit-info">
                                            <h4>${this._escapeHTML(habit.name)}</h4>
                                            <p>${habit.historyDates.length} total completions</p>
                                        </div>

                                        <div class="habit-check-group">
                                            <span class="streak-badge">
                                                🔥 ${habit.streak} day streak
                                            </span>
                                            
                                            <button class="check-btn ${isCheckedToday ? 'checked' : ''}" data-id="${habit.id}" aria-label="Mark completed for today">
                                                <svg viewBox="0 0 24 24">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </button>

                                            <button class="delete-btn delete-habit-btn" data-id="${habit.id}" title="Delete Habit">×</button>
                                        </div>
                                    </article>
                                `;
                            }).join('')}
                        </div>
                    </section>

                    <!-- Right Side: HTML5 Canvas stats -->
                    <section class="habits-stats-section">
                        <h3>Last 7 Days Statistics</h3>
                        <!-- Renders statistical visual trends on canvas -->
                        <canvas id="habits-canvas" width="600" height="400" style="width:100%; aspect-ratio: 3/2;"></canvas>
                    </section>
                </div>
            </div>
        `;

        this.renderHTML(html);
        this._setupListeners();
        
        // Let UI settle, then draw the stats canvas
        setTimeout(() => this._drawStatsChart(), 20);
    }

    /**
     * Renders standard grids, gradients, and points onto the HTML5 Canvas context.
     * @private
     */
    _drawStatsChart() {
        const canvas = this.container.querySelector('#habits-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const habits = this.habitModel.getAllHabits();
        
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // Colors configured by active theme
        const textColor = isDarkMode ? '#a4b0be' : '#636e72';
        const gridColor = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
        const accentColor = isDarkMode ? '#8f7eff' : '#6c5ce7';
        const fillGradientStart = isDarkMode ? 'rgba(143, 126, 255, 0.25)' : 'rgba(108, 92, 231, 0.2)';
        const fillGradientEnd = 'rgba(0,0,0,0)';

        // Clear Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Grid Dimensions
        const padding = { top: 40, right: 30, bottom: 50, left: 50 };
        const chartWidth = canvas.width - padding.left - padding.right;
        const chartHeight = canvas.height - padding.top - padding.bottom;

        // Fetch last 7 days strings
        const dates = [];
        const dayLabels = [];
        const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(this._getLocalDateString(d));
            dayLabels.push(weekdayNames[d.getDay()]);
        }

        // Calculate Completion rates per day
        const completionRates = dates.map(dateStr => {
            if (habits.length === 0) return 0;
            const completedCount = habits.filter(h => h.historyDates.includes(dateStr)).length;
            return completedCount / habits.length; // value between 0.0 and 1.0
        });

        // 1. Draw Gridlines & Labels
        ctx.lineWidth = 1;
        ctx.strokeStyle = gridColor;
        ctx.fillStyle = textColor;
        ctx.font = '500 16px Outfit, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const yTicks = [0, 0.25, 0.5, 0.75, 1];
        yTicks.forEach(tick => {
            const y = padding.top + chartHeight * (1 - tick);
            
            // Draw horizontal line
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(canvas.width - padding.right, y);
            ctx.stroke();

            // Draw Y label
            ctx.fillText(`${tick * 100}%`, padding.left - 12, y);
        });

        // 2. Draw X Axis Labels
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const xPositions = [];

        dayLabels.forEach((label, idx) => {
            const x = padding.left + (chartWidth / 6) * idx;
            xPositions.push(x);
            
            // Draw text
            ctx.fillText(label, x, canvas.height - padding.bottom + 12);
        });

        // If no habits exist, display empty banner and skip plotting lines
        if (habits.length === 0) {
            ctx.fillStyle = textColor;
            ctx.font = 'italic 18px Outfit, sans-serif';
            ctx.fillText('Create habits to view visual trends', canvas.width / 2 + 10, canvas.height / 2);
            return;
        }

        // 3. Trace Gradient Fill beneath line
        ctx.beginPath();
        ctx.moveTo(xPositions[0], padding.top + chartHeight); // start at bottom left
        
        xPositions.forEach((x, idx) => {
            const y = padding.top + chartHeight * (1 - completionRates[idx]);
            ctx.lineTo(x, y);
        });

        ctx.lineTo(xPositions[6], padding.top + chartHeight); // bottom right
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        grad.addColorStop(0, fillGradientStart);
        grad.addColorStop(1, fillGradientEnd);
        ctx.fillStyle = grad;
        ctx.fill();

        // 4. Trace neon violet line graph
        ctx.beginPath();
        xPositions.forEach((x, idx) => {
            const y = padding.top + chartHeight * (1 - completionRates[idx]);
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        
        ctx.lineWidth = 4;
        ctx.strokeStyle = accentColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = accentColor;
        ctx.stroke();

        // Reset shadows to avoid blurring circles
        ctx.shadowBlur = 0;

        // 5. Draw interactive coordinate circles
        xPositions.forEach((x, idx) => {
            const y = padding.top + chartHeight * (1 - completionRates[idx]);

            // Outer ring
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fillStyle = accentColor;
            ctx.fill();

            // Inner core
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        });
    }

    /**
     * Launches a glorious fullscreen double corner shoot particle confetti explosion!
     * @private
     */
    _triggerConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        canvas.width = w;
        canvas.height = h;

        this.particles = [];
        
        // Colors palette matching the active premium theme
        const colors = ['#6c5ce7', '#ff007f', '#00f0ff', '#00b894', '#fbc531', '#e84118'];

        // Spawn shooting particles from Bottom Left
        for (let i = 0; i < 70; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new ConfettiParticle(0, h, color, 'left'));
        }

        // Spawn shooting particles from Bottom Right
        for (let i = 0; i < 70; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new ConfettiParticle(w, h, color, 'right'));
        }

        if (!this.confettiActive) {
            this.confettiActive = true;
            this._animateConfetti(canvas, ctx);
        }
    }

    /**
     * Particles animation loop using requestAnimationFrame.
     * @private
     */
    _animateConfetti(canvas, ctx) {
        if (!this.confettiActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and render active particles
        this.particles.forEach(p => {
            p.update();
            p.draw(ctx);
        });

        // Filter out completely transparent dead particles
        this.particles = this.particles.filter(p => p.opacity > 0);

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this._animateConfetti(canvas, ctx));
        } else {
            this.confettiActive = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    /**
     * Binds click events.
     * @private
     */
    _setupListeners() {
        const container = this.container;

        // Create Habit Form
        const form = container.querySelector('#add-habit-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = container.querySelector('#habit-name');
                const name = input.value.trim();

                if (name !== '') {
                    this.habitModel.addHabit(name);
                    input.value = '';
                }
            });
        }

        // Checklist checkoff toggles
        const list = container.querySelector('#habits-list-container');
        if (list) {
            list.addEventListener('click', (e) => {
                const target = e.target;

                // 1. Toggle completed date (Confetti dopamine burst + micro vibrations!)
                const btn = target.closest('.check-btn');
                if (btn) {
                    const id = btn.getAttribute('data-id');
                    const todayStr = this._getLocalDateString(new Date());
                    
                    const isChecked = btn.classList.contains('checked');
                    
                    // Save state change
                    this.habitModel.toggleHabitDate(id, todayStr);

                    // Confetti and vibration triggers on checking off
                    if (!isChecked) {
                        this._triggerConfetti();
                        
                        // Micro-Vibration dopamine ticks
                        if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
                    }
                    return;
                }

                // 2. Delete Habit
                const del = target.closest('.delete-habit-btn');
                if (del) {
                    const id = del.getAttribute('data-id');
                    showConfirm('Delete Habit', 'Are you sure you want to delete this habit?').then((confirmed) => {
                        if (confirmed) {
                            this.habitModel.deleteHabit(id);
                        }
                    });
                    return;
                }
            });
        }
    }

    /**
     * Local timezone YYYY-MM-DD generator.
     * @private
     */
    _getLocalDateString(d) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    /**
     * Avoid HTML Injections.
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
