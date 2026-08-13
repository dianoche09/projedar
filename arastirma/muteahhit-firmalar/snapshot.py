#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Haftalık stok / fiyat snapshot — konut projesi zaman serisi üretici.

NEDEN AYRI BİR SCRIPT: kalan stok ve satış yüzdesi geriye dönük elde edilemez.
emlakjet yalnız ANLIK değeri yayımlar. Satış hızı (aylık kaç konut eridi),
%50/%75/%90 sell-through süresi ve sold-out tarihi ancak düzenli anlık
ölçümlerin üst üste konmasıyla çıkar. Bu yüzden snapshot ne kadar erken
başlarsa seri o kadar değerli olur; kaçırılan hafta telafi edilemez.

Ne yapar: proje.csv'deki her projeyi TAZE çeker (cache kullanmaz, amaç zaten
değişimi görmek) ve arastirma/muteahhit-firmalar/stok-zaman-serisi.csv'ye satır EKLER. Dosya asla
üzerine yazılmaz.

Varsayılan olarak yalnız satışı süren (ONGOING) projeler ölçülür; FINISHED
olanlar --hepsi ile dahil edilir. FINISHED'e geçiş tarihi zaten seride
görünür ve o projenin sold-out tarihi olarak kullanılır.

Kullanım:
  python3 snapshot.py                    # ONGOING projeler, tek tur
  python3 snapshot.py --hepsi            # FINISHED dahil
  python3 snapshot.py --limit 100        # deneme
  python3 snapshot.py --gecikme 2.0      # nazik mod

Haftalık otomatik çalıştırma (kullanıcı onayıyla kurulur):
  crontab -e
  0 4 * * 1 cd <repo>/arastirma/muteahhit-firmalar && /usr/bin/python3 snapshot.py
"""

from __future__ import annotations

import argparse
import csv
import gzip
import sys
import time
import urllib.request
from datetime import date
from pathlib import Path

from ortak import BASLIK, CIKTI, TABAN, al, proje_nesnesi

SERI = CIKTI / "stok-zaman-serisi.csv"
SERI_ALAN = [
    "tarih", "proje_id", "slug", "ad", "il", "ilce", "gelistirici",
    "satis_durumu", "toplam_bagimsiz_bolum", "kalan_stok", "satis_yuzdesi",
    "satilan_adet", "fiyat_min", "fiyat_max", "fiyat_gorunurluk",
    "veri_turu", "kaynak",
]


def taze_indir(url: str) -> str | None:
    """Cache'siz indir — snapshot'ın amacı güncel değeri görmek."""
    try:
        with urllib.request.urlopen(
            urllib.request.Request(url, headers=BASLIK), timeout=30
        ) as cevap:
            govde = cevap.read()
            if cevap.headers.get("Content-Encoding") == "gzip":
                govde = gzip.decompress(govde)
        return govde.decode("utf-8", errors="replace")
    except Exception:
        return None


def hedefler(hepsi: bool, limit: int) -> list[dict]:
    yol = CIKTI / "proje.csv"
    if not yol.exists():
        print(f"HATA: {yol} yok. Önce proje_detay.py çalıştır.", file=sys.stderr)
        return []
    with yol.open(encoding="utf-8") as f:
        satirlar = list(csv.DictReader(f))
    if not hepsi:
        satirlar = [r for r in satirlar if r.get("satis_durumu") != "FINISHED"]
    return satirlar[:limit] if limit else satirlar


def olc(slug: str, bugun: str) -> dict | None:
    govde = taze_indir(f"{TABAN}/projeler/proje/{slug}")
    if govde is None:
        return None
    o = proje_nesnesi(govde)
    if not o:
        return None

    toplam = al(o, "property.flatCount")
    kalan = al(o, "property.remainingFlatCount")
    yuzde = al(o, "percentageOfSale")

    satilan = ""
    if isinstance(toplam, (int, float)) and isinstance(kalan, (int, float)):
        satilan = int(toplam) - int(kalan)
    elif isinstance(toplam, (int, float)) and isinstance(yuzde, (int, float)) and yuzde > 0:
        satilan = round(toplam * yuzde)

    if kalan is not None or yuzde is not None:
        veri_turu = "Doğrulanmış"
    elif al(o, "salesStatus"):
        veri_turu = "Yalnız satış durumu"
    else:
        veri_turu = "Yetersiz veri"

    return {
        "tarih": bugun,
        "proje_id": al(o, "id", ""),
        "slug": slug,
        "ad": al(o, "name", ""),
        "il": al(o, "locationInfo.city.name", ""),
        "ilce": al(o, "locationInfo.district.name", ""),
        "gelistirici": al(o, "company.name", ""),
        "satis_durumu": al(o, "salesStatus", ""),
        "toplam_bagimsiz_bolum": toplam if toplam is not None else "",
        "kalan_stok": kalan if kalan is not None else "",
        "satis_yuzdesi": round(yuzde, 4) if isinstance(yuzde, (int, float)) else "",
        "satilan_adet": satilan,
        "fiyat_min": al(o, "price.min", "") or "",
        "fiyat_max": al(o, "price.max", "") or "",
        "fiyat_gorunurluk": al(o, "price.priceVisibility", ""),
        "veri_turu": veri_turu,
        "kaynak": f"{TABAN}/projeler/proje/{slug}",
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Haftalık stok/fiyat snapshot")
    ap.add_argument("--gecikme", type=float, default=1.5)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--hepsi", action="store_true", help="FINISHED projeleri de ölç")
    a = ap.parse_args()

    bugun = date.today().isoformat()
    hedef = hedefler(a.hepsi, a.limit)
    if not hedef:
        return 1

    # Aynı gün ikinci kez çalıştırılırsa seriyi kirletme.
    if SERI.exists():
        with SERI.open(encoding="utf-8") as f:
            if any(r.get("tarih") == bugun for r in csv.DictReader(f)):
                print(f"UYARI: {bugun} için snapshot zaten var, atlanıyor.")
                return 0

    print(f"Snapshot {bugun}: {len(hedef)} proje ölçülüyor (gecikme {a.gecikme}sn)")
    yeni = SERI.parent / SERI.name
    ilk_yazim = not SERI.exists()
    SERI.parent.mkdir(parents=True, exist_ok=True)

    olculen = basarisiz = 0
    with yeni.open("a", encoding="utf-8", newline="") as f:
        y = csv.DictWriter(f, fieldnames=SERI_ALAN)
        if ilk_yazim:
            y.writeheader()
        for i, r in enumerate(hedef, 1):
            satir = olc(r["slug"], bugun)
            if satir is None:
                basarisiz += 1
            else:
                y.writerow(satir)
                olculen += 1
            if i % 50 == 0 or i == len(hedef):
                f.flush()
                print(f"  [{i}/{len(hedef)}] ölçülen={olculen} başarısız={basarisiz}")
            time.sleep(a.gecikme)

    print(f"\nTamam: {olculen} satır eklendi -> {SERI}")
    if basarisiz:
        print(f"Başarısız: {basarisiz}")
    print("Not: satış hızı analizi için en az 2 farklı tarihli snapshot gerekir.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
