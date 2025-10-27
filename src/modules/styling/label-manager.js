/**
 * Label Manager Module
 * Handles label rendering and management for map features
 */

/**
 * Apply labels to all features in the active layer
 * Reads label settings from UI and creates Leaflet markers with DivIcons
 */
export function applyLabelsToAllFeatures() {
  try {
    // Get label settings from UI
    const showLabels = document.getElementById('showLabels')?.checked;
    if (!showLabels) {
      console.log('🏷️ Labels disabled, removing all labels');
      removeAllLabels();
      return;
    }

    const labelField = document.getElementById('labelField')?.value;
    if (!labelField) {
      console.log('🏷️ No label field selected');
      removeAllLabels();
      return;
    }

    const fontSize = document.getElementById('fontSize')?.value || '12';
    const fontColor = document.getElementById('fontColor')?.value || '#000000';
    const haloColor = document.getElementById('haloColor')?.value || '#ffffff';
    const haloWidth = document.getElementById('haloWidth')?.value || '1';
    const labelPosition = document.getElementById('labelPosition')?.value || 'center';

    // Get active layer
    const activeLayerId = window.activeLayerId;
    if (!activeLayerId) {
      console.warn('🏷️ No active layer selected');
      return;
    }

    const features = window.layerFeatures[activeLayerId] || [];
    console.log(`🏷️ Applying labels to ${features.length} features in layer ${activeLayerId}`);

    // Clear existing labels
    removeAllLabels();

    // Create labels for each feature
    let labelCount = 0;
    features.forEach((feature) => {
      const layerInfo = window.drawnLayers.find((l) => l.id === feature.id);
      if (!layerInfo || !layerInfo.layer) {
        return;
      }

      const layer = layerInfo.layer;
      const labelValue = getPropertyValue(layerInfo, labelField, feature);

      if (!labelValue) {
        return;
      }

      addLabelToFeature(layer, labelValue, {
        fontSize: `${fontSize}px`,
        fontColor,
        haloColor,
        haloWidth: `${haloWidth}px`,
        position: labelPosition,
      });
      labelCount++;
    });

    console.log(`✅ Applied ${labelCount} labels successfully`);
  } catch (error) {
    console.error('❌ Error applying labels:', error);
  }
}

/**
 * Get property value from feature based on field name
 */
function getPropertyValue(layerInfo, fieldName, feature) {
  // Check properties first
  if (layerInfo.properties && layerInfo.properties[fieldName]) {
    return layerInfo.properties[fieldName];
  }

  // Check for special calculated fields
  if (fieldName === 'area' && layerInfo.type === 'polygon') {
    return calculateArea(layerInfo.layer);
  }

  if (fieldName === 'length' && layerInfo.type === 'line') {
    return calculateLength(layerInfo.layer);
  }

  if (fieldName === 'id') {
    return feature.id || layerInfo.id;
  }

  if (fieldName === 'type') {
    return layerInfo.type || feature.type;
  }

  if (fieldName === 'name' && layerInfo.properties?.name) {
    return layerInfo.properties.name;
  }

  return null;
}

/**
 * Calculate area for polygon features
 */
function calculateArea(layer) {
  if (!layer.getBounds) {
    return null;
  }

  try {
    const bounds = layer.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // Rough area calculation (for display purposes)
    const width = ne.lng - sw.lng;
    const height = ne.lat - sw.lat;
    const area = Math.abs(width * height * 111320 * 111320); // Convert to m²

    if (area < 1000) {
      return `${Math.round(area)} m²`;
    }
    return `${(area / 1000000).toFixed(2)} km²`;
  } catch (error) {
    console.warn('Error calculating area:', error);
    return null;
  }
}

/**
 * Calculate length for line features
 */
function calculateLength(layer) {
  if (!layer.getLatLngs) {
    return null;
  }

  try {
    const latlngs = layer.getLatLngs();
    let totalDistance = 0;

    for (let i = 0; i < latlngs.length - 1; i++) {
      totalDistance += latlngs[i].distanceTo(latlngs[i + 1]);
    }

    if (totalDistance < 1000) {
      return `${Math.round(totalDistance)} m`;
    }
    return `${(totalDistance / 1000).toFixed(2)} km`;
  } catch (error) {
    console.warn('Error calculating length:', error);
    return null;
  }
}

/**
 * Add label to a specific feature
 */
function addLabelToFeature(layer, text, options) {
  try {
    // Create label HTML with halo effect
    const labelHtml = `
      <div class="feature-label" style="
        font-size: ${options.fontSize};
        color: ${options.fontColor};
        font-weight: bold;
        white-space: nowrap;
        text-shadow:
          ${options.haloWidth} ${options.haloWidth} ${options.haloWidth} ${options.haloColor},
          -${options.haloWidth} -${options.haloWidth} ${options.haloWidth} ${options.haloColor},
          ${options.haloWidth} -${options.haloWidth} ${options.haloWidth} ${options.haloColor},
          -${options.haloWidth} ${options.haloWidth} ${options.haloWidth} ${options.haloColor};
        pointer-events: none;
      ">
        ${text}
      </div>
    `;

    // Create Leaflet DivIcon
    const icon = L.divIcon({
      className: 'feature-label-container',
      html: labelHtml,
      iconSize: null,
      iconAnchor: getAnchorPoint(options.position),
    });

    // Get feature center point
    const latlng = getFeatureCenter(layer);

    if (latlng) {
      const labelMarker = L.marker(latlng, {
        icon: icon,
        interactive: false,
        zIndexOffset: 1000,
      });

      labelMarker._featureLabelMarker = true;
      labelMarker._featureId = layer._leaflet_id;

      if (window.map) {
        labelMarker.addTo(window.map);

        // Store in global array
        if (!window.labelMarkers) {
          window.labelMarkers = [];
        }
        window.labelMarkers.push(labelMarker);
      }
    }
  } catch (error) {
    console.error('Error adding label to feature:', error);
  }
}

/**
 * Get center point of a feature
 */
function getFeatureCenter(layer) {
  try {
    // For markers/points
    if (layer.getLatLng) {
      return layer.getLatLng();
    }

    // For polygons, rectangles, circles
    if (layer.getBounds) {
      return layer.getBounds().getCenter();
    }

    // For polylines
    if (layer.getLatLngs) {
      const latlngs = layer.getLatLngs();
      if (latlngs.length > 0) {
        const midIndex = Math.floor(latlngs.length / 2);
        return latlngs[midIndex];
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting feature center:', error);
    return null;
  }
}

/**
 * Get icon anchor point based on label position
 */
function getAnchorPoint(position) {
  const anchors = {
    center: [0, 0],
    top: [0, -15],
    bottom: [0, 15],
    left: [-15, 0],
    right: [15, 0],
  };
  return anchors[position] || anchors['center'];
}

/**
 * Remove all labels from the map
 */
export function removeAllLabels() {
  if (window.labelMarkers && Array.isArray(window.labelMarkers)) {
    console.log(`🗑️ Removing ${window.labelMarkers.length} labels`);
    window.labelMarkers.forEach((marker) => {
      if (window.map && marker) {
        try {
          window.map.removeLayer(marker);
        } catch (error) {
          console.warn('Error removing label marker:', error);
        }
      }
    });
    window.labelMarkers = [];
  }
}

/**
 * Update labels for a specific layer
 */
export function updateLabelsForLayer(layerId) {
  if (window.activeLayerId === layerId) {
    applyLabelsToAllFeatures();
  }
}

/**
 * Toggle label visibility
 */
export function toggleLabels(show) {
  if (show) {
    applyLabelsToAllFeatures();
  } else {
    removeAllLabels();
  }
}
