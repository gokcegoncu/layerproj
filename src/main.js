/**
 * Main Application Entry Point
 * Initializes all modules and sets up event listeners
 */

// Core modules
import { CONFIG, SYSTEM_DEFAULTS, ICON_LIBRARY, IconUtils } from './modules/core/config.js';
import { AppState } from './modules/core/state.js';
import { initializeMap, createDrawnItemsLayer, setupCoordinateDisplay, setupScaleDisplay, setupProjectionSystem, invalidateMapSize } from './modules/core/map.js';

// Utilities
import * as Validation from './modules/utils/validation.js';
import * as Security from './modules/utils/security.js';
import * as Helpers from './modules/utils/helpers.js';
import * as DOM from './modules/utils/dom.js';

// Styling
import { ColorPalettes, getColorPalette, getColorFromPalette } from './modules/styling/color-palettes.js';
import * as StyleManager from './modules/styling/style-manager.js';
import * as CategorizedStyle from './modules/styling/categorized-style.js';
import * as GraduatedStyle from './modules/styling/graduated-style.js';
import * as HeatmapStyle from './modules/styling/heatmap-style.js';
import * as LabelManager from './modules/styling/label-manager.js';

// Layers
import * as LayerManager from './modules/layers/layer-manager.js';
import * as GroupManager from './modules/layers/group-manager.js';

// Drawing
import * as DrawingTools from './modules/drawing/drawing-tools.js';
import * as GeometryHandlers from './modules/drawing/geometry-handlers.js';

// UI
import * as Modals from './modules/ui/modals.js';
import * as Console from './modules/ui/console.js';
import * as Legend from './modules/ui/legend.js';

// Tools
import * as Measurement from './modules/tools/measurement.js';
import * as Coordinates from './modules/tools/coordinates.js';

// Storage
import * as DB from './modules/storage/database.js';

/**
 * Global state variables (for backwards compatibility)
 */
window.map = null;
window.drawnItems = null;
window.activeLayerId = null;
window.activeGroupId = null;
window.isDrawingMode = false;
window.layerFeatures = {};
window.drawnLayers = [];
window.measurementTools = null;
window.drawControl = null;

/**
 * Initialize the application
 */
async function initializeApplication() {
    console.log('🚀 Initializing CBS GIS Application...');

    try {
        // 0. Initialize database (optional - don't block if it fails)
        console.log('🗄️ Initializing database...');
        try {
            await DB.initDatabase();
            console.log('✅ Database ready');
        } catch (dbError) {
            console.warn('⚠️ Database initialization failed, continuing without persistence');
            console.error(dbError);
        }

        // 1. Initialize map
        console.log('📍 Initializing map...');
        window.map = initializeMap('map');
        window.drawnItems = createDrawnItemsLayer(window.map);

        // 2. Setup coordinate and scale displays
        console.log('🗺️ Setting up coordinate system...');
        setupCoordinateDisplay(window.map);
        setupScaleDisplay(window.map);
        setupProjectionSystem();

        // 3. Initialize measurement tools
        console.log('📏 Initializing measurement tools...');
        if (Measurement.initMeasurementTools) {
            window.measurementTools = Measurement.initMeasurementTools(window.map);
        }

        // 4. Initialize message console
        console.log('💬 Initializing message console...');
        if (Console.initConsole) {
            Console.initConsole();
        }

        // 5. Setup drawing controls (Leaflet.Draw)
        console.log('✏️ Setting up drawing controls...');
        if (window.L && window.L.Control && window.L.Control.Draw) {
            window.drawControl = new L.Control.Draw({
                draw: {
                    polyline: true,
                    polygon: true,
                    rectangle: true,
                    circle: true,
                    marker: true,
                    circlemarker: false
                },
                edit: {
                    featureGroup: window.drawnItems,
                    remove: true
                }
            });
            window.map.addControl(window.drawControl);

            // Initialize drawing tools module with drawControl
            if (DrawingTools.initializeDrawingTools) {
                DrawingTools.initializeDrawingTools(window.map, window.drawControl);
                console.log('✅ Drawing tools module initialized');
            }

            // Setup draw event handlers
            window.map.on(L.Draw.Event.CREATED, function (event) {
                const layer = event.layer;
                window.drawnItems.addLayer(layer);

                // Add to drawnLayers tracking
                const layerId = window.activeLayerId || window.drawingActiveLayerId || 'default-layer';
                const featureId = 'feature-' + Date.now();

                window.drawnLayers.push({
                    id: featureId,
                    layerId: layerId,
                    layer: layer,
                    type: event.layerType
                });

                // Save to database
                try {
                    const geometry = layer.toGeoJSON ? layer.toGeoJSON().geometry : null;
                    if (geometry && layerId !== 'default-layer') {
                        // Determine feature type
                        let featureType = 'point';
                        if (event.layerType === 'polyline') featureType = 'line';
                        else if (event.layerType === 'polygon' || event.layerType === 'rectangle' || event.layerType === 'circle') featureType = 'polygon';

                        DB.createFeature(featureId, layerId, featureType, geometry, {});
                        // Logging removed for performance
                    }
                } catch (dbError) {
                    console.error('❌ Error saving feature to database:', dbError);
                }

                // Update layer features (for layer-manager compatibility)
                if (window.layerFeatures && layerId !== 'default-layer') {
                    if (!window.layerFeatures[layerId]) {
                        window.layerFeatures[layerId] = [];
                    }

                    let iconType = 'point';
                    if (event.layerType === 'polyline') iconType = 'line';
                    else if (event.layerType === 'polygon' || event.layerType === 'rectangle' || event.layerType === 'circle') iconType = 'polygon';

                    window.layerFeatures[layerId].push({
                        id: featureId,
                        type: iconType,
                        layer: layer
                    });

                    // Update layer icons
                    if (LayerManager.updateLayerIcons) {
                        LayerManager.updateLayerIcons(layerId);
                    }
                }

                // Logging removed for performance

                // Keep layer selected after drawing
                // Re-select the layer to maintain selection highlight
                if (layerId && layerId !== 'default-layer') {
                    setTimeout(() => {
                        const layerElement = document.querySelector(`[data-layer-id="${layerId}"]`);
                        if (layerElement && !layerElement.classList.contains('selected-highlight')) {
                            layerElement.classList.add('selected-highlight');
                        }
                    }, 100);
                }

                // For continuous point mode, restart drawing automatically
                if (window.continuousPointMode && event.layerType === 'marker') {
                    setTimeout(() => {
                        const control = window.drawControl;
                        if (control && control._toolbars && control._toolbars.draw) {
                            const markerTool = control._toolbars.draw._modes.marker;
                            if (markerTool && markerTool.handler) {
                                markerTool.handler.enable();
                                // Logging removed for performance
                            }
                        }
                    }, 50);
                }
            });
        } else {
            console.warn('⚠️ Leaflet.Draw not loaded, drawing tools disabled');
        }

        // 6. Setup event listeners
        console.log('🎯 Setting up event listeners...');
        setupEventListeners();

        // 7. Load data from database (optional)
        console.log('📂 Loading data from database...');
        try {
            await loadDataFromDatabase();
        } catch (loadError) {
            console.warn('⚠️ Could not load data from database');
            console.error(loadError);
        }

        // 8. Initialize UI components
        console.log('🎨 Initializing UI components...');
        initializeUIComponents();

        // 9. Invalidate map size after initialization
        invalidateMapSize(window.map);

        // 9. Setup window resize handler
        window.addEventListener('resize', () => {
            invalidateMapSize(window.map);
        });

        // 10. Setup database import handler
        const dbImportFile = document.getElementById('dbImportFile');
        if (dbImportFile) {
            dbImportFile.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        await DB.importDatabase(file);
                        alert('✅ Database başarıyla içe aktarıldı! Sayfa yenileniyor...');
                        location.reload();
                    } catch (error) {
                        console.error('Import error:', error);
                        alert('❌ Import hatası: ' + error.message);
                    }
                }
            });
        }

        // 11. Update database status indicator
        try {
            updateDatabaseStatus();
        } catch (statusError) {
            console.warn('⚠️ Could not update database status');
        }

        console.log('✅ Application initialized successfully!');

    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        alert('Failed to initialize application. Please check console for details.');
    }
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // State change listeners
    document.addEventListener('state:changed', handleStateChange);

    // Click delegation for layer panel
    document.addEventListener('click', handleDocumentClick);

    // Context menu
    document.addEventListener('contextmenu', handleContextMenu);

    // Label controls event listeners
    const showLabelsCheckbox = document.getElementById('showLabels');
    if (showLabelsCheckbox) {
        showLabelsCheckbox.addEventListener('change', function() {
            const activeLayerId = window.activeLayerId || AppState.get('activeLayerId');
            if (activeLayerId && activeLayerId !== 'default-layer') {
                LabelManager.applyLabels(activeLayerId);
                // Force immediate map refresh
                if (window.map) {
                    setTimeout(() => {
                        window.map.invalidateSize();
                    }, 100);
                }
            }
        });
    }

    const labelField = document.getElementById('labelField');
    if (labelField) {
        labelField.addEventListener('change', function() {
            const activeLayerId = window.activeLayerId || AppState.get('activeLayerId');
            const showLabels = document.getElementById('showLabels')?.checked;
            if (activeLayerId && activeLayerId !== 'default-layer' && showLabels) {
                LabelManager.applyLabels(activeLayerId);
                // Force immediate map refresh
                if (window.map) {
                    setTimeout(() => {
                        window.map.invalidateSize();
                    }, 100);
                }
            }
        });
    }

    // Debounce timer for real-time updates
    let styleUpdateTimer = null;
    let labelUpdateTimer = null;

    // Real-time style updates - Point controls (debounced)
    const pointControls = ['pointColor', 'pointSize', 'pointOpacity', 'pointShape', 'pointStyleType'];
    pointControls.forEach(controlId => {
        const control = document.getElementById(controlId);
        if (control) {
            const eventType = control.type === 'range' ? 'input' : 'change';
            control.addEventListener(eventType, function() {
                clearTimeout(styleUpdateTimer);
                styleUpdateTimer = setTimeout(() => {
                    if (StyleManager.applyStyle) {
                        StyleManager.applyStyle();
                        // Force map refresh
                        if (window.map) {
                            window.map.invalidateSize();
                            if (window.drawnItems) {
                                window.drawnItems.redraw && window.drawnItems.redraw();
                            }
                        }
                    }
                }, 50); // Faster response: 50ms instead of 150ms
            });
        }
    });

    // Real-time style updates - Line controls (debounced)
    const lineControls = ['lineColor', 'lineWidth', 'lineOpacity', 'lineType'];
    lineControls.forEach(controlId => {
        const control = document.getElementById(controlId);
        if (control) {
            const eventType = control.type === 'range' ? 'input' : 'change';
            control.addEventListener(eventType, function() {
                clearTimeout(styleUpdateTimer);
                styleUpdateTimer = setTimeout(() => {
                    if (StyleManager.applyStyle) {
                        StyleManager.applyStyle();
                        // Force map refresh
                        if (window.map) {
                            window.map.invalidateSize();
                            if (window.drawnItems) {
                                window.drawnItems.redraw && window.drawnItems.redraw();
                            }
                        }
                    }
                }, 50);
            });
        }
    });

    // Real-time style updates - Polygon controls (debounced)
    const polygonControls = ['fillColor', 'fillOpacity', 'strokeColor', 'strokeWidth', 'strokeOpacity', 'strokeType'];
    polygonControls.forEach(controlId => {
        const control = document.getElementById(controlId);
        if (control) {
            const eventType = control.type === 'range' ? 'input' : 'change';
            control.addEventListener(eventType, function() {
                clearTimeout(styleUpdateTimer);
                styleUpdateTimer = setTimeout(() => {
                    if (StyleManager.applyStyle) {
                        StyleManager.applyStyle();
                        // Force map refresh
                        if (window.map) {
                            window.map.invalidateSize();
                            if (window.drawnItems) {
                                window.drawnItems.redraw && window.drawnItems.redraw();
                            }
                        }
                    }
                }, 50);
            });
        }
    });

    // Real-time label updates - Font size and colors (debounced)
    const labelStyleControls = ['fontSize', 'fontColor', 'haloColor', 'haloWidth'];
    labelStyleControls.forEach(controlId => {
        const control = document.getElementById(controlId);
        if (control) {
            const eventType = control.type === 'range' ? 'input' : 'change';
            control.addEventListener(eventType, function() {
                clearTimeout(labelUpdateTimer);
                labelUpdateTimer = setTimeout(() => {
                    const activeLayerId = window.activeLayerId || AppState.get('activeLayerId');
                    const showLabels = document.getElementById('showLabels')?.checked;
                    if (activeLayerId && activeLayerId !== 'default-layer' && showLabels) {
                        LabelManager.applyLabels(activeLayerId);
                        // Force map refresh for labels
                        if (window.map) {
                            setTimeout(() => {
                                window.map.invalidateSize();
                            }, 100);
                        }
                    }
                }, 50); // Faster response
            });
        }
    });
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    // ESC key - cancel operations
    if (event.key === 'Escape') {
        // Cancel measurement tools
        if (window.measurementTools && window.measurementTools.isActive) {
            window.measurementTools.stopMeasurement();
            return;
        }

        // Cancel drawing modes
        if (window.drawControl) {
            // Stop all drawing modes
            if (window.drawControl._toolbars && window.drawControl._toolbars.draw) {
                Object.values(window.drawControl._toolbars.draw._modes).forEach(mode => {
                    if (mode && mode.handler && mode.handler.enabled && mode.handler.enabled()) {
                        mode.handler.disable();
                    }
                });
            }
        }

        // Close all modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });

        // Clear active tool buttons
        document.querySelectorAll('.tool-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
    }
}

/**
 * Handle state changes
 */
function handleStateChange(event) {
    const { key, newValue, oldValue } = event.detail;
    // Logging removed for performance - state changes happen frequently

    // Update global variables for backwards compatibility
    if (key === 'activeLayerId') {
        window.activeLayerId = newValue;
    } else if (key === 'activeGroupId') {
        window.activeGroupId = newValue;
    } else if (key === 'isDrawingMode') {
        window.isDrawingMode = newValue;
    }
}

/**
 * Select a layer programmatically
 * @param {string} layerId - Layer ID to select
 */
function selectLayer(layerId) {
    if (!layerId || layerId === 'default-layer') return;

    // Clear all previous selections
    document.querySelectorAll('.layer-item.selected-highlight').forEach(item => {
        item.classList.remove('selected-highlight');
    });

    // Find and select the target layer
    const layerElement = document.querySelector(`[data-layer-id="${layerId}"]`);
    if (layerElement) {
        layerElement.classList.add('selected-highlight');

        // Update state
        AppState.set('activeLayerId', layerId);
        window.activeLayerId = layerId;

        // Update layer selection in LayerManager
        if (LayerManager.selectLayer) {
            LayerManager.selectLayer(layerId);
        }
    }
}

/**
 * Handle document clicks (event delegation)
 */
function handleDocumentClick(event) {
    // Handle data-action attributes
    const actionEl = event.target.closest('[data-action]');
    if (actionEl) {
        const action = actionEl.getAttribute('data-action');
        handleAction(action, actionEl, event);
        return;
    }

    // Layer selection
    const layerSelectable = event.target.closest('.layer-selectable-area');
    if (layerSelectable) {
        const layerItem = layerSelectable.closest('.layer-item');
        if (layerItem) {
            const layerId = layerItem.getAttribute('data-layer-id');
            AppState.set('activeLayerId', layerId);
            LayerManager.selectLayer && LayerManager.selectLayer(layerId);
        }
        return;
    }

    // Group selection
    const groupSelectable = event.target.closest('.group-select-area');
    if (groupSelectable) {
        const groupHeader = groupSelectable.closest('.group-header');
        const layerGroup = groupHeader?.closest('.layer-group');
        if (layerGroup) {
            const groupId = layerGroup.getAttribute('data-group-id');
            AppState.set('activeGroupId', groupId);
            GroupManager.selectGroup && GroupManager.selectGroup(groupId);
        }
        return;
    }

    // Clear selections if clicking outside layer panel (and not in drawing mode)
    if (!event.target.closest('.layer-panel') &&
        !event.target.closest('.leaflet-container') &&
        !AppState.get('isDrawingMode')) {
        LayerManager.clearAllSelections && LayerManager.clearAllSelections();
    }
}

/**
 * Handle action from data-action attribute
 */
function handleAction(action, element, event) {
    const [actionName, param] = action.split(':');

    // Prevent default for buttons
    if (element.tagName === 'BUTTON') {
        event.preventDefault();
    }

    switch (actionName) {
        // Group actions
        case 'show-create-group-modal':
            Modals.showCreateGroupModal && Modals.showCreateGroupModal();
            break;
        case 'select-group':
            GroupManager.selectGroup && GroupManager.selectGroup(element);
            break;
        case 'toggle-group':
            GroupManager.toggleGroup && GroupManager.toggleGroup(element);
            break;
        case 'toggle-all-layers-in-group':
            GroupManager.toggleAllLayersInGroup && GroupManager.toggleAllLayersInGroup(event, element);
            break;
        case 'expand-all-groups':
            GroupManager.expandAllGroups && GroupManager.expandAllGroups();
            break;
        case 'collapse-all-groups':
            GroupManager.collapseAllGroups && GroupManager.collapseAllGroups();
            break;

        // Layer actions
        case 'show-create-layer-modal':
            Modals.showCreateLayerModal && Modals.showCreateLayerModal();
            break;
        case 'delete-layer': {
            // Auto-select the layer first
            const layerItemToDelete = element.closest('.layer-item');
            if (layerItemToDelete) {
                const layerId = layerItemToDelete.getAttribute('data-layer-id');
                selectLayer(layerId);
            }
            LayerManager.deleteLayer && LayerManager.deleteLayer(element);
            break;
        }
        case 'show-layer-properties': {
            // Auto-select the layer first
            const layerItemProps = element.closest('.layer-item');
            if (layerItemProps) {
                const layerId = layerItemProps.getAttribute('data-layer-id');
                selectLayer(layerId);
            }
            Modals.showLayerProperties && Modals.showLayerProperties(element);
            break;
        }
        case 'open-layer-details': {
            // Auto-select the layer first
            const layerItemDetails = element.closest('.layer-item');
            if (layerItemDetails) {
                const layerId = layerItemDetails.getAttribute('data-layer-id');
                selectLayer(layerId);
            }
            Modals.openLayerDetails && Modals.openLayerDetails(element);
            break;
        }
        case 'toggle-layer-filter':
            LayerManager.toggleLayerFilter && LayerManager.toggleLayerFilter();
            break;

        // Drawing actions
        case 'start-drawing':
            DrawingTools.startDrawing && DrawingTools.startDrawing(param);
            break;
        case 'stop-drawing':
            DrawingTools.stopDrawing && DrawingTools.stopDrawing();
            break;
        case 'toggle-continuous-point-mode':
            DrawingTools.toggleContinuousPointMode && DrawingTools.toggleContinuousPointMode();
            break;

        // Style actions
        case 'open-style-modal': {
            // Auto-select the layer first
            const layerItemStyle = element.closest('.layer-item');
            if (layerItemStyle) {
                const layerId = layerItemStyle.getAttribute('data-layer-id');
                selectLayer(layerId);
            }
            StyleManager.openStyleModal && StyleManager.openStyleModal();
            break;
        }
        case 'show-style-modal': {
            // Auto-select the layer first
            const layerItemShowStyle = element.closest('.layer-item');
            if (layerItemShowStyle) {
                const layerId = layerItemShowStyle.getAttribute('data-layer-id');
                selectLayer(layerId);
            }
            StyleManager.showStyleModal && StyleManager.showStyleModal(element);
            break;
        }
        case 'close-style-modal':
            StyleManager.closeStyleModal && StyleManager.closeStyleModal();
            break;
        case 'apply-style':
            StyleManager.applyStyle && StyleManager.applyStyle();
            break;
        case 'reset-default-styles':
            StyleManager.resetDefaultStyles && StyleManager.resetDefaultStyles();
            break;

        // Measurement actions
        case 'start-measurement':
            Measurement.startMeasurement && Measurement.startMeasurement(param);
            break;
        case 'stop-measurement':
            Measurement.stopMeasurement && Measurement.stopMeasurement();
            break;
        case 'clear-measurements':
            Measurement.clearMeasurements && Measurement.clearMeasurements();
            break;
        case 'open-measurement-settings':
            // Toggle measurement settings panel
            console.log('Measurement settings requested');
            break;

        // Legend actions
        case 'toggle-legend':
            Legend.toggleLegend && Legend.toggleLegend();
            break;
        case 'show-legend':
            Legend.showLegend && Legend.showLegend();
            break;
        case 'hide-legend':
            Legend.hideLegend && Legend.hideLegend();
            break;
        case 'toggle-legend-content':
            Legend.toggleLegendContent && Legend.toggleLegendContent();
            break;
        case 'toggle-legend-settings':
            Legend.toggleLegendSettings && Legend.toggleLegendSettings();
            break;

        // Console actions
        case 'clear-console':
            Console.clearConsole && Console.clearConsole();
            break;
        case 'toggle-console':
            Console.toggleConsole && Console.toggleConsole();
            break;
        case 'clear-message-console':
            Console.clearConsole && Console.clearConsole();
            break;
        case 'toggle-message-console':
            Console.toggleConsole && Console.toggleConsole();
            break;
        case 'toggle-console-dock':
            console.log('Toggle console dock');
            // Implementation depends on console dock feature
            break;
        case 'toggle-console-minimize':
            const consoleEl = document.getElementById('messageConsole');
            if (consoleEl) {
                consoleEl.classList.toggle('minimized');
            }
            break;

        // Query actions
        case 'open-query-modal':
            const queryModal = document.getElementById('queryModal');
            if (queryModal) {
                queryModal.style.display = 'block';
                const layerItem = element.closest('.layer-item');
                if (layerItem) {
                    queryModal.setAttribute('data-layer-id', layerItem.getAttribute('data-layer-id'));
                }
            }
            break;
        case 'close-query-modal':
            const queryModalClose = document.getElementById('queryModal');
            if (queryModalClose) {
                queryModalClose.style.display = 'none';
            }
            break;
        case 'apply-query':
            console.log('Apply query');
            // Query logic would go here
            break;
        case 'switch-query-tab':
            document.querySelectorAll('#queryModal .style-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            element.classList.add('active');
            document.querySelectorAll('#queryModal .tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const queryTabContent = document.getElementById(param + 'QueryTab');
            if (queryTabContent) {
                queryTabContent.classList.add('active');
            }
            break;

        // Attribute editor actions
        case 'close-attribute-editor': {
            const attrEditor = document.getElementById('attributeEditorModal');
            if (attrEditor) {
                attrEditor.style.display = 'none';
            }
            break;
        }
        case 'edit-feature-attributes':
            const attrEditorModal = document.getElementById('attributeEditorModal');
            if (attrEditorModal) {
                attrEditorModal.style.display = 'block';
            }
            break;
        case 'auto-assign-values': {
            // Get selected field type
            const fieldType = document.getElementById('autoAssignField').value;
            if (!fieldType) {
                alert('⚠️ Lütfen bir alan türü seçin!');
                return;
            }

            // Get active layer
            const layerId = window.attributeAssignmentLayerId || window.activeLayerId || AppState.get('activeLayerId');
            if (!layerId || layerId === 'default-layer') {
                alert('⚠️ Lütfen önce bir katman seçin!');
                return;
            }

            const layerFeatures = window.layerFeatures[layerId] || [];
            if (layerFeatures.length === 0) {
                alert('⚠️ Seçili katmanda özellik bulunmuyor!');
                return;
            }

            // Count features by type
            const counts = {
                point: 0,
                line: 0,
                polygon: 0
            };

            let successCount = 0;
            let globalIndex = 1;

            // Assign values to each feature
            layerFeatures.forEach((feature, index) => {
                const featureInfo = window.drawnLayers.find(f => f.id === feature.id);
                if (!featureInfo) return;

                // Determine geometry type
                const geometryType = feature.type || 'point';
                counts[geometryType]++;

                // Initialize properties if not exist
                if (!featureInfo.properties) {
                    featureInfo.properties = {};
                }

                // Generate value based on field type
                switch (fieldType) {
                    case 'name': {
                        // Generate name based on geometry type
                        const typeNames = {
                            point: 'Nokta',
                            line: 'Çizgi',
                            polygon: 'Poligon'
                        };
                        featureInfo.properties.name = `${typeNames[geometryType]}-${counts[geometryType]}`;
                        break;
                    }
                    case 'value': {
                        // Assign sequential numeric value
                        featureInfo.properties.value = globalIndex;
                        break;
                    }
                    case 'category': {
                        // Assign category based on geometry type
                        const categoryNames = {
                            point: 'Point',
                            line: 'Line',
                            polygon: 'Polygon'
                        };
                        featureInfo.properties.category = categoryNames[geometryType];
                        break;
                    }
                    case 'sequential': {
                        // Assign formatted ID
                        featureInfo.properties.id = `F-${String(globalIndex).padStart(3, '0')}`;
                        featureInfo.properties.name = `Feature ${String(globalIndex).padStart(3, '0')}`;
                        break;
                    }
                }

                // Save to database
                DB.updateFeatureProperties(feature.id, featureInfo.properties);
                successCount++;
                globalIndex++;
            });

            // Show success message
            if (Console && Console.logToConsole) {
                Console.logToConsole(`✅ ${successCount} özelliğe otomatik değer atandı`, 'success');
            }

            // Close assignment modal
            const assignModal = document.getElementById('attributeEditorModal');
            if (assignModal) {
                assignModal.style.display = 'none';
            }

            // Show success and offer to show labels
            const showLabelsNow = confirm(
                `✅ ${successCount} özelliğe otomatik değer atandı!\n\n` +
                `Nokta: ${counts.point}\nÇizgi: ${counts.line}\nPoligon: ${counts.polygon}\n\n` +
                `Etiketleri haritada göstermek ister misiniz?`
            );

            if (showLabelsNow) {
                // Open style modal to labels tab
                if (StyleManager.openStyleModal) {
                    StyleManager.openStyleModal(null, layerId);
                }

                // Switch to label tab
                setTimeout(() => {
                    const labelTab = document.querySelector('[data-action="switch-tab:label"]');
                    if (labelTab) {
                        labelTab.click();
                    }

                    // Auto-enable labels with the assigned field
                    const showLabelsCheckbox = document.getElementById('showLabels');
                    const labelFieldSelect = document.getElementById('labelField');

                    if (showLabelsCheckbox && labelFieldSelect) {
                        showLabelsCheckbox.checked = true;

                        // Select appropriate label field based on assignment type
                        if (fieldType === 'name') {
                            labelFieldSelect.value = 'name';
                        } else if (fieldType === 'value') {
                            labelFieldSelect.value = 'value';
                        } else if (fieldType === 'category') {
                            labelFieldSelect.value = 'category';
                        } else if (fieldType === 'sequential') {
                            labelFieldSelect.value = 'name'; // Sequential creates name field
                        }

                        // Apply labels immediately
                        LabelManager.applyLabels(layerId);

                        if (Console && Console.logToConsole) {
                            Console.logToConsole('✅ Etiketler gösteriliyor', 'success');
                        }
                    }
                }, 300);
            }
            break;
        }
        case 'delete-feature-from-context':
            console.log('Delete feature from context menu');
            // Delete logic would go here
            break;

        // Layer details modal actions
        case 'close-layer-details-modal':
            const layerDetailsModal = document.getElementById('layerDetailsModal');
            if (layerDetailsModal) {
                layerDetailsModal.style.display = 'none';
            }
            break;
        case 'add-feature-to-layer':
            console.log('Add feature to layer');
            // Add feature logic would go here
            break;

        // Create modal actions
        case 'close-create-modal': {
            const createModal = document.getElementById('createModal');
            if (createModal) {
                createModal.style.display = 'none';
            }
            break;
        }
        case 'confirm-create': {
            console.log('Confirm create');

            // Get modal and determine create type
            const createModal = document.getElementById('createModal');
            if (!createModal) {
                console.error('Create modal not found');
                return;
            }

            const createType = createModal.getAttribute('data-create-type');
            const nameInput = document.getElementById('createNameInput');

            if (!nameInput || !nameInput.value.trim()) {
                alert('⚠️ Lütfen bir isim girin!');
                return;
            }

            const name = nameInput.value.trim();

            if (createType === 'group') {
                // Create group
                const groupId = GroupManager.createGroup(name);
                if (groupId) {
                    console.log(`✅ Group created: ${groupId}`);
                    createModal.style.display = 'none';
                    nameInput.value = '';

                    // Show success message
                    if (Console && Console.logToConsole) {
                        Console.logToConsole(`Grup oluşturuldu: ${name}`, 'success');
                    }
                } else {
                    alert('❌ Grup oluşturulamadı!');
                }
            } else if (createType === 'layer') {
                // Create layer
                const groupSelect = document.getElementById('targetGroupSelect');
                if (!groupSelect || !groupSelect.value) {
                    alert('⚠️ Lütfen bir grup seçin!');
                    return;
                }

                const groupId = groupSelect.value;
                const layerId = LayerManager.createLayer(name, groupId);

                if (layerId) {
                    console.log(`✅ Layer created: ${layerId}`);
                    createModal.style.display = 'none';
                    nameInput.value = '';

                    // Update group layer count
                    if (GroupManager.updateGroupLayerCount) {
                        GroupManager.updateGroupLayerCount(groupId);
                    }

                    // Show success message
                    if (Console && Console.logToConsole) {
                        Console.logToConsole(`Katman oluşturuldu: ${name}`, 'success');
                    }
                } else {
                    alert('❌ Katman oluşturulamadı!');
                }
            } else {
                console.error('Unknown create type:', createType);
                alert('❌ Hatalı işlem tipi!');
            }
            break;
        }

        // Style modal tab switching
        case 'switch-tab':
            // Remove active class from all tabs
            document.querySelectorAll('.style-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            // Add active class to clicked tab
            element.classList.add('active');

            // Hide all tab content divs
            const tabContents = ['styleContent', 'labelContent', 'themeContent'];
            tabContents.forEach(id => {
                const content = document.getElementById(id);
                if (content) {
                    content.style.display = 'none';
                }
            });

            // Show the selected tab content
            const selectedContent = document.getElementById(param + 'Content');
            if (selectedContent) {
                selectedContent.style.display = 'block';
            }
            break;

        // Advanced style actions
        case 'assign-field-values': {
            // Open attribute editor for current layer's selected features
            const activeLayerId = window.activeLayerId || AppState.get('activeLayerId');
            if (!activeLayerId || activeLayerId === 'default-layer') {
                alert('⚠️ Lütfen önce bir katman seçin!');
                return;
            }

            const layerFeatures = window.layerFeatures[activeLayerId];
            if (!layerFeatures || layerFeatures.length === 0) {
                alert('⚠️ Seçili katmanda özellik bulunmuyor!');
                return;
            }

            // Store the active layer for attribute assignment
            window.attributeAssignmentLayerId = activeLayerId;

            // Show modal (no need to clear fields since we removed manual inputs)
            const modal = document.getElementById('attributeEditorModal');
            if (modal) {
                modal.style.display = 'block';
            }

            if (Console && Console.logToConsole) {
                Console.logToConsole(`Değer atama: ${layerFeatures.length} özellik`, 'info');
            }
            break;
        }
        case 'apply-categorized-style':
            console.log('Apply categorized style');
            CategorizedStyle.applyCategorizedStyle && CategorizedStyle.applyCategorizedStyle();
            break;
        case 'apply-graduated-style':
            console.log('Apply graduated style');
            GraduatedStyle.applyGraduatedStyle && GraduatedStyle.applyGraduatedStyle();
            break;
        case 'apply-heatmap-visualization':
            HeatmapStyle.applyHeatmapVisualization && HeatmapStyle.applyHeatmapVisualization();
            break;
        case 'remove-heatmap-visualization':
            HeatmapStyle.removeHeatmapVisualization && HeatmapStyle.removeHeatmapVisualization();
            break;
        case 'save-and-close-style': {
            StyleManager.applyStyle && StyleManager.applyStyle();

            // Apply labels if enabled
            const activeLayerId = window.activeLayerId || AppState.get('activeLayerId');
            if (activeLayerId && activeLayerId !== 'default-layer') {
                LabelManager.applyLabels(activeLayerId);
            }

            StyleManager.closeStyleModal && StyleManager.closeStyleModal();
            break;
        }

        // Legend actions (additional)
        case 'close-legend':
            Legend.hideLegend && Legend.hideLegend();
            break;

        // Database actions
        case 'export-database':
            if (DB && DB.exportDatabase) {
                DB.exportDatabase();
                console.log('📥 Database exported');
            } else {
                console.error('Database mevcut değil');
                alert('Database mevcut değil. Yeni veri ekleyin.');
            }
            break;
        case 'import-database':
            document.getElementById('dbImportFile')?.click();
            break;

        // Map actions
        case 'zoom-to-layer': {
            // Auto-select the layer first
            const layerToZoom = element.closest('.layer-item');
            if (layerToZoom) {
                const layerId = layerToZoom.getAttribute('data-layer-id');
                selectLayer(layerId);

                // Zoom to layer features
                const layerFeatures = window.layerFeatures[layerId];
                if (layerFeatures && layerFeatures.length > 0 && window.map) {
                    const bounds = L.latLngBounds([]);
                    let hasValidBounds = false;

                    layerFeatures.forEach(feature => {
                        if (feature.layer && feature.layer.getBounds) {
                            bounds.extend(feature.layer.getBounds());
                            hasValidBounds = true;
                        } else if (feature.layer && feature.layer.getLatLng) {
                            bounds.extend(feature.layer.getLatLng());
                            hasValidBounds = true;
                        }
                    });

                    if (hasValidBounds) {
                        window.map.fitBounds(bounds, { padding: [50, 50] });
                        if (Console && Console.logToConsole) {
                            Console.logToConsole('Katmana odaklandı', 'success');
                        }
                    } else {
                        if (Console && Console.logToConsole) {
                            Console.logToConsole('Katmanda görüntülenebilir özellik yok', 'warning');
                        }
                    }
                }
            }
            break;
        }
        case 'zoom-to-extent':
            console.log('Zoom to extent');
            if (window.map && window.drawnItems) {
                const layers = window.drawnItems.getLayers();
                if (layers && layers.length > 0) {
                    window.map.fitBounds(window.drawnItems.getBounds());
                } else {
                    console.log('No features to zoom to');
                    // Optionally, show a notification
                    if (Console && Console.logToConsole) {
                        Console.logToConsole('No features drawn yet', 'warning');
                    }
                }
            }
            break;

        // Edit mode actions
        case 'toggle-edit-mode':
            console.log('Toggle edit mode');
            element.classList.toggle('active');
            // Edit mode logic would go here
            break;
        case 'toggle-delete-mode':
            console.log('Toggle delete mode');
            element.classList.toggle('active');
            // Delete mode logic would go here
            break;

        // Scale actions
        case 'toggle-scale-selector':
            const scaleDropdown = document.getElementById('scaleDropdown');
            if (scaleDropdown) {
                scaleDropdown.classList.toggle('show');
            }
            break;
        case 'set-fixed-scale':
            const scaleText = document.getElementById('scaleText');
            if (scaleText) {
                scaleText.textContent = element.textContent;
            }
            const scaleDropdownClose = document.getElementById('scaleDropdown');
            if (scaleDropdownClose) {
                scaleDropdownClose.classList.remove('show');
            }
            console.log('Set fixed scale:', element.textContent);
            break;
        case 'set-dynamic-scale':
            const scaleTextDynamic = document.getElementById('scaleText');
            if (scaleTextDynamic) {
                scaleTextDynamic.textContent = 'Dinamik';
            }
            const scaleDropdownDynamic = document.getElementById('scaleDropdown');
            if (scaleDropdownDynamic) {
                scaleDropdownDynamic.classList.remove('show');
            }
            console.log('Set dynamic scale');
            break;

        // Context menu actions
        case 'context-menu-action':
            if (param === 'zoom') {
                console.log('Context menu: zoom');
            } else if (param === 'style') {
                console.log('Context menu: style');
            } else if (param === 'properties') {
                console.log('Context menu: properties');
            } else if (param === 'delete') {
                console.log('Context menu: delete');
            }
            break;

        // Measurement settings
        case 'close-measurement-settings':
            const measurementSettings = document.getElementById('measurementSettings');
            if (measurementSettings) {
                measurementSettings.style.display = 'none';
            }
            break;
        case 'reset-measurement-settings':
            console.log('Reset measurement settings');
            // Reset logic would go here
            break;

        // Fullscreen
        case 'toggle-fullscreen':
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
            break;

        default:
            console.warn(`Unknown action: ${actionName}`);
    }
}

/**
 * Handle context menu
 */
function handleContextMenu(event) {
    // Check if right-click on layer item
    const layerItem = event.target.closest('.layer-item');
    if (layerItem) {
        event.preventDefault();
        // showContextMenu(event.pageX, event.pageY, layerItem);
        return;
    }

    // Check if right-click on map while in continuous point mode
    if (window.continuousPointMode && event.target.closest('#map')) {
        event.preventDefault();
        // stopContinuousPointMode();
    }
}

/**
 * Update database status indicator
 */
function updateDatabaseStatus() {
    const dbStatus = document.getElementById('dbStatus');
    if (!dbStatus) return;

    try {
        const stats = DB.getDatabaseStats();
        const hasData = stats.groups > 0 || stats.layers > 0 || stats.features > 0;

        if (DB.getDatabase()) {
            dbStatus.style.background = '#28a745';
            dbStatus.textContent = `DB: ✓ (${stats.groups}G/${stats.layers}L/${stats.features}F)`;
            dbStatus.title = `Database OK - ${stats.groups} grup, ${stats.layers} katman, ${stats.features} çizim`;
        } else {
            dbStatus.style.background = '#dc3545';
            dbStatus.textContent = 'DB: ✗';
            dbStatus.title = 'Database mevcut değil';
        }
    } catch (error) {
        dbStatus.style.background = '#ffc107';
        dbStatus.textContent = 'DB: ⚠';
        dbStatus.title = 'Database hatalı';
    }
}

/**
 * Load data from database
 */
async function loadDataFromDatabase() {
    try {
        console.log('📂 Loading groups, layers, and features from database...');

        // Get all groups
        const groups = DB.getAllGroups();
        console.log(`Found ${groups.length} groups in database`);

        // Load each group
        for (const groupData of groups) {
            // Create group in UI
            const groupContainer = document.querySelector('#layerList');
            if (!groupContainer) continue;

            const layerGroup = document.createElement('div');
            layerGroup.className = 'layer-group';
            layerGroup.setAttribute('data-group-id', groupData.id);

            layerGroup.innerHTML = `
                <div class="group-header">
                    <div class="group-visibility-area" title="Tüm katmanları aç/kapat">
                        <input type="checkbox" class="group-visibility-checkbox" checked>
                    </div>
                    <div class="group-select-area">
                        <span class="group-name">${groupData.name}</span>
                        <span class="group-count">0</span>
                    </div>
                    <div class="group-toggle-area">
                        <span class="group-icon">${groupData.expanded ? '▼' : '▶'}</span>
                    </div>
                </div>
                <div class="group-items ${groupData.expanded ? '' : 'collapsed'}">
                    <!-- Katmanlar buraya eklenecek -->
                </div>
            `;

            groupContainer.appendChild(layerGroup);

            // Load layers for this group
            const layers = DB.getLayersByGroup(groupData.id);
            console.log(`Found ${layers.length} layers for group ${groupData.id}`);

            const groupItems = layerGroup.querySelector('.group-items');

            for (const layerData of layers) {
                // Create layer in UI
                const layerItem = document.createElement('div');
                layerItem.className = 'layer-item';
                layerItem.draggable = true;
                layerItem.setAttribute('data-layer-id', layerData.id);

                layerItem.innerHTML = `
                    <input type="checkbox" class="layer-visibility" ${layerData.visible ? 'checked' : ''}>
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
                        <span class="layer-name">${layerData.name}</span>
                        <span class="layer-style-mode-indicator default-mode" data-layer-id="${layerData.id}" title="Varsayılan Kurumsal Ayarlar">
                            🏢
                        </span>
                    </div>
                    <div class="layer-actions">
                        <button class="layer-action-btn" title="Zoom" data-action="zoom-to-layer">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5,14H20.5L19,15.5L21.5,18L20,19.5L17.5,17L16,18.5V13.5H15.5M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L20,19.29L18.71,20.58L13.15,15C12,15.83 10.61,16.36 9.5,16.36A6.5,6.5 0 0,1 3,9.86A6.5,6.5 0 0,1 9.5,3.36V3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                            </svg>
                        </button>
                        <button class="layer-action-btn" title="Stil Ayarları" data-action="open-style-modal">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                            </svg>
                        </button>
                        <button class="layer-action-btn" title="Detaylar" data-action="open-layer-details">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13,7H11V5H13M13,17H11V9H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                            </svg>
                        </button>
                        <button class="layer-action-btn" title="Sil" data-action="delete-layer">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                            </svg>
                        </button>
                    </div>
                `;

                groupItems.appendChild(layerItem);

                // Setup visibility checkbox event listener
                const visibilityCheckbox = layerItem.querySelector('.layer-visibility');
                if (visibilityCheckbox) {
                    visibilityCheckbox.addEventListener('change', function(e) {
                        e.stopPropagation(); // Don't trigger layer selection
                        if (LayerManager.toggleLayerVisibility) {
                            LayerManager.toggleLayerVisibility(layerData.id, this.checked);
                        }
                    });
                }

                // Initialize layer features array
                window.layerFeatures[layerData.id] = [];

                // Load features for this layer
                const features = DB.getFeaturesByLayer(layerData.id);
                console.log(`Found ${features.length} features for layer ${layerData.id}`);

                for (const featureData of features) {
                    try {
                        console.log(`📥 Loading feature ${featureData.id}:`, {
                            type: featureData.type,
                            geometryType: featureData.geometry?.type,
                            hasProperties: !!featureData.properties
                        });

                        // Create Leaflet layer from GeoJSON geometry
                        let leafletLayer = null;
                        const geom = featureData.geometry;

                        // Create layer based on geometry type
                        if (geom.type === 'Point') {
                            leafletLayer = L.marker([geom.coordinates[1], geom.coordinates[0]]);
                        } else if (geom.type === 'LineString') {
                            const coords = geom.coordinates.map(c => [c[1], c[0]]);
                            leafletLayer = L.polyline(coords);
                        } else if (geom.type === 'Polygon') {
                            const coords = geom.coordinates[0].map(c => [c[1], c[0]]);
                            leafletLayer = L.polygon(coords);
                        } else {
                            // Fallback to L.geoJSON for complex geometries
                            const geoJsonLayer = L.geoJSON(geom);
                            leafletLayer = geoJsonLayer.getLayers()[0];
                        }

                        if (!leafletLayer) {
                            console.error(`❌ Failed to create layer for feature ${featureData.id}`);
                            continue;
                        }

                        // Validate layer has coordinate methods
                        const hasCoordMethods = !!(
                            leafletLayer.getLatLng ||
                            leafletLayer.getBounds ||
                            leafletLayer.getLatLngs ||
                            leafletLayer.getCenter
                        );

                        if (!hasCoordMethods) {
                            console.error(`❌ Layer missing coordinate methods for ${featureData.id}`, leafletLayer);
                            continue;
                        }

                        console.log(`✅ Layer created:`, {
                            hasGetLatLng: !!leafletLayer.getLatLng,
                            hasGetBounds: !!leafletLayer.getBounds,
                            hasGetLatLngs: !!leafletLayer.getLatLngs,
                            layerType: leafletLayer.constructor.name
                        });

                        // ALWAYS add to drawnItems (source of truth for map display)
                        window.drawnItems.addLayer(leafletLayer);

                        // Handle visibility separately
                        if (!layerData.visible) {
                            console.log(`  🙈 Layer hidden (will remove from display)`);
                            window.drawnItems.removeLayer(leafletLayer);
                        }

                        // Store feature properties on layer for easy access
                        leafletLayer._featureId = featureData.id;
                        leafletLayer._featureProperties = featureData.properties || {};
                        leafletLayer._featureType = featureData.type;

                        // Add to layer features
                        window.layerFeatures[layerData.id].push({
                            id: featureData.id,
                            type: featureData.type,
                            layer: leafletLayer
                        });

                        // Add to drawn layers
                        window.drawnLayers.push({
                            id: featureData.id,
                            layerId: layerData.id,
                            layer: leafletLayer,
                            type: featureData.type,
                            groupId: groupData.id,
                            properties: featureData.properties || {}
                        });

                        console.log(`✅ Feature loaded successfully: ${featureData.id}`);

                    } catch (featureError) {
                        console.error(`❌ Error loading feature ${featureData.id}:`, featureError);
                    }
                }

                // Update layer icons based on loaded features
                if (LayerManager.updateLayerIcons) {
                    LayerManager.updateLayerIcons(layerData.id);
                }
            }

            // Update group layer count
            if (GroupManager.updateGroupLayerCount) {
                GroupManager.updateGroupLayerCount(groupData.id);
            }
        }

        const stats = DB.getDatabaseStats();
        console.log(`✅ Loaded ${stats.groups} groups, ${stats.layers} layers, ${stats.features} features`);

        // Update status indicator
        updateDatabaseStatus();
    } catch (error) {
        console.error('❌ Error loading data from database:', error);
    }
}

/**
 * Initialize UI components
 */
function initializeUIComponents() {
    // Initialize modals
    // initModalDragging();

    // Initialize legend
    // initLegendDragging();

    // Initialize toolbar
    // setupToolbar();

    // Update all group counts
    // updateAllGroupCounts();

    // Update layer style mode indicators
    // updateAllLayerStyleModeIndicators();
}

/**
 * Expose utilities and modules globally for backwards compatibility
 */
window.Utils = {
    ...Helpers,
    Validation,
    Security,
    DOM
};

window.CONFIG = CONFIG;
window.AppState = AppState;
window.ColorPalettes = ColorPalettes;

// Expose modules globally
window.LayerManager = LayerManager;
window.GroupManager = GroupManager;
window.DrawingTools = DrawingTools;
window.GeometryHandlers = GeometryHandlers;
window.StyleManager = StyleManager;
window.CategorizedStyle = CategorizedStyle;
window.GraduatedStyle = GraduatedStyle;
window.HeatmapStyle = HeatmapStyle;
window.Modals = Modals;
window.Console = Console;
window.Legend = Legend;
window.Measurement = Measurement;
window.Coordinates = Coordinates;
window.DB = DB;

/**
 * Wait for external libraries to load
 */
function waitForExternalLibraries() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 200; // 10 seconds max

        const checkLibraries = () => {
            attempts++;

            // Debug logging
            if (attempts === 1) {
                console.log('⏳ Waiting for external libraries...');
                console.log('Leaflet:', typeof window.L);
                console.log('proj4:', typeof window.proj4);
                console.log('Leaflet.Draw:', typeof window.L?.Draw);
            }

            if (window.L && window.L.Control && window.L.Control.Draw && window.proj4) {
                console.log('✅ All external libraries loaded!');
                resolve();
            } else if (attempts >= maxAttempts) {
                console.error('❌ Timeout waiting for external libraries');
                console.log('L:', typeof window.L);
                console.log('L.Control:', typeof window.L?.Control);
                console.log('L.Control.Draw:', typeof window.L?.Control?.Draw);
                console.log('proj4:', typeof window.proj4);
                resolve(); // Continue anyway
            } else {
                setTimeout(checkLibraries, 50);
            }
        };
        checkLibraries();
    });
}

/**
 * Initialize application when DOM and libraries are ready
 */
async function init() {
    await waitForExternalLibraries();
    initializeApplication();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

/**
 * Export for testing purposes
 */
export { initializeApplication, setupEventListeners, handleKeyboardShortcuts };
