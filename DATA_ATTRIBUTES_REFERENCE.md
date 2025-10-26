# Data Attributes Reference

Quick reference for all data attributes used in `src/index.html`.

## Event Types

### 1. data-action (Click Events)
Used for `onclick` handlers. Most common event type.

### 2. data-change (Change Events)
Used for `onchange` handlers on inputs, selects, checkboxes.

### 3. data-dblclick (Double-Click Events)
Used for `ondblclick` handlers.

## Common Data Actions

### Layer Panel Actions
- `toggle-layer-filter` - Toggle layer filter panel
- `show-create-group-modal` - Show group creation modal
- `show-create-layer-modal` - Show layer creation modal
- `expand-all-groups` - Expand all layer groups
- `collapse-all-groups` - Collapse all layer groups

### Group Actions
- `select-group` - Select a layer group
- `toggle-group` - Toggle group expansion
- `toggle-all-layers-in-group` - Toggle visibility of all layers in group

### Layer Actions
- `show-layer-properties` - Show layer properties dialog
- `open-style-modal` - Open style settings modal
- `open-layer-details` - Open layer details panel
- `delete-layer` - Delete a layer
- `open-query-modal` - Open query modal for layer
- `zoom-to-layer` - Zoom map to layer extent

### Drawing Tools (with parameters)
- `start-drawing:marker` - Start drawing point
- `start-drawing:polyline` - Start drawing line
- `start-drawing:polygon` - Start drawing polygon
- `start-drawing:rectangle` - Start drawing rectangle
- `start-drawing:circle` - Start drawing circle

### Measurement Tools (with parameters)
- `start-measurement:distance` - Start distance measurement
- `start-measurement:area` - Start area measurement
- `clear-measurements` - Clear all measurements
- `open-measurement-settings` - Open measurement settings

### Edit/Delete Tools
- `toggle-edit-mode` - Toggle edit mode
- `toggle-delete-mode` - Toggle delete mode

### View Tools
- `toggle-legend` - Toggle legend panel
- `zoom-to-extent` - Zoom to full extent
- `toggle-fullscreen` - Toggle fullscreen mode

### Legend Actions
- `toggle-legend-settings` - Toggle legend settings
- `toggle-legend-content` - Collapse/expand legend
- `close-legend` - Close legend panel

### Console Actions
- `toggle-console-dock` - Dock/undock message console
- `clear-message-console` - Clear console messages
- `toggle-console-minimize` - Minimize/maximize console
- `toggle-message-console` - Open/close console

### Modal Actions
- `close-create-modal` - Close create modal
- `confirm-create` - Confirm creation
- `close-style-modal` - Close style modal
- `switch-tab` - Switch modal tab
- `toggle-style-mode` - Toggle style mode

### Scale Actions
- `toggle-scale-selector` - Toggle scale selector
- `set-fixed-scale` - Set fixed scale (with parameter)
- `set-dynamic-scale` - Set dynamic scale

### Context Menu Actions
- `context-menu-action` - Generic context menu action
- `edit-feature-attributes` - Edit feature attributes
- `delete-feature-from-context` - Delete feature from context menu

### Attribute Editor Actions
- `close-attribute-editor` - Close attribute editor
- `save-feature-attributes` - Save feature attributes

## Common Data Changes

### Legend Settings
- `update-legend-content` - Update legend display

### Measurement Settings
- `update-measurement-settings` - Update measurement configuration

### Projection
- `change-projection` - Change map projection

### Message Filters
- `filter-messages` - Filter console messages

## Usage in JavaScript

### Basic Event Delegation

```javascript
// Click events
document.addEventListener('click', (e) => {
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;

  const [action, param] = actionEl.dataset.action.split(':');

  // Route to handlers...
});

// Change events
document.addEventListener('change', (e) => {
  const changeAction = e.target.dataset.change;
  if (!changeAction) return;

  // Route to handlers...
});

// Double-click events
document.addEventListener('dblclick', (e) => {
  const dblclickAction = e.target.dataset.dblclick;
  if (!dblclickAction) return;

  // Route to handlers...
});
```

### Parameter Extraction

Actions with parameters use `:` as delimiter:
- `data-action="start-drawing:polygon"` → action=`start-drawing`, param=`polygon`
- `data-action="start-measurement:distance"` → action=`start-measurement`, param=`distance`

```javascript
const [action, param] = actionString.split(':');
if (action === 'start-drawing') {
  startDrawing(param); // param = 'marker', 'polygon', etc.
}
```

## Statistics

- **Total data-action attributes:** 113
- **Total data-change attributes:** 31
- **Total data-dblclick attributes:** 1
- **Total inline handlers removed:** 145
- **Zero inline event handlers remaining** ✅

## File Location

**HTML File:** `/home/user/layerproj/src/index.html`
**Conversion Summary:** `/home/user/layerproj/HTML_CONVERSION_SUMMARY.md`
