#!/bin/bash
# Add null checks to all database functions

sed -i 's/^export function deleteGroup(id) {/export function deleteGroup(id) {\n    if (!db) return false;/g' src/modules/storage/database.js
sed -i 's/^export function updateGroupExpanded(id, expanded) {/export function updateGroupExpanded(id, expanded) {\n    if (!db) return false;/g' src/modules/storage/database.js
sed -i 's/^export function createLayer(id, name, groupId, position) {/export function createLayer(id, name, groupId, position) {\n    if (!db) return false;/g' src/modules/storage/database.js
sed -i 's/^export function getLayersByGroup(groupId) {/export function getLayersByGroup(groupId) {\n    if (!db) return [];/g' src/modules/storage/database.js
sed -i 's/^export function getAllLayers() {/export function getAllLayers() {\n    if (!db) return [];/g' src/modules/storage/database.js
sed -i 's/^export function deleteLayer(id) {/export function deleteLayer(id) {\n    if (!db) return false;/g' src/modules/storage/database.js
sed -i 's/^export function updateLayerVisibility(id, visible) {/export function updateLayerVisibility(id, visible) {\n    if (!db) return false;/g' src/modules/storage/database.js
sed -i 's/^export function createFeature(id, layerId, type, geometry, properties = {}) {/export function createFeature(id, layerId, type, geometry, properties = {}) {\n    if (!db) return false;/g' src/modules/storage/database.js
sed -i 's/^export function getFeaturesByLayer(layerId) {/export function getFeaturesByLayer(layerId) {\n    if (!db) return [];/g' src/modules/storage/database.js
sed -i 's/^export function deleteFeature(id) {/export function deleteFeature(id) {\n    if (!db) return false;/g' src/modules/storage/database.js
sed -i 's/^export function deleteFeaturesByLayer(layerId) {/export function deleteFeaturesByLayer(layerId) {\n    if (!db) return false;/g' src/modules/storage/database.js
sed -i 's/^export function updateFeatureProperties(id, properties) {/export function updateFeatureProperties(id, properties) {\n    if (!db) return false;/g' src/modules/storage/database.js
sed -i 's/^export function getDatabaseStats() {/export function getDatabaseStats() {\n    if (!db) return { groups: 0, layers: 0, features: 0 };/g' src/modules/storage/database.js
sed -i 's/^export function clearDatabase() {/export function clearDatabase() {\n    if (!db) return false;/g' src/modules/storage/database.js

