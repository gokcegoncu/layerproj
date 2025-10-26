/**
 * Test setup file for Vitest
 */

import { beforeAll, afterAll, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup JSDOM for browser environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;

// Mock Leaflet
global.L = {
  map: () => ({
    setView: () => {},
    addLayer: () => {},
    removeLayer: () => {},
    on: () => {},
    off: () => {},
  }),
  tileLayer: () => ({
    addTo: () => {},
  }),
  layerGroup: () => ({
    addTo: () => {},
    clearLayers: () => {},
  }),
  marker: () => ({
    addTo: () => {},
    bindPopup: () => {},
  }),
  polyline: () => ({
    addTo: () => {},
    bindPopup: () => {},
  }),
  polygon: () => ({
    addTo: () => {},
    bindPopup: () => {},
  }),
};

// Mock localStorage
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

beforeAll(() => {
  console.log('🧪 Test environment initialized');
});

afterEach(() => {
  // Clear localStorage after each test
  global.localStorage.clear();
});

afterAll(() => {
  console.log('✅ Test environment cleaned up');
});
