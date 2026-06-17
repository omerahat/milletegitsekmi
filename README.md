# MK Forecast Dashboard

MK Kütüphane doluluk tahminlerini görselleştiren statik website.

## Teknolojiler

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Görselleştirme:** Apache ECharts
- **Deploy:** GitHub Pages
- **Veri Kaynağı:** Supabase Storage

## Veri Akışı

```
Raspberry Pi (saatlik)
  → Supabase Storage (dashboard.json + history.json)
  → GitHub Pages (statik site)
  → ECharts (tarayıcıda render)
```

## Görselleştirmeler

1. **Forecast Line Chart** — Gelecek 24 saat tahmini (visualMap ile renk bucket'ları)
2. **Learning Curve** — Model gelişim animasyonu (timeline + play/pause)
3. **Bar Chart Race** — Model performans karşılaştırması

## Deploy

**GitHub Pages URL:** `https://omerahat.github.io/milletegitsekmi`

Repo ayarlarından GitHub Pages'i aktifleştirin, `main` branch'ini seçin.

## Geliştirme

```bash
python3 -m http.server 8080
# http://localhost:8080
```
