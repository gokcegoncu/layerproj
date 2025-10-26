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
function initializeApplication() {
    console.log('🚀 Initializing CBS GIS Application...');

    try {
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

            // Setup draw event handlers
            window.map.on(L.Draw.Event.CREATED, function (event) {
                const layer = event.layer;
                window.drawnItems.addLayer(layer);

                // Add to drawnLayers tracking
                const layerId = window.activeLayerId || 'default-layer';
                window.drawnLayers.push({
                    id: 'feature-' + Date.now(),
                    layerId: layerId,
                    layer: layer,
                    type: event.layerType
                });

                console.log('Feature created:', event.layerType);
            });
        } else {
            console.warn('⚠️ Leaflet.Draw not loaded, drawing tools disabled');
        }

        // 6. Setup event listeners
        console.log('🎯 Setting up event listeners...');
        setupEventListeners();

        // 7. Initialize UI components
        console.log('🎨 Initializing UI components...');
        initializeUIComponents();

        // 8. Invalidate map size after initialization
        invalidateMapSize(window.map);

        // 9. Setup window resize handler
        window.addEventListener('resize', () => {
            invalidateMapSize(window.map);
        });

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
    console.log(`State changed: ${key}`, { from: oldValue, to: newValue });

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
        case 'delete-layer':
            LayerManager.deleteLayer && LayerManager.deleteLayer(element);
            break;
        case 'show-layer-properties':
            Modals.showLayerProperties && Modals.showLayerProperties(element);
            break;
        case 'open-layer-details':
            Modals.openLayerDetails && Modals.openLayerDetails(element);
            break;
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
        case 'open-style-modal':
            StyleManager.openStyleModal && StyleManager.openStyleModal();
            break;
        case 'show-style-modal':
            StyleManager.showStyleModal && StyleManager.showStyleModal(element);
            break;
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

/**
 * Initialize application when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}

/**
 * Export for testing purposes
 */
export { initializeApplication, setupEventListeners, handleKeyboardShortcuts };
