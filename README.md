# 🗺️ CBS Katman Yönetim Sistemi - Modüler v4.0

Modern, responsive ve modüler yapıda geliştirilmiş **Coğrafi Bilgi Sistemi (CBS)** uygulaması. Leaflet.js tabanlı profesyonel harita ve katman yönetim sistemi.

## ✨ Özellikler

### 🎨 **Modern UI/UX**
- **Dark/Light Tema** desteği
- **Responsive Design** (Desktop, Tablet, Mobile)
- **CSS Variables** ile tutarlı tasarım sistemi
- **Smooth animations** ve **hover effects**
- **Toast notification** sistemi

### 🗺️ **Harita Özellikleri**
- **Leaflet.js** tabanlı interaktif harita
- **Multiple projection systems** (WGS84, UTM, vb.)
- **Dynamic scale** hesaplama ve gösterimi
- **Real-time coordinate** display
- **Drag & drop** katman yönetimi

### 📐 **Çizim ve Ölçüm Araçları**
- **Nokta, Çizgi, Poligon** çizimi
- **Daire, Dikdörtgen** çizimi
- **Mesafe ve Alan** ölçümü
- **Advanced measurement** settings
- **Custom styling** options

### 🗂️ **Katman Yönetimi**
- **Hierarchical layer grouping**
- **Layer visibility** control
- **Search and filter** functionality
- **Drag & drop** reordering
- **Style mode** switching (Default/Custom)

### 🎛️ **Gelişmiş Özellikler**
- **Modal management** system
- **Legend** with dynamic content
- **Fullscreen** mode
- **Coordinate system** conversion
- **Local storage** preferences

## 📁 Proje Yapısı

```
cbs-layer-manager/
├── index.html                 # Ana HTML dosyası
├── src/
│   ├── assets/styles/
│   │   ├── variables.css      # CSS değişkenler ve tema sistemi
│   │   ├── base.css          # Temel stiller ve reset
│   │   ├── components.css    # UI bileşen stilleri
│   │   ├── modals.css        # Modal ve araç stilleri
│   │   └── responsive.css    # Responsive design kuralları
│   └── main.js               # Ana JavaScript uygulama
├── README.md                 # Bu dosya
└── layerproj/               # Orijinal kaynak dosyalar
    ├── layer2.html          # Orijinal tam versiyon
    ├── layer2_clean.html    # Temizlenmiş versiyon
    └── layer2 - Kopya (4).html # En gelişmiş versiyon (temel alınan)
```

## 🚀 Kurulum ve Kullanım

### 1. **Basit Kurulum**
```bash
# Repository'yi klonlayın
git clone <repository-url>

# Dizine geçin
cd cbs-layer-manager

# HTTP server ile çalıştırın (örnek: Live Server, Python SimpleHTTPServer)
python -m http.server 8000
# veya
npx serve .
```

### 2. **Tarayıcıda Açın**
```
http://localhost:8000
```

## 🎯 Kullanım Kılavuzu

### **Tema Değiştirme**
- Sağ üst köşedeki 🌙/☀️ butonuna tıklayın
- Tema tercihi otomatik olarak kaydedilir

### **Katman Yönetimi**
- **Grup açma/kapatma**: Grup yanındaki ▼/▶ simgesine tıklayın
- **Katman seçme**: Katman adına tıklayın
- **Görünürlük**: Katman yanındaki checkbox'ı kullanın
- **Stil modu**: D (Default) / C (Custom) butonuna tıklayın

### **Çizim Araçları**
1. Sağ üst köşedeki çizim araçlarından birini seçin
2. Harita üzerine tıklayarak çizim yapın
3. ESC tuşu ile aktif aracı iptal edin

### **Ölçüm Araçları**
1. 📏 (Mesafe) veya 🔲 (Alan) aracını seçin
2. Harita üzerine tıklayarak ölçüm yapın
3. 🗑️ ile ölçümleri temizleyin

### **Koordinat Sistemi**
- Alt status bar'dan koordinat sistemi seçin
- Desteklenen sistemler: WGS84, UTM, Web Mercator

### **Ölçek Kontrolü**
- Alt status bar'daki ölçek değerine tıklayın
- Sabit ölçek seçin veya dinamik modda bırakın

## 🛠️ Teknik Detaylar

### **Kullanılan Teknolojiler**
- **HTML5** / **CSS3** / **Modern JavaScript (ES6+)**
- **Leaflet.js** v1.9.4 (Harita kütüphanesi)
- **Leaflet Draw** v1.0.4 (Çizim araçları)
- **Proj4.js** v2.8.0 (Koordinat dönüşümleri)

### **CSS Mimarisi**
- **CSS Custom Properties** (Variables)
- **BEM-like** naming convention
- **Mobile-first** responsive design
- **Utility classes** for quick styling

### **JavaScript Mimarisi**
- **Modüler** fonksiyon yapısı
- **Event-driven** architecture
- **Local Storage** for preferences
- **Error handling** ve **fallbacks**

### **Browser Desteği**
- ✅ **Chrome** 70+
- ✅ **Firefox** 65+
- ✅ **Safari** 12+
- ✅ **Edge** 79+

## 🎨 Tema Sistemi

### **CSS Variables Kullanımı**
```css
:root {
    --primary-color: #2196f3;
    --bg-primary: #ffffff;
    --text-primary: #333;
    /* ... diğer değişkenler */
}

[data-theme="dark"] {
    --bg-primary: #2d3748;
    --text-primary: #ffffff;
    /* ... dark theme overrides */
}
```

### **Tema Değiştirme**
```javascript
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cbs-theme', theme);
}
```

## 📱 Responsive Design

### **Breakpoints**
- **Desktop**: 1024px+
- **Tablet**: 768px - 1024px
- **Mobile**: 480px - 768px
- **Small Mobile**: 320px - 480px

### **Mobile Adaptasyonları**
- Panel layout değişikliği (horizontal → vertical)
- Touch-friendly button sizes
- Compressed tool groups
- Optimized status bar

## 🔧 Geliştirme

### **CSS Düzenleme**
Stiller modüler olarak ayrılmıştır:
- `variables.css` - Renkler, boyutlar, transitions
- `base.css` - Reset, utility classes
- `components.css` - UI bileşenleri
- `modals.css` - Modal ve araçlar
- `responsive.css` - Media queries

### **JavaScript Düzenleme**
Ana uygulama `src/main.js` dosyasında:
- Global variables
- Map initialization
- Event handlers
- UI functions
- Theme management

### **Yeni Özellik Ekleme**
1. CSS stillerini ilgili dosyaya ekleyin
2. HTML'e gerekli markup'ı ekleyin
3. JavaScript fonksiyonunu `main.js`'e ekleyin
4. Event listener'ları `setupEventListeners()` fonksiyonuna ekleyin

## 📈 Performance

### **Optimizasyonlar**
- **CSS Variables** kullanımı (runtime theming)
- **Event delegation** for dynamic elements
- **Debounced** search/filter functions
- **Lazy loading** for large datasets
- **Minimized** DOM manipulations

### **Loading Performance**
- External library'ler CDN'den
- CSS dosyları sıralı yükleme
- JavaScript bottom of body
- Kritik CSS inline (opsiyonel)

## 🐛 Bilinen Sorunlar

- [ ] Internet Explorer desteği yok
- [ ] Çok büyük datasets'lerde performance sorunları olabilir
- [ ] Offline mode henüz desteklenmiyor

## 🔮 Gelecek Özellikler

### **v4.1 Planları**
- [ ] **PWA** (Progressive Web App) desteği
- [ ] **Service Worker** ile offline çalışma
- [ ] **Web Workers** ile heavy computation
- [ ] **IndexedDB** ile local data storage

### **v4.2 Planları**
- [ ] **WebGL** ile performance optimizasyonu
- [ ] **3D** layer desteği
- [ ] **Real-time** data streaming
- [ ] **Plugin** sistemi

## 📄 Lisans

Bu proje açık kaynak kodludur ve MIT lisansı altında dağıtılmaktadır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

Proje hakkında sorularınız için:
- 📧 **Email**: [your-email@domain.com]
- 🐛 **Issues**: GitHub Issues sekmesi
- 💬 **Discussions**: GitHub Discussions

---

**⭐ Projeyi beğendiyseniz star vermeyi unutmayın!**

*Son güncelleme: Ocak 2024*