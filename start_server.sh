#!/bin/bash
# CBS Katman Yönetim Sistemi - Web Sunucu Başlatıcı

echo "🚀 CBS Katman Yönetim Sistemi başlatılıyor..."
echo ""
echo "📂 Dizin: /home/user/layerproj"
echo "🌐 URL: http://localhost:8000/layer2_production.html"
echo ""
echo "✅ Sunucu çalışıyor. Durdurmak için Ctrl+C yapın."
echo ""

cd /home/user/layerproj
python3 -m http.server 8000
