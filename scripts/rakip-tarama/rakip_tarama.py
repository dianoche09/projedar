#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Projedar sistematik rakip tarama — SerpAPI ile.

Faz 1 (default): 50 ulusal sorgu -> domain keşfi + ön skor.
Faz 2 (--local): lokasyon-duyarlı sorgular x şehir.
Faz 3 (--enrich): hayatta kalan domainlere site: indeks sayımı + anasayfa tarama.

Cache: her ham SerpAPI cevabı cikti/ham/ altına yazılır; tekrar koşuda API'ye
gidilmez (para harcanmaz). Bütçe: --max-aramalar sert tavan. --kuru = dry-run.

Bağımlılık YOK — sadece Python stdlib (urllib). pip install gerekmez.

API anahtarı: otomatik bulunur — sırasıyla (1) --anahtar, (2) ortam değişkeni
(adında SERP geçen), (3) proje kökündeki .env.local / .env dosyaları taranır.

Kullanım:
  python3 rakip_tarama.py --kuru                 # plan + tahmini maliyet, API yok
  python3 rakip_tarama.py                         # Faz 1 (ulusal, ~50 arama)
  python3 rakip_tarama.py --local                 # + lokasyon varyantları
  python3 rakip_tarama.py --enrich --max-aramalar 80
"""

import argparse
import csv
import hashlib
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

import sorgular as CFG

BURASI = Path(__file__).resolve().parent
PROJE_KOK = BURASI.parent.parent
CIKTI = BURASI / "cikti"
HAM = CIKTI / "ham"
SERPAPI_URL = "https://serpapi.com/search.json"


# ---------------------------------------------------------------------------
# API anahtarı bulma
# ---------------------------------------------------------------------------
def _env_dosyasindan_oku(dosya: Path):
    """.env.local / .env içinden adında SERP geçen ilk anahtarı döndür."""
    if not dosya.exists():
        return None
    try:
        for satir in dosya.read_text(encoding="utf-8").splitlines():
            satir = satir.strip()
            if not satir or satir.startswith("#") or "=" not in satir:
                continue
            ad, _, deger = satir.partition("=")
            ad = ad.strip().replace("export ", "")
            if "SERP" in ad.upper():
                return deger.strip().strip('"').strip("'")
    except OSError:
        return None
    return None


def anahtar_bul(cli_anahtar):
    if cli_anahtar:
        return cli_anahtar, "--anahtar"
    for ad, deger in os.environ.items():
        if "SERP" in ad.upper() and deger:
            return deger, f"ortam:{ad}"
    for dosya in (PROJE_KOK / ".env.local", PROJE_KOK / ".env"):
        deger = _env_dosyasindan_oku(dosya)
        if deger:
            return deger, str(dosya.name)
    return None, None


# ---------------------------------------------------------------------------
# Sorgu planı
# ---------------------------------------------------------------------------
def plan_olustur(local: bool):
    plan = [{"q": q, "etiket": "ulusal"} for q in CFG.ULUSAL_SORGULAR]
    if local:
        for sablon in CFG.LOKASYON_SORGULARI:
            for sehir in CFG.SEHIRLER:
                plan.append({"q": sablon.format(sehir=sehir), "etiket": f"local:{sehir}"})
    return plan


# ---------------------------------------------------------------------------
# SerpAPI çağrısı (cache'li)
# ---------------------------------------------------------------------------
def _cache_yolu(params):
    imza = json.dumps(params, sort_keys=True, ensure_ascii=False)
    ad = hashlib.sha1(imza.encode("utf-8")).hexdigest()[:16]
    return HAM / f"{ad}.json"


def serpapi_ara(params, anahtar, kuru, butce):
    """Cache varsa onu döndür. Yoksa ve bütçe varsa API'yi çağır.
    Döner: (veri|None, api_kullanildi_mi)."""
    yol = _cache_yolu(params)
    if yol.exists():
        try:
            return json.loads(yol.read_text(encoding="utf-8")), False
        except json.JSONDecodeError:
            pass
    if kuru:
        return None, False
    if butce["kalan"] <= 0:
        return None, False

    tam = dict(params)
    tam["api_key"] = anahtar
    url = SERPAPI_URL + "?" + urllib.parse.urlencode(tam)
    istek = urllib.request.Request(url, headers={"User-Agent": "projedar-rakip-tarama/1.0"})
    try:
        with urllib.request.urlopen(istek, timeout=45) as cevap:
            veri = json.loads(cevap.read().decode("utf-8"))
    except Exception as hata:  # noqa: BLE001 - ağ hatası çeşitli olabilir
        print(f"  ! API hatası: {hata}", file=sys.stderr)
        butce["kalan"] -= 1  # başarısız çağrı da genelde kredi yakar
        return None, True
    if "error" in veri:
        print(f"  ! SerpAPI: {veri['error']}", file=sys.stderr)
        butce["kalan"] -= 1
        return None, True
    yol.write_text(json.dumps(veri, ensure_ascii=False), encoding="utf-8")
    butce["kalan"] -= 1
    return veri, True


# ---------------------------------------------------------------------------
# Domain çıkarımı + gürültü filtresi
# ---------------------------------------------------------------------------
# İki seviyeli public suffix'ler (buralarda registrable domain = son 3 label).
IKI_SEVIYE_SUFFIX = {
    # Türkiye
    "com.tr", "gen.tr", "org.tr", "biz.tr", "info.tr", "av.tr", "dr.tr",
    "pol.tr", "bel.tr", "mil.tr", "tsk.tr", "k12.tr", "edu.tr", "kep.tr",
    "gov.tr", "web.tr", "tv.tr", "name.tr", "net.tr",
    # yaygın yabancı
    "co.uk", "org.uk", "com.au", "co.nz", "com.br",
}


def domain_cek(link):
    try:
        host = urllib.parse.urlparse(link).netloc.lower()
    except ValueError:
        return None
    if ":" in host:
        host = host.split(":", 1)[0]
    if host.startswith("www."):
        host = host[4:]
    parcalar = host.split(".")
    if len(parcalar) >= 3 and ".".join(parcalar[-2:]) in IKI_SEVIYE_SUFFIX:
        host = ".".join(parcalar[-3:])
    elif len(parcalar) >= 2:
        host = ".".join(parcalar[-2:])
    return host or None


def gurultu_mu(domain):
    if domain in CFG.GURULTU_DOMAINLERI:
        return True
    return any(p in domain for p in CFG.GURULTU_PARCALARI)


# ---------------------------------------------------------------------------
# Skorlama
# ---------------------------------------------------------------------------
def directness_skorla(metin):
    metin = metin.lower()
    toplam = 0.0
    max_toplam = 0.0
    vurulan_eksen = set()
    detay = {}
    for eksen, cfg in CFG.LEKSIKON.items():
        max_toplam += cfg["agirlik"]
        vuruldu = any(k in metin for k in cfg["kelimeler"])
        if vuruldu:
            toplam += cfg["agirlik"]
            vurulan_eksen.add(eksen)
            detay[eksen] = 1
        else:
            detay[eksen] = 0
    # nadir kombo bonusu: A+B+C
    if {"A_cok_muteahhit", "B_emlakci_agi", "C_canli_stok"} <= vurulan_eksen:
        toplam += CFG.NADIR_KOMBO_BONUS
        max_toplam += CFG.NADIR_KOMBO_BONUS
    skor = round(100 * toplam / max_toplam) if max_toplam else 0
    return skor, detay


def sinifla(skor, urun_sinyali, supheli):
    if supheli >= 2 and urun_sinyali <= 1:
        return "İzle / doğrulanmadı"
    if skor >= CFG.ESIK_DIRECT:
        return "Direct"
    if skor >= CFG.ESIK_ADJACENT:
        return "Adjacent"
    return "Uzak / benchmark?"


# ---------------------------------------------------------------------------
# Anasayfa enrichment (ücretsiz HTTP fetch)
# ---------------------------------------------------------------------------
def anasayfa_tara(domain):
    for sema in ("https://", "http://"):
        try:
            istek = urllib.request.Request(
                sema + domain,
                headers={"User-Agent": "Mozilla/5.0 (compatible; projedar-tarama/1.0)"},
            )
            with urllib.request.urlopen(istek, timeout=8) as cevap:
                ham = cevap.read(300_000).decode("utf-8", errors="ignore").lower()
            urun = sum(1 for s in CFG.URUN_SINYALLERI if s in ham)
            supheli = sum(1 for s in CFG.SUPHELI_SINYALLER if s in ham)
            return {"erisildi": True, "urun_sinyali": urun, "supheli": supheli}
        except Exception:  # noqa: BLE001
            continue
    return {"erisildi": False, "urun_sinyali": 0, "supheli": 0}


# ---------------------------------------------------------------------------
# Ana akış
# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Projedar rakip tarama (SerpAPI)")
    ap.add_argument("--kuru", action="store_true", help="dry-run: plan+maliyet, API çağrısı yok")
    ap.add_argument("--local", action="store_true", help="lokasyon-duyarlı sorguları da ekle")
    ap.add_argument("--enrich", action="store_true", help="hayatta kalan domainleri zenginleştir")
    ap.add_argument("--num", type=int, default=20, help="sorgu başına sonuç (varsayılan 20)")
    ap.add_argument("--max-aramalar", type=int, default=60, help="sert bütçe tavanı (varsayılan 60)")
    ap.add_argument("--enrich-top", type=int, default=60, help="kaç domain zenginleştirilsin")
    ap.add_argument("--indeks", action="store_true", help="enrich'te site: indeks sayımı da yap (kredi harcar)")
    ap.add_argument("--anahtar", default=None, help="SerpAPI anahtarı (yoksa env/.env.local)")
    args = ap.parse_args()

    HAM.mkdir(parents=True, exist_ok=True)
    plan = plan_olustur(args.local)

    print(f"Sorgu sayısı: {len(plan)}  |  num={args.num}  |  bütçe tavanı={args.max_aramalar}")

    if args.kuru:
        print("\n=== KURU KOŞU (dry-run) — API çağrısı yok ===")
        cache_var = sum(1 for p in plan if _cache_yolu(_serp_params(p, args.num)).exists())
        yeni = len(plan) - cache_var
        print(f"Cache'te hazır: {cache_var}  |  API'ye gidecek yeni sorgu: {yeni}")
        print(f"Tahmini SerpAPI kredisi (Faz 1/2): ~{min(yeni, args.max_aramalar)}")
        if args.enrich:
            print(f"Faz 3 enrichment ek kredi: ~{args.enrich_top} (site: sorguları)")
        print("\nİlk 10 sorgu:")
        for p in plan[:10]:
            print(f"  [{p['etiket']}] {p['q']}")
        return

    anahtar, kaynak = anahtar_bul(args.anahtar)
    if not anahtar:
        print("HATA: SerpAPI anahtarı bulunamadı. --anahtar ver ya da .env.local'a "
              "adında SERP geçen bir değişken ekle.", file=sys.stderr)
        sys.exit(1)
    print(f"Anahtar kaynağı: {kaynak}")

    butce = {"kalan": args.max_aramalar}
    domainler = {}  # domain -> agrega

    print("\n=== FAZ 1/2: SERP keşfi ===")
    for i, p in enumerate(plan, 1):
        if butce["kalan"] <= 0:
            print(f"  (bütçe bitti, {len(plan) - i + 1} sorgu atlandı)")
            break
        params = _serp_params(p, args.num)
        veri, api = serpapi_ara(params, anahtar, args.kuru, butce)
        isaret = "API" if api else "cache"
        if not veri:
            print(f"  [{i}/{len(plan)}] {isaret:5} — SONUÇ YOK — {p['q']}")
            continue
        organik = veri.get("organic_results", []) or []
        for r in organik:
            dom = domain_cek(r.get("link", ""))
            if not dom or gurultu_mu(dom):
                continue
            kayit = domainler.setdefault(dom, {
                "domain": dom, "sorgular": set(), "en_iyi_pozisyon": 999,
                "metinler": [], "ornek_url": r.get("link", ""),
            })
            kayit["sorgular"].add(p["q"])
            poz = r.get("position", 999) or 999
            kayit["en_iyi_pozisyon"] = min(kayit["en_iyi_pozisyon"], poz)
            baslik = (r.get("title") or "") + " " + (r.get("snippet") or "")
            kayit["metinler"].append(baslik)
        print(f"  [{i}/{len(plan)}] {isaret:5} — {len(organik):2} sonuç — {p['q']}")

    print(f"\nBenzersiz domain (gürültü sonrası): {len(domainler)}")

    # skorlama
    for kayit in domainler.values():
        metin = " ".join(kayit["metinler"])
        skor, detay = directness_skorla(metin)
        kayit["directness"] = skor
        kayit["eksenler"] = detay
        kayit["kapsam"] = len(kayit["sorgular"])  # kaç farklı sorguda çıktı
        kayit["urun_sinyali"] = 0
        kayit["supheli"] = 0
        kayit["erisildi"] = None
        kayit["skor"] = kayit["directness"]  # enrich yoksa skor = snippet directness

    # enrichment adayları KAPSAM'a göre seçilir (çok sorguda çıkan = gerçek oyuncu
    # olma ihtimali yüksek), zayıf snippet directness'e göre DEĞİL.
    sirali = sorted(domainler.values(),
                    key=lambda k: (k["kapsam"], k["directness"]), reverse=True)

    # Faz 3 enrichment
    if args.enrich:
        print("\n=== FAZ 3: enrichment (anasayfa" + (" + site:indeks" if args.indeks else "") + ") ===")
        for kayit in sirali[:args.enrich_top]:
            dom = kayit["domain"]
            if args.indeks and butce["kalan"] > 0:
                params = {"engine": "google", "q": f"site:{dom}",
                          "google_domain": "google.com.tr", "gl": "tr", "hl": "tr", "num": 1}
                veri, _ = serpapi_ara(params, anahtar, args.kuru, butce)
                if veri:
                    bilgi = veri.get("search_information", {}) or {}
                    kayit["indeks_sayfa"] = bilgi.get("total_results")
            tarama = anasayfa_tara(dom)  # ücretsiz HTTP
            kayit.update({
                "erisildi": tarama["erisildi"],
                "urun_sinyali": tarama["urun_sinyali"],
                "supheli": tarama["supheli"],
            })
            # birleşik skor: snippet directness + anasayfa ürün sinyali − vaporware cezası
            kayit["skor"] = max(0, min(100,
                kayit["directness"] + min(tarama["urun_sinyali"], 6) * 6 - tarama["supheli"] * 8))
            print(f"  {dom:34} skor={kayit['skor']:3} ürün={tarama['urun_sinyali']} "
                  f"şüpheli={tarama['supheli']} indeks={kayit.get('indeks_sayfa','?')}")

    # nihai sıralama birleşik skora göre, sınıflandırma
    for kayit in domainler.values():
        kayit["sonuc"] = sinifla(kayit["skor"], kayit["urun_sinyali"], kayit["supheli"])
    sirali = sorted(domainler.values(),
                    key=lambda k: (k["skor"], k["kapsam"]), reverse=True)

    _ciktilar_yaz(sirali)
    print(f"\nKalan bütçe: {butce['kalan']}")
    print(f"Çıktı: {CIKTI/'domainler.csv'}  ve  {CIKTI/'rapor.md'}")


def _serp_params(p, num):
    return {
        "engine": "google", "q": p["q"], "google_domain": "google.com.tr",
        "gl": "tr", "hl": "tr", "num": num,
    }


def _ciktilar_yaz(sirali):
    CIKTI.mkdir(parents=True, exist_ok=True)
    # CSV
    with open(CIKTI / "domainler.csv", "w", newline="", encoding="utf-8") as f:
        yazar = csv.writer(f)
        yazar.writerow(["domain", "skor", "directness_snippet", "kapsam_sorgu",
                        "en_iyi_poz", "urun_sinyali", "supheli", "indeks_sayfa",
                        "erisildi", "sonuc", "eksenler", "ornek_url"])
        for k in sirali:
            eksen_str = "".join(e[0] for e, v in k["eksenler"].items() if v)
            yazar.writerow([k["domain"], k["skor"], k["directness"], k["kapsam"],
                            k["en_iyi_pozisyon"], k["urun_sinyali"], k["supheli"],
                            k.get("indeks_sayfa", ""), k["erisildi"], k["sonuc"],
                            eksen_str, k["ornek_url"]])
    # Markdown rapor
    with open(CIKTI / "rapor.md", "w", encoding="utf-8") as f:
        f.write("# Projedar Rakip Tarama Raporu\n\n")
        f.write(f"Toplam benzersiz domain: **{len(sirali)}**\n\n")
        f.write("Eksenler: A=çok-müteahhit B=emlakçı-ağı C=canlı-stok "
                "D=çift-satış E=komisyon-model F=tahsis\n\n")
        f.write("| # | Domain | Skor | Kapsam | Eksen | Ürün | Şüpheli | Sonuç |\n")
        f.write("|---|--------|-----:|-------:|-------|-----:|--------:|-------|\n")
        for i, k in enumerate(sirali, 1):
            eksen_str = "".join(e[0] for e, v in k["eksenler"].items() if v) or "-"
            f.write(f"| {i} | {k['domain']} | {k['skor']} | {k['kapsam']} | "
                    f"{eksen_str} | {k['urun_sinyali']} | {k['supheli']} | {k['sonuc']} |\n")


if __name__ == "__main__":
    main()
