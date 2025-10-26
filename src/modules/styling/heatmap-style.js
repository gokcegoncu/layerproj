/**
 * Heatmap Style Module
 * Provides heatmap visualization using Leaflet.heat plugin
 */

import { AppState } from '../core/state.js';
import { showToast, showNotification } from '../ui/notifications.js';

// Heatmap state
let heatmapLayer = null;
let heatmapActive = false;

/**
 * Create heatmap layer using Leaflet.heat
 * @param {number} radius - Heat radius in pixels (default: 60 for better visibility)
 * @param {number} blur - Blur amount (default: 40 for smoother gradients)
 * @returns {L.HeatLayer|null} - Created heatmap layer or null
 */
export function createHeatmapLayer(radius = 60, blur = 40) {
    // Remove old heatmap if exists
    if (heatmapLayer && window.map && window.map.hasLayer(heatmapLayer)) {
        window.map.removeLayer(heatmapLayer);
        heatmapLayer = null;
    }

    // Debug: Log all drawn layers
    console.log('🔍 Total drawn layers:', window.drawnLayers.length);
    console.log('🔍 Drawn layers types:', window.drawnLayers.map(l => ({ id: l.id, type: l.type, hasValue: l.properties?.value !== undefined })));

    // Find points with value
    const pointsWithValue = window.drawnLayers.filter(l =>
        l.type === 'point' &&
        l.properties &&
        l.properties.value !== undefined &&
        l.layer &&
        l.layer.getLatLng
    );

    console.log(`🔍 Points with values found: ${pointsWithValue.length}`);

    if (pointsWithValue.length === 0) {
        showNotification('⚠️ No points with values found! First add values to points.', 'warning');
        console.warn('⚠️ Heatmap requires points with numeric "value" property');
        return null;
    }

    // Prepare data for heatmap [lat, lng, intensity]
    const heatData = pointsWithValue.map(l => {
        const latlng = l.layer.getLatLng();
        const intensity = l.properties.value;
        return [latlng.lat, latlng.lng, intensity];
    });

    // Check if Leaflet.heat is available
    if (typeof L.heatLayer === 'undefined') {
        console.error('Leaflet.heat plugin not loaded');
        showNotification('Heatmap plugin not available', 'error');
        return null;
    }

    // Create heatmap layer with enhanced visibility
    const maxValue = Math.max(...heatData.map(d => d[2]));

    heatmapLayer = L.heatLayer(heatData, {
        radius: radius,
        blur: blur,
        maxZoom: 17,
        max: maxValue * 0.5,  // Lower max = MORE intense colors
        minOpacity: 0.4,      // Minimum opacity for better visibility
        gradient: {
            0.0: 'blue',
            0.2: 'cyan',
            0.4: 'lime',
            0.6: 'yellow',
            0.8: 'orange',
            1.0: 'red'
        }
    });

    if (window.map) {
        heatmapLayer.addTo(window.map);
    }

    showNotification(`🔥 Isı Haritası Oluşturuldu! (${pointsWithValue.length} nokta, yarıçap: ${radius}px, bulanıklık: ${blur}px)`, 'success');
    heatmapActive = true;

    return heatmapLayer;
}

/**
 * Apply heatmap visualization
 * Gets parameters from UI and creates heatmap
 */
export function applyHeatmapVisualization() {
    const radius = parseInt(document.getElementById('heatmapRadius')?.value) || 50;
    const blur = parseInt(document.getElementById('heatmapBlur')?.value) || 35;

    createHeatmapLayer(radius, blur);
}

/**
 * Remove heatmap visualization
 */
export function removeHeatmapVisualization() {
    if (heatmapLayer && window.map && window.map.hasLayer(heatmapLayer)) {
        window.map.removeLayer(heatmapLayer);
        heatmapLayer = null;
    }
    heatmapActive = false;
    showNotification('🔵 Heatmap removed', 'info');
}

/**
 * Toggle heatmap visibility
 */
export function toggleHeatmap() {
    if (heatmapActive) {
        removeHeatmapVisualization();
    } else {
        applyHeatmapVisualization();
    }
}

/**
 * Apply heatmap style (alternative styling for points based on value)
 * Colors points from cold to hot based on their values
 */
export function applyHeatmapStyle() {
    // Get active layerId from modal
    const modal = document.getElementById('styleModal');
    const layerId = modal?.dataset?.layerId;

    if (!layerId) {
        showNotification('Active layer not found!', 'error');
        return;
    }

    // Get only features with values from active layer
    const layersWithValues = window.drawnLayers.filter(l =>
        l.layerId === layerId &&
        l.properties &&
        l.properties.value !== undefined
    );

    if (layersWithValues.length === 0) {
        showNotification('No features with values found in this layer!', 'warning');
        return;
    }

    const values = layersWithValues.map(l => l.properties.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    let applied = 0;
    layersWithValues.forEach(layerInfo => {
        const value = layerInfo.properties.value;
        const normalized = (value - min) / (max - min);

        // Cold to hot gradient (blue -> red)
        const r = Math.floor(255 * normalized);
        const b = Math.floor(255 * (1 - normalized));
        const color = `rgb(${r}, 100, ${b})`;

        if (layerInfo.layer && layerInfo.layer.setStyle) {
            const style = {
                fillColor: color,
                color: '#fff',
                weight: 2,
                fillOpacity: 0.6,
                radius: 8 + normalized * 8 // Size also depends on value
            };

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
    });

    // Refresh map
    if (window.map && window.map.invalidateSize) {
        setTimeout(() => window.map.invalidateSize(), 100);
    }

    showNotification(`🔥 Heatmap style applied! (${applied} features)`, 'success');
    console.log(`Heatmap style applied: ${applied} features, layer: ${layerId}`);
}

/**
 * Update heatmap configuration
 * @param {Object} config - Heatmap configuration
 * @param {number} config.radius - Heat radius
 * @param {number} config.blur - Blur amount
 * @param {Object} config.gradient - Color gradient
 * @param {number} config.maxZoom - Maximum zoom
 */
export function updateHeatmapConfig(config) {
    if (!heatmapLayer) {
        console.warn('No active heatmap layer to update');
        return;
    }

    // Update heatmap options
    if (config.radius !== undefined) {
        heatmapLayer.setOptions({ radius: config.radius });
    }

    if (config.blur !== undefined) {
        heatmapLayer.setOptions({ blur: config.blur });
    }

    if (config.gradient !== undefined) {
        heatmapLayer.setOptions({ gradient: config.gradient });
    }

    if (config.maxZoom !== undefined) {
        heatmapLayer.setOptions({ maxZoom: config.maxZoom });
    }

    // Redraw heatmap
    if (heatmapLayer.redraw) {
        heatmapLayer.redraw();
    }

    console.log('Heatmap configuration updated:', config);
}

/**
 * Get heatmap layer
 * @returns {L.HeatLayer|null} - Heatmap layer or null
 */
export function getHeatmapLayer() {
    return heatmapLayer;
}

/**
 * Check if heatmap is active
 * @returns {boolean} - True if heatmap is active
 */
export function isHeatmapActive() {
    return heatmapActive;
}

/**
 * Set heatmap intensity
 * @param {number} intensity - Intensity multiplier
 */
export function setHeatmapIntensity(intensity) {
    if (!heatmapLayer) return;

    // Update max value based on intensity
    const pointsWithValue = window.drawnLayers.filter(l =>
        l.type === 'point' &&
        l.properties &&
        l.properties.value !== undefined
    );

    if (pointsWithValue.length > 0) {
        const values = pointsWithValue.map(l => l.properties.value);
        const maxValue = Math.max(...values);

        heatmapLayer.setOptions({
            max: maxValue * intensity
        });

        if (heatmapLayer.redraw) {
            heatmapLayer.redraw();
        }
    }
}

/**
 * Set heatmap gradient
 * @param {Object} gradient - Gradient object
 */
export function setHeatmapGradient(gradient) {
    if (!heatmapLayer) return;

    heatmapLayer.setOptions({ gradient: gradient });

    if (heatmapLayer.redraw) {
        heatmapLayer.redraw();
    }
}

/**
 * Predefined heatmap gradients
 */
export const HeatmapGradients = {
    default: {
        0.0: 'blue',
        0.2: 'cyan',
        0.4: 'lime',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red'
    },
    fire: {
        0.0: 'yellow',
        0.5: 'orange',
        1.0: 'red'
    },
    cool: {
        0.0: 'blue',
        0.5: 'cyan',
        1.0: 'green'
    },
    rainbow: {
        0.0: 'blue',
        0.2: 'cyan',
        0.4: 'green',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red'
    },
    grayscale: {
        0.0: 'black',
        0.5: 'gray',
        1.0: 'white'
    },
    purple: {
        0.0: 'purple',
        0.5: 'magenta',
        1.0: 'pink'
    }
};

/**
 * Apply predefined gradient
 * @param {string} gradientName - Gradient name
 */
export function applyHeatmapGradient(gradientName) {
    const gradient = HeatmapGradients[gradientName];
    if (gradient) {
        setHeatmapGradient(gradient);
        showToast(`Applied ${gradientName} gradient`, 'success');
    }
}

/**
 * Export heatmap configuration
 * @returns {Object} - Heatmap configuration
 */
export function exportHeatmapConfig() {
    if (!heatmapLayer) {
        return null;
    }

    return {
        type: 'heatmap',
        active: heatmapActive,
        options: {
            radius: heatmapLayer.options.radius,
            blur: heatmapLayer.options.blur,
            maxZoom: heatmapLayer.options.maxZoom,
            max: heatmapLayer.options.max,
            gradient: heatmapLayer.options.gradient
        }
    };
}

/**
 * Import heatmap configuration
 * @param {Object} config - Heatmap configuration
 */
export function importHeatmapConfig(config) {
    if (!config || config.type !== 'heatmap') {
        console.error('Invalid heatmap configuration');
        return;
    }

    // Set UI values
    if (config.options) {
        const radiusInput = document.getElementById('heatmapRadius');
        if (radiusInput && config.options.radius !== undefined) {
            radiusInput.value = config.options.radius;
        }

        const blurInput = document.getElementById('heatmapBlur');
        if (blurInput && config.options.blur !== undefined) {
            blurInput.value = config.options.blur;
        }
    }

    // Create heatmap with imported config
    if (config.active) {
        createHeatmapLayer(
            config.options?.radius || 50,
            config.options?.blur || 35
        );

        // Apply additional options
        if (config.options) {
            updateHeatmapConfig({
                maxZoom: config.options.maxZoom,
                gradient: config.options.gradient
            });
        }
    }
}

/**
 * Get heatmap data points
 * @returns {Array} - Array of [lat, lng, intensity] points
 */
export function getHeatmapDataPoints() {
    const pointsWithValue = window.drawnLayers.filter(l =>
        l.type === 'point' &&
        l.properties &&
        l.properties.value !== undefined &&
        l.layer &&
        l.layer.getLatLng
    );

    return pointsWithValue.map(l => {
        const latlng = l.layer.getLatLng();
        return [latlng.lat, latlng.lng, l.properties.value];
    });
}

/**
 * Create heatmap from GeoJSON
 * @param {Object} geojson - GeoJSON feature collection
 * @param {string} valueField - Field name for intensity values
 * @param {Object} options - Heatmap options
 */
export function createHeatmapFromGeoJSON(geojson, valueField, options = {}) {
    if (!geojson || !geojson.features) {
        console.error('Invalid GeoJSON');
        return null;
    }

    // Extract point features with values
    const heatData = [];

    geojson.features.forEach(feature => {
        if (feature.geometry.type === 'Point' &&
            feature.properties &&
            feature.properties[valueField] !== undefined) {

            const coords = feature.geometry.coordinates;
            const intensity = feature.properties[valueField];

            // GeoJSON uses [lng, lat] format
            heatData.push([coords[1], coords[0], intensity]);
        }
    });

    if (heatData.length === 0) {
        showNotification('No valid point data found in GeoJSON', 'warning');
        return null;
    }

    // Remove old heatmap
    if (heatmapLayer && window.map && window.map.hasLayer(heatmapLayer)) {
        window.map.removeLayer(heatmapLayer);
    }

    // Create heatmap
    const defaultOptions = {
        radius: 50,
        blur: 35,
        maxZoom: 17,
        max: Math.max(...heatData.map(d => d[2])),
        gradient: HeatmapGradients.default
    };

    heatmapLayer = L.heatLayer(heatData, { ...defaultOptions, ...options });

    if (window.map) {
        heatmapLayer.addTo(window.map);
    }

    heatmapActive = true;

    showNotification(`🔥 Heatmap created from GeoJSON! (${heatData.length} points)`, 'success');

    return heatmapLayer;
}

/**
 * Interpolate heatmap value at specific location
 * @param {L.LatLng} latlng - Location
 * @returns {number|null} - Interpolated value or null
 */
export function getHeatmapValueAt(latlng) {
    if (!heatmapActive || !heatmapLayer) {
        return null;
    }

    // Get all data points
    const dataPoints = getHeatmapDataPoints();

    if (dataPoints.length === 0) {
        return null;
    }

    // Simple inverse distance weighted interpolation
    let totalWeight = 0;
    let weightedSum = 0;
    const radius = heatmapLayer.options.radius || 50;

    dataPoints.forEach(point => {
        const pointLatLng = L.latLng(point[0], point[1]);
        const distance = latlng.distanceTo(pointLatLng);

        if (distance < radius) {
            const weight = 1 / (distance + 1); // Add 1 to avoid division by zero
            totalWeight += weight;
            weightedSum += point[2] * weight;
        }
    });

    if (totalWeight === 0) {
        return null;
    }

    return weightedSum / totalWeight;
}

/**
 * Update heatmap data
 * Refreshes heatmap with current data
 */
export function updateHeatmapData() {
    if (!heatmapActive) {
        return;
    }

    const radius = heatmapLayer?.options?.radius || 50;
    const blur = heatmapLayer?.options?.blur || 35;

    createHeatmapLayer(radius, blur);
}

/**
 * Clear heatmap
 * Removes heatmap layer completely
 */
export function clearHeatmap() {
    removeHeatmapVisualization();
}

// Export heatmap state
export { heatmapLayer, heatmapActive };
