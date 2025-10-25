#!/bin/bash
# Otomatik Git Senkronizasyon Script'i
# Her değişikliği otomatik olarak commit ve push yapar

echo "🔄 Otomatik Git Senkronizasyon Başlatıldı"
echo ""

# Değişiklikleri kontrol et
if [[ -n $(git status -s) ]]; then
    echo "📝 Değişiklikler tespit edildi:"
    git status -s
    echo ""

    # Tüm değişiklikleri stage'e al
    git add .
    echo "✅ Dosyalar stage'e alındı"

    # Otomatik commit mesajı oluştur
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    COMMIT_MSG="Auto-sync: Changes at ${TIMESTAMP}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

    # Commit yap
    git commit -m "$COMMIT_MSG"
    echo "✅ Commit oluşturuldu"
    echo ""

    # Push yap
    echo "⬆️  GitHub'a push yapılıyor..."
    git push

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ GitHub ile senkronize edildi!"
        echo "🌐 https://github.com/gokcegoncu/layerproj"
    else
        echo ""
        echo "❌ Push başarısız oldu!"
        exit 1
    fi
else
    echo "ℹ️  Senkronize edilecek değişiklik yok"
    echo "✅ Tüm dosyalar güncel"
fi

echo ""
echo "📊 Son 3 commit:"
git log --oneline -3
