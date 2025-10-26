/**
 * Application State Management
 * Centralized state management with change notifications
 */

/**
 * Application state object
 */
class AppStateManager {
    constructor() {
        this.data = {
            activeLayerId: null,
            activeGroupId: null,
            isDrawingMode: false,
            layerFeatures: {},
            drawnLayers: [],
            measurementMode: null,
            drawingActiveLayerId: null,
            continuousPointMode: false
        };
    }

    /**
     * Get a state value
     */
    get(key) {
        return this.data[key];
    }

    /**
     * Set a state value with change notification
     */
    set(key, value) {
        const oldValue = this.data[key];
        this.data[key] = value;
        this.notifyChange(key, value, oldValue);
        return value;
    }

    /**
     * Update multiple state values at once
     */
    update(updates) {
        Object.keys(updates).forEach(key => {
            this.set(key, updates[key]);
        });
    }

    /**
     * Notify listeners about state changes
     */
    notifyChange(key, newValue, oldValue) {
        document.dispatchEvent(new CustomEvent('state:changed', {
            detail: { key, newValue, oldValue }
        }));
    }

    /**
     * Reset state to initial values
     */
    reset() {
        this.data = {
            activeLayerId: null,
            activeGroupId: null,
            isDrawingMode: false,
            layerFeatures: {},
            drawnLayers: [],
            measurementMode: null,
            drawingActiveLayerId: null,
            continuousPointMode: false
        };
    }
}

// Export singleton instance
export const AppState = new AppStateManager();

// Export for backwards compatibility
export default AppState;
