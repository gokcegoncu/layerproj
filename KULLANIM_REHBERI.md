# 📖 GIS Katman Yönetimi - Kullanım Rehberi

## 🚀 Hızlı Başlangıç

### 1️⃣ Projeyi Çalıştırma

```bash
cd C:\github\layerproj
npm run dev
```

Tarayıcıda: `http://localhost:3000`

---

## 💾 Veri Saklama Sistemi

### **Veriler Nerede Tutuluyor?**

✅ **Browser localStorage** - Tarayıcınızın hafızasında
✅ **sql.js** - JavaScript ile SQLite veritabanı
✅ **Otomatik kayıt** - Her işlemde localStorage'a kaydedilir

### **Önemli Bilgiler**

- ⚠️ **Sadece bu tarayıcıda** - Başka cihazda görünmez
- ⚠️ **Cache temizliği** - Cache temizlerseniz veriler kaybolur
- ✅ **Export/Import** - Yedekleme için kullanın

---

## 🎯 Temel Kullanım

### **1. Grup Oluşturma**

```
Sağ Panel → "Grup Ekle" butonu → İsim girin → "Oluştur"
```

**Örnek:**
- "Binalar"
- "Yollar"
- "Park Alanları"

### **2. Katman Oluşturma**

```
Grubu seç → "Katman Ekle" → İsim girin → "Oluştur"
```

**Önemli:** Katman oluşturmadan önce grup seçmelisiniz!

### **3. Çizim Yapma**

```
1. Katmanı seç (highlight olacak)
2. Sağ alt köşeden çizim aracını seç
   📍 Nokta
   📏 Çizgi
   ⬟ Poligon
   ⬜ Dikdörtgen
   ⭕ Daire
3. Haritada çiz
```

**✅ Çizimler otomatik olarak seçili katmana kaydedilir!**

---

## 💾 Yedekleme ve Geri Yükleme

### **Export (Yedek Alma)**

```
Sağ Panel → 💾 butonu → .sqlite dosyası indirilir
```

**Ne zaman kullanmalı:**
- Düzenli yedekleme için
- Başka bilgisayara taşımak için
- Cache temizlemeden önce

### **Import (Geri Yükleme)**

```
Sağ Panel → 📥 butonu → .sqlite dosyasını seç
```

**Otomatik:** Sayfa yenilenir ve veriler yüklenir

---

## 🔍 Database Durumu

Sağ panelde "Katmanlar" başlığının yanında:

### **✓ Yeşil: DB Çalışıyor**
```
DB: ✓ (2G/5L/15F)
     └─ 2 Grup, 5 Katman, 15 Feature
```

### **✗ Kırmızı: DB Yok**
```
DB: ✗
```
**Çözüm:** Sayfa yenilensin, veya yeni veri ekleyin

### **⚠ Sarı: DB Hatalı**
```
DB: ⚠
```
**Çözüm:** F12 → Console'da hataları kontrol edin

---

## 🛠️ Sorun Giderme

### **Harita Görünmüyor**

```javascript
// F12 → Console
// Hata var mı kontrol edin
```

**Çözümler:**
1. Sayfayı yenileyin (F5)
2. Hard refresh (Ctrl+Shift+R)
3. Cache temizleyin
4. Dev server'ı yeniden başlatın

### **Database Çalışmıyor**

```javascript
// F12 → Console
window.DB.getDatabaseStats()
```

**Beklenen:**
```json
{ groups: 0, layers: 0, features: 0 }
```

**Eğer hata varsa:**
```
❌ Error getting database stats: ...
```

**Çözüm:** Database olmadan da kullanılabilir, sadece sayfa yenilendiğinde veriler kaybolur.

### **Çizimler Kayboldu**

**Neden olabilir:**
- Cache temizlendi
- Başka tarayıcı kullanıldı
- localStorage doldu

**Çözüm:**
1. Export ile düzenli yedek alın
2. İhtiyaç halinde import edin

---

## 💡 İpuçları

### **1. Düzenli Yedekleme**

Her önemli işlemden sonra export yapın:

```
Yeni proje başladınız → Export
Çok çizim yaptınız → Export
İşiniz bitti → Export
```

### **2. Versiyon Kontrolü**

Dosya isimlerine tarih ekleyin:

```
gis_database_2025-01-15.sqlite
gis_database_2025-01-16_backup.sqlite
```

### **3. Katman Organizasyonu**

Grupları mantıklı kullanın:

```
✅ İyi:
  - Binalar
    - Konutlar
    - Ticari
  - Altyapı
    - Yollar
    - Elektrik

❌ Kötü:
  - Katman 1
  - Katman 2
  - Yeni Katman
```

---

## 🔧 Gelişmiş Özellikler

### **Console'dan Kontrol**

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

### **Programatik Export/Import**

```javascript
// Export
window.DB.exportDatabase()

// Stats
const stats = window.DB.getDatabaseStats()
console.log(`Toplam: ${stats.features} çizim`)
```

---

## 📊 Veri Limitleri

### **localStorage Sınırları**

| Tarayıcı | Max Boyut |
|----------|-----------|
| Chrome   | ~10 MB    |
| Firefox  | ~10 MB    |
| Safari   | ~5 MB     |
| Edge     | ~10 MB    |

### **Ne Kadar Veri Sığar?**

**Tahmini:**
- **1000 nokta** = ~500 KB
- **100 poligon** = ~200 KB
- **10 grup + 50 katman** = ~50 KB

**Toplam:** ~5-10 MB'a kadar rahat kullanılabilir

---

## ⚠️ Dikkat Edilmesi Gerekenler

### **❌ YAPMAYIN**

- ✗ Cache temizliği yapmadan export almayın
- ✗ Çok büyük poligonlar çizmeyin (binlerce nokta)
- ✗ localStorage'ı dolu hale getirmeyin

### **✅ YAPIN**

- ✓ Düzenli export alın
- ✓ Katmanları organize edin
- ✓ Database durumunu kontrol edin
- ✓ Console'daki hataları takip edin

---

## 🆘 Yardım ve Destek

### **Hata Raporlama**

```bash
# F12 → Console
# Kırmızı hatalar varsa ekran görüntüsü alın
```

### **Sık Sorulan Sorular**

**S: Verilerim güvende mi?**
C: Tarayıcınızın localStorage'ında, sadece sizin erişiminizde.

**S: Başka bilgisayarda kullanabilir miyim?**
C: Export/import ile taşıyabilirsiniz.

**S: İnternet olmadan çalışır mı?**
C: Evet, tamamen offline çalışır.

**S: Verileri sunucuya yükleyebilir miyim?**
C: Şu anda hayır, ama eklenebilir.

---

## 📝 Sürüm Notları

### **v3.9.0 - Database Entegrasyonu**

✅ SQLite veritabanı eklendi
✅ Export/Import özellikleri
✅ Database durum göstergesi
✅ Otomatik kaydetme
✅ localStorage persistansı

---

## 🎓 Video Tutorial

*(Geliştirilebilir: Ekran kaydı eklenebilir)*

---

**Son Güncelleme:** 2025-01-26
**Versiyon:** 3.9.0
**Geliştirici:** Claude Code
