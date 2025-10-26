# GIS Katman Yönetimi - SQLite Entegrasyonu

## 🎯 Genel Bakış

Bu proje, browser-based SQLite veritabanı kullanarak GIS (Coğrafi Bilgi Sistemi) katman ve çizim verilerini kalıcı olarak saklayan bir katman yönetim sistemidir.

## ✨ Özellikler

### Database Yönetimi
- ✅ **Browser-based SQLite**: sql.js kullanılarak tarayıcıda çalışan SQLite veritabanı
- ✅ **LocalStorage Entegrasyonu**: Veritabanı otomatik olarak localStorage'a kaydedilir
- ✅ **Import/Export**: Veritabanını dışa/içe aktarma desteği
- ✅ **Kalıcı Veri**: Sayfa yenilendiğinde tüm veriler korunur

### Veri Modeli

#### 1. Groups (Gruplar)
```sql
CREATE TABLE groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    expanded INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### 2. Layers (Katmanlar)
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

#### 3. Features (Çizimler/Özellikler)
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

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev

# Production build
npm run build
```

## 🚀 Kullanım

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

// Grup listele
const groups = DB.getAllGroups();

// Katman listele
const layers = DB.getLayersByGroup('group-1');

// Feature listele
const features = DB.getFeaturesByLayer('layer-1');

// İstatistikler
const stats = DB.getDatabaseStats();
console.log(stats); // { groups: 5, layers: 20, features: 150 }

// Database'i dışa aktar
DB.exportDatabase(); // .sqlite dosyası indirir

// Database'i temizle
DB.clearDatabase();
```

### Otomatik Kaydetme

Aşağıdaki işlemler otomatik olarak veritabanına kaydedilir:

1. **Grup oluşturma/silme**: `GroupManager.createGroup()`, `GroupManager.deleteGroup()`
2. **Katman oluşturma/silme**: `LayerManager.createLayer()`, `LayerManager.deleteLayer()`
3. **Çizim oluşturma**: Leaflet Draw ile yapılan tüm çizimler otomatik kaydedilir

### Veri Yükleme

Sayfa yüklendiğinde database'den otomatik olarak:
- Tüm gruplar
- Tüm katmanlar
- Tüm çizimler (features)

yüklenir ve haritaya eklenir.

## 🗂️ Dosya Yapısı

```
src/
├── modules/
│   ├── storage/
│   │   └── database.js          # SQLite database yönetimi
│   ├── layers/
│   │   ├── layer-manager.js     # Katman CRUD + DB entegrasyonu
│   │   └── group-manager.js     # Grup CRUD + DB entegrasyonu
│   ├── drawing/
│   │   ├── drawing-tools.js     # Çizim araçları
│   │   └── geometry-handlers.js # Geometri işlemleri
│   └── ...
├── main.js                      # Ana uygulama + DB initialization
└── index.html
```

## 🔧 Teknik Detaylar

### SQL.js Kullanımı

sql.js, SQLite'ı WebAssembly kullanarak tarayıcıda çalıştırır:

```javascript
import initSqlJs from 'sql.js';

// SQL.js'i başlat
const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
});

// Veritabanı oluştur
const db = new SQL.Database();
```

### GeoJSON Desteği

Tüm geometriler GeoJSON formatında saklanır:

```javascript
const geometry = {
    type: "Polygon",
    coordinates: [[[lng1, lat1], [lng2, lat2], ...]]
};

DB.createFeature('feature-1', 'layer-1', 'polygon', geometry, {
    name: 'Bina A',
    floor: 3
});
```

### Leaflet Entegrasyonu

Database'den yüklenen GeoJSON geometrileri Leaflet layer'larına dönüştürülür:

```javascript
const geoJsonLayer = L.geoJSON(featureData.geometry);
const leafletLayer = geoJsonLayer.getLayers()[0];
drawnItems.addLayer(leafletLayer);
```

## 🐛 Hata Ayıklama

### Console'da Database İstatistikleri

```javascript
// Browser console'da:
const stats = window.DB.getDatabaseStats();
console.log(stats);

// Tüm grupları listele
const groups = window.DB.getAllGroups();
console.log(groups);

// Belirli bir katmanın feature'larını listele
const features = window.DB.getFeaturesByLayer('layer-123456789');
console.log(features);
```

### Database'i Sıfırla

```javascript
// Browser console'da:
window.DB.clearDatabase();
location.reload(); // Sayfayı yenile
```

## 📊 Performans

- **Hızlı okuma/yazma**: SQLite in-memory veritabanı kullanır
- **Optimize edilmiş sorgular**: Index'ler ile hızlandırılmış sorgular
- **Otomatik kaydetme**: Her işlemden sonra localStorage'a kaydedilir
- **Verimli yükleme**: Sadece görünür katmanlar haritaya eklenir

## 🔐 Veri Güvenliği

- Tüm veriler tarayıcının localStorage'ında saklanır
- Veriler kullanıcının bilgisayarından ayrılmaz
- Export/import ile yedekleme yapılabilir

## 🎨 Kullanım Senaryoları

### Senaryo 1: Yeni Katman ve Çizim Ekleme

1. Sağ panelden "Grup Ekle" butonuna tıklayın
2. Grup oluşturun (örn: "Binalar")
3. Grubu seçip "Katman Ekle" butonuna tıklayın
4. Katman oluşturun (örn: "Kat 1")
5. Katmanı seçin (highlight olacak)
6. Harita üzerinde polygon çizim aracını seçin
7. Haritada bina sınırlarını çizin
8. ✅ **Otomatik olarak database'e kaydedilir!**
9. Sayfayı yenileyin - tüm veriler korunur!

### Senaryo 2: Veritabanını Dışa Aktarma

```javascript
// Browser console'da:
window.DB.exportDatabase();
```

Bir `.sqlite` dosyası indirilir ve bu dosyayı daha sonra import edebilirsiniz.

## 📝 Notlar

- Database ilk kez yüklendiğinde boştur
- Her değişiklik otomatik olarak localStorage'a kaydedilir
- localStorage temizlenirse tüm veriler silinir (Export önerilir)
- Maximum localStorage boyutu ~5-10 MB (tarayıcıya göre değişir)

## 🚀 Gelecek Geliştirmeler

- [ ] Cloud sync (Firebase/Supabase)
- [ ] Multi-user collaboration
- [ ] Version control (git-like)
- [ ] Advanced querying (spatial queries)
- [ ] Offline-first PWA support
- [ ] IndexedDB migration (daha büyük veri setleri için)

## 📄 Lisans

MIT License

---

**Geliştirici Notu**: Bu sistem, GIS katman yönetimi için production-ready bir SQLite entegrasyonudur. Tüm CRUD işlemleri otomatik olarak veritabanına yansıtılır ve sayfa yenilendiğinde veriler korunur.
