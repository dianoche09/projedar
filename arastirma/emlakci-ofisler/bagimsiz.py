#!/usr/bin/env python3
"""Bağımsız emlak ofisi taraması — SerpAPI `google_maps` motoru.

Franchise tarafı marka sitelerinden geliyor (tarama.ts). Bu script sektörün asıl
kütlesini, yani bağımsız ofisleri, ilçe bazında Google Maps sonuçlarından toplar.

Neden SerpAPI: Google Places API ayrı bir Google Cloud hesabı ve Enterprise SKU
ücreti ister (telefon/website alanları için 35 USD/1000). SerpAPI mevcut Big Data
planından yeniyor, ek maliyet yok. Ayrıca Maps Platform'un "place_id dışını kalıcı
saklama" kısıtı burada geçerli değil.

KAPSAM (KVKK): yalnız işletme düzeyi kamuya açık kayıt. Kişi adı/cep aranmaz.
Google Maps'te bazı ofisler cep numarasını işletme hattı olarak yayımlar; bu
işletmenin kendi yayımladığı iletişim bilgisidir.

Çalıştır:
    python3 arastirma/emlakci-ofisler/bagimsiz.py --il Ankara --butce 200
    python3 arastirma/emlakci-ofisler/bagimsiz.py --il Ankara --kuru   # API çağırmaz
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import pathlib
import re
import sys
import time
import urllib.parse
import urllib.request

BURASI = pathlib.Path(__file__).resolve().parent
CIKTI = BURASI / "cikti"
HAM = CIKTI / "ham-maps"
SERPAPI_URL = "https://serpapi.com/search.json"

# Google Maps'te emlak ofisi arayan sorgu kalıpları. Her biri ayrı API çağrısıdır;
# --sorgu ile kısılabilir. Farklı kalıplar farklı işletme kümesi döndürür.
SORGU_KALIPLARI = [
    "emlak ofisi {ilce} {il}",
    "gayrimenkul danışmanlığı {ilce} {il}",
]

# Bilinen franchise ağları — Maps sonucunu bağımsız/franchise diye ayırmak için.
FRANCHISE_DESEN = [
    (r"re\s*/?\s*max", "RE/MAX"),
    (r"century\s*21|c21", "CENTURY 21"),
    (r"coldwell\s*banker", "COLDWELL BANKER"),
    (r"turyap", "Turyap"),
    (r"realty\s*world", "Realty World"),
    (r"alt[ıi]n\s*emlak", "Altın Emlak"),
    (r"\bera\s+(gayrimenkul|emlak|real)", "ERA"),
    (r"keller\s*williams|\bkw\b", "Keller Williams"),
    (r"premar", "Premar"),
    (r"remax", "RE/MAX"),
    (r"realty\s*one\s*group", "Realty ONE Group"),
    (r"startkey", "Startkey"),
    (r"eva\s*gayrimenkul", "EVA Gayrimenkul"),
]

ALANLAR = [
    "il", "ilce", "ilceKaynak", "isletmeAdi", "kategori", "marka", "bagimsizMi",
    "adres", "telefon", "website", "googlePuan", "yorumSayisi",
    "enlem", "boylam", "placeId", "sorgu", "cekilmeTarihi",
]

# Adres sonundaki "... 06690 Çankaya/Ankara" kalıbından ilçe çıkarımı.
_ADRES_ILCE = re.compile(r"([A-Za-zÇĞİÖŞÜçğıöşü\s]+?)\s*/\s*[A-Za-zÇĞİÖŞÜçğıöşü\s]+\s*$")


def adresten_ilce(adres: str) -> str:
    """Adres metninden gerçek ilçeyi çıkarır. Çıkaramazsa boş döner (tahmin yok)."""
    m = _ADRES_ILCE.search(adres or "")
    return m.group(1).strip() if m else ""


def markayi_tani(ad: str) -> str:
    """İşletme adından franchise markasını çıkarır. Eşleşme yoksa boş string."""
    k = (ad or "").lower()
    for desen, marka in FRANCHISE_DESEN:
        if re.search(desen, k):
            return marka
    return ""


def telefon_normalize(ham: str | None) -> str:
    """Türkiye numarasını E.164'e çevirir. Belirsizse TAHMİN ETMEZ, boş döner."""
    if not ham:
        return ""
    d = re.sub(r"\D", "", ham)
    if len(d) == 7 and d.startswith("444"):
        return f"444 {d[3:]}"
    if d.startswith("0090"):
        d = d[4:]
    elif d.startswith("90") and len(d) >= 12:
        d = d[2:]
    elif d.startswith("0") and len(d) >= 11:
        d = d[1:]
    return f"+90{d}" if len(d) == 10 and not d.startswith("0") else ""


def _cache_yolu(params: dict) -> pathlib.Path:
    imza = json.dumps(params, sort_keys=True, ensure_ascii=False)
    return HAM / f"{hashlib.sha1(imza.encode('utf-8')).hexdigest()[:16]}.json"


def serpapi_ara(params: dict, anahtar: str, kuru: bool, butce: dict):
    """Cache varsa onu döndür; yoksa ve bütçe varsa API'yi çağır.
    Döner: (veri|None, api_kullanildi_mi). Hata sessizce yutulmaz, stderr'e yazılır."""
    yol = _cache_yolu(params)
    if yol.exists():
        try:
            return json.loads(yol.read_text(encoding="utf-8")), False
        except json.JSONDecodeError:
            pass
    if kuru or butce["kalan"] <= 0:
        return None, False

    tam = dict(params, api_key=anahtar)
    istek = urllib.request.Request(
        SERPAPI_URL + "?" + urllib.parse.urlencode(tam),
        headers={"User-Agent": "projedar-emlakci-tarama/1.0"},
    )
    try:
        with urllib.request.urlopen(istek, timeout=60) as cevap:
            veri = json.loads(cevap.read().decode("utf-8"))
    except Exception as hata:  # noqa: BLE001 - ağ hatası çeşitli olabilir
        print(f"  ! API hatası: {hata}", file=sys.stderr)
        butce["kalan"] -= 1
        return None, True
    if "error" in veri:
        print(f"  ! SerpAPI: {veri['error']}", file=sys.stderr)
        butce["kalan"] -= 1
        return None, True

    HAM.mkdir(parents=True, exist_ok=True)
    yol.write_text(json.dumps(veri, ensure_ascii=False), encoding="utf-8")
    butce["kalan"] -= 1
    return veri, True


def ilce_tara(il, ilce, anahtar, butce, kuru, max_sayfa, kaliplar, tarih):
    """Bir ilçeyi tüm sorgu kalıplarıyla tarar. place_id bazında tekilleştirir."""
    bulunan: dict[str, dict] = {}
    for kalip in kaliplar:
        q = kalip.format(il=il, ilce=ilce)
        for sayfa in range(max_sayfa):
            params = {
                "engine": "google_maps", "q": q, "type": "search",
                "hl": "tr", "gl": "tr", "google_domain": "google.com.tr",
                "start": sayfa * 20,
            }
            veri, api = serpapi_ara(params, anahtar, kuru, butce)
            if not veri:
                break
            sonuc = veri.get("local_results") or []
            if not sonuc:
                break
            for r in sonuc:
                pid = r.get("place_id")
                if not pid or pid in bulunan:
                    continue
                ad = (r.get("title") or "").strip()
                marka = markayi_tani(ad)
                gps = r.get("gps_coordinates") or {}
                adres = (r.get("address") or "").strip()
                # Google yakın çevreden de sonuç döndürebiliyor: ilçeyi adresten al,
                # çıkaramazsan sorgunun ilçesine düş ve bunu kaynak alanında işaretle.
                gercek_ilce = adresten_ilce(adres)
                bulunan[pid] = {
                    "il": il,
                    "ilce": gercek_ilce or ilce,
                    "ilceKaynak": "adres" if gercek_ilce else "sorgu",
                    "isletmeAdi": ad,
                    "kategori": (r.get("type") or "").strip(),
                    "marka": marka or "Bağımsız",
                    "bagimsizMi": "Hayır" if marka else "Evet",
                    "adres": (r.get("address") or "").strip(),
                    "telefon": telefon_normalize(r.get("phone")),
                    "website": (r.get("website") or "").strip(),
                    "googlePuan": r.get("rating") if r.get("rating") is not None else "",
                    "yorumSayisi": r.get("reviews") if r.get("reviews") is not None else "",
                    "enlem": gps.get("latitude", ""), "boylam": gps.get("longitude", ""),
                    "placeId": pid, "sorgu": q, "cekilmeTarihi": tarih,
                }
            if not (veri.get("serpapi_pagination") or {}).get("next"):
                break
            if api:
                time.sleep(0.4)
    return list(bulunan.values())


def anahtari_oku() -> str:
    for ad in (".env.local", ".env"):
        p = pathlib.Path(ad)
        if not p.exists():
            continue
        for satir in p.read_text(encoding="utf-8").splitlines():
            if satir.startswith("SERPAPI_API_KEY="):
                return satir.split("=", 1)[1].strip().strip('"').strip("'")
    print("SERPAPI_API_KEY bulunamadı (.env.local).", file=sys.stderr)
    sys.exit(3)


def kota_durumu(anahtar: str) -> dict:
    try:
        u = f"https://serpapi.com/account.json?api_key={anahtar}"
        return json.loads(urllib.request.urlopen(u, timeout=30).read())
    except Exception:  # noqa: BLE001 - kota bilgisi alınamazsa tarama yine de çalışır
        return {}


def csv_oku(dosya: pathlib.Path) -> dict[str, dict]:
    """Önceki çalıştırmanın çıktısını place_id sözlüğü olarak okur (artımlı tarama)."""
    if not dosya.exists():
        return {}
    with dosya.open(encoding="utf-8-sig") as f:
        return {r["placeId"]: r for r in csv.DictReader(f) if r.get("placeId")}


def csv_yaz(dosya: pathlib.Path, kayitlar: dict[str, dict]) -> None:
    sirali = sorted(kayitlar.values(), key=lambda k: (k["il"], k["ilce"], k["isletmeAdi"]))
    with dosya.open("w", encoding="utf-8-sig", newline="") as f:
        y = csv.DictWriter(f, fieldnames=ALANLAR, extrasaction="ignore")
        y.writeheader()
        y.writerows(sirali)


def main() -> None:
    ap = argparse.ArgumentParser(description="Bağımsız emlak ofisi taraması (SerpAPI Google Maps)")
    ap.add_argument("--il", help="Taranacak tek il (iller.json'dan). --tumu ile birlikte kullanılmaz.")
    ap.add_argument("--tumu", action="store_true", help="81 ilin tamamını tara (nüfusa göre büyükten küçüğe)")
    ap.add_argument("--butce", type=int, default=200, help="Harcanacak azami API çağrısı")
    ap.add_argument("--kuru", action="store_true", help="API çağırma, yalnız cache'ten çalış")
    ap.add_argument("--sayfa", type=int, default=3, help="Sorgu başına azami sayfa (20 sonuç/sayfa)")
    ap.add_argument("--tek-sorgu", action="store_true", help="Yalnız ilk sorgu kalıbını kullan")
    args = ap.parse_args()

    iller = json.loads((BURASI / "iller.json").read_text(encoding="utf-8"))
    if not args.il and not args.tumu:
        print("--il <ad> ya da --tumu vermelisiniz.", file=sys.stderr)
        sys.exit(2)
    if args.il and args.il not in iller:
        print(f"İl bulunamadı: {args.il}. Mevcut: {', '.join(sorted(iller))}", file=sys.stderr)
        sys.exit(2)
    # Büyük iller önce: bütçe biterse en değerli kütle toplanmış olur.
    hedef_iller = ([args.il] if args.il
                   else sorted(iller, key=lambda i: -len(iller[i])))

    anahtar = anahtari_oku()
    kota = kota_durumu(anahtar)
    kalan_kota = kota.get("total_searches_left")
    if kalan_kota is not None:
        print(f"SerpAPI kotası: {kalan_kota} arama kaldı (plan {kota.get('searches_per_month','?')}/ay)")
        if not args.kuru and args.butce > kalan_kota:
            print(f"  ! Bütçe ({args.butce}) kalan kotadan büyük, {kalan_kota}'e çekildi.", file=sys.stderr)
            args.butce = kalan_kota

    butce = {"kalan": args.butce}
    kaliplar = SORGU_KALIPLARI[:1] if args.tek_sorgu else SORGU_KALIPLARI
    tarih = time.strftime("%Y-%m-%d")
    toplam_ilce = sum(len(iller[i]) for i in hedef_iller)
    print(f"{len(hedef_iller)} il, {toplam_ilce} ilçe, {len(kaliplar)} sorgu kalıbı, "
          f"bütçe {args.butce} çağrı\n")

    CIKTI.mkdir(parents=True, exist_ok=True)
    dosya = CIKTI / "bagimsiz-ofisler.csv"
    kayitlar = csv_oku(dosya)  # artımlı: önceki tarama korunur
    if kayitlar:
        print(f"Mevcut çıktıda {len(kayitlar)} kayıt var, üzerine eklenecek.\n")

    bitti = False
    for il in hedef_iller:
        if bitti:
            break
        ilceler = iller[il]
        il_oncesi = len(kayitlar)
        for i, ilce in enumerate(ilceler, 1):
            if butce["kalan"] <= 0 and not args.kuru:
                print(f"  ! Bütçe bitti — {il} ({len(ilceler) - i + 1} ilçe) ve sonrası taranmadı.",
                      file=sys.stderr)
                bitti = True
                break
            for k in ilce_tara(il, ilce, anahtar, butce, args.kuru, args.sayfa, kaliplar, tarih):
                kayitlar[k["placeId"]] = k
        il_kazanim = len(kayitlar) - il_oncesi
        print(f"  {il:<16} +{il_kazanim:<5} (toplam {len(kayitlar)}) | kalan bütçe {butce['kalan']}")
        csv_yaz(dosya, kayitlar)  # her il sonrası diske yaz: kesinti veri kaybettirmesin

    if not kayitlar:
        print("\nHiç kayıt toplanamadı.", file=sys.stderr)
        sys.exit(1)
    csv_yaz(dosya, kayitlar)

    tum = list(kayitlar.values())
    bagimsiz = [k for k in tum if k["bagimsizMi"] == "Evet"]
    telefonlu = sum(1 for k in tum if k["telefon"])
    webli = sum(1 for k in tum if k["website"])
    kapsanan_il = len({k["il"] for k in tum})
    harcanan = args.butce - butce["kalan"]
    print(f"\n═══ ÖZET ═══")
    print(f"Toplam ofis: {len(tum)} | bağımsız: {len(bagimsiz)} | franchise: {len(tum)-len(bagimsiz)}")
    print(f"Kapsanan il: {kapsanan_il}/81 | telefonu olan: {telefonlu} | web sitesi olan: {webli}")
    print(f"Harcanan API çağrısı: {harcanan}")
    if kalan_kota is not None:
        print(f"Tahmini kalan kota: {kalan_kota - harcanan}")
    print(f"Çıktı: {dosya}")


if __name__ == "__main__":
    main()
