#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Müteahhit / konut projesi envanteri — ortak yardımcılar.

Emlakjet proje detay sayfası Next.js App Router ile SSR edilir; sayfanın tüm
veri modeli `self.__next_f.push([1,"..."])` çağrılarındaki RSC flight payload'ı
içinde JSON olarak gömülü gelir. Bu yüzden HTML regex'i yerine `initialProject`
nesnesi doğrudan okunur: alan adları sabittir, kırılgan selector yoktur.

`initialProject` içinden alınan kritik alanlar (doluluk 40 projelik örneklemde):
  salesStatus                  %100   ONGOING / FINISHED
  company.address / website    %100
  property.flatCount           %100   toplam bağımsız bölüm
  locationInfo.coordinates      %90
  company.phoneNumber           %85
  projectBuildingStartedDay     %77   inşaat başlangıcı
  property.deliveryDate         %70
  property.remainingFlatCount   %35   KALAN STOK
  percentageOfSale              %22   SATIŞ YÜZDESİ

Robots (2026-08-13 doğrulandı): emlakjet.com/robots.txt `Allow: /` verir;
/projeler/proje/* ve /projeler/firma/* Disallow DEĞİL. /proje-katalog/* ise
Disallow — bu yüzden katalog PDF'leri İNDİRİLMEZ, yalnız URL'si kaydedilir.

KVKK: yalnız tüzel kişi / işletme düzeyi veri toplanır. Firma e-postası ancak
rol tabanlıysa (info@, bilgi@, satis@ ...) kaydedilir; gerçek kişi adı taşıyan
adres (ör. mervedemir@...) ATILIR. Danışman adı / cep telefonu toplanmaz.
Bu, franchise-ofisler taramasındaki kapsam kararıyla aynı çizgidir.

Bağımlılık YOK — sadece Python stdlib.
"""

from __future__ import annotations

import gzip
import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

BURASI = Path(__file__).resolve().parent
CIKTI = BURASI / "cikti"
HAM = CIKTI / "ham"

TABAN = "https://www.emlakjet.com"
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)
BASLIK = {
    "User-Agent": UA,
    "Accept-Language": "tr-TR,tr;q=0.9",
    "Accept-Encoding": "gzip",
}

# Brief'in "konut üretimi yoğun" dediği iller. --iller ile daraltmak için.
YOGUN_ILLER = {
    "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Kocaeli", "Sakarya",
    "Tekirdağ", "Balıkesir", "Muğla", "Aydın", "Mersin", "Adana", "Gaziantep",
    "Konya", "Kayseri", "Eskişehir", "Samsun", "Trabzon", "Denizli", "Manisa",
}

# Emlakjet oda tipi kodları -> insan okunur etiket. Kaynak: sayfa i18n sözlüğü
# ("card.roomTypes"). flatTypes[].roomCount ve unitTypes[].roomType bu kodu taşır.
ODA_TIPI = {
    "1": "Stüdyo", "2": "1", "3": "1+1", "5": "2+1", "6": "2+2", "7": "3+1",
    "8": "3+2", "9": "4+1", "10": "4+2", "11": "5", "12": "5+1", "13": "5+2",
    "14": "5+3", "15": "5+4", "16": "6+1", "17": "6+2", "18": "7+1", "19": "8+",
    "20": "7+2", "21": "7+3", "22": "6+3", "23": "6+4",
}

# Rol tabanlı (kuruma ait) e-posta ön ekleri. Bunun dışındakiler KVKK gereği atılır.
ROL_EPOSTA = (
    "info", "bilgi", "satis", "satış", "iletisim", "iletişim", "destek",
    "kurumsal", "muhasebe", "pazarlama", "reklam", "ik", "insankaynaklari",
    "office", "contact", "sales", "support", "admin", "merkez", "genelmudurluk",
)


# ---------------------------------------------------------------------------
# İndirme (cache'li, nazik)
# ---------------------------------------------------------------------------
def indir(url: str, ad: str, yenile: bool = False, deneme: int = 3) -> str | None:
    """URL'yi indir, cikti/ham/<ad>.html altına cache'le. Hata olursa None."""
    HAM.mkdir(parents=True, exist_ok=True)
    dosya = HAM / f"{ad}.html"
    if dosya.exists() and not yenile:
        return dosya.read_text(encoding="utf-8")

    for i in range(deneme):
        try:
            with urllib.request.urlopen(
                urllib.request.Request(url, headers=BASLIK), timeout=30
            ) as cevap:
                govde = cevap.read()
                if cevap.headers.get("Content-Encoding") == "gzip":
                    govde = gzip.decompress(govde)
            metin = govde.decode("utf-8", errors="replace")
            dosya.write_text(metin, encoding="utf-8")
            return metin
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            time.sleep(2 * (i + 1))
        except Exception:
            time.sleep(2 * (i + 1))
    return None


# ---------------------------------------------------------------------------
# RSC flight payload -> initialProject nesnesi
# ---------------------------------------------------------------------------
def flight_coz(html_metin: str) -> str:
    """self.__next_f.push([1,"..."]) parçalarını birleştirip düz metne çevir."""
    parcalar = []
    for m in re.finditer(r'self\.__next_f\.push\(\[1,\s*(".*?")\]\)', html_metin, re.S):
        try:
            parcalar.append(json.loads(m.group(1)))
        except Exception:
            continue
    return "".join(parcalar)


def _nesne_kes(metin: str, anahtar: str) -> str | None:
    """`"anahtar":{...}` bloğunu süslü parantez dengeleyerek kes."""
    i = metin.find(f'"{anahtar}":{{')
    if i < 0:
        return None
    bas = metin.index("{", i)
    derinlik = 0
    kacis = False
    metinde = False
    for j in range(bas, len(metin)):
        c = metin[j]
        if kacis:
            kacis = False
            continue
        if c == "\\":
            kacis = True
            continue
        if c == '"':
            metinde = not metinde
            continue
        if metinde:
            continue
        if c == "{":
            derinlik += 1
        elif c == "}":
            derinlik -= 1
            if derinlik == 0:
                return metin[bas : j + 1]
    return None


def proje_nesnesi(html_metin: str) -> dict | None:
    """Detay sayfası HTML'inden initialProject JSON nesnesini çıkar."""
    ham = _nesne_kes(flight_coz(html_metin), "initialProject")
    if not ham:
        return None
    try:
        return json.loads(ham)
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Küçük yardımcılar
# ---------------------------------------------------------------------------
def al(nesne: dict | None, yol: str, varsayilan=None):
    """Noktalı yol ile iç içe sözlükten güvenli okuma: al(o, 'company.website')."""
    gecerli = nesne
    for parca in yol.split("."):
        if not isinstance(gecerli, dict):
            return varsayilan
        gecerli = gecerli.get(parca)
    return varsayilan if gecerli is None else gecerli


def tarih(deger) -> str:
    """ISO zaman damgasını YYYY-MM-DD'ye indir. Yoksa boş string."""
    if not deger or not isinstance(deger, str):
        return ""
    return deger[:10]


def telefon_normalize(ham) -> str:
    """TR numarasını E.164'e çevir (+90XXXXXXXXXX). Çözülemezse boş."""
    if not ham:
        return ""
    rakam = re.sub(r"\D", "", str(ham))
    if rakam.startswith("90") and len(rakam) == 12:
        return "+" + rakam
    if rakam.startswith("0") and len(rakam) == 11:
        return "+90" + rakam[1:]
    if len(rakam) == 10:
        return "+90" + rakam
    return ""


def eposta_kurumsal(ham) -> str:
    """Rol tabanlı kurumsal e-postayı döndür; kişi adı taşıyanı ele (KVKK)."""
    if not ham or "@" not in str(ham):
        return ""
    adres = str(ham).strip().lower()
    yerel = adres.split("@", 1)[0]
    sade = re.sub(r"[^a-z]", "", yerel)
    return adres if sade in ROL_EPOSTA else ""


def html_metne(ham) -> str:
    """introText/about gibi HTML alanlarını düz metne indir."""
    if not ham:
        return ""
    import html as _h

    t = re.sub(r"<[^>]+>", " ", str(ham))
    return re.sub(r"\s+", " ", _h.unescape(t)).strip()


# ---------------------------------------------------------------------------
# Serbest metinden blok / etap / tip-adet çıkarımı
# ---------------------------------------------------------------------------
_YAZI_SAYI = {
    "bir": 1, "iki": 2, "üç": 3, "uc": 3, "dört": 4, "dort": 4, "beş": 5,
    "bes": 5, "altı": 6, "alti": 6, "yedi": 7, "sekiz": 8, "dokuz": 9, "on": 10,
}


def _sayi(ham: str) -> int | None:
    ham = ham.strip().lower()
    if ham.isdigit():
        return int(ham)
    return _YAZI_SAYI.get(ham)


def blok_etap_cikar(metin: str) -> tuple[int | None, int | None]:
    """Proje açıklamasından blok ve etap sayısını yakala. Bulunamazsa None.

    Örnek: "A ve B olarak 2 bloktan, 92 adet 2+1 ... oluşmaktadır" -> blok=2
    Pazarlama metni olduğu için sonuç 'tahmini' sayılır, kaynak kolonu ile işaretlenir.
    """
    blok = etap = None
    m = re.search(r"(\d+|[a-zçğıöşü]+)\s*(?:adet\s*)?blok", metin, re.I)
    if m:
        blok = _sayi(m.group(1))
    m = re.search(r"(\d+|[a-zçğıöşü]+)\s*(?:adet\s*)?etap", metin, re.I)
    if m:
        etap = _sayi(m.group(1))
    # Aşırı büyük değerler yanlış eşleşmedir (ör. "2026 blok" gibi).
    if blok and blok > 200:
        blok = None
    if etap and etap > 50:
        etap = None
    return blok, etap


def tip_adet_cikar(metin: str) -> dict[str, int]:
    """"92 adet 2+1", "26 adet 3+1" kalıplarından tip başına adet çıkar."""
    bulgu: dict[str, int] = {}
    for adet, tip in re.findall(r"(\d{1,4})\s*(?:adet|ad\.)\s*(\d\+\d)", metin, re.I):
        bulgu[tip] = bulgu.get(tip, 0) + int(adet)
    return bulgu
