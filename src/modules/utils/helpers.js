/**
 * General Utility Helper Functions
 * Common utility functions used throughout the application
 */

import { CONFIG } from '../core/config.js';

/**
 * Debounce function execution
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = CONFIG.DEBOUNCE_DELAY) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function execution
 * @param {Function} func - The function to throttle
 * @param {number} limit - The throttle limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = CONFIG.THROTTLE_DELAY) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Safely execute a function with error handling
 * @param {Function} fn - The function to execute
 * @param {string} errorContext - Context for error message
 * @returns {any} Function result or null on error
 */
export function safeExecute(fn, errorContext = 'Operation') {
    try {
        return fn();
    } catch (error) {
        console.error(`[${errorContext}]`, error);
        return null;
    }
}

/**
 * Generate a unique ID
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'item') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convert RGB color to HEX
 * @param {string} rgb - RGB color string
 * @returns {string} HEX color string
 */
export function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;

    const result = rgb.match(/\d+/g);
    if (!result) return '#000000';

    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Convert HEX color to RGBA
 * @param {string} hex - HEX color string
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color string
 */
export function hexToRgba(hex, opacity) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0, 0, 0, ${opacity})`;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Calculate dash array for line styling
 * @param {string} type - Line type (solid, dashed, dotted, dashDot)
 * @param {number} width - Line width
 * @returns {string|null} Dash array string or null for solid
 */
export function calculateDashArray(type, width) {
    if (!type || type === 'solid') return null;

    const scaleFactor = Math.max(1, width / 2);

    if (type === 'dashed') {
        const dash = Math.round(8 * scaleFactor);
        const gap = Math.round(4 * scaleFactor);
        return `${dash}, ${gap}`;
    } else if (type === 'dotted') {
        const dot = Math.round(2 * scaleFactor);
        const gap = Math.round(4 * scaleFactor);
        return `${dot}, ${gap}`;
    } else if (type === 'dashDot') {
        const dash = Math.round(8 * scaleFactor);
        const gap1 = Math.round(4 * scaleFactor);
        const dot = Math.round(2 * scaleFactor);
        const gap2 = Math.round(4 * scaleFactor);
        return `${dash}, ${gap1}, ${dot}, ${gap2}`;
    }

    return null;
}

/**
 * Detect line type from dash array
 * @param {string} dashArray - The dash array string
 * @returns {string} Line type
 */
export function detectLineTypeFromDashArray(dashArray) {
    if (!dashArray) return 'solid';

    const parts = dashArray.split(',').map(p => parseInt(p.trim()));
    if (parts.length < 2) return 'solid';

    const ratio1 = parts[0] / parts[1];

    if (parts.length === 2) {
        if (ratio1 >= 1.5 && ratio1 <= 2.5) return 'dashed';
        if (ratio1 >= 0.3 && ratio1 <= 0.7) return 'dotted';
    } else if (parts.length === 4) {
        const ratio2 = parts[2] / parts[3];
        if (ratio1 >= 1.5 && ratio2 >= 0.3 && ratio2 <= 0.7) return 'dashDot';
    }

    return 'solid';
}

/**
 * Deep clone an object
 * @param {any} obj - The object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is empty
 * @param {any} value - The value to check
 * @returns {boolean} True if empty
 */
export function isEmpty(value) {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}
