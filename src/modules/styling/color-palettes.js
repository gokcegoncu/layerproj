/**
 * Color Palettes for Thematic Mapping
 * Professional color ramps (ColorBrewer, Matplotlib, etc.)
 */

/**
 * QGIS-style color palettes
 */
export const ColorPalettes = {
    // Sequential (single-direction - low to high values)
    sequential: {
        // ColorBrewer Sequential
        'Blues': ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
        'Greens': ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
        'Reds': ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
        'Oranges': ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
        'Purples': ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
        'Greys': ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],

        // Matplotlib-inspired
        'Viridis': ['#440154', '#482677', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'],
        'Plasma': ['#0d0887', '#41049d', '#6a00a8', '#8f0da4', '#b12a90', '#cc4778', '#e16462', '#f1844b', '#fca636', '#fcfdbf'],
        'Inferno': ['#000004', '#1b0c41', '#4a0c6b', '#781c6d', '#a52c60', '#cd4344', '#ed6925', '#fb9b06', '#f7d03c', '#fcffa4'],
        'Magma': ['#000004', '#140e36', '#3b0f70', '#641a80', '#8c2981', '#b63679', '#de4968', '#f66e5b', '#fe9f6d', '#fece91', '#fcfdbf'],
        'Cividis': ['#00204d', '#00306e', '#1c4487', '#46599d', '#6e6eae', '#9684ba', '#bc9bc2', '#dfb3c6', '#ffcdc9'],

        // Custom GIS
        'YlOrRd': ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
        'YlGnBu': ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58']
    },

    // Diverging (two-directional - from center to both sides)
    diverging: {
        'RdYlGn': ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
        'RdYlBu': ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
        'RdBu': ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
        'BrBG': ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
        'PiYG': ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
        'PRGn': ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
        'Spectral': ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2']
    },

    // Qualitative (categorical - independent categories)
    qualitative: {
        'Set1': ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
        'Set2': ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
        'Set3': ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
        'Pastel1': ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],
        'Pastel2': ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
        'Dark2': ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
        'Accent': ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
        'Paired': ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928']
    },

    // Heatmap (special for heat mapping)
    heatmap: {
        'Hot': ['#000000', '#330000', '#660000', '#990000', '#cc0000', '#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc00', '#ffff00'],
        'Cool': ['#00ffff', '#00ccff', '#0099ff', '#0066ff', '#0033ff', '#0000ff', '#0000cc', '#000099', '#000066', '#000033', '#000000'],
        'Rainbow': ['#9400d3', '#4b00ff', '#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff7f00', '#ff0000'],
        'Turbo': ['#30123b', '#4145ab', '#4675ed', '#39a2fc', '#1bcfd4', '#24eca6', '#61fc6c', '#a4fc3b', '#d1e834', '#f3c63a', '#fe9b2d', '#f36315', '#d93806', '#b11901', '#7a0402']
    }
};

/**
 * Get color palette by name and type
 * @param {string} type - Palette type (sequential, diverging, qualitative, heatmap)
 * @param {string} name - Palette name
 * @returns {Array<string>} Array of color values
 */
export function getColorPalette(type, name) {
    if (ColorPalettes[type] && ColorPalettes[type][name]) {
        return ColorPalettes[type][name];
    }
    return ColorPalettes.sequential.Viridis; // Default
}

/**
 * Get color from palette by index
 * @param {Array<string>} palette - Color palette array
 * @param {number} index - Index (will be normalized to palette length)
 * @returns {string} Color value
 */
export function getColorFromPalette(palette, index) {
    const normalizedIndex = Math.min(Math.max(0, index), palette.length - 1);
    return palette[normalizedIndex];
}

/**
 * Generate interpolated color palette
 * @param {Array<string>} palette - Base color palette
 * @param {number} steps - Number of steps to generate
 * @returns {Array<string>} Interpolated palette
 */
export function interpolatePalette(palette, steps) {
    if (steps <= palette.length) {
        return palette.slice(0, steps);
    }

    // Simple linear interpolation
    const result = [];
    const ratio = (palette.length - 1) / (steps - 1);

    for (let i = 0; i < steps; i++) {
        const index = i * ratio;
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;

        if (lower === upper) {
            result.push(palette[lower]);
        } else {
            result.push(interpolateColor(palette[lower], palette[upper], weight));
        }
    }

    return result;
}

/**
 * Interpolate between two colors
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @param {number} weight - Interpolation weight (0-1)
 * @returns {string} Interpolated color (hex)
 */
function interpolateColor(color1, color2, weight) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * weight);
    const g = Math.round(c1.g + (c2.g - c1.g) * weight);
    const b = Math.round(c1.b + (c2.b - c1.b) * weight);

    return rgbToHex(r, g, b);
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
