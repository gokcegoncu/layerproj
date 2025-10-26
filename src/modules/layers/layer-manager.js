/**
 * Layer Management Module
 * Handles layer CRUD operations, selection, and feature management
 */

import * as DB from '../storage/database.js';

// Global state references (will be passed via dependency injection in production)
let activeLayerId = null;
let activeGroupId = null;
let layerFeatures = {};
let drawnLayers = [];
let drawnItems = null;

/**
 * Initialize layer manager with dependencies
 * @param {Object} deps - Dependencies
 */
export function initLayerManager(deps) {
    if (deps.drawnItems) drawnItems = deps.drawnItems;
    if (deps.layerFeatures) layerFeatures = deps.layerFeatures;
    if (deps.drawnLayers) drawnLayers = deps.drawnLayers;
}

/**
 * Create a new layer
 * @param {string} layerName - Name of the layer
 * @param {string} targetGroupId - ID of the target group
 * @returns {string|null} Layer ID or null if failed
 */
export function createLayer(layerName, targetGroupId) {
    try {
        // Find target group
        let targetGroup = null;

        if (targetGroupId) {
            targetGroup = document.querySelector(`[data-group-id="${targetGroupId}"]`);
        }

        if (!targetGroup) {
            console.error('Target group not found!');
            return null;
        }

        // Create layer element
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.draggable = true;

        // Generate layer ID
        const layerId = 'layer-' + Date.now();
        layerItem.setAttribute('data-layer-id', layerId);

        // Create layer content
        layerItem.innerHTML = `
            <input type="checkbox" class="layer-visibility" checked>
            <div class="layer-selectable-area">
                <div class="layer-icons">
                    <div class="layer-icon inactive" title="Nokta verisi">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="8"/>
                        </svg>
                    </div>
                    <div class="layer-icon inactive" title="Çizgi verisi">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M2 8 L8 8 L12 16 L16 16 L22 8" fill="none" stroke="currentColor" stroke-width="3"/>
                        </svg>
                    </div>
                    <div class="layer-icon inactive" title="Poligon verisi">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <polygon points="12,2 2,10 5,21 19,21 22,10" fill="currentColor" stroke="#000000" stroke-width="1"/>
                        </svg>
                    </div>
                </div>
                <span class="layer-name">${layerName}</span>
                <span class="layer-style-mode-indicator default-mode" data-layer-id="${layerId}" title="Varsayılan Kurumsal Ayarlar">
                    🏢
                </span>
            </div>
            <div class="layer-actions">
                <button class="layer-action-btn" title="Zoom" onclick="zoomToLayer(this)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5,14H20.5L19,15.5L21.5,18L20,19.5L17.5,17L16,18.5V13.5H15.5M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L20,19.29L18.71,20.58L13.15,15C12,15.83 10.61,16.36 9.5,16.36A6.5,6.5 0 0,1 3,9.86A6.5,6.5 0 0,1 9.5,3.36V3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                    </svg>
                </button>
                <button class="layer-action-btn" title="Stil Ayarları">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                    </svg>
                </button>
                <button class="layer-action-btn" title="Detaylar">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13,7H11V5H13M13,17H11V9H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                </button>
                <button class="layer-action-btn" title="Sil">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                    </svg>
                </button>
            </div>
        `;

        // Add layer to group
        const groupItems = targetGroup.querySelector('.group-items');
        groupItems.appendChild(layerItem);

        // Initialize layer features array
        layerFeatures[layerId] = [];

        // Save layer to database
        const layerPosition = groupItems.children.length;
        DB.createLayer(layerId, layerName, targetGroupId, layerPosition);

        // Select the new layer
        selectLayer(layerItem);

        console.log(`Layer created: ${layerId}`);
        return layerId;
    } catch (error) {
        console.error('Error creating layer:', error);
        return null;
    }
}

/**
 * Delete a layer
 * @param {HTMLElement|string} layerIdOrButton - Layer ID or button element
 * @returns {boolean} Success status
 */
export function deleteLayer(layerIdOrButton) {
    try {
        let layerId;

        if (typeof layerIdOrButton === 'string') {
            layerId = layerIdOrButton;
        } else {
            const layerItem = layerIdOrButton.closest('.layer-item');
            layerId = layerItem?.getAttribute('data-layer-id');
        }

        if (!layerId) {
            console.error('Layer ID not found');
            return false;
        }

        // Remove features from map
        if (layerFeatures[layerId]) {
            layerFeatures[layerId].forEach(feature => {
                const featureInfo = drawnLayers.find(l => l.id === feature.id);
                if (featureInfo && drawnItems) {
                    drawnItems.removeLayer(featureInfo.layer);
                }
            });

            // Remove from drawnLayers
            drawnLayers = drawnLayers.filter(l => l.layerId !== layerId);

            // Delete features array
            delete layerFeatures[layerId];
        }

        // Remove layer element from DOM
        const layerElement = document.querySelector(`[data-layer-id="${layerId}"]`);
        if (layerElement) {
            layerElement.remove();
        }

        // Delete from database
        DB.deleteLayer(layerId);

        // Clear active layer if this was it
        if (activeLayerId === layerId) {
            activeLayerId = null;
        }

        console.log(`Layer deleted: ${layerId}`);
        return true;
    } catch (error) {
        console.error('Error deleting layer:', error);
        return false;
    }
}

/**
 * Select a layer
 * @param {HTMLElement|string} layerItemOrId - Layer element or ID
 */
export function selectLayer(layerItemOrId) {
    try {
        let layerItem;

        if (typeof layerItemOrId === 'string') {
            layerItem = document.querySelector(`[data-layer-id="${layerItemOrId}"]`);
        } else {
            layerItem = layerItemOrId;
        }

        if (!layerItem) {
            console.error('Layer not found');
            return;
        }

        // Remove all selections
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.remove('selected-highlight', 'selected');
        });

        // Select this layer
        layerItem.classList.add('selected-highlight', 'selected');

        // Update active layer ID
        activeLayerId = layerItem.getAttribute('data-layer-id');
        window.activeLayerId = activeLayerId;

        // Select parent group
        const parentGroup = layerItem.closest('.layer-group');
        if (parentGroup) {
            document.querySelectorAll('.group-header').forEach(h => {
                h.classList.remove('selected');
            });

            const groupHeader = parentGroup.querySelector('.group-header');
            groupHeader.classList.add('selected');
            activeGroupId = parentGroup.getAttribute('data-group-id');
        }

        console.log(`Layer selected: ${activeLayerId}`);
    } catch (error) {
        console.error('Error selecting layer:', error);
    }
}

/**
 * Get active layer
 * @returns {HTMLElement|null} Active layer element
 */
export function getActiveLayer() {
    if (!activeLayerId) return null;

    const layerElement = document.querySelector(`[data-layer-id="${activeLayerId}"]`);
    if (!layerElement) return null;

    const isSelected = layerElement.classList.contains('selected-highlight');
    return isSelected ? layerElement : null;
}

/**
 * Clear layer selection
 */
export function clearLayerSelection() {
    document.querySelectorAll('.layer-item').forEach(item => {
        item.classList.remove('selected-highlight', 'selected');
    });

    activeLayerId = null;
    window.activeLayerId = null;
}

/**
 * Add a feature to the active layer
 * @param {string} type - Feature type (marker, polyline, polygon, etc.)
 * @param {Object} layer - Leaflet layer object
 * @param {string} typeName - Display name of the type
 * @returns {Object|null} Feature info object
 */
export function addFeatureToActiveLayer(type, layer, typeName) {
    try {
        if (!activeLayerId) {
            console.error('No active layer');
            return null;
        }

        if (!layerFeatures[activeLayerId]) {
            layerFeatures[activeLayerId] = [];
        }

        // Determine icon type
        let iconType;
        if (type === 'marker') {
            iconType = 'point';
        } else if (type === 'polyline') {
            iconType = 'line';
        } else if (type === 'polygon' || type === 'rectangle' || type === 'circle') {
            iconType = 'polygon';
        }

        // Generate unique feature ID
        const featureId = 'feature-' + Date.now();

        // Add to layer features
        layerFeatures[activeLayerId].push({
            id: featureId,
            type: iconType,
            layer: layer
        });

        // Create feature info
        const featureInfo = {
            id: featureId,
            layer: layer,
            type: iconType,
            layerId: activeLayerId,
            groupId: activeGroupId,
            properties: {}
        };

        drawnLayers.push(featureInfo);

        // Update layer icons
        updateLayerIcons(activeLayerId);

        // Save feature to database
        try {
            const geometry = layer.toGeoJSON ? layer.toGeoJSON().geometry : null;
            if (geometry) {
                DB.createFeature(featureId, activeLayerId, iconType, geometry, {});
            }
        } catch (dbError) {
            console.error('Error saving feature to database:', dbError);
        }

        console.log(`Feature added: ${featureId} to layer ${activeLayerId}`);
        return featureInfo;
    } catch (error) {
        console.error('Error adding feature to layer:', error);
        return null;
    }
}

/**
 * Update layer icons based on feature types
 * @param {string} layerId - Layer ID
 */
export function updateLayerIcons(layerId) {
    const layerItem = document.querySelector(`[data-layer-id="${layerId}"]`);
    if (!layerItem) return;

    const features = layerFeatures[layerId] || [];

    const hasPoint = features.some(f => f.type === 'point');
    const hasLine = features.some(f => f.type === 'line');
    const hasPolygon = features.some(f => f.type === 'polygon');

    const pointIcon = layerItem.querySelector('.layer-icon:nth-child(1)');
    const lineIcon = layerItem.querySelector('.layer-icon:nth-child(2)');
    const polygonIcon = layerItem.querySelector('.layer-icon:nth-child(3)');

    if (pointIcon) {
        pointIcon.classList.toggle('inactive', !hasPoint);
        pointIcon.classList.toggle('active', hasPoint);
        pointIcon.classList.toggle('icon-point', hasPoint);
    }

    if (lineIcon) {
        lineIcon.classList.toggle('inactive', !hasLine);
        lineIcon.classList.toggle('active', hasLine);
        lineIcon.classList.toggle('icon-line', hasLine);
    }

    if (polygonIcon) {
        polygonIcon.classList.toggle('inactive', !hasPolygon);
        polygonIcon.classList.toggle('active', hasPolygon);
        polygonIcon.classList.toggle('icon-polygon', hasPolygon);
    }
}

/**
 * Get layer features
 * @param {string} layerId - Layer ID
 * @returns {Array} Array of features
 */
export function getLayerFeatures(layerId) {
    return layerFeatures[layerId] || [];
}

/**
 * Count layer features by type
 * @param {string} layerId - Layer ID
 * @param {string} type - Feature type
 * @returns {number} Count of features
 */
export function countLayerFeatures(layerId, type) {
    const features = layerFeatures[layerId] || [];
    if (!type) return features.length;
    return features.filter(f => f.type === type).length;
}

/**
 * Toggle layer feature visibility
 * @param {string} layerId - Layer ID
 * @param {boolean} isVisible - Visibility state
 */
export function toggleLayerFeatures(layerId, isVisible) {
    if (!layerFeatures[layerId]) return;

    layerFeatures[layerId].forEach(feature => {
        const layerInfo = drawnLayers.find(l => l.id === feature.id);
        if (layerInfo && drawnItems) {
            if (isVisible) {
                if (!drawnItems.hasLayer(layerInfo.layer)) {
                    drawnItems.addLayer(layerInfo.layer);
                }
            } else {
                if (drawnItems.hasLayer(layerInfo.layer)) {
                    drawnItems.removeLayer(layerInfo.layer);
                }
            }
        }
    });
}

/**
 * Get layer properties
 * @param {string} layerId - Layer ID
 * @returns {Object} Layer properties
 */
export function getLayerProperties(layerId) {
    const layerElement = document.querySelector(`[data-layer-id="${layerId}"]`);
    if (!layerElement) return null;

    const layerName = layerElement.querySelector('.layer-name')?.textContent || '';
    const featureCount = (layerFeatures[layerId] || []).length;
    const isVisible = layerElement.querySelector('.layer-visibility')?.checked || false;

    return {
        id: layerId,
        name: layerName,
        featureCount,
        isVisible,
        features: layerFeatures[layerId] || []
    };
}

/**
 * Clear all selections (layers and groups)
 */
export function clearAllSelections() {
    // Clear layer selections
    document.querySelectorAll('.layer-item').forEach(item => {
        item.classList.remove('selected-highlight', 'selected');
    });

    // Clear group selections
    document.querySelectorAll('.group-header').forEach(header => {
        header.classList.remove('selected');
    });

    // Clear active IDs
    activeLayerId = null;
    activeGroupId = null;
    window.activeLayerId = null;
    window.activeGroupId = null;
}

/**
 * Toggle layer filter panel
 */
export function toggleLayerFilter() {
    const filterPanel = document.getElementById('layerFilterPanel');
    if (filterPanel) {
        filterPanel.classList.toggle('active');
    }
}
