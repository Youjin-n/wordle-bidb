# 🟩 WORDLE-BİDB

Türkçe Wordle oyunu — **BİDB** tarafından geliştirilmiştir.

5 harfli Türkçe kelimeleri tahmin edin! Kolay, Orta ve Zor zorluk seviyeleri arasından seçim yaparak oyuna başlayın. Her tahminden sonra harfler yeşil (doğru yerde), sarı (kelimede var ama yanlış yerde) veya gri (kelimede yok) olarak renklenir.

## 🎮 Özellikler

- **3 Zorluk Seviyesi**: Kolay, Orta ve Zor — her biri farklı kelime havuzuna sahip
- **Türkçe Klavye**: Ğ, Ü, Ş, İ, Ö, Ç harfleri dahil tam Türkçe desteği
- **Akıllı Kelime Seçimi**: Daha önce oynanan kelimeler tekrar gelmez
- **İstatistik Takibi**: Kazanma oranı, seri ve tahmin dağılımı
- **Modern Animasyonlar**: Hücre flip, pop ve dans animasyonları
- **Fiziksel & Sanal Klavye**: Hem ekran klavyesi hem de bilgisayar klavyesi desteği
- **Responsive Tasarım**: Mobil ve masaüstü cihazlara uyumlu
- **Dark Glassmorphism Tema**: Modern ve premium görünüm

## 🚀 Başlangıç

Projeyi çalıştırmak için bir sunucuya ihtiyacınız yoktur. Doğrudan açabilirsiniz:

1. Repoyu klonlayın:
   ```bash
   git clone https://github.com/MustafaKucukcoskun/wordle-bidb.git
   ```
2. `index.html` dosyasını tarayıcıda açın

Veya bir yerel sunucu ile çalıştırın:

```bash
# Python ile
python -m http.server 8080

# VS Code Live Server eklentisi ile
# "Go Live" butonuna tıklayın
```

## 🛠️ Teknolojiler

| Teknoloji  | Kullanım             |
| ---------- | -------------------- |
| HTML5      | Sayfa yapısı         |
| CSS3       | Stil ve animasyonlar |
| JavaScript | Oyun mantığı         |
| jQuery 3.7 | DOM manipülasyonu    |
| Geist Font | Tipografi            |

## 📁 Dosya Yapısı

```
wordle-bidb/
├── index.html        # Ana sayfa
├── app.js            # Oyun mantığı ve etkileşim
├── style.css         # Stil ve animasyonlar
├── background.jpg    # Arka plan görseli
├── logo.svg          # Logo
├── .gitignore        # Git ignore kuralları
└── README.md         # Bu dosya
```

## 🎯 Nasıl Oynanır?

1. **Zorluk seçin** — Kolay, Orta veya Zor
2. **5 harfli bir kelime yazın** — Fiziksel veya sanal klavyeyi kullanabilirsiniz
3. **Enter'a basın** — Tahminizi gönderin
4. **İpuçlarını takip edin**:
   - 🟩 **Yeşil**: Harf doğru yerde
   - 🟨 **Sarı**: Harf kelimede var ama yanlış yerde
   - ⬛ **Gri**: Harf kelimede yok
5. **6 hakkınız var** — Kelimeyi bulmaya çalışın!

## 📊 İstatistikler

Oyun sonunda istatistiklerinizi görebilirsiniz:

- Toplam oynanan oyun sayısı
- Kazanma yüzdesi
- Mevcut ve en iyi kazanma serisi
- Tahmin dağılımı grafiği

İstatistikler tarayıcınızın `localStorage`'ında saklanır.

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: yeni özellik'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

## 📄 Lisans

Bu proje eğitim amacıyla geliştirilmiştir.

---

**BİDB** tarafından ❤️ ile geliştirilmiştir.
