/**
 * Measurement Tools Module
 * Provides distance and area measurement functionality
 */

import { AppState } from '../core/state.js';
import { showToast, showNotification } from '../ui/notifications.js';

// Measurement state
let measurementTools = null;
const activeMeasurement = null;
let measurementLayers = [];

/**
 * Initialize measurement tools
 * @param {L.Map} map - Leaflet map instance
 */
export function initMeasurementTools(map) {
    if (!map) {
        console.error('initMeasurementTools: Map instance required');
        return;
    }

    measurementTools = {
        map: map,
        currentTool: null,
        measurementLayer: L.layerGroup().addTo(map),

        /**
         * Start distance measurement
         */
        startDistance: function() {
            this.stopCurrent();
            this.currentTool = 'distance';
            console.log('Distance measurement started');

            // Enable drawing mode for distance
            if (window.drawControl && window.drawControl._toolbars && window.drawControl._toolbars.draw) {
                const polylineTool = window.drawControl._toolbars.draw._modes.polyline;
                if (polylineTool && polylineTool.handler) {
                    polylineTool.handler.enable();
                    showToast('Click on map to measure distance', 'info');
                }
            }
        },

        /**
         * Start area measurement
         */
        startArea: function() {
            this.stopCurrent();
            this.currentTool = 'area';
            console.log('Area measurement started');

            // Enable drawing mode for area
            if (window.drawControl && window.drawControl._toolbars && window.drawControl._toolbars.draw) {
                const polygonTool = window.drawControl._toolbars.draw._modes.polygon;
                if (polygonTool && polygonTool.handler) {
                    polygonTool.handler.enable();
                    showToast('Click on map to measure area', 'info');
                }
            }
        },

        /**
         * Stop current measurement
         */
        stopCurrent: function() {
            if (this.currentTool) {
                console.log('Stopping current measurement:', this.currentTool);

                // Disable any active drawing
                if (window.drawControl && window.drawControl._toolbars && window.drawControl._toolbars.draw) {
                    const toolbar = window.drawControl._toolbars.draw;
                    Object.keys(toolbar._modes).forEach(key => {
                        const mode = toolbar._modes[key];
                        if (mode.handler && mode.handler.enabled()) {
                            mode.handler.disable();
                        }
                    });
                }

                this.currentTool = null;
            }
        },

        /**
         * Clear all measurements
         */
        clearAll: function() {
            this.stopCurrent();
            this.measurementLayer.clearLayers();
            measurementLayers = [];
            console.log('All measurements cleared');
            showToast('Measurements cleared', 'info');
        },

        /**
         * Add measurement to layer
         * @param {L.Layer} layer - Measurement layer
         */
        addMeasurement: function(layer) {
            this.measurementLayer.addLayer(layer);
            measurementLayers.push(layer);
        }
    };

    // Set up measurement event listeners
    setupMeasurementEvents(map);

    return measurementTools;
}

/**
 * Setup measurement event listeners
 * @param {L.Map} map - Leaflet map instance
 */
function setupMeasurementEvents(map) {
    // Listen for draw events
    map.on('draw:created', function(e) {
        if (!measurementTools || !measurementTools.currentTool) return;

        const layer = e.layer;
        const type = e.layerType;

        if (measurementTools.currentTool === 'distance' && type === 'polyline') {
            handleDistanceMeasurement(layer);
        } else if (measurementTools.currentTool === 'area' && type === 'polygon') {
            handleAreaMeasurement(layer);
        }
    });
}

/**
 * Handle distance measurement
 * @param {L.Polyline} layer - Polyline layer
 */
function handleDistanceMeasurement(layer) {
    const latlngs = layer.getLatLngs();
    let totalDistance = 0;

    // Calculate total distance
    for (let i = 0; i < latlngs.length - 1; i++) {
        totalDistance += latlngs[i].distanceTo(latlngs[i + 1]);
    }

    // Format distance
    const formattedDistance = formatDistance(totalDistance);

    // Style the measurement line
    layer.setStyle({
        color: '#2ecc71',
        weight: 3,
        opacity: 0.8,
        dashArray: '5, 10'
    });

    // Add measurement popup
    const popupContent = `
        <div style="text-align: center;">
            <strong>Distance Measurement</strong><br>
            <span style="font-size: 16px; color: #2ecc71;">${formattedDistance}</span>
        </div>
    `;
    layer.bindPopup(popupContent).openPopup();

    // Add labels for each segment
    addSegmentLabels(layer, latlngs);

    // Add to measurement layer
    if (measurementTools) {
        measurementTools.addMeasurement(layer);
    }

    console.log('Distance measured:', formattedDistance);
    showToast(`Distance: ${formattedDistance}`, 'success');
}

/**
 * Handle area measurement
 * @param {L.Polygon} layer - Polygon layer
 */
function handleAreaMeasurement(layer) {
    const latlngs = layer.getLatLngs()[0] || layer.getLatLngs();

    // Calculate area
    let area = 0;
    if (L.GeometryUtil && L.GeometryUtil.geodesicArea) {
        area = L.GeometryUtil.geodesicArea(latlngs);
    } else {
        // Fallback calculation
        area = calculatePolygonArea(latlngs);
    }

    // Calculate perimeter
    let perimeter = 0;
    for (let i = 0; i < latlngs.length; i++) {
        const next = (i + 1) % latlngs.length;
        perimeter += latlngs[i].distanceTo(latlngs[next]);
    }

    // Format values
    const formattedArea = formatArea(area);
    const formattedPerimeter = formatDistance(perimeter);

    // Style the measurement polygon
    layer.setStyle({
        color: '#3498db',
        fillColor: '#3498db',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.2,
        dashArray: '5, 10'
    });

    // Add measurement popup
    const popupContent = `
        <div style="text-align: center;">
            <strong>Area Measurement</strong><br>
            <span style="font-size: 16px; color: #3498db;">Area: ${formattedArea}</span><br>
            <span style="font-size: 12px; color: #666;">Perimeter: ${formattedPerimeter}</span>
        </div>
    `;
    layer.bindPopup(popupContent).openPopup();

    // Add to measurement layer
    if (measurementTools) {
        measurementTools.addMeasurement(layer);
    }

    console.log('Area measured:', formattedArea, 'Perimeter:', formattedPerimeter);
    showToast(`Area: ${formattedArea}`, 'success');
}

/**
 * Add segment labels to a polyline
 * @param {L.Polyline} layer - Polyline layer
 * @param {Array<L.LatLng>} latlngs - Coordinates
 */
function addSegmentLabels(layer, latlngs) {
    if (!layer._segmentLabels) {
        layer._segmentLabels = [];
    }

    for (let i = 0; i < latlngs.length - 1; i++) {
        const p1 = latlngs[i];
        const p2 = latlngs[i + 1];

        // Calculate segment distance
        const distance = p1.distanceTo(p2);
        const formattedDistance = formatDistance(distance);

        // Calculate midpoint
        const midLat = (p1.lat + p2.lat) / 2;
        const midLng = (p1.lng + p2.lng) / 2;
        const midPoint = L.latLng(midLat, midLng);

        // Create label marker
        const icon = L.divIcon({
            className: 'measurement-label',
            html: `<div style="background: white; padding: 2px 6px; border: 1px solid #2ecc71; border-radius: 3px; font-size: 11px; white-space: nowrap;">${formattedDistance}</div>`,
            iconSize: [null, null],
            iconAnchor: [0, 0]
        });

        const marker = L.marker(midPoint, {
            icon: icon,
            interactive: false
        });

        if (measurementTools && measurementTools.measurementLayer) {
            measurementTools.measurementLayer.addLayer(marker);
        }

        layer._segmentLabels.push(marker);
    }
}

/**
 * Calculate polygon area (fallback method)
 * @param {Array<L.LatLng>} latlngs - Polygon coordinates
 * @returns {number} - Area in square meters
 */
function calculatePolygonArea(latlngs) {
    if (!latlngs || latlngs.length < 3) return 0;

    let area = 0;
    const n = latlngs.length;

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += latlngs[i].lng * latlngs[j].lat;
        area -= latlngs[j].lng * latlngs[i].lat;
    }

    area = Math.abs(area) / 2;

    // Convert to square meters (rough approximation)
    const metersPerDegree = 111320;
    return area * metersPerDegree * metersPerDegree;
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} - Formatted distance
 */
export function formatDistance(meters) {
    if (meters < 1000) {
        return `${meters.toFixed(2)} m`;
    } else if (meters < 100000) {
        return `${(meters / 1000).toFixed(2)} km`;
    } else {
        return `${(meters / 1000).toFixed(0)} km`;
    }
}

/**
 * Format area for display
 * @param {number} sqMeters - Area in square meters
 * @returns {string} - Formatted area
 */
export function formatArea(sqMeters) {
    if (sqMeters < 10000) {
        return `${sqMeters.toFixed(2)} m²`;
    } else if (sqMeters < 1000000) {
        return `${(sqMeters / 10000).toFixed(2)} ha`;
    } else {
        return `${(sqMeters / 1000000).toFixed(2)} km²`;
    }
}

/**
 * Start measurement
 * @param {string} type - Measurement type ('distance' or 'area')
 */
export function startMeasurement(type) {
    console.log('startMeasurement called:', type);
    console.log('measurementTools:', measurementTools);

    if (measurementTools) {
        // Reset all tool buttons to normal
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (type === 'distance') {
            console.log('Starting distance measurement...');
            measurementTools.startDistance();
            // Activate distance button
            const distanceBtn = document.getElementById('distanceBtn');
            if (distanceBtn) {
                distanceBtn.classList.add('active');
                console.log('Distance button activated');
            }
        } else if (type === 'area') {
            console.log('Starting area measurement...');
            measurementTools.startArea();
            // Activate area button
            const areaBtn = document.getElementById('areaBtn');
            if (areaBtn) {
                areaBtn.classList.add('active');
                console.log('Area button activated');
            }
        }
    } else {
        console.error('measurementTools not defined!');
        showNotification('Measurement system not loaded', 'error');
    }
}

/**
 * Stop measurement
 */
export function stopMeasurement() {
    if (measurementTools) {
        measurementTools.stopCurrent();

        // Reset all tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        showToast('Measurement stopped', 'info');
    }
}

/**
 * Clear all measurements
 */
export function clearMeasurements() {
    if (measurementTools) {
        measurementTools.clearAll();

        // Reset all tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }
}

/**
 * Get measurement tools instance
 * @returns {Object} - Measurement tools object
 */
export function getMeasurementTools() {
    return measurementTools;
}

/**
 * Measure distance between two points
 * @param {L.LatLng} point1 - First point
 * @param {L.LatLng} point2 - Second point
 * @returns {number} - Distance in meters
 */
export function measureDistance(point1, point2) {
    if (!point1 || !point2) {
        console.error('measureDistance: Both points required');
        return 0;
    }

    return point1.distanceTo(point2);
}

/**
 * Measure area of a polygon
 * @param {Array<L.LatLng>} latlngs - Polygon coordinates
 * @returns {number} - Area in square meters
 */
export function measureArea(latlngs) {
    if (!latlngs || latlngs.length < 3) {
        console.error('measureArea: At least 3 points required');
        return 0;
    }

    if (L.GeometryUtil && L.GeometryUtil.geodesicArea) {
        return L.GeometryUtil.geodesicArea(latlngs);
    }

    return calculatePolygonArea(latlngs);
}

/**
 * Create measurement tooltip
 * @param {L.Map} map - Map instance
 * @param {L.LatLng} position - Tooltip position
 * @param {string} content - Tooltip content
 * @returns {L.Tooltip} - Created tooltip
 */
export function createMeasurementTooltip(map, position, content) {
    const tooltip = L.tooltip({
        permanent: true,
        direction: 'center',
        className: 'measurement-tooltip',
        opacity: 0.9
    })
    .setLatLng(position)
    .setContent(content);

    if (measurementTools && measurementTools.measurementLayer) {
        measurementTools.measurementLayer.addLayer(tooltip);
    }

    return tooltip;
}

/**
 * Export measurements as GeoJSON
 * @returns {Object} - GeoJSON feature collection
 */
export function exportMeasurements() {
    if (!measurementLayers || measurementLayers.length === 0) {
        return {
            type: 'FeatureCollection',
            features: []
        };
    }

    const features = measurementLayers.map(layer => {
        const geojson = layer.toGeoJSON();

        // Add measurement properties
        if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
            const latlngs = layer.getLatLngs();
            let distance = 0;
            for (let i = 0; i < latlngs.length - 1; i++) {
                distance += latlngs[i].distanceTo(latlngs[i + 1]);
            }
            geojson.properties.distance = distance;
            geojson.properties.distanceFormatted = formatDistance(distance);
        } else if (layer instanceof L.Polygon) {
            const latlngs = layer.getLatLngs()[0] || layer.getLatLngs();
            const area = measureArea(latlngs);
            let perimeter = 0;
            for (let i = 0; i < latlngs.length; i++) {
                const next = (i + 1) % latlngs.length;
                perimeter += latlngs[i].distanceTo(latlngs[next]);
            }
            geojson.properties.area = area;
            geojson.properties.areaFormatted = formatArea(area);
            geojson.properties.perimeter = perimeter;
            geojson.properties.perimeterFormatted = formatDistance(perimeter);
        }

        return geojson;
    });

    return {
        type: 'FeatureCollection',
        features: features
    };
}

/**
 * Import measurements from GeoJSON
 * @param {Object} geojson - GeoJSON feature collection
 * @param {L.Map} map - Map instance
 */
export function importMeasurements(geojson, map) {
    if (!geojson || !geojson.features) {
        console.error('importMeasurements: Invalid GeoJSON');
        return;
    }

    if (!measurementTools) {
        initMeasurementTools(map);
    }

    geojson.features.forEach(feature => {
        const layer = L.geoJSON(feature, {
            style: {
                color: '#2ecc71',
                weight: 3,
                opacity: 0.8
            }
        });

        if (measurementTools && measurementTools.measurementLayer) {
            measurementTools.measurementLayer.addLayer(layer);
            measurementLayers.push(layer);
        }
    });

    showToast(`Imported ${geojson.features.length} measurements`, 'success');
}

/**
 * Toggle measurement layer visibility
 * @param {boolean} visible - Whether to show measurements
 */
export function toggleMeasurementVisibility(visible) {
    if (!measurementTools || !measurementTools.measurementLayer) return;

    if (visible) {
        measurementTools.map.addLayer(measurementTools.measurementLayer);
    } else {
        measurementTools.map.removeLayer(measurementTools.measurementLayer);
    }
}

/**
 * Get total measurements count
 * @returns {number} - Number of measurements
 */
export function getMeasurementCount() {
    return measurementLayers.length;
}

// Export measurement tools globally
export { measurementTools };
