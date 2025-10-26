/**
 * Drawing Tools Module
 * Handles drawing mode control and geometry creation
 */

let isDrawingMode = false;
let map = null;
let drawControl = null;
let activeLayerId = null;

/**
 * Initialize drawing tools
 * @param {Object} leafletMap - Leaflet map instance
 * @param {Object} control - Leaflet Draw control
 */
export function initializeDrawingTools(leafletMap, control) {
    map = leafletMap;
    drawControl = control;
    window.drawControl = control;
}

/**
 * Start drawing a specific geometry type
 * @param {string} type - Geometry type (marker, polyline, polygon, rectangle, circle)
 */
export function startDrawing(type) {
    try {
        console.log('startDrawing called:', type);

        // Clear any active tools
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));

        // Set continuous point mode flag if drawing marker
        if (type === 'marker') {
            window.continuousPointMode = true;
            console.log('Continuous point mode enabled');
        } else {
            window.continuousPointMode = false;
        }

        // Activate current tool button
        const toolBtn = document.getElementById(type + 'Btn') ||
            document.querySelector(`[onclick*="${type}"]`);
        if (toolBtn) {
            toolBtn.classList.add('active');
        }

        // Check if there's a selected layer
        if (!window.activeLayerId) {
            const selectedLayer = document.querySelector('.layer-item.selected-highlight');
            if (selectedLayer) {
                window.activeLayerId = selectedLayer.getAttribute('data-layer-id');
                activeLayerId = window.activeLayerId;
            } else {
                console.error('No active layer selected');
                return;
            }
        }

        // Store active layer ID for drawing
        window.drawingActiveLayerId = window.activeLayerId;

        // Map type to Leaflet Draw handlers
        const drawHandlers = {
            'marker': drawControl._toolbars.draw._modes.marker,
            'polyline': drawControl._toolbars.draw._modes.polyline,
            'polygon': drawControl._toolbars.draw._modes.polygon,
            'rectangle': drawControl._toolbars.draw._modes.rectangle,
            'circle': drawControl._toolbars.draw._modes.circle
        };

        // Get appropriate handler
        const handler = drawHandlers[type];
        if (handler && handler.handler) {
            // Stop any currently active drawing
            Object.values(drawHandlers).forEach(mode => {
                if (mode && mode.handler && mode.handler.enabled && mode.handler.enabled()) {
                    mode.handler.disable();
                }
            });

            // Start new drawing mode
            handler.handler.enable();

            console.log(`Drawing started: ${type} on layer: ${window.drawingActiveLayerId}`);
        } else {
            throw new Error(`Drawing handler not found for type: ${type}`);
        }
    } catch (error) {
        console.error('startDrawing error:', error);
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    }
}

/**
 * Stop drawing
 */
export function stopDrawing() {
    try {
        if (drawControl && drawControl._toolbars && drawControl._toolbars.draw) {
            const drawHandlers = {
                'marker': drawControl._toolbars.draw._modes.marker,
                'polyline': drawControl._toolbars.draw._modes.polyline,
                'polygon': drawControl._toolbars.draw._modes.polygon,
                'rectangle': drawControl._toolbars.draw._modes.rectangle,
                'circle': drawControl._toolbars.draw._modes.circle
            };

            Object.values(drawHandlers).forEach(mode => {
                if (mode && mode.handler && mode.handler.enabled && mode.handler.enabled()) {
                    mode.handler.disable();
                }
            });
        }

        // Clear active tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));

        isDrawingMode = false;
        console.log('Drawing stopped');
    } catch (error) {
        console.error('stopDrawing error:', error);
    }
}

/**
 * Check if currently drawing
 * @returns {boolean} True if drawing mode is active
 */
export function isDrawing() {
    return isDrawingMode;
}

/**
 * Start point drawing mode
 */
export function startPointDrawing() {
    startDrawing('marker');
}

/**
 * Start line drawing mode
 */
export function startLineDrawing() {
    startDrawing('polyline');
}

/**
 * Start polygon drawing mode
 */
export function startPolygonDrawing() {
    startDrawing('polygon');
}

/**
 * Start rectangle drawing mode
 */
export function startRectangleDrawing() {
    console.log('Rectangle drawing starting...');
    window.drawingActiveLayerId = activeLayerId;

    if (window.drawControl && window.drawControl._toolbars && window.drawControl._toolbars.draw) {
        const rectangleTool = window.drawControl._toolbars.draw._modes.rectangle;
        if (rectangleTool && rectangleTool.handler) {
            rectangleTool.handler.enable();
        } else {
            console.error('Rectangle tool not found');
        }
    } else {
        console.error('Draw control not found');
    }
}

/**
 * Start circle drawing mode
 */
export function startCircleDrawing() {
    console.log('Circle drawing starting...');
    window.drawingActiveLayerId = activeLayerId;

    if (window.drawControl && window.drawControl._toolbars && window.drawControl._toolbars.draw) {
        const circleTool = window.drawControl._toolbars.draw._modes.circle;
        if (circleTool && circleTool.handler) {
            circleTool.handler.enable();
        } else {
            console.error('Circle tool not found');
        }
    } else {
        console.error('Draw control not found');
    }
}

/**
 * Start continuous point mode
 */
export function startContinuousPointMode() {
    window.continuousPointMode = true;
    startDrawing('marker');
}

/**
 * Stop continuous point mode
 */
export function stopContinuousPointMode() {
    if (window.continuousPointMode) {
        console.log('Stopping continuous point mode...');
        window.continuousPointMode = false;

        // Stop active drawing tools
        if (window.drawControl && window.drawControl._toolbars.draw._modes.marker) {
            const markerHandler = window.drawControl._toolbars.draw._modes.marker;
            if (markerHandler.handler && markerHandler.handler.enabled && markerHandler.handler.enabled()) {
                markerHandler.handler.disable();
            }
        }

        // Clear active tool button classes
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));

        console.log('Continuous point mode stopped');
    }
}

/**
 * Check if continuous point mode is active
 * @returns {boolean} True if continuous point mode is active
 */
export function isContinuousPointMode() {
    return window.continuousPointMode || false;
}

/**
 * Enable drawing mode
 */
export function enableDrawing() {
    isDrawingMode = true;
}

/**
 * Disable drawing mode
 */
export function disableDrawing() {
    isDrawingMode = false;
    stopDrawing();
}

/**
 * Update draw control with current styles
 */
export function updateDrawControl() {
    // This function would rebuild the draw control with current style settings
    // Implementation depends on how styles are managed
    console.log('Draw control updated');
}

/**
 * Get draw control instance
 * @returns {Object|null} Draw control instance
 */
export function getDrawControl() {
    return drawControl;
}

/**
 * Handle draw created event
 * @param {Object} event - Leaflet draw event
 */
export function onDrawCreated(event) {
    console.log('Draw created:', event.layerType);
    window.drawingCompleted = true;
}

/**
 * Handle draw edited event
 * @param {Object} event - Leaflet draw event
 */
export function onDrawEdited(event) {
    console.log('Draw edited:', event.layers.getLayers().length, 'layers');
}

/**
 * Handle draw deleted event
 * @param {Object} event - Leaflet draw event
 */
export function onDrawDeleted(event) {
    console.log('Draw deleted:', event.layers.getLayers().length, 'layers');
}

/**
 * Handle draw start event
 * @param {Object} event - Leaflet draw event
 */
export function onDrawStart(event) {
    console.log('Draw start:', event.layerType);
    isDrawingMode = true;
}

/**
 * Handle draw stop event
 * @param {Object} event - Leaflet draw event
 */
export function onDrawStop(event) {
    console.log('Draw stop:', event.layerType);
    isDrawingMode = false;
}

/**
 * Set active layer ID
 * @param {string} layerId - Layer ID
 */
export function setActiveLayerId(layerId) {
    activeLayerId = layerId;
    window.activeLayerId = layerId;
}

/**
 * Get active layer ID
 * @returns {string|null} Active layer ID
 */
export function getActiveLayerId() {
    return activeLayerId;
}
