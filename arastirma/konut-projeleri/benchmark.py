#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Emlakjet envanterinden il / il+ilçe bazlı fiyat benchmark tablosu üretir.

Girdi:  arastirma/konut-projeleri/projeler.csv  (emlakjet_envanteri.py çıktısı)
Çıktı:  arastirma/konut-projeleri/benchmark-il.csv, arastirma/konut-projeleri/benchmark-ilce.csv, arastirma/konut-projeleri/benchmark.md

₺/m² tahmini: kart yalnız fiyat aralığı (min-max) + m² aralığı (min-max) verir,
birim bazlı değil. İki uç ölçü hesaplanır:
  - tl_m2_giris = fiyat_min / alan_min  (küçük/giriş daire ₺/m²)
  - tl_m2_ust   = fiyat_max / alan_max  (büyük/üst daire ₺/m²)
Her ikisi de yaklaşıktır; benchmark amaçlı. Medyan alınır (aykırı değere dayanıklı).

Bağımlılık YOK — sadece Python stdlib.

Kullanım:
  python3 benchmark.py                 # varsayılan: min 3 proje olan kırılımlar
  python3 benchmark.py --min-proje 5   # gürültüyü azalt: en az 5 proje
"""

import argparse
import csv
import json
import re
import statistics
from collections import defaultdict
from pathlib import Path

BURASI = Path(__file__).resolve().parent
# Üretilen veri bu araştırma klasörünün cikti/ alt dizinine yazılır.
CIKTI = BURASI / "cikti"


def alan_aralik(s: str):
    """'97 - 125 m²' -> (97, 125); '78 m²' -> (78, 78)."""
    nums = [int(x) for x in re.findall(r"\d+", s.replace(".", ""))]
    if not nums:
        return None, None
    return nums[0], nums[-1]


def medyan(xs):
    return round(statistics.median(xs)) if xs else ""


def satir_metrikleri(r):
    """Bir projeden (tl_m2_giris, tl_m2_ust) döndür; hesaplanamıyorsa None."""
    try:
        fmin = int(r["fiyat_min"]) if r["fiyat_min"] else None
        fmax = int(r["fiyat_max"]) if r["fiyat_max"] else None
    except ValueError:
        fmin = fmax = None
    amin, amax = alan_aralik(r["alan"])
    giris = fmin / amin if (fmin and amin) else None
    ust = fmax / amax if (fmax and amax) else None
    return giris, ust


def toparla(rows, anahtar_fn, min_proje):
    """anahtar -> {proje, konut, giris[], ust[]} topla, min_proje filtrele."""
    kova = defaultdict(lambda: {"proje": 0, "konut": 0, "giris": [], "ust": []})
    for r in rows:
        k = anahtar_fn(r)
        if not k:
            continue
        b = kova[k]
        b["proje"] += 1
        if r["konut_sayisi"].isdigit():
            b["konut"] += int(r["konut_sayisi"])
        giris, ust = satir_metrikleri(r)
        if giris:
            b["giris"].append(giris)
        if ust:
            b["ust"].append(ust)
    return {k: v for k, v in kova.items() if v["proje"] >= min_proje}


def yaz_csv(yol, basliklar, satirlar):
    with yol.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(basliklar)
        w.writerows(satirlar)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--min-proje", type=int, default=3, help="kırılım için min proje sayısı")
    ap.add_argument("--json", metavar="YOL", help="uygulama için kompakt JSON lookup yaz (ör. ../../src/data/bolge-benchmark.json)")
    a = ap.parse_args()

    girdi = CIKTI / "projeler.csv"
    if not girdi.exists():
        raise SystemExit(f"Girdi yok: {girdi} — önce emlakjet_envanteri.py koş.")
    rows = list(csv.DictReader(girdi.open(encoding="utf-8")))

    # --- İL bazlı ---
    il_kovalari = toparla(rows, lambda r: r["il"] or None, a.min_proje)
    il_satir = []
    for il, b in sorted(il_kovalari.items(), key=lambda kv: -kv[1]["proje"]):
        il_satir.append([il, b["proje"], b["konut"], medyan(b["giris"]), medyan(b["ust"])])
    yaz_csv(CIKTI / "benchmark-il.csv",
            ["il", "proje", "konut", "tl_m2_giris_medyan", "tl_m2_ust_medyan"], il_satir)

    # --- İL + İLÇE bazlı ---
    ilce_kovalari = toparla(rows, lambda r: f"{r['il']} / {r['ilce']}" if r["il"] and r["ilce"] else None, a.min_proje)
    ilce_satir = []
    for k, b in sorted(ilce_kovalari.items(), key=lambda kv: -(kv[1]["giris"] and medyan(kv[1]["giris"]) or 0)):
        il, _, ilce = k.partition(" / ")
        ilce_satir.append([il, ilce, b["proje"], b["konut"], medyan(b["giris"]), medyan(b["ust"])])
    yaz_csv(CIKTI / "benchmark-ilce.csv",
            ["il", "ilce", "proje", "konut", "tl_m2_giris_medyan", "tl_m2_ust_medyan"], ilce_satir)

    # --- Özet md ---
    tum_giris = [g for r in rows for g in [satir_metrikleri(r)[0]] if g]
    L = ["# Emlakjet Fiyat Benchmark (₺/m²)", ""]
    L.append(f"- Toplam proje: **{len(rows)}**")
    L.append(f"- ₺/m² giriş medyanı (ülke geneli): **{medyan(tum_giris):,}**".replace(",", "."))
    L.append(f"- Kırılım eşiği: en az {a.min_proje} proje")
    L.append("")
    L.append("## İl bazlı ₺/m² (giriş medyanı, en çok projeli 15)")
    L.append("| İl | Proje | Konut | ₺/m² giriş | ₺/m² üst |")
    L.append("|---|--:|--:|--:|--:|")
    for il, proje, konut, giris, ust in il_satir[:15]:
        g = f"{giris:,}".replace(",", ".") if giris != "" else "-"
        u = f"{ust:,}".replace(",", ".") if ust != "" else "-"
        L.append(f"| {il} | {proje} | {konut} | {g} | {u} |")
    L.append("")
    L.append("## En pahalı ilçeler (₺/m² giriş medyanı, top 15)")
    L.append("| İl / İlçe | Proje | ₺/m² giriş | ₺/m² üst |")
    L.append("|---|--:|--:|--:|")
    for il, ilce, proje, konut, giris, ust in ilce_satir[:15]:
        g = f"{giris:,}".replace(",", ".") if giris != "" else "-"
        u = f"{ust:,}".replace(",", ".") if ust != "" else "-"
        L.append(f"| {il} / {ilce} | {proje} | {g} | {u} |")
    (CIKTI / "benchmark.md").write_text("\n".join(L) + "\n", encoding="utf-8")

    print(f"İl kırılımı: {len(il_satir)} satır -> benchmark-il.csv")
    print(f"İlçe kırılımı: {len(ilce_satir)} satır -> benchmark-ilce.csv")
    print(f"Özet: benchmark.md")

    # --- Uygulama için kompakt JSON lookup ---
    if a.json:
        veri = {
            "kaynak": "emlakjet",
            "olcu": "tl_m2_giris_medyan",
            "not": "Liste/başlayan fiyattan türetilmiş yaklaşık ₺/m² medyanı; satış değil, benchmark.",
            "proje_toplam": len(rows),
            "min_proje": a.min_proje,
            "il": {il: {"m2": giris, "proje": proje} for il, proje, konut, giris, ust in il_satir if giris != ""},
            "ilce": {
                f"{il}/{ilce}": {"m2": giris, "proje": proje}
                for il, ilce, proje, konut, giris, ust in ilce_satir if giris != ""
            },
        }
        yol = Path(a.json)
        yol.parent.mkdir(parents=True, exist_ok=True)
        yol.write_text(json.dumps(veri, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"JSON lookup: {len(veri['il'])} il + {len(veri['ilce'])} ilçe -> {yol}")


if __name__ == "__main__":
    main()
