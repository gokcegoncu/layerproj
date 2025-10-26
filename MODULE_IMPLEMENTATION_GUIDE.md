
# Module Implementation Guide

This guide shows how to implement the remaining modules based on the original JavaScript code.

## Layer Management Modules

### src/modules/layers/layer-manager.js

```javascript
/**
 * Layer Management
 * Create, delete, select, and manage layers
 */

import { AppState } from '../core/state.js';
import { validateName } from '../utils/validation.js';
import { generateId } from '../utils/helpers.js';

/**
 * Create a new layer
 * @param {string} layerName - Name of the layer
 * @param {string} targetGroupId - ID of the parent group
 * @returns {string} Layer ID
 */
export function createLayer(layerName, targetGroupId) {
    const validation = validateName(layerName);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    const safeName = validation.sanitized;
    const layerId = generateId('layer');

    // Find target group
    const targetGroup = document.querySelector(`[data-group-id="${targetGroupId}"]`);
    if (!targetGroup) {
        throw new Error('Target group not found');
    }

    // Create layer HTML
    const layerHTML = `
        <div class="layer-item" data-layer-id="${layerId}">
            <div class="layer-selectable-area">
                <div class="layer-icons">
                    <div class="layer-icon inactive" title="Point data">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="8"/>
                        </svg>
                    </div>
                    <div class="layer-icon inactive" title="Line data">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M2 8 L8 8 L12 16 L16 16 L22 8" fill="none" stroke="currentColor" stroke-width="3"/>
                        </svg>
                    </div>
                    <div class="layer-icon inactive" title="Polygon data">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <polygon points="12,2 2,10 5,21 19,21 22,10" fill="currentColor" stroke="#000000" stroke-width="1"/>
                        </svg>
                    </div>
                </div>
                <span class="layer-name">${safeName}</span>
                <span class="layer-style-mode-indicator default-mode" data-layer-id="${layerId}" title="Default Corporate Settings" onclick="toggleLayerStyleMode('${layerId}', event)">
                    🏢
                </span>
            </div>
            <div class="layer-actions">
                <button class="layer-action-btn" onclick="zoomToLayer(this)" title="Zoom">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5,14H20.5L19,15.5L21.5,18L20,19.5L17.5,17L16,18.5V13.5H15.5M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L20,19.29L18.71,20.58L13.15,15C12,15.83 10.61,16.36 9.5,16.36A6.5,6.5 0 0,1 3,9.86A6.5,6.5 0 0,1 9.5,3.36V3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                    </svg>
                </button>
                <button class="layer-action-btn" title="Style Settings" onclick="openStyleModal()">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                    </svg>
                </button>
                <button class="layer-action-btn" title="Details" onclick="openLayerDetails(this)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13,7H11V5H13M13,17H11V9H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                </button>
                <button class="layer-action-btn" title="Delete" onclick="deleteLayer(this)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;

    // Add to group
    const groupItems = targetGroup.querySelector('.group-items');
    groupItems.insertAdjacentHTML('beforeend', layerHTML);

    // Initialize layer features array
    const layerFeatures = AppState.get('layerFeatures');
    layerFeatures[layerId] = [];
    AppState.set('layerFeatures', layerFeatures);

    // Select the new layer
    selectLayer(layerId);

    return layerId;
}

/**
 * Select a layer
 */
export function selectLayer(layerId) {
    // Clear all selections
    document.querySelectorAll('.layer-item').forEach(item => {
        item.classList.remove('selected-highlight', 'selected');
    });

    // Select this layer
    const layerItem = document.querySelector(`[data-layer-id="${layerId}"]`);
    if (layerItem) {
        layerItem.classList.add('selected-highlight', 'selected');
        AppState.set('activeLayerId', layerId);

        // Also select parent group
        const parentGroup = layerItem.closest('.layer-group');
        if (parentGroup) {
            const groupId = parentGroup.getAttribute('data-group-id');
            AppState.set('activeGroupId', groupId);
        }
    }
}

/**
 * Delete a layer
 */
export function deleteLayer(layerId) {
    const layerItem = document.querySelector(`[data-layer-id="${layerId}"]`);
    if (!layerItem) return;

    const layerName = layerItem.querySelector('.layer-name')?.textContent || 'Layer';

    if (!confirm(`Delete "${layerName}"? This action cannot be undone.`)) {
        return;
    }

    // Remove features from map
    const layerFeatures = AppState.get('layerFeatures');
    if (layerFeatures[layerId]) {
        layerFeatures[layerId].forEach(feature => {
            // Remove from drawnItems
            if (window.drawnItems && feature.layer) {
                window.drawnItems.removeLayer(feature.layer);
            }
        });
        delete layerFeatures[layerId];
        AppState.set('layerFeatures', layerFeatures);
    }

    // Clear selection if this layer was active
    if (AppState.get('activeLayerId') === layerId) {
        AppState.set('activeLayerId', null);
    }

    // Remove from DOM
    layerItem.remove();
}

/**
 * Get active layer element
 */
export function getActiveLayer() {
    const layerId = AppState.get('activeLayerId');
    if (!layerId) return null;

    return document.querySelector(`[data-layer-id="${layerId}"]`);
}

/**
 * Update layer icons based on feature types
 */
export function updateLayerIcons(layerId) {
    const layerItem = document.querySelector(`[data-layer-id="${layerId}"]`);
    if (!layerItem) return;

    const layerFeatures = AppState.get('layerFeatures');
    const features = layerFeatures[layerId] || [];

    // Check feature types
    const hasPoint = features.some(f => f.type === 'point');
    const hasLine = features.some(f => f.type === 'line');
    const hasPolygon = features.some(f => f.type === 'polygon');

    // Update icons
    const pointIcon = layerItem.querySelector('.layer-icon:nth-child(1)');
    const lineIcon = layerItem.querySelector('.layer-icon:nth-child(2)');
    const polygonIcon = layerItem.querySelector('.layer-icon:nth-child(3)');

    if (pointIcon) {
        pointIcon.classList.toggle('active', hasPoint);
        pointIcon.classList.toggle('inactive', !hasPoint);
    }

    if (lineIcon) {
        lineIcon.classList.toggle('active', hasLine);
        lineIcon.classList.toggle('inactive', !hasLine);
    }

    if (polygonIcon) {
        polygonIcon.classList.toggle('active', hasPolygon);
        polygonIcon.classList.toggle('inactive', !hasPolygon);
    }
}
```

### src/modules/tools/measurement.js

```javascript
/**
 * Measurement Tools
 * Distance and area measurement functionality
 */

import { CONFIG } from '../core/config.js';

/**
 * Measurement settings
 */
export const MeasurementSettings = {
    distance: {
        labelPosition: 'center',
        showTotal: true,
        showPartial: false,
        unit: 'auto'
    },
    area: {
        labelPosition: 'center',
        unit: 'auto'
    },
    labels: {
        size: 12,
        color: '#ffffff',
        backgroundColor: '#000000',
        showBackground: true,
        frequency: 3,
        minSegmentLength: 100
    },
    general: {
        liveUpdate: true
    }
};

/**
 * Measurement Tools Class
 */
export class MeasurementTools {
    constructor(map) {
        this.map = map;
        this.measurementLayers = L.layerGroup().addTo(map);
        this.currentTool = null;
        this.isActive = false;
        this.pointMarkers = [];
        this.segmentLabels = [];
        this.currentPoints = [];
        this.currentLine = null;
        this.currentPolygon = null;
    }

    /**
     * Start distance measurement
     */
    startDistance() {
        console.log('Starting distance measurement...');
        this.stopMeasurement();
        this.currentTool = 'distance';
        this.isActive = true;
        this.map.getContainer().style.cursor = 'crosshair';

        // Add event listeners
        this.map.off('click', this.onMapClick, this);
        this.map.off('dblclick', this.onMapDoubleClick, this);
        this.map.on('click', this.onMapClick, this);
        this.map.on('dblclick', this.onMapDoubleClick, this);

        this.disableMapInteraction();
        this.currentPoints = [];
        this.pointMarkers = [];

        console.log('Distance measurement active');
    }

    /**
     * Start area measurement
     */
    startArea() {
        console.log('Starting area measurement...');
        this.stopMeasurement();
        this.currentTool = 'area';
        this.isActive = true;
        this.map.getContainer().style.cursor = 'crosshair';

        // Add event listeners
        this.map.off('click', this.onMapClick, this);
        this.map.off('dblclick', this.onMapDoubleClick, this);
        this.map.on('click', this.onMapClick, this);
        this.map.on('dblclick', this.onMapDoubleClick, this);

        this.disableMapInteraction();
        this.currentPoints = [];
        this.pointMarkers = [];

        console.log('Area measurement active');
    }

    /**
     * Handle map click
     */
    onMapClick(e) {
        if (!this.isActive) return;

        // Stop propagation
        if (e.originalEvent) {
            e.originalEvent.stopPropagation();
            e.originalEvent.preventDefault();
        }

        this.currentPoints.push(e.latlng);
        this.addPointMarker(e.latlng);

        if (this.currentTool === 'distance') {
            this.updateDistanceMeasurement();
        } else if (this.currentTool === 'area') {
            this.updateAreaMeasurement();
        }
    }

    /**
     * Add point marker
     */
    addPointMarker(latlng) {
        const marker = L.circleMarker(latlng, {
            radius: 4,
            fillColor: '#ff4444',
            color: 'white',
            weight: 2,
            opacity: 1,
            fillOpacity: 1
        });

        this.pointMarkers.push(marker);
        this.measurementLayers.addLayer(marker);
    }

    /**
     * Handle double click (finish measurement)
     */
    onMapDoubleClick(e) {
        if (!this.isActive) return;
        this.stopMeasurement();
    }

    /**
     * Update distance measurement
     */
    updateDistanceMeasurement() {
        if (this.currentPoints.length >= 2) {
            // Remove old line
            if (this.currentLine) {
                this.measurementLayers.removeLayer(this.currentLine);
            }
            this.clearSegmentLabels();

            // Create new line
            this.currentLine = L.polyline(this.currentPoints, {
                color: '#ff4444',
                weight: 3,
                dashArray: '5, 5',
                opacity: 0.8
            });

            // Calculate distance
            const totalDistance = this.calculateDistance(this.currentPoints);
            const formattedDistance = this.formatDistance(totalDistance);

            // Add labels
            this.addDistanceLabels(this.currentLine, totalDistance, formattedDistance);

            this.measurementLayers.addLayer(this.currentLine);
        }
    }

    /**
     * Update area measurement
     */
    updateAreaMeasurement() {
        if (this.currentPoints.length >= 3) {
            // Remove old polygon
            if (this.currentPolygon) {
                this.measurementLayers.removeLayer(this.currentPolygon);
            }

            // Create new polygon
            this.currentPolygon = L.polygon(this.currentPoints, {
                color: '#4444ff',
                weight: 2,
                fillColor: '#4444ff',
                fillOpacity: 0.2,
                opacity: 0.8
            });

            // Calculate area
            const area = this.calculateArea(this.currentPoints);
            const formattedArea = this.formatArea(area);

            // Add label
            this.addAreaLabel(this.currentPolygon, area, formattedArea);

            this.measurementLayers.addLayer(this.currentPolygon);
        }
    }

    /**
     * Calculate distance
     */
    calculateDistance(latlngs) {
        let totalDistance = 0;
        for (let i = 0; i < latlngs.length - 1; i++) {
            totalDistance += latlngs[i].distanceTo(latlngs[i + 1]);
        }
        return totalDistance;
    }

    /**
     * Calculate area
     */
    calculateArea(latlngs) {
        if (latlngs.length < 3) return 0;

        let area = 0;
        const n = latlngs.length;

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += latlngs[i].lat * latlngs[j].lng;
            area -= latlngs[j].lat * latlngs[i].lng;
        }

        area = Math.abs(area) / 2;
        return area * 111320 * 111320 * Math.cos(latlngs[0].lat * Math.PI / 180);
    }

    /**
     * Format distance
     */
    formatDistance(distance) {
        const unit = MeasurementSettings.distance.unit;

        if (unit === 'auto') {
            return distance > 1000 ?
                `${(distance / 1000).toFixed(2)} km` :
                `${distance.toFixed(0)} m`;
        }

        // Handle other units...
        return `${distance.toFixed(0)} m`;
    }

    /**
     * Format area
     */
    formatArea(area) {
        const unit = MeasurementSettings.area.unit;

        if (unit === 'auto') {
            return area > 10000 ?
                `${(area / 10000).toFixed(2)} ha` :
                `${area.toFixed(0)} m²`;
        }

        // Handle other units...
        return `${area.toFixed(0)} m²`;
    }

    /**
     * Add distance labels
     */
    addDistanceLabels(polyline, totalDistance, formattedDistance) {
        if (MeasurementSettings.distance.showTotal) {
            const center = this.getLineCenter(polyline.getLatLngs());
            const tooltip = L.marker(center, {
                icon: L.divIcon({
                    html: `<div style="background: #000; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${formattedDistance}</div>`,
                    className: 'measurement-tooltip',
                    iconSize: [0, 0]
                })
            });
            this.segmentLabels.push(tooltip);
            this.measurementLayers.addLayer(tooltip);
        }
    }

    /**
     * Add area label
     */
    addAreaLabel(polygon, area, formattedArea) {
        const center = polygon.getBounds().getCenter();
        const tooltip = L.marker(center, {
            icon: L.divIcon({
                html: `<div style="background: #000; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${formattedArea}</div>`,
                className: 'measurement-tooltip',
                iconSize: [0, 0]
            })
        });
        this.segmentLabels.push(tooltip);
        this.measurementLayers.addLayer(tooltip);
    }

    /**
     * Get line center
     */
    getLineCenter(points) {
        if (points.length === 0) return null;
        if (points.length === 1) return points[0];

        let totalDistance = 0;
        const distances = [];

        for (let i = 0; i < points.length - 1; i++) {
            const dist = points[i].distanceTo(points[i + 1]);
            distances.push(dist);
            totalDistance += dist;
        }

        const halfDistance = totalDistance / 2;
        let currentDistance = 0;

        for (let i = 0; i < distances.length; i++) {
            if (currentDistance + distances[i] >= halfDistance) {
                const ratio = (halfDistance - currentDistance) / distances[i];
                return L.latLng(
                    points[i].lat + (points[i + 1].lat - points[i].lat) * ratio,
                    points[i].lng + (points[i + 1].lng - points[i].lng) * ratio
                );
            }
            currentDistance += distances[i];
        }

        return points[Math.floor(points.length / 2)];
    }

    /**
     * Clear segment labels
     */
    clearSegmentLabels() {
        this.segmentLabels.forEach(label => {
            this.measurementLayers.removeLayer(label);
        });
        this.segmentLabels = [];
    }

    /**
     * Disable map interaction
     */
    disableMapInteraction() {
        this.map.dragging.disable();
        this.map.doubleClickZoom.disable();
        this.map.scrollWheelZoom.disable();
        this.map.touchZoom.disable();
        this.map.keyboard.disable();
    }

    /**
     * Enable map interaction
     */
    enableMapInteraction() {
        this.map.dragging.enable();
        this.map.doubleClickZoom.enable();
        this.map.scrollWheelZoom.enable();
        this.map.touchZoom.enable();
        this.map.keyboard.enable();
    }

    /**
     * Stop measurement
     */
    stopMeasurement() {
        console.log('Stopping measurement...');
        this.isActive = false;
        this.currentTool = null;

        // Remove event listeners
        this.map.off('click', this.onMapClick, this);
        this.map.off('dblclick', this.onMapDoubleClick, this);
        this.map.getContainer().style.cursor = '';

        this.enableMapInteraction();

        // Clear data
        this.currentPoints = [];
        this.currentLine = null;
        this.currentPolygon = null;
        this.pointMarkers = [];
        this.clearSegmentLabels();

        // Clear active tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    /**
     * Clear all measurements
     */
    clearAll() {
        this.measurementLayers.clearLayers();
        this.stopMeasurement();
    }
}
```

## HTML Integration

To use the modular system, update your HTML:

```html
<!-- Change from: -->
<script src="app.js"></script>

<!-- To: -->
<script type="module" src="src/main.js"></script>
```

## Browser Compatibility

ES6 modules are supported in all modern browsers. For older browser support, use a bundler like:
- Vite (recommended for development)
- Webpack
- Rollup

## Development Setup

1. Use a local development server (modules require HTTP protocol):
   ```bash
   # Python
   python -m http.server 8000

   # Node.js
   npx http-server

   # VS Code Live Server extension
   ```

2. Access at `http://localhost:8000`

## Testing Individual Modules

```javascript
// Import and test a module
import { validateName } from './src/modules/utils/validation.js';

console.log(validateName('My Layer')); // { valid: true, sanitized: 'My Layer' }
console.log(validateName('<script>alert("xss")</script>')); // { valid: false, error: '...' }
```

This modular structure provides better:
- Code organization
- Maintainability
- Testability
- Reusability
- Development experience
