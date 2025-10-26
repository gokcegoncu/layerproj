/**
 * Security Functions
 * XSS protection and security utilities
 */

/**
 * Escape HTML to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} Escaped HTML
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Sanitize URL to prevent javascript: protocol
 * @param {string} url - The URL to sanitize
 * @returns {string} Safe URL or empty string
 */
export function sanitizeUrl(url) {
    if (!url) return '';

    const trimmed = url.trim().toLowerCase();

    // Block dangerous protocols
    if (trimmed.startsWith('javascript:') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('vbscript:')) {
        return '';
    }

    return url;
}

/**
 * Check if string contains dangerous patterns
 * @param {string} input - The input to check
 * @returns {boolean} True if dangerous patterns found
 */
export function containsDangerousPatterns(input) {
    if (!input || typeof input !== 'string') return false;

    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /onerror=/i,
        /onclick=/i,
        /onload=/i,
        /<iframe/i
    ];

    return dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Strip HTML tags from string
 * @param {string} html - The HTML string
 * @returns {string} Text without HTML tags
 */
export function stripHtmlTags(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}
