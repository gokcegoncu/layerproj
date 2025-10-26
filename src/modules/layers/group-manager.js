/**
 * Group Management Module
 * Handles group CRUD operations, expansion/collapse, and visibility
 */

let activeGroupId = null;

/**
 * Create a new group
 * @param {string} groupName - Name of the group
 * @returns {string|null} Group ID or null if failed
 */
export function createGroup(groupName) {
    try {
        const groupContainer = document.querySelector('#layerList');
        if (!groupContainer) {
            console.error('Layer list container not found');
            return null;
        }

        const layerGroup = document.createElement('div');
        layerGroup.className = 'layer-group';

        const groupId = 'group-' + Date.now();
        layerGroup.setAttribute('data-group-id', groupId);

        layerGroup.innerHTML = `
            <div class="group-header">
                <div class="group-visibility-area" title="Tüm katmanları aç/kapat">
                    <input type="checkbox" class="group-visibility-checkbox" checked>
                </div>
                <div class="group-select-area">
                    <span class="group-name">${groupName}</span>
                    <span class="group-count">0</span>
                </div>
                <div class="group-toggle-area">
                    <span class="group-icon">▼</span>
                </div>
            </div>
            <div class="group-items">
                <!-- Katmanlar buraya eklenecek -->
            </div>
        `;

        groupContainer.appendChild(layerGroup);

        // Select the new group
        selectGroup(layerGroup.querySelector('.group-select-area'));

        console.log(`Group created: ${groupId}`);
        return groupId;
    } catch (error) {
        console.error('Error creating group:', error);
        return null;
    }
}

/**
 * Select a group
 * @param {HTMLElement} selectArea - Group select area element
 */
export function selectGroup(selectArea) {
    try {
        // Clear all group selections
        document.querySelectorAll('.group-header').forEach(h => {
            h.classList.remove('selected');
        });

        // Select this group
        const header = selectArea.closest('.group-header');
        header.classList.add('selected');

        // Update active group ID
        activeGroupId = header.closest('.layer-group').getAttribute('data-group-id');

        console.log(`Group selected: ${activeGroupId}`);
    } catch (error) {
        console.error('Error selecting group:', error);
    }
}

/**
 * Clear group selection
 */
export function clearGroupSelection() {
    document.querySelectorAll('.group-header').forEach(h => {
        h.classList.remove('selected');
    });

    activeGroupId = null;
}

/**
 * Toggle group expansion (expand/collapse)
 * @param {HTMLElement} toggleArea - Group toggle area element
 */
export function toggleGroup(toggleArea) {
    try {
        const header = toggleArea.closest('.group-header');
        const icon = toggleArea.querySelector('.group-icon');
        const items = header.nextElementSibling;

        if (items.classList.contains('collapsed')) {
            items.classList.remove('collapsed');
            icon.classList.remove('collapsed');
            icon.textContent = '▼';
        } else {
            items.classList.add('collapsed');
            icon.classList.add('collapsed');
            icon.textContent = '▶';
        }
    } catch (error) {
        console.error('Error toggling group:', error);
    }
}

/**
 * Expand a group
 * @param {string} groupId - Group ID
 */
export function expandGroup(groupId) {
    try {
        const group = document.querySelector(`[data-group-id="${groupId}"]`);
        if (!group) return;

        const items = group.querySelector('.group-items');
        const icon = group.querySelector('.group-icon');

        items.classList.remove('collapsed');
        icon.classList.remove('collapsed');
        icon.textContent = '▼';
    } catch (error) {
        console.error('Error expanding group:', error);
    }
}

/**
 * Collapse a group
 * @param {string} groupId - Group ID
 */
export function collapseGroup(groupId) {
    try {
        const group = document.querySelector(`[data-group-id="${groupId}"]`);
        if (!group) return;

        const items = group.querySelector('.group-items');
        const icon = group.querySelector('.group-icon');

        items.classList.add('collapsed');
        icon.classList.add('collapsed');
        icon.textContent = '▶';
    } catch (error) {
        console.error('Error collapsing group:', error);
    }
}

/**
 * Expand all groups
 */
export function expandAllGroups() {
    try {
        document.querySelectorAll('.layer-group').forEach(group => {
            const items = group.querySelector('.group-items');
            const icon = group.querySelector('.group-icon');

            items.classList.remove('collapsed');
            icon.classList.remove('collapsed');
            icon.textContent = '▼';
        });

        console.log('All groups expanded');
    } catch (error) {
        console.error('Error expanding all groups:', error);
    }
}

/**
 * Collapse all groups
 */
export function collapseAllGroups() {
    try {
        document.querySelectorAll('.layer-group').forEach(group => {
            const items = group.querySelector('.group-items');
            const icon = group.querySelector('.group-icon');

            items.classList.add('collapsed');
            icon.classList.add('collapsed');
            icon.textContent = '▶';
        });

        console.log('All groups collapsed');
    } catch (error) {
        console.error('Error collapsing all groups:', error);
    }
}

/**
 * Update group layer count
 * @param {HTMLElement|string} groupElementOrId - Group element or ID
 */
export function updateGroupLayerCount(groupElementOrId) {
    try {
        let groupElement;

        if (typeof groupElementOrId === 'string') {
            groupElement = document.querySelector(`[data-group-id="${groupElementOrId}"]`);
        } else {
            groupElement = groupElementOrId;
        }

        if (!groupElement) return;

        const groupItems = groupElement.querySelector('.group-items');
        const count = groupItems.querySelectorAll('.layer-item').length;
        const countElement = groupElement.querySelector('.group-count');

        if (countElement) {
            countElement.textContent = count;
        }
    } catch (error) {
        console.error('Error updating group layer count:', error);
    }
}

/**
 * Update all group counts
 */
export function updateAllGroupCounts() {
    try {
        document.querySelectorAll('.layer-group').forEach(group => {
            updateGroupLayerCount(group);
        });
    } catch (error) {
        console.error('Error updating all group counts:', error);
    }
}

/**
 * Toggle all layers in a group
 * @param {Event} event - Event object
 * @param {HTMLElement} checkbox - Checkbox element
 */
export function toggleAllLayersInGroup(event, checkbox) {
    try {
        event.stopPropagation();

        const group = checkbox.closest('.layer-group');
        const items = group.querySelector('.group-items');
        const layerCheckboxes = items.querySelectorAll('.layer-visibility');

        const newVisibility = checkbox.checked;

        layerCheckboxes.forEach(cb => {
            cb.checked = newVisibility;
            const layerId = cb.closest('.layer-item').getAttribute('data-layer-id');
            // Trigger visibility change event
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        });

        console.log(`All layers in group ${newVisibility ? 'shown' : 'hidden'}`);
    } catch (error) {
        console.error('Error toggling all layers in group:', error);
    }
}

/**
 * Get group layers
 * @param {string} groupId - Group ID
 * @returns {Array} Array of layer elements
 */
export function getGroupLayers(groupId) {
    try {
        const group = document.querySelector(`[data-group-id="${groupId}"]`);
        if (!group) return [];

        const groupItems = group.querySelector('.group-items');
        return Array.from(groupItems.querySelectorAll('.layer-item'));
    } catch (error) {
        console.error('Error getting group layers:', error);
        return [];
    }
}

/**
 * Check if group is expanded
 * @param {string} groupId - Group ID
 * @returns {boolean} True if expanded
 */
export function isGroupExpanded(groupId) {
    try {
        const group = document.querySelector(`[data-group-id="${groupId}"]`);
        if (!group) return false;

        const items = group.querySelector('.group-items');
        return !items.classList.contains('collapsed');
    } catch (error) {
        console.error('Error checking group expansion:', error);
        return false;
    }
}

/**
 * Get active group ID
 * @returns {string|null} Active group ID
 */
export function getActiveGroupId() {
    return activeGroupId;
}

/**
 * Delete a group
 * @param {string} groupId - Group ID
 * @returns {boolean} Success status
 */
export function deleteGroup(groupId) {
    try {
        const group = document.querySelector(`[data-group-id="${groupId}"]`);
        if (!group) return false;

        // Check if group has layers
        const layerCount = group.querySelectorAll('.layer-item').length;
        if (layerCount > 0) {
            const confirmed = confirm(`Bu grup ${layerCount} katman içeriyor. Silmek istediğinizden emin misiniz?`);
            if (!confirmed) return false;
        }

        // Remove group
        group.remove();

        // Clear active group if this was it
        if (activeGroupId === groupId) {
            activeGroupId = null;
        }

        console.log(`Group deleted: ${groupId}`);
        return true;
    } catch (error) {
        console.error('Error deleting group:', error);
        return false;
    }
}

/**
 * Rename a group
 * @param {string} groupId - Group ID
 * @param {string} newName - New group name
 * @returns {boolean} Success status
 */
export function renameGroup(groupId, newName) {
    try {
        const group = document.querySelector(`[data-group-id="${groupId}"]`);
        if (!group) return false;

        const nameElement = group.querySelector('.group-name');
        if (nameElement) {
            nameElement.textContent = newName;
        }

        console.log(`Group renamed: ${groupId} to ${newName}`);
        return true;
    } catch (error) {
        console.error('Error renaming group:', error);
        return false;
    }
}

/**
 * Move layer to group
 * @param {string} layerId - Layer ID
 * @param {string} targetGroupId - Target group ID
 * @returns {boolean} Success status
 */
export function moveLayerToGroup(layerId, targetGroupId) {
    try {
        const layerElement = document.querySelector(`[data-layer-id="${layerId}"]`);
        const targetGroup = document.querySelector(`[data-group-id="${targetGroupId}"]`);

        if (!layerElement || !targetGroup) return false;

        // Remove from current group
        const currentGroup = layerElement.closest('.layer-group');
        layerElement.remove();

        // Add to target group
        const targetGroupItems = targetGroup.querySelector('.group-items');
        targetGroupItems.appendChild(layerElement);

        // Update counts
        if (currentGroup) updateGroupLayerCount(currentGroup);
        updateGroupLayerCount(targetGroup);

        console.log(`Layer ${layerId} moved to group ${targetGroupId}`);
        return true;
    } catch (error) {
        console.error('Error moving layer to group:', error);
        return false;
    }
}
