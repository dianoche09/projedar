# -*- coding: utf-8 -*-
"""
Projedar rakip tarama — konfigürasyon.

Sorgu setleri, gürültü filtresi ve skorlama sözlüğü burada. Motor
(rakip_tarama.py) bu dosyayı import eder. Sorgular Projedar'ın 6 tanımlayıcı
ekseninden türetildi (bkz. memory: rakip-analizi white-space sentezi):
  A) çok-müteahhitli ağ   B) bağımsız emlakçı/broker ağı   C) canlı stok+fiyat
  D) çift-satış önleme / governance   E) komisyonsuz / abonelik   F) tahsis / kapalı-devre
"""

# ---------------------------------------------------------------------------
# FAZ 1 — ulusal sorgular (google.com.tr, gl=tr). ~50 sorgu = ~50 arama.
# ---------------------------------------------------------------------------
ULUSAL_SORGULAR = [
    "müteahhit emlakçı ağı",
    "proje satış ağı emlakçı",
    "proje havuzu emlakçı",
    "emlak danışmanına proje portföyü",
    "sıfır konut iş ortağı platform",
    "broker portalı gayrimenkul",
    "acente portalı proje satış",
    "proje stok paylaşımı emlakçı",
    "geliştirici emlak danışmanı platformu",
    "yeni konut satış platformu",
    "kapalı devre emlak ağı",
    "özel emlakçı proje ağı",
    "proje partner ağı gayrimenkul",
    "gayrimenkul proje dağıtım platformu",
    "müteahhit stok yönetimi yazılımı",
    "proje satış CRM müteahhit",
    "dijital satış ofisi konut yazılımı",
    "canlı stok emlak platformu",
    "konut projesi bayi ağı",
    "emlak ofisi proje portföyü paylaşım",
    "müteahhit danışman komisyon platformu",
    "proje rezervasyon yazılımı konut",
    "daire tahsis sistemi emlakçı",
    "ilan olmadan konut satış platformu",
    "gayrimenkul B2B stok ağı",
    "off-plan satış platformu türkiye",
    "proje satış otomasyonu yazılımı",
    "şahmatka daire durum yazılımı",
    "emlak franchise proje ağı",
    "inşaat firması satış portalı emlakçı",
    "konut stoğu emlakçı paylaşım uygulaması",
    "real estate developer broker network turkey",
    "new home inventory platform turkey",
    "property distribution platform agents turkey",
    "çift satış önleme emlak yazılımı",
    "GYODER üye proje satış platformu",
    "emlak danışmanı bedava proje portföyü",
    "müteahhit emlakçı komisyon anlaşması platform",
    "proje bazlı emlak iş ortaklığı",
    "konut satış kanal ortağı channel partner",
    "emlak stok senkronizasyon yazılımı",
    "proje satış paneli müteahhit yazılım",
    "gayrimenkul yatırım proje ağı platform",
    "whatsapp emlak stok paylaşım yazılımı",
    "emlakçı proje eşleştirme yazılımı",
    "yeni konut satış CRM programı",
    "proje satış ekibi yönetim yazılımı",
    "inşaat proje satış dijital platform",
    "emlak ofisi müteahhit iş birliği platform",
    "proje satış hızlandırma platformu",
]

# ---------------------------------------------------------------------------
# FAZ 2 — lokasyon-duyarlı sorgular (--local ile açılır). {sehir} doldurulur.
# Sadece yerel oyuncunun anlamlı olduğu, ulusal listede kapsanmayan sorgular.
# ---------------------------------------------------------------------------
LOKASYON_SORGULARI = [
    "proje satış ofisi yazılımı {sehir}",
    "yeni konut projeleri {sehir} emlakçı ağı",
    "müteahhit emlakçı iş birliği {sehir}",
    "off-plan proje satış {sehir}",
    "gayrimenkul proje portföyü {sehir} danışman",
]

SEHIRLER = [
    "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya",
    "Alanya", "Kocaeli", "Mersin", "Kıbrıs KKTC",
]

# ---------------------------------------------------------------------------
# FAZ 3 enrichment — anasayfa fetch'te aranan sinyaller.
# ---------------------------------------------------------------------------
URUN_SINYALLERI = [  # gerçek çalışan ürün izleri
    "canlı stok", "müsait", "rezervasyon", "opsiyon", "tahsis", "broker",
    "panel", "giriş yap", "oturum aç", "demo talep", "/ay", "₺/ay", "abonelik",
    "stok yönetimi", "daire durumu", "şahmat", "kat planı", "portföy",
    "channel partner", "kanal ortağı", "unit locking", "double booking",
]
SUPHELI_SINYALLER = [  # vaporware / boş kabuk izleri (memory: EmlakKanal dersi)
    "çok yakında", "yakında", "coming soon", "0 ilan", "beta sürüm",
    "lansmana özel", "ön kayıt", "waitlist", "bekleme listesi",
]

# ---------------------------------------------------------------------------
# GÜRÜLTÜ FİLTRESİ — domain bazında elenir (portal / sosyal / haber / jenerik).
# Franchise markaları (remax, century21) BİLEREK elenmedi — bitişik olabilir.
# ---------------------------------------------------------------------------
GURULTU_DOMAINLERI = {
    # açık ilan portalları (anti-tez, rakip değil)
    "sahibinden.com", "emlakjet.com", "hepsiemlak.com", "hurriyetemlak.com",
    "zingat.com", "emlak.com", "emlakpencerem.com", "endeksa.com",
    # sosyal / video / arama motoru
    "facebook.com", "instagram.com", "twitter.com", "x.com", "youtube.com",
    "linkedin.com", "tiktok.com", "pinterest.com", "google.com",
    "play.google.com", "apps.apple.com",
    # ansiklopedi / forum / blog platformu
    "wikipedia.org", "eksisozluk.com", "reddit.com", "medium.com",
    "wordpress.com", "blogspot.com", "quora.com",
    # jenerik SaaS / dev / iş yazılımı (emlak-dışı, konu-dışı)
    "github.com", "gitlab.com", "clickup.com", "trello.com", "notion.so",
    "microsoft.com", "microsoftkurumsal.com", "salesforce.com", "hubspot.com",
    "zoho.com", "monday.com", "atlassian.com", "reservio.com",
    "verticalbooking.com", "quintadb.com", "opwire.app", "eleman.net",
    "sahibindensatilik.com", "linkedin.com",
    # kamu / eğitim / haber (tek domaine indi diye kaçanlar)
    "odatv.com", "google.com.tr",
    # kendi domainimiz
    "projedar.com",
}
# domain adında geçerse elenir (haber / kamu / jenerik)
GURULTU_PARCALARI = [
    "haber", "gazete", "milliyet", "hurriyet", "sozcu", "cnnturk",
    "ntv", "sabah", "sozlu", "wikimedia", "odatv",
    ".gov.tr", ".edu.tr", ".av.tr", ".bel.tr", ".pol.tr", ".k12.tr",
    ".gov", "belediye",
]

# ---------------------------------------------------------------------------
# SKORLAMA SÖZLÜĞÜ — 6 eksen. Her eksen için anahtar kelimeler + eksen ağırlığı.
# Directness = ağırlıklı eksen kapsaması (0-100). A+B+C birlikte = nadir kombo bonusu.
# ---------------------------------------------------------------------------
LEKSIKON = {
    "A_cok_muteahhit": {
        "agirlik": 20,
        "kelimeler": [
            "çok müteahhit", "çoklu geliştirici", "birden fazla proje",
            "multi developer", "tüm projeler", "proje havuzu", "farklı müteahhit",
        ],
    },
    "B_emlakci_agi": {
        "agirlik": 20,
        "kelimeler": [
            "emlakçı ağı", "broker ağı", "danışman ağı", "acente ağı",
            "broker portalı", "channel partner", "kanal ortağı", "agent network",
            "iş ortağı", "danışman portalı", "acente portalı",
        ],
    },
    "C_canli_stok": {
        "agirlik": 18,
        "kelimeler": [
            "canlı stok", "anlık müsaitlik", "real-time", "gerçek zamanlı",
            "canlı fiyat", "stok senkron", "live inventory", "güncel stok",
            "anlık stok", "müsaitlik",
        ],
    },
    "D_cift_satis": {
        "agirlik": 16,
        "kelimeler": [
            "çift satış", "mükerrer satış", "double booking", "unit locking",
            "aşırı satış", "opsiyon", "rezervasyon", "kilit", "hold",
            "çakışma önleme",
        ],
    },
    "E_komisyon_model": {
        "agirlik": 12,
        "kelimeler": [
            "komisyonsuz", "abonelik", "sabit ücret", "/ay", "saas",
            "komisyon", "hakediş", "prim", "success fee",  # komisyon = bitişik sinyal
        ],
    },
    "F_tahsis": {
        "agirlik": 14,
        "kelimeler": [
            "tahsis", "allocation", "kota", "kısıtlı stok", "kapalı",
            "özel erişim", "davetli", "yetkili danışman", "sadece üyeler",
        ],
    },
}

# A+B+C üç ekseni de tetiklenirse eklenen bonus (nadir kombinasyon)
NADIR_KOMBO_BONUS = 12

# Sınıflandırma eşikleri (directness 0-100)
ESIK_DIRECT = 65
ESIK_ADJACENT = 35
