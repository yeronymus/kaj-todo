// src/models/HabitModel.js
import BaseModel from './BaseModel.js';

/**
 * HabitModel tracks user habits, check-ins over calendar days, and computes current streaks.
 */
export default class HabitModel extends BaseModel {
    constructor() {
        super('todozen_habits');
        this.habits = this.load([]);

        // Seed initial habits ONLY if this is the 'teacher' account and has no habits!
        const currentUser = localStorage.getItem('todozen_current_user');
        if (this.habits.length === 0 && currentUser === 'teacher') {
            this._seedInitialHabits();
        }
    }

    /**
     * Seed initial habits with custom streaks and check-ins to demonstrate chart/streaks work.
     * @private
     */
    _seedInitialHabits() {
        const getLocalDateString = (d) => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        const todayStr = getLocalDateString(new Date());
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);
        
        const dayBefore = new Date();
        dayBefore.setDate(dayBefore.getDate() - 2);
        const dayBeforeStr = getLocalDateString(dayBefore);

        const initial = [
            {
                id: 'habit-seed-1',
                name: 'Drink 2L Water daily',
                historyDates: [dayBeforeStr, yesterdayStr, todayStr],
                streak: 3,
                createdAt: new Date().toISOString()
            },
            {
                id: 'habit-seed-2',
                name: 'Read 15 pages of a book',
                historyDates: [dayBeforeStr, yesterdayStr],
                streak: 2,
                createdAt: new Date().toISOString()
            },
            {
                id: 'habit-seed-3',
                name: 'Perform 20 pushups daily',
                historyDates: [dayBeforeStr],
                streak: 0,
                createdAt: new Date().toISOString()
            }
        ];
        
        this.habits = initial;
        this.save(this.habits);
    }

    /**
     * Get all tracked habits.
     */
    getAllHabits() {
        return this.habits;
    }

    /**
     * Create and track a new habit.
     * @param {string} name 
     */
    addHabit(name) {
        if (!name || name.trim() === '') {
            throw new Error('Habit name cannot be empty.');
        }

        const newHabit = {
            id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : this._generateId(),
            name: name.trim(),
            historyDates: [], // Array of 'YYYY-MM-DD' strings when checked off
            streak: 0,
            createdAt: new Date().toISOString()
        };

        this.habits.push(newHabit);
        this.save(this.habits);
        this.emit('habitAdded', newHabit);
        return newHabit;
    }

    /**
     * Delete a habit.
     * @param {string} id 
     */
    deleteHabit(id) {
        const lengthBefore = this.habits.length;
        this.habits = this.habits.filter(habit => habit.id !== id);

        if (this.habits.length !== lengthBefore) {
            this.save(this.habits);
            this.emit('habitDeleted', id);
            return true;
        }
        return false;
    }

    /**
     * Toggle a check-in date for a habit.
     * @param {string} id 
     * @param {string} dateStr - Date format YYYY-MM-DD
     */
    toggleHabitDate(id, dateStr) {
        const index = this.habits.findIndex(h => h.id === id);
        if (index === -1) return null;

        const habit = this.habits[index];
        const dateIndex = habit.historyDates.indexOf(dateStr);

        if (dateIndex === -1) {
            // Check off
            habit.historyDates.push(dateStr);
        } else {
            // Uncheck
            habit.historyDates.splice(dateIndex, 1);
        }

        // Sort dates chronologically for proper streak calculations
        habit.historyDates.sort();
        
        // Recalculate streak
        habit.streak = this._calculateStreak(habit.historyDates);

        this.habits[index] = habit;
        this.save(this.habits);
        this.emit('habitUpdated', habit);
        return habit;
    }

    /**
     * Calculates the current streak of consecutive days.
     * @param {Array<string>} dates - Sorted YYYY-MM-DD strings
     * @returns {number} Current streak
     * @private
     */
    _calculateStreak(dates) {
        if (dates.length === 0) return 0;

        // Get local date representation in YYYY-MM-DD format
        const getLocalDateString = (d) => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        const todayStr = getLocalDateString(new Date());
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);

        // Check if checked today or yesterday. If neither, streak is 0.
        if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) {
            return 0;
        }

        let streak = 0;
        let checkDate = dates.includes(todayStr) ? new Date() : yesterday;

        while (true) {
            const checkStr = getLocalDateString(checkDate);
            if (dates.includes(checkStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1); // move to previous day
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Fallback ID generator.
     * @private
     */
    _generateId() {
        return Math.random().toString(36).substring(2, 15);
    }
}
