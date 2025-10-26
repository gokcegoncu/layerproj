/**
 * Map Initialization and Setup
 * Handles Leaflet map creation and basic configuration
 */

import { CONFIG } from './config.js';

/**
 * Initialize the Leaflet map
 * @param {string} containerId - The ID of the map container element
 * @returns {L.Map} The initialized Leaflet map instance
 */
export function initializeMap(containerId = 'map') {
    const map = L.map(containerId).setView(CONFIG.MAP_CENTER, CONFIG.DEFAULT_ZOOM);

    // Add base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: CONFIG.MAX_ZOOM
    }).addTo(map);

    return map;
}

/**
 * Create and add feature group for drawn items
 * @param {L.Map} map - The Leaflet map instance
 * @returns {L.FeatureGroup} The feature group for drawn items
 */
export function createDrawnItemsLayer(map) {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    return drawnItems;
}

/**
 * Setup coordinate display system
 * @param {L.Map} map - The Leaflet map instance
 */
export function setupCoordinateDisplay(map) {
    // This will be implemented with coordinate display functionality
    // For now, this is a placeholder
    map.on('mousemove', (e) => {
        const coordElement = document.getElementById('coordinates');
        if (coordElement) {
            coordElement.textContent = `Lat: ${e.latlng.lat.toFixed(6)}, Lng: ${e.latlng.lng.toFixed(6)}`;
        }
    });
}

/**
 * Setup scale display
 * @param {L.Map} map - The Leaflet map instance
 */
export function setupScaleDisplay(map) {
    L.control.scale({
        position: 'bottomleft',
        metric: true,
        imperial: false
    }).addTo(map);
}

/**
 * Setup projection system (Proj4)
 */
export function setupProjectionSystem() {
    // Proj4 projection definitions
    if (typeof proj4 !== 'undefined') {
        // Common Turkish projections
        proj4.defs('EPSG:5254', '+proj=tmerc +lat_0=0 +lon_0=27 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
        proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
    }
}

/**
 * Invalidate map size (useful after container resize)
 * @param {L.Map} map - The Leaflet map instance
 */
export function invalidateMapSize(map) {
    setTimeout(() => {
        map.invalidateSize(true);
    }, 500);
}
