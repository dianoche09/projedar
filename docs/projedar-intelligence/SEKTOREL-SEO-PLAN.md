# PROJEDAR — Sektörel SEO/GEO İçerik Planı (huni stratejisi)

> Amaç: emlak danışmanının işini yaparken Google + AI aramalarında (ChatGPT/Perplexity/Gemini) Projedar'ı bulması → içerikle güven → ağa davet. Kapalı-devre B2B mimariyi bozmadan, üst-huni bilgilendirme ile ağ büyütme.
> Durum (2026-08-11): içerik altyapısı KURULU, **5 makale yayında** (EİDS kümesi 4 + projeden-satış). FAQPage+Article schema ve dinamik llms.txt otomatik. Faz 1 TAMAM; sıradaki Faz 2 #6/#7/#8. Bu plan kalan içeriği önceliklendirir.

---

## 1. Sistem (nasıl içerik eklenir)

Kaynak: `src/lib/icerik/` (registry, tipler, kaynaklar, schema) + `src/content/<kategori>/` (gövdeler) + `src/components/icerik/` (bileşenler).

**Yeni sayfa = 3 dosya dokunuşu:**
1. **Registry kaydı** → `src/lib/icerik/kayit.ts` `ICERIKLER[]`: meta (slug, kategori, title, h1, description, publishedAt, sources[], iliskiler, ctaLevel, heroGorsel, canonical, index, published).
2. **Gövde dosyası** → `src/content/<kategori>/<slug>.tsx`: `export const Govde` (FC) + `export const toc` (TocOge[]). Bileşenler: `AnswerFirst` (H2 sonrası ilk 150 karakter cevap — GEO), `Bolum`, `Kaynak` (resmî kaynak atıf), `IcerikFAQ` (FAQPage schema), `SurecAkisi`, `GuncelDurumTablosu`, `VurguKutusu`, `SenaryoKutusu`, `IstatistikSerit`, `BolumGorsel`.
3. **Gövde haritası** → `src/content/<kategori>/index.ts` `<KATEGORI>_GOVDE`: `"<slug>": { Govde, toc }`.
4. **Kaynaklar** (gerekiyorsa) → `src/lib/icerik/kaynaklar.ts`: resmî kaynak kaydı (id, kurum, url, tarih).
5. Sitemap + internal linking + breadcrumb + schema OTOMATİK (registry'den türer). `published: true` olmadan linklenmez/sitemap'e girmez (thin-content/404 koruması).

**Kategoriler (tipler.ts):** `rehber` (var) · `karsilastirma` · `sozluk` · `araclar` · `sablonlar` (route/sayfa henüz yok — eklenecek).

**Blueprint kuralları (global memory `reference_blog_system` + kolayseo):** answer-first (H2 sonrası ilk 150 karakterde cevap), 2000-4000 kelime, 3 görsel, 4 CTA, FAQ + Article + Breadcrumb JSON-LD, resmî kaynak inline atıf, güncellik damgası (`IcerikDamgasi`), noindex→kademeli index.

---

## 2. Huni mantığı (içerik → ağ)

- **Üst huni (rehber):** danışmanın gerçek arama-niyeti (mevzuat, süreç, belge). Amaç: trafik + güven + AI-alıntı. CTA hafif/orta.
- **Orta huni (karşılaştırma + sözlük):** karar/terim netleştirme; iç bağlantıyla rehberleri besler. CTA orta.
- **Alt huni (araçlar/hesaplayıcılar + şablonlar):** işini kolaylaştıran araç → e-posta/kayıt karşılığı → ağa davet. CTA güçlü.
- Her sayfada Projedar değer köprüsü: "canlı tahsisli stok + komisyonsuz + çift-satış kalkanı" — ama **abartısız** (claim politikası: %100/imkânsız/muaf/ilan-değil YOK; EİDS "hukuki değerlendirmeye tabi").

---

## 3. İçerik yol haritası (öncelik sırasıyla)

### Faz 1 — EİDS/Yetki kümesi (yüksek niyet, güncel, "neden şimdi")
| # | Kategori | Slug | Hedef arama-niyeti | Huni | Kaynak |
|---|---|---|---|---|---|
| ✅ | rehber | eids-emlakci-rehberi | "EİDS nedir / zorunlu mu 2026" | üst | Ticaret Bak. + e-Devlet (VAR) |
| 1 | rehber | tasinmaz-ticareti-yetki-belgesi | "taşınmaz ticareti yetki belgesi nasıl alınır" | üst | Taşınmaz Tic. Yön. |
| 2 | rehber | e-devletten-emlakciya-eids-yetkisi | "e-devlet EİDS yetkilendirme adımları" | üst | e-Devlet/TAKBİS |
| 3 | rehber | eids-sosyal-medya-ilan-paylasimi | "EİDS sosyal medyada ilan paylaşımı cezası" | üst | Ticaret Bak. |
| 4 | karsilastirma | eids-vs-yetki-sozlesmesi | "EİDS ile yetki sözleşmesi farkı" | orta | mevzuat |

### Faz 2 — Proje/off-plan satış süreci (Projedar'ın kalbi)
| # | Kategori | Slug | Niyet | Huni |
|---|---|---|---|---|
| ✅ | rehber | proje-uzerinden-satis-nasil-yapilir | "off-plan / projeden konut nasıl satılır" | üst | YAYINDA (2026-08-11) |
| ✅ | rehber | musteri-kaydi-ve-hakedis-korumasi | "emlakçı müşteri kaydı / hak ediş koruması" | orta | YAYINDA (2026-08-11) |
| ✅ | sozluk | proje-satis-terimleri | "opsiyon / tahsis / şerefiye ne demek" (terim kümesi) | orta | YAYINDA (2026-08-11) — /sozluk route açıldı |
| 8 | karsilastirma | ilan-portali-vs-tahsisli-ag | "ilan sitesi mi tahsisli ağ mı" | orta |

### Faz 3 — Araçlar (alt huni, davet motoru)
| # | Kategori | Slug | Araç | Huni |
|---|---|---|---|---|
| 9 | araclar | konut-fiyat-serefiye-hesaplayici | kat/manzara şerefiye + m² fiyat tahmini | alt |
| 10 | araclar | odeme-plani-hesaplayici | peşinat/taksit/vade planı | alt |
| 11 | sablonlar | musteri-sunum-ve-teklif-sablonu | indirilebilir sunum/teklif | alt |

> Not: Faz 1 tamamlanınca registry'deki `iliskiler.siblings` doldurulup küme iç-bağlantısı kapanır (registry'de yorum olarak zaten planlı). karsilastirma/sozluk/araclar/sablonlar için **kategori route'ları** (`src/app/<kategori>/page.tsx` + `[slug]`) rehber deseniyle eklenecek (şu an yalnız `/rehber` var; hepsi middleware `herkeseAcik`'te).

---

## 4. GEO (AI arama) çengelleri — her sayfada
- **AnswerFirst** bloğu (H2 sonrası ilk cümlede net cevap) → AI-alıntı.
- **IcerikFAQ** (5+ soru, sayısal/net cevap) → FAQPage schema.
- Resmî kaynak inline atıf (`Kaynak`) → E-E-A-T + citability.
- Güncellik damgası (`IcerikDamgasi` updatedAt/sourceCheckedAt) → tazelik sinyali.
- llms.txt'e içerik kategorileri eklenmeli (blog/knowledge-base bölümü — global kural; şu an llms.txt'te yok).

## 5. Ölçüm
- IndexNow (mevcut) her yeni sayfada ping. GSC'de "rehber/*" tıklama izle. AI-alıntı için Perplexity/ChatGPT'de "EİDS emlakçı" vb. periyodik kontrol.

---

## 6. Sıradaki somut adım
**Makale #1: `tasinmaz-ticareti-yetki-belgesi`** (en yüksek niyet + EİDS kümesini tamamlar). Recipe: kaynaklar.ts'e Taşınmaz Tic. Yönetmeliği kaynağı → gövde (AnswerFirst + Bölümler + SurecAkisi "belge nasıl alınır" + FAQ + Kaynak) → registry meta + GOVDE haritası → eids makalesinin siblings'ine ekle. Ardından #2, #3, #4 ile EİDS kümesi kapanır.

*Bu plan `07-SEO-GEO-PUBLIC-SURFACES.md` (mevcut SEO altyapısı) ile birlikte okunmalı. Makaleler tek tek, kalite düşürmeden yazılır.*
