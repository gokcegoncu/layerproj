/**
 * Label Manager
 * Manages labels/tooltips for map features
 */

/**
 * Apply labels to features in a layer
 * @param {string} layerId - Layer ID
 */
export function applyLabels(layerId) {
    if (!layerId) {
        console.warn('No layer ID provided for labels');
        return;
    }

    // Get label settings
    const showLabels = document.getElementById('showLabels')?.checked || false;
    const labelField = document.getElementById('labelField')?.value || 'name';
    const fontSize = document.getElementById('fontSize')?.value || 12;
    const fontColor = document.getElementById('fontColor')?.value || '#000000';
    const haloColor = document.getElementById('haloColor')?.value || '#ffffff';
    const haloWidth = document.getElementById('haloWidth')?.value || 1;

    // Get layer features
    const layerFeatures = window.layerFeatures[layerId] || [];

    layerFeatures.forEach(feature => {
        const featureInfo = window.drawnLayers.find(f => f.id === feature.id);
        if (!featureInfo || !featureInfo.layer) {
            return;
        }

        const layer = featureInfo.layer;

        // Check if layer is on map
        if (!window.map.hasLayer(layer)) {
            layer.addTo(window.map);
        }

        if (showLabels) {
            // Determine label position based on geometry type
            let labelLatLng = null;

            if (layer.getLatLng) {
                // Point/Circle/CircleMarker
                labelLatLng = layer.getLatLng();
            } else if (layer.getBounds) {
                // Polygon/Rectangle
                labelLatLng = layer.getBounds().getCenter();
            } else if (layer.getCenter) {
                // Circle with radius
                labelLatLng = layer.getCenter();
            } else if (layer.getLatLngs) {
                // Polyline - use middle point
                const latlngs = layer.getLatLngs();
                if (latlngs && latlngs.length > 0) {
                    const flatLatLngs = Array.isArray(latlngs[0]) ? latlngs[0] : latlngs;
                    const midIndex = Math.floor(flatLatLngs.length / 2);
                    labelLatLng = flatLatLngs[midIndex];
                }
            }

            if (!labelLatLng) {
                return;
            }

            // Get label text from properties
            let labelText = '';

            if (featureInfo.properties && featureInfo.properties[labelField] !== undefined) {
                // Found the property value
                labelText = String(featureInfo.properties[labelField]);
            } else if (labelField === 'id') {
                // Use feature ID
                labelText = featureInfo.id;
            } else if (labelField === 'type') {
                // Use geometry type
                labelText = feature.type || 'Unknown';
            } else if (labelField === 'area' && layer.getLatLngs) {
                // Calculate area for polygons (very rough estimate)
                try {
                    const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
                    labelText = `${Math.round(area)} m²`;
                } catch {
                    labelText = 'Area';
                }
            } else if (labelField === 'length' && layer.getLatLngs) {
                // Calculate length for lines
                labelText = 'Length';
            } else {
                // No value found - use placeholder
                labelText = `[${labelField}]`;
            }

            // Create tooltip style
            const tooltipStyle = `
                background: ${haloColor};
                border: ${haloWidth}px solid ${haloColor};
                color: ${fontColor};
                font-size: ${fontSize}px;
                font-weight: 500;
                padding: 4px 8px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                white-space: nowrap;
            `;

            // Remove any existing tooltip first
            if (layer.getTooltip()) {
                layer.unbindTooltip();
            }

            // Create and bind tooltip with proper positioning
            const tooltip = L.tooltip({
                permanent: true,
                direction: 'center',
                className: 'feature-label',
                opacity: 1,
                offset: [0, 0]
            })
            .setContent(labelText)
            .setLatLng(labelLatLng);

            // Bind to layer
            layer.bindTooltip(tooltip);

            // Add to map
            tooltip.addTo(window.map);

            // Apply custom styles
            setTimeout(() => {
                const tooltipElement = tooltip.getElement();
                if (tooltipElement) {
                    tooltipElement.style.cssText = tooltipStyle;
                }
            }, 50);
        } else {
            // Remove tooltip
            if (layer.unbindTooltip) {
                layer.unbindTooltip();
            }
        }
    });

    console.log(`Labels ${showLabels ? 'applied' : 'removed'} for ${layerFeatures.length} features`);
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
        if (featureInfo && featureInfo.layer && featureInfo.layer.unbindTooltip) {
            featureInfo.layer.unbindTooltip();
        }
    });
}
