/**
 * Console and messaging system
 * Manages application messages, notifications, and console display
 */

/**
 * Message Console System
 * Manages the message console for displaying system messages
 */
const MessageConsole = {
    messages: [],
    maxMessages: 100,
    isVisible: false,
    isDocked: false,
    dragData: { isDragging: false, startX: 0, startY: 0, startLeft: 0, startTop: 0 },

    /**
     * Initialize the message console
     */
    init() {
        // Konsol varsayılan açık gelsin
        const console = document.getElementById('messageConsole');
        const toggleBtn = document.getElementById('consoleToggleBtn');

        this.isVisible = true;
        if (console) {
            console.classList.add('show');
        }

        // Drag & drop sistemi kurulumu
        this.setupDragAndDrop();

        // İlk mesajları ekle
        this.addMessage('Mesaj konsolu hazır! 🎉', 'info');
        this.addMessage('Sistem mesajları burada görüntülenir', 'info');
        this.addMessage('Konsol taşınabilir - sürükleyerek konumlandırabilirsiniz', 'info');
    },

    /**
     * Add a message to the console
     * @param {string} message - The message text
     * @param {string} type - Message type (info, success, warning, error)
     */
    addMessage(message, type = 'info') {
        const timestamp = new Date();
        const messageObj = {
            id: Date.now() + Math.random(),
            message,
            type,
            timestamp,
            time: timestamp.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        };

        this.messages.unshift(messageObj);

        // Maksimum mesaj sayısını aş
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(0, this.maxMessages);
        }

        this.updateConsole();
        this.updateToggleButton();

        // Console.log için de çıktı ver
        console.log(`[${type.toUpperCase()}] ${message}`);
    },

    /**
     * Update the console display
     */
    updateConsole() {
        const messagesContainer = document.getElementById('consoleMessages');
        const messageCounter = document.getElementById('messageCounter');

        if (!messagesContainer) return;

        // Mesaj sayısını güncelle
        if (messageCounter) {
            messageCounter.textContent = this.messages.length;
        }

        // Mesajları render et
        messagesContainer.innerHTML = this.messages
            .map(msg => this.renderMessage(msg))
            .join('');

        // Filtre uygula
        this.applyFilters();

        // En son mesaja scroll
        if (messagesContainer.scrollTop === 0) {
            messagesContainer.scrollTop = 0;
        }
    },

    /**
     * Render a single message
     * @param {Object} messageObj - Message object
     * @returns {string} HTML string
     */
    renderMessage(messageObj) {
        const iconMap = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        return `
            <div class="console-message" data-type="${messageObj.type}" data-id="${messageObj.id}">
                <span class="message-time">${messageObj.time}</span>
                <span class="message-icon">${iconMap[messageObj.type] || 'ℹ️'}</span>
                <span class="message-text">${messageObj.message}</span>
            </div>
        `;
    },

    /**
     * Apply filters to messages
     */
    applyFilters() {
        // Filter logic can be added here
    },

    /**
     * Clear all messages
     */
    clear() {
        this.messages = [];
        this.updateConsole();
    },

    /**
     * Toggle console visibility
     */
    toggle() {
        this.isVisible = !this.isVisible;
        const console = document.getElementById('messageConsole');
        if (console) {
            console.classList.toggle('show', this.isVisible);
        }
    },

    /**
     * Show the console
     */
    show() {
        this.isVisible = true;
        const console = document.getElementById('messageConsole');
        if (console) {
            console.classList.add('show');
        }
    },

    /**
     * Hide the console
     */
    hide() {
        this.isVisible = false;
        const console = document.getElementById('messageConsole');
        if (console) {
            console.classList.remove('show');
        }
    },

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        // Drag and drop implementation
        const console = document.getElementById('messageConsole');
        if (!console) return;

        const header = console.querySelector('.console-header');
        if (!header) return;

        let isDragging = false;
        let startX, startY, startLeft, startTop;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = console.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            console.style.left = (startLeft + dx) + 'px';
            console.style.top = (startTop + dy) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    },

    /**
     * Update toggle button
     */
    updateToggleButton() {
        const toggleBtn = document.getElementById('consoleToggleBtn');
        if (toggleBtn && this.messages.length > 0) {
            const lastMessage = this.messages[0];
            toggleBtn.classList.remove('info', 'success', 'warning', 'error');
            toggleBtn.classList.add(lastMessage.type);
        }
    }
};

/**
 * Log a message to the console
 * @param {string} message - The message text
 * @param {string} type - Message type
 */
export function logToConsole(message, type = 'info') {
    MessageConsole.addMessage(message, type);
}

/**
 * Show a notification
 * @param {string} message - The message text
 * @param {string} type - Notification type
 */
export function showNotification(message, type = 'info') {
    MessageConsole.addMessage(message, type);
}

/**
 * Clear the console
 */
export function clearConsole() {
    MessageConsole.clear();
}

/**
 * Update the console
 */
export function updateConsole() {
    MessageConsole.updateConsole();
}

/**
 * Initialize the console
 */
export function initConsole() {
    MessageConsole.init();
}

/**
 * Toggle console visibility
 */
export function toggleConsole() {
    MessageConsole.toggle();
}

// Export the MessageConsole object
export { MessageConsole };
