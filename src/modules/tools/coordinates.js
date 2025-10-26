/**
 * Coordinates Module
 * Handles coordinate display, transformation, and projection management
 */

let currentProjection = 'EPSG:4326';
let map = null;

/**
 * Initialize coordinate system
 * @param {Object} leafletMap - Leaflet map instance
 */
export function initCoordinateSystem(leafletMap) {
    map = leafletMap;
    setupCoordinateDisplay();
}

/**
 * Setup coordinate display
 */
export function setupCoordinateDisplay() {
    if (!map) return;

    map.on('mousemove', function (e) {
        updateCoordinateDisplay(e.latlng);
    });

    map.on('click', function (e) {
        updateCoordinateDisplay(e.latlng);
    });
}

/**
 * Update coordinate display
 * @param {Object} latlng - Leaflet LatLng object
 */
export function updateCoordinateDisplay(latlng) {
    try {
        const coords = convertCoordinates(latlng, currentProjection);

        const xElement = document.getElementById('coordinateX');
        const yElement = document.getElementById('coordinateY');

        if (xElement) xElement.textContent = `X: ${coords.x}`;
        if (yElement) yElement.textContent = `Y: ${coords.y}`;
    } catch (error) {
        console.error('Error updating coordinate display:', error);
    }
}

/**
 * Convert coordinates to target projection
 * @param {Object} latlng - Leaflet LatLng object
 * @param {string} targetProjection - Target projection (EPSG code)
 * @returns {Object} Converted coordinates {x, y}
 */
export function convertCoordinates(latlng, targetProjection) {
    let x, y;

    switch (targetProjection) {
        case 'EPSG:4326': // WGS84
            x = latlng.lng.toFixed(6);
            y = latlng.lat.toFixed(6);
            break;

        case 'EPSG:3857': // Web Mercator
            if (typeof proj4 !== 'undefined') {
                const webMercator = proj4('EPSG:4326', 'EPSG:3857', [latlng.lng, latlng.lat]);
                x = webMercator[0].toFixed(2);
                y = webMercator[1].toFixed(2);
            } else {
                x = latlng.lng.toFixed(6);
                y = latlng.lat.toFixed(6);
            }
            break;

        case 'EPSG:5254': // ITRF96 / UTM 35N
            if (typeof proj4 !== 'undefined') {
                const itrf96 = proj4('EPSG:4326', 'EPSG:5254', [latlng.lng, latlng.lat]);
                x = itrf96[0].toFixed(2);
                y = itrf96[1].toFixed(2);
            } else {
                x = latlng.lng.toFixed(6);
                y = latlng.lat.toFixed(6);
            }
            break;

        case 'EPSG:2320': // ED50 / TM30
            if (typeof proj4 !== 'undefined') {
                const ed50 = proj4('EPSG:4326', 'EPSG:2320', [latlng.lng, latlng.lat]);
                x = ed50[0].toFixed(2);
                y = ed50[1].toFixed(2);
            } else {
                x = latlng.lng.toFixed(6);
                y = latlng.lat.toFixed(6);
            }
            break;

        case 'EPSG:32635': // WGS84 / UTM 35N
            if (typeof proj4 !== 'undefined') {
                const utm35n = proj4('EPSG:4326', 'EPSG:32635', [latlng.lng, latlng.lat]);
                x = utm35n[0].toFixed(2);
                y = utm35n[1].toFixed(2);
            } else {
                x = latlng.lng.toFixed(6);
                y = latlng.lat.toFixed(6);
            }
            break;

        case 'EPSG:32636': // WGS84 / UTM 36N
            if (typeof proj4 !== 'undefined') {
                const utm36n = proj4('EPSG:4326', 'EPSG:32636', [latlng.lng, latlng.lat]);
                x = utm36n[0].toFixed(2);
                y = utm36n[1].toFixed(2);
            } else {
                x = latlng.lng.toFixed(6);
                y = latlng.lat.toFixed(6);
            }
            break;

        default:
            x = latlng.lng.toFixed(6);
            y = latlng.lat.toFixed(6);
    }

    return { x, y };
}

/**
 * Format coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} format - Format type (dd, dms, ddm)
 * @returns {Object} Formatted coordinates {lat, lng}
 */
export function formatCoordinates(lat, lng, format = 'dd') {
    switch (format) {
        case 'dd': // Decimal Degrees
            return {
                lat: lat.toFixed(6),
                lng: lng.toFixed(6)
            };

        case 'dms': // Degrees Minutes Seconds
            return {
                lat: convertToDMS(lat, 'lat'),
                lng: convertToDMS(lng, 'lng')
            };

        case 'ddm': // Degrees Decimal Minutes
            return {
                lat: convertToDDM(lat, 'lat'),
                lng: convertToDDM(lng, 'lng')
            };

        default:
            return {
                lat: lat.toFixed(6),
                lng: lng.toFixed(6)
            };
    }
}

/**
 * Convert to DMS (Degrees Minutes Seconds)
 * @param {number} value - Coordinate value
 * @param {string} type - Type (lat or lng)
 * @returns {string} DMS string
 */
function convertToDMS(value, type) {
    const absolute = Math.abs(value);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

    const direction = type === 'lat' ?
        (value >= 0 ? 'N' : 'S') :
        (value >= 0 ? 'E' : 'W');

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

/**
 * Convert to DDM (Degrees Decimal Minutes)
 * @param {number} value - Coordinate value
 * @param {string} type - Type (lat or lng)
 * @returns {string} DDM string
 */
function convertToDDM(value, type) {
    const absolute = Math.abs(value);
    const degrees = Math.floor(absolute);
    const minutes = ((absolute - degrees) * 60).toFixed(4);

    const direction = type === 'lat' ?
        (value >= 0 ? 'N' : 'S') :
        (value >= 0 ? 'E' : 'W');

    return `${degrees}° ${minutes}' ${direction}`;
}

/**
 * Transform coordinates between projections
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} fromProj - Source projection
 * @param {string} toProj - Target projection
 * @returns {Array} Transformed coordinates [x, y]
 */
export function transformCoordinates(x, y, fromProj, toProj) {
    if (typeof proj4 === 'undefined') {
        console.warn('proj4 library not loaded');
        return [x, y];
    }

    try {
        return proj4(fromProj, toProj, [x, y]);
    } catch (error) {
        console.error('Coordinate transformation error:', error);
        return [x, y];
    }
}

/**
 * Convert to WGS84
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} fromProj - Source projection
 * @returns {Array} WGS84 coordinates [lng, lat]
 */
export function convertToWGS84(x, y, fromProj) {
    return transformCoordinates(x, y, fromProj, 'EPSG:4326');
}

/**
 * Convert from WGS84
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} toProj - Target projection
 * @returns {Array} Transformed coordinates [x, y]
 */
export function convertFromWGS84(lat, lng, toProj) {
    return transformCoordinates(lng, lat, 'EPSG:4326', toProj);
}

/**
 * Setup projection system
 */
export function setupProjectionSystem() {
    if (typeof proj4 === 'undefined') {
        console.warn('proj4 library not loaded, projection transformations will be limited');
        return;
    }

    // Define common Turkish projections
    try {
        // ITRF96 / UTM Zone 35N
        proj4.defs('EPSG:5254', '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

        // ED50 / TM30
        proj4.defs('EPSG:2320', '+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs');

        console.log('Projection system initialized');
    } catch (error) {
        console.error('Error setting up projections:', error);
    }
}

/**
 * Add a projection definition
 * @param {string} code - EPSG code
 * @param {string} definition - Proj4 definition string
 */
export function addProjection(code, definition) {
    if (typeof proj4 === 'undefined') {
        console.warn('proj4 library not loaded');
        return false;
    }

    try {
        proj4.defs(code, definition);
        console.log(`Projection added: ${code}`);
        return true;
    } catch (error) {
        console.error('Error adding projection:', error);
        return false;
    }
}

/**
 * Get projection definition
 * @param {string} code - EPSG code
 * @returns {string|null} Projection definition
 */
export function getProjection(code) {
    if (typeof proj4 === 'undefined') {
        return null;
    }

    try {
        return proj4.defs(code);
    } catch (error) {
        console.error('Error getting projection:', error);
        return null;
    }
}

/**
 * List all projections
 * @returns {Object} Object containing all projection definitions
 */
export function listProjections() {
    if (typeof proj4 === 'undefined') {
        return {};
    }

    try {
        return proj4.defs;
    } catch (error) {
        console.error('Error listing projections:', error);
        return {};
    }
}

/**
 * Parse coordinate string
 * @param {string} coordString - Coordinate string
 * @returns {Object|null} Parsed coordinates {lat, lng}
 */
export function parseCoordinateString(coordString) {
    try {
        // Try parsing as "lat, lng" format
        const parts = coordString.split(',').map(s => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return { lat: parts[0], lng: parts[1] };
        }
        return null;
    } catch (error) {
        console.error('Error parsing coordinate string:', error);
        return null;
    }
}

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if valid
 */
export function validateCoordinates(lat, lng) {
    return !isNaN(lat) && !isNaN(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180;
}

/**
 * Get coordinate format
 * @returns {string} Current coordinate format
 */
export function getCoordinateFormat() {
    return currentProjection;
}

/**
 * Set coordinate format/projection
 * @param {string} format - Projection EPSG code
 */
export function setCoordinateFormat(format) {
    currentProjection = format;
    console.log(`Coordinate format set to: ${format}`);
}

/**
 * Get coordinate precision
 * @returns {number} Decimal places for display
 */
export function getCoordinatePrecision() {
    return currentProjection === 'EPSG:4326' ? 6 : 2;
}

/**
 * Set coordinate precision
 * @param {number} decimals - Number of decimal places
 */
export function setCoordinatePrecision(decimals) {
    // Implementation would store precision preference
    console.log(`Coordinate precision set to: ${decimals}`);
}

/**
 * Show coordinates panel
 */
export function showCoordinates() {
    const panel = document.getElementById('coordinatePanel');
    if (panel) {
        panel.style.display = 'block';
    }
}

/**
 * Hide coordinates panel
 */
export function hideCoordinates() {
    const panel = document.getElementById('coordinatePanel');
    if (panel) {
        panel.style.display = 'none';
    }
}
