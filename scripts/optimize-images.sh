#!/bin/bash
# Оптимизация изображений для продакшна
# Требует: cwebp (apt install webp) или ffmpeg

echo "=== Оптимизация изображений ==="

PUBLIC="$(dirname "$0")/../public"

# Конвертация hero-asphalt.jpg → WebP
if command -v cwebp &>/dev/null; then
  cwebp -q 82 "$PUBLIC/hero-asphalt.jpg" -o "$PUBLIC/hero-asphalt.webp"
  echo "✅ hero-asphalt.webp создан"
else
  echo "⚠️  cwebp не найден. Установи: sudo apt install webp"
fi

echo ""
echo "После генерации WebP добавь в Hero-компонент:"
echo '  <picture>'
echo '    <source srcSet="/hero-asphalt.webp" type="image/webp" />'
echo '    <img src="/hero-asphalt.jpg" ... />'
echo '  </picture>'
