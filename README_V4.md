# CBS Katman Yönetim Sistemi v4.0

Modern, modüler, ve production-ready CBS (Coğrafi Bilgi Sistemi) katman yönetim uygulaması.

## 🎉 v4.0 - Büyük Mimari Yenilenme

**Yayın Tarihi**: 2025-10-26

### ✨ Yenilikler

#### 🏗️ Modüler Mimari
- **ES6 Modülleri**: 20+ bağımsız modül ile temiz kod yapısı
- **Sıfır Bağımlılık**: Tüm kod bağımsız ve yeniden kullanılabilir
- **Tree Shaking**: Kullanılmayan kod otomatik kaldırılıyor

#### ⚡ Modern Build Sistemi
- **Vite**: Lightning-fast build ve HMR
- **Optimizasyon**: 571 KB → ~35 KB (gzip)
- **Code Splitting**: Leaflet ve Proj4 ayrı chunk'larda
- **Sourcemaps**: Production'da debug desteği

#### 🧪 Test Altyapısı
- **Vitest**: Modern test framework
- **Coverage**: Kod coverage raporları
- **JSDOM**: Browser ortamı simulasyonu

#### 🎨 CSS Modülleri
- **6 Ayrı Dosya**: variables, reset, layout, components, themes, main
- **CSS Variables**: Tema sistemi için custom properties
- **Dark Mode**: Tam dark theme desteği

#### 🔧 Developer Experience
- **ESLint**: Kod kalitesi kontrolleri
- **Prettier**: Otomatik kod formatlama
- **EditorConfig**: Tutarlı kod stili
- **Hot Module Replacement**: Anlık kod güncellemeleri

#### 🚀 Modern JavaScript
- **Event Delegation**: Merkezi event yönetimi
- **State Management**: AppState ile global state
- **JSDoc**: Tip güvenliği ve IDE desteği
- **No Inline Handlers**: Temiz, bakımı kolay HTML

## 📦 Kurulum ve Kullanım

### Geliştirme Ortamı

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Geliştirme sunucusunu başlat
npm run dev

# Tarayıcı otomatik açılır: http://localhost:3000
```

### Production Build

```bash
# Build yap
npm run build

# Build'i önizle
npm run preview

# dist/ klasörü production'a hazır
```

### NPM Scriptleri

```bash
npm run dev              # Geliştirme sunucusu (HMR)
npm run build            # Production build
npm run preview          # Build önizlemesi
npm test                 # Testleri çalıştır
npm run test:ui          # Test UI
npm run test:coverage    # Coverage raporu
npm run lint             # ESLint kontrolü
npm run lint:fix         # ESLint otomatik düzeltme
npm run format           # Prettier formatla
npm run format:check     # Prettier kontrolü
```

## 📁 Proje Yapısı

```
layerproj/
├── src/                          # Kaynak kodlar
│   ├── index.html               # Ana HTML (temiz, modern)
│   ├── main.js                  # Uygulama entry point
│   ├── modules/                 # ES6 modülleri
│   │   ├── core/               # config.js, state.js, map.js
│   │   ├── layers/             # layer-manager.js, group-manager.js
│   │   ├── drawing/            # drawing-tools.js, geometry-handlers.js
│   │   ├── styling/            # style-manager.js, *-style.js, color-palettes.js
│   │   ├── ui/                 # modals.js, console.js, legend.js, notifications.js
│   │   ├── tools/              # measurement.js, coordinates.js
│   │   └── utils/              # validation.js, security.js, helpers.js, dom.js
│   └── styles/                  # Modüler CSS
│       ├── main.css            # Ana CSS (tüm imports)
│       ├── variables.css       # CSS custom properties
│       ├── reset.css           # Global reset
│       ├── layout.css          # Layout sistemleri
│       ├── components.css      # UI bileşenleri
│       └── themes.css          # Dark mode
├── tests/                       # Vitest testleri
│   ├── setup.js                # Test konfigürasyonu
│   ├── core/                   # Core modül testleri
│   └── utils/                  # Utility testleri
├── dist/                        # Build çıktısı
├── public/                      # Statik dosyalar
├── package.json                 # NPM metadata
├── vite.config.js              # Vite konfigürasyonu
├── .eslintrc.json              # ESLint kuralları
├── .prettierrc.json            # Prettier kuralları
├── .editorconfig               # Editor ayarları
├── README.md                    # Bu dosya
├── DEVELOPMENT.md               # Geliştirici dökümanı
└── CHANGELOG.md                 # Versiyon geçmişi
```

## 🏗️ Mimari

### Modüler Yapı

```javascript
// ES6 import/export
import { AppState } from './modules/core/state.js';
import * as LayerManager from './modules/layers/layer-manager.js';

// State management
AppState.set('activeLayerId', 'layer-1');
const layerId = AppState.get('activeLayerId');

// Event listening
document.addEventListener('state:changed', (event) => {
  console.log(event.detail);
});
```

### Event Delegation

```html
<!-- Eski yöntem (kullanılmıyor) -->
<button onclick="createLayer()">Katman Ekle</button>

<!-- Yeni yöntem -->
<button data-action="show-create-layer-modal">Katman Ekle</button>
<button data-action="start-drawing:polygon">Poligon Çiz</button>
```

Event delegation merkezi olarak `main.js`'de:

```javascript
function handleAction(action, element, event) {
  const [actionName, param] = action.split(':');

  switch (actionName) {
    case 'show-create-layer-modal':
      Modals.showCreateLayerModal();
      break;
    case 'start-drawing':
      DrawingTools.startDrawing(param); // 'polygon'
      break;
  }
}
```

## 🎯 Özellikler

### Katman Yönetimi
- ✅ Katman ve grup oluşturma/silme/düzenleme
- ✅ Drag & drop ile katman sıralama
- ✅ Görünürlük kontrolü
- ✅ Katman filtreleme ve arama

### Çizim Araçları
- ✅ Nokta, çizgi, poligon, dikdörtgen, daire
- ✅ Sürekli nokta çizim modu
- ✅ Feature özellikleri ve attribute editörü
- ✅ Geometri düzenleme

### Gelişmiş Stil Sistemi
- ✅ **Kategorize Stil**: Kategori bazlı renklendirme
- ✅ **Graduated Stil**: İstatistiksel sınıflandırma
  - Quantile (Eşit sayıda öğe)
  - Equal Interval (Eşit aralık)
  - Natural Breaks (Jenks)
  - Standard Deviation
- ✅ **Heatmap**: Isı haritası görselleştirme
- ✅ **50+ Renk Paleti**: ColorBrewer, Viridis, Plasma, vb.

### Koordinat Sistemleri
- ✅ Proj4.js entegrasyonu
- ✅ Türkiye TM30, TM33, TM36, TM39, TM42, TM45
- ✅ WGS84, ED50, ITRF96
- ✅ Anlık koordinat dönüşümü

### Ölçüm Araçları
- ✅ Mesafe ölçümü
- ✅ Alan ölçümü
- ✅ Çevre hesaplama
- ✅ GeoJSON export/import

### UI/UX
- ✅ Dark mode desteği
- ✅ Responsive tasarım (desktop, tablet, mobile)
- ✅ Drag & drop paneller
- ✅ Legend yönetimi
- ✅ Message console
- ✅ Keyboard shortcuts
- ✅ Accessibility (ARIA)

### Güvenlik
- ✅ XSS koruması
- ✅ Input validation ve sanitization
- ✅ Güvenli DOM manipülasyonu
- ✅ CSP uyumlu kod

## 📊 Performans

### Build Boyutları

```
Production Build (gzipped):
- JavaScript: ~27 KB
- CSS: ~8 KB
- HTML: ~12 KB
───────────────────────
Toplam: ~47 KB

Orijinal (v3.9): 571 KB
Azalma: %92 ↓
```

### Optimizasyonlar

- ✅ Terser minification
- ✅ CSS extraction ve minification
- ✅ Tree shaking
- ✅ Code splitting
- ✅ Gzip compression
- ✅ Lazy loading

## 🧪 Testing

```bash
# Tüm testleri çalıştır
npm test

# Test UI'ını aç
npm run test:ui

# Coverage raporu
npm run test:coverage
```

Test yapısı:
- **Unit Tests**: Modül bazında testler
- **Integration Tests**: Modüller arası etkileşim
- **E2E Tests**: (Planlanan)

## 📚 Dokümantasyon

- **[README.md](./README.md)**: Bu dosya - genel bakış
- **[DEVELOPMENT.md](./DEVELOPMENT.md)**: Geliştirici rehberi, mimari detayları
- **[CHANGELOG.md](./CHANGELOG.md)**: Versiyon geçmişi
- **JSDoc**: Kod içi inline dokümantasyon

## 🌐 Tarayıcı Desteği

| Tarayıcı | Minimum Versiyon | Durum |
|----------|------------------|-------|
| Chrome   | 90+              | ✅ Tam Destek |
| Firefox  | 88+              | ✅ Tam Destek |
| Safari   | 14+              | ✅ Tam Destek |
| Edge     | 90+              | ✅ Tam Destek |
| Opera    | 76+              | ✅ Tam Destek |

**Gereksinimler**:
- ES6 Modules desteği
- CSS Custom Properties
- Async/Await
- Fetch API

## 🔧 Geliştirme

### Yeni Modül Ekleme

```javascript
// 1. Modül dosyası oluştur
// src/modules/features/my-feature.js

export function myFunction(param) {
  // Implementation
}

// 2. main.js'e import et
import * as MyFeature from './modules/features/my-feature.js';

// 3. Global expose (opsiyonel)
window.MyFeature = MyFeature;

// 4. Event handler ekle
case 'my-action':
  MyFeature.myFunction(param);
  break;
```

### Kod Kalitesi

```bash
# Linting
npm run lint           # Kontrol
npm run lint:fix       # Otomatik düzelt

# Formatting
npm run format         # Formatla
npm run format:check   # Kontrol et
```

## 🐛 Sorun Giderme

### Development sunucusu başlamıyor

```bash
# Port değiştir
npm run dev -- --port 3001

# Veya vite.config.js'de port değiştir
```

### Build başarısız

```bash
# node_modules'u temizle
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Testler başarısız

```bash
# Cache'i temizle
npm test -- --clearCache
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun: `git checkout -b feature/amazing-feature`
3. Değişikliklerinizi commit edin: `git commit -m 'feat: add amazing feature'`
4. Branch'inizi push edin: `git push origin feature/amazing-feature`
5. Pull Request açın

**Commit Mesaj Formatı**:
- `feat:` Yeni özellik
- `fix:` Hata düzeltme
- `docs:` Dokümantasyon
- `style:` Kod stili (formatting)
- `refactor:` Refactoring
- `test:` Test ekleme/düzeltme
- `chore:` Build, CI, vb.

## 📝 Sürüm Geçmişi

### v4.0.0 (2025-10-26)
- 🎉 Tam modüler mimari dönüşümü
- ⚡ Vite build sistemi
- 🧪 Vitest test altyapısı
- 📦 %92 boyut azalması

### v3.9.0 (2025-10-26)
- 🐛 Katman seçimi düzeltildi
- ✨ Heatmap Theme tab'e taşındı
- ✨ Alan bazlı değer atama

[Tam geçmiş için CHANGELOG.md'ye bakın](./CHANGELOG.md)

## 📄 Lisans

MIT License - detaylar için LICENSE dosyasına bakın

## 👥 Ekip

Geliştirici: CBS Team

## 📞 İletişim ve Destek

- GitHub Issues: [github.com/gokcegoncu/layerproj/issues](https://github.com/gokcegoncu/layerproj/issues)
- Dokümantasyon: [DEVELOPMENT.md](./DEVELOPMENT.md)

---

**v4.0** ile CBS Katman Yönetim Sistemi profesyonel, ölçeklenebilir ve sürdürülebilir bir yapıya kavuştu. 🚀
