/**
 * Modal Management Module
 * Handles modal dialogs, dragging, and visibility
 */

/**
 * Show a modal
 * @param {string} modalId - Modal element ID
 */
export function showModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            console.log(`Modal shown: ${modalId}`);
        } else {
            console.error(`Modal not found: ${modalId}`);
        }
    } catch (error) {
        console.error('Error showing modal:', error);
    }
}

/**
 * Close a modal
 * @param {string} modalId - Modal element ID
 */
export function closeModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            console.log(`Modal closed: ${modalId}`);
        } else {
            console.error(`Modal not found: ${modalId}`);
        }
    } catch (error) {
        console.error('Error closing modal:', error);
    }
}

/**
 * Close all modals
 */
export function closeAllModals() {
    try {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        console.log('All modals closed');
    } catch (error) {
        console.error('Error closing all modals:', error);
    }
}

/**
 * Toggle a modal's visibility
 * @param {string} modalId - Modal element ID
 */
export function toggleModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (modal.style.display === 'none' || modal.style.display === '') {
                showModal(modalId);
            } else {
                closeModal(modalId);
            }
        }
    } catch (error) {
        console.error('Error toggling modal:', error);
    }
}

/**
 * Check if a modal is open
 * @param {string} modalId - Modal element ID
 * @returns {boolean} True if modal is open
 */
export function isModalOpen(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            return modal.style.display === 'block';
        }
        return false;
    } catch (error) {
        console.error('Error checking modal state:', error);
        return false;
    }
}

/**
 * Initialize modal dragging functionality
 * @param {string} modalId - Modal element ID
 */
export function initModalDragging(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const modalContent = modal.querySelector('.modal-content');
        const modalHeader = modal.querySelector('.modal-header');

        if (!modalContent || !modalHeader) return;

        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        modalHeader.addEventListener('mousedown', function (e) {
            if (e.target.classList.contains('close-btn')) return;

            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === modalHeader || modalHeader.contains(e.target)) {
                isDragging = true;
                modalContent.style.transform = `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px))`;
            }
        });

        document.addEventListener('mousemove', function (e) {
            if (isDragging) {
                e.preventDefault();

                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                modalContent.style.transform = `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px))`;
            }
        });

        document.addEventListener('mouseup', function () {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        });

        // Reset position when modal closes
        modal.addEventListener('hide', function () {
            xOffset = 0;
            yOffset = 0;
            modalContent.style.transform = 'translate(-50%, -50%)';
        });

        console.log(`Modal dragging initialized: ${modalId}`);
    } catch (error) {
        console.error('Error initializing modal dragging:', error);
    }
}

/**
 * Enable modal drag
 * @param {HTMLElement} modal - Modal element
 */
export function enableModalDrag(modal) {
    if (!modal) return;
    const modalId = modal.id;
    initModalDragging(modalId);
}

/**
 * Disable modal drag
 * @param {HTMLElement} modal - Modal element
 */
export function disableModalDrag(modal) {
    // Remove event listeners (implementation depends on how listeners are stored)
    console.log('Modal drag disabled');
}

/**
 * Center a modal
 * @param {string} modalId - Modal element ID
 */
export function centerModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'translate(-50%, -50%)';
        }
    } catch (error) {
        console.error('Error centering modal:', error);
    }
}

/**
 * Resize a modal
 * @param {string} modalId - Modal element ID
 * @param {number} width - New width
 * @param {number} height - New height
 */
export function resizeModal(modalId, width, height) {
    try {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            if (width) modalContent.style.width = width + 'px';
            if (height) modalContent.style.height = height + 'px';
        }
    } catch (error) {
        console.error('Error resizing modal:', error);
    }
}

/**
 * Set modal title
 * @param {string} modalId - Modal element ID
 * @param {string} title - New title
 */
export function setModalTitle(modalId, title) {
    try {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const titleElement = modal.querySelector('.modal-header h3');
        if (titleElement) {
            titleElement.textContent = title;
        }
    } catch (error) {
        console.error('Error setting modal title:', error);
    }
}

/**
 * Set modal content
 * @param {string} modalId - Modal element ID
 * @param {string} content - New content (HTML string)
 */
export function setModalContent(modalId, content) {
    try {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const contentElement = modal.querySelector('.modal-body');
        if (contentElement) {
            contentElement.innerHTML = content;
        }
    } catch (error) {
        console.error('Error setting modal content:', error);
    }
}

/**
 * Open layer details modal
 * @param {string} layerId - Layer ID
 */
export function openLayerDetailsModal(layerId) {
    try {
        const modal = document.getElementById('layerDetailsModal');
        if (modal) {
            modal.setAttribute('data-layer-id', layerId);
            showModal('layerDetailsModal');
        }
    } catch (error) {
        console.error('Error opening layer details modal:', error);
    }
}

/**
 * Open settings modal
 */
export function openSettingsModal() {
    showModal('settingsModal');
}

/**
 * Open export modal
 */
export function openExportModal() {
    showModal('exportModal');
}

/**
 * Open import modal
 */
export function openImportModal() {
    showModal('importModal');
}

/**
 * Show create group modal
 */
export function showCreateGroupModal() {
    showModal('createModal');
    // Set modal mode to group creation
    const modal = document.getElementById('createModal');
    if (modal) {
        modal.setAttribute('data-create-type', 'group');
    }
}

/**
 * Show create layer modal
 */
export function showCreateLayerModal() {
    showModal('createModal');
    // Set modal mode to layer creation
    const modal = document.getElementById('createModal');
    if (modal) {
        modal.setAttribute('data-create-type', 'layer');
    }
}

/**
 * Show layer properties modal
 * @param {HTMLElement} element - Layer element
 */
export function showLayerProperties(element) {
    const layerItem = element.closest('.layer-item');
    if (layerItem) {
        const layerId = layerItem.getAttribute('data-layer-id');
        showModal('layerPropertiesModal');
        const modal = document.getElementById('layerPropertiesModal');
        if (modal) {
            modal.setAttribute('data-layer-id', layerId);
        }
    }
}

/**
 * Open layer details (alias for openLayerDetailsModal)
 * @param {HTMLElement} element - Layer element
 */
export function openLayerDetails(element) {
    const layerItem = element.closest('.layer-item');
    if (layerItem) {
        const layerId = layerItem.getAttribute('data-layer-id');
        openLayerDetailsModal(layerId);
    }
}

/**
 * Initialize all modal functionality
 */
export function initializeModals() {
    try {
        // Initialize dragging for all modals with .modal-draggable class
        document.querySelectorAll('.modal-draggable').forEach(modal => {
            if (modal.id) {
                initModalDragging(modal.id);
            }
        });

        // Setup close buttons
        document.querySelectorAll('.modal .close-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const modal = this.closest('.modal');
                if (modal && modal.id) {
                    closeModal(modal.id);
                }
            });
        });

        // Setup backdrop clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    closeModal(modal.id);
                }
            });
        });

        console.log('Modals initialized');
    } catch (error) {
        console.error('Error initializing modals:', error);
    }
}
