// src/utils/dialogs.js

/**
 * Custom Promise-based Glassmorphic Dialogs (Confirm & Alert).
 * Replaces ugly browser-native confirm() and alert() popups with premium styled visual interfaces.
 */

/**
 * Show a premium confirmation dialog modal.
 * @param {string} title - Dialog Header Title
 * @param {string} message - Description message
 * @returns {Promise<boolean>} Resolves to true if confirmed, false otherwise
 */
export function showConfirm(title, message) {
    return new Promise((resolve) => {
        // Create elements
        const overlay = document.createElement('div');
        overlay.className = 'custom-dialog-overlay';

        overlay.innerHTML = `
            <div class="custom-dialog-card">
                <div class="custom-dialog-header">
                    <h4>⚠️ ${title}</h4>
                </div>
                <div class="custom-dialog-body">
                    <p>${message}</p>
                </div>
                <div class="custom-dialog-footer">
                    <button class="dialog-btn btn-cancel" id="dialog-cancel-btn">Cancel</button>
                    <button class="dialog-btn btn-confirm" id="dialog-confirm-btn">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Add visual transition classes
        setTimeout(() => overlay.classList.add('show'), 10);

        // Cleanup and resolve helper
        const cleanup = (value) => {
            overlay.classList.remove('show');
            // Wait for fade out transition to complete
            setTimeout(() => {
                overlay.remove();
                resolve(value);
            }, 300);
        };

        // Listeners
        overlay.querySelector('#dialog-cancel-btn').addEventListener('click', () => cleanup(false));
        overlay.querySelector('#dialog-confirm-btn').addEventListener('click', () => cleanup(true));

        // Click on backdrop cancels
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cleanup(false);
        });

        // Keydown Esc cancels, Enter confirms
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                window.removeEventListener('keydown', handleKeyDown);
                cleanup(false);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                window.removeEventListener('keydown', handleKeyDown);
                cleanup(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
    });
}

/**
 * Show a premium Alert dialog modal.
 * @param {string} title 
 * @param {string} message 
 * @returns {Promise<void>} Resolves when OK is clicked
 */
export function showAlert(title, message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'custom-dialog-overlay';

        overlay.innerHTML = `
            <div class="custom-dialog-card">
                <div class="custom-dialog-header">
                    <h4>🔔 ${title}</h4>
                </div>
                <div class="custom-dialog-body">
                    <p>${message}</p>
                </div>
                <div class="custom-dialog-footer">
                    <button class="dialog-btn btn-confirm" id="dialog-ok-btn" style="width:100%;">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('show'), 10);

        const cleanup = () => {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 300);
        };

        overlay.querySelector('#dialog-ok-btn').addEventListener('click', () => cleanup());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cleanup();
        });

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
                e.preventDefault();
                window.removeEventListener('keydown', handleKeyDown);
                cleanup();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
    });
}
