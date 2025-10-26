/**
 * Configuration Constants and System Defaults
 * Contains all configuration values, system defaults, and icon library
 */

/**
 * Application configuration constants
 */
export const CONFIG = {
    MAP_CENTER: [41.0082, 28.9784],
    DEFAULT_ZOOM: 10,
    MAX_ZOOM: 19,
    DEBOUNCE_DELAY: 150,
    THROTTLE_DELAY: 100,
    TOAST_DURATION: 3000,
    AUTOSAVE_INTERVAL: 30000
};

/**
 * System default styles for different geometry types
 */
export const SYSTEM_DEFAULTS = {
    point: {
        color: "#ff0000",
        size: 8,
        shape: "circle",
        opacity: 100,
        styleType: "custom"
    },
    line: {
        color: "#ff7800",
        width: 3,
        opacity: 100,
        type: "solid"
    },
    polygon: {
        fillColor: "#3388ff",
        fillOpacity: 50,
        strokeColor: "#000000",
        strokeWidth: 1,
        strokeOpacity: 100,
        strokeType: "solid"
    }
};

/**
 * Icon library for UI elements
 */
export const ICON_LIBRARY = {
    // Geometry types
    point: { unicode: "📍", name: "Nokta", color: "#e74c3c" },
    line: { unicode: "📏", name: "Çizgi", color: "#f39c12" },
    polygon: { unicode: "⬟", name: "Poligon", color: "#3498db" },
    rectangle: { unicode: "⬜", name: "Dikdörtgen", color: "#9b59b6" },
    circle: { unicode: "⭕", name: "Daire", color: "#e67e22" },

    // Tools - Measurement
    measureDistance: { unicode: "📏", name: "Mesafe Ölç", color: "#2ecc71" },
    measureArea: { unicode: "⬟", name: "Alan Ölç", color: "#3498db" },
    clearMeasurements: { unicode: "🗑️", name: "Ölçümleri Temizle", color: "#e74c3c" },

    // Tools - Editing
    edit: { unicode: "✏️", name: "Düzenle", color: "#9b59b6" },
    delete: { unicode: "🗑️", name: "Sil", color: "#e74c3c" },
    settings: { unicode: "⚙️", name: "Ayarlar", color: "#34495e" },

    // Tools - View
    zoom: { unicode: "🔍", name: "Zoom", color: "#2ecc71" },
    zoomExtent: { unicode: "🔍", name: "Tümüne Zoom", color: "#2ecc71" },
    fullscreen: { unicode: "⛶", name: "Tam Ekran", color: "#34495e" },
    legend: { unicode: "📋", name: "Lejant", color: "#7f8c8d" },

    // Status indicators
    visible: { unicode: "👁️", name: "Görünür", color: "#2ecc71" },
    hidden: { unicode: "👁️‍🗨️", name: "Gizli", color: "#95a5a6" },
    locked: { unicode: "🔒", name: "Kilitli", color: "#e67e22" },
    unlocked: { unicode: "🔓", name: "Açık", color: "#2ecc71" },

    // Panel and management
    layers: { unicode: "🗂️", name: "Katmanlar", color: "#7f8c8d" },
    group: { unicode: "📁", name: "Grup", color: "#f39c12" },
    layer: { unicode: "📋", name: "Katman", color: "#3498db" },
    save: { unicode: "💾", name: "Kaydet", color: "#2ecc71" },
    download: { unicode: "📥", name: "İndir", color: "#3498db" },
    upload: { unicode: "📤", name: "Yükle", color: "#e67e22" },
    close: { unicode: "✕", name: "Kapat", color: "#e74c3c" },

    // Categories
    mixed: { unicode: "🗂️", name: "Karma", color: "#7f8c8d" }
};

/**
 * Icon utility functions
 */
export const IconUtils = {
    /**
     * Get icon data by type
     */
    getIcon(type) {
        return ICON_LIBRARY[type] || ICON_LIBRARY.mixed;
    },

    /**
     * Create an icon DOM element
     */
    createIconElement(type, size = '14px', extraClass = '') {
        const iconData = this.getIcon(type);
        const span = document.createElement('span');
        span.textContent = iconData.unicode;
        span.style.fontSize = size;
        span.style.color = iconData.color;
        span.title = iconData.name;
        if (extraClass) span.className = extraClass;
        return span;
    },

    /**
     * Create icon HTML string
     */
    createIconHtml(type, size = '14px') {
        const iconData = this.getIcon(type);
        return `<span style="font-size: ${size}; color: ${iconData.color};" title="${iconData.name}">${iconData.unicode}</span>`;
    }
};

/**
 * Random names for testing/demo purposes
 */
export const RANDOM_NAMES = {
    points: [
        "İstanbul Üniversitesi", "Galata Kulesi", "Topkapı Sarayı", "Ayasofya", "Kapalıçarşı",
        "Dolmabahçe Sarayı", "Beyazıt Kulesi", "Şişli Merkez", "Kadıköy İskelesi", "Üsküdar Meydanı",
        "Beşiktaş Merkezi", "Taksim Meydanı", "Eminönü İskelesi", "Bakırköy Merkez", "Kartal Meydanı"
    ],
    lines: [
        "Boğaziçi Köprüsü", "Fatih Sultan Mehmet Köprüsü", "Yavuz Sultan Selim Köprüsü",
        "D-100 Karayolu", "TEM Otoyolu", "Sahil Yolu", "İstiklal Caddesi", "Bağdat Caddesi",
        "Barbaros Bulvarı", "Atatürk Bulvarı", "Kennedy Caddesi", "Büyükdere Caddesi",
        "Maslak Yolu", "E-5 Karayolu", "Çevre Yolu"
    ],
    polygons: [
        "Gülhane Parkı", "Emirgan Korusu", "Yıldız Parkı", "Maçka Parkı", "Fenerbahçe Parkı",
        "Sultanahmet Meydanı", "Taksim Gezi Parkı", "Büyükada", "Heybeliada", "Kınalıada",
        "Florya Sahili", "Caddebostan Sahili", "Yeşilköy Sahili", "Kilyos Sahili", "Şile Sahili"
    ]
};
