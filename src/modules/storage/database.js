/**
 * Database Management Module
 * Handles SQLite database operations for persisting layers, groups, and features
 */

import initSqlJs from 'sql.js';

// Database instance
let db = null;
let SQL = null;

/**
 * Initialize the database
 */
export async function initDatabase() {
    try {
        console.log('🗄️ Initializing database...');

        // Initialize SQL.js - Use CDN for WASM file
        SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        // Try to load existing database from localStorage
        const savedDb = localStorage.getItem('gis_database');
        if (savedDb) {
            const uint8Array = new Uint8Array(JSON.parse(savedDb));
            db = new SQL.Database(uint8Array);
            console.log('✅ Existing database loaded');
        } else {
            // Create new database
            db = new SQL.Database();
            console.log('✅ New database created');
        }

        // Create tables if they don't exist
        createTables();

        console.log('✅ Database initialized successfully');
        return db;
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        console.warn('⚠️ Application will continue without database persistence');
        // Don't throw - let app continue without database
        return null;
    }
}

/**
 * Create database tables
 */
function createTables() {
    try {
        // Groups table
        db.run(`
            CREATE TABLE IF NOT EXISTS groups (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                position INTEGER NOT NULL,
                expanded INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Layers table
        db.run(`
            CREATE TABLE IF NOT EXISTS layers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                group_id TEXT NOT NULL,
                visible INTEGER DEFAULT 1,
                position INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
            )
        `);

        // Features table
        db.run(`
            CREATE TABLE IF NOT EXISTS features (
                id TEXT PRIMARY KEY,
                layer_id TEXT NOT NULL,
                type TEXT NOT NULL,
                geometry TEXT NOT NULL,
                properties TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (layer_id) REFERENCES layers(id) ON DELETE CASCADE
            )
        `);

        // Create indexes for better performance
        db.run('CREATE INDEX IF NOT EXISTS idx_layers_group ON layers(group_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_features_layer ON features(layer_id)');

        console.log('✅ Database tables created/verified');
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    }
}

/**
 * Save database to localStorage
 */
export function saveDatabase() {
    try {
        if (!db) {
            console.warn('⚠️ No database to save');
            return;
        }

        const data = db.export();
        const buffer = JSON.stringify(Array.from(data));
        localStorage.setItem('gis_database', buffer);
        console.log('💾 Database saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving database:', error);
    }
}

/**
 * Export database as file
 */
export function exportDatabase() {
    try {
        if (!db) {
            console.warn('⚠️ No database to export');
            return;
        }

        const data = db.export();
        const blob = new Blob([data], { type: 'application/x-sqlite3' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gis_database_${new Date().getTime()}.sqlite`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('📥 Database exported');
    } catch (error) {
        console.error('❌ Error exporting database:', error);
    }
}

/**
 * Import database from file
 */
export function importDatabase(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const uint8Array = new Uint8Array(e.target.result);
                db = new SQL.Database(uint8Array);
                saveDatabase();
                console.log('📤 Database imported');
                resolve(db);
            } catch (error) {
                console.error('❌ Error importing database:', error);
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// ==================== GROUP OPERATIONS ====================

/**
 * Create a new group
 */
export function createGroup(id, name, position) {
    if (!db) return false;
    try {
        db.run(
            'INSERT INTO groups (id, name, position) VALUES (?, ?, ?)',
            [id, name, position]
        );
        saveDatabase();
        console.log(`✅ Group created: ${id}`);
        return true;
    } catch (error) {
        console.error('❌ Error creating group:', error);
        return false;
    }
}

/**
 * Get all groups
 */
export function getAllGroups() {
    if (!db) return [];
    try {
        const stmt = db.prepare('SELECT * FROM groups ORDER BY position');
        const groups = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            groups.push({
                id: row.id,
                name: row.name,
                position: row.position,
                expanded: Boolean(row.expanded)
            });
        }
        stmt.free();
        return groups;
    } catch (error) {
        console.error('❌ Error getting groups:', error);
        return [];
    }
}

/**
 * Delete a group
 */
export function deleteGroup(id) {
    if (!db) return false;
    try {
        db.run('DELETE FROM groups WHERE id = ?', [id]);
        saveDatabase();
        console.log(`✅ Group deleted: ${id}`);
        return true;
    } catch (error) {
        console.error('❌ Error deleting group:', error);
        return false;
    }
}

/**
 * Update group expanded state
 */
export function updateGroupExpanded(id, expanded) {
    if (!db) return false;
    try {
        db.run('UPDATE groups SET expanded = ? WHERE id = ?', [expanded ? 1 : 0, id]);
        saveDatabase();
        return true;
    } catch (error) {
        console.error('❌ Error updating group:', error);
        return false;
    }
}

// ==================== LAYER OPERATIONS ====================

/**
 * Create a new layer
 */
export function createLayer(id, name, groupId, position) {
    if (!db) return false;
    try {
        db.run(
            'INSERT INTO layers (id, name, group_id, position) VALUES (?, ?, ?, ?)',
            [id, name, groupId, position]
        );
        saveDatabase();
        console.log(`✅ Layer created in DB: ${id}`);
        return true;
    } catch (error) {
        console.error('❌ Error creating layer:', error);
        return false;
    }
}

/**
 * Get all layers for a group
 */
export function getLayersByGroup(groupId) {
    if (!db) return [];
    try {
        const stmt = db.prepare('SELECT * FROM layers WHERE group_id = ? ORDER BY position');
        stmt.bind([groupId]);
        const layers = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            layers.push({
                id: row.id,
                name: row.name,
                groupId: row.group_id,
                visible: Boolean(row.visible),
                position: row.position
            });
        }
        stmt.free();
        return layers;
    } catch (error) {
        console.error('❌ Error getting layers:', error);
        return [];
    }
}

/**
 * Get all layers
 */
export function getAllLayers() {
    if (!db) return [];
    try {
        const stmt = db.prepare('SELECT * FROM layers ORDER BY position');
        const layers = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            layers.push({
                id: row.id,
                name: row.name,
                groupId: row.group_id,
                visible: Boolean(row.visible),
                position: row.position
            });
        }
        stmt.free();
        return layers;
    } catch (error) {
        console.error('❌ Error getting all layers:', error);
        return [];
    }
}

/**
 * Delete a layer
 */
export function deleteLayer(id) {
    if (!db) return false;
    try {
        db.run('DELETE FROM layers WHERE id = ?', [id]);
        saveDatabase();
        console.log(`✅ Layer deleted from DB: ${id}`);
        return true;
    } catch (error) {
        console.error('❌ Error deleting layer:', error);
        return false;
    }
}

/**
 * Update layer visibility
 */
export function updateLayerVisibility(id, visible) {
    if (!db) return false;
    try {
        db.run('UPDATE layers SET visible = ? WHERE id = ?', [visible ? 1 : 0, id]);
        saveDatabase();
        return true;
    } catch (error) {
        console.error('❌ Error updating layer visibility:', error);
        return false;
    }
}

// ==================== FEATURE OPERATIONS ====================

/**
 * Create a new feature
 */
export function createFeature(id, layerId, type, geometry, properties = {}) {
    if (!db) return false;
    try {
        const geometryJson = JSON.stringify(geometry);
        const propertiesJson = JSON.stringify(properties);

        db.run(
            'INSERT INTO features (id, layer_id, type, geometry, properties) VALUES (?, ?, ?, ?, ?)',
            [id, layerId, type, geometryJson, propertiesJson]
        );
        saveDatabase();
        console.log(`✅ Feature created in DB: ${id} for layer ${layerId}`);
        return true;
    } catch (error) {
        console.error('❌ Error creating feature:', error);
        return false;
    }
}

/**
 * Get all features for a layer
 */
export function getFeaturesByLayer(layerId) {
    if (!db) return [];
    try {
        const stmt = db.prepare('SELECT * FROM features WHERE layer_id = ?');
        stmt.bind([layerId]);
        const features = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            features.push({
                id: row.id,
                layerId: row.layer_id,
                type: row.type,
                geometry: JSON.parse(row.geometry),
                properties: JSON.parse(row.properties || '{}')
            });
        }
        stmt.free();
        return features;
    } catch (error) {
        console.error('❌ Error getting features:', error);
        return [];
    }
}

/**
 * Delete a feature
 */
export function deleteFeature(id) {
    if (!db) return false;
    try {
        db.run('DELETE FROM features WHERE id = ?', [id]);
        saveDatabase();
        console.log(`✅ Feature deleted from DB: ${id}`);
        return true;
    } catch (error) {
        console.error('❌ Error deleting feature:', error);
        return false;
    }
}

/**
 * Delete all features for a layer
 */
export function deleteFeaturesByLayer(layerId) {
    if (!db) return false;
    try {
        db.run('DELETE FROM features WHERE layer_id = ?', [layerId]);
        saveDatabase();
        console.log(`✅ All features deleted for layer: ${layerId}`);
        return true;
    } catch (error) {
        console.error('❌ Error deleting features:', error);
        return false;
    }
}

/**
 * Update feature properties
 */
export function updateFeatureProperties(id, properties) {
    if (!db) return false;
    try {
        const propertiesJson = JSON.stringify(properties);
        db.run('UPDATE features SET properties = ? WHERE id = ?', [propertiesJson, id]);
        saveDatabase();
        return true;
    } catch (error) {
        console.error('❌ Error updating feature properties:', error);
        return false;
    }
}

/**
 * Get database statistics
 */
export function getDatabaseStats() {
    if (!db) return { groups: 0, layers: 0, features: 0 };
    try {
        const stats = {};

        const groupCount = db.exec('SELECT COUNT(*) as count FROM groups');
        stats.groups = groupCount[0]?.values[0][0] || 0;

        const layerCount = db.exec('SELECT COUNT(*) as count FROM layers');
        stats.layers = layerCount[0]?.values[0][0] || 0;

        const featureCount = db.exec('SELECT COUNT(*) as count FROM features');
        stats.features = featureCount[0]?.values[0][0] || 0;

        return stats;
    } catch (error) {
        console.error('❌ Error getting database stats:', error);
        return { groups: 0, layers: 0, features: 0 };
    }
}

/**
 * Clear all data from database
 */
export function clearDatabase() {
    if (!db) return false;
    try {
        db.run('DELETE FROM features');
        db.run('DELETE FROM layers');
        db.run('DELETE FROM groups');
        saveDatabase();
        console.log('✅ Database cleared');
        return true;
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        return false;
    }
}

/**
 * Get database instance
 */
export function getDatabase() {
    return db;
}

// Export for convenience
export default {
    initDatabase,
    saveDatabase,
    exportDatabase,
    importDatabase,
    createGroup,
    getAllGroups,
    deleteGroup,
    updateGroupExpanded,
    createLayer,
    getLayersByGroup,
    getAllLayers,
    deleteLayer,
    updateLayerVisibility,
    createFeature,
    getFeaturesByLayer,
    deleteFeature,
    deleteFeaturesByLayer,
    updateFeatureProperties,
    getDatabaseStats,
    clearDatabase,
    getDatabase
};
