#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Müteahhit B2B işbirliği skoru — Projedar dağıtım ağı için öncelik listesi.

Projedar'ın müteahhide sattığı şey stok dağıtımıdır. Dolayısıyla en değerli
muhatap "en büyük firma" değil, **satılabilir stoğu olan ve o stoğu eritmekte
zorlanan** firmadır. Skor bunu ölçer.

Skor bileşenleri (toplam 10):
  aktif stok              0-3   dağıtılacak envanter var mı (asıl ürün-uyumu)
  aktif proje sayısı      0-2   çok projeli = ağ etkisi, tek panelden yönetim değeri
  stok taşıma sinyali     0-2   teslim tarihi geçmiş ama hâlâ satışta = acil ihtiyaç
  yavaş erime             0-1   uzun süredir kayıtta, satış yüzdesi düşük
  iletişim erişilebilirliği 0-1 telefon/web/e-posta var mı (temas kurulabilir mi)
  şehir çeşitliliği       0-1   birden fazla ilde faaliyet

Sınıflandırma (brief'in A-E ölçeği):
  A çok yüksek  aktif proje >= 2 ve aktif stok >= 100
  B yüksek      aktif proje >= 1 ve aktif stok >= 30
  C orta        aktif proje >= 1 (stok küçük veya bilinmiyor)
  D düşük       aktif proje yok, geçmiş proje var
  E veri yetersiz

Not: stok alanı projelerin bir kısmında boş. Skor bunu "0 stok" saymaz;
`stok_verisi_olan_proje` kolonu ile kaç projenin gerçekten ölçüldüğü görünür.
Bu yüzden düşük skor "stok yok" değil, "stok doğrulanamadı" olabilir.

Kullanım:
  python3 lead_skor.py
  python3 lead_skor.py --min-skor 6      # yalnız öncelikli olanlar
"""

from __future__ import annotations

import argparse
import csv
from collections import defaultdict
from datetime import date

from ortak import CIKTI, stok_hareketli

CIKAN_ALAN = [
    "sira", "firma", "firma_slug", "il", "ilce", "telefon", "web_sitesi",
    "eposta_kurumsal", "adres", "toplam_proje", "aktif_proje", "toplam_konut",
    "aktif_stok", "dogrulanmis_stok", "durgun_stok", "stok_verisi_olan_proje",
    "ort_satis_yuzdesi", "teslimi_gecmis_stoklu_proje", "sehir_sayisi",
    "son_kayit_tarihi", "b2b_skor", "sinif", "gerekce", "kaynak",
]


def _sayi(deger, varsayilan=0.0) -> float:
    try:
        return float(str(deger).strip())
    except (TypeError, ValueError):
        return varsayilan


def main() -> int:
    ap = argparse.ArgumentParser(description="Müteahhit B2B işbirliği skoru")
    ap.add_argument("--min-skor", type=float, default=0.0)
    a = ap.parse_args()

    proje_yolu, firma_yolu = CIKTI / "proje.csv", CIKTI / "firma.csv"
    if not proje_yolu.exists() or not firma_yolu.exists():
        print("HATA: proje.csv / firma.csv yok. Önce proje_detay.py çalıştır.")
        return 1

    with proje_yolu.open(encoding="utf-8") as f:
        projeler = list(csv.DictReader(f))
    with firma_yolu.open(encoding="utf-8") as f:
        firmalar = {r["firma_slug"]: r for r in csv.DictReader(f) if r.get("firma_slug")}

    bugun = date.today().isoformat()
    grup: dict[str, list[dict]] = defaultdict(list)
    for p in projeler:
        if p.get("firma_slug"):
            grup[p["firma_slug"]].append(p)

    satirlar = []
    for slug, firma in firmalar.items():
        pl = grup.get(slug, [])
        aktif = [p for p in pl if p.get("satis_durumu") == "ONGOING"]

        toplam_konut = sum(int(_sayi(p.get("toplam_bagimsiz_bolum"))) for p in pl)
        stoklu = [p for p in aktif if str(p.get("kalan_stok", "")).strip() != ""]
        aktif_stok = sum(int(_sayi(p.get("kalan_stok"))) for p in stoklu)

        # Durgun kayıt (kalan == toplam, satış %0) "stok var" kanıtı değil; skoru
        # doğrulanmış stok belirler, durgun stok ayrı kolonda görünür.
        hareketli = [
            p for p in stoklu
            if stok_hareketli(p.get("kalan_stok"), p.get("toplam_bagimsiz_bolum"),
                              p.get("satis_yuzdesi"))
        ]
        dogrulanmis_stok = sum(int(_sayi(p.get("kalan_stok"))) for p in hareketli)
        durgun_stok = aktif_stok - dogrulanmis_stok

        yuzdeler = [_sayi(p.get("satis_yuzdesi"), -1) for p in aktif]
        yuzdeler = [y for y in yuzdeler if y >= 0]
        ort_yuzde = round(sum(yuzdeler) / len(yuzdeler), 3) if yuzdeler else ""

        # Teslim tarihi geçmiş ama hâlâ satışta ve stoğu olan proje: en sıcak sinyal.
        gecmis_stoklu = [
            p for p in hareketli
            if p.get("teslim_tarihi") and p["teslim_tarihi"] < bugun
            and int(_sayi(p.get("kalan_stok"))) > 0
        ]

        sehirler = {p.get("il") for p in pl if p.get("il")}
        son_kayit = max((p.get("kayit_tarihi") or "" for p in pl), default="")

        # --- skor ---
        skor, neden = 0.0, []
        if dogrulanmis_stok >= 200:
            skor += 3; neden.append(f"{dogrulanmis_stok} doğrulanmış stok")
        elif dogrulanmis_stok >= 60:
            skor += 2; neden.append(f"{dogrulanmis_stok} doğrulanmış stok")
        elif dogrulanmis_stok >= 15:
            skor += 1; neden.append(f"{dogrulanmis_stok} doğrulanmış stok")
        if durgun_stok >= 100:
            neden.append(f"ayrıca {durgun_stok} durgun kayıt (teyit gerek)")

        if len(aktif) >= 4:
            skor += 2; neden.append(f"{len(aktif)} aktif proje")
        elif len(aktif) >= 2:
            skor += 1.5; neden.append(f"{len(aktif)} aktif proje")
        elif len(aktif) == 1:
            skor += 0.5; neden.append("1 aktif proje")

        if len(gecmis_stoklu) >= 2:
            skor += 2; neden.append(f"{len(gecmis_stoklu)} projede teslim geçti, stok duruyor")
        elif len(gecmis_stoklu) == 1:
            skor += 1; neden.append("teslim geçmiş projede stok duruyor")

        if yuzdeler and ort_yuzde != "" and float(ort_yuzde) < 0.5 and dogrulanmis_stok >= 30:
            skor += 1; neden.append(f"ortalama satış %{float(ort_yuzde) * 100:.0f}, erime yavaş")

        iletisim = sum(
            1 for k in ("telefon", "web_sitesi", "eposta_kurumsal") if firma.get(k, "").strip()
        )
        if iletisim >= 2:
            skor += 1; neden.append("iletişim kanalı açık")
        elif iletisim == 1:
            skor += 0.5

        if len(sehirler) >= 2:
            skor += 1; neden.append(f"{len(sehirler)} ilde faaliyet")

        skor = round(min(skor, 10.0), 1)

        if len(aktif) >= 2 and dogrulanmis_stok >= 100:
            sinif = "A"
        elif len(aktif) >= 1 and dogrulanmis_stok >= 30:
            sinif = "B"
        elif len(aktif) >= 1:
            sinif = "C"
        elif pl:
            sinif = "D"
        else:
            sinif = "E"

        if not pl:
            neden.append("bu taramada projesi eşleşmedi, veri yetersiz")
        elif not stoklu and aktif:
            neden.append("stok alanı boş, doğrulanmadı")

        satirlar.append(
            {
                "firma": firma.get("ad", ""),
                "firma_slug": slug,
                "il": firma.get("il", ""),
                "ilce": firma.get("ilce", ""),
                "telefon": firma.get("telefon", ""),
                "web_sitesi": firma.get("web_sitesi", ""),
                "eposta_kurumsal": firma.get("eposta_kurumsal", ""),
                "adres": firma.get("adres", ""),
                "toplam_proje": len(pl),
                "aktif_proje": len(aktif),
                "toplam_konut": toplam_konut,
                "aktif_stok": aktif_stok,
                "dogrulanmis_stok": dogrulanmis_stok,
                "durgun_stok": durgun_stok,
                "stok_verisi_olan_proje": len(stoklu),
                "ort_satis_yuzdesi": ort_yuzde,
                "teslimi_gecmis_stoklu_proje": len(gecmis_stoklu),
                "sehir_sayisi": len(sehirler),
                "son_kayit_tarihi": son_kayit,
                "b2b_skor": skor,
                "sinif": sinif,
                "gerekce": "; ".join(neden) or "sinyal yok",
                "kaynak": firma.get("kaynak", ""),
            }
        )

    satirlar.sort(key=lambda r: (-r["b2b_skor"], -r["dogrulanmis_stok"], -r["aktif_proje"]))
    satirlar = [r for r in satirlar if r["b2b_skor"] >= a.min_skor]
    for i, r in enumerate(satirlar, 1):
        r["sira"] = i

    yol = CIKTI / "lead.csv"
    with yol.open("w", encoding="utf-8", newline="") as f:
        y = csv.DictWriter(f, fieldnames=CIKAN_ALAN)
        y.writeheader()
        for r in satirlar:
            y.writerow({k: r.get(k, "") for k in CIKAN_ALAN})

    dagilim: dict[str, int] = defaultdict(int)
    for r in satirlar:
        dagilim[r["sinif"]] += 1
    print(f"-> {yol} ({len(satirlar)} firma)")
    print(f"Sınıf dağılımı: {dict(sorted(dagilim.items()))}")
    print(f"Doğrulanmış stok: {sum(r['dogrulanmis_stok'] for r in satirlar)} konut · "
          f"durgun (teyit gerek): {sum(r['durgun_stok'] for r in satirlar)} konut")
    print("\nEn öncelikli 15:")
    for r in satirlar[:15]:
        print(f"  {r['sira']:3}. [{r['sinif']}] {r['b2b_skor']:4} {r['firma'][:28]:30} "
              f"doğru={r['dogrulanmis_stok']:<5} durgun={r['durgun_stok']:<5} "
              f"aktif={r['aktif_proje']:<3} {r['gerekce'][:48]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
