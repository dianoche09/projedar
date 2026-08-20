# Projedar — Sentez ve Karar Raporu (2026-08)

Dört araştırma girdisinin (pazar boyutu, itiraz→cevap matrisi, saha gerçeği, 30+ rakip haritası) damıtılmış, karar-odaklı sentezi. Kaynak-güven ayrımı korunmuştur: yüksek-güven anchor vs varsayım.

---

## 1. PİYASA

**Yüksek-güven anchor'lar:**
- 88.572 yetki belgeli emlak işletmesi (Ticaret Bak., Ara 2025) · 62K+ MYK belgeli danışman · kayıtlı+kayıtsız ~150-300K.
- İlk el konut 2025: 540.786 (%32) · ort konut ~5,02M TL · ilk el ciro ~2,7 trilyon TL/yıl.
- Yapı ruhsatı ~1,11M daire/yıl (gelecek arz havuzu) · gerçek kurumsal müteahhit evreni ~25-40K.
- TR PropTech pazarı 2024 ~1,4 milyar USD.

**İki ayrı TAM:** distribution-side (88,6K işletme) + supply-side (aktif geliştirici; floor 371 satisofisi → türetilmiş 1.000-2.500).

**SOM (Y1-3):** muhafazakar floor ~13-19M TL ARR (%1-3 penetrasyon + düşük ARPU). Bizim gerçek daire-bazlı fiyatla baz belirgin daha yüksek.

**En büyük belirsizlik:** broker kanal payı (%30-50, düşük güven) → pilot mini-anketle kapatılır.

> SONUÇ: Pazar büyük, dağınık, dijitalleşmeye aç; rakip henüz doyurmamış. Yatırımcı anlatısı: "2,7 trilyon TL ilk el ciro üzerinde satış-dağıtım altyapısı."

---

## 2. REKABET

**Detaylı teardown ZATEN VAR (bu 3 doküman, Haz-Ağu 2026, bu rapor onları tekrarlamaz):**
- `ProjePazar-Rakip-Analizi.md`: 14+ teardown (Avesdo, New Home Buddy, Alnair, BuildersUpdate, Buildify, Entera, Lasso, Novo, Topli, RE-OS, Konutmatik, Code5, Connject, EmlakKanal) + 2x2 çerçeve + site-map reçetesi + tasarım kararı + 31-oyuncu tablosu (Böl. 8).
- `ProjePazar-Rakip-Analizi-Global-Proptech.md`: DomusHub, Kords, Nexprop, Relata, Flatter, UnitAtlas + "kategori olgun, ilk değiliz" tespiti.
- `ProjePazar-Rakip-Ogrenimler-Alinacaklar.md`: Tapuva, EDAP + al/ertele/alma kapsam disiplini.

**Zaten kayıtlı ana bulgu:** kombinasyon-moat = çok-müteahhit + granüler tahsis + DB çift-satış + komisyonsuz. En yakınlar DomusHub (mimari muadil), Konutmatik (TR, tek-müteahhit ama acente-kotalı tahsis üretimde), Novo/RE-OS/Topli (TR, komisyonlu). Konum: "geliştirici Sales OS değil, ağın kendisi."

**⚠️ Benim önceki özetimde ATLADIĞIM (dokümanlarda VAR, doğrudan TR rakibi):**
- **Tapuva (İstanbul):** model neredeyse birebir bizimki (geliştirici↔emlakçı B2B, kart-üstü komisyon %, AI koç, success-fee). Erken (20+ ilan) ama İstanbul cold-start'ta rakip.
- **EDAP (Ankara):** belge-doğrulama merkezli, kademeli üyelik ₺0/10K/15K. **Ankara = pilot sahamız** → doğrudan çakışma.
- → "TR'de saf-play yok" DEMEK YANLIŞ; Tapuva/EDAP/Topli erken ama VARLAR.

**Yeni araştırmamın EKLEDİĞİ/DÜZELTTİĞİ:**
- **Nogbase (UAE, 2024):** mevcut 31-oyuncu tablosunda "KOMİSYONLU" işaretli → DÜZELTME: platform komisyon ALMIYOR ("commission automation" gelir değil, özellik). Yani modelimizin uluslararası DOĞRULAMASI, üstelik pre-seed pilot (50K USD, 2 müşteri = tehdit değil). Fiyat çapası AED 5.000/ay ≈ ~685K TL/yıl.
- Market-sizing anchor'ları (Böl. 1) + objection coverage (Böl. 5) bu rakip dokümanlarında YOK; bu raporun net-new katkısı orası.

**White-space (dokümanlarla uyumlu):** NETWORK × LIVE INVENTORY × TRANSACTION GOVERNANCE + komisyonsuz.

> SONUÇ: "TR'de/dünyada ilk" DEME (Tapuva/EDAP/Topli TR'de erken de olsa var; kategori dünyada 2-5 yaş, olgun). Doğru iddia: "çok-müteahhitli + üretici-kontrollü + komisyonsuz + DB-kilit kombinasyonunda saf-play çok az; TR'de en derini biz." Konum cümlesi: "geliştirici Sales OS değil, ağın kendisi + güven protokolü."

---

## 3. FARKIMIZ (savunulabilir üstünlükler)

1. **Daire-düzeyi çok-müteahhit tahsis** (Nogbase proje-düzeyi; biz granüler, DEĞİŞMEZ).
2. **DB-düzeyi çift-satış kalkanı** (unique index; rakipler muhtemel app-level) → teknik + satılabilir güven.
3. **Komisyonsuz + abonelik + emlakçı bedava** (uluslararası peer'lerce doğrulanmış model).
4. **Yerel hendek:** EİDS/KVKK gömülü + saha WhatsApp deep-link kültürü.
5. **Tek doğru kaynak canlı fiyat/stok** + tazelik rozeti.

> KONUM CÜMLESİ: "Türkiye'nin yeni konut satış dağıtım altyapısı: müteahhit stoğunu tek merkezden yönetir, her emlakçı yalnız kendine tahsisli daireyi canlı görür, komisyonsuz. Portal değil, satışın omurgası."

---

## 4. ANLIK DURUM (şema + kod denetimi, tahmin değil)

Ürün CANLI (projedar.com). Rakiplerin "7-çekirdek"i + farklılaştırıcılar bizde tam olarak nerede:

| Yetenek | Durum | Kanıt (tablo/alan/mekanizma) |
|---|---|---|
| Canlı stok | VAR | `birim` tablosu + Realtime; durum müsait/opsiyonlu/satıldı |
| Tazelik göstergesi | VAR | `birim.son_guncelleme`; "X önce" + stale rozet (DEĞİŞMEZ #5) |
| Tek-kaynak fiyat | VAR | `birim.liste_fiyati`; paylaşımda canlı basılır (DEĞİŞMEZ #2) |
| Ödeme planı | VAR | `birim.odeme_plani` jsonb (peşinat/taksit/ara ödeme/vade farkı) |
| Granüler tahsis | VAR | `tahsis`: kapsam(blok/kat/tip), hedef(ofis/danışman/herkes), munhasir, kontenjan, fiyat_gorunur |
| DB çift-satış kalkanı | VAR | `opsiyon` + `unique index opsiyon_tek_aktif(birim_id)`, app değil DB |
| Opsiyon + iki-kademeli onay | VAR | `opsiyon` + `opsiyon_talep` (bekleyen-talep unique + onay FOR UPDATE) |
| Dalga/planlı lansman | VAR | `birim.satisa_acilis` + açılış cron |
| Müşteri claim / Lead Protection | VAR | `lead`: telefon_norm eşleşmesi + ilk_paylasan_id + atanan_id + kvkk_riza |
| Komisyon (emlakçı kazancı) gösterimi | VAR | `tahsis.komisyon_tip`(yuzde/sabit/**YOK**)+komisyon_deger; komisyonsuz DB'de |
| Belge doğrulama | VAR | `proje_belge` + `uretici.dogrulanmis` rozeti |
| Abonelik altyapısı | VAR | `abonelik` + `abonelik_paketi` (unique aktif abonelik) |
| Dinamik fiyat kuralı | VAR | `fiyat_kurali` tablosu |
| SEO katalog + /proje | VAR (canlı) | 36 katalog sayfası + resolver + admin tek-tık |
| Hakediş defteri / payout takip | **YOK** | komisyon ORANI var, kazanılan-vs-ödenen defteri yok |
| Zaman-damgalı müşteri-claim sertifikası (PDF/QR) | **YOK** | lead kaydı + timestamp var, ihraç edilen sertifika yok |
| Dijital aracılık sözleşmesi şablonu | **YOK** | Taşınmaz Tic. Yön. m.20 yazılı şart |
| EOI / pre-launch ön-talep | KISMİ | opsiyon_talep var; lansman-öncesi ayrı EOI yok |
| Link teklifi + görüntülenme analitiği | KISMİ | /p mikrosite var; teklif+iz analitiği Faz 2 |
| WhatsApp Cloud API otomasyon | YOK (Faz 2) | MVP: deep-link giden |

> SONUÇ (net): 7-çekirdekten **6 tam VAR** (ödeme planı dahil), **1 kısmi** (komisyon: oran gösterimi var, hakediş defteri yok). Farklılaştırıcıların (granüler tahsis, DB çift-satış, komisyonsuz seçenek, Lead Protection) HEPSİ şemada mevcut. Eksikler: hakediş defteri, claim-sertifikası, dijital sözleşme, EOI, link-teklif analitiği (hepsi Faz 2).

---

## 5. GELİŞTİRİLECEK YERLER (öncelik sırasıyla)

**A. Mesaj/landing boşlukları (itiraz matrisinden, güven-kritik):**
- 🔴 M4 "rakip müteahhit fiyatımı görür mü?" hiçbir yüzeyde cevaplı değil (RLS izolasyonu pazarlama diline çıkmamış).
- 🔴 E7 EİDS + sosyal-medya paylaşım politikası emlakçı landing'inde YOK.
- 🔴 Kilitli-kural İHLALİ: muteahhit sayfasında "Bölge başına sınırlı kurucu kontenjanı" bölümü var → kitlik-vaadi-yok kuralını ihlal ediyor, revize şart.
- M3 "kendi satış ofisim var" + M8/E9 soğuk-başlangıç yalnız deck'te, landing'de yok.
- "Komisyonun %100 sende" → "Projedar satış komisyonuna ORTAK OLMAZ" (danışmanın ofis payı var, mevcut dil yanlış anlaşılıyor).

**B. Ürün (Faz 2 aday, saha + rakip kanıtlı):**
- EOI (niyet kaydı) + zaman-damgalı müşteri claim (bypass koruması + hukuki ispat aracı; çift-satışta önceki tarihli kayıt geçerli).
- Komisyon/hakediş TAKİP (platform pay almadan) → retention kancası.
- Dijital aracılık sözleşmesi şablonu (Taşınmaz Tic. Yön. m.20 yazılı şart = komisyon hakkının doğması).
- Performans skoru → iyi/hızlı emlakçıya öncelikli tahsis.

**C. SEO tarafı:**
- 🔴 /konut-projeleri hub 404 (breadcrumb/nav link veriyor, sayfa yok) → acil.
- /firma/[slug] müteahhit kurumsal sayfası yok (firma aramasında çıkmak için).
- /proje FAQ iki-mod değil (katalog projesinde "bunu nasıl satarım" mantıksız).

> SONUÇ: Önce mesaj boşlukları + kilitli-kural fix (hızlı, güven-kritik) → SEO hub 404 (teknik acil) → EOI/claim + komisyon-takip (Faz 2).

---

## 6. FİYATLAMA (uzlaştırılmış)

- **Emlakçı:** core marketplace ÜCRETSİZ (Connject/Nogbase teyit) + Pro 750/ay (piyasa 300-900 psikolojik eşik içinde; üst segment 1.500+). Kurucu: ilk ~1000 danışman ilk yıl ücretsiz.
- **Müteahhit:** kurucu ilk ~10 ücretsiz → sonra daire-bazlı yıllık 150-600K. Çapalar YUKARI: Nogbase ~685K/yıl, Novo 2-5K TL/user-ay. Enterprise kademe ~650K+ savunulabilir. Küçük proje (<50 daire) için 40-85K yumuşak giriş kaynaklarda güçlü.
- ⚠️ Boost/vitrin geliri + komisyon escrow ALMA (DEĞİŞMEZ + konumu bozar). Komisyon sadece TAKİP.

> SONUÇ: Mevcut band doğru. Eklenecek: (a) enterprise üst kademe, (b) küçük-proje yumuşak giriş, (c) "ağdaki aktif daire" metriği.

---

## KARAR NOKTALARI (senin kararın)

1. Konumlandırma cümlesini onayla (Sales Distribution OS + komisyonsuz).
2. Finansal: muhafazakar floor (13-19M) + baz (gerçek fiyat) bandı mı, tek baz mı?
3. Müteahhit fiyatına küçük-proje (<50 daire) 40-85K yumuşak giriş kademesi eklensin mi?
4. EOI + müşteri-claim + komisyon-takip: Faz 2 roadmap mi, yoksa MVP'ye mi çekilsin?
5. Uygulama sırası: (a) mesaj/kural fix landing, (b) SEO hub 404, (c) deck rekabet+finansal, (d) /proje iki-mod içerik.

**Önerim (sıra):** kilitli-kural fix + "komisyona ortak olmaz" wording (güven-kritik, hızlı) → SEO hub 404 (teknik acil) → deck rekabet+finansal güncelle → /proje iki-mod içerik.
