// src/models/PomodoroModel.js
import BaseModel from './BaseModel.js';

/**
 * PomodoroModel handles timer cycles, state, and emits events when the clock ticks or finishes.
 */
export default class PomodoroModel extends BaseModel {
    constructor() {
        super('todozen_pomodoro');
        
        // Initial defaults
        const defaults = {
            workDuration: 25 * 60, // 25 minutes in seconds
            breakDuration: 5 * 60,  // 5 minutes in seconds
            secondsLeft: 25 * 60,
            sessionType: 'work',   // 'work' or 'break'
            totalCompleted: 0
        };

        const loaded = this.load(defaults);
        
        this.workDuration = loaded.workDuration || defaults.workDuration;
        this.breakDuration = loaded.breakDuration || defaults.breakDuration;
        this.secondsLeft = loaded.secondsLeft !== undefined ? loaded.secondsLeft : defaults.secondsLeft;
        this.sessionType = loaded.sessionType || defaults.sessionType;
        this.totalCompleted = loaded.totalCompleted !== undefined ? loaded.totalCompleted : defaults.totalCompleted;
        
        this.isRunning = false;
        this.timerInterval = null;
    }

    /**
     * Get details of the current state.
     */
    getState() {
        return {
            secondsLeft: this.secondsLeft,
            sessionType: this.sessionType,
            totalCompleted: this.totalCompleted,
            isRunning: this.isRunning,
            duration: this.sessionType === 'work' ? this.workDuration : this.breakDuration
        };
    }

    /**
     * Start the countdown timer.
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.emit('statusChanged', this.getState());

        this.timerInterval = setInterval(() => {
            this.tick();
        }, 1000);
    }

    /**
     * Pause the timer.
     */
    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.timerInterval = null;

        this.persistState();
        this.emit('statusChanged', this.getState());
    }

    /**
     * Reset the timer to the start of the current session type.
     */
    reset() {
        this.pause();
        this.secondsLeft = this.sessionType === 'work' ? this.workDuration : this.breakDuration;
        this.persistState();
        this.emit('reset', this.getState());
    }

    /**
     * Triggered every second. Decrements the clock.
     */
    tick() {
        if (this.secondsLeft > 0) {
            this.secondsLeft--;
            this.persistState();
            this.emit('tick', this.getState());
        } else {
            // Timer completed!
            this.sessionCompleted();
        }
    }

    /**
     * Action taken upon timer hitting 0.
     */
    sessionCompleted() {
        this.pause();

        if (this.sessionType === 'work') {
            this.totalCompleted++;
            this.sessionType = 'break';
            this.secondsLeft = this.breakDuration;
            this.emit('sessionFinished', { type: 'work', nextType: 'break', state: this.getState() });
        } else {
            this.sessionType = 'work';
            this.secondsLeft = this.workDuration;
            this.emit('sessionFinished', { type: 'break', nextType: 'work', state: this.getState() });
        }

        this.persistState();
        this.emit('statusChanged', this.getState());
    }

    /**
     * Save only non-volatile fields.
     */
    persistState() {
        this.save({
            workDuration: this.workDuration,
            breakDuration: this.breakDuration,
            secondsLeft: this.secondsLeft,
            sessionType: this.sessionType,
            totalCompleted: this.totalCompleted
        });
    }

    /**
     * Set customized durations.
     * @param {number} workMins 
     * @param {number} breakMins 
     */
    configureDurations(workMins, breakMins) {
        this.pause();
        this.workDuration = workMins * 60;
        this.breakDuration = breakMins * 60;
        this.secondsLeft = this.sessionType === 'work' ? this.workDuration : this.breakDuration;
        this.persistState();
        this.emit('reset', this.getState());
    }
}
