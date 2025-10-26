# CBS Katman Yönetim Sistemi - Geliştirici Dökümanı

## 📋 Proje Yapısı

```
layerproj/
├── src/                          # Kaynak kodlar
│   ├── index.html               # Ana HTML dosyası (modern, temiz)
│   ├── main.js                  # Uygulama giriş noktası
│   ├── modules/                 # Modüler JavaScript kodları
│   │   ├── core/               # Temel modüller
│   │   │   ├── config.js       # Konfigürasyon
│   │   │   ├── state.js        # Durum yönetimi
│   │   │   └── map.js          # Harita başlatma
│   │   ├── layers/             # Katman yönetimi
│   │   │   ├── layer-manager.js
│   │   │   └── group-manager.js
│   │   ├── drawing/            # Çizim araçları
│   │   │   ├── drawing-tools.js
│   │   │   └── geometry-handlers.js
│   │   ├── styling/            # Stil yönetimi
│   │   │   ├── style-manager.js
│   │   │   ├── categorized-style.js
│   │   │   ├── graduated-style.js
│   │   │   ├── heatmap-style.js
│   │   │   └── color-palettes.js
│   │   ├── ui/                 # UI bileşenleri
│   │   │   ├── modals.js
│   │   │   ├── console.js
│   │   │   ├── legend.js
│   │   │   └── notifications.js
│   │   ├── tools/              # Araçlar
│   │   │   ├── measurement.js
│   │   │   └── coordinates.js
│   │   └── utils/              # Yardımcı fonksiyonlar
│   │       ├── validation.js
│   │       ├── security.js
│   │       ├── helpers.js
│   │       └── dom.js
│   └── styles/                 # Modüler CSS dosyaları
│       ├── main.css            # Ana CSS (tüm modülleri import eder)
│       ├── variables.css       # CSS değişkenleri
│       ├── reset.css           # Global reset
│       ├── layout.css          # Layout stilleri
│       ├── components.css      # Bileşen stilleri
│       └── themes.css          # Tema stilleri
├── tests/                       # Test dosyaları
│   ├── setup.js                # Test kurulumu
│   ├── core/                   # Core modül testleri
│   └── utils/                  # Utility testleri
├── dist/                        # Build çıktıları (git'de yok)
├── public/                      # Statik dosyalar
├── node_modules/                # Bağımlılıklar (git'de yok)
├── package.json                 # Proje metadata ve scriptler
├── vite.config.js              # Vite build konfigürasyonu
├── .eslintrc.json              # ESLint kuralları
├── .prettierrc.json            # Prettier kuralları
├── .editorconfig               # Editor ayarları
├── .gitignore                  # Git ignore kuralları
├── README.md                    # Kullanıcı dökümanı
├── CHANGELOG.md                 # Değişiklik geçmişi
└── DEVELOPMENT.md               # Bu dosya

```

## 🚀 Geliştirme Ortamı Kurulumu

### Gereksinimler

- Node.js >= 18.0.0
- npm >= 9.0.0

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Tarayıcı otomatik açılır: http://localhost:3000
```

## 📝 NPM Scriptleri

```bash
# Geliştirme
npm run dev              # Geliştirme sunucusunu başlat (port 3000)
npm run preview          # Build önizlemesi (port 4173)

# Build
npm run build            # Production build (dist/ klasörüne)

# Test
npm test                 # Testleri çalıştır
npm run test:ui          # Test UI'ını aç
npm run test:coverage    # Coverage raporu

# Kod Kalitesi
npm run lint             # ESLint kontrolü
npm run lint:fix         # ESLint otomatik düzeltme
npm run format           # Prettier formatla
npm run format:check     # Prettier kontrolü
```

## 🏗️ Mimari

### Modüler Yapı

Proje ES6 modül sistemi kullanıyor. Her modül tek bir sorumluluğa sahip:

```javascript
// Modül import örneği
import { AppState } from './modules/core/state.js';
import * as LayerManager from './modules/layers/layer-manager.js';
```

### Event Delegation Sistemi

HTML'de inline event handler'lar yerine `data-action` attribute'ları kullanılıyor:

```html
<!-- Eski yöntem (kullanılmıyor) -->
<button onclick="createLayer()">Katman Ekle</button>

<!-- Yeni yöntem -->
<button data-action="show-create-layer-modal">Katman Ekle</button>
```

Event delegation `main.js`'de merkezi olarak yönetiliyor:

```javascript
function handleAction(action, element, event) {
  const [actionName, param] = action.split(':');

  switch (actionName) {
    case 'show-create-layer-modal':
      Modals.showCreateLayerModal && Modals.showCreateLayerModal();
      break;
    case 'start-drawing':
      DrawingTools.startDrawing && DrawingTools.startDrawing(param);
      break;
    // ...
  }
}
```

### State Management

Merkezi state yönetimi `AppState` ile yapılıyor:

```javascript
import { AppState } from './modules/core/state.js';

// State oku
const layerId = AppState.get('activeLayerId');

// State yaz
AppState.set('activeLayerId', 'layer-1');

// State değişikliklerini dinle
document.addEventListener('state:changed', (event) => {
  const { key, newValue, oldValue } = event.detail;
  console.log(`${key} changed from ${oldValue} to ${newValue}`);
});
```

## 🧪 Testing

Vitest kullanılıyor. Test dosyaları `tests/` klasöründe:

```javascript
// Örnek test
import { describe, it, expect } from 'vitest';
import { validateName } from '../../src/modules/utils/validation.js';

describe('validateName', () => {
  it('should accept valid names', () => {
    expect(validateName('Layer 1').valid).toBe(true);
  });
});
```

## 🎨 CSS Yapısı

CSS modüler olarak ayrılmış:

1. **variables.css** - CSS custom properties (renkler, spacing, vb.)
2. **reset.css** - Global reset ve base styles
3. **layout.css** - Layout ve grid sistemleri
4. **components.css** - UI bileşenleri
5. **themes.css** - Dark mode ve temalar

Tüm CSS dosyaları `main.css` tarafından import ediliyor.

## 🔧 Yeni Modül Ekleme

```javascript
// 1. Yeni modül dosyası oluştur
// src/modules/features/my-feature.js

/**
 * My Feature Module
 * @module features/my-feature
 */

import { AppState } from '../core/state.js';

/**
 * Initialize feature
 */
export function initMyFeature() {
  // Implementation
}

export function doSomething(param) {
  // Implementation
}

// 2. main.js'e import et
import * as MyFeature from './modules/features/my-feature.js';

// 3. Global olarak expose et (opsiyonel)
window.MyFeature = MyFeature;

// 4. Event handler ekle (gerekirse)
case 'my-action':
  MyFeature.doSomething && MyFeature.doSomething(param);
  break;
```

## 📊 Build Süreci

Vite kullanılıyor:

1. **Development**: Hot Module Replacement (HMR) ile hızlı geliştirme
2. **Production**:
   - Terser ile minification
   - CSS extraction ve minification
   - Tree shaking
   - Code splitting (Leaflet ve Proj4 ayrı chunk'larda)
   - Sourcemap oluşturma

Build çıktısı:
```
dist/
├── index.html              # Ana HTML
├── assets/
│   ├── main-[hash].css     # Minified CSS (~45 KB)
│   ├── main-[hash].js      # Minified JS (~105 KB)
│   ├── leaflet-[hash].js   # Leaflet chunk
│   └── proj4-[hash].js     # Proj4 chunk
```

## 🔐 Güvenlik

- Input validation (validateName, sanitizeInput)
- XSS protection (HTML escaping)
- Güvenli DOM manipülasyonu
- CSP uyumlu kod (no eval, no inline scripts)

## 📚 Dokümantasyon

- **README.md**: Kullanıcı dökümanı, özellikler, kullanım
- **CHANGELOG.md**: Versiyon geçmişi ve değişiklikler
- **DEVELOPMENT.md**: Bu dosya - geliştirici rehberi
- **JSDoc**: Fonksiyonlarda inline dokümantasyon

## 🤝 Katkıda Bulunma

1. Feature branch oluştur: `git checkout -b feature/my-feature`
2. Değişiklikleri commit et: `git commit -m "feat: add my feature"`
3. Testleri çalıştır: `npm test`
4. Linting kontrol et: `npm run lint`
5. Push yap: `git push origin feature/my-feature`
6. Pull request aç

## 🐛 Debugging

### Development Mode

```bash
npm run dev
```

Tarayıcı console'da:
- Tüm modüller `window` nesnesinde mevcut
- `window.AppState.getAll()` ile tüm state'i görebilirsiniz
- Sourcemap'ler sayesinde orijinal kodda debug yapabilirsiniz

### Production Build Debug

```bash
npm run build
npm run preview
```

Production build'de sourcemap'ler aktif, bu sayede browser dev tools'da debug yapılabilir.

## 📞 Destek

- GitHub Issues: https://github.com/gokcegoncu/layerproj/issues
- Dokümantasyon: README.md ve CHANGELOG.md dosyalarına bakın

## 📄 Lisans

MIT
