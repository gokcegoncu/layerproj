/**
 * DOM Manipulation Helper Functions
 * Utilities for working with the DOM
 */

/**
 * Create an element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string|HTMLElement} content - Element content
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);

    Object.keys(attributes).forEach(key => {
        if (key === 'className') {
            element.className = attributes[key];
        } else if (key === 'dataset') {
            Object.keys(attributes[key]).forEach(dataKey => {
                element.dataset[dataKey] = attributes[key][dataKey];
            });
        } else {
            element.setAttribute(key, attributes[key]);
        }
    });

    if (typeof content === 'string') {
        element.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        element.appendChild(content);
    }

    return element;
}

/**
 * Remove all children from an element
 * @param {HTMLElement} element - The parent element
 */
export function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Add event listener with automatic cleanup tracking
 * @param {HTMLElement} element - The element to attach listener to
 * @param {string} event - The event name
 * @param {Function} handler - The event handler
 * @param {Object} options - Event listener options
 */
export function addEventListenerWithCleanup(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);

    // Track for cleanup
    if (!element._eventListeners) {
        element._eventListeners = [];
    }
    element._eventListeners.push({ event, handler, options });
}

/**
 * Remove all tracked event listeners from an element
 * @param {HTMLElement} element - The element to clean up
 */
export function removeAllEventListeners(element) {
    if (element._eventListeners) {
        element._eventListeners.forEach(({ event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        element._eventListeners = [];
    }
}

/**
 * Toggle class on element
 * @param {HTMLElement} element - The element
 * @param {string} className - The class name
 * @param {boolean} force - Force add/remove
 */
export function toggleClass(element, className, force) {
    if (force === undefined) {
        element.classList.toggle(className);
    } else {
        element.classList.toggle(className, force);
    }
}

/**
 * Get element position relative to viewport
 * @param {HTMLElement} element - The element
 * @returns {Object} Position object with top, left, width, height
 */
export function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom + window.scrollY,
        right: rect.right + window.scrollX
    };
}

/**
 * Check if element is visible in viewport
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if visible
 */
export function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Find closest parent element matching selector
 * @param {HTMLElement} element - Starting element
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null} Matching parent element or null
 */
export function findClosest(element, selector) {
    return element.closest(selector);
}

/**
 * Show element
 * @param {HTMLElement} element - The element to show
 * @param {string} displayType - Display type (block, flex, etc.)
 */
export function showElement(element, displayType = 'block') {
    element.style.display = displayType;
}

/**
 * Hide element
 * @param {HTMLElement} element - The element to hide
 */
export function hideElement(element) {
    element.style.display = 'none';
}

/**
 * Toggle element visibility
 * @param {HTMLElement} element - The element
 * @param {string} displayType - Display type when showing
 */
export function toggleElement(element, displayType = 'block') {
    if (element.style.display === 'none' || element.style.display === '') {
        showElement(element, displayType);
    } else {
        hideElement(element);
    }
}
