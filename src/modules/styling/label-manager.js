/**
 * Label Manager
 * Manages labels/tooltips for map features
 */

/**
 * Apply labels to features in a layer
 * @param {string} layerId - Layer ID
 */
export function applyLabels(layerId) {
    console.log('🏷️ applyLabels called with layerId:', layerId, 'type:', typeof layerId);

    if (!layerId || layerId === 'null' || layerId === 'undefined') {
        console.warn('❌ Invalid layer ID provided for labels:', layerId);
        return;
    }

    // Get label settings
    const showLabels = document.getElementById('showLabels')?.checked || false;
    const labelField = document.getElementById('labelField')?.value || 'name';
    const fontSize = document.getElementById('fontSize')?.value || 12;
    const fontColor = document.getElementById('fontColor')?.value || '#000000';
    const haloColor = document.getElementById('haloColor')?.value || '#ffffff';
    const haloWidth = document.getElementById('haloWidth')?.value || 1;

    console.log('🏷️ Label settings:', { showLabels, labelField, fontSize });

    // Get layer features
    const layerFeatures = window.layerFeatures[layerId] || [];

    console.log('🏷️ Found features for layer:', layerFeatures.length);
    console.log('🏷️ Available layers in layerFeatures:', Object.keys(window.layerFeatures));

    layerFeatures.forEach((feature, index) => {
        const featureInfo = window.drawnLayers.find(f => f.id === feature.id);
        if (!featureInfo || !featureInfo.layer) {
            console.warn(`⚠️ Feature ${feature.id} - no featureInfo or layer found`);
            return;
        }

        const layer = featureInfo.layer;

        // Validate layer object has coordinate methods
        const hasValidMethods = !!(
            layer.getLatLng ||
            layer.getBounds ||
            layer.getLatLngs ||
            layer.getCenter
        );

        if (!hasValidMethods) {
            console.error(`❌ Layer missing coordinate methods for ${feature.id}`);
            console.error('  Layer object:', layer);
            console.error('  Layer constructor:', layer.constructor.name);
            return;
        }

        console.log(`\n📍 Feature ${index + 1}/${layerFeatures.length}:`, {
            id: feature.id,
            type: feature.type,
            layerType: layer.constructor.name,
            hasGetLatLng: !!layer.getLatLng,
            hasGetBounds: !!layer.getBounds,
            hasGetCenter: !!layer.getCenter,
            hasGetLatLngs: !!layer.getLatLngs,
            properties: featureInfo.properties,
            onMap: window.map.hasLayer(layer)
        });

        // Check if layer is in drawnItems (source of truth)
        const isInDrawnItems = window.drawnItems && window.drawnItems.hasLayer(layer);

        if (!isInDrawnItems) {
            console.warn(`  ⚠️ Layer not in drawnItems! Adding it now...`);
            window.drawnItems.addLayer(layer);
        }

        // Ensure layer is on map
        if (!window.map.hasLayer(layer)) {
            console.log('  ➕ Adding layer to map');
            window.drawnItems.addLayer(layer);
        }

        if (showLabels) {
            // Determine label position based on geometry type
            let labelLatLng = null;
            let positionMethod = 'unknown';

            if (layer.getLatLng) {
                // Point/Circle/CircleMarker
                labelLatLng = layer.getLatLng();
                positionMethod = 'getLatLng()';
            } else if (layer.getBounds) {
                // Polygon/Rectangle
                labelLatLng = layer.getBounds().getCenter();
                positionMethod = 'getBounds().getCenter()';
            } else if (layer.getCenter) {
                // Circle with radius
                labelLatLng = layer.getCenter();
                positionMethod = 'getCenter()';
            } else if (layer.getLatLngs) {
                // Polyline - use middle point
                const latlngs = layer.getLatLngs();
                if (latlngs && latlngs.length > 0) {
                    const flatLatLngs = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
                    const midIndex = Math.floor(flatLatLngs.length / 2);
                    labelLatLng = flatLatLngs[midIndex];
                    positionMethod = `getLatLngs()[${midIndex}]`;
                }
            }

            if (!labelLatLng) {
                console.error(`  ❌ Could not determine position for feature ${feature.id}`);
                return;
            }

            console.log(`  📌 Position method: ${positionMethod}`);
            console.log(`  📌 Calculated position:`, labelLatLng);

            // Get label text from properties (check both locations)
            let labelText = '';
            let labelSource = 'unknown';

            // Try layer._featureProperties first (new architecture)
            const properties = layer._featureProperties || featureInfo.properties || {};

            console.log(`  🔍 Looking for labelField "${labelField}" in properties:`, properties);

            if (properties && properties[labelField] !== undefined) {
                // Found the property value
                labelText = String(properties[labelField]);
                labelSource = `properties.${labelField}`;
            } else if (labelField === 'id') {
                // Use feature ID (try layer first, then featureInfo)
                labelText = layer._featureId || featureInfo.id;
                labelSource = 'feature.id';
            } else if (labelField === 'type') {
                // Use geometry type
                labelText = layer._featureType || feature.type || 'Unknown';
                labelSource = 'feature.type';
            } else if (labelField === 'area' && layer.getLatLngs) {
                // Calculate area for polygons (very rough estimate)
                try {
                    const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
                    labelText = `${Math.round(area)} m²`;
                    labelSource = 'calculated area';
                } catch {
                    labelText = 'Area';
                    labelSource = 'area fallback';
                }
            } else if (labelField === 'length' && layer.getLatLngs) {
                // Calculate length for lines
                labelText = 'Length';
                labelSource = 'length';
            } else {
                // No value found - use placeholder
                labelText = `[${labelField}]`;
                labelSource = 'placeholder';
            }

            console.log(`  📝 Label text: "${labelText}" (source: ${labelSource})`);

            // Remove any existing label marker
            if (layer._labelMarker) {
                console.log('  🗑️ Removing existing label marker');
                window.map.removeLayer(layer._labelMarker);
                layer._labelMarker = null;
            }

            // Create invisible marker at label position
            const invisibleIcon = L.divIcon({
                html: '',
                className: 'invisible-label-marker',
                iconSize: [0, 0]
            });

            console.log('  🎯 Creating marker at:', {
                lat: labelLatLng.lat,
                lng: labelLatLng.lng
            });

            const labelMarker = L.marker(labelLatLng, {
                icon: invisibleIcon,
                interactive: false
            });

            // Bind tooltip to marker with custom styling
            labelMarker.bindTooltip(labelText, {
                permanent: true,
                direction: 'center',
                className: 'feature-label',
                opacity: 1,
                offset: [0, 0]
            });

            // Add to map
            labelMarker.addTo(window.map);
            console.log('  ✅ Label marker added to map');

            // Store reference on original layer for cleanup
            layer._labelMarker = labelMarker;

            // Apply custom styles to tooltip
            setTimeout(() => {
                const tooltip = labelMarker.getTooltip();
                if (tooltip) {
                    const tooltipElement = tooltip.getElement();
                    if (tooltipElement) {
                        tooltipElement.style.cssText = `
                            background: ${haloColor} !important;
                            border: ${haloWidth}px solid ${haloColor} !important;
                            color: ${fontColor} !important;
                            font-size: ${fontSize}px !important;
                            font-weight: 500 !important;
                            padding: 4px 8px !important;
                            border-radius: 4px !important;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
                            white-space: nowrap !important;
                        `;
                        console.log('  🎨 Styles applied to tooltip');
                    } else {
                        console.warn('  ⚠️ Tooltip element not found for styling');
                    }
                } else {
                    console.warn('  ⚠️ Tooltip not found on marker');
                }
            }, 50);
        } else {
            // Remove label marker
            if (layer._labelMarker) {
                console.log('  🗑️ Removing label (showLabels=false)');
                window.map.removeLayer(layer._labelMarker);
                layer._labelMarker = null;
            }
        }
    });

    console.log(`\n✅ Label operation complete: ${showLabels ? 'APPLIED' : 'REMOVED'} for ${layerFeatures.length} features`);

    // Force map refresh to show changes immediately
    if (window.map) {
        setTimeout(() => {
            window.map.invalidateSize();
            console.log('🔄 Map refreshed');
        }, 100);
    }
}

/**
 * Toggle labels for a layer
 * @param {string} layerId - Layer ID
 * @param {boolean} show - Show or hide labels
 */
export function toggleLabels(layerId, show) {
    document.getElementById('showLabels').checked = show;
    applyLabels(layerId);
}

/**
 * Remove all labels from a layer
 * @param {string} layerId - Layer ID
 */
export function removeLabels(layerId) {
    const layerFeatures = window.layerFeatures[layerId] || [];

    layerFeatures.forEach(feature => {
        const featureInfo = window.drawnLayers.find(f => f.id === feature.id);
        if (featureInfo && featureInfo.layer) {
            const layer = featureInfo.layer;

            // Remove label marker if exists
            if (layer._labelMarker) {
                window.map.removeLayer(layer._labelMarker);
                layer._labelMarker = null;
            }
        }
    });
}
