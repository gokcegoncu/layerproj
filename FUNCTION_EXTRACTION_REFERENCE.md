# Function Extraction Reference

This document maps all functions from the original 8435-line file to their target modules.

## Core Modules

### config.js ✅ COMPLETE
- All constants defined
- Icon library complete
- System defaults defined

### state.js ✅ COMPLETE
- AppState class implemented
- State management complete

### map.js ✅ COMPLETE
- initializeMap()
- createDrawnItemsLayer()
- setupCoordinateDisplay()
- setupScaleDisplay()
- setupProjectionSystem()
- invalidateMapSize()

## Utilities

### validation.js ✅ COMPLETE
- validateName()
- validateLayerName()
- validateColor()
- sanitizeInput()
- formatCoordinate()
- validateNumeric()

### security.js ✅ COMPLETE
- escapeHtml()
- sanitizeUrl()
- containsDangerousPatterns()
- stripHtmlTags()

### helpers.js ✅ COMPLETE
- debounce()
- throttle()
- safeExecute()
- generateId()
- rgbToHex()
- hexToRgba()
- calculateDashArray()
- detectLineTypeFromDashArray()
- deepClone()
- isEmpty()

### dom.js ✅ COMPLETE
- createElement()
- removeAllChildren()
- addEventListenerWithCleanup()
- removeAllEventListeners()
- toggleClass()
- getElementPosition()
- isElementInViewport()
- findClosest()
- showElement()
- hideElement()
- toggleElement()

## Styling System

### color-palettes.js ✅ COMPLETE
- ColorPalettes object
- getColorPalette()
- getColorFromPalette()
- interpolatePalette()

### style-manager.js 📝 TO EXTRACT

**Lines to extract from original file: ~3900-5400**

Functions needed:
```javascript
// Main modal functions
- openStyleModal(layerId, layerType)              // Line ~4015
- closeStyleModal()                                // Line ~5357
- showStyleModal()                                 // Line ~4000
- initStyleModal()                                 // Initialize modal

// Style application
- applyStyle()                                     // Line ~4889
- applyStyleToLayer(layerId, layerType)           // Line ~5228
- applyStyleToFeature(featureId, type)            // Line ~5087
- applyStyleToActiveLayer()                        // Line ~4814

// Style loading/saving
- loadCurrentStyles(type, featureId)              // Line ~4121
- saveStyles(layerId, layerType)                  // Line ~5019
- resetDefaultStyles()                             // Line ~4257
- applySystemDefaults()                            // Line ~4263

// User custom styles
- saveUserCustomStyles()                           // Line ~4781
- loadUserCustomValues()                           // Line ~5795
- loadDefaultValues()                              // Line ~5788

// Style mode management
- handleStyleModeChange(mode)                      // Line ~5628
- toggleStyleMode()                                // Line ~5703
- updateStyleModeToggleButton(mode)                // Line ~5727
- toggleLayerStyleMode(layerId, event)            // Line ~5756
- updateLayerStyleModeIndicator(layerId, mode)    // Line ~4620
- updateAllLayerStyleModeIndicators()             // Line ~4650

// Real-time updates
- initRealTimeStyleUpdates()                       // Line ~4524
- handleRealTimeStyleUpdate()                      // Line ~4560
- setupIconGridListener()                          // Line ~4606

// UI helper functions
- updateRangeDisplays()                            // Line ~5069
- setStyleControlsEnabled(enabled)                 // Line ~5845
- initPointStyleTypeToggle()                       // Line ~5589
- initModalDragging()                              // Line ~5535

// Icon management
- loadIconGrid()                                   // Line ~5972
- initIconGridSelection()                          // Supporting function

// Style utilities
- createMarkerIcon(options)                        // Helper function
- getStyleFromInputs(type)                         // Helper function
```

### categorized-style.js 📝 TO EXTRACT

**Search pattern:** Functions related to categorized/thematic styling

Functions needed:
```javascript
- applyCategorizedStyle(layerId, field, categories)
- generateCategories(features, field)
- assignColorToCategory(category, palette)
- createCategoryLegend(categories)
- updateCategorizedPreview()
- getCategoryValue(feature, field)
```

### graduated-style.js 📝 TO EXTRACT

**Search pattern:** Functions related to graduated/classified styling

Functions needed:
```javascript
- applyGraduatedStyle(layerId, field, method, classes)
- classifyQuantile(values, classes)
- classifyEqualInterval(values, classes)
- classifyNaturalBreaks(values, classes)  // Jenks
- classifyStandardDeviation(values, classes)
- calculateClassBreaks(values, method, classes)
- getColorForValue(value, breaks, palette)
- createGraduatedLegend(breaks, palette)
```

### heatmap-style.js 📝 TO EXTRACT

**Search pattern:** Functions related to heatmap visualization

Functions needed:
```javascript
- createHeatmap(features, field, options)
- updateHeatmap(heatmapLayer, features)
- getHeatmapGradient(palette)
- calculateHeatmapIntensity(features, field)
- normalizeHeatmapValues(values)
- createHeatmapLayer(points, options)
```

## Layer Management

### layer-manager.js 📝 TO EXTRACT

**Lines to extract: ~1500-2500**

Functions needed:
```javascript
// Layer CRUD
- createLayer(layerName, targetGroupId)            // Core function
- deleteLayer(layerIdOrButton)                     // Line ~2000
- selectLayer(layerId)                             // Line ~1800
- getActiveLayer()                                 // Helper function
- clearLayerSelection()                            // Helper function

// Layer operations
- updateLayerIcons(layerId)                        // Update icons based on features
- updateLayerName(layerId, newName)                // Rename layer
- duplicateLayer(layerId)                          // Clone layer
- mergeLayersIntoGroup(layerIds, groupId)         // Merge operation

// Feature management
- addFeatureToActiveLayer(type, layer, typeName)   // Line ~1900
- removeFeatureFromLayer(layerId, featureId)       // Remove feature
- getLayerFeatures(layerId)                        // Get all features
- countLayerFeatures(layerId, type)                // Count by type

// Layer properties
- getLayerProperties(layerId)                      // Get properties
- setLayerProperties(layerId, properties)          // Set properties
- getLayerBounds(layerId)                          // Calculate bounds
```

### group-manager.js 📝 TO EXTRACT

**Lines to extract: ~1000-1500**

Functions needed:
```javascript
// Group CRUD
- createGroup(groupName)                           // Create new group
- deleteGroup(groupId)                             // Delete group
- selectGroup(groupId)                             // Select group
- renameGroup(groupId, newName)                    // Rename group

// Group operations
- toggleGroup(groupId)                             // Show/hide group
- expandGroup(groupId)                             // Expand group
- collapseGroup(groupId)                           // Collapse group
- expandAllGroups()                                // Line ~5422
- collapseAllGroups()                              // Line ~5422

// Group management
- updateGroupLayerCount(groupId)                   // Update count
- updateAllGroupCounts()                           // Update all counts
- moveLayerToGroup(layerId, groupId)              // Move layer
- getGroupLayers(groupId)                          // Get group's layers
- isGroupExpanded(groupId)                         // Check expansion state
```

### layer-operations.js 📝 TO EXTRACT

Functions needed:
```javascript
// Visibility
- toggleLayerVisibility(layerId, isVisible)
- toggleLayerFeatures(layerId, isVisible)
- toggleAllLayers(isVisible)
- isLayerVisible(layerId)

// Zoom operations
- zoomToLayer(layerId)
- zoomToExtent(bounds)
- zoomToAllLayers()
- fitBounds(bounds)

// Search and filter
- filterLayers(searchTerm)                         // Line ~5423
- setupSearchAndFilter()                           // Line ~5415
- clearLayerFilter()
- getFilteredLayers()

// Selection
- selectMultipleLayers(layerIds)
- clearAllSelections()                             // Line ~5410
- getSelectedLayers()
- isLayerSelected(layerId)

// Export/Import
- exportLayerToGeoJSON(layerId)
- importGeoJSON(geojson, targetLayerId)
- exportAllLayers()
```

## Drawing Tools

### drawing-tools.js 📝 TO EXTRACT

**Lines to extract: ~2500-3500**

Functions needed:
```javascript
// Drawing mode control
- startDrawing(type)                               // Main drawing starter
- stopDrawing()                                    // Stop all drawing
- isDrawing()                                      // Check drawing state

// Specific geometry tools
- startPointDrawing()                              // Start point mode
- startLineDrawing()                               // Start line mode
- startPolygonDrawing()                            // Start polygon mode
- startRectangleDrawing()                          // Line ~5452
- startCircleDrawing()                             // Line ~5470

// Continuous point mode
- startContinuousPointMode()                       // Continuous point adding
- stopContinuousPointMode()                        // Line ~5377
- isContinuousPointMode()                          // Check state

// Draw control
- initializeDrawingTools(map, drawnItems)
- updateDrawControl()                              // Update draw control
- getDrawControl()                                 // Get draw control instance

// Drawing event handlers
- onDrawCreated(event)                             // Handle created event
- onDrawEdited(event)                              // Handle edited event
- onDrawDeleted(event)                             // Handle deleted event
- onDrawStart(event)                               // Handle start event
- onDrawStop(event)                                // Handle stop event
```

### geometry-handlers.js 📝 TO EXTRACT

Functions needed:
```javascript
// Point creation
- createPoint(latlng, style, properties)
- createMarker(latlng, options)
- createCustomMarker(latlng, iconOptions)

// Line creation
- createLine(latlngs, style, properties)
- createPolyline(latlngs, options)
- createMeasuredLine(latlngs, showLabels)

// Polygon creation
- createPolygon(latlngs, style, properties)
- createPolygonWithHoles(outerRing, holes)
- createMeasuredPolygon(latlngs, showArea)

// Rectangle creation
- createRectangle(bounds, style, properties)
- createBoundingBox(bounds)

// Circle creation
- createCircle(center, radius, style, properties)
- createCircleMarker(latlng, options)

// Geometry utilities
- calculateArea(latlngs)                           // Calculate polygon area
- calculatePerimeter(latlngs)                      // Calculate perimeter
- calculateLength(latlngs)                         // Calculate line length
- simplifyGeometry(latlngs, tolerance)            // Simplify geometry

// Style application
- applyGeometryStyle(layer, style)
- getGeometryType(layer)
- updateGeometryProperties(layer, properties)
```

### feature-properties.js 📝 TO EXTRACT

Functions needed:
```javascript
// Property management
- setFeatureProperties(featureId, properties)
- getFeatureProperties(featureId)
- updateFeatureProperty(featureId, key, value)
- deleteFeatureProperty(featureId, key)

// Feature operations
- deleteFeature(featureId)
- duplicateFeature(featureId)
- zoomToFeature(featureId)
- selectFeature(featureId)
- deselectFeature(featureId)

// Feature info
- getFeatureById(featureId)
- getFeatureLayer(featureId)
- getFeatureType(featureId)
- isFeatureSelected(featureId)

// Bulk operations
- setPropertiesForAllFeatures(properties)
- assignFieldValues()                              // Line ~5884
- generateRandomNames()                            // Line ~5967
- calculateGeometryProperties(featureId)

// Feature validation
- validateFeature(feature)
- validateGeometry(geometry)
```

## UI Components

### modals.js 📝 TO EXTRACT

Functions needed:
```javascript
// Modal management
- showModal(modalId)
- closeModal(modalId)
- closeAllModals()                                 // Line ~5408
- toggleModal(modalId)
- isModalOpen(modalId)

// Modal dragging
- initModalDragging(modalId)                       // Line ~5535
- enableModalDrag(modal)
- disableModalDrag(modal)

// Modal utilities
- centerModal(modalId)
- resizeModal(modalId, width, height)
- setModalTitle(modalId, title)
- setModalContent(modalId, content)

// Specific modals
- openLayerDetailsModal(layerId)
- openSettingsModal()
- openExportModal()
- openImportModal()
```

### console.js 📝 TO EXTRACT

**Lines to extract: ~500-800**

Functions needed:
```javascript
// MessageConsole class
class MessageConsole {
    - init()                                       // Initialize console
    - addMessage(message, type)                    // Add message
    - clear()                                      // Clear all messages
    - toggle()                                     // Toggle visibility
    - show()                                       // Show console
    - hide()                                       // Hide console
    - filter(types)                                // Filter by type
    - export()                                     // Export messages
}

// Convenience functions
- logToConsole(message, type)
- showNotification(message, type)
- showToast(message, type)
- clearConsole()

// Message utilities
- formatMessage(message, type, timestamp)
- getMessageIcon(type)
- getMessageColor(type)
```

### legend.js 📝 TO EXTRACT

Functions needed:
```javascript
// Legend management
- updateLegend()                                   // Update legend content
- showLegend()                                     // Show legend
- hideLegend()                                     // Hide legend
- toggleLegend()                                   // Toggle visibility
- clearLegend()                                    // Clear content

// Legend content
- addLegendItem(label, symbol, color)
- removeLegendItem(id)
- createLegendSymbol(type, style)
- formatLegendLabel(value, unit)

// Legend dragging
- initLegendDragging()                             // Enable dragging
- resetLegendPosition()                            // Reset to default

// Legend styles
- setLegendPosition(position)                      // Set position
- setLegendOpacity(opacity)                        // Set opacity
- setLegendSize(size)                              // Set size

// Legend generation
- generateCategorizedLegend(categories)
- generateGraduatedLegend(breaks, palette)
- generateHeatmapLegend(gradient)
```

### toolbar.js 📝 TO EXTRACT

Functions needed:
```javascript
// Toolbar initialization
- initToolbar()                                    // Initialize toolbar
- setupDrawingTools()                              // Setup drawing buttons
- setupMeasurementTools()                          // Setup measurement buttons
- setupEditTools()                                 // Setup edit buttons

// Tool buttons
- activateToolButton(buttonId)                     // Activate button
- deactivateToolButton(buttonId)                   // Deactivate button
- toggleToolButton(buttonId)                       // Toggle button
- disableAllTools()                                // Disable all

// Edit mode
- toggleEditMode()                                 // Toggle edit mode
- enableEditMode()                                 // Enable edit mode
- disableEditMode()                                // Disable edit mode

// Delete mode
- toggleDeleteMode()                               // Toggle delete mode
- enableDeleteMode()                               // Enable delete mode
- disableDeleteMode()                              // Disable delete mode

// Button utilities
- getDrawButtonIcon(title)                         // Line ~5440
- createToolButton(options)                        // Create button
- updateToolButtonState(buttonId, state)          // Update state
```

### context-menu.js 📝 TO EXTRACT

**Lines to extract: ~5363-5412**

Functions needed:
```javascript
// Context menu setup
- setupContextMenu()                               // Line ~5363
- showContextMenu(x, y, target)                   // Line ~5386
- hideContextMenu()                                // Line ~5393
- isContextMenuVisible()                           // Check visibility

// Menu actions
- handleContextMenuAction(action, target)          // Line ~5397
- addContextMenuItem(label, action)                // Add item
- removeContextMenuItem(id)                        // Remove item

// Menu items
- createStyleMenuItem()                            // Style option
- createDeleteMenuItem()                           // Delete option
- createDuplicateMenuItem()                        // Duplicate option
- createPropertiesMenuItem()                       // Properties option
- createZoomMenuItem()                             // Zoom option

// Menu utilities
- getContextMenuTarget()                           // Get target element
- positionContextMenu(x, y)                        // Position menu
- closeContextMenuOnOutsideClick()                 // Auto-close
```

## Tools

### measurement.js 📝 TEMPLATE PROVIDED

See MODULE_IMPLEMENTATION_GUIDE.md for complete implementation.

### coordinates.js 📝 TO EXTRACT

Functions needed:
```javascript
// Coordinate display
- setupCoordinateDisplay(map)                      // Setup display
- updateCoordinateDisplay(latlng)                  // Update display
- formatCoordinates(lat, lng, format)             // Format coords
- getCoordinateFormat()                            // Get format
- setCoordinateFormat(format)                      // Set format

// Coordinate transformation
- transformCoordinates(x, y, fromProj, toProj)    // Transform
- convertToWGS84(x, y, fromProj)                  // To WGS84
- convertFromWGS84(lat, lng, toProj)              // From WGS84

// Projection management
- setupProjectionSystem()                          // Setup Proj4
- addProjection(code, definition)                  // Add projection
- getProjection(code)                              // Get projection
- listProjections()                                // List all

// Coordinate utilities
- parseCoordinateString(coordString)               // Parse string
- validateCoordinates(lat, lng)                    // Validate
- getCoordinatePrecision()                         // Get precision
- setCoordinatePrecision(decimals)                // Set precision
```

### labels.js 📝 TO EXTRACT

**Lines to extract: ~4289-4521**

Functions needed:
```javascript
// Label manager object
const labelManager = {
    - labels: []
    - addLabel(bounds, element)                    // Line ~4293
    - checkCollision(newBounds)                    // Line ~4297
    - boundsIntersect(a, b)                        // Line ~4301
    - clear()                                      // Line ~4308
    - getBounds(element)                           // Line ~4312
}

// Label application
- applyLabelsToAllFeatures(options)                // Line ~4325
- createLabel(feature, text, options)
- updateLabels()                                   // Update all labels
- clearLabels()                                    // Clear all labels

// Edge labels (for lines/polygons)
- addEdgeLabels(layer, text, fontSize, color)     // Line ~4418
- createEdgeLabel(segment, text, style)
- updateEdgeLabels(layer)

// Label utilities
- calculateLabelPosition(geometry, position)
- getOptimalLabelPosition(geometry)
- checkLabelCollision(bounds, existingLabels)
- formatLabelText(feature, field)

// Label event listeners
- initLabelEventListeners()                        // Line ~4056
- handleLabelClick(event)
- handleLabelHover(event)
```

## Keyboard Shortcuts & Context

### keyboard-shortcuts.js 📝 TO EXTRACT

**Lines to extract: ~5404-5412**

Functions needed:
```javascript
// Keyboard setup
- setupKeyboardShortcuts()                         // Line ~5404
- addKeyboardShortcut(key, handler)
- removeKeyboardShortcut(key)
- disableKeyboardShortcuts()
- enableKeyboardShortcuts()

// Shortcut handlers
- handleEscapeKey()                                // ESC key handler
- handleDeleteKey()                                // Delete key
- handleCtrlZ()                                    // Undo
- handleCtrlY()                                    // Redo
- handleCtrlS()                                    // Save

// Shortcut utilities
- isModifierKeyPressed(event)                      // Check modifiers
- getKeyCombo(event)                               // Get key combination
- formatShortcut(key)                              // Format for display
```

## Error Management

### error-manager.js 📝 TO EXTRACT

**Lines to extract: ~100-300**

Functions needed:
```javascript
// ErrorManager class
class ErrorManager {
    - handleError(error, context)
    - logError(error, level)
    - showErrorToUser(error, canRecover)
    - clearErrors()
}

// Error utilities
- formatError(error)
- getErrorContext()
- isRecoverableError(error)
- notifyErrorToConsole(error)
```

## Complete Function Count

- ✅ Completed: ~50 functions across 9 modules
- 📝 To Extract: ~200+ functions across 17 modules

## Extraction Priority

### High Priority (Core functionality):
1. layer-manager.js
2. drawing-tools.js
3. style-manager.js
4. measurement.js (template provided)

### Medium Priority (Essential features):
5. group-manager.js
6. geometry-handlers.js
7. modals.js
8. console.js

### Lower Priority (Enhanced features):
9. categorized-style.js
10. graduated-style.js
11. heatmap-style.js
12. labels.js
13. legend.js
14. coordinates.js

### Nice to Have:
15. layer-operations.js
16. feature-properties.js
17. toolbar.js
18. context-menu.js

## Extraction Tips

1. **Use grep to find functions:**
   ```bash
   grep -n "function functionName" /tmp/extracted_js.txt
   ```

2. **Look for function patterns:**
   ```bash
   grep -n "^[[:space:]]*function" /tmp/extracted_js.txt
   ```

3. **Find variable declarations:**
   ```bash
   grep -n "^[[:space:]]*const\|^[[:space:]]*let\|^[[:space:]]*var" /tmp/extracted_js.txt
   ```

4. **Search for specific features:**
   ```bash
   grep -i "measurement\|distance\|area" /tmp/extracted_js.txt
   ```

5. **Find class definitions:**
   ```bash
   grep -n "class\|function.*constructor" /tmp/extracted_js.txt
   ```

## Notes

- Line numbers are approximate and may shift
- Some functions may have dependencies on others
- Test each module independently after extraction
- Use the templates provided as guides
- Follow the existing code style and patterns
- Add JSDoc comments to all exported functions
- Ensure all imports are at the top of each file
- Export functions using named exports
