#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Konut projesi + müteahhit detay tarayıcı (emlakjet `initialProject` payload'ı).

Ne üretir (arastirma/muteahhit-firmalar/ altına):
  proje.csv        proje ana kaydı; kalan stok, satış yüzdesi, inşaat/teslim tarihi,
                   koordinat, satış durumu, blok/etap (metinden), veri güven seviyesi
  firma.csv        müteahhit/geliştirici; adres, kurumsal telefon, web sitesi,
                   rol tabanlı e-posta, proje sayısı, toplam konut
  konut_tipi.csv   tip bazlı: oda tipi, brüt m², fiyat, ₺/m²
  kampanya.csv     proje kampanyaları (ad, açıklama, bitiş tarihi)
  kesif.txt        relatedProjects'ten bulunan, henüz çekilmemiş proje slug'ları

Keşif: her detay sayfası `relatedProjects` içinde 10-20 komşu projeyi tam nesne
olarak taşır. Bu yüzden tarama kendi evrenini genişletir; tohum listesi 1.500
proje olsa da --tur ile birkaç tur dönünce kapsam belirgin büyür.

Satış verisi etiketleme (brief'in A-E kuralı):
  A  kalan stok VE satış yüzdesi dolu            -> "Doğrulanmış"
  B  ikisinden biri dolu                          -> "Doğrulanmış (tek alan)"
  C  yalnız satış durumu (ONGOING/FINISHED) var   -> "Hesaplanmış/kısmi"
  E  hiçbiri yok                                  -> "Yetersiz veri"
Satılan adet asla uydurulmaz; ancak toplam ve kalan stok varsa çıkarılır ve
`satilan_kaynak=Hesaplanmış` olarak işaretlenir.

Kullanım:
  python3 proje_detay.py --kuru                 # plan: kaç proje, tahmini süre
  python3 proje_detay.py --limit 50             # deneme
  python3 proje_detay.py --iller yogun          # yalnız 21 yoğun il
  python3 proje_detay.py --tur 2                # keşifle 2 tur
  python3 proje_detay.py --gecikme 2.0          # nazik mod
"""

from __future__ import annotations

import argparse
import csv
import sys
import time
from datetime import date
from pathlib import Path

from ortak import (
    CIKTI,
    ODA_TIPI,
    TABAN,
    YOGUN_ILLER,
    al,
    blok_etap_cikar,
    eposta_kurumsal,
    html_metne,
    indir,
    proje_nesnesi,
    tarih,
    telefon_normalize,
    tip_adet_cikar,
)

TOHUM_CSV = (
    Path(__file__).resolve().parent.parent.parent / "arastirma" / "konut-projeleri" / "projeler.csv"
)

PROJE_ALAN = [
    "proje_id", "slug", "ad", "url", "gelistirici", "firma_id", "firma_slug",
    "il", "ilce", "mahalle", "enlem", "boylam", "proje_tipi", "konut_tipi_kategori",
    "satis_durumu", "fiyat_gorunurluk", "fiyat_min", "fiyat_max",
    "toplam_bagimsiz_bolum", "kalan_stok", "satis_yuzdesi", "satilan_adet",
    "satilan_kaynak", "insaat_baslangic", "teslim_tarihi", "teslim_ilerleme",
    "kayit_tarihi", "blok_sayisi", "etap_sayisi", "blok_etap_kaynak",
    "konut_tipi_sayisi", "katalog_url", "veri_guven", "kaynak", "cekilme_tarihi",
]
FIRMA_ALAN = [
    "firma_id", "firma_slug", "ad", "adres", "il", "ilce", "telefon",
    "eposta_kurumsal", "web_sitesi", "aciklama", "kaynak", "cekilme_tarihi",
]
TIP_ALAN = [
    "proje_id", "proje_ad", "tip_ad", "oda_tipi", "kat", "brut_m2",
    "fiyat", "para_birimi", "tl_m2", "kaynak",
]
KAMPANYA_ALAN = [
    "proje_id", "proje_ad", "kampanya_ad", "aciklama", "bitis_tarihi", "kaynak",
]


# ---------------------------------------------------------------------------
# Tohum
# ---------------------------------------------------------------------------
def tohum_sluglar(il_filtre: set[str] | None) -> list[str]:
    """Mevcut emlakjet envanterinden proje slug listesi.

    Tohum CSV'de il kolonu zaten var; kapsam dışı ili burada eleyerek gereksiz
    istek atılmaz (21 il seçiliyken ~1500 -> ~1250).
    """
    if not TOHUM_CSV.exists():
        print(f"UYARI: tohum bulunamadı: {TOHUM_CSV}", file=sys.stderr)
        return []
    sluglar = []
    with TOHUM_CSV.open(encoding="utf-8") as f:
        for satir in csv.DictReader(f):
            url = (satir.get("url") or "").strip()
            if "/projeler/proje/" not in url:
                continue
            if il_filtre and (satir.get("il") or "").strip() not in il_filtre:
                continue
            sluglar.append(url.rsplit("/", 1)[-1])
    return sluglar


# ---------------------------------------------------------------------------
# Nesne -> satır
# ---------------------------------------------------------------------------
def proje_satiri(o: dict, slug: str, bugun: str) -> dict:
    toplam = al(o, "property.flatCount")
    kalan = al(o, "property.remainingFlatCount")
    yuzde = al(o, "percentageOfSale")

    satilan, satilan_kaynak = "", "Yetersiz veri"
    if isinstance(toplam, (int, float)) and isinstance(kalan, (int, float)) and toplam > 0:
        satilan, satilan_kaynak = int(toplam) - int(kalan), "Hesaplanmış"
    elif isinstance(toplam, (int, float)) and isinstance(yuzde, (int, float)) and yuzde > 0:
        satilan, satilan_kaynak = round(toplam * yuzde), "Hesaplanmış"

    if kalan is not None and yuzde is not None:
        guven = "A"
    elif kalan is not None or yuzde is not None:
        guven = "B"
    elif al(o, "salesStatus"):
        guven = "C"
    else:
        guven = "E"

    metin = html_metne(al(o, "about", "")) + " " + html_metne(al(o, "introText", ""))
    blok, etap = blok_etap_cikar(metin)

    return {
        "proje_id": al(o, "id", ""),
        "slug": slug,
        "ad": al(o, "name", ""),
        "url": f"{TABAN}/projeler/proje/{slug}",
        "gelistirici": al(o, "company.name", ""),
        "firma_id": al(o, "company.id", ""),
        "firma_slug": al(o, "company.slug", ""),
        "il": al(o, "locationInfo.city.name", ""),
        "ilce": al(o, "locationInfo.district.name", ""),
        "mahalle": al(o, "locationInfo.town.name", ""),
        "enlem": al(o, "locationInfo.coordinates.lat", ""),
        "boylam": al(o, "locationInfo.coordinates.lng", ""),
        "proje_tipi": al(o, "category.name", ""),
        "konut_tipi_kategori": al(o, "estateType.name", ""),
        "satis_durumu": al(o, "salesStatus", ""),
        "fiyat_gorunurluk": al(o, "price.priceVisibility", ""),
        "fiyat_min": al(o, "price.min", "") or "",
        "fiyat_max": al(o, "price.max", "") or "",
        "toplam_bagimsiz_bolum": toplam if toplam is not None else "",
        "kalan_stok": kalan if kalan is not None else "",
        "satis_yuzdesi": round(yuzde, 4) if isinstance(yuzde, (int, float)) else "",
        "satilan_adet": satilan,
        "satilan_kaynak": satilan_kaynak,
        "insaat_baslangic": tarih(al(o, "projectBuildingStartedDay")),
        "teslim_tarihi": tarih(al(o, "property.deliveryDate")),
        "teslim_ilerleme": al(o, "percentageOfDelivery", ""),
        "kayit_tarihi": tarih(al(o, "createdAt")),
        "blok_sayisi": blok if blok else "",
        "etap_sayisi": etap if etap else "",
        "blok_etap_kaynak": "Tahmini (proje açıklaması)" if (blok or etap) else "",
        "konut_tipi_sayisi": len(al(o, "flatTypes", []) or []),
        "katalog_url": al(o, "catalogUrl", "") or "",
        "veri_guven": guven,
        "kaynak": f"{TABAN}/projeler/proje/{slug}",
        "cekilme_tarihi": bugun,
    }


def firma_satiri(sirket: dict, bugun: str) -> dict | None:
    if not sirket or not sirket.get("slug"):
        return None
    return {
        "firma_id": sirket.get("id", ""),
        "firma_slug": sirket.get("slug", ""),
        "ad": sirket.get("name", ""),
        "adres": (sirket.get("address") or "").strip(),
        "il": al(sirket, "city.name", ""),
        "ilce": al(sirket, "district.name", ""),
        "telefon": telefon_normalize(sirket.get("phoneNumber")),
        "eposta_kurumsal": eposta_kurumsal(sirket.get("email")),
        "web_sitesi": (sirket.get("website") or "").strip(),
        "aciklama": html_metne(sirket.get("introText"))[:600],
        "kaynak": f"{TABAN}/projeler/firma/{sirket.get('slug')}",
        "cekilme_tarihi": bugun,
    }


def tip_satirlari(o: dict) -> list[dict]:
    satirlar = []
    pid, pad = al(o, "id", ""), al(o, "name", "")
    for t in al(o, "flatTypes", []) or []:
        alan = t.get("area")
        fiyat = t.get("flatPrice")
        tl_m2 = ""
        if isinstance(alan, (int, float)) and alan > 0 and isinstance(fiyat, (int, float)) and fiyat > 0:
            tl_m2 = round(fiyat / alan)
        satirlar.append(
            {
                "proje_id": pid,
                "proje_ad": pad,
                "tip_ad": (t.get("name") or "").strip(),
                "oda_tipi": ODA_TIPI.get(str(t.get("roomCount")), ""),
                "kat": t.get("floor", ""),
                "brut_m2": alan if alan is not None else "",
                "fiyat": fiyat if fiyat is not None else "",
                "para_birimi": t.get("currency", ""),
                "tl_m2": tl_m2,
                "kaynak": "emlakjet flatTypes",
            }
        )
    return satirlar


def kampanya_satirlari(o: dict) -> list[dict]:
    satirlar = []
    pid, pad = al(o, "id", ""), al(o, "name", "")
    for k in al(o, "campaigns", []) or []:
        satirlar.append(
            {
                "proje_id": pid,
                "proje_ad": pad,
                "kampanya_ad": k.get("name", ""),
                "aciklama": (k.get("description") or "").strip(),
                "bitis_tarihi": tarih(k.get("date")),
                "kaynak": "emlakjet campaigns",
            }
        )
    return satirlar


# ---------------------------------------------------------------------------
# Ana akış
# ---------------------------------------------------------------------------
def main() -> int:
    ap = argparse.ArgumentParser(description="Konut projesi + müteahhit detay tarayıcı")
    ap.add_argument("--gecikme", type=float, default=1.5, help="istekler arası bekleme (sn)")
    ap.add_argument("--limit", type=int, default=0, help="max proje (0=hepsi)")
    ap.add_argument("--tur", type=int, default=1, help="keşif turu sayısı (relatedProjects)")
    ap.add_argument("--iller", default="tumu", help="'yogun' | 'tumu' | 'İstanbul,Ankara'")
    ap.add_argument("--yenile", action="store_true", help="cache'i yok say")
    ap.add_argument("--kuru", action="store_true", help="dry-run: sadece plan")
    a = ap.parse_args()

    CIKTI.mkdir(parents=True, exist_ok=True)
    bugun = date.today().isoformat()

    if a.iller == "yogun":
        il_filtre = YOGUN_ILLER
    elif a.iller == "tumu":
        il_filtre = None
    else:
        il_filtre = {x.strip() for x in a.iller.split(",") if x.strip()}

    kuyruk = tohum_sluglar(il_filtre)
    if a.limit:
        kuyruk = kuyruk[: a.limit]

    if a.kuru:
        print(f"[kuru] tohum proje: {len(kuyruk)}")
        print(f"[kuru] il filtresi: {a.iller} ({len(il_filtre) if il_filtre else 'sınırsız'})")
        print(f"[kuru] tur: {a.tur}, gecikme: {a.gecikme}sn")
        print(f"[kuru] tek tur tahmini süre: ~{len(kuyruk) * a.gecikme / 60:.0f} dk (cache boşsa)")
        return 0

    projeler: dict[str, dict] = {}
    firmalar: dict[str, dict] = {}
    tipler: list[dict] = []
    kampanyalar: list[dict] = []
    gorulen: set[str] = set()
    kesif: set[str] = set()
    atlanan_eposta = 0

    for tur in range(1, a.tur + 1):
        if not kuyruk:
            break
        print(f"\n=== Tur {tur}: {len(kuyruk)} proje ===")
        for i, slug in enumerate(kuyruk, 1):
            if slug in gorulen:
                continue
            gorulen.add(slug)
            url = f"{TABAN}/projeler/proje/{slug}"
            govde = indir(url, f"proje-{slug}", yenile=a.yenile)
            if govde is None:
                print(f"  [{i}/{len(kuyruk)}] {slug}: alınamadı", file=sys.stderr)
                time.sleep(a.gecikme)
                continue
            o = proje_nesnesi(govde)
            if not o:
                print(f"  [{i}/{len(kuyruk)}] {slug}: payload çözülemedi", file=sys.stderr)
                time.sleep(a.gecikme)
                continue

            satir = proje_satiri(o, slug, bugun)
            if il_filtre and satir["il"] not in il_filtre:
                time.sleep(a.gecikme)
                continue

            projeler[slug] = satir
            tipler.extend(tip_satirlari(o))
            kampanyalar.extend(kampanya_satirlari(o))

            fs = firma_satiri(al(o, "company", {}) or {}, bugun)
            if fs:
                if al(o, "company.email") and not fs["eposta_kurumsal"]:
                    atlanan_eposta += 1
                firmalar.setdefault(fs["firma_slug"], fs)

            # relatedProjects: hem keşif kuyruğu hem firma hasadı
            for rp in al(o, "relatedProjects", []) or []:
                rs = rp.get("slug")
                if rs and rs not in gorulen:
                    kesif.add(rs)
                rfs = firma_satiri(rp.get("company") or {}, bugun)
                if rfs:
                    if (rp.get("company") or {}).get("email") and not rfs["eposta_kurumsal"]:
                        atlanan_eposta += 1
                    firmalar.setdefault(rfs["firma_slug"], rfs)

            if i % 25 == 0 or i == len(kuyruk):
                print(f"  [{i}/{len(kuyruk)}] proje={len(projeler)} firma={len(firmalar)} keşif={len(kesif)}")
            time.sleep(a.gecikme)

        kuyruk = [s for s in sorted(kesif) if s not in gorulen]
        kesif.clear()
        if a.limit:
            kuyruk = kuyruk[: a.limit]

        # Uzun taramada kesinti olursa iş kaybolmasın: her tur sonunda diske yaz.
        _dok(projeler, firmalar, tipler, kampanyalar, kuyruk)
        print(f"  [tur {tur} yazıldı] proje={len(projeler)} firma={len(firmalar)}")

    _dok(projeler, firmalar, tipler, kampanyalar, kuyruk)

    guven = {}
    for r in projeler.values():
        guven[r["veri_guven"]] = guven.get(r["veri_guven"], 0) + 1
    print(f"\nTamam. proje={len(projeler)} firma={len(firmalar)} tip={len(tipler)} kampanya={len(kampanyalar)}")
    print(f"Veri güven dağılımı: {dict(sorted(guven.items()))}")
    print(f"KVKK gereği atılan kişi-adı e-postası: {atlanan_eposta}")
    print(f"Sonraki tur için bekleyen keşif: {len(kuyruk)} (arastirma/muteahhit-firmalar/kesif.txt)")
    return 0


def _dok(projeler: dict, firmalar: dict, tipler: list, kampanyalar: list, kuyruk: list) -> None:
    """Tüm çıktı tablolarını diske yaz (tur sonu ve bitişte çağrılır)."""
    _yaz("proje.csv", PROJE_ALAN, list(projeler.values()))
    _yaz("firma.csv", FIRMA_ALAN, list(firmalar.values()))
    _yaz("konut_tipi.csv", TIP_ALAN, tipler)
    _yaz("kampanya.csv", KAMPANYA_ALAN, kampanyalar)
    (CIKTI / "kesif.txt").write_text("\n".join(sorted(kuyruk)) + "\n", encoding="utf-8")


def _yaz(ad: str, alanlar: list[str], satirlar: list[dict]) -> None:
    yol = CIKTI / ad
    with yol.open("w", encoding="utf-8", newline="") as f:
        y = csv.DictWriter(f, fieldnames=alanlar)
        y.writeheader()
        for r in satirlar:
            y.writerow({k: r.get(k, "") for k in alanlar})
    print(f"  -> {yol} ({len(satirlar)} satır)")


if __name__ == "__main__":
    raise SystemExit(main())
