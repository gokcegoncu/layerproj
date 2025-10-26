/**
 * Categorized Style Module
 * Provides categorical/qualitative thematic mapping functionality
 */

import { AppState } from '../core/state.js';
import { showToast, showNotification } from '../ui/notifications.js';
import { ColorPalettes } from './color-palettes.js';

/**
 * Apply categorized style to features
 * Applies categorical colors based on a field value
 */
export function applyCategorizedStyle() {
    const fieldName = document.getElementById('categoryField')?.value;
    const rampName = document.getElementById('categoricalColorRamp')?.value || 'Set1';

    if (!fieldName) {
        showNotification('Please select a category field!', 'warning');
        return;
    }

    // Get active layerId from modal
    const modal = document.getElementById('styleModal');
    const layerId = modal?.dataset?.layerId;

    if (!layerId) {
        showNotification('Active layer not found!', 'error');
        return;
    }

    // Get only features from active layer
    const layerFeatures = state.drawnLayers.filter(l => l.layerId === layerId);

    if (layerFeatures.length === 0) {
        showNotification('No features found in this layer!', 'warning');
        return;
    }

    // Find unique categories
    const categories = new Set();
    layerFeatures.forEach(layerInfo => {
        if (layerInfo.properties && layerInfo.properties[fieldName]) {
            categories.add(layerInfo.properties[fieldName]);
        }
    });

    if (categories.size === 0) {
        showNotification('No data found in this field!', 'warning');
        return;
    }

    const colors = ColorPalettes.qualitative[rampName] || ColorPalettes.qualitative.Set1;
    const categoriesArray = Array.from(categories);
    const colorMap = {};

    categoriesArray.forEach((cat, i) => {
        colorMap[cat] = colors[i % colors.length];
    });

    // Apply color to each feature (ONLY ACTIVE LAYER)
    let applied = 0;
    layerFeatures.forEach(layerInfo => {
        if (layerInfo.properties && layerInfo.properties[fieldName]) {
            const category = layerInfo.properties[fieldName];
            const color = colorMap[category];

            if (layerInfo.layer && layerInfo.layer.setStyle) {
                const style = {
                    fillColor: color,
                    color: darkenColor(color, 20),
                    weight: 2,
                    fillOpacity: 0.7
                };

                // For point add radius for circle marker
                if (layerInfo.type === 'point') {
                    style.radius = 8;
                    layerInfo.layer.setStyle(style);
                    // Redraw circle marker
                    if (layerInfo.layer.redraw) {
                        layerInfo.layer.redraw();
                    }
                } else {
                    layerInfo.layer.setStyle(style);
                }

                // Bring layer to front (to improve visibility)
                if (layerInfo.layer.bringToFront) {
                    layerInfo.layer.bringToFront();
                }

                applied++;
            }
        }
    });

    // Refresh map
    if (state.map && state.map.invalidateSize) {
        setTimeout(() => state.map.invalidateSize(), 100);
    }

    showNotification(`✨ Categorized style applied! (${applied} features, ${categories.size} categories)`, 'success');
    console.log(`Categorized style applied: ${applied} features, layer: ${layerId}`);
}

/**
 * Get unique values from a field
 * @param {string} layerId - Layer ID
 * @param {string} fieldName - Field name
 * @returns {Array} - Array of unique values
 */
export function getCategorizedValues(layerId, fieldName) {
    if (!layerId || !fieldName) return [];

    const layerFeatures = state.drawnLayers.filter(l => l.layerId === layerId);
    const values = new Set();

    layerFeatures.forEach(layerInfo => {
        if (layerInfo.properties && layerInfo.properties[fieldName] !== undefined) {
            values.add(layerInfo.properties[fieldName]);
        }
    });

    return Array.from(values).sort();
}

/**
 * Update category preview
 * Shows preview of categories with their colors
 */
export function updateCategoryPreview() {
    const fieldName = document.getElementById('categoryField')?.value;
    const rampName = document.getElementById('categoricalColorRamp')?.value || 'Set1';
    const preview = document.getElementById('categoryPreview');

    if (!preview) return;

    if (!fieldName) {
        preview.innerHTML = '<p style="color: #999; font-size: 12px;">First select a category field</p>';
        return;
    }

    // Get active layerId from modal
    const modal = document.getElementById('styleModal');
    const layerId = modal?.dataset?.layerId;

    if (!layerId) {
        preview.innerHTML = '<p style="color: #999; font-size: 12px;">Active layer not found</p>';
        return;
    }

    // Get only features from active layer
    const layerFeatures = state.drawnLayers.filter(l => l.layerId === layerId);
    const categories = new Set();

    layerFeatures.forEach(layerInfo => {
        if (layerInfo.properties && layerInfo.properties[fieldName]) {
            categories.add(layerInfo.properties[fieldName]);
        }
    });

    if (categories.size === 0) {
        preview.innerHTML = `<p style="color: #999; font-size: 12px;">No data found in this field</p>`;
        return;
    }

    const colors = ColorPalettes.qualitative[rampName] || ColorPalettes.qualitative.Set1;
    const categoriesArray = Array.from(categories).sort();

    let html = '<div style="max-height: 200px; overflow-y: auto;">';
    categoriesArray.forEach((cat, i) => {
        const color = colors[i % colors.length];
        html += `
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
                <div style="width: 24px; height: 24px; background: ${color}; border: 1px solid #ccc; margin-right: 8px; flex-shrink: 0;"></div>
                <span style="font-size: 12px;">${cat}</span>
            </div>
        `;
    });
    html += '</div>';

    preview.innerHTML = html;

    // Show legend preview
    document.getElementById('legendPreview').style.display = 'block';
}

/**
 * Generate category colors automatically
 * @param {number} numCategories - Number of categories
 * @param {string} rampName - Color ramp name
 * @returns {Array} - Array of colors
 */
export function generateCategoryColors(numCategories, rampName = 'Set1') {
    const colors = ColorPalettes.qualitative[rampName] || ColorPalettes.qualitative.Set1;
    const result = [];

    for (let i = 0; i < numCategories; i++) {
        result.push(colors[i % colors.length]);
    }

    return result;
}

/**
 * Create custom category color map
 * @param {Array} categories - Array of category values
 * @param {Array} colors - Array of colors (optional)
 * @returns {Object} - Color map object
 */
export function createCategoryColorMap(categories, colors = null) {
    const colorMap = {};

    if (!colors) {
        colors = generateCategoryColors(categories.length);
    }

    categories.forEach((category, i) => {
        colorMap[category] = colors[i % colors.length];
    });

    return colorMap;
}

/**
 * Apply custom category colors
 * @param {string} layerId - Layer ID
 * @param {string} fieldName - Field name
 * @param {Object} colorMap - Color map object
 */
export function applyCustomCategoryColors(layerId, fieldName, colorMap) {
    if (!layerId || !fieldName || !colorMap) {
        console.error('applyCustomCategoryColors: Missing required parameters');
        return;
    }

    const layerFeatures = state.drawnLayers.filter(l => l.layerId === layerId);
    let applied = 0;

    layerFeatures.forEach(layerInfo => {
        if (layerInfo.properties && layerInfo.properties[fieldName]) {
            const category = layerInfo.properties[fieldName];
            const color = colorMap[category];

            if (color && layerInfo.layer && layerInfo.layer.setStyle) {
                const style = {
                    fillColor: color,
                    color: darkenColor(color, 20),
                    weight: 2,
                    fillOpacity: 0.7
                };

                if (layerInfo.type === 'point') {
                    style.radius = 8;
                }

                layerInfo.layer.setStyle(style);

                if (layerInfo.layer.redraw) {
                    layerInfo.layer.redraw();
                }

                if (layerInfo.layer.bringToFront) {
                    layerInfo.layer.bringToFront();
                }

                applied++;
            }
        }
    });

    console.log(`Custom category colors applied: ${applied} features`);
    return applied;
}

/**
 * Get category statistics
 * @param {string} layerId - Layer ID
 * @param {string} fieldName - Field name
 * @returns {Object} - Statistics object
 */
export function getCategoryStatistics(layerId, fieldName) {
    if (!layerId || !fieldName) return null;

    const layerFeatures = state.drawnLayers.filter(l => l.layerId === layerId);
    const counts = {};
    let total = 0;

    layerFeatures.forEach(layerInfo => {
        if (layerInfo.properties && layerInfo.properties[fieldName] !== undefined) {
            const category = layerInfo.properties[fieldName];
            counts[category] = (counts[category] || 0) + 1;
            total++;
        }
    });

    const statistics = {
        total: total,
        categories: Object.keys(counts).length,
        counts: counts,
        percentages: {}
    };

    // Calculate percentages
    Object.keys(counts).forEach(category => {
        statistics.percentages[category] = (counts[category] / total * 100).toFixed(2);
    });

    return statistics;
}

/**
 * Export category style configuration
 * @param {string} layerId - Layer ID
 * @param {string} fieldName - Field name
 * @returns {Object} - Style configuration
 */
export function exportCategoryStyleConfig(layerId, fieldName) {
    const categories = getCategorizedValues(layerId, fieldName);
    const rampName = document.getElementById('categoricalColorRamp')?.value || 'Set1';
    const colorMap = createCategoryColorMap(categories, generateCategoryColors(categories.length, rampName));

    return {
        type: 'categorized',
        layerId: layerId,
        fieldName: fieldName,
        rampName: rampName,
        categories: categories,
        colorMap: colorMap,
        statistics: getCategoryStatistics(layerId, fieldName)
    };
}

/**
 * Import category style configuration
 * @param {Object} config - Style configuration
 */
export function importCategoryStyleConfig(config) {
    if (!config || config.type !== 'categorized') {
        console.error('Invalid category style configuration');
        return;
    }

    // Set field
    const categoryField = document.getElementById('categoryField');
    if (categoryField) {
        categoryField.value = config.fieldName;
    }

    // Set color ramp
    const colorRamp = document.getElementById('categoricalColorRamp');
    if (colorRamp) {
        colorRamp.value = config.rampName || 'Set1';
    }

    // Apply colors
    if (config.layerId && config.fieldName && config.colorMap) {
        applyCustomCategoryColors(config.layerId, config.fieldName, config.colorMap);
    }

    // Update preview
    updateCategoryPreview();
}

/**
 * Darken a color by a percentage
 * @param {string} color - Hex color
 * @param {number} percent - Percentage to darken
 * @returns {string} - Darkened hex color
 */
function darkenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 +
        (B<255?B<1?0:B:255))
        .toString(16).slice(1);
}

/**
 * Create legend for categorized style
 * @param {Object} config - Style configuration
 * @returns {HTMLElement} - Legend element
 */
export function createCategorizedLegend(config) {
    const legendDiv = document.createElement('div');
    legendDiv.className = 'categorized-legend';
    legendDiv.style.padding = '10px';
    legendDiv.style.backgroundColor = 'white';
    legendDiv.style.borderRadius = '4px';
    legendDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    // Title
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    title.textContent = config.fieldName || 'Categories';
    legendDiv.appendChild(title);

    // Items
    if (config.colorMap) {
        Object.entries(config.colorMap).forEach(([category, color]) => {
            const itemDiv = document.createElement('div');
            itemDiv.style.display = 'flex';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.marginBottom = '4px';

            // Symbol
            const symbol = document.createElement('div');
            symbol.style.width = '20px';
            symbol.style.height = '16px';
            symbol.style.backgroundColor = color;
            symbol.style.marginRight = '8px';
            symbol.style.border = '1px solid #999';
            itemDiv.appendChild(symbol);

            // Label
            const label = document.createElement('span');
            label.style.fontSize = '12px';
            label.textContent = category;
            itemDiv.appendChild(label);

            // Count (if available)
            if (config.statistics && config.statistics.counts) {
                const count = config.statistics.counts[category];
                const countSpan = document.createElement('span');
                countSpan.style.fontSize = '10px';
                countSpan.style.color = '#666';
                countSpan.style.marginLeft = 'auto';
                countSpan.textContent = `(${count})`;
                itemDiv.appendChild(countSpan);
            }

            legendDiv.appendChild(itemDiv);
        });
    }

    return legendDiv;
}
