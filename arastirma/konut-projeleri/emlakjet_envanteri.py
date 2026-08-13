#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Emlakjet proje envanteri tarayıcı — Projedar için müteahhit + fiyat benchmark kaynağı.

emlakjet.com/satilik-konut/projeler listesi SSR (Next.js) döner; tüm veri HTML
içinde gömülü gelir. Bu yüzden headless browser / JS gerekmez, düz urllib yeter.
Sayfa başına 30 proje kartı; her kartta: proje adı, konum, m², oda tipi, konut
sayısı, teslim, müteahhit adı ve fiyat aralığı (min-max ₺) açık durur.

Robots: /satilik-konut/projeler listeleme sayfaları Allow. Sadece filtre/görsel
URL'leri (?filtreler=*, ?siralama, resimler, /proje-katalog/*) Disallow. Bu script
yalnız Allow olan sayfa listesini gezer.

Etik/hukuk: sadece proje/fiyat/müteahhit meta verisi toplanır. Kişisel veri
(danışman telefon/e-posta) TOPLANMAZ (KVKK). Nazik davran: --gecikme ile araya
bekleme koy, --sayfa ile tavan koy, cache ile tekrar koşuda siteyi yorma.

Bağımlılık YOK — sadece Python stdlib. pip install gerekmez.

Kullanım:
  python3 emlakjet_envanteri.py --kuru            # plan: kaç sayfa, hedef URL'ler
  python3 emlakjet_envanteri.py                    # tüm sayfalar (otomatik son sayfa tespiti)
  python3 emlakjet_envanteri.py --sayfa 5          # sadece ilk 5 sayfa
  python3 emlakjet_envanteri.py --gecikme 2.5      # sayfalar arası 2.5 sn bekle
  python3 emlakjet_envanteri.py --yenile           # cache'i yok say, yeniden indir
"""

import argparse
import collections
import csv
import html
import re
import sys
import time
import urllib.request
from pathlib import Path

BURASI = Path(__file__).resolve().parent
# Üretilen veri bu araştırma klasörünün cikti/ alt dizinine yazılır.
CIKTI = BURASI / "cikti"
HAM = CIKTI / "ham"

TABAN = "https://www.emlakjet.com"
LISTE = TABAN + "/satilik-konut/projeler"
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)


# ---------------------------------------------------------------------------
# İndirme (cache'li)
# ---------------------------------------------------------------------------
def sayfa_url(n: int) -> str:
    return LISTE if n <= 1 else f"{LISTE}?sayfa={n}"


def indir(n: int, yenile: bool = False) -> str:
    """Sayfa n HTML'ini döndür. arastirma/konut-projeleri/ham/sayfa-N.html altına cache'ler."""
    HAM.mkdir(parents=True, exist_ok=True)
    dosya = HAM / f"sayfa-{n:03d}.html"
    if dosya.exists() and not yenile:
        return dosya.read_text(encoding="utf-8")
    istek = urllib.request.Request(sayfa_url(n), headers={"User-Agent": UA})
    with urllib.request.urlopen(istek, timeout=30) as cevap:
        govde = cevap.read().decode("utf-8", errors="replace")
    dosya.write_text(govde, encoding="utf-8")
    return govde


# ---------------------------------------------------------------------------
# Parse
# ---------------------------------------------------------------------------
def _temiz(s: str) -> str:
    return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s))).strip()


def _ilk(kalip: str, metin: str, grup: int = 1) -> str:
    m = re.search(kalip, metin, re.S)
    return m.group(grup) if m else ""


def son_sayfa_tespit(html_metin: str) -> int:
    """Sayfalama linklerinden en yüksek ?sayfa=N değerini bul."""
    nums = [int(x) for x in re.findall(r"\?sayfa=(\d+)", html_metin)]
    return max(nums) if nums else 1


def kartlari_ayristir(html_metin: str) -> list[dict]:
    metin = html_metin.replace("<!-- -->", "")
    satirlar = []
    for blk in re.findall(r"<article.*?</article>", metin, re.S):
        spanlar = [_temiz(x) for x in re.findall(r'whitespace-nowrap">(.*?)</span>', blk)]
        alan = next((s for s in spanlar if "m²" in s), "")
        konut = next((s for s in spanlar if "konut" in s), "")
        teslim = next((s for s in spanlar if "teslim" in s), "")
        oda = next((s for s in spanlar if s and s not in (alan, konut, teslim)), "")

        konum = _temiz(_ilk(r'line-clamp-1 text-xs[^"]*fg-secondary\)">(.*?)</p>', blk))
        ilce, _, il = konum.partition(",")

        fiyat = _ilk(r'font-semibold[^>]*>([^<]*₺[^<]*)</p>', blk).strip()
        fnums = [int(x.replace(".", "")) for x in re.findall(r"([\d.]+)\s*₺", fiyat)]

        slug = _ilk(r'href="(/projeler/proje/[a-z0-9-]+)"', blk)
        satirlar.append(
            {
                "id": _ilk(r'data-project-id="(\d+)"', blk),
                "ad": _temiz(_ilk(r'data-project-title="true"[^>]*>([^<]+)<', blk)),
                "il": il.strip(),
                "ilce": ilce.strip(),
                "alan": alan,
                "oda_tipi": oda,
                "konut_sayisi": re.sub(r"\D", "", konut),
                "teslim": teslim.replace(" teslim", ""),
                "muteahhit": _temiz(_ilk(r'flex-1 text-xs[^>]*>([^<]+)</p>', blk)),
                "muteahhit_id": _ilk(r"/companies/(\d+)/", blk),
                "fiyat_metin": fiyat,
                "fiyat_min": fnums[0] if fnums else "",
                "fiyat_max": fnums[-1] if fnums else "",
                "url": TABAN + slug if slug else "",
            }
        )
    return satirlar


# ---------------------------------------------------------------------------
# Rapor
# ---------------------------------------------------------------------------
def rapor_yaz(satirlar: list[dict]) -> None:
    muteahhitler = collections.Counter(r["muteahhit"] for r in satirlar if r["muteahhit"])
    iller = collections.Counter(r["il"] for r in satirlar if r["il"])
    konut_by_mut = collections.Counter()
    for r in satirlar:
        if r["muteahhit"] and r["konut_sayisi"]:
            konut_by_mut[r["muteahhit"]] += int(r["konut_sayisi"])

    L = ["# Emlakjet Proje Envanteri — Özet", ""]
    L.append(f"- Toplam proje: **{len(satirlar)}**")
    L.append(f"- Tekil müteahhit: **{len(muteahhitler)}**")
    L.append(f"- Tekil il: **{len(iller)}**")
    L.append("")
    L.append("## En çok projesi olan müteahhitler")
    for ad, n in muteahhitler.most_common(15):
        L.append(f"- {ad}: {n} proje ({konut_by_mut.get(ad, 0)} konut)")
    L.append("")
    L.append("## İl dağılımı (top 15)")
    for il, n in iller.most_common(15):
        L.append(f"- {il}: {n} proje")
    (CIKTI / "rapor.md").write_text("\n".join(L) + "\n", encoding="utf-8")


def csv_yaz(satirlar: list[dict]) -> Path:
    yol = CIKTI / "projeler.csv"
    alanlar = [
        "id", "ad", "il", "ilce", "alan", "oda_tipi", "konut_sayisi", "teslim",
        "muteahhit", "muteahhit_id", "fiyat_min", "fiyat_max", "fiyat_metin", "url",
    ]
    with yol.open("w", encoding="utf-8", newline="") as f:
        yaz = csv.DictWriter(f, fieldnames=alanlar)
        yaz.writeheader()
        for r in satirlar:
            yaz.writerow({k: r.get(k, "") for k in alanlar})
    return yol


# ---------------------------------------------------------------------------
# Ana akış
# ---------------------------------------------------------------------------
def main() -> int:
    ap = argparse.ArgumentParser(description="Emlakjet proje envanteri tarayıcı")
    ap.add_argument("--sayfa", type=int, default=0, help="max sayfa (0=otomatik son sayfa tespiti)")
    ap.add_argument("--gecikme", type=float, default=1.5, help="sayfalar arası bekleme (sn)")
    ap.add_argument("--yenile", action="store_true", help="cache'i yok say, yeniden indir")
    ap.add_argument("--kuru", action="store_true", help="dry-run: sadece plan, indirme yok")
    a = ap.parse_args()

    CIKTI.mkdir(parents=True, exist_ok=True)

    # İlk sayfayı çek (kuru modda da son sayfayı tespit için gerekir).
    if a.kuru:
        print(f"[kuru] hedef liste: {LISTE}")
        try:
            ilk = indir(1, yenile=a.yenile)
        except Exception as e:  # ağ hatası dry-run'da bloklamasın
            print(f"[kuru] ilk sayfa alınamadı ({e}); son sayfa tespiti atlandı.")
            return 0
        son = a.sayfa or son_sayfa_tespit(ilk)
        kart = len(kartlari_ayristir(ilk))
        print(f"[kuru] tespit edilen son sayfa: {son}")
        print(f"[kuru] sayfa başına ~{kart} kart -> tahmini ~{son * kart} proje")
        print(f"[kuru] {son} istek, ~{a.gecikme}sn gecikme -> ~{son * a.gecikme:.0f}sn")
        return 0

    ilk = indir(1, yenile=a.yenile)
    son = a.sayfa or son_sayfa_tespit(ilk)
    print(f"Son sayfa: {son} (gecikme {a.gecikme}sn)")

    hepsi: list[dict] = kartlari_ayristir(ilk)
    print(f"  sayfa 1: {len(hepsi)} kart")
    for n in range(2, son + 1):
        time.sleep(a.gecikme)
        try:
            govde = indir(n, yenile=a.yenile)
        except Exception as e:
            print(f"  sayfa {n}: HATA {e} (atlandı)", file=sys.stderr)
            continue
        kartlar = kartlari_ayristir(govde)
        hepsi.extend(kartlar)
        print(f"  sayfa {n}: {len(kartlar)} kart (toplam {len(hepsi)})")

    # id bazlı tekilleştir (sayfalar arası olası tekrar).
    gorulen, tekil = set(), []
    for r in hepsi:
        anahtar = r["id"] or r["url"]
        if anahtar in gorulen:
            continue
        gorulen.add(anahtar)
        tekil.append(r)

    yol = csv_yaz(tekil)
    rapor_yaz(tekil)
    print(f"\nTamam: {len(tekil)} tekil proje -> {yol}")
    print(f"Özet: {CIKTI / 'rapor.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
