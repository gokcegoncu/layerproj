# Hızlı Başlangıç

## 🚀 En Hızlı Yol

### 1. Terminal'i Açın

```bash
cd /home/user/layerproj
```

### 2. Web Sunucuyu Başlatın

```bash
./start_server.sh
```

VEYA

```bash
python3 -m http.server 8000
```

### 3. Tarayıcıyı Açın

Adres çubuğuna yazın:
```
http://localhost:8000/layer2_production.html
```

---

## 📂 Dosya Yolları

### Ana Dosya (Production)
```
/home/user/layerproj/layer2_production.html
```

### Dökümanlar
```
/home/user/layerproj/README.md              (Kullanım kılavuzu)
/home/user/layerproj/CHANGELOG.md           (Versiyon geçmişi)
/home/user/layerproj/INVESTIGATION_REPORT.md (Analiz raporu)
```

---

## 🌐 Tarayıcıdan Direkt Açma

Tarayıcı adres çubuğuna yapıştırın:
```
file:///home/user/layerproj/layer2_production.html
```

**Not:** Bazı özellikler (örn: CORS) web sunucu olmadan çalışmayabilir.
Tam deneyim için web sunucu kullanın.

---

## 🔧 Alternatif Sunucular

### Node.js (npx)
```bash
cd /home/user/layerproj
npx http-server -p 8000
```

### PHP
```bash
cd /home/user/layerproj
php -S localhost:8000
```

### Ruby
```bash
cd /home/user/layerproj
ruby -run -ehttpd . -p8000
```

---

## 📱 Mobil Cihazdan Erişim

1. Bilgisayarınızın IP adresini öğrenin:
```bash
hostname -I
# Örnek çıktı: 192.168.1.100
```

2. Web sunucuyu başlatın:
```bash
python3 -m http.server 8000
```

3. Mobil cihazınızdan tarayıcıya yazın:
```
http://192.168.1.100:8000/layer2_production.html
```

**Not:** Aynı WiFi ağında olmalısınız.

---

## ❓ Sorun Giderme

### Port zaten kullanılıyor?
```bash
# Farklı port kullanın
python3 -m http.server 8080
# Tarayıcı: http://localhost:8080/layer2_production.html
```

### Python3 yok?
```bash
# Python2 ile
python -m SimpleHTTPServer 8000
```

### Dosya bulunamıyor?
```bash
# Dosyanın varlığını kontrol edin
ls -lh /home/user/layerproj/layer2_production.html

# Dizine gidin
cd /home/user/layerproj
pwd  # Doğru dizinde olduğunuzu onaylayın
```

---

## ✅ Başarılı Başlatma Göstergeleri

Terminalde şunu göreceksiniz:
```
🚀 CBS Katman Yönetim Sistemi başlatılıyor...

📂 Dizin: /home/user/layerproj
🌐 URL: http://localhost:8000/layer2_production.html

✅ Sunucu çalışıyor. Durdurmak için Ctrl+C yapın.

Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

Tarayıcıda haritayı göreceksiniz! 🗺️

---

**Son Güncelleme:** 2025-10-25
**Versiyon:** Production v3.1
