# CBS Katman Yönetim Sistemi

Modern, responsive ve güvenli bir CBS (Coğrafi Bilgi Sistemi) katman yönetim arayüzü.

## 📦 Versiyon Bilgisi

**Production v3.9** - 2025-10-27

### 🆕 v3.9 İyileştirmeleri (YENİ!)
- ✅ NPM bağımlılıkları kuruldu (400+ paket)
- 🔧 ESLint v9'a migrate edildi (flat config)
- 📦 Vite build optimizasyonu (sourcemaps disabled in production)
- 🧪 Test altyapısı yeniden kuruldu (Vitest + JSDOM)
- 🔐 Husky git hooks aktif
- 🎯 Modern ES6 modular architecture

### v3.3 Özellikleri
- 🎨 Demo veri oluşturma sistemi (4 farklı tip)
- 📊 Tematik harita görselleştirme (3 yöntem)
- 🎯 Tek tıkla test edilebilir senaryolar
- 🌡️ Nüfus, gelir, kategori, sıcaklık demo verileri
- 🔥 Isı haritası, quantile, kategori renklendirme

## 🚀 Hızlı Başlangıç

### Kurulum

```bash
# Bağımlılıkları kur
npm install

# Development server başlat
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### NPM Scriptler

```bash
npm run dev              # Vite dev server (port 3000)
npm run build            # Production build → dist/
npm run preview          # Preview build (port 4173)
npm test                 # Vitest testleri çalıştır
npm run test:ui          # Test UI ile çalıştır
npm run test:coverage    # Coverage raporu
npm run lint             # ESLint kontrolü
npm run lint:fix         # ESLint otomatik düzeltme
npm run format           # Prettier formatting
npm run format:check     # Format kontrolü
```

## 🎯 Nasıl Kullanmalıyım?

### ✅ Önerilen Kullanım

#### Development (Geliştirme)
```bash
npm run dev
# → http://localhost:3000
# Kaynak: src/index.html + modules/
# Hot Module Reloading aktif
```

#### Production (Üretim)
```bash
npm run build
# → dist/ klasörüne build oluşturulur
# Minified, optimized, production-ready
```

## 🏗️ Proje Yapısı

```
layerproj/
├── src/
│   ├── index.html              # Ana HTML (modular)
│   ├── main.js                 # Entry point (1,036 satır)
│   ├── modules/                # 24 modül (8,654 satır)
│   │   ├── core/               # Config, State, Map
│   │   ├── utils/              # Validation, Security, Helpers
│   │   ├── styling/            # Style management
│   │   ├── layers/             # Layer & group management
│   │   ├── drawing/            # Drawing tools
│   │   ├── ui/                 # UI components
│   │   ├── tools/              # Measurement, coordinates
│   │   └── storage/            # SQLite database
│   └── styles/                 # CSS dosyaları (69KB)
│
├── tests/                      # Vitest unit testler
│   ├── setup.js
│   ├── core/
│   └── utils/
│
├── node_modules/               # NPM packages (400+)
├── dist/                       # Build output (npm run build)
│
├── package.json                # NPM configuration
├── vite.config.js              # Vite build config
├── eslint.config.js            # ESLint v9 flat config
└── .prettierrc.json            # Prettier config
```

## 🚀 Özellikler

### Temel Özellikler
- 🗺️ **Harita Yönetimi**: Leaflet tabanlı interaktif harita
- 📁 **Katman Organizasyonu**: Grup ve katman hiyerarşisi
- 🎨 **Tema Desteği**: Açık/karanlık tema
- 📱 **Responsive Tasarım**: Masaüstü, tablet, mobil uyumlu
- ♿ **Erişilebilirlik**: ARIA öznitelikleri ile tam destek

### Çizim Araçları
- 📍 Nokta çizimi
- 📏 Çizgi çizimi
- 🔷 Poligon çizimi
- ⬛ Dikdörtgen çizimi
- ⭕ Daire çizimi

### Ölçüm Araçları
- 📏 Mesafe ölçümü (km/m)
- 🔲 Alan ölçümü (km²/m²)
- ⚙️ Ölçüm ayarları
- 🗑️ Ölçümleri temizleme

### Gelişmiş Stil Sistemi
- **Tek Sembol**: Uniform styling
- **Kategorik**: Attribute-based coloring
- **Graduated**: Data-driven choropleth maps
  - Quantile classification
  - Equal interval
  - Natural breaks (Jenks)
- **Heatmap**: Intensity visualization
- **50+ Professional Color Palettes**

### Veri Kalıcılığı
- 🗄️ SQLite database (SQL.js in-browser)
- 💾 localStorage fallback
- 📥 Database import/export
- 🔄 Auto-save on changes

## 🔒 Güvenlik

### Güvenlik Özellikleri

#### 1. XSS Koruması
```javascript
// Tüm kullanıcı inputları sanitize ediliyor
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}
```

#### 2. Input Validasyonu
```javascript
// Katman/grup isimleri doğrulanıyor
function validateName(name) {
    // Max 100 karakter
    // Tehlikeli karakterler engelleniyor
    // <script>, javascript:, onerror= vb. bloklanıyor
}
```

#### 3. Güvenli Kullanım
- ✅ innerHTML yerine textContent kullanımı
- ✅ Kullanıcı inputları sanitize ediliyor
- ✅ Tehlikeli karakter pattern kontrolü
- ✅ Maksimum uzunluk sınırlaması

## 🧪 Test Altyapısı

### Test Çalıştırma

```bash
# Tüm testleri çalıştır
npm test

# Test UI ile interaktif çalıştır
npm run test:ui

# Coverage raporu
npm run test:coverage
```

### Test Yapısı

```
tests/
├── setup.js                 # Test environment setup
├── core/
│   └── state.test.js        # AppState unit tests (6 tests)
└── utils/
    └── validation.test.js   # Validation tests
```

### Mocking

Test ortamında aşağıdaki kütüphaneler mock'lanır:
- Leaflet (L global)
- Proj4 (proj4 global)
- localStorage
- SQL.js (initSqlJs)

## 🛠️ Teknik Detaylar

### Teknoloji Stack

| Kategori | Teknoloji | Versiyon |
|----------|-----------|----------|
| **Build Tool** | Vite | 5.0.10 |
| **Testing** | Vitest | 1.0.4 |
| **Linting** | ESLint | 8.57.1 |
| **Formatting** | Prettier | 3.1.1 |
| **Mapping** | Leaflet | 1.9.4 |
| **Drawing** | Leaflet.Draw | 1.0.4 |
| **Heatmap** | Leaflet.Heat | 0.2.0 |
| **Projections** | Proj4 | 2.9.2 |

### Tarayıcı Desteği

| Tarayıcı | Minimum Versiyon |
|----------|------------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### Build Konfigürasyonu

**Development:**
- HMR (Hot Module Reloading) ✅
- Source maps ✅
- Console logs preserved ✅

**Production:**
- Source maps disabled ❌
- Console logs removed ✅ (drop_console: true)
- Terser minification ✅
- Code splitting ✅ (Leaflet, Proj4 separate chunks)

### Bundle Size (Tahmini)

| Bundle | Size |
|--------|------|
| Main app (gzipped) | ~100-150KB |
| Leaflet chunk | ~180KB |
| Proj4 chunk | ~50KB |
| CSS | ~69KB |
| **Total (gzipped)** | **~250-300KB** |

## 📚 Modül Yapısı

### Core Modules (3)
- `core/config.js` - Configuration & constants
- `core/state.js` - Centralized state management
- `core/map.js` - Leaflet map initialization

### Utilities (4)
- `utils/validation.js` - Input validation & sanitization
- `utils/security.js` - XSS prevention
- `utils/helpers.js` - Helper functions (debounce, throttle)
- `utils/dom.js` - DOM manipulation utilities

### Styling (5)
- `styling/style-manager.js` - Main styling module (1,344 lines)
- `styling/categorized-style.js` - Categorical visualization
- `styling/graduated-style.js` - Choropleth maps
- `styling/heatmap-style.js` - Heatmap visualization
- `styling/color-palettes.js` - 50+ professional palettes

### Layers (2)
- `layers/layer-manager.js` - Layer CRUD operations
- `layers/group-manager.js` - Group management

### Drawing (2)
- `drawing/drawing-tools.js` - Drawing mode control
- `drawing/geometry-handlers.js` - Geometry creation

### UI (4)
- `ui/modals.js` - Modal dialogs
- `ui/console.js` - Message console
- `ui/legend.js` - Legend management
- `ui/notifications.js` - Toast notifications

### Tools (2)
- `tools/measurement.js` - Distance & area measurement
- `tools/coordinates.js` - Coordinate display & transformation

### Storage (1)
- `storage/database.js` - SQLite database (optional)

**Total:** 24 modules, 8,654 lines of code

## 📖 Detaylı Kullanım Rehberi

### Veri Saklama Sistemi

**Veriler Nerede Tutuluyor?**
- ✅ **Browser localStorage** - Tarayıcınızın hafızasında
- ✅ **sql.js** - JavaScript ile SQLite veritabanı
- ✅ **Otomatik kayıt** - Her işlemde localStorage'a kaydedilir

**Önemli Bilgiler:**
- ⚠️ **Sadece bu tarayıcıda** - Başka cihazda görünmez
- ⚠️ **Cache temizliği** - Cache temizlerseniz veriler kaybolur
- ✅ **Export/Import** - Yedekleme için kullanın

### Temel Kullanım Adımları

**1. Grup Oluşturma**
```
Sağ Panel → "Grup Ekle" butonu → İsim girin → "Oluştur"
```

**2. Katman Oluşturma**
```
Grubu seç → "Katman Ekle" → İsim girin → "Oluştur"
```
**Önemli:** Katman oluşturmadan önce grup seçmelisiniz!

**3. Çizim Yapma**
```
1. Katmanı seç (highlight olacak)
2. Sağ alt köşeden çizim aracını seç
3. Haritada çiz
✅ Çizimler otomatik olarak seçili katmana kaydedilir!
```

### Yedekleme ve Geri Yükleme

**Export (Yedek Alma)**
```
Sağ Panel → 💾 butonu → .sqlite dosyası indirilir
```

**Import (Geri Yükleme)**
```
Sağ Panel → 📥 butonu → .sqlite dosyasını seç
```

### İpuçları

**Düzenli Yedekleme:** Her önemli işlemden sonra export yapın

**Katman Organizasyonu:** Grupları mantıklı kullanın
```
✅ İyi:
  - Binalar
    - Konutlar
    - Ticari
  - Altyapı
    - Yollar
    - Elektrik
```

## 🗄️ Veritabanı Yönetimi

### Database Yönetimi
- ✅ **Browser-based SQLite**: sql.js kullanılarak tarayıcıda çalışan SQLite veritabanı
- ✅ **LocalStorage Entegrasyonu**: Veritabanı otomatik olarak localStorage'a kaydedilir
- ✅ **Import/Export**: Veritabanını dışa/içe aktarma desteği
- ✅ **Kalıcı Veri**: Sayfa yenilendiğinde tüm veriler korunur

### Veri Modeli

**Groups (Gruplar)**
```sql
CREATE TABLE groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    expanded INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Layers (Katmanlar)**
```sql
CREATE TABLE layers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    group_id TEXT NOT NULL,
    visible INTEGER DEFAULT 1,
    position INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
)
```

**Features (Çizimler/Özellikler)**
```sql
CREATE TABLE features (
    id TEXT PRIMARY KEY,
    layer_id TEXT NOT NULL,
    type TEXT NOT NULL,
    geometry TEXT NOT NULL,
    properties TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (layer_id) REFERENCES layers(id) ON DELETE CASCADE
)
```

### Database Fonksiyonları

```javascript
// Database'i başlat
await DB.initDatabase();

// Grup oluştur
DB.createGroup('group-1', 'Bina Katmanları', 1);

// Katman oluştur
DB.createLayer('layer-1', 'Binalar', 'group-1', 1);

// Feature (çizim) ekle
DB.createFeature('feature-1', 'layer-1', 'polygon', geometryGeoJSON, {});

// İstatistikler
const stats = DB.getDatabaseStats();
console.log(stats); // { groups: 5, layers: 20, features: 150 }
```

### Console'dan Kontrol

```javascript
// F12 → Console

// Database istatistikleri
window.DB.getDatabaseStats()

// Tüm grupları listele
window.DB.getAllGroups()

// Belirli bir katmanın feature'larını listele
window.DB.getFeaturesByLayer('layer-123456789')

// Database'i tamamen temizle
window.DB.clearDatabase()
```

### Veri Limitleri

**localStorage Sınırları**

| Tarayıcı | Max Boyut |
|----------|-----------|
| Chrome   | ~10 MB    |
| Firefox  | ~10 MB    |
| Safari   | ~5 MB     |
| Edge     | ~10 MB    |

**Tahmini Veri Kapasitesi:**
- **1000 nokta** = ~500 KB
- **100 poligon** = ~200 KB
- **10 grup + 50 katman** = ~50 KB
- **Toplam:** ~5-10 MB'a kadar rahat kullanılabilir

## 🔍 Sorun Giderme

### Yaygın Sorunlar

#### 1. Harita Görünmüyor
**Çözüm:**
- İnternet bağlantınızı kontrol edin (Leaflet CDN erişimi)
- Tarayıcı konsolunu kontrol edin (F12)
- CORS hatası varsa dosyayı web sunucudan çalıştırın
- Hard refresh deneyin (Ctrl+Shift+R)
- Dev server'ı yeniden başlatın

#### 2. npm install hatası
**Çözüm:**
```bash
# Cache temizle ve tekrar dene
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 3. Testler çalışmıyor
**Çözüm:**
```bash
# Vitest'i yeniden kur
npm install --save-dev vitest @vitest/ui jsdom
npm test
```

#### 4. ESLint hataları
**Çözüm:**
```bash
# Otomatik düzeltme
npm run lint:fix

# Manuel düzeltme gerekiyorsa
npm run lint
```

#### 5. Database Çalışmıyor

**Kontrol:**
```javascript
// F12 → Console
window.DB.getDatabaseStats()
```

**Beklenen:**
```json
{ groups: 0, layers: 0, features: 0 }
```

**Çözüm:** Database olmadan da kullanılabilir, sadece sayfa yenilendiğinde veriler kaybolur.

#### 6. Çizimler Kayboldu

**Neden olabilir:**
- Cache temizlendi
- Başka tarayıcı kullanıldı
- localStorage doldu

**Çözüm:**
1. Export ile düzenli yedek alın
2. İhtiyaç halinde import edin

### Hızlı Tanı Komutları

Browser console'da (`http://localhost:3000/`) çalıştırın:

```javascript
// Leaflet yüklü mü?
console.log('Leaflet:', typeof L !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');

// Leaflet.Draw yüklü mü?
console.log('Leaflet.Draw:', typeof L.Draw !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');

// proj4 yüklü mü?
console.log('proj4:', typeof proj4 !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');

// Map başlatıldı mı?
console.log('Map:', window.map ? '✅ Initialized' : '❌ Not initialized');

// Database yüklü mü?
console.log('Database:', window.DB ? '✅ Module loaded' : '❌ Module not loaded');
```

### Beklenen Console Çıktısı (Çalışıyor)

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

### Son Çare

Hiçbir şey işe yaramazsa:
1. **Cache temizle**: Ctrl+Shift+Delete
2. **Farklı tarayıcı dene**: Chrome, Firefox, Edge
3. **Dev server'ı yeniden başlat**: Kill ve `npm run dev`
4. **Paketleri yeniden yükle**: `npm install`

## 📈 Gelecek İyileştirmeler

### Öncelikli
- [ ] `style-manager.js` refactoring (1,344 satır → 3-4 modüle böl)
- [ ] `main.js` `handleAction()` refactoring (385 satır → mapping objesi)
- [ ] Test coverage artırma (%20 → %70+)
- [ ] JSDoc documentation

### Orta Öncelik
- [ ] TypeScript migration değerlendirmesi
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Bundle size optimization
- [ ] Lazy loading implementation

### Düşük Öncelik
- [ ] WMS/WFS layer support
- [ ] GeoJSON import/export
- [ ] Backend API integration
- [ ] Real-time collaboration

## 👨‍💻 Geliştirici Rehberi

### Mimari

#### Modüler Yapı

Proje ES6 modül sistemi kullanıyor. Her modül tek bir sorumluluğa sahip:

```javascript
// Modül import örneği
import { AppState } from './modules/core/state.js';
import * as LayerManager from './modules/layers/layer-manager.js';
```

#### Event Delegation Sistemi

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

#### State Management

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

### CSS Yapısı

CSS modüler olarak ayrılmış:

1. **variables.css** - CSS custom properties (renkler, spacing, vb.)
2. **reset.css** - Global reset ve base styles
3. **layout.css** - Layout ve grid sistemleri
4. **components.css** - UI bileşenleri
5. **themes.css** - Dark mode ve temalar

Tüm CSS dosyaları `main.css` tarafından import ediliyor.

### Yeni Modül Ekleme

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

### Build Süreci

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

### Debugging

**Development Mode**

```bash
npm run dev
```

Tarayıcı console'da:
- Tüm modüller `window` nesnesinde mevcut
- `window.AppState.getAll()` ile tüm state'i görebilirsiniz
- Sourcemap'ler sayesinde orijinal kodda debug yapabilirsiniz

**Production Build Debug**

```bash
npm run build
npm run preview
```

Production build'de sourcemap'ler aktif, bu sayede browser dev tools'da debug yapılabilir.

## 🤝 Katkıda Bulunma

### Development Workflow

1. **Fork & Clone**
```bash
git clone https://github.com/yourusername/layerproj.git
cd layerproj
```

2. **Install Dependencies**
```bash
npm install
```

3. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

4. **Make Changes**
- Kod yazın
- Testler ekleyin
- Linting geçsin: `npm run lint:fix`
- Testler geçsin: `npm test`

5. **Commit Changes**
```bash
git add .
git commit -m "feat: your feature description"
```

6. **Push & Pull Request**
```bash
git push origin feature/your-feature-name
# GitHub'da Pull Request oluşturun
```

### Code Style

- **ESLint rules** otomatik uygulanır (pre-commit hook)
- **Prettier formatting** zorunlu
- **2 space indentation**
- **Single quotes** for strings
- **Semicolons** required

## 📄 Lisans

MIT License - Tüm hakları saklıdır.

## 👨‍💻 Geliştirici

**CBS Team**

**Build Version:** v3.9.0
**Build Date:** 2025-10-27
**Quality Assurance:** ✅ Production Ready

---

## 🆚 Versiyon Karşılaştırması

| Özellik | v3.3 | v3.9 (Current) |
|---------|------|----------------|
| NPM Dependencies | ❌ Eksik | ✅ Kurulu (400+) |
| ESLint Config | ⚠️ v8 | ✅ v9 (flat config) |
| Test Infrastructure | ❌ Yok | ✅ Vitest + JSDOM |
| Git Hooks | ⚠️ Tanımlı | ✅ Aktif (Husky) |
| Build Optimization | ⚠️ Basic | ✅ Advanced |
| Code Quality | 7/10 | 8/10 ✅ |
| Production Ready | ⚠️ Kısmen | ✅ Evet |

---

**Son Güncelleme:** 2025-10-27
**Durum:** ✅ Production Ready with Modern Tooling

**npm install** ile başlayın! 🚀
