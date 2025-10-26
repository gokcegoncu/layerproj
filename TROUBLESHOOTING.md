# 🔧 Troubleshooting Guide - GIS Application

## Issue
The main application at `http://localhost:3000/` is not loading properly (map not visible, buttons not working), while test.html works fine.

## What I've Done

### 1. Fixed Vite Configuration
Added sql.js exclusion from dependency pre-bundling in `vite.config.js`:
```javascript
optimizeDeps: {
  exclude: ['sql.js'],
}
```
This is necessary because sql.js is a WebAssembly package that needs special handling.

### 2. Created Test Files
Created three diagnostic test files:

#### a) `/test.html` (Root level - Already exists)
- ✅ This works!
- Simple Leaflet test without modules
- Proves Leaflet and CDNs work fine

#### b) `/src/test-modules.html`
- Tests module loading step by step
- Access at: `http://localhost:3000/test-modules.html`
- Shows which specific module fails to load

#### c) `/src/simple-test.html`
- Tests the app WITHOUT database
- Access at: `http://localhost:3000/simple-test.html`
- Proves whether database is the issue

### 3. Made Database Completely Optional
The main app (main.js) already wraps database init in try-catch, so it should work even if database fails.

## Test Instructions

### Step 1: Test Simple App (No Database)
1. Access `http://localhost:3000/simple-test.html`
2. Check the console in the top-right corner
3. **Expected result**: Map should load and work
4. **If it works**: Database was the issue
5. **If it fails**: Module loading is the issue

### Step 2: Test Module Loading
1. Access `http://localhost:3000/test-modules.html`
2. Watch the logs on the page
3. Find which test fails (Test 1, 2, 3, 4, or 5)
4. **Report back**: Which test shows an error?

### Step 3: Check Main App Console
1. Access `http://localhost:3000/`
2. Open browser DevTools (F12)
3. Go to Console tab
4. **Report back**: Copy all error messages (especially red errors)

### Step 4: Check Network Tab
1. Stay on `http://localhost:3000/`
2. In DevTools, go to Network tab
3. Refresh the page (Ctrl+F5)
4. **Look for**: Any failed requests (red status codes)
5. **Report back**: Which files failed to load?

## Common Issues and Solutions

### Issue 1: sql.js Import Error
**Symptom**: Error like "Cannot find module 'sql.js'" or WASM loading failed

**Solution**:
```bash
npm install sql.js
```
Then restart dev server:
```bash
npm run dev
```

### Issue 2: CDN Libraries Not Loading
**Symptom**: Console error "L is not defined" or "proj4 is not defined"

**Solution**: Check internet connection and firewall settings

### Issue 3: Module Loading Timeout
**Symptom**: Page appears blank, no console errors, just hangs

**Solution**: The app is waiting for external libraries. Check if:
- Leaflet CDN is accessible
- proj4 CDN is accessible
- leaflet-draw CDN is accessible

### Issue 4: CORS or CSP Issues
**Symptom**: Console shows CORS or Content Security Policy errors

**Solution**: This shouldn't happen with Vite dev server, but if it does, check browser security settings

## Quick Diagnostic Commands

Run these in your browser console on `http://localhost:3000/`:

```javascript
// Check if Leaflet loaded
console.log('Leaflet:', typeof L !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');

// Check if Leaflet.Draw loaded
console.log('Leaflet.Draw:', typeof L.Draw !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');

// Check if proj4 loaded
console.log('proj4:', typeof proj4 !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');

// Check if map initialized
console.log('Map:', window.map ? '✅ Initialized' : '❌ Not initialized');

// Check if database loaded
console.log('Database:', window.DB ? '✅ Module loaded' : '❌ Module not loaded');
```

## Debug Workflow

```
┌─────────────────────────────────────┐
│  test.html works?                   │
│  (Simple Leaflet, no modules)       │
└───────────┬─────────────────────────┘
            │
    ┌───────┴────────┐
    │                │
   YES              NO
    │                │
    │        CDN/Network Issue
    │        Check internet
    │
    ▼
┌─────────────────────────────────────┐
│  simple-test.html works?            │
│  (Modules, no database)             │
└───────────┬─────────────────────────┘
            │
    ┌───────┴────────┐
    │                │
   YES              NO
    │                │
    │        Module Loading Issue
    │        Check test-modules.html
    │
    ▼
┌─────────────────────────────────────┐
│  Database is the issue!             │
│  Check sql.js installation          │
│  Check WASM loading in console      │
└─────────────────────────────────────┘
```

## File Locations

- Main app: `http://localhost:3000/`
- Simple test (no DB): `http://localhost:3000/simple-test.html`
- Module test: `http://localhost:3000/test-modules.html`
- Original test: `file:///home/user/layerproj/test.html`
- Debug page: `http://localhost:3000/debug.html` (if needed)

## Expected Console Output (Working)

When everything works, you should see:
```
🚀 Initializing CBS GIS Application...
🗄️ Initializing database...
✅ Database ready
📍 Initializing map...
🗺️ Setting up coordinate system...
📏 Initializing measurement tools...
💬 Initializing message console...
✏️ Setting up drawing controls...
🎯 Setting up event listeners...
📂 Loading data from database...
Found 0 groups in database
✅ Loaded 0 groups, 0 layers, 0 features
🎨 Initializing UI components...
✅ Application initialized successfully!
```

## If All Else Fails

If none of the tests work:

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Try different browser**: Chrome, Firefox, Edge
3. **Check if dev server is actually running**: `curl http://localhost:3000/`
4. **Restart dev server**: Kill and run `npm run dev` again
5. **Check npm packages**: Run `npm install` to ensure all packages are installed

## Next Steps

After running the tests above, report back with:
1. ✅ or ❌ for simple-test.html
2. ✅ or ❌ for test-modules.html (and which test failed)
3. Console error messages from main app
4. Network tab failed requests

This will help identify the exact issue!
