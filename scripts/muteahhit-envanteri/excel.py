#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSV'leri tek Excel çalışma kitabına toplar (brief'in sheet yapısı).

Bağımlılık yok: .xlsx aslında bir zip içinde XML'dir; stdlib `zipfile` ile
yazılır. openpyxl/pandas gerekmez (bu makinede openpyxl kurulu değil).

Sheet'ler yalnız var olan CSV'lerden üretilir; eksik olan atlanır ve raporlanır.

Kullanım: python3 excel.py
Çıktı:    cikti/envanter.xlsx
"""

from __future__ import annotations

import csv
import re
import zipfile
from datetime import date
from xml.sax.saxutils import escape

from ortak import CIKTI

# (sheet adı, kaynak CSV) — brief'in tablo ayrımına karşılık gelir.
SAYFALAR = [
    ("Konut Projeleri", "proje.csv"),
    ("Insaat Firmalari", "firma.csv"),
    ("Konut Tipleri", "konut_tipi.csv"),
    ("Kampanyalar", "kampanya.csv"),
    ("Stok Zaman Serisi", "stok-zaman-serisi.csv"),
    ("B2B Oncelik", "lead.csv"),
]

SAYI = re.compile(r"^-?\d+(\.\d+)?$")


def _hucre(sutun: int, satir: int, deger: str) -> str:
    """Tek hücrenin XML'i. Sayısal görünen değer sayı, diğerleri inline string."""
    ad = ""
    n = sutun
    while n >= 0:
        ad = chr(ord("A") + n % 26) + ad
        n = n // 26 - 1
    ref = f"{ad}{satir}"
    if deger and SAYI.match(deger) and len(deger) < 15:
        return f'<c r="{ref}"><v>{deger}</v></c>'
    if not deger:
        return f'<c r="{ref}"/>'
    return f'<c r="{ref}" t="inlineStr"><is><t xml:space="preserve">{escape(deger)}</t></is></c>'


def _sayfa_xml(satirlar: list[list[str]]) -> str:
    parca = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
        "<sheetData>",
    ]
    for i, satir in enumerate(satirlar, 1):
        parca.append(f'<row r="{i}">')
        parca.extend(_hucre(j, i, (h or "").replace("\n", " ")) for j, h in enumerate(satir))
        parca.append("</row>")
    parca.append("</sheetData></worksheet>")
    return "".join(parca)


def main() -> int:
    veri: list[tuple[str, list[list[str]]]] = []
    atlanan: list[str] = []
    for ad, dosya in SAYFALAR:
        yol = CIKTI / dosya
        if not yol.exists():
            atlanan.append(f"{ad} ({dosya} yok)")
            continue
        with yol.open(encoding="utf-8") as f:
            satirlar = [r for r in csv.reader(f)]
        if len(satirlar) <= 1:
            atlanan.append(f"{ad} ({dosya} boş)")
            continue
        # Excel sheet sınırı 1.048.576 satır; bu veri setinde uzak ama korumalı olsun.
        veri.append((ad, satirlar[:1_000_000]))

    if not veri:
        print("HATA: yazılacak CSV bulunamadı.")
        return 1

    hedef = CIKTI / "envanter.xlsx"
    with zipfile.ZipFile(hedef, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr(
            "[Content_Types].xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            + "".join(
                f'<Override PartName="/xl/worksheets/sheet{i}.xml" '
                'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
                for i in range(1, len(veri) + 1)
            )
            + "</Types>",
        )
        z.writestr(
            "_rels/.rels",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            "</Relationships>",
        )
        z.writestr(
            "xl/workbook.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
            + "".join(
                f'<sheet name="{escape(ad)}" sheetId="{i}" r:id="rId{i}"/>'
                for i, (ad, _) in enumerate(veri, 1)
            )
            + "</sheets></workbook>",
        )
        z.writestr(
            "xl/_rels/workbook.xml.rels",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            + "".join(
                f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>'
                for i in range(1, len(veri) + 1)
            )
            + "</Relationships>",
        )
        for i, (_, satirlar) in enumerate(veri, 1):
            z.writestr(f"xl/worksheets/sheet{i}.xml", _sayfa_xml(satirlar))

    print(f"-> {hedef}  ({date.today().isoformat()})")
    for ad, satirlar in veri:
        print(f"   {ad:22} {len(satirlar) - 1} satır")
    for a in atlanan:
        print(f"   atlandı: {a}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
