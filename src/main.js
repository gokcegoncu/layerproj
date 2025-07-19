/**
 * CBS Katman Yönetim Sistemi - Modern Modüler v4.0
 * 
 * Bu dosya ana uygulama mantığını içerir.
 * Leaflet.js tabanlı CBS uygulaması.
 */

// ===== GLOBAL VARIABLES =====
let map;
let drawnItems = L.featureGroup();
let currentTool = null;
let currentProjection = 'EPSG:4326';
let currentTheme = 'light';
let legendVisible = false;
let measurementTool = null;

// Layer ve grup yönetimi
let layerGroups = [];
let layers = [];
let layerFeatures = {};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('🚀 CBS Katman Yönetim Sistemi başlatılıyor...');
    
    // Initialize map
    initMap();
    
    // Setup coordinate system
    setupProjectionSystem();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize theme
    initializeTheme();
    
    // Show welcome message
    setTimeout(() => {
        showToast('CBS Katman Yönetim Sistemi hazır! 🗺️', 'success');
    }, 1000);
}

// ===== MAP INITIALIZATION =====
function initMap() {
    map = L.map('map').setView([39.9334, 32.8597], 6);
    
    // Add base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.addLayer(drawnItems);

    // Setup coordinate and scale display
    setupCoordinateDisplay();
    setupScaleDisplay();

    console.log('✅ Harita başarıyla yüklendi');
}

// ===== COORDINATE SYSTEM =====
function setupProjectionSystem() {
    if (typeof proj4 !== 'undefined') {
        // Define common Turkish projection systems
        proj4.defs('EPSG:5254', '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
        proj4.defs('EPSG:2320', '+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs');
        proj4.defs('EPSG:32635', '+proj=utm +zone=35 +datum=WGS84 +units=m +no_defs');
        proj4.defs('EPSG:32636', '+proj=utm +zone=36 +datum=WGS84 +units=m +no_defs');
    }
}

function setupCoordinateDisplay() {
    map.on('mousemove', function(e) {
        updateCoordinateDisplay(e.latlng);
    });
}

function updateCoordinateDisplay(latlng) {
    const coords = convertCoordinates(latlng, currentProjection);
    document.getElementById('coordinateX').textContent = `X: ${coords.x}`;
    document.getElementById('coordinateY').textContent = `Y: ${coords.y}`;
}

function convertCoordinates(latlng, targetProjection) {
    let x, y;
    
    switch(targetProjection) {
        case 'EPSG:4326': // WGS84
            x = latlng.lng.toFixed(6);
            y = latlng.lat.toFixed(6);
            break;
            
        case 'EPSG:3857': // Web Mercator
            if (typeof proj4 !== 'undefined') {
                const webMercator = proj4('EPSG:4326', 'EPSG:3857', [latlng.lng, latlng.lat]);
                x = webMercator[0].toFixed(2);
                y = webMercator[1].toFixed(2);
            } else {
                x = latlng.lng.toFixed(6);
                y = latlng.lat.toFixed(6);
            }
            break;
            
        default:
            if (typeof proj4 !== 'undefined') {
                try {
                    const converted = proj4('EPSG:4326', targetProjection, [latlng.lng, latlng.lat]);
                    x = converted[0].toFixed(2);
                    y = converted[1].toFixed(2);
                } catch (e) {
                    console.warn('Projeksiyon dönüşümü başarısız:', e);
                    x = latlng.lng.toFixed(6);
                    y = latlng.lat.toFixed(6);
                }
            } else {
                x = latlng.lng.toFixed(6);
                y = latlng.lat.toFixed(6);
            }
    }
    
    return { x, y };
}

function changeProjection() {
    const newProjection = document.getElementById('projectionSelect').value;
    currentProjection = newProjection;
    
    const center = map.getCenter();
    updateCoordinateDisplay(center);
    
    showToast(`Koordinat sistemi ${newProjection} olarak değiştirildi`, 'info');
}

// ===== SCALE DISPLAY =====
function setupScaleDisplay() {
    map.on('zoomend', updateScaleDisplay);
    map.on('moveend', updateScaleDisplay);
    updateScaleDisplay();
}

function updateScaleDisplay() {
    const zoom = map.getZoom();
    const center = map.getCenter();
    const scale = getScaleFromZoom(zoom, center.lat);
    
    document.getElementById('scaleText').textContent = `1:${Math.round(scale).toLocaleString()}`;
}

function getScaleFromZoom(zoom, latitude) {
    const earthCircumference = 40075016.686;
    const latRad = latitude * Math.PI / 180;
    const metersPerPixel = earthCircumference * Math.cos(latRad) / Math.pow(2, zoom + 8);
    const scale = metersPerPixel * 96 / 0.0254;
    return scale;
}

// ===== SCALE SELECTOR =====
function toggleScaleSelector(event) {
    event.stopPropagation();
    const selector = document.getElementById('scaleSelector');
    
    if (selector.classList.contains('show')) {
        selector.classList.remove('show');
    } else {
        const scaleText = document.getElementById('scaleText');
        const rect = scaleText.getBoundingClientRect();
        
        selector.style.left = rect.left + 'px';
        selector.style.top = (rect.bottom + 5) + 'px';
        selector.classList.add('show');
    }
}

function setFixedScale(scaleValue) {
    const center = map.getCenter();
    const exactZoom = getZoomFromScale(scaleValue, center.lat);
    
    map.setZoom(exactZoom);
    
    setTimeout(() => {
        const actualZoom = map.getZoom();
        const actualScale = getScaleFromZoom(actualZoom, center.lat);
        showToast(`Ölçek ayarlandı: 1:${Math.round(actualScale).toLocaleString()}`, 'success');
    }, 200);
    
    document.getElementById('scaleSelector').classList.remove('show');
}

function setDynamicScale() {
    document.getElementById('scaleSelector').classList.remove('show');
    showToast('Dinamik ölçek aktif', 'info');
}

function getZoomFromScale(targetScale, latitude) {
    const targetMetersPerPixel = targetScale * 0.0254 / 96;
    const earthCircumference = 40075016.686;
    const latRad = latitude * Math.PI / 180;
    const zoom = Math.log2(earthCircumference * Math.cos(latRad) / targetMetersPerPixel) - 8;
    return Math.max(1, Math.min(18, zoom));
}

// ===== THEME SYSTEM =====
function initializeTheme() {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('cbs-theme') || 'light';
    setTheme(savedTheme);
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
        themeToggle.title = theme === 'light' ? 'Karanlık Tema' : 'Aydınlık Tema';
    }
    
    // Save preference
    localStorage.setItem('cbs-theme', theme);
    
    showToast(`${theme === 'light' ? 'Aydınlık' : 'Karanlık'} tema aktif`, 'info');
}

// ===== LAYER MANAGEMENT =====
function toggleLayerFilter() {
    const panel = document.getElementById('searchFilterPanel');
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        document.getElementById('layerSearch').focus();
    }
}

function setFilterType(button, type) {
    document.querySelectorAll('.filter-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    applyFilter();
}

function applyFilter() {
    const searchTerm = document.getElementById('layerSearch').value.toLowerCase();
    const activeType = document.querySelector('.filter-type-btn.active').dataset.type;
    
    let hiddenCount = 0;
    document.querySelectorAll('.layer-item').forEach(item => {
        const layerName = item.querySelector('.layer-name').textContent.toLowerCase();
        const layerType = item.dataset.layerType || 'point';
        
        const matchesSearch = layerName.includes(searchTerm);
        const matchesType = activeType === 'all' || layerType === activeType;
        
        if (matchesSearch && matchesType) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
            hiddenCount++;
        }
    });
    
    if (hiddenCount > 0) {
        showToast(`${hiddenCount} katman gizlendi`, 'info');
    }
}

function clearFilter() {
    document.getElementById('layerSearch').value = '';
    document.querySelectorAll('.filter-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.filter-type-btn[data-type="all"]').classList.add('active');
    
    document.querySelectorAll('.layer-item').forEach(item => {
        item.style.display = 'flex';
    });
    
    showToast('Filtre temizlendi', 'info');
}

// ===== GROUP FUNCTIONS =====
function toggleGroup(element) {
    const groupItems = element.closest('.group-header').nextElementSibling;
    const icon = element;
    
    if (groupItems.classList.contains('collapsed')) {
        groupItems.classList.remove('collapsed');
        icon.textContent = '▼';
    } else {
        groupItems.classList.add('collapsed');
        icon.textContent = '▶';
    }
}

function expandAllGroups() {
    document.querySelectorAll('.group-items').forEach(items => {
        items.classList.remove('collapsed');
    });
    document.querySelectorAll('.group-icon').forEach(icon => {
        icon.textContent = '▼';
    });
    showToast('Tüm gruplar açıldı', 'info');
}

function collapseAllGroups() {
    document.querySelectorAll('.group-items').forEach(items => {
        items.classList.add('collapsed');
    });
    document.querySelectorAll('.group-icon').forEach(icon => {
        icon.textContent = '▶';
    });
    showToast('Tüm gruplar kapatıldı', 'info');
}

function selectGroup(element) {
    // Clear all selections
    document.querySelectorAll('.layer-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelectorAll('.group-header').forEach(header => {
        header.classList.remove('selected');
    });
    
    element.closest('.group-header').classList.add('selected');
    
    const groupId = element.closest('.layer-group').dataset.groupId;
    showToast(`Grup seçildi`, 'info');
}

function selectLayer(element) {
    document.querySelectorAll('.layer-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelectorAll('.group-header').forEach(header => {
        header.classList.remove('selected');
    });
    
    element.closest('.layer-item').classList.add('selected');
    
    const layerId = element.closest('.layer-item').dataset.layerId;
    showToast(`Katman seçildi: ${layerId}`, 'info');
}

function toggleAllLayersInGroup(event, checkbox) {
    event.stopPropagation();
    const groupItems = checkbox.closest('.layer-group').querySelector('.group-items');
    const layerCheckboxes = groupItems.querySelectorAll('.layer-visibility');
    
    layerCheckboxes.forEach(layerCheckbox => {
        layerCheckbox.checked = checkbox.checked;
    });
    
    const groupName = checkbox.closest('.layer-group').querySelector('.group-name').textContent;
    showToast(`${groupName} grubundaki katmanlar ${checkbox.checked ? 'açıldı' : 'kapatıldı'}`, 'info');
}

// ===== LAYER FUNCTIONS =====
function toggleLayerVisibility(layerId) {
    const checkbox = document.querySelector(`[data-layer-id="${layerId}"] .layer-visibility`);
    console.log(`Katman ${layerId} görünürlüğü: ${checkbox.checked}`);
    showToast(`${layerId} katmanı ${checkbox.checked ? 'gösterildi' : 'gizlendi'}`, 'info');
}

function toggleStyleMode(element) {
    const isDefault = element.classList.contains('default-mode');
    
    if (isDefault) {
        element.classList.remove('default-mode');
        element.classList.add('custom-mode');
        element.textContent = 'C';
        showToast('Özel stil moduna geçildi', 'success');
    } else {
        element.classList.remove('custom-mode');
        element.classList.add('default-mode');
        element.textContent = 'D';
        showToast('Varsayılan stil moduna geçildi', 'info');
    }
    
    if (!isDefault) {
        openStyleModal();
    }
}

function showLayerProperties(button) {
    const layerItem = button.closest('.layer-item');
    const layerId = layerItem.dataset.layerId;
    const layerName = layerItem.querySelector('.layer-name').textContent;
    
    showToast(`${layerName} özellikleri gösteriliyor`, 'info');
}

function zoomToLayer(button) {
    const layerItem = button.closest('.layer-item');
    const layerId = layerItem.dataset.layerId;
    const layerName = layerItem.querySelector('.layer-name').textContent;
    
    map.setView([39.9334, 32.8597], 8);
    showToast(`${layerName} katmanına zoom yapıldı`, 'success');
}

function editLayer(layerId) {
    showToast(`${layerId} katmanı düzenleme modunda`, 'info');
    openStyleModal(layerId);
}

function deleteLayer(button) {
    const layerItem = button.closest('.layer-item');
    const layerId = layerItem.dataset.layerId;
    const layerName = layerItem.querySelector('.layer-name').textContent;
    
    if (confirm(`"${layerName}" katmanını silmek istediğinizden emin misiniz?`)) {
        layerItem.remove();
        showToast(`${layerName} katmanı silindi`, 'success');
    }
}

// ===== DRAWING TOOLS =====
function startDrawing(type) {
    clearActiveTools();
    currentTool = type;
    
    const buttonIds = {
        'marker': 'pointBtn',
        'polyline': 'lineBtn',
        'polygon': 'polygonBtn',
        'rectangle': 'rectangleBtn',
        'circle': 'circleBtn'
    };
    
    if (buttonIds[type]) {
        document.getElementById(buttonIds[type]).classList.add('active');
        showToast(`${getDrawingTypeName(type)} çizimi başlatıldı`, 'info');
        
        // Enable drawing on map
        enableDrawingMode(type);
    }
}

function getDrawingTypeName(type) {
    const names = {
        'marker': 'Nokta',
        'polyline': 'Çizgi',
        'polygon': 'Poligon',
        'rectangle': 'Dikdörtgen',
        'circle': 'Daire'
    };
    return names[type] || type;
}

function enableDrawingMode(type) {
    map.on('click', function(e) {
        if (currentTool === type) {
            createDrawing(type, e.latlng);
        }
    });
}

function createDrawing(type, latlng) {
    let layer;
    
    switch(type) {
        case 'marker':
            layer = L.marker(latlng);
            break;
        case 'circle':
            layer = L.circle(latlng, {radius: 1000});
            break;
        default:
            showToast('Bu çizim tipi henüz desteklenmiyor', 'warning');
            return;
    }
    
    if (layer) {
        layer.addTo(drawnItems);
        showToast(`${getDrawingTypeName(type)} eklendi`, 'success');
        
        // Update drawings group
        updateDrawingsGroup();
    }
}

function updateDrawingsGroup() {
    const drawingsGroup = document.querySelector('[data-group-id="group-3"]');
    const groupItems = drawingsGroup.querySelector('.group-items');
    const groupCount = drawingsGroup.querySelector('.group-count');
    
    // Count actual drawn items
    const count = drawnItems.getLayers().length;
    groupCount.textContent = count;
    
    if (count > 0) {
        // Remove empty message
        const emptyMessage = groupItems.querySelector('.empty-group-message');
        if (emptyMessage) {
            emptyMessage.remove();
        }
    }
}

// ===== MEASUREMENT TOOLS =====
function startMeasurement(type) {
    clearActiveTools();
    currentTool = type;
    
    if (type === 'distance') {
        document.getElementById('distanceBtn').classList.add('active');
        showToast('Mesafe ölçümü başlatıldı - Harita üzerine tıklayın', 'info');
    } else if (type === 'area') {
        document.getElementById('areaBtn').classList.add('active');
        showToast('Alan ölçümü başlatıldı - Harita üzerine tıklayın', 'info');
    }
}

function clearMeasurements() {
    drawnItems.clearLayers();
    clearActiveTools();
    updateDrawingsGroup();
    showToast('Ölçümler ve çizimler temizlendi', 'success');
}

function openMeasurementSettings() {
    showToast('Ölçüm ayarları açılıyor', 'info');
}

// ===== EDIT/DELETE MODES =====
function toggleEditMode() {
    const editBtn = document.getElementById('editBtn');
    const isActive = editBtn.classList.contains('active');
    
    clearActiveTools();
    
    if (!isActive) {
        editBtn.classList.add('active');
        showToast('Düzenleme modu aktif', 'info');
    } else {
        showToast('Düzenleme modu kapatıldı', 'info');
    }
}

function toggleDeleteMode() {
    const deleteBtn = document.getElementById('deleteBtn');
    const isActive = deleteBtn.classList.contains('active');
    
    clearActiveTools();
    
    if (!isActive) {
        deleteBtn.classList.add('active');
        showToast('Silme modu aktif - Nesnelere tıklayın', 'warning');
    } else {
        showToast('Silme modu kapatıldı', 'info');
    }
}

// ===== VIEW FUNCTIONS =====
function zoomToExtent() {
    map.setView([39.9334, 32.8597], 6);
    showToast('Tüm katmanlara zoom yapıldı', 'success');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        showToast('Tam ekran modu açıldı', 'success');
    } else {
        document.exitFullscreen();
        showToast('Tam ekran modu kapatıldı', 'info');
    }
}

function toggleLegend() {
    const legend = document.getElementById('legendContainer');
    const legendBtn = document.getElementById('legendBtn');
    
    legendVisible = !legendVisible;
    
    if (legendVisible) {
        legend.style.display = 'block';
        legendBtn.classList.add('active');
        showToast('Lejant gösterildi', 'info');
    } else {
        legend.style.display = 'none';
        legendBtn.classList.remove('active');
        showToast('Lejant gizlendi', 'info');
    }
}

function toggleLegendContent() {
    const legendContent = document.getElementById('legendContent');
    const collapseBtn = document.getElementById('legendCollapseBtn');
    
    if (legendContent.classList.contains('collapsed')) {
        legendContent.classList.remove('collapsed');
        collapseBtn.textContent = '−';
    } else {
        legendContent.classList.add('collapsed');
        collapseBtn.textContent = '+';
    }
}

// ===== MODAL FUNCTIONS =====
function openStyleModal(layerId) {
    document.getElementById('styleModal').style.display = 'block';
    showToast('Stil ayarları açıldı', 'info');
}

function closeStyleModal() {
    document.getElementById('styleModal').style.display = 'none';
}

function switchStyleTab(tabName) {
    document.querySelectorAll('.style-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.style-content').forEach(content => content.style.display = 'none');
    
    event.target.classList.add('active');
    document.getElementById(tabName + 'Styles').style.display = 'block';
}

function applyStyles() {
    showToast('Stiller uygulandı', 'success');
    closeStyleModal();
}

function showCreateGroupModal() {
    document.getElementById('createGroupModal').style.display = 'block';
}

function closeCreateGroupModal() {
    document.getElementById('createGroupModal').style.display = 'none';
    document.getElementById('groupName').value = '';
    document.getElementById('groupDesc').value = '';
}

function createGroup() {
    const name = document.getElementById('groupName').value;
    const desc = document.getElementById('groupDesc').value;
    
    if (!name) {
        showToast('Grup adı gerekli!', 'error');
        return;
    }
    
    showToast(`"${name}" grubu oluşturuldu`, 'success');
    closeCreateGroupModal();
}

function showCreateLayerModal() {
    document.getElementById('createLayerModal').style.display = 'block';
}

function closeCreateLayerModal() {
    document.getElementById('createLayerModal').style.display = 'none';
    document.getElementById('layerName').value = '';
}

function createLayer() {
    const name = document.getElementById('layerName').value;
    const type = document.getElementById('layerType').value;
    const groupId = document.getElementById('layerGroup').value;
    
    if (!name) {
        showToast('Katman adı gerekli!', 'error');
        return;
    }
    
    showToast(`"${name}" katmanı oluşturuldu`, 'success');
    closeCreateLayerModal();
}

// ===== UTILITY FUNCTIONS =====
function clearActiveTools() {
    currentTool = null;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    
    // Remove map event listeners
    map.off('click');
}

function updateRangeValue(slider) {
    const valueDisplay = slider.parentNode.querySelector('.value-display');
    if (valueDisplay) {
        let value = slider.value;
        if (slider.name === 'opacity') {
            value += '%';
        }
        valueDisplay.textContent = value;
    }
}

// ===== TOAST NOTIFICATION SYSTEM =====
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close" onclick="closeToast(this)">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        if (toast.parentNode) {
            closeToast(toast.querySelector('.toast-close'));
        }
    }, 3000);
}

function closeToast(button) {
    const toast = button.closest('.toast');
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Modal close events
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
        
        const scaleSelector = document.getElementById('scaleSelector');
        if (scaleSelector && !e.target.closest('.scale-display')) {
            scaleSelector.classList.remove('show');
        }
    });
    
    // Keyboard events
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close all modals
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            
            // Close scale selector
            document.getElementById('scaleSelector').classList.remove('show');
            
            // Clear active tools
            clearActiveTools();
        }
    });
}

// ===== MESSAGE CONSOLE =====
function toggleMessageConsole() {
    showToast('Mesaj konsolu açılıyor', 'info');
    console.log('Message Console Toggle');
}

// ===== INITIALIZATION LOG =====
console.log('📋 CBS Katman Yönetim Sistemi v4.0 - Modüler JavaScript yüklendi');