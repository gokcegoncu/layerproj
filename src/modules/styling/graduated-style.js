/**
 * Graduated Style Module
 * Provides graduated/quantitative thematic mapping with statistical classification methods
 */

import { AppState } from '../core/state.js';
import { showToast, showNotification } from '../ui/notifications.js';
import { ColorPalettes } from './color-palettes.js';

/**
 * Apply graduated style to features
 * Applies sequential colors based on numeric values with classification
 */
export function applyGraduatedStyle() {
    const fieldName = document.getElementById('valueField')?.value;
    const method = document.getElementById('classificationMethod')?.value || 'quantile';
    const numClasses = parseInt(document.getElementById('numClasses')?.value || 5);
    const rampType = document.getElementById('colorRampType')?.value || 'sequential';
    const rampName = document.getElementById('colorRampName')?.value || 'Viridis';
    const invert = document.getElementById('invertColorRamp')?.checked || false;

    if (!fieldName) {
        showNotification('Please select a value field!', 'warning');
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

    // Collect values
    const values = [];
    layerFeatures.forEach(layerInfo => {
        if (layerInfo.properties && layerInfo.properties[fieldName] !== undefined) {
            values.push(layerInfo.properties[fieldName]);
        }
    });

    if (values.length === 0) {
        showNotification('No data found in this field!', 'warning');
        return;
    }

    // Calculate class breaks
    const breaks = calculateClassBreaks(values, method, numClasses);

    // Get color palette
    let colors = ColorPalettes[rampType][rampName] || ColorPalettes.sequential.Viridis;
    const sampledColors = sampleColors(colors, numClasses);

    if (invert) {
        sampledColors.reverse();
    }

    // Apply color to each feature (ONLY ACTIVE LAYER)
    let applied = 0;
    layerFeatures.forEach(layerInfo => {
        if (layerInfo.properties && layerInfo.properties[fieldName] !== undefined) {
            const value = layerInfo.properties[fieldName];

            // Find which class the value belongs to
            let classIndex = 0;
            for (let i = 0; i < breaks.length - 1; i++) {
                if (value >= breaks[i] && value <= breaks[i + 1]) {
                    classIndex = i;
                    break;
                }
            }

            const color = sampledColors[classIndex];

            if (layerInfo.layer && layerInfo.layer.setStyle) {
                const style = {
                    fillColor: color,
                    color: darkenColor(color, 20),
                    weight: 2,
                    fillOpacity: 0.7
                };

                // For point add radius
                if (layerInfo.type === 'point') {
                    style.radius = 8;
                }

                layerInfo.layer.setStyle(style);

                // Redraw layer
                if (layerInfo.layer.redraw) {
                    layerInfo.layer.redraw();
                }

                // Bring layer to front
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

    showNotification(`📊 Graduated style applied! (${applied} features, ${numClasses} classes)`, 'success');
    console.log(`Graduated style applied: ${applied} features, layer: ${layerId}, method: ${method}`);
}

/**
 * Calculate class breaks using various classification methods
 * @param {Array} values - Array of numeric values
 * @param {string} method - Classification method (equal, quantile, natural, manual)
 * @param {number} numClasses - Number of classes
 * @returns {Array} - Array of break values
 */
export function calculateClassBreaks(values, method, numClasses) {
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const breaks = [min];

    if (method === 'equal') {
        // Equal interval
        const interval = (max - min) / numClasses;
        for (let i = 1; i < numClasses; i++) {
            breaks.push(min + interval * i);
        }
    } else if (method === 'quantile') {
        // Quantile (equal count)
        const interval = sorted.length / numClasses;
        for (let i = 1; i < numClasses; i++) {
            const index = Math.floor(interval * i);
            breaks.push(sorted[index]);
        }
    } else if (method === 'natural') {
        // Natural breaks (simplified Jenks)
        breaks.push(...jenksBreaks(sorted, numClasses));
        return breaks;
    } else {
        // Manual - use equal interval
        const interval = (max - min) / numClasses;
        for (let i = 1; i < numClasses; i++) {
            breaks.push(min + interval * i);
        }
    }

    breaks.push(max);
    return breaks;
}

/**
 * Jenks Natural Breaks classification (simplified)
 * @param {Array} values - Sorted array of values
 * @param {number} numClasses - Number of classes
 * @returns {Array} - Array of break points
 */
export function jenksBreaks(values, numClasses) {
    const n = values.length;
    const breaks = [];

    // Simplified version: minimize variance
    const chunkSize = Math.floor(n / numClasses);
    for (let i = 1; i < numClasses; i++) {
        const index = Math.min(i * chunkSize, n - 1);
        breaks.push(values[index]);
    }

    return breaks;
}

/**
 * Quantile classification
 * @param {Array} values - Array of values
 * @param {number} numClasses - Number of classes
 * @returns {Array} - Array of break values
 */
export function quantileClassification(values, numClasses) {
    const sorted = [...values].sort((a, b) => a - b);
    const breaks = [sorted[0]];
    const interval = sorted.length / numClasses;

    for (let i = 1; i < numClasses; i++) {
        const index = Math.floor(interval * i);
        breaks.push(sorted[index]);
    }

    breaks.push(sorted[sorted.length - 1]);
    return breaks;
}

/**
 * Equal interval classification
 * @param {Array} values - Array of values
 * @param {number} numClasses - Number of classes
 * @returns {Array} - Array of break values
 */
export function equalIntervalClassification(values, numClasses) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const breaks = [min];
    const interval = (max - min) / numClasses;

    for (let i = 1; i < numClasses; i++) {
        breaks.push(min + interval * i);
    }

    breaks.push(max);
    return breaks;
}

/**
 * Natural breaks (Jenks) classification
 * @param {Array} values - Array of values
 * @param {number} numClasses - Number of classes
 * @returns {Array} - Array of break values
 */
export function naturalBreaks(values, numClasses) {
    const sorted = [...values].sort((a, b) => a - b);
    const breaks = [sorted[0]];

    // Jenks natural breaks algorithm
    breaks.push(...jenksBreaks(sorted, numClasses));
    breaks.push(sorted[sorted.length - 1]);

    return breaks;
}

/**
 * Standard deviation classification
 * @param {Array} values - Array of values
 * @param {number} numClasses - Number of classes
 * @returns {Array} - Array of break values
 */
export function standardDeviationClassification(values, numClasses) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const breaks = [];
    const halfClasses = Math.floor(numClasses / 2);

    for (let i = -halfClasses; i <= halfClasses; i++) {
        breaks.push(mean + (i * stdDev));
    }

    return breaks.sort((a, b) => a - b);
}

/**
 * Sample colors from palette
 * @param {Array} colors - Color palette
 * @param {number} numClasses - Number of classes
 * @returns {Array} - Sampled colors
 */
export function sampleColors(colors, numClasses) {
    if (colors.length === numClasses) {
        return [...colors];
    }

    const sampled = [];
    const step = (colors.length - 1) / (numClasses - 1);

    for (let i = 0; i < numClasses; i++) {
        const index = Math.round(i * step);
        sampled.push(colors[index]);
    }

    return sampled;
}

/**
 * Update graduated preview
 * Shows preview of classes with their colors
 */
export function updateGraduatedPreview() {
    const fieldName = document.getElementById('valueField')?.value;
    const method = document.getElementById('classificationMethod')?.value || 'quantile';
    const numClasses = parseInt(document.getElementById('numClasses')?.value || 5);
    const rampType = document.getElementById('colorRampType')?.value || 'sequential';
    const rampName = document.getElementById('colorRampName')?.value || 'Viridis';
    const invert = document.getElementById('invertColorRamp')?.checked || false;
    const preview = document.getElementById('graduatedPreview');

    if (!preview) return;

    if (!fieldName) {
        preview.innerHTML = '<p style="color: #999; font-size: 12px;">First select a value field</p>';
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

    // Collect values
    const values = [];
    layerFeatures.forEach(layerInfo => {
        if (layerInfo.properties && layerInfo.properties[fieldName] !== undefined) {
            values.push(layerInfo.properties[fieldName]);
        }
    });

    if (values.length === 0) {
        preview.innerHTML = `<p style="color: #999; font-size: 12px;">No data found in this field</p>`;
        return;
    }

    // Calculate breaks
    const breaks = calculateClassBreaks(values, method, numClasses);

    // Get colors
    let colors = ColorPalettes[rampType][rampName] || ColorPalettes.sequential.Viridis;
    const sampledColors = sampleColors(colors, numClasses);

    if (invert) {
        sampledColors.reverse();
    }

    // Generate preview HTML
    let html = '<div style="max-height: 200px; overflow-y: auto;">';
    for (let i = 0; i < breaks.length - 1; i++) {
        const min = breaks[i].toFixed(2);
        const max = breaks[i + 1].toFixed(2);
        const color = sampledColors[i];

        html += `
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
                <div style="width: 24px; height: 24px; background: ${color}; border: 1px solid #ccc; margin-right: 8px; flex-shrink: 0;"></div>
                <span style="font-size: 12px;">${min} - ${max}</span>
            </div>
        `;
    }
    html += '</div>';

    preview.innerHTML = html;

    // Show legend preview
    document.getElementById('legendPreview').style.display = 'block';
    updateLegendPreview(breaks, sampledColors);
}

/**
 * Update legend preview
 * @param {Array} breaks - Class breaks
 * @param {Array} colors - Colors for each class
 */
function updateLegendPreview(breaks, colors) {
    const content = document.getElementById('legendContent');
    if (!content) return;

    let html = '';

    for (let i = 0; i < breaks.length - 1; i++) {
        const min = breaks[i].toFixed(1);
        const max = breaks[i + 1].toFixed(1);
        html += `
            <div class="legend-item">
                <div class="legend-symbol" style="background: ${colors[i]}"></div>
                <span class="legend-label">${min} - ${max}</span>
            </div>
        `;
    }

    content.innerHTML = html;
}

/**
 * Get numeric values from field
 * @param {string} layerId - Layer ID
 * @param {string} fieldName - Field name
 * @returns {Array} - Array of numeric values
 */
export function getNumericValues(layerId, fieldName) {
    if (!layerId || !fieldName) return [];

    const layerFeatures = state.drawnLayers.filter(l => l.layerId === layerId);
    const values = [];

    layerFeatures.forEach(layerInfo => {
        if (layerInfo.properties && layerInfo.properties[fieldName] !== undefined) {
            const value = parseFloat(layerInfo.properties[fieldName]);
            if (!isNaN(value)) {
                values.push(value);
            }
        }
    });

    return values;
}

/**
 * Get statistics for numeric field
 * @param {Array} values - Array of numeric values
 * @returns {Object} - Statistics object
 */
export function getStatistics(values) {
    if (!values || values.length === 0) {
        return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const median = n % 2 === 0
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        : sorted[Math.floor(n / 2)];

    return {
        count: n,
        min: sorted[0],
        max: sorted[n - 1],
        sum: sum,
        mean: mean,
        median: median,
        variance: variance,
        stdDev: stdDev,
        range: sorted[n - 1] - sorted[0]
    };
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
 * Export graduated style configuration
 * @param {string} layerId - Layer ID
 * @param {string} fieldName - Field name
 * @returns {Object} - Style configuration
 */
export function exportGraduatedStyleConfig(layerId, fieldName) {
    const method = document.getElementById('classificationMethod')?.value || 'quantile';
    const numClasses = parseInt(document.getElementById('numClasses')?.value || 5);
    const rampType = document.getElementById('colorRampType')?.value || 'sequential';
    const rampName = document.getElementById('colorRampName')?.value || 'Viridis';
    const invert = document.getElementById('invertColorRamp')?.checked || false;

    const values = getNumericValues(layerId, fieldName);
    const breaks = calculateClassBreaks(values, method, numClasses);
    const colors = sampleColors(ColorPalettes[rampType][rampName], numClasses);

    if (invert) {
        colors.reverse();
    }

    return {
        type: 'graduated',
        layerId: layerId,
        fieldName: fieldName,
        method: method,
        numClasses: numClasses,
        rampType: rampType,
        rampName: rampName,
        invert: invert,
        breaks: breaks,
        colors: colors,
        statistics: getStatistics(values)
    };
}

/**
 * Import graduated style configuration
 * @param {Object} config - Style configuration
 */
export function importGraduatedStyleConfig(config) {
    if (!config || config.type !== 'graduated') {
        console.error('Invalid graduated style configuration');
        return;
    }

    // Set field
    const valueField = document.getElementById('valueField');
    if (valueField) {
        valueField.value = config.fieldName;
    }

    // Set method
    const methodSelect = document.getElementById('classificationMethod');
    if (methodSelect) {
        methodSelect.value = config.method || 'quantile';
    }

    // Set num classes
    const numClassesInput = document.getElementById('numClasses');
    if (numClassesInput) {
        numClassesInput.value = config.numClasses || 5;
    }

    // Set color ramp
    const rampType = document.getElementById('colorRampType');
    if (rampType) {
        rampType.value = config.rampType || 'sequential';
    }

    const rampName = document.getElementById('colorRampName');
    if (rampName) {
        rampName.value = config.rampName || 'Viridis';
    }

    // Set invert
    const invertCheckbox = document.getElementById('invertColorRamp');
    if (invertCheckbox) {
        invertCheckbox.checked = config.invert || false;
    }

    // Apply style
    applyGraduatedStyle();

    // Update preview
    updateGraduatedPreview();
}

/**
 * Create legend for graduated style
 * @param {Object} config - Style configuration
 * @returns {HTMLElement} - Legend element
 */
export function createGraduatedLegend(config) {
    const legendDiv = document.createElement('div');
    legendDiv.className = 'graduated-legend';
    legendDiv.style.padding = '10px';
    legendDiv.style.backgroundColor = 'white';
    legendDiv.style.borderRadius = '4px';
    legendDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    // Title
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    title.textContent = config.fieldName || 'Values';
    legendDiv.appendChild(title);

    // Items
    if (config.breaks && config.colors) {
        for (let i = 0; i < config.breaks.length - 1; i++) {
            const min = config.breaks[i].toFixed(2);
            const max = config.breaks[i + 1].toFixed(2);
            const color = config.colors[i];

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
            label.textContent = `${min} - ${max}`;
            itemDiv.appendChild(label);

            legendDiv.appendChild(itemDiv);
        }
    }

    return legendDiv;
}
