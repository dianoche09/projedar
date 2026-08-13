#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Envanter analizi — brief'in "ANA ANALİZLER" bölümünün veri destekleyen kısmı.

Üretilmeyen analizler ve nedeni raporun sonunda AÇIKÇA listelenir. Satış hızı,
sell-through süresi ve sold-out tarihi tek anlık ölçümden çıkarılamaz; en az iki
farklı tarihli snapshot gerekir. Bu rapor onları "tahmin" diye uydurmaz.

Kullanım: python3 analiz.py
Çıktı:    cikti/rapor.md
"""

from __future__ import annotations

import csv
from collections import defaultdict
from datetime import date

from ortak import CIKTI, stok_hareketli


def sayi(d, v=0.0) -> float:
    try:
        return float(str(d).strip())
    except (TypeError, ValueError):
        return v


def oku(ad: str) -> list[dict]:
    yol = CIKTI / ad
    if not yol.exists():
        return []
    with yol.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def ay_farki(bas: str, son: str) -> int | None:
    """İki YYYY-MM-DD arasındaki tam ay farkı."""
    if not bas or not son:
        return None
    try:
        by, bm = int(bas[:4]), int(bas[5:7])
        sy, sm = int(son[:4]), int(son[5:7])
    except ValueError:
        return None
    return (sy - by) * 12 + (sm - bm)


def main() -> int:
    projeler = oku("proje.csv")
    firmalar = oku("firma.csv")
    tipler = oku("konut_tipi.csv")
    leadler = oku("lead.csv")
    seri = oku("stok-zaman-serisi.csv")
    if not projeler:
        print("HATA: proje.csv yok. Önce proje_detay.py çalıştır.")
        return 1

    bugun = date.today().isoformat()
    aktif = [p for p in projeler if p.get("satis_durumu") == "ONGOING"]
    biten = [p for p in projeler if p.get("satis_durumu") == "FINISHED"]
    stoklu = [p for p in aktif if str(p.get("kalan_stok", "")).strip() != ""]
    toplam_stok = sum(int(sayi(p["kalan_stok"])) for p in stoklu)

    # Kayıt eskimesi ayrımı: kalan == toplam ve satış %0 olan kayıtlar bir kez
    # girilip güncellenmemiş olabilir; "stok var" kanıtı sayılmaz.
    hareketli = [
        p for p in stoklu
        if stok_hareketli(p.get("kalan_stok"), p.get("toplam_bagimsiz_bolum"),
                          p.get("satis_yuzdesi"))
    ]
    durgun = [p for p in stoklu if p not in hareketli]
    stok_hareketli_top = sum(int(sayi(p["kalan_stok"])) for p in hareketli)
    stok_durgun_top = sum(int(sayi(p["kalan_stok"])) for p in durgun)

    L: list[str] = []
    ek = L.append
    ek("# Türkiye Konut Projesi / Müteahhit Envanteri — Analiz")
    ek("")
    ek(f"Üretim tarihi: {bugun} · Kaynak: emlakjet proje detay payload'ı (`initialProject`)")
    ek("")

    # --- 1. Genel ---
    ek("## 1. Genel tablo")
    ek("")
    ek("| Ölçü | Değer |")
    ek("|---|---|")
    ek(f"| Tespit edilen geliştirici / müteahhit | {len(firmalar)} |")
    ek(f"| Tespit edilen konut projesi | {len(projeler)} |")
    ek(f"| Satışı süren proje (ONGOING) | {len(aktif)} |")
    ek(f"| Satışı tamamlanmış proje (FINISHED) | {len(biten)} |")
    ek(f"| Kalan stoğu **ölçülen** proje | {len(stoklu)} |")
    ek(f"| — bunun satış hareketi **görüleni** | {len(hareketli)} |")
    ek(f"| — kaydı güncellenmemiş görüneni | {len(durgun)} |")
    ek(f"| **Doğrulanmış kalan stok** (hareket görülen) | **{stok_hareketli_top:,} konut** |".replace(",", "."))
    ek(f"| Doğrulanmamış kalan stok (durgun kayıt) | {stok_durgun_top:,} konut |".replace(",", "."))
    ek(f"| Ham toplam (ikisi birlikte) | {toplam_stok:,} konut |".replace(",", "."))
    ek(f"| Kayıtlı toplam bağımsız bölüm | {sum(int(sayi(p['toplam_bagimsiz_bolum'])) for p in projeler):,} |".replace(",", "."))
    ek(f"| Konut tipi kaydı | {len(tipler)} |")
    ek("")
    ek("> **Ham stok toplamını tek başına kullanma.** Projelerin bir kısmında kalan "
       "stok toplam bağımsız bölüme eşit ve satış yüzdesi 0; bu kayıtlar bir kez "
       "girilip güncellenmemiş olabilir (teslim tarihi geçmiş bir projede %0 satış "
       "gerçekçi değil). Bu yüzden stok iki gruba ayrıldı. Karar verirken "
       "**doğrulanmış** rakamı esas al; durgun grup ancak snapshot serisinde hareket "
       "görülürse doğrulanır.")
    ek("")
    ek("> Kalan stok yalnız projelerin bir kısmında yayımlanır. Eksik olan projeler "
       "'0 stok' sayılmaz.")
    ek("")

    # --- 2. Veri kalitesi ---
    guven = defaultdict(int)
    for p in projeler:
        guven[p.get("veri_guven", "E")] += 1
    ek("## 2. Veri güven dağılımı")
    ek("")
    ek("| Seviye | Anlam | Proje |")
    ek("|---|---|---|")
    for s, aciklama in [
        ("A", "kalan stok **ve** satış yüzdesi dolu"),
        ("B", "ikisinden biri dolu"),
        ("C", "yalnız satış durumu var"),
        ("E", "satış verisi yok"),
    ]:
        ek(f"| {s} | {aciklama} | {guven.get(s, 0)} |")
    ek("")

    # --- 3. İl ---
    il = defaultdict(lambda: {"proje": 0, "konut": 0, "aktif": 0, "stok": 0})
    for p in projeler:
        k = p.get("il") or "(bilinmiyor)"
        il[k]["proje"] += 1
        il[k]["konut"] += int(sayi(p["toplam_bagimsiz_bolum"]))
        if p.get("satis_durumu") == "ONGOING":
            il[k]["aktif"] += 1
            il[k]["stok"] += int(sayi(p.get("kalan_stok")))
    ek("## 3. İl bazında")
    ek("")
    ek("| İl | Proje | Bağımsız bölüm | Aktif proje | Kalan stok |")
    ek("|---|---|---|---|---|")
    for k, v in sorted(il.items(), key=lambda x: -x[1]["proje"]):
        ek(f"| {k} | {v['proje']} | {v['konut']:,} | {v['aktif']} | {v['stok']:,} |".replace(",", "."))
    ek("")

    # --- 4. İlçe ---
    ilce = defaultdict(lambda: {"proje": 0, "konut": 0, "stok": 0})
    for p in projeler:
        k = f"{p.get('il', '')} / {p.get('ilce', '')}".strip(" /") or "(bilinmiyor)"
        ilce[k]["proje"] += 1
        ilce[k]["konut"] += int(sayi(p["toplam_bagimsiz_bolum"]))
        if p.get("satis_durumu") == "ONGOING":
            ilce[k]["stok"] += int(sayi(p.get("kalan_stok")))
    ek("## 4. İlçe bazında (en çok projeli 30)")
    ek("")
    ek("| İl / İlçe | Proje | Bağımsız bölüm | Kalan stok |")
    ek("|---|---|---|---|")
    for k, v in sorted(ilce.items(), key=lambda x: -x[1]["proje"])[:30]:
        ek(f"| {k} | {v['proje']} | {v['konut']:,} | {v['stok']:,} |".replace(",", "."))
    ek("")

    # --- 5. En fazla aktif stoğu olan geliştiriciler ---
    ek("## 5. En fazla aktif stoğu olan geliştiriciler (B2B önceliği)")
    ek("")
    ek("| # | Firma | İl | Aktif proje | Kalan stok | Skor | Sınıf |")
    ek("|---|---|---|---|---|---|---|")
    for r in sorted(leadler, key=lambda x: -sayi(x.get("aktif_stok")))[:30]:
        ek(f"| {r['sira']} | {r['firma']} | {r['il']} | {r['aktif_proje']} | "
           f"{int(sayi(r['aktif_stok'])):,} | {r['b2b_skor']} | {r['sinif']} |".replace(",", "."))
    ek("")

    # --- 6. En yavaş stok eriten projeler ---
    yavas = []
    for p in hareketli:
        t = p.get("teslim_tarihi") or ""
        kalan = int(sayi(p.get("kalan_stok")))
        if t and t < bugun and kalan > 0:
            yavas.append((ay_farki(t, bugun) or 0, kalan, p))
    yavas.sort(key=lambda x: (-x[1], -x[0]))
    durgun_teslim = [
        p for p in durgun
        if p.get("teslim_tarihi") and p["teslim_tarihi"] < bugun
    ]
    ek("## 6. En yavaş stok eriten projeler (teslim geçti, stok duruyor)")
    ek("")
    ek("Projedar açısından en sıcak işbirliği sinyali: teslim tarihi geçmiş ama "
       "geliştirici hâlâ stok taşıyor. **Yalnız satış hareketi doğrulanmış kayıtlar** "
       "listelenir; durgun kayıtlar aşağıda ayrıca sayılır.")
    ek("")
    ek("| Proje | Geliştirici | İl / İlçe | Toplam | Kalan | Satış % | Teslimden geçen ay |")
    ek("|---|---|---|---|---|---|---|")
    for gecen, kalan, p in yavas[:30]:
        sy = sayi(p.get("satis_yuzdesi"), -1)
        sy = f"%{sy * 100:.0f}" if sy >= 0 else "-"
        ek(f"| {p['ad']} | {p['gelistirici']} | {p['il']} / {p['ilce']} | "
           f"{p['toplam_bagimsiz_bolum']} | {kalan} | {sy} | {gecen} |")
    ek("")
    ek(f"Ayrıca **{len(durgun_teslim)} projede** teslim tarihi geçmiş ama kayıt durgun "
       f"(kalan = toplam, satış %0). Bunlar listeye alınmadı: gerçekten stok taşıyor da "
       f"olabilirler, kaydı güncellenmemiş de. Snapshot serisinde iki ölçüm arasında "
       f"değişim görülürse doğrulanmış gruba geçerler. Temas öncesi teyit gerektirir.")
    ek("")

    # --- 7. Teslim öncesi satışı tamamlananlar ---
    onceden = [
        p for p in biten
        if p.get("teslim_tarihi") and p["teslim_tarihi"] > bugun
    ]
    ek("## 7. Teslimden önce satışı tamamlanan projeler")
    ek("")
    if onceden:
        ek("| Proje | Geliştirici | İl / İlçe | Bağımsız bölüm | Planlanan teslim |")
        ek("|---|---|---|---|---|")
        for p in sorted(onceden, key=lambda x: -sayi(x["toplam_bagimsiz_bolum"]))[:25]:
            ek(f"| {p['ad']} | {p['gelistirici']} | {p['il']} / {p['ilce']} | "
               f"{p['toplam_bagimsiz_bolum']} | {p['teslim_tarihi']} |")
    else:
        ek("Bu taramada kayıt bulunmadı.")
    ek("")

    # --- 8. Konut tipi ---
    tip = defaultdict(lambda: {"adet": 0, "m2": [], "tlm2": []})
    for t in tipler:
        k = t.get("oda_tipi") or "(bilinmiyor)"
        tip[k]["adet"] += 1
        if sayi(t.get("brut_m2")) > 0:
            tip[k]["m2"].append(sayi(t["brut_m2"]))
        if sayi(t.get("tl_m2")) > 0:
            tip[k]["tlm2"].append(sayi(t["tl_m2"]))
    ek("## 8. Konut tipi bazında (tip kataloğu)")
    ek("")
    ek("| Oda tipi | Tip kaydı | Ortalama brüt m² | Medyan ₺/m² |")
    ek("|---|---|---|---|")
    for k, v in sorted(tip.items(), key=lambda x: -x[1]["adet"]):
        om = f"{sum(v['m2']) / len(v['m2']):.0f}" if v["m2"] else "-"
        if v["tlm2"]:
            s = sorted(v["tlm2"])
            med = f"{s[len(s) // 2]:,.0f}".replace(",", ".")
        else:
            med = "-"
        ek(f"| {k} | {v['adet']} | {om} | {med} |")
    ek("")

    # --- 9. Üretilemeyenler ---
    ek("## 9. Bu turda ÜRETİLEMEYEN analizler ve nedeni")
    ek("")
    ek("| Brief'teki analiz | Neden üretilmedi |")
    ek("|---|---|")
    if len(seri) == 0:
        seri_not = "henüz snapshot yok"
    else:
        tarihler = sorted({r.get("tarih", "") for r in seri if r.get("tarih")})
        seri_not = f"{len(tarihler)} tarihli snapshot var ({', '.join(tarihler)})"
    ek(f"| Aylık satış hızı, %50/%75/%90 sell-through süresi, sold-out tarihi | En az 2 "
       f"farklı tarihli ölçüm gerekir; {seri_not}. `snapshot.py` haftalık biriktirir. |")
    ek("| En hızlı satılan 100 proje | Satış başlangıcı ve bitişi A/B güven seviyesinde "
       "birlikte bilinen proje yok. Tahminle sıralama brief'in kendi D/E kuralına aykırı. |")
    ek("| Ada / parsel, yapı ruhsatı, yapı kullanım izni | Bu kaynakta yok; toplu ve "
       "sorgulanabilir kamu veri seti de bulunmuyor. |")
    ek("| Geriye dönük fiyat tarihçesi | Payload yalnız güncel fiyatı verir. Snapshot "
       "serisi ileriye dönük fiyat tarihçesi üretir. |")
    ek("| Tip başına **adet** kırılımı (kaç adet 2+1) | `flatTypes` tip kataloğudur, adet "
       "taşımaz. Yalnız proje açıklamasında geçtiğinde çıkarılabiliyor. |")
    ek("| Blok / etap sayısı | Yapısal alan değil; açıklama metninden regex ile çıkarıldı "
       "ve `blok_etap_kaynak=Tahmini` olarak işaretlendi. |")
    ek("| İlk stok vs satışa sunulan stok ayrımı | Arsa sahibi payı / müteahhit stoğu "
       "ayrışmıyor; `toplam_bagimsiz_bolum` ham değerdir. |")
    ek("")

    (CIKTI / "rapor.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    print(f"-> {CIKTI / 'rapor.md'}")
    print(f"proje={len(projeler)} firma={len(firmalar)} aktif={len(aktif)} "
          f"stok={toplam_stok} il={len(il)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
