/**
 * Legend Module
 * Manages legend display, content, and settings for map layers
 */

import { AppState } from '../core/state.js';
import { detectLineTypeFromDashArray } from '../styling/style-manager.js';

// Legend state
let legendVisible = false;
let legendCollapsed = false;
let legendDragData = null;

/**
 * Toggle legend visibility
 */
export function toggleLegend() {
    const legendContainer = document.getElementById('legendContainer');
    const legendBtn = document.getElementById('legendBtn');

    legendVisible = !legendVisible;

    if (legendVisible) {
        legendContainer.style.display = 'block';
        legendBtn.classList.add('active');
        legendBtn.title = 'Close Legend';
        updateLegendContent();
    } else {
        legendContainer.style.display = 'none';
        legendBtn.classList.remove('active');
        legendBtn.title = 'Open Legend';
    }
}

/**
 * Show legend
 */
export function showLegend() {
    legendVisible = true;
    const legendContainer = document.getElementById('legendContainer');
    const legendBtn = document.getElementById('legendBtn');

    legendContainer.style.display = 'block';
    legendBtn.classList.add('active');
    legendBtn.title = 'Close Legend';
    updateLegendContent();
}

/**
 * Hide legend
 */
export function hideLegend() {
    legendVisible = false;
    const legendContainer = document.getElementById('legendContainer');
    const legendBtn = document.getElementById('legendBtn');

    legendContainer.style.display = 'none';
    legendBtn.classList.remove('active');
    legendBtn.title = 'Open Legend';
}

/**
 * Close legend
 */
export function closeLegend() {
    hideLegend();
}

/**
 * Toggle legend content collapse/expand
 */
export function toggleLegendContent() {
    const legendContent = document.getElementById('legendContent');
    const collapseBtn = document.getElementById('legendCollapseBtn');

    legendCollapsed = !legendCollapsed;

    if (legendCollapsed) {
        legendContent.classList.add('collapsed');
        collapseBtn.textContent = '+';
    } else {
        legendContent.classList.remove('collapsed');
        collapseBtn.textContent = '−';
    }
}

/**
 * Toggle legend settings
 */
export function toggleLegendSettings() {
    const legendSettings = document.getElementById('legendSettings');
    const settingsBtn = document.getElementById('legendSettingsBtn');

    if (legendSettings.style.display === 'none') {
        legendSettings.style.display = 'block';
        settingsBtn.style.background = 'rgba(255,255,255,0.3)';
    } else {
        legendSettings.style.display = 'none';
        settingsBtn.style.background = 'none';
    }
}

/**
 * Update legend symbol size display
 */
export function updateLegendSymbolSizeDisplay() {
    const sizeInput = document.getElementById('legendSymbolSize');
    const sizeDisplay = document.getElementById('legendSymbolSizeDisplay');
    if (sizeInput && sizeDisplay) {
        sizeDisplay.textContent = sizeInput.value + 'x';
    }
}

/**
 * Get actual styles from layer features
 * @param {string} layerId - Layer ID
 * @returns {Object} - Styles object with point, line, and polygon styles
 */
export function getLayerActualStyles(layerId) {
    const features = state.layerFeatures[layerId] || [];
    const styles = {
        point: { color: '#3388ff', size: 8, shape: 'circle', opacity: 1 },
        line: { color: '#ff7800', width: 3, opacity: 1, type: 'solid' },
        polygon: { fillColor: '#3388ff', fillOpacity: 0.5, strokeColor: '#000000', strokeWidth: 1, strokeOpacity: 1, strokeType: 'solid' }
    };

    // Get style info from first drawing
    features.forEach(feature => {
        if (feature.layer && feature.layer.options && feature.layer.options.styleInfo) {
            const styleInfo = feature.layer.options.styleInfo;

            if (feature.type === 'point' && styleInfo.type === 'point') {
                styles.point = {
                    color: styleInfo.color || styles.point.color,
                    size: styleInfo.size || styles.point.size,
                    shape: styleInfo.shape || styles.point.shape,
                    opacity: styleInfo.opacity || styles.point.opacity
                };
            } else if (feature.type === 'line' && styleInfo.type === 'line') {
                styles.line = {
                    color: styleInfo.color || styles.line.color,
                    width: styleInfo.width || styles.line.width,
                    opacity: styleInfo.opacity || styles.line.opacity,
                    type: styleInfo.lineType || styles.line.type
                };
            } else if (feature.type === 'polygon' && styleInfo.type === 'polygon') {
                styles.polygon = {
                    fillColor: styleInfo.fillColor || styles.polygon.fillColor,
                    fillOpacity: styleInfo.fillOpacity || styles.polygon.fillOpacity,
                    strokeColor: styleInfo.strokeColor || styles.polygon.strokeColor,
                    strokeWidth: styleInfo.strokeWidth || styles.polygon.strokeWidth,
                    strokeOpacity: styleInfo.strokeOpacity || styles.polygon.strokeOpacity,
                    strokeType: styleInfo.strokeType || styles.polygon.strokeType
                };
            }
        } else if (feature.layer) {
            // Get directly from layer properties
            if (feature.type === 'line' && feature.layer.options) {
                styles.line = {
                    color: feature.layer.options.color || styles.line.color,
                    width: feature.layer.options.weight || styles.line.width,
                    opacity: feature.layer.options.opacity || styles.line.opacity,
                    type: detectLineTypeFromDashArray(feature.layer.options.dashArray)
                };
            } else if (feature.type === 'polygon' && feature.layer.options) {
                styles.polygon = {
                    fillColor: feature.layer.options.fillColor || styles.polygon.fillColor,
                    fillOpacity: feature.layer.options.fillOpacity || styles.polygon.fillOpacity,
                    strokeColor: feature.layer.options.color || styles.polygon.strokeColor,
                    strokeWidth: feature.layer.options.weight || styles.polygon.strokeWidth,
                    strokeOpacity: feature.layer.options.opacity || styles.polygon.strokeOpacity,
                    strokeType: detectLineTypeFromDashArray(feature.layer.options.dashArray)
                };
            }
        }
    });

    return styles;
}

/**
 * Update legend content based on current layers
 */
export function updateLegendContent() {
    const legendItems = document.getElementById('legendItems');
    if (!legendItems) return;

    legendItems.innerHTML = '';

    // Get settings
    const showEmptyLayers = document.getElementById('showEmptyLayers')?.checked || false;
    const showTypeLabels = document.getElementById('showTypeLabels')?.checked || true;
    const showOnlyVisible = document.getElementById('showOnlyVisible')?.checked || false;
    const showSelectedOnly = document.getElementById('showSelectedOnly')?.checked || false;
    const symbolScale = parseFloat(document.getElementById('legendSymbolSize')?.value || 1);

    // Collect visible layers
    const visibleLayers = [];

    // Get layers from DOM
    const layerItems = document.querySelectorAll('.layer-item');
    layerItems.forEach(layerItem => {
        const checkbox = layerItem.querySelector('.layer-visibility');
        const groupElement = layerItem.closest('.layer-group');
        const isSelected = layerItem.classList.contains('selected-highlight');

        // Filter conditions
        let shouldShow = true;

        // Show only selected layer setting
        if (showSelectedOnly && !isSelected) {
            shouldShow = false;
        }

        // Show only visible layers setting
        if (showOnlyVisible && (!checkbox || !checkbox.checked)) {
            shouldShow = false;
        }

        if (shouldShow) {
            const layerId = layerItem.getAttribute('data-layer-id');
            const layerName = layerItem.querySelector('.layer-name')?.textContent || 'Unnamed';
            const groupName = groupElement?.querySelector('.group-name')?.textContent || 'Default';

            // Check drawing types in layer
            const features = state.layerFeatures[layerId] || [];
            const hasPoint = features.some(f => f.type === 'point');
            const hasLine = features.some(f => f.type === 'line');
            const hasPolygon = features.some(f => f.type === 'polygon');
            const isEmpty = features.length === 0;

            // Filter based on show empty layers setting
            if (!isEmpty || showEmptyLayers) {
                const actualStyles = getLayerActualStyles(layerId);
                visibleLayers.push({
                    name: layerName,
                    group: groupName,
                    hasPoint,
                    hasLine,
                    hasPolygon,
                    features: features,
                    isEmpty: isEmpty,
                    isVisible: checkbox && checkbox.checked,
                    isSelected: isSelected,
                    layerId: layerId,
                    styles: actualStyles
                });
            }
        }
    });

    if (visibleLayers.length === 0) {
        legendItems.innerHTML = '<div style="text-align: center; color: #666; font-style: italic; padding: 20px;">No visible layers</div>';
        return;
    }

    // Organize by groups
    const groupedLayers = {};
    visibleLayers.forEach(layer => {
        if (!groupedLayers[layer.group]) {
            groupedLayers[layer.group] = [];
        }
        groupedLayers[layer.group].push(layer);
    });

    // Create legend items
    Object.keys(groupedLayers).forEach(groupName => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'legend-group';

        const groupTitle = document.createElement('div');
        groupTitle.className = 'legend-group-title';
        groupTitle.textContent = groupName;
        groupDiv.appendChild(groupTitle);

        groupedLayers[groupName].forEach(layer => {
            const item = createLegendItem(layer, symbolScale, showTypeLabels);
            groupDiv.appendChild(item);
        });

        legendItems.appendChild(groupDiv);
    });
}

/**
 * Create a legend item for a layer
 * @param {Object} layer - Layer data
 * @param {number} symbolScale - Symbol scale factor
 * @param {boolean} showTypeLabels - Whether to show type labels
 * @returns {HTMLElement} - Legend item element
 */
export function createLegendItem(layer, symbolScale = 1, showTypeLabels = true) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'legend-item';

    // Highlight selected layer
    if (layer.isSelected) {
        itemDiv.style.backgroundColor = '#e3f2fd';
        itemDiv.style.border = '1px solid #2196f3';
        itemDiv.style.borderRadius = '4px';
        itemDiv.style.padding = '4px';
    }

    // Dim invisible layers
    if (!layer.isVisible) {
        itemDiv.style.opacity = '0.5';
    }

    // Layer name and symbols
    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.marginBottom = showTypeLabels ? '4px' : '0';

    // Symbols (visual only, no text)
    if (!layer.isEmpty) {
        const symbolsDiv = document.createElement('div');
        symbolsDiv.style.display = 'flex';
        symbolsDiv.style.gap = '4px';
        symbolsDiv.style.marginRight = '8px';

        if (layer.hasPoint) {
            const pointSymbol = createPointSymbol(layer.styles.point, symbolScale);
            symbolsDiv.appendChild(pointSymbol);
        }

        if (layer.hasLine) {
            const lineSymbol = createLineSymbol(layer.styles.line, symbolScale);
            symbolsDiv.appendChild(lineSymbol);
        }

        if (layer.hasPolygon) {
            const polygonSymbol = createPolygonSymbol(layer.styles.polygon, symbolScale);
            symbolsDiv.appendChild(polygonSymbol);
        }

        headerDiv.appendChild(symbolsDiv);
    }

    // Layer name
    const nameSpan = document.createElement('span');
    nameSpan.style.fontWeight = 'bold';
    nameSpan.style.fontSize = '12px';
    nameSpan.textContent = layer.name;
    headerDiv.appendChild(nameSpan);

    itemDiv.appendChild(headerDiv);

    // Type labels (optional)
    if (showTypeLabels && !layer.isEmpty) {
        const typesDiv = document.createElement('div');
        typesDiv.style.fontSize = '10px';
        typesDiv.style.color = '#666';
        typesDiv.style.marginLeft = '24px';

        const types = [];
        if (layer.hasPoint) types.push(`Point (${layer.features.filter(f => f.type === 'point').length})`);
        if (layer.hasLine) types.push(`Line (${layer.features.filter(f => f.type === 'line').length})`);
        if (layer.hasPolygon) types.push(`Polygon (${layer.features.filter(f => f.type === 'polygon').length})`);

        typesDiv.textContent = types.join(', ');
        itemDiv.appendChild(typesDiv);
    }

    return itemDiv;
}

/**
 * Create point symbol for legend
 * @param {Object} style - Point style
 * @param {number} scale - Scale factor
 * @returns {HTMLElement} - Symbol element
 */
function createPointSymbol(style, scale) {
    const symbol = document.createElement('div');
    const size = Math.round(style.size * scale * 0.8);

    symbol.style.backgroundColor = style.color;
    symbol.style.opacity = style.opacity;
    symbol.style.width = size + 'px';
    symbol.style.height = size + 'px';

    // Shape based styling
    if (style.shape === 'circle') {
        symbol.style.borderRadius = '50%';
    } else if (style.shape === 'square') {
        symbol.style.borderRadius = '0';
    } else if (style.shape === 'triangle') {
        // Triangle using CSS
        symbol.style.width = '0';
        symbol.style.height = '0';
        symbol.style.backgroundColor = 'transparent';
        symbol.style.borderLeft = `${size/2}px solid transparent`;
        symbol.style.borderRight = `${size/2}px solid transparent`;
        symbol.style.borderBottom = `${size}px solid ${style.color}`;
    }

    return symbol;
}

/**
 * Create line symbol for legend
 * @param {Object} style - Line style
 * @param {number} scale - Scale factor
 * @returns {HTMLElement} - Symbol element
 */
function createLineSymbol(style, scale) {
    const symbol = document.createElement('div');
    const width = Math.round(style.width * scale);

    symbol.style.backgroundColor = style.color;
    symbol.style.opacity = style.opacity;
    symbol.style.width = '20px';
    symbol.style.height = width + 'px';
    symbol.style.borderRadius = '2px';

    // Line type styling
    if (style.type === 'dashed') {
        symbol.style.background = `repeating-linear-gradient(90deg, ${style.color} 0px, ${style.color} ${width * 2}px, transparent ${width * 2}px, transparent ${width * 4}px)`;
    } else if (style.type === 'dotted') {
        symbol.style.background = `repeating-linear-gradient(90deg, ${style.color} 0px, ${style.color} ${width}px, transparent ${width}px, transparent ${width * 3}px)`;
    }

    return symbol;
}

/**
 * Create polygon symbol for legend
 * @param {Object} style - Polygon style
 * @param {number} scale - Scale factor
 * @returns {HTMLElement} - Symbol element
 */
function createPolygonSymbol(style, scale) {
    const symbol = document.createElement('div');
    const strokeWidth = Math.max(1, Math.round(style.strokeWidth * scale));

    symbol.style.backgroundColor = style.fillColor;
    symbol.style.opacity = style.fillOpacity;
    symbol.style.width = '20px';
    symbol.style.height = '16px';
    symbol.style.border = `${strokeWidth}px solid ${style.strokeColor}`;
    symbol.style.borderRadius = '2px';

    // Stroke type styling
    if (style.strokeType === 'dashed') {
        symbol.style.borderStyle = 'dashed';
    } else if (style.strokeType === 'dotted') {
        symbol.style.borderStyle = 'dotted';
    }

    return symbol;
}

/**
 * Update legend preview (for graduated/categorized styles)
 * @param {Array} breaks - Class breaks
 * @param {Array} colors - Colors for each class
 */
export function updateLegendPreview(breaks, colors) {
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
 * Create legend from thematic map
 * @param {Object} config - Legend configuration
 * @returns {HTMLElement} - Legend element
 */
export function createThematicLegend(config) {
    const legendDiv = document.createElement('div');
    legendDiv.className = 'thematic-legend';
    legendDiv.style.padding = '10px';
    legendDiv.style.backgroundColor = 'white';
    legendDiv.style.borderRadius = '4px';
    legendDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    // Title
    if (config.title) {
        const title = document.createElement('div');
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '8px';
        title.textContent = config.title;
        legendDiv.appendChild(title);
    }

    // Items
    if (config.items) {
        config.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.style.display = 'flex';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.marginBottom = '4px';

            // Symbol
            const symbol = document.createElement('div');
            symbol.style.width = '20px';
            symbol.style.height = '16px';
            symbol.style.backgroundColor = item.color;
            symbol.style.marginRight = '8px';
            symbol.style.border = '1px solid #999';
            itemDiv.appendChild(symbol);

            // Label
            const label = document.createElement('span');
            label.style.fontSize = '12px';
            label.textContent = item.label;
            itemDiv.appendChild(label);

            legendDiv.appendChild(itemDiv);
        });
    }

    return legendDiv;
}

/**
 * Initialize legend drag functionality
 */
export function initLegendDragging() {
    const legendContainer = document.getElementById('legendContainer');
    const legendHeader = legendContainer?.querySelector('.legend-header');

    if (!legendContainer || !legendHeader) return;

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    legendHeader.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('legend-btn')) return;

        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === legendHeader || legendHeader.contains(e.target)) {
            isDragging = true;
            legendContainer.style.cursor = 'move';
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            e.preventDefault();

            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            legendContainer.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        }
    });

    document.addEventListener('mouseup', function() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        legendContainer.style.cursor = 'default';
    });
}

/**
 * Export legend as image
 * @param {string} format - Image format (png, jpg)
 * @returns {Promise<Blob>} - Image blob
 */
export async function exportLegendAsImage(format = 'png') {
    const legendContainer = document.getElementById('legendContainer');
    if (!legendContainer) return null;

    try {
        // Use html2canvas if available
        if (typeof html2canvas !== 'undefined') {
            const canvas = await html2canvas(legendContainer);
            return new Promise(resolve => {
                canvas.toBlob(blob => resolve(blob), `image/${format}`);
            });
        }
    } catch (error) {
        console.error('Error exporting legend:', error);
    }

    return null;
}

/**
 * Reset legend position
 */
export function resetLegendPosition() {
    const legendContainer = document.getElementById('legendContainer');
    if (legendContainer) {
        legendContainer.style.transform = 'translate(0, 0)';
    }
}
