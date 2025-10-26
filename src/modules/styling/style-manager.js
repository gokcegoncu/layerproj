/**
 * Style Manager Module
 * Manages all style-related operations including style modal, style application, and user preferences
 */

import { AppState } from '../core/state.js';
import { showToast, showNotification } from '../ui/notifications.js';
import { hexToRgba } from '../utils/helpers.js';

// System default styles
const systemDefaultStyles = {
    point: { color: "#ff0000", size: 8, shape: "circle", opacity: 100, styleType: "custom" },
    line: { color: "#ff7800", width: 3, opacity: 100, lineType: "solid" },
    polygon: { fillColor: "#3388ff", fillOpacity: 50, strokeColor: "#000000", strokeWidth: 1, strokeOpacity: 100, strokeType: "solid" }
};

/**
 * Show style modal for a specific layer
 * @param {string} layerId - The layer ID to style
 */
export function showStyleModal(layerId) {
    console.log('showStyleModal called, layerId:', layerId);

    if (!layerId) {
        console.error('LayerId not found!');
        showNotification('Layer not selected!', 'error');
        return;
    }

    // Set active layer
    window.activeLayerId = layerId;

    // Detect layer type
    const layerFeatures = window.drawnLayers.filter(l => l.layerId === layerId);
    let layerType = null;

    if (layerFeatures.length > 0) {
        layerType = layerFeatures[0].type;
    }

    console.log('Detected layerType:', layerType, 'Feature count:', layerFeatures.length);

    // Call openStyleModal
    openStyleModal(layerType, layerId);
}

/**
 * Open style modal with specific settings
 * @param {string} type - Geometry type (point, line, polygon)
 * @param {string} featureId - Feature or layer ID
 */
export function openStyleModal(type, featureId) {
    const modal = document.getElementById('styleModal');

    // Reset tab
    switchTab('style');

    // Show all style sections
    document.getElementById('pointStyle').style.display = 'block';
    document.getElementById('lineStyle').style.display = 'block';
    document.getElementById('polygonStyle').style.display = 'block';

    // Load previously selected style mode
    let layerId = featureId;

    // If featureId doesn't exist, get from event target or active layer
    if (!layerId && event && event.target) {
        const layerItem = event.target.closest('.layer-item');
        if (layerItem) {
            layerId = layerItem.getAttribute('data-layer-id');
        }
    }

    // Use active layer as fallback
    if (!layerId) {
        layerId = window.activeLayerId;
    }

    console.log('OpenStyleModal - Determined layerId:', layerId);

    const savedStyleModes = JSON.parse(localStorage.getItem('layerStyleModes') || '{}');
    const savedMode = savedStyleModes[layerId] || 'custom';

    console.log('OpenStyleModal - Saved mode:', savedMode);

    // Set style mode to saved value
    document.getElementById('styleMode').value = savedMode;

    // Initialize saved mode
    handleStyleModeChange(savedMode);

    // Initialize label event listeners
    initLabelEventListeners();

    // Initialize real-time style updates
    initRealTimeStyleUpdates();

    // Notify user about real-time updates
    setTimeout(() => {
        showToast('💡 Style changes will be reflected instantly on the map', 'info');
    }, 300);

    // Set title based on layer type
    let title = 'Style Settings';
    if (type === 'point') title = 'Point Style Settings';
    else if (type === 'line') title = 'Line Style Settings';
    else if (type === 'polygon') title = 'Polygon Style Settings';
    else if (type === 'landuse') title = 'Land Use Style Settings';

    document.querySelector('#styleModal .modal-header h3').textContent = title;

    // Clear type and other data (to avoid previous values)
    modal.dataset.layerType = '';
    modal.dataset.layerId = '';
    modal.dataset.layerName = '';

    console.log(`Style modal opening: type=${type}, featureId=${featureId}`);

    // Save data to style modal
    if (type) {
        modal.dataset.layerType = type;
    }

    // Save layerId to modal
    modal.dataset.layerId = layerId;

    console.log('Modal layerId set:', layerId);

    // Also save layer name (if available)
    if (layerId && !featureId) {
        const layerItem = document.querySelector(`[data-layer-id="${layerId}"]`);
        if (layerItem) {
            const layerName = layerItem.querySelector('.layer-name')?.textContent || '';
            modal.dataset.layerName = layerName;
            console.log(`Style modal opened for layer: ${layerId} (${layerName})`);
        }
    } else if (featureId) {
        console.log(`Style modal opened for feature: ${featureId}`);
    }

    console.log('Modal dataset values:', {
        layerId: modal.dataset.layerId,
        layerType: modal.dataset.layerType,
        layerName: modal.dataset.layerName
    });

    // Load current styles
    loadCurrentStyles(type, featureId);

    // Auto-analyze layer data for theme tab
    initializeThemeTab(layerId);

    // Open modal
    modal.style.display = 'block';
}

/**
 * Load current styles for a feature or layer
 * @param {string} type - Geometry type
 * @param {string} featureId - Feature ID
 */
export function loadCurrentStyles(type, featureId) {
    const modal = document.getElementById('styleModal');

    // Check selected mode
    const selectedMode = document.getElementById('styleMode').value;

    if (selectedMode === 'default') {
        // Default mode: load system defaults
        resetDefaultStyles();
        return;
    } else if (selectedMode === 'custom') {
        // User custom mode: first load defaults, then custom settings
        resetDefaultStyles();

        // Load user custom settings if they exist
        const savedUserStyles = JSON.parse(localStorage.getItem('userCustomStyles') || '{}');
        if (Object.keys(savedUserStyles).length > 0) {
            loadUserCustomValues();
            return;
        }
    }

    // Load saved styles from localStorage (for backward compatibility)
    const savedStyles = JSON.parse(localStorage.getItem('mapStyles') || '{}');
    let styles = null;

    // If featureId exists, load the drawing's style
    if (featureId) {
        const layerInfo = window.drawnLayers.find(l => l.id === featureId);
        if (layerInfo && layerInfo.layer && layerInfo.layer.options && layerInfo.layer.options.styleInfo) {
            const styleInfo = layerInfo.layer.options.styleInfo;

            if (type === 'point' && styleInfo.type === 'point') {
                document.getElementById('pointColor').value = styleInfo.color || "#ff0000";
                document.getElementById('pointSize').value = styleInfo.size || 8;
                document.getElementById('pointShape').value = styleInfo.shape || "circle";
            }
            else if (type === 'line' && styleInfo.type === 'line') {
                document.getElementById('lineColor').value = styleInfo.color || "#ff7800";
                document.getElementById('lineWidth').value = styleInfo.width || 3;
                document.getElementById('lineType').value = styleInfo.lineType || "solid";
            }
            else if (type === 'polygon' && styleInfo.type === 'polygon') {
                document.getElementById('fillColor').value = styleInfo.fillColor || "#3388ff";
                document.getElementById('fillOpacity').value = parseInt((styleInfo.fillOpacity || 0.5) * 100);
                document.getElementById('strokeColor').value = styleInfo.strokeColor || "#000000";
                document.getElementById('strokeWidth').value = styleInfo.strokeWidth || 1;
                document.getElementById('strokeType').value = styleInfo.strokeType || "solid";
            }
        } else if (layerInfo && layerInfo.layer && layerInfo.layer.options) {
            // Get style directly from layer properties
            if (type === 'line') {
                document.getElementById('lineColor').value = layerInfo.layer.options.color || '#ff7800';
                document.getElementById('lineWidth').value = layerInfo.layer.options.weight || 3;

                const lineType = detectLineTypeFromDashArray(layerInfo.layer.options.dashArray);
                document.getElementById('lineType').value = lineType;
            }
            else if (type === 'polygon') {
                document.getElementById('fillColor').value = layerInfo.layer.options.fillColor || '#3388ff';
                document.getElementById('fillOpacity').value = parseInt((layerInfo.layer.options.fillOpacity || 0.5) * 100);
                document.getElementById('strokeColor').value = layerInfo.layer.options.color || '#000000';
                document.getElementById('strokeWidth').value = layerInfo.layer.options.weight || 1;

                const strokeType = detectLineTypeFromDashArray(layerInfo.layer.options.dashArray);
                document.getElementById('strokeType').value = strokeType;
            }
        }

        // Check localStorage for styles
        if (savedStyles[featureId] && savedStyles[featureId][type]) {
            styles = savedStyles[featureId][type];
        }
    }
    // If layer is selected, check layer's styles
    else if (modal.dataset.layerId) {
        const layerId = modal.dataset.layerId;
        if (savedStyles[layerId] && savedStyles[layerId][type]) {
            styles = savedStyles[layerId][type];
        }
    }

    // If saved styles found, update input fields
    if (styles) {
        if (type === 'point') {
            document.getElementById('pointColor').value = styles.pointColor || "#ff0000";
            document.getElementById('pointSize').value = styles.pointSize || 8;
            document.getElementById('pointShape').value = styles.pointShape || "circle";
        }
        else if (type === 'line') {
            document.getElementById('lineColor').value = styles.lineColor || "#ff7800";
            document.getElementById('lineWidth').value = styles.lineWidth || 3;
            document.getElementById('lineType').value = styles.lineType || "solid";
        }
        else if (type === 'polygon') {
            document.getElementById('fillColor').value = styles.fillColor || "#3388ff";
            document.getElementById('fillOpacity').value = styles.fillOpacity || 50;
            document.getElementById('strokeColor').value = styles.strokeColor || "#000000";
            document.getElementById('strokeWidth').value = styles.strokeWidth || 1;
            document.getElementById('strokeType').value = styles.strokeType || "solid";
        }
    }

    // Update range input values
    updateRangeDisplays();
}

/**
 * Reset all style fields to default values
 */
export function resetDefaultStyles() {
    applySystemDefaults();
}

/**
 * Apply system default values to style inputs
 */
export function applySystemDefaults() {
    // Point style values
    document.getElementById('pointColor').value = systemDefaultStyles.point.color;
    document.getElementById('pointSize').value = systemDefaultStyles.point.size;
    document.getElementById('pointShape').value = systemDefaultStyles.point.shape;
    document.getElementById('pointOpacity').value = systemDefaultStyles.point.opacity;
    document.getElementById('pointStyleType').value = systemDefaultStyles.point.styleType;

    // Line style values
    document.getElementById('lineColor').value = systemDefaultStyles.line.color;
    document.getElementById('lineWidth').value = systemDefaultStyles.line.width;
    document.getElementById('lineOpacity').value = systemDefaultStyles.line.opacity;
    document.getElementById('lineType').value = systemDefaultStyles.line.lineType;

    // Polygon style values
    document.getElementById('fillColor').value = systemDefaultStyles.polygon.fillColor;
    document.getElementById('fillOpacity').value = systemDefaultStyles.polygon.fillOpacity;
    document.getElementById('strokeColor').value = systemDefaultStyles.polygon.strokeColor;
    document.getElementById('strokeWidth').value = systemDefaultStyles.polygon.strokeWidth;
    document.getElementById('strokeOpacity').value = systemDefaultStyles.polygon.strokeOpacity;
    document.getElementById('strokeType').value = systemDefaultStyles.polygon.strokeType;

    // Update range displays
    updateRangeDisplays();
}

/**
 * Apply style changes to features or layers
 */
export function applyStyle() {
    try {
        const modal = document.getElementById('styleModal');
        const layerType = modal.dataset.layerType;
        const layerId = modal.dataset.layerId;

        console.log("Applying style:", { layerType, layerId });

        if (!layerId) {
            console.error("LayerId not found, cannot apply style");
            throw new Error("Layer ID not found");
        }

        // Read style settings from page
        const styleSettings = {
            point: {
                color: document.getElementById('pointColor').value,
                size: parseInt(document.getElementById('pointSize').value),
                shape: document.getElementById('pointShape').value,
                opacity: parseInt(document.getElementById('pointOpacity').value) / 100,
                styleType: document.getElementById('pointStyleType').value
            },
            line: {
                color: document.getElementById('lineColor').value,
                width: parseInt(document.getElementById('lineWidth').value),
                opacity: parseInt(document.getElementById('lineOpacity').value) / 100,
                lineType: document.getElementById('lineType').value
            },
            polygon: {
                fillColor: document.getElementById('fillColor').value,
                fillOpacity: parseInt(document.getElementById('fillOpacity').value) / 100,
                strokeColor: document.getElementById('strokeColor').value,
                strokeWidth: parseInt(document.getElementById('strokeWidth').value),
                strokeOpacity: parseInt(document.getElementById('strokeOpacity').value) / 100,
                strokeType: document.getElementById('strokeType').value
            }
        };

        // Determine target for style application
        if (layerId) {
            if (layerId.startsWith('feature-')) {
                // Apply style to single drawing element
                if (layerType) {
                    applyStyleToFeature(layerId, layerType);
                    console.log(`${layerType} style applied to feature: ${layerId}`);
                } else {
                    // Apply style based on drawing type
                    const layerInfo = window.drawnLayers.find(l => l.id === layerId);
                    if (layerInfo) {
                        const type = layerInfo.type;
                        applyStyleToFeature(layerId, type);
                        console.log(`${type} style applied to feature: ${layerId}`);
                    } else {
                        console.error("Drawing not found:", layerId);
                    }
                }
            } else {
                // Apply style to all drawings in layer
                const targetLayer = document.querySelector(`[data-layer-id="${layerId}"]`);
                if (targetLayer) {
                    console.log("Layer found, applying style:", layerId);
                    // Apply each applicable style type
                    if (layerType) {
                        // Apply only specific style type if selected
                        applyStyleToLayer(targetLayer, layerId, layerType);
                    } else {
                        // Check all style types and apply those used in layer
                        const features = window.layerFeatures[layerId] || [];
                        const hasPoint = features.some(f => f.type === 'point');
                        const hasLine = features.some(f => f.type === 'line');
                        const hasPolygon = features.some(f => f.type === 'polygon');

                        if (hasPoint) applyStyleToLayer(targetLayer, layerId, 'point');
                        if (hasLine) applyStyleToLayer(targetLayer, layerId, 'line');
                        if (hasPolygon) applyStyleToLayer(targetLayer, layerId, 'polygon');
                    }
                } else {
                    console.error("Layer not found:", layerId);
                }
            }
        } else {
            console.error("No layer or drawing specified for style application");
            // Try using active layer
            if (window.activeLayerId) {
                const targetLayer = document.querySelector(`[data-layer-id="${window.activeLayerId}"]`);
                if (targetLayer) {
                    if (layerType) {
                        applyStyleToLayer(targetLayer, window.activeLayerId, layerType);
                        console.log(`${layerType} style applied to active layer: ${window.activeLayerId}`);
                    } else {
                        // Apply to all geometry types in active layer
                        const features = window.layerFeatures[window.activeLayerId] || [];
                        const hasPoint = features.some(f => f.type === 'point');
                        const hasLine = features.some(f => f.type === 'line');
                        const hasPolygon = features.some(f => f.type === 'polygon');

                        if (hasPoint) applyStyleToLayer(targetLayer, window.activeLayerId, 'point');
                        if (hasLine) applyStyleToLayer(targetLayer, window.activeLayerId, 'line');
                        if (hasPolygon) applyStyleToLayer(targetLayer, window.activeLayerId, 'polygon');
                    }
                }
            }
        }

        // Save style settings
        saveStyles(layerId || window.activeLayerId, layerType);

        // Update draw control
        if (typeof updateDrawControl === 'function') {
            updateDrawControl();
        }

        console.log("Style successfully applied");

        // Update style mode indicator
        const targetLayerId = layerId || window.activeLayerId;
        if (targetLayerId) {
            const currentMode = document.getElementById('styleMode')?.value || 'custom';
            updateLayerStyleModeIndicator(targetLayerId, currentMode);
        }

    } catch (error) {
        console.error("Style application error:", error);
        throw error; // Pass error to upper level
    }
}

/**
 * Apply style to a single feature
 * @param {string} featureId - Feature ID
 * @param {string} type - Geometry type
 */
export function applyStyleToFeature(featureId, type) {
    const layerInfo = window.drawnLayers.find(l => l.id === featureId);
    if (!layerInfo) return;

    const layer = layerInfo.layer;

    if (type === 'point') {
        const pointColor = document.getElementById('pointColor').value;
        const pointSize = parseInt(document.getElementById('pointSize').value);
        const pointOpacity = parseInt(document.getElementById('pointOpacity').value) / 100;
        const pointShape = document.getElementById('pointShape').value;
        const pointStyleType = document.getElementById('pointStyleType').value;

        // Create custom icon for marker style
        let iconHtml = '';
        const rgbaColor = hexToRgba(pointColor, pointOpacity);

        if (pointStyleType === 'custom') {
            if (pointShape === 'circle') {
                iconHtml = `<div style="background-color: ${rgbaColor}; width: ${pointSize}px; height: ${pointSize}px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.3);"></div>`;
            } else if (pointShape === 'square') {
                iconHtml = `<div style="background-color: ${rgbaColor}; width: ${pointSize}px; height: ${pointSize}px; border: 1px solid rgba(0,0,0,0.3);"></div>`;
            } else if (pointShape === 'triangle') {
                iconHtml = `<div style="width: 0; height: 0; border-left: ${pointSize/2}px solid transparent; border-right: ${pointSize/2}px solid transparent; border-bottom: ${pointSize}px solid ${rgbaColor};"></div>`;
            } else if (pointShape === 'star') {
                iconHtml = `<svg width="${pointSize}" height="${pointSize}" viewBox="0 0 24 24"><polygon fill="${rgbaColor}" stroke="rgba(0,0,0,0.3)" stroke-width="1" points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`;
            } else if (pointShape === 'diamond') {
                iconHtml = `<svg width="${pointSize}" height="${pointSize}" viewBox="0 0 24 24"><polygon fill="${rgbaColor}" stroke="rgba(0,0,0,0.3)" stroke-width="1" points="12,2 22,12 12,22 2,12"/></svg>`;
            }
        } else {
            // Use selected icon in icon mode
            const iconGrid = document.getElementById('iconGrid');
            const selectedIcon = iconGrid ? iconGrid.dataset.selectedIcon : '📍';
            iconHtml = `<div style="font-size: ${pointSize}px; opacity: ${pointOpacity};">${selectedIcon || '📍'}</div>`;
        }

        // Create DivIcon
        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-div-icon',
            iconSize: [pointSize, pointSize],
            iconAnchor: [pointSize/2, pointSize/2]
        });

        // Apply icon
        if (layer.setIcon) {
            layer.setIcon(customIcon);
        }

        // Add or update popup info
        const popupContent = `<div style="color:${pointColor}"><strong>Point</strong><br>Shape: ${pointShape}<br>Size: ${pointSize}px<br>Opacity: ${Math.round(pointOpacity * 100)}%</div>`;
        if (layer.getPopup()) {
            layer.setPopupContent(popupContent);
        } else {
            layer.bindPopup(popupContent);
        }
    }
    else if (type === 'line') {
        const lineColor = document.getElementById('lineColor').value;
        const lineWidth = parseInt(document.getElementById('lineWidth').value);
        const lineOpacity = parseInt(document.getElementById('lineOpacity').value) / 100;
        const lineType = document.getElementById('lineType').value;

        // Define dashArray for line style
        const dashArray = calculateDashArray(lineType, lineWidth);

        // Apply style
        layer.setStyle({
            color: lineColor,
            weight: lineWidth,
            opacity: lineOpacity,
            dashArray: dashArray
        });

        // Add or update popup info
        const popupContent = `<div style="color:${lineColor}"><strong>Line</strong><br>Width: ${lineWidth}px<br>Opacity: ${Math.round(lineOpacity * 100)}%<br>Type: ${lineType}</div>`;
        if (layer.getPopup()) {
            layer.setPopupContent(popupContent);
        } else {
            layer.bindPopup(popupContent);
        }
    }
    else if (type === 'polygon') {
        const fillColor = document.getElementById('fillColor').value;
        const fillOpacity = document.getElementById('fillOpacity').value / 100;
        const strokeColor = document.getElementById('strokeColor').value;
        const strokeWidth = parseInt(document.getElementById('strokeWidth').value);
        const strokeOpacity = parseInt(document.getElementById('strokeOpacity').value) / 100;
        const strokeType = document.getElementById('strokeType').value;

        // Define dashArray for stroke style
        const dashArray = calculateDashArray(strokeType, strokeWidth);

        // Apply style
        layer.setStyle({
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            color: strokeColor,
            weight: strokeWidth,
            opacity: strokeOpacity,
            dashArray: dashArray
        });

        // Add or update popup info
        const popupContent = `<div style="color:${fillColor}"><strong>Polygon</strong><br>Fill Opacity: ${Math.round(fillOpacity * 100)}%<br>Stroke Width: ${strokeWidth}px<br>Stroke Opacity: ${Math.round(strokeOpacity * 100)}%</div>`;
        if (layer.getPopup()) {
            layer.setPopupContent(popupContent);
        } else {
            layer.bindPopup(popupContent);
        }
    }

    // Store style properties in layer
    if (!layer.options) layer.options = {};
    layer.options.styleInfo = {
        type: type,
        timestamp: new Date().getTime()
    };

    if (type === 'point') {
        layer.options.styleInfo.color = document.getElementById('pointColor').value;
        layer.options.styleInfo.size = document.getElementById('pointSize').value;
        layer.options.styleInfo.opacity = document.getElementById('pointOpacity').value / 100;
        layer.options.styleInfo.shape = document.getElementById('pointShape').value;
        layer.options.styleInfo.styleType = document.getElementById('pointStyleType').value;
    } else if (type === 'line') {
        layer.options.styleInfo.color = document.getElementById('lineColor').value;
        layer.options.styleInfo.width = document.getElementById('lineWidth').value;
        layer.options.styleInfo.opacity = document.getElementById('lineOpacity').value / 100;
        layer.options.styleInfo.lineType = document.getElementById('lineType').value;
    } else if (type === 'polygon') {
        layer.options.styleInfo.fillColor = document.getElementById('fillColor').value;
        layer.options.styleInfo.fillOpacity = document.getElementById('fillOpacity').value / 100;
        layer.options.styleInfo.strokeColor = document.getElementById('strokeColor').value;
        layer.options.styleInfo.strokeWidth = document.getElementById('strokeWidth').value;
        layer.options.styleInfo.strokeOpacity = document.getElementById('strokeOpacity').value / 100;
        layer.options.styleInfo.strokeType = document.getElementById('strokeType').value;
    }
}

/**
 * Apply style to all drawings in a layer
 * @param {HTMLElement} layerItem - Layer DOM element
 * @param {string} layerId - Layer ID
 * @param {string} layerType - Geometry type
 */
export function applyStyleToLayer(layerItem, layerId, layerType) {
    if (!layerItem || !layerId) {
        console.error("applyStyleToLayer: Layer element or ID missing");
        return;
    }

    console.log(`Applying layer style: layerId=${layerId}, layerType=${layerType}`);

    // Update layer drawings
    if (window.layerFeatures[layerId]) {
        console.log(`Updating ${window.layerFeatures[layerId].length} drawings in layer`);

        // Filter by selected type
        const filteredFeatures = layerType
            ? window.layerFeatures[layerId].filter(f => f.type === layerType)
            : window.layerFeatures[layerId];

        filteredFeatures.forEach(feature => {
            applyStyleToFeature(feature.id, feature.type);
        });

        console.log(`${filteredFeatures.length} drawings updated`);
    } else {
        console.log(`No drawings found in layer (${layerId})`);
    }
}

/**
 * Calculate dash array based on line type and width
 * @param {string} type - Line type (solid, dashed, dotted, dashDot)
 * @param {number} width - Line width
 * @returns {string|null} - Dash array string or null
 */
export function calculateDashArray(type, width) {
    if (!type || type === 'solid') return null;

    // Minimum width 1, maximum scale factor
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
 * @param {string} dashArray - Dash array string
 * @returns {string} - Line type
 */
export function detectLineTypeFromDashArray(dashArray) {
    if (!dashArray) return 'solid';

    // Parse dash array
    const parts = dashArray.split(',').map(p => parseInt(p.trim()));
    if (parts.length < 2) return 'solid';

    // Check ratios (width independent)
    const ratio1 = parts[0] / parts[1]; // First dash/gap ratio

    if (parts.length === 2) {
        // Two parts: dash, gap
        if (ratio1 >= 1.5 && ratio1 <= 2.5) return 'dashed'; // ~2:1 ratio
        if (ratio1 >= 0.3 && ratio1 <= 0.7) return 'dotted'; // ~1:2 ratio
    } else if (parts.length === 4) {
        // Four parts: dash, gap, dot, gap - dashDot pattern
        const ratio2 = parts[2] / parts[3]; // Dot/gap ratio
        if (ratio1 >= 1.5 && ratio2 >= 0.3 && ratio2 <= 0.7) return 'dashDot';
    }

    return 'solid';
}

/**
 * Save user custom styles to localStorage
 */
export function saveUserCustomStyles() {
    try {
        const userStyles = {
            point: {
                color: document.getElementById('pointColor')?.value || "#ff0000",
                size: parseInt(document.getElementById('pointSize')?.value || 8),
                shape: document.getElementById('pointShape')?.value || "circle",
                opacity: parseInt(document.getElementById('pointOpacity')?.value || 100),
                styleType: document.getElementById('pointStyleType')?.value || "custom"
            },
            line: {
                color: document.getElementById('lineColor')?.value || "#ff7800",
                width: parseInt(document.getElementById('lineWidth')?.value || 3),
                opacity: parseInt(document.getElementById('lineOpacity')?.value || 100),
                lineType: document.getElementById('lineType')?.value || "solid"
            },
            polygon: {
                fillColor: document.getElementById('fillColor')?.value || "#3388ff",
                fillOpacity: parseInt(document.getElementById('fillOpacity')?.value || 50),
                strokeColor: document.getElementById('strokeColor')?.value || "#000000",
                strokeWidth: parseInt(document.getElementById('strokeWidth')?.value || 1),
                strokeOpacity: parseInt(document.getElementById('strokeOpacity')?.value || 100),
                strokeType: document.getElementById('strokeType')?.value || "solid"
            }
        };

        localStorage.setItem('userCustomStyles', JSON.stringify(userStyles));
        console.log('User custom settings saved:', userStyles);
    } catch (error) {
        console.error('Failed to save user settings:', error);
    }
}

/**
 * Load user custom values from localStorage
 */
export function loadUserCustomValues() {
    console.log("=== loadUserCustomValues called ===");

    // Load user settings if available, otherwise use defaults
    const savedUserStyles = JSON.parse(localStorage.getItem('userCustomStyles') || '{}');

    console.log("Saved user styles:", savedUserStyles);
    console.log("localStorage userCustomStyles:", localStorage.getItem('userCustomStyles'));

    if (Object.keys(savedUserStyles).length > 0) {
        // Load saved settings
        if (savedUserStyles.point) {
            document.getElementById('pointColor').value = savedUserStyles.point.color || "#ff0000";
            document.getElementById('pointSize').value = savedUserStyles.point.size || 8;
            document.getElementById('pointShape').value = savedUserStyles.point.shape || "circle";
            document.getElementById('pointOpacity').value = savedUserStyles.point.opacity || 100;
            document.getElementById('pointStyleType').value = savedUserStyles.point.styleType || "custom";
        }

        if (savedUserStyles.line) {
            document.getElementById('lineColor').value = savedUserStyles.line.color || "#ff7800";
            document.getElementById('lineWidth').value = savedUserStyles.line.width || 3;
            document.getElementById('lineOpacity').value = savedUserStyles.line.opacity || 100;
            document.getElementById('lineType').value = savedUserStyles.line.lineType || "solid";
        }

        if (savedUserStyles.polygon) {
            document.getElementById('fillColor').value = savedUserStyles.polygon.fillColor || "#3388ff";
            document.getElementById('fillOpacity').value = savedUserStyles.polygon.fillOpacity || 50;
            document.getElementById('strokeColor').value = savedUserStyles.polygon.strokeColor || "#000000";
            document.getElementById('strokeWidth').value = savedUserStyles.polygon.strokeWidth || 1;
            document.getElementById('strokeOpacity').value = savedUserStyles.polygon.strokeOpacity || 100;
            document.getElementById('strokeType').value = savedUserStyles.polygon.strokeType || "solid";
        }

        updateRangeDisplays();
        showToast('Your saved custom settings loaded', 'success');
    } else {
        // First time use - load default values
        applySystemDefaults();
        showToast('Custom settings mode activated', 'info');
    }

    // Update style after values loaded
    setTimeout(() => {
        updateRangeDisplays();
    }, 50);
}

/**
 * Save styles to localStorage
 * @param {string} layerId - Layer ID
 * @param {string} layerType - Layer type
 */
export function saveStyles(layerId, layerType) {
    if (!layerId) {
        console.warn("saveStyles: No layer ID to save");
        return;
    }

    console.log(`Saving styles: layerId=${layerId}, layerType=${layerType}`);

    // Get selected style mode
    const selectedMode = document.getElementById('styleMode').value;

    // Save settings to local storage
    const styleSettings = {
        pointColor: document.getElementById('pointColor').value,
        pointSize: document.getElementById('pointSize').value,
        pointShape: document.getElementById('pointShape').value,

        lineColor: document.getElementById('lineColor').value,
        lineWidth: document.getElementById('lineWidth').value,
        lineType: document.getElementById('lineType').value,

        fillColor: document.getElementById('fillColor').value,
        fillOpacity: document.getElementById('fillOpacity').value,
        strokeColor: document.getElementById('strokeColor').value,
        strokeWidth: document.getElementById('strokeWidth').value,
        strokeType: document.getElementById('strokeType').value
    };

    // Save layer-style relationship
    const savedStyles = JSON.parse(localStorage.getItem('mapStyles') || '{}');

    if (layerId) {
        savedStyles[layerId] = {
            ...savedStyles[layerId],
            [layerType]: styleSettings
        };
    }

    localStorage.setItem('mapStyles', JSON.stringify(savedStyles));

    // Also save selected style mode for layer
    const savedStyleModes = JSON.parse(localStorage.getItem('layerStyleModes') || '{}');
    savedStyleModes[layerId] = selectedMode;
    localStorage.setItem('layerStyleModes', JSON.stringify(savedStyleModes));

    // Notify user that style changes have been saved
    console.log('Style changes saved - Mode:', selectedMode);
}

/**
 * Update range input displays
 */
export function updateRangeDisplays() {
    document.querySelectorAll('input[type="range"]').forEach(input => {
        const valueDisplay = input.nextElementSibling;
        if (valueDisplay && valueDisplay.classList.contains('value-display')) {
            let value = input.value;
            if (input.id.includes('Opacity')) {
                value += '%';
            } else if (input.id.includes('Density') || input.id.includes('Height')) {
                value = value; // Show without unit
            } else {
                value += 'px';
            }
            valueDisplay.textContent = value;
        }
    });
}

/**
 * Close style modal
 */
export function closeStyleModal() {
    document.getElementById('styleModal').style.display = 'none';
}

/**
 * Save and close style modal
 */
export function saveAndCloseStyle() {
    try {
        console.log('saveAndCloseStyle started');

        // Get layer info from modal
        const modal = document.getElementById('styleModal');
        const layerId = modal.dataset.layerId;
        const layerType = modal.dataset.layerType;

        console.log('Modal data:', { layerId, layerType });

        if (!layerId) {
            console.error('LayerId not found, checking modal data...');
            showToast('Layer information not found', 'error');
            return;
        }

        // Check selected style mode and save necessary settings
        const styleMode = document.getElementById('styleMode').value;
        console.log('Selected style mode:', styleMode);

        if (styleMode === 'custom') {
            // In user custom mode: save custom settings globally
            console.log('Saving user custom settings...');
            saveUserCustomStyles();
        } else if (styleMode === 'default') {
            // In default mode: use system default values
            console.log('Using default mode - no custom save');
        }

        // In both cases apply style changes
        console.log('Applying style changes...');
        applyStyle();

        // Also apply label settings
        if (document.querySelector('#labelContent').style.display !== 'none') {
            if (typeof applyLabelsToAllFeatures === 'function') {
                console.log('Applying label settings...');
                applyLabelsToAllFeatures();
            }
        }

        // Update layer indicator
        console.log('Updating layer indicator...', layerId, styleMode);
        updateLayerStyleModeIndicator(layerId, styleMode);

        // Success message
        const modeText = styleMode === 'custom' ? 'Custom settings' : 'Default settings';
        showToast(`${modeText} saved and applied`, 'success');
        console.log('saveAndCloseStyle completed successfully');

    } catch (error) {
        console.error('Error saving style:', error);
        console.error('Error details:', error.stack);
        showToast(`Error saving style settings: ${error.message}`, 'error');
    } finally {
        // Always close modal
        console.log('Closing modal...');
        closeStyleModal();
    }
}

/**
 * Initialize real-time style updates
 */
export function initRealTimeStyleUpdates() {
    // Add event listeners to all style inputs
    const styleInputs = [
        // Point style inputs
        'pointColor', 'pointSize', 'pointShape', 'pointOpacity', 'pointStyleType',
        // Line style inputs
        'lineColor', 'lineWidth', 'lineOpacity', 'lineType',
        // Polygon style inputs
        'fillColor', 'fillOpacity', 'strokeColor', 'strokeWidth', 'strokeOpacity', 'strokeType',
        // Icon inputs
        'iconSize'
    ];

    styleInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Listen to both input and change events
            input.addEventListener('input', handleRealTimeStyleUpdate);
            input.addEventListener('change', handleRealTimeStyleUpdate);
        }
    });

    // Listen to style mode changes
    const styleModeSelect = document.getElementById('styleMode');
    if (styleModeSelect) {
        styleModeSelect.addEventListener('change', function() {
            // First change mode, then update instantly
            handleStyleModeChange(this.value);
        });
    }

    // Listen to icon grid selections
    setupIconGridListener();
}

/**
 * Handle real-time style update
 */
function handleRealTimeStyleUpdate() {
    // Add short delay to improve performance
    if (window.styleUpdateTimeout) {
        clearTimeout(window.styleUpdateTimeout);
    }

    window.styleUpdateTimeout = setTimeout(() => {
        try {
            // Update range displays
            updateRangeDisplays();

            // If modal is open use normal applyStyle
            const modal = document.getElementById('styleModal');
            if (modal && modal.style.display !== 'none' && modal.dataset.layerId) {
                applyStyle();
            } else {
                // If modal is not open apply style to active layer
                if (window.activeLayerId) {
                    applyStyleToActiveLayer();
                }
            }

            // Update label settings if active
            if (document.querySelector('#labelContent') && document.querySelector('#labelContent').style.display !== 'none') {
                if (typeof applyLabelsToAllFeatures === 'function') {
                    applyLabelsToAllFeatures();
                }
            }

            // Auto-save settings in custom mode (debounced)
            const currentMode = document.getElementById('styleMode')?.value;
            if (currentMode === 'custom') {
                if (window.saveUserStylesTimeout) {
                    clearTimeout(window.saveUserStylesTimeout);
                }
                window.saveUserStylesTimeout = setTimeout(() => {
                    saveUserCustomStyles();
                }, 500); // Save after 500ms
            }
        } catch (error) {
            console.warn('Error during real-time style update:', error);
        }
    }, 50); // 50ms delay (faster)
}

/**
 * Handle style mode change
 * @param {string} mode - Style mode (default or custom)
 */
export function handleStyleModeChange(mode) {
    console.log("=== Style mode change starting ===");
    console.log("New mode:", mode);
    console.log("Active layer:", window.activeLayerId);

    if (mode === 'default') {
        // Load default values and disable controls
        console.log("Loading default mode...");
        loadDefaultValues();
        setStyleControlsEnabled(false);
    } else {
        // User custom settings - enable controls
        console.log("Loading user custom mode...");
        setStyleControlsEnabled(true);
        console.log("Controls enabled");
        loadUserCustomValues();
        console.log("User custom values loaded");

        // Save current values when switching to custom mode
        setTimeout(() => {
            saveUserCustomStyles();
        }, 100);
    }

    // Update toggle button appearance
    updateStyleModeToggleButton(mode);

    // Instant style update after mode change
    setTimeout(() => {
        try {
            console.log("Style mode change post-update starting...");

            // Update range displays
            updateRangeDisplays();

            // If modal is open use normal applyStyle
            const modal = document.getElementById('styleModal');
            const isModalOpen = modal && modal.style.display !== 'none';
            const hasModalLayerId = modal && modal.dataset.layerId;

            console.log("Modal status:", { isModalOpen, hasModalLayerId, activeLayerId: window.activeLayerId });

            if (isModalOpen && hasModalLayerId) {
                console.log("Modal open, using applyStyle...");
                applyStyle();
            } else {
                // If modal is not open apply style to active layer
                if (window.activeLayerId) {
                    console.log("Modal not open, applying style to active layer...");
                    applyStyleToActiveLayer();
                } else {
                    console.warn("Active layer not found, cannot apply style");
                }
            }

            // Update label settings if active
            if (document.querySelector('#labelContent') && document.querySelector('#labelContent').style.display !== 'none') {
                if (typeof applyLabelsToAllFeatures === 'function') {
                    applyLabelsToAllFeatures();
                }
            }

            // CRITICAL: Update style settings mode indicator
            if (window.activeLayerId) {
                console.log(`Updating style settings mode indicator: ${window.activeLayerId} -> ${mode}`);
                updateLayerStyleModeIndicator(window.activeLayerId, mode);
                showToast(`Style mode: ${mode === 'default' ? 'System Defaults' : 'Customized'}`, 'info');
            }
        } catch (error) {
            console.error('Error during style mode change:', error);
        }
    }, 100);
}

/**
 * Apply style to active layer (without modal)
 */
export function applyStyleToActiveLayer() {
    if (!window.activeLayerId) {
        console.warn("Active layer not found");
        return;
    }

    console.log("=== Applying style to active layer ===");
    console.log("Active layer ID:", window.activeLayerId);

    const targetLayer = document.querySelector(`[data-layer-id="${window.activeLayerId}"]`);
    if (!targetLayer) {
        console.error("Active layer not found in DOM:", window.activeLayerId);
        return;
    }

    // Check drawing types in layer and apply style to all
    const features = window.layerFeatures[window.activeLayerId] || [];
    console.log("layerFeatures[activeLayerId]:", features);
    console.log("All layerFeatures:", window.layerFeatures);

    const hasPoint = features.some(f => f.type === 'point');
    const hasLine = features.some(f => f.type === 'line');
    const hasPolygon = features.some(f => f.type === 'polygon');

    console.log("Layer drawing types check:", {
        hasPoint,
        hasLine,
        hasPolygon,
        featureCount: features.length,
        features: features.map(f => ({ id: f.id, type: f.type }))
    });

    if (hasPoint) {
        console.log("✅ Applying point style...");
        applyStyleToLayer(targetLayer, window.activeLayerId, 'point');
    }
    if (hasLine) {
        console.log("✅ Applying line style...");
        applyStyleToLayer(targetLayer, window.activeLayerId, 'line');
    }
    if (hasPolygon) {
        console.log("✅ Applying polygon style...");
        applyStyleToLayer(targetLayer, window.activeLayerId, 'polygon');
    }

    console.log("=== Active layer style update completed ===");

    // Update style mode indicator (switch to custom mode when user makes changes)
    const currentMode = document.getElementById('styleMode')?.value || 'custom';
    updateLayerStyleModeIndicator(window.activeLayerId, currentMode);
}

/**
 * Update layer style mode indicator
 * @param {string} layerId - Layer ID
 * @param {string} mode - Style mode
 */
export function updateLayerStyleModeIndicator(layerId, mode) {
    if (!layerId) {
        console.warn('updateLayerStyleModeIndicator: layerId not found');
        return;
    }

    const indicator = document.querySelector(`[data-layer-id="${layerId}"].layer-style-mode-indicator`);
    console.log('Indicator update:', { layerId, mode, indicator: !!indicator });

    if (indicator) {
        // Clear CSS classes
        indicator.classList.remove('default-mode', 'custom-mode');

        if (mode === 'default') {
            indicator.textContent = '🏢';
            indicator.title = 'Default Corporate Settings (Customize)';
            indicator.classList.add('default-mode');
            console.log(`Indicator updated: ${layerId} -> default mode`);
        } else if (mode === 'custom') {
            indicator.textContent = '👤';
            indicator.title = 'User Custom Settings (Switch to Default)';
            indicator.classList.add('custom-mode');
            console.log(`Indicator updated: ${layerId} -> custom mode`);
        }
    } else {
        console.warn(`Indicator not found: [data-layer-id="${layerId}"].layer-style-mode-indicator`);
    }
}

/**
 * Load default values
 */
export function loadDefaultValues() {
    // Apply system default values
    applySystemDefaults();
    showToast('System default values loaded', 'info');
}

/**
 * Enable/disable style controls
 * @param {boolean} enabled - Whether to enable controls
 */
export function setStyleControlsEnabled(enabled) {
    console.log("=== setStyleControlsEnabled called ===");
    console.log("Enabled:", enabled);

    const controls = [
        'pointColor', 'pointSize', 'pointShape', 'pointOpacity', 'pointStyleType',
        'lineColor', 'lineWidth', 'lineOpacity', 'lineType',
        'fillColor', 'fillOpacity', 'strokeColor', 'strokeWidth', 'strokeOpacity', 'strokeType'
    ];

    let foundControls = 0;
    let missingControls = [];

    controls.forEach(controlId => {
        const control = document.getElementById(controlId);
        if (control) {
            control.disabled = !enabled;
            control.style.opacity = enabled ? '1' : '0.6';
            foundControls++;
        } else {
            missingControls.push(controlId);
        }
    });

    console.log(`Found controls: ${foundControls}/${controls.length}`);
    if (missingControls.length > 0) {
        console.warn("Missing controls:", missingControls);
    }

    // Also include icon grid controls
    const iconControls = document.querySelectorAll('#iconPointOptions input, #iconPointOptions select');
    iconControls.forEach(control => {
        control.disabled = !enabled;
        control.style.opacity = enabled ? '1' : '0.6';
    });
}

/**
 * Update style mode toggle button appearance
 * @param {string} mode - Style mode
 */
function updateStyleModeToggleButton(mode) {
    const toggleButton = document.getElementById('styleModeToggle');
    const iconElement = document.getElementById('styleModeIcon');

    if (!toggleButton || !iconElement) return;

    if (mode === 'custom') {
        // User custom mode - personal icon
        iconElement.textContent = '👤';
        toggleButton.classList.add('custom-mode');
        toggleButton.title = 'User Custom Settings (Switch to Default)';
    } else {
        // Default mode - corporate icon
        iconElement.textContent = '🏢';
        toggleButton.classList.remove('custom-mode');
        toggleButton.title = 'Default Corporate Settings (Customize)';
    }
}

/**
 * Setup icon grid listener
 */
function setupIconGridListener() {
    const iconGrid = document.getElementById('iconGrid');
    if (iconGrid) {
        iconGrid.addEventListener('click', function(e) {
            const iconOption = e.target.closest('.icon-option');
            if (iconOption) {
                // Update style after icon selection
                setTimeout(handleRealTimeStyleUpdate, 25);
            }
        });
    }
}

/**
 * Initialize theme tab for a layer
 * @param {string} layerId - Layer ID
 */
function initializeThemeTab(layerId) {
    if (!layerId) return;

    // Find features in active layer
    const layerFeatures = window.drawnLayers.filter(l => l.layerId === layerId);

    if (layerFeatures.length === 0) return;

    // Auto-detect properties
    const allProperties = new Set();
    layerFeatures.forEach(feature => {
        if (feature.properties) {
            Object.keys(feature.properties).forEach(key => {
                allProperties.add(key);
            });
        }
    });

    // Update category field dropdown
    const categoryField = document.getElementById('categoryField');
    if (categoryField && allProperties.size > 0) {
        // Keep current selection
        const currentValue = categoryField.value;

        // Add new options
        categoryField.innerHTML = '<option value="">Select</option>';
        allProperties.forEach(prop => {
            const option = document.createElement('option');
            option.value = prop;
            option.textContent = prop.charAt(0).toUpperCase() + prop.slice(1);
            categoryField.appendChild(option);
        });

        // Restore previous selection if it exists
        if (currentValue && allProperties.has(currentValue)) {
            categoryField.value = currentValue;
        }
    }

    // Update value field dropdown
    const valueField = document.getElementById('valueField');
    if (valueField && allProperties.size > 0) {
        const currentValue = valueField.value;

        valueField.innerHTML = '<option value="">Select</option>';
        allProperties.forEach(prop => {
            const option = document.createElement('option');
            option.value = prop;
            option.textContent = prop.charAt(0).toUpperCase() + prop.slice(1);
            valueField.appendChild(option);
        });

        if (currentValue && allProperties.has(currentValue)) {
            valueField.value = currentValue;
        }
    }
}

/**
 * Initialize label event listeners
 */
function initLabelEventListeners() {
    // Add label-related event listeners here if needed
    // This is a placeholder for future label functionality
}

/**
 * Switch between modal tabs
 * @param {string} tabName - Tab name to switch to
 */
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab content
    const selectedContent = document.getElementById(tabName + 'Content');
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }

    // Add active class to selected tab button
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
}
