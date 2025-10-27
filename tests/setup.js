/**
 * Test Environment Setup
 * Configures JSDOM and mocks for testing
 */

import { vi } from 'vitest';

// Mock Leaflet
global.L = {
  map: vi.fn(),
  tileLayer: vi.fn(),
  layerGroup: vi.fn(),
  featureGroup: vi.fn(),
  marker: vi.fn(),
  polyline: vi.fn(),
  polygon: vi.fn(),
  circle: vi.fn(),
  Control: {
    Draw: vi.fn(),
  },
  Draw: {
    Event: {
      CREATED: 'draw:created',
      EDITED: 'draw:edited',
      DELETED: 'draw:deleted',
    },
  },
  geoJSON: vi.fn(),
};

// Mock proj4
global.proj4 = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock initSqlJs
global.initSqlJs = vi.fn();

// Test lifecycle hooks
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});
