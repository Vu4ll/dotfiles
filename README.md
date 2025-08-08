# My Hyprland Dotfiles

Bu dotfiles koleksiyonu, [Lunaris-Project/HyprLuna](https://github.com/Lunaris-Project/HyprLuna) projesini temel alarak kişisel ihtiyaçlarıma göre özelleştirdiğim Hyprland masaüstü ortamı konfigürasyonlarını içerir.

## 🎯 Hakkında

HyprLuna'nın güzel tasarımını ve fonksiyonelliğini koruyarak, kendi iş akışıma ve tercihlerime göre çeşitli modifikasyonlar yaptım. Bu repo, temiz ve modern bir Hyprland deneyimi sunar.

## ✨ Özellikler

- **Hyprland**: Modern ve hızlı wayland compositor
- **AGS (Aylur's GTK Shell)**: Güçlü widget sistemi
- **Rofi**: Uygulama başlatıcı ve menü sistemi
- **Kitty/Ghostty/Foot**: Terminal emülatörleri
- **Fish Shell**: Modern komut satırı deneyimi
- **Starship**: Özelleştirilebilir prompt
- **Btop/Fastfetch**: Sistem izleme araçları
- **Özel Temalar**: GTK, Qt ve cursor temaları

## 📁 Dahil Edilen Konfigürasyonlar

```
.config/
├── hypr/          # Hyprland ana konfigürasyonu
├── ags/           # Widget konfigürasyonları
├── rofi/          # Uygulama başlatıcı temaları
├── kitty/         # Terminal konfigürasyonu
├── fish/          # Shell konfigürasyonu
├── starship.toml  # Prompt konfigürasyonu
└── ... diğer uygulamalar

.fonts/            # Özel fontlar
Pictures/Wallpapers/  # Duvar kağıtları
sddm-astronaut-theme/ # Login ekranı teması
```

## 🚀 Kurulum

### Otomatik Kurulum
```bash
# Repo'yu klonla
git clone https://github.com/Vu4ll/hyprland-dotfiles.git
cd hyprland-dotfiles

# Script'i çalıştırılabilir yap
chmod +x restore-dotfiles.sh

# Dotfiles'ları geri yükle
./restore-dotfiles.sh .
```

### Manuel Kurulum
İstediğin konfigürasyonları manuel olarak `~/.config/` dizinine kopyalayabilirsin.

## ⚠️ Önemli Notlar

- **Yedekleme**: Mevcut konfigürasyonların yedeklerini almayı unutma
- **Bağımlılıklar**: Gerekli paketlerin kurulu olduğundan emin ol
- **Restart**: Bazı değişiklikler için yeniden giriş gerekebilir

## 🙏 Teşekkürler

Bu dotfiles [Lunaris-Project/HyprLuna](https://github.com/Lunaris-Project/HyprLuna) projesinin harika çalışmasına dayanır. Orijinal geliştiricilere teşekkürler!

**Not**: Bu konfigürasyonlar kişisel kullanım için optimize edilmiştir. Kendi ihtiyaçlarınıza göre değişiklik yapmanız gerekebilir.