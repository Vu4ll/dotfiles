#!/bin/bash

# Dotfiles backup restore script
# Bu script yedeklenen dotfiles'ları ev dizinine geri yükler

# Nasıl Çalıştırılır?
#
# 1. Dotfiles dizinine git
# cd /home/vu4ll/Desktop/dotfiles
#
# 2. Script'i çalıştırılabilir yap (sadece ilk seferde)
# chmod +x restore-dotfiles.sh
#
# 3. Script'i çalıştır - mevcut dizini kaynak olarak kullan
# ./restore-dotfiles.sh .

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Yedek dizini (gerektiğinde değiştirin)
BACKUP_DIR="${1:-./dotfiles-backup}"
HOME_DIR="$HOME"

echo -e "${BLUE}Dotfiles Geri Yükleme Script'i${NC}"
echo "==============================="

# Yedek dizininin varlığını kontrol et
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}Hata: Yedek dizini bulunamadı: $BACKUP_DIR${NC}"
    echo "Kullanım: $0 [yedek_dizini_yolu]"
    exit 1
fi

echo -e "${YELLOW}Yedek dizini: $BACKUP_DIR${NC}"
echo -e "${YELLOW}Hedef dizin: $HOME_DIR${NC}"
echo

# Onay al
read -p "Devam etmek istiyor musunuz? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}İşlem iptal edildi.${NC}"
    exit 0
fi

# Geri yüklenecek dosya ve dizinler (.gitignore'dan alınmış)
declare -a ITEMS=(
    # AGS
    ".ags"
    
    # Cache
    ".cache/ags"
    
    # Config
    ".config/ags"
    ".config/btop"
    ".config/fastfetch"
    ".config/fish"
    ".config/fontconfig"
    ".config/foot"
    ".config/ghostty"
    ".config/gowall"
    ".config/gtk-3.0"
    ".config/gtk-4.0"
    ".config/hypr"
    ".config/kitty"
    ".config/lunarfetch"
    ".config/matugen"
    ".config/presets"
    ".config/qt5ct"
    ".config/qt6ct"
    ".config/rofi"
    ".config/wlogout"
    ".config/zshrc.d"
    ".config/starship.toml"
    
    # Cursor
    ".cursor/extensions"
    
    # Fonts
    ".fonts"
    
    # Local
    ".local/share/glib-2.0/schemas"
    ".local/bin"
    ".local/state/ags"
    
    # Pictures
    "Pictures/Wallpapers"
    
    # Themes
    "sddm-astronaut-theme"
    
    # Git
    ".gitignore"
)

# Geri yükleme fonksiyonu
restore_item() {
    local item="$1"
    local backup_path="$BACKUP_DIR/$item"
    local target_path="$HOME_DIR/$item"
    
    if [ -e "$backup_path" ]; then
        # Hedef dizinin parent dizinini oluştur
        local parent_dir="$(dirname "$target_path")"
        if [ ! -d "$parent_dir" ]; then
            echo -e "${BLUE}Dizin oluşturuluyor: $parent_dir${NC}"
            mkdir -p "$parent_dir"
        fi
        
        # Mevcut dosya/dizin varsa yedek al
        if [ -e "$target_path" ]; then
            local backup_name="${target_path}.backup.$(date +%Y%m%d_%H%M%S)"
            echo -e "${YELLOW}Mevcut dosya yedekleniyor: $target_path -> $backup_name${NC}"
            mv "$target_path" "$backup_name"
        fi
        
        # Dosyayı/dizini kopyala
        echo -e "${GREEN}Geri yükleniyor: $item${NC}"
        cp -r "$backup_path" "$target_path"
        
        return 0
    else
        echo -e "${RED}Yedekte bulunamadı: $item${NC}"
        return 1
    fi
}

# Ana geri yükleme işlemi
echo -e "${BLUE}Dotfiles geri yükleniyor...${NC}"
echo

restored_count=0
failed_count=0

for item in "${ITEMS[@]}"; do
    if restore_item "$item"; then
        ((restored_count++))
    else
        ((failed_count++))
    fi
done

echo
echo "==============================="
echo -e "${GREEN}Geri yükleme tamamlandı!${NC}"
echo -e "${GREEN}Başarılı: $restored_count${NC}"
if [ $failed_count -gt 0 ]; then
    echo -e "${RED}Başarısız: $failed_count${NC}"
fi

# Özel dosyalar için ek işlemler
echo
echo -e "${BLUE}Ek işlemler yapılıyor...${NC}"

# .bashrc, .zshrc gibi shell config dosyalarını kontrol et
for shell_config in ".bashrc" ".zshrc" ".bash_profile"; do
    if [ -f "$BACKUP_DIR/$shell_config" ]; then
        echo -e "${YELLOW}$shell_config bulundu, geri yüklemek istiyor musunuz? (y/N): ${NC}"
        read -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            restore_item "$shell_config"
        fi
    fi
done

# Git config
if [ -f "$BACKUP_DIR/.gitconfig" ]; then
    echo -e "${YELLOW}.gitconfig bulundu, geri yüklemek istiyor musunuz? (y/N): ${NC}"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        restore_item ".gitconfig"
    fi
fi

echo
echo -e "${GREEN}Tüm işlemler tamamlandı!${NC}"
echo -e "${YELLOW}Not: Bazı değişikliklerin etkinleşmesi için yeniden giriş yapmanız gerekebilir.${NC}"