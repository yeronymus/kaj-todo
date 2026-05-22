// src/views/PomodoroView.js
import BaseView from './BaseView.js';

/**
 * PomodoroView orchestrates the full Focus page timer view, visual canvas progress countdowns, and offline synthetic audio soundscapes.
 */
export default class PomodoroView extends BaseView {
    /**
     * @param {HTMLElement} container - The DOM parent element to render into.
     * @param {PomodoroModel} pomodoroModel 
     */
    constructor(container, pomodoroModel) {
        super(container);
        this.pomodoroModel = pomodoroModel;

        // Core HTML5 Audio instances
        this.ambientAudio = document.createElement('audio');
        this.ambientAudio.loop = true;
        this.ambientAudio.id = 'todozen-ambient-audio';
        document.body.appendChild(this.ambientAudio);

        this.alarmAudio = document.createElement('audio');
        this.alarmAudio.id = 'todozen-alarm-audio';
        document.body.appendChild(this.alarmAudio);

        // Pre-generate offline synthetic alarm audio
        this._generateSyntheticAlarm();

        // Bind model events (safely clean up inside destroy)
        this.unsubTick = this.pomodoroModel.on('tick', (state) => this._updateUI(state));
        this.unsubReset = this.pomodoroModel.on('reset', (state) => this._updateUI(state));
        
        this.unsubStatus = this.pomodoroModel.on('statusChanged', (state) => {
            this._updateButtons(state);
            this._updateUI(state);
            this._handleAmbientPlayback(state);
        });

        this.unsubFinished = this.pomodoroModel.on('sessionFinished', (data) => {
            this._playAlarm();
            alert(`Session complete! Take a ${data.nextType === 'break' ? '5-minute break' : '25-minute work focus'}.`);
        });
    }

    /**
     * Clean up observers and DOM elements to prevent leaks.
     */
    destroy() {
        this.unsubTick();
        this.unsubReset();
        this.unsubStatus();
        this.unsubFinished();

        // Halt and dispose audio
        this.ambientAudio.pause();
        this.ambientAudio.remove();
        this.alarmAudio.pause();
        this.alarmAudio.remove();
    }

    /**
     * Render the Focus timer view.
     */
    render() {
        const state = this.pomodoroModel.getState();

        const html = `
            <div class="focus-container">
                <div class="focus-card">
                    <h2 class="focus-title">Focus Timer</h2>
                    <div class="canvas-wrapper">
                        <canvas id="pomodoro-canvas" width="440" height="440"></canvas>
                        <div class="timer-display">
                            <span id="pomodoro-time">25:00</span>
                            <span id="pomodoro-session-type" class="session-badge work">WORK</span>
                        </div>
                    </div>
                    
                    <div class="focus-controls">
                        <button id="pomodoro-start" class="btn-primary">Start</button>
                        <button id="pomodoro-pause" class="btn-secondary" disabled>Pause</button>
                        <button id="pomodoro-reset" class="btn-tertiary">Reset</button>
                    </div>

                    <div class="focus-soundscape">
                        <div class="soundscape-control">
                            <label for="white-noise-select">Ambient Sound</label>
                            <select id="white-noise-select">
                                <option value="none">None</option>
                                <option value="synth-noise">White Noise</option>
                                <option value="synth-rain">Pink Rain</option>
                                <option value="synth-waves">Brown Waves</option>
                            </select>
                        </div>
                        <div class="soundscape-control">
                            <label for="white-noise-volume">Volume</label>
                            <input type="range" id="white-noise-volume" min="0" max="1" step="0.05" value="0.5" />
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderHTML(html);

        // Cache dynamically created element references
        this.canvas = this.container.querySelector('#pomodoro-canvas');
        this.timeText = this.container.querySelector('#pomodoro-time');
        this.sessionTypeBadge = this.container.querySelector('#pomodoro-session-type');
        this.startBtn = this.container.querySelector('#pomodoro-start');
        this.pauseBtn = this.container.querySelector('#pomodoro-pause');
        this.resetBtn = this.container.querySelector('#pomodoro-reset');
        
        this.soundSelect = this.container.querySelector('#white-noise-select');
        this.volumeSlider = this.container.querySelector('#white-noise-volume');

        this._setupListeners();
        
        // Render current timer state
        this._updateUI(state);
        this._updateButtons(state);
    }

    /**
     * Bind controls.
     * @private
     */
    _setupListeners() {
        this.startBtn.addEventListener('click', () => this.pomodoroModel.start());
        this.pauseBtn.addEventListener('click', () => this.pomodoroModel.pause());
        this.resetBtn.addEventListener('click', () => this.pomodoroModel.reset());
        
        this.soundSelect.addEventListener('change', () => {
            this._loadSelectedAmbientSound();
            const state = this.pomodoroModel.getState();
            this._handleAmbientPlayback(state);
        });

        this.volumeSlider.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            this.ambientAudio.volume = vol;
        });
    }

    /**
     * Updates text counter and redraws the canvas progress ring.
     * @private
     */
    _updateUI(state) {
        if (!this.timeText) return;
        
        const mins = Math.floor(state.secondsLeft / 60);
        const secs = state.secondsLeft % 60;
        this.timeText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        if (this.sessionTypeBadge) {
            this.sessionTypeBadge.textContent = state.sessionType.toUpperCase();
            this.sessionTypeBadge.className = `session-badge ${state.sessionType}`;
        }
        
        this._drawProgressRing(state.secondsLeft, state.duration, state.sessionType);
    }

    /**
     * Enables/disables buttons.
     * @private
     */
    _updateButtons(state) {
        if (!this.startBtn || !this.pauseBtn) return;
        
        if (state.isRunning) {
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
        } else {
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
        }
    }

    /**
     * Programmatic ring drawing on canvas context.
     * @private
     */
    _drawProgressRing(secondsLeft, duration, sessionType) {
        if (!this.canvas) return;
        const ctx = this.canvas.getContext('2d');
        const size = this.canvas.width; // 440
        const radius = size / 2 - 20;
        const center = size / 2;

        ctx.clearRect(0, 0, size, size);

        const isDarkMode = document.body.classList.contains('dark-mode');

        // Track circles colors
        const trackColor = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
        const progressColor = sessionType === 'work' ? (isDarkMode ? '#8f7eff' : '#6c5ce7') : (isDarkMode ? '#4cd137' : '#00b894');

        // 1. Draw subtle background track ring
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.lineWidth = 16;
        ctx.strokeStyle = trackColor;
        ctx.stroke();

        // 2. Draw active progress percentage slice
        const percent = duration > 0 ? (duration - secondsLeft) / duration : 0;
        const startAngle = -Math.PI / 2; // top of circle
        const endAngle = startAngle + (Math.PI * 2 * percent);

        ctx.beginPath();
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.lineWidth = 16;
        ctx.strokeStyle = progressColor;
        ctx.lineCap = 'round';

        // Glowing filter shadows
        ctx.shadowBlur = 12;
        ctx.shadowColor = progressColor;
        
        ctx.stroke();

        // Reset shadow
        ctx.shadowBlur = 0;
    }

    /**
     * Play or pause background white noise based on timer running state.
     * @private
     */
    _handleAmbientPlayback(state) {
        if (!this.soundSelect) return;
        
        if (state.isRunning && this.soundSelect.value !== 'none') {
            if (!this.ambientAudio.src) {
                this._loadSelectedAmbientSound();
            }
            
            this.ambientAudio.play().catch(e => {
                console.warn('Media play failed due to browser user-gesture requirements:', e);
            });
        } else {
            this.ambientAudio.pause();
        }
    }

    /**
     * Loads ambient tracks. Programmatically synthesizes noise to maintain PWA offline compliance.
     * @private
     */
    _loadSelectedAmbientSound() {
        if (!this.soundSelect) return;
        const val = this.soundSelect.value;
        this.ambientAudio.pause();

        if (val === 'none') {
            this.ambientAudio.removeAttribute('src');
            return;
        }

        // Generate clean synthesized offline wav block based on selection
        let blob;
        if (val === 'synth-noise') {
            blob = this._createSyntheticNoiseBlob('white');
        } else if (val === 'synth-rain') {
            blob = this._createSyntheticNoiseBlob('pink'); // Pink noise mimics rain beautifully
        } else if (val === 'synth-waves') {
            blob = this._createSyntheticNoiseBlob('brown'); // Brown noise mimics ocean waves
        }

        if (blob) {
            const url = URL.createObjectURL(blob);
            this.ambientAudio.src = url;
            this.ambientAudio.volume = parseFloat(this.volumeSlider.value);
        }
    }

    /**
     * Triggers the offline synthesized session alarm.
     * @private
     */
    _playAlarm() {
        this.alarmAudio.play().catch(e => console.warn('Alarm failed to play:', e));
    }

    /**
     * Synthesizes 4 seconds of custom noise looped or exported to a WAV Blob.
     * Generates a fully compliant offline sound file without needing large static assets.
     * @private
     */
    _createSyntheticNoiseBlob(type) {
        const sampleRate = 44100;
        const duration = 4.0; // 4 seconds loop
        const numSamples = sampleRate * duration;
        const buffer = new Float32Array(numSamples);

        let lastOut = 0.0; // Filter memory for pink/brown noise
        
        for (let i = 0; i < numSamples; i++) {
            const white = Math.random() * 2 - 1;
            
            if (type === 'white') {
                buffer[i] = white;
            } else if (type === 'pink') {
                buffer[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = buffer[i];
                buffer[i] *= 3.5; // Gain compensation
            } else if (type === 'brown') {
                buffer[i] = (lastOut + (0.05 * white)) / 1.05;
                lastOut = buffer[i];
                buffer[i] *= 3.5; // Gain compensation
            }
        }

        // Convert the Float32Array into a 16-bit Mono WAV format
        const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
        const view = new DataView(wavBuffer);

        this._writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + numSamples * 2, true);
        this._writeString(view, 8, 'WAVE');
        this._writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        this._writeString(view, 36, 'data');
        view.setUint32(40, numSamples * 2, true);

        let offset = 44;
        for (let i = 0; i < numSamples; i++) {
            let s = Math.max(-1, Math.min(1, buffer[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            offset += 2;
        }

        return new Blob([wavBuffer], { type: 'audio/wav' });
    }

    /**
     * Programmatic synth generator for a pleasant double-chime alarm sound.
     * @private
     */
    _generateSyntheticAlarm() {
        const sampleRate = 44100;
        const duration = 1.0;
        const numSamples = sampleRate * duration;
        const buffer = new Float32Array(numSamples);

        const freq1 = 880; // A5 pitch
        const freq2 = 1200; // E6 pitch

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope1 = Math.exp(-4 * t);
            const envelope2 = t > 0.15 ? Math.exp(-4 * (t - 0.15)) : 0;
            
            buffer[i] = (Math.sin(2 * Math.PI * freq1 * t) * envelope1 * 0.4) + 
                        (Math.sin(2 * Math.PI * freq2 * t) * envelope2 * 0.4);
        }

        const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
        const view = new DataView(wavBuffer);

        this._writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + numSamples * 2, true);
        this._writeString(view, 8, 'WAVE');
        this._writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        this._writeString(view, 36, 'data');
        view.setUint32(40, numSamples * 2, true);

        let offset = 44;
        for (let i = 0; i < numSamples; i++) {
            let s = Math.max(-1, Math.min(1, buffer[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            offset += 2;
        }

        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        this.alarmAudio.src = URL.createObjectURL(blob);
    }

    /**
     * String writer utility inside DataViews.
     * @private
     */
    _writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}
