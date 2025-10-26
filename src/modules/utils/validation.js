/**
 * Input Validation Functions
 * Validates and sanitizes user inputs
 */

/**
 * Validate layer/group name
 * @param {string} name - The name to validate
 * @returns {Object} Validation result with valid flag and sanitized value or error
 */
export function validateName(name) {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: 'Ad boş olamaz' };
    }

    const trimmed = name.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: 'Ad boş olamaz' };
    }

    if (trimmed.length > 100) {
        return { valid: false, error: 'Ad çok uzun (max 100 karakter)' };
    }

    // Check for potentially dangerous characters
    const dangerousPattern = /<script|javascript:|onerror=|onclick=/i;
    if (dangerousPattern.test(trimmed)) {
        return { valid: false, error: 'Geçersiz karakterler içeriyor' };
    }

    return { valid: true, sanitized: sanitizeInput(trimmed) };
}

/**
 * Validate layer name specifically
 * @param {string} name - The layer name to validate
 * @returns {string} The validated and trimmed name
 * @throws {Error} If validation fails
 */
export function validateLayerName(name) {
    if (!name || typeof name !== 'string') {
        throw new Error('Katman adı geçersiz');
    }
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 50) {
        throw new Error('Katman adı 1-50 karakter arasında olmalı');
    }
    return trimmed;
}

/**
 * Validate color value
 * @param {string} color - The color value to validate (hex format)
 * @returns {string} The validated color
 * @throws {Error} If validation fails
 */
export function validateColor(color) {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(color)) {
        throw new Error('Geçersiz renk formatı');
    }
    return color;
}

/**
 * Sanitize input to prevent XSS attacks
 * @param {string} input - The input to sanitize
 * @returns {string} The sanitized input
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return '';

    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Format coordinate value
 * @param {number} value - The coordinate value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted coordinate
 */
export function formatCoordinate(value, decimals = 6) {
    return parseFloat(value).toFixed(decimals);
}

/**
 * Validate numeric input
 * @param {any} value - The value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {Object} Validation result
 */
export function validateNumeric(value, min, max) {
    const num = parseFloat(value);

    if (isNaN(num)) {
        return { valid: false, error: 'Geçersiz sayı' };
    }

    if (min !== undefined && num < min) {
        return { valid: false, error: `Değer ${min}'den küçük olamaz` };
    }

    if (max !== undefined && num > max) {
        return { valid: false, error: `Değer ${max}'den büyük olamaz` };
    }

    return { valid: true, value: num };
}
