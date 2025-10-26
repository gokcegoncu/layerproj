/**
 * Geometry Handlers Module
 * Handles geometry creation, manipulation, and Leaflet integration
 */

import { AppState } from '../core/state.js';
import { showToast, showNotification } from '../ui/notifications.js';

/**
 * Create a point marker on the map
 * @param {L.LatLng} latlng - Coordinates for the point
 * @param {Object} options - Marker options
 * @returns {L.Marker} - Created marker
 */
export function createPoint(latlng, options = {}) {
    const defaultOptions = {
        icon: L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            shadowSize: [41, 41]
        }),
        draggable: false,
        ...options
    };

    const marker = L.marker(latlng, defaultOptions);

    // Add to drawn items layer group
    if (state.drawnItems) {
        state.drawnItems.addLayer(marker);
    }

    return marker;
}

/**
 * Create a line (polyline) on the map
 * @param {Array<L.LatLng>} latlngs - Array of coordinates for the line
 * @param {Object} options - Line options
 * @returns {L.Polyline} - Created polyline
 */
export function createLine(latlngs, options = {}) {
    const defaultOptions = {
        color: '#ff7800',
        weight: 3,
        opacity: 1,
        lineJoin: 'round',
        lineCap: 'round',
        ...options
    };

    const polyline = L.polyline(latlngs, defaultOptions);

    // Add to drawn items layer group
    if (state.drawnItems) {
        state.drawnItems.addLayer(polyline);
    }

    return polyline;
}

/**
 * Create a polygon on the map
 * @param {Array<L.LatLng>} latlngs - Array of coordinates for the polygon
 * @param {Object} options - Polygon options
 * @returns {L.Polygon} - Created polygon
 */
export function createPolygon(latlngs, options = {}) {
    const defaultOptions = {
        color: '#000000',
        fillColor: '#3388ff',
        fillOpacity: 0.5,
        weight: 1,
        opacity: 1,
        ...options
    };

    const polygon = L.polygon(latlngs, defaultOptions);

    // Add to drawn items layer group
    if (state.drawnItems) {
        state.drawnItems.addLayer(polygon);
    }

    return polygon;
}

/**
 * Create a rectangle on the map
 * @param {L.LatLngBounds} bounds - Bounds for the rectangle
 * @param {Object} options - Rectangle options
 * @returns {L.Rectangle} - Created rectangle
 */
export function createRectangle(bounds, options = {}) {
    const defaultOptions = {
        color: '#000000',
        fillColor: '#3388ff',
        fillOpacity: 0.5,
        weight: 1,
        opacity: 1,
        ...options
    };

    const rectangle = L.rectangle(bounds, defaultOptions);

    // Add to drawn items layer group
    if (state.drawnItems) {
        state.drawnItems.addLayer(rectangle);
    }

    return rectangle;
}

/**
 * Create a circle on the map
 * @param {L.LatLng} center - Center coordinates for the circle
 * @param {Object} options - Circle options (must include radius)
 * @returns {L.Circle} - Created circle
 */
export function createCircle(center, options = {}) {
    const defaultOptions = {
        color: '#000000',
        fillColor: '#3388ff',
        fillOpacity: 0.5,
        weight: 1,
        opacity: 1,
        radius: 100, // Default radius in meters
        ...options
    };

    const circle = L.circle(center, defaultOptions);

    // Add to drawn items layer group
    if (state.drawnItems) {
        state.drawnItems.addLayer(circle);
    }

    return circle;
}

/**
 * Create a circle marker (fixed size marker) on the map
 * @param {L.LatLng} latlng - Coordinates for the circle marker
 * @param {Object} options - Circle marker options
 * @returns {L.CircleMarker} - Created circle marker
 */
export function createCircleMarker(latlng, options = {}) {
    const defaultOptions = {
        radius: 8,
        fillColor: '#3388ff',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
        ...options
    };

    const circleMarker = L.circleMarker(latlng, defaultOptions);

    // Add to drawn items layer group
    if (state.drawnItems) {
        state.drawnItems.addLayer(circleMarker);
    }

    return circleMarker;
}

/**
 * Update geometry coordinates
 * @param {L.Layer} layer - Layer to update
 * @param {Array|L.LatLng} coords - New coordinates
 */
export function updateGeometry(layer, coords) {
    if (!layer) {
        console.error('updateGeometry: Layer not found');
        return;
    }

    try {
        if (layer instanceof L.Marker) {
            layer.setLatLng(coords);
        } else if (layer instanceof L.Circle) {
            layer.setLatLng(coords);
        } else if (layer instanceof L.CircleMarker) {
            layer.setLatLng(coords);
        } else if (layer instanceof L.Polyline || layer instanceof L.Polygon) {
            layer.setLatLngs(coords);
        } else if (layer instanceof L.Rectangle) {
            layer.setBounds(coords);
        }
    } catch (error) {
        console.error('Error updating geometry:', error);
        showNotification('Error updating geometry', 'error');
    }
}

/**
 * Get geometry coordinates
 * @param {L.Layer} layer - Layer to get coordinates from
 * @returns {Array|L.LatLng|L.LatLngBounds} - Coordinates
 */
export function getGeometryCoordinates(layer) {
    if (!layer) {
        console.error('getGeometryCoordinates: Layer not found');
        return null;
    }

    try {
        if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.CircleMarker) {
            return layer.getLatLng();
        } else if (layer instanceof L.Polyline || layer instanceof L.Polygon) {
            return layer.getLatLngs();
        } else if (layer instanceof L.Rectangle) {
            return layer.getBounds();
        }
    } catch (error) {
        console.error('Error getting geometry coordinates:', error);
        return null;
    }
}

/**
 * Get geometry type
 * @param {L.Layer} layer - Layer to check
 * @returns {string} - Geometry type (point, line, polygon, circle, rectangle)
 */
export function getGeometryType(layer) {
    if (!layer) return 'unknown';

    if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        return 'point';
    } else if (layer instanceof L.Circle) {
        return 'circle';
    } else if (layer instanceof L.Rectangle) {
        return 'rectangle';
    } else if (layer instanceof L.Polygon) {
        return 'polygon';
    } else if (layer instanceof L.Polyline) {
        return 'line';
    }

    return 'unknown';
}

/**
 * Calculate geometry area (for polygons and circles)
 * @param {L.Layer} layer - Layer to calculate area for
 * @returns {number} - Area in square meters
 */
export function calculateArea(layer) {
    if (!layer) return 0;

    try {
        if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
            const latlngs = layer.getLatLngs()[0] || layer.getLatLngs();
            if (L.GeometryUtil && L.GeometryUtil.geodesicArea) {
                return L.GeometryUtil.geodesicArea(latlngs);
            }
            // Fallback: simple calculation
            return calculatePolygonArea(latlngs);
        } else if (layer instanceof L.Circle) {
            const radius = layer.getRadius();
            return Math.PI * radius * radius;
        }
    } catch (error) {
        console.error('Error calculating area:', error);
    }

    return 0;
}

/**
 * Calculate geometry length (for lines)
 * @param {L.Layer} layer - Layer to calculate length for
 * @returns {number} - Length in meters
 */
export function calculateLength(layer) {
    if (!layer) return 0;

    try {
        if (layer instanceof L.Polyline) {
            const latlngs = layer.getLatLngs();
            let length = 0;

            for (let i = 0; i < latlngs.length - 1; i++) {
                length += latlngs[i].distanceTo(latlngs[i + 1]);
            }

            return length;
        } else if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
            // Calculate perimeter for polygons
            const latlngs = layer.getLatLngs()[0] || layer.getLatLngs();
            let perimeter = 0;

            for (let i = 0; i < latlngs.length; i++) {
                const next = (i + 1) % latlngs.length;
                perimeter += latlngs[i].distanceTo(latlngs[next]);
            }

            return perimeter;
        }
    } catch (error) {
        console.error('Error calculating length:', error);
    }

    return 0;
}

/**
 * Calculate polygon area using Shoelace formula
 * @param {Array<L.LatLng>} latlngs - Array of coordinates
 * @returns {number} - Area in square meters (approximate)
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

    // Convert to square meters (very rough approximation)
    // 1 degree ≈ 111,320 meters at equator
    const metersPerDegree = 111320;
    return area * metersPerDegree * metersPerDegree;
}

/**
 * Get geometry bounds
 * @param {L.Layer} layer - Layer to get bounds for
 * @returns {L.LatLngBounds} - Bounds
 */
export function getGeometryBounds(layer) {
    if (!layer) return null;

    try {
        if (layer.getBounds) {
            return layer.getBounds();
        } else if (layer.getLatLng) {
            // For markers/circles, create bounds around point
            const latlng = layer.getLatLng();
            return L.latLngBounds(latlng, latlng);
        }
    } catch (error) {
        console.error('Error getting geometry bounds:', error);
    }

    return null;
}

/**
 * Center map on geometry
 * @param {L.Map} map - Map instance
 * @param {L.Layer} layer - Layer to center on
 * @param {number} zoom - Optional zoom level
 */
export function centerOnGeometry(map, layer, zoom = null) {
    if (!map || !layer) return;

    try {
        const bounds = getGeometryBounds(layer);
        if (bounds) {
            if (zoom) {
                map.setView(bounds.getCenter(), zoom);
            } else {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    } catch (error) {
        console.error('Error centering on geometry:', error);
    }
}

/**
 * Convert layer to GeoJSON
 * @param {L.Layer} layer - Layer to convert
 * @returns {Object} - GeoJSON object
 */
export function layerToGeoJSON(layer) {
    if (!layer) return null;

    try {
        if (layer.toGeoJSON) {
            return layer.toGeoJSON();
        }
    } catch (error) {
        console.error('Error converting layer to GeoJSON:', error);
    }

    return null;
}

/**
 * Create layer from GeoJSON
 * @param {Object} geojson - GeoJSON object
 * @param {Object} options - Layer options
 * @returns {L.Layer} - Created layer
 */
export function createFromGeoJSON(geojson, options = {}) {
    if (!geojson) return null;

    try {
        const layer = L.geoJSON(geojson, {
            pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, options.point || {});
            },
            style: (feature) => {
                return options.style || {};
            },
            ...options
        });

        // Add to drawn items layer group
        if (state.drawnItems && layer) {
            state.drawnItems.addLayer(layer);
        }

        return layer;
    } catch (error) {
        console.error('Error creating layer from GeoJSON:', error);
        return null;
    }
}

/**
 * Simplify geometry (reduce number of points)
 * @param {L.Layer} layer - Layer to simplify
 * @param {number} tolerance - Simplification tolerance
 * @returns {L.Layer} - Simplified layer
 */
export function simplifyGeometry(layer, tolerance = 0.0001) {
    if (!layer) return null;

    try {
        if (layer instanceof L.Polyline || layer instanceof L.Polygon) {
            const latlngs = layer.getLatLngs();
            const simplified = simplifyPath(latlngs, tolerance);

            if (layer instanceof L.Polygon) {
                return createPolygon(simplified, layer.options);
            } else {
                return createLine(simplified, layer.options);
            }
        }
    } catch (error) {
        console.error('Error simplifying geometry:', error);
    }

    return layer;
}

/**
 * Simplify path using Douglas-Peucker algorithm
 * @param {Array<L.LatLng>} points - Array of points
 * @param {number} tolerance - Tolerance value
 * @returns {Array<L.LatLng>} - Simplified points
 */
function simplifyPath(points, tolerance) {
    if (points.length <= 2) return points;

    const sqTolerance = tolerance * tolerance;
    points = simplifyRadialDistance(points, sqTolerance);
    points = simplifyDouglasPeucker(points, sqTolerance);

    return points;
}

/**
 * Simplify using radial distance
 */
function simplifyRadialDistance(points, sqTolerance) {
    let prevPoint = points[0];
    const newPoints = [prevPoint];

    for (let i = 1; i < points.length; i++) {
        const point = points[i];

        if (getSqDist(point, prevPoint) > sqTolerance) {
            newPoints.push(point);
            prevPoint = point;
        }
    }

    if (prevPoint !== points[points.length - 1]) {
        newPoints.push(points[points.length - 1]);
    }

    return newPoints;
}

/**
 * Simplify using Douglas-Peucker algorithm
 */
function simplifyDouglasPeucker(points, sqTolerance) {
    const last = points.length - 1;
    const simplified = [points[0]];

    simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
}

/**
 * Douglas-Peucker step
 */
function simplifyDPStep(points, first, last, sqTolerance, simplified) {
    let maxSqDist = sqTolerance;
    let index = -1;

    for (let i = first + 1; i < last; i++) {
        const sqDist = getSqSegDist(points[i], points[first], points[last]);

        if (sqDist > maxSqDist) {
            index = i;
            maxSqDist = sqDist;
        }
    }

    if (maxSqDist > sqTolerance) {
        if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
        simplified.push(points[index]);
        if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
}

/**
 * Get squared distance between two points
 */
function getSqDist(p1, p2) {
    const dx = p1.lat - p2.lat;
    const dy = p1.lng - p2.lng;
    return dx * dx + dy * dy;
}

/**
 * Get squared distance from point to segment
 */
function getSqSegDist(p, p1, p2) {
    let x = p1.lat;
    let y = p1.lng;
    let dx = p2.lat - x;
    let dy = p2.lng - y;

    if (dx !== 0 || dy !== 0) {
        const t = ((p.lat - x) * dx + (p.lng - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = p2.lat;
            y = p2.lng;
        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = p.lat - x;
    dy = p.lng - y;

    return dx * dx + dy * dy;
}

/**
 * Validate geometry
 * @param {L.Layer} layer - Layer to validate
 * @returns {Object} - Validation result {valid: boolean, errors: Array}
 */
export function validateGeometry(layer) {
    const result = {
        valid: true,
        errors: []
    };

    if (!layer) {
        result.valid = false;
        result.errors.push('Layer is null or undefined');
        return result;
    }

    try {
        if (layer instanceof L.Polygon) {
            const latlngs = layer.getLatLngs()[0] || layer.getLatLngs();

            if (latlngs.length < 3) {
                result.valid = false;
                result.errors.push('Polygon must have at least 3 points');
            }

            // Check for self-intersection (basic check)
            if (hasSelfIntersection(latlngs)) {
                result.valid = false;
                result.errors.push('Polygon has self-intersection');
            }
        } else if (layer instanceof L.Polyline) {
            const latlngs = layer.getLatLngs();

            if (latlngs.length < 2) {
                result.valid = false;
                result.errors.push('Line must have at least 2 points');
            }
        }
    } catch (error) {
        result.valid = false;
        result.errors.push(`Validation error: ${error.message}`);
    }

    return result;
}

/**
 * Check if polygon has self-intersection (basic check)
 * @param {Array<L.LatLng>} latlngs - Polygon coordinates
 * @returns {boolean} - True if self-intersection detected
 */
function hasSelfIntersection(latlngs) {
    // Basic check - can be improved with more sophisticated algorithm
    if (latlngs.length < 4) return false;

    for (let i = 0; i < latlngs.length - 1; i++) {
        for (let j = i + 2; j < latlngs.length - 1; j++) {
            if (i === 0 && j === latlngs.length - 2) continue; // Skip adjacent segments

            if (segmentsIntersect(
                latlngs[i], latlngs[i + 1],
                latlngs[j], latlngs[j + 1]
            )) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Check if two line segments intersect
 */
function segmentsIntersect(p1, p2, p3, p4) {
    const ccw = (A, B, C) => {
        return (C.lng - A.lng) * (B.lat - A.lat) > (B.lng - A.lng) * (C.lat - A.lat);
    };

    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}
