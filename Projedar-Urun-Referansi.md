# Projedar : Kapsamlı Ürün Referansı (Tek Dosya, Güncel)

> **Ne:** projedar.com'un tüm özelliklerini, rollerini, ekranlarını, akışlarını, veri modelini, stratejisini ve güncel durumunu tek dosyada anlatan birleşik referans.
> **Kaynak:** `ProjePazar-Sistem-Kurallari.md` (bağlayıcı öz) + `ProjePazar-Sistem-Dokumantasyonu.md` (kod doğrulanmış envanter) + `ProjePazar-Devir-Dokumani.md` (build sırası) + `ProjePazar-Tasarim-Ruhu.md` + `Urun-Analiz-Dokumani-Coklu-Muteahhit-Dagitim-Agi` (orijinal 35 sayfa ürün analizi) + rakip/pazar/yurtdışı raporları + repo kodu ve commit geçmişi (2026-08-04'e kadar).
> **Durum tarihi:** 2026-08-04. Bu dosya bir durum fotoğrafı ve tam kapsam haritasıdır; çelişki hâlinde **bağlayıcı kaynak `ProjePazar-Sistem-Kurallari.md`'dir**, build sırası `ProjePazar-Devir-Dokumani.md`'dir.
> **Marka:** Ürün adı **Projedar**, alan adı **projedar.com** (eski ad ProjePazar; iç doküman dosya adları ProjePazar-* korunmuştur).

---

## 1. Ürün özü (tek paragraf)

Projedar, çok müteahhitli, üretici kontrollü, **canlı bir konut stoğu dağıtım ağıdır**. Üretici (müteahhit) stoğunu, fiyatını, dağıtımını ve lead'ini tek noktadan yönetir; emlakçı yalnız kendine **tahsis edilmiş** projeleri tek canlı havuzdan görür, tek tıkla paylaşır ve lead toplar. Ortada **tek doğru kaynak** durur: bir fiyat/durum değişince tüm yetkili emlakçılara anında yansır. Konumlanma: "en hızlı satış yapılan ağ" ve gayrimenkulün **güven protokolü**.

- **Çekirdek değer:** "Bu daire hâlâ satılık mı, fiyatı ne?" sorusuna her an %100 doğru cevap.
- **Kazandıran konum:** en hızlı satış yapılan ağ. "Tek doğru bilgi" giriş kapısıdır; asıl soru "platform satış hızlandırıyor mu?"
- **Ne DEĞİLİZ:** tekil CRM (Novo/Yapısoft) değil, açık pazaryeri (Topli/Tapuva) değil, ilan portalı (Sahibinden) değil, 3D/immersive stüdyo (Relata) değil, broker değil. **Saf satış altyapısı; komisyona dokunmaz, sözleşmeye taraf olmaz.**
- **Asıl moat:** tek özellik değil kombinasyon. Üretici kontrolü (granüler tahsis) + veri yerçekimi (events Faz 1'den birikir, geçmişe doldurulamaz) + bağımsız emlakçı ağı + WhatsApp öncelikli + DB seviyesi opsiyon kilidi + görünür tazelik + komisyonsuz.

**Kategori cümlesi (kalıcı):** "Yeni konut projeleri için tahsisli canlı satış ağı." Emlak yazılımı değil; sektörün güven protokolü.

---

## 2. Roller ve panelleri (DEĞİŞMEZ)

Her rol **AYRI** panel/yüzey görür. Bir rolün ekranı başka role gösterilmez.

| Rol kodu | Kim | Panel / Yüzey | Dijital olgunluk | Faz 1 durumu |
|---|---|---|---|---|
| `uretici` (Ü1) | Kurumsal müteahhit | **Müteahhit Konsolu** (proje/stok/tahsis/fiyat/durum/onay/lead/performans) | Yüksek (PRO) | ✅ tam |
| `uretici` (Ü2) | Geleneksel müteahhit | **WhatsApp + Concierge** (mesajla giriş, biz kurarız) | Düşük (SIMPLE) | ✅ (concierge/admin ile) |
| `emlakci` (E1) | Profesyonel danışman | **Emlakçı Havuzu / Canlı Ağ** (filtre/paylaş/opsiyon/içerik/lead) | Yüksek (PRO) | ✅ tam |
| `emlakci` (E2) | Geleneksel danışman | **Basit Mobil** (3 dokunuş: Bul, WhatsApp Paylaş, Ara) | Çok düşük (SIMPLE) | ✅ (PWA alt tab) |
| `ofis_yetkili` (O) | Emlak ofisi / franchise | **Ofis Konsolu** (iç dağıtım, ekip performansı), abonelik sahibi | Orta | Faz 1'de `/havuz` görür; ayrı konsol Faz 2 |
| `marka_yetkili` (M) | Remax/C21 marka | **Marka Konsolu** (şubelere dağıtım) | Yüksek | Faz 2 |
| `arsa_sahibi` | Kat karşılığı arsa sahibi | **Salt okunur** (yalnız kendi paylarının durumu) + pay bildirimi | : | Faz 2 |
| `admin` | **BİZ (platform işletmecisi)** | **Admin Paneli** (Bölüm 8) | : | ✅ tam |

**KRİTİK AYRIM:** `admin` ASLA bir üretici değildir. Üretici/ofis/emlakçı = **müşteri**. Admin = platformu işleten **biz**. Admin paneli stok/birim/fiyat/bina kesiti düzenleme ekranı içermez; yalnız gelir, hesap, doğrulama, denetim yapar. Admin gerektiğinde üretici panelini "impersonation" ile görebilir (amber uyarı bandıyla), ama kendi paneli üretici işi görmez. Rol → panel eşlemesi: `src/lib/roller.ts` (`panelYolu()`).

**İki mod ilkesi (DEĞİŞMEZ):** SIMPLE MODE varsayılan (Ü2/E2 dijitalleşmemiş: WhatsApp + birkaç buton, karmaşık güç arka planda). PRO MODE (Ü1/E1: tahsis paneli, toplu işlem, analitik). Aynı motor, iki yüz. "Ü2 ve E2'yi tutan ürün Ü1/E1'i zaten tutar; tersi değil."

---

## 3. Gelir modeli (fazlı; komisyon yok = DEĞİŞMEZ)

İlke: **komisyona dokunmadan** yazılım, erişim ve veriden gelir. Sözleşmeye taraf olunmaz.

**ERKEN AŞAMA (MVP / şu an):**
- **Ana gelir = müteahhit anlaşması.** Müteahhitle birebir B2B anlaşma ile para alınır (manuel; sabit SaaS paketi şart değil).
- **Emlakçı = bedava (basic).** Temel erişim ücretsiz, benimseme kaldıracı. "Kazancın %100'ü senin."

**SONRAKİ AŞAMA (değer kanıtlanınca):**
- **Emlakçı premium:** Paylaşım Stüdyosu, içerik, katalog/rapor export gibi hizmetler.
- **Ofis / franchise abonelik (SaaS):** bütçe sahibi + ekip yönetimi + havuz erişimi.
- **İşlem ücreti:** satış başı küçük opsiyonel pay (yalnız iz zinciri olgunlaşınca).

> `abonelik_paketi` / `abonelik` şema tabloları sonraki faz iskeleti olarak durur; erken aşamada müteahhit anlaşması Admin panelinde manuel yönetilir.

---

## 4. Altı teknik değişmez (asla bozma)

1. **RLS önce.** Her tabloda RLS açık. Görünürlük = `tahsis`. Client'tan service-role YOK (yalnız server/cron). Emlakçı yalnız tahsisli birimi görür.
2. **Tek doğru kaynak.** Fiyat/durum yalnız `birim` tablosunda. Kopyalama yok; paylaşımda/katalogda/mikrositede fiyat canlı değerden basılır.
3. **Çift satış kalkanı DB'de.** Aktif opsiyon için unique partial index + opsiyon ön koşulu (satılabilir + müsait) + onay RPC'de `FOR UPDATE`. Uygulama katmanına güvenilmez.
4. **WhatsApp hibrit.** MVP = giden **deep-link** (ücretsiz, emlakçı telefonundan) + butonlu **teyit şablonu** (Cloud API, yalnız müteahhit teyidi). Serbest metin AI parse ile stoğa yazma = Faz 2 (yanlış parse = yanlış stok = ölümcül).
5. **Tazelik görünür.** Her yazışta `son_guncelleme=now()`. UI'da "X önce" + N günden eski → stale (yeşil rozet sarıya döner). Tazelik Sigortası cron'u.
6. **Mobil önce + PWA.** Her ekran telefonda çalışır, çevrimdışı graceful, kurulabilir.

**Ek güvenlik kalkanları:** KYC gate (belge_durumu_guard trigger), HMAC token fail-safe (`LEAD_SHARE_SECRET` fallback yok), cron fail-closed (`CRON_SECRET`), lead public insert kontrollü (token + Zod + throttle + normalize), IDOR kalkanları (medya/tip yükleme sahiplik kontrolü).

---

## 5. Stratejik çekirdek (neden bu ürün kazanır)

### 5.1 Üç yapısal güç
1. **Tek doğru kaynak:** her birim tek kayıt, herkes aynı veriyi okur.
2. **Üretici kontrolü:** müteahhit kimin neyi hangi şartla satacağını belirler; en büyük benimseme engelini (kontrol kaybı korkusunu) doğrudan çözer.
3. **İki mod ilkesi:** aynı motor, profesyonele güç, dijitalleşmemişe aşırı basitlik.

### 5.2 Ağ etkisi döngüsü
Daha çok müteahhit → daha zengin havuz → daha çok emlakçı → daha geniş satış erişimi → daha çok müteahhit. İlk likidite (kritik kütle) yakalanınca kopyalanması zorlaşır.

### 5.3 Para dili (değeri kazanca çevir)
Piyasa "veri doğruluğu" satın almaz, para kazanmak ister. Tazelik, kullanıcıya "daha fazla satış" olarak çerçevelenir.

| Kim | Zayıf (soyut) | Güçlü (para dili) |
|---|---|---|
| Emlakçı | "Güncel veri görürsün" | "Masada fiyat tutar, satış iptal olmaz; herkesten önce yeni projeye erişir, hızlı kapatırsın" |
| Müteahhit | "Stoğun tek yerde" | "Daha çok emlakçı, daha hızlı satış; hangi dairenin ne zaman satılacağına dair talep zekası" |
| Ofis | "Ekibini yönet" | "Ekibin tek havuzdan satar, kim ne getirdi görünür; hakediş kavgası biter" |

### 5.4 Beş kaçınılmazlık kaldıracı ("iyi üründen vazgeçilmez ürüne")
1. **Özel stok:** "bu daireler yalnız platformda" → emlakçı girmek zorunda.
2. **Lead takibi + kim getirdi görünürlüğü:** danışman müşteri adayını platformda kaydeder; müteahhit ad/telefon **sorgulayınca** o müşterinin ilk kimin lead'i olduğunu görür. Platform sahiplik garanti etmez, arbitraj yapmaz, talep üretmez/lead dağıtmaz; çözüm taraflar arasıdır.
3. **Fiyat/talep zekası** (veri → güç).
4. **Paylaşım = kazanç:** getiren kazanır + ilk paylaşan avantajı → viral, bilgi saklama kırılır.
5. **Lock-in:** satış geçmişi + müşteri + performans + tahsilat burada; çıkarsa kaybeder. "Üretici sistemden çıkamaz hâle gelirse bu iş unicorn olur."

### 5.5 Kapsam disiplini (DEĞİŞMEZ test)
Her özellik tek testten geçer: **"canlı stok + üretici kontrolü + güven protokolü + dağıtımı mı güçlendiriyor; yoksa beni Sales OS / CRM / ERP / 3D stüdyo mu yapıyor?"** REFRAME pusulası: "Veri yerçekimini artırıyor mu?"

---

## 6. Hedef kitle ve pain point haritası

### 6.1 Müteahhit (üretici) : pain → çözüm
| Pain point | Bugün | Projedar çözümü |
|---|---|---|
| Stok dağınık ve eski (Excel, kafada) | Fiyat değişince 40 emlakçıya tek tek WhatsApp | Tek canlı kayıt; bir kez gir, her yerde anında |
| Kontrol kaybı korkusu | Kime verdiğini takip edemez | **Granüler tahsis:** kim/neyi/hangi şartla satar, üretici seçer (asıl moat) |
| Çift satış felaketi (itibar/hukuk) | İki emlakçı aynı daireyi satar | Opsiyon kilidi + iki kademeli üretici onayı (DB kalkanı) |
| Kim sattı/kim hak etti belirsiz | Komisyon kavgası | "Kim getirdi" iz zinciri (objektif delil) |
| Emlakçı terörü (portalda 20 farklı fiyat) | Prestijli proje pazar tezgâhına döner | Syndication: fiyat saniyeler içinde senkron, yalnız onaylı materyal paylaşılır |
| Lead her kanaldan dağınık | QR/Instagram/Sahibinden/ofis ayrı | Tek lead alanı: kendi kanalı + emlakçı lead'i |
| Kat karşılığı (arsa sahibi vs müteahhit payı) | Karışık, anlaşmazlık | Birim sahiplik etiketi + pay raporu (Türkiye'ye özel, rakipte yok) |
| Veri girmek zahmetli (küçük müteahhit) | Panel öğrenmez | Concierge (biz gireriz) + WhatsApp |
| "Verimi niye sana vereyim?" (güven) | : | Üretici kontrolü + doğrulanmış üretici rozeti + komisyona dokunmama |

### 6.2 Emlakçı : pain → çözüm
| Pain point | Bugün | Projedar çözümü |
|---|---|---|
| 5-10 dağınık kaynak (her müteahhit ayrı grup + eski PDF) | Ezbere tahmin | Tüm yetkili projeler tek ekranda, filtrelenebilir |
| Eski bilgiyle satış → masada fiyat tutmaz | Güncel olmayan bilgi | "Son güncelleme: 2 saat önce" tazelik damgası |
| Kendi markasıyla paylaşamıyor | Jenerik | İmzalı mikrosite + (premium) Paylaşım Stüdyosu |
| Komisyon/müşteri kapılma korkusu | Bilgi saklar | "İlk bayrağı ben diktim" (Lead Protection) + ilk paylaşan avantajı |
| Doğru projeyi/müşteriyi eşleştirme | Sezgi | Kural tabanlı fit-skor eşleştirme (NLP Faz 2) |
| Saha kullanımı (masaüstü kurmaz) | : | PWA: mobil önce, kurulabilir, çevrimdışı son senkron |
| Teknolojiden uzak danışman | Panel kullanamaz | Basit mod: 3 dokunuş (Bul → WhatsApp Paylaş → Ara) |

---

## 7. Rakip haritası ve savunma

### 7.1 Türkiye
- **Novo CRM** (üretici tarafı, TR tehdit #1): AI ağırlıklı 35+ modül, Broker Portalı ekledi. Fark: tek müteahhit içi CRM, komisyonlu; biz çok müteahhit ağ + komisyonsuz + DB seviyesi opsiyon kilidi.
- **Topli** (emlakçı tarafı, Kasım 2025 TR girişi): çok müteahhit ağ, danışmana bedava, success-fee. Fark: müteahhit kontrolü yok (stok herkese savrulur), komisyonlu; bizde tahsis-gated + kapalı devre.
- **Konutmatik:** tek müteahhit dijital satış ofisi; tasarım DNA'sı bize yakın, kotalı stok tahsisi var. Çok müteahhit havuza kayarsa en tehlikeli rakip. Fark: tek müteahhit izole, ağ yok.
- **Tapuva** (İstanbul): model birebir (geliştirici↔emlakçı, kart üstünde komisyon, AI satış koçu), erken.
- **EDAP** (Ankara): belge doğrulama merkezli, kademeli üyelik; Ankara cold-start sahamızla çakışır.
- **RE-OS:** emlakçı CRM + MLS + portföy havuzu, 8.000+ profesyonel, güçlü EİDS uyum mesajı.
- **Connject (KKTC):** komisyonsuz B2B proje sunum köprüsü, concierge + kontenjan gate; statik medya vitrini, canlı stok/tahsis yok.

### 7.2 Global (kategori olgun)
- **DomusHub:** off-plan Sales OS, 4 kabin, real-time stok, booking timer, aşamalı ödeme, satır içi komisyon, 5 dil (TR dahil), çoklu döviz, $250-500/ay. En olgun benzer. Fark: tek geliştirici SaaS; biz çok taraflı ağ. "Instant unit locking / zero double bookings" mesajını işgal etmeye başladı (ama kilidi ödemeye bağlar; bizde DB'de ve parasız).
- **Alnair (Dubai):** off-plan canlı stok + booking + WhatsApp dağıtım + magic-link. Master Agent komisyon toplar (çıkar çatışması).
- **Kords (MENA), Nexprop, Relata (immersive), Flatter/UnitAtlas (görselleştirme), Avesdo/Entera/BuildersUpdate/Buildify (ABD/Kanada).**

### 7.3 White-space (savunulabilir kombinasyon)
Dört tanımlayıcı mekanizmanın **hepsini** birleştiren rakip yok: (1) çok müteahhit tek canlı ortak havuz, (2) emlakçı bazlı tahsis kısıtlı görünürlük (RLS), (3) DB seviyesi ödemesiz çift satış kalkanı, (4) komisyonsuz. "Tahsisli stok" tek başına farklılaştırıcı değil (Konutmatik'te var); moat = **çok müteahhit ağ + bağımsız emlakçı + komisyonsuz + DB kilidi + veri yerçekimi + WhatsApp/concierge ile küçük müteahhit + Türkiye'ye özel** (kat karşılığı, koçan, Türkçe önce).

### 7.4 EİDS regülasyon avantajı
1 Şubat 2026'dan beri tüm satılık ilanlarda EİDS zorunlu; sosyal medyada yalnız EİDS linki paylaşılabilir (ceza 286.206 TL/paylaşım). Projedar kapalı devre olduğu için (açık ilan yok, tahsis var; kat irtifakı olmayan off-plan muaf) bu düzenleme bizi bağlamaz. Kapalı devre model = regülasyon kalkanı = moat. Tek gri alan: `public_slug` mikrosite (paylaşım şablonlarının "ilan mahiyeti" sınırı hukuk kontrolünden geçmeli).

---

## 8. Özellik envanteri (panel panel, ekran ekran)

> Toplam ~45+ sayfa. Görünürlük tamamen Postgres RLS'e devredilmiş; sayfa kodunda `emlakci_id` filtresi bilerek yoktur.

### 8.A Public + Auth + Kayıt

| Rota | Rol | İçerik | Durum |
|---|---|---|---|
| `/` (ana hub landing) | Public | Çift kapılı hub: hero + canlı portföy demo + ağ etkisi + `CanliHavuzDemo` + `CanliKomutaMerkezi` + SSS + JSON-LD (Organization/WebSite/FAQPage). Giriş yapmışı panele yönlendirmez (serbest gezinme). | ✅ |
| `/muteahhit` | Public | Üretici rol landing: "Envanter kontrolü sende. Çift satış yapısal olarak imkânsız." + tahsis yıldızı + DB kalkanı koreografisi + isim vermeden kıyas + EİDS uyum + BreadcrumbList/FAQ schema. CTA → `/kayit?rol=uretici` | ✅ |
| `/emlakci` | Public | Emlakçı rol landing: "Tamamen ücretsiz, komisyonun %100'ü senin." Dert→çözüm + 3 adım + KYC olumlu gate + tazelik demo. CTA → `/kayit?rol=emlakci` | ✅ |
| `/guven` | Public | 6 teminat kartı (DB kilidi, RLS, doğrulama, komisyonsuz, kapalı devre, tek kaynak) + EİDS "ilan değil tahsis" + KVKK çizgisi (piyasa zekâsı evet, müşteri profili hayır) + FAQ schema | ✅ |
| `/sunum/uretici` · `/emlakci` · `/pitch` · `/gtm` | Gizli link | Yüz yüze görüşme deck'leri (koyu sinematik tema, PDF çıktısı). Üretici 17 slayt, emlakçı 16 slayt, pitch (TÜİK 2025 pazar verisi), GTM. noindex, sitemap dışı | ✅ |
| `/tasarim` + `/tasarim/[yon]` | Dahili | Tasarım karar aracı: aynı örnek proje 4 ruhta (lüks/minimal/cesur/sıcak) | ✅ |
| `/login` | Public | E-posta/parola giriş; `durum!=aktif` → `/hesap-bekliyor`, değilse `panelYolu(rol)` | ✅ |
| `/kayit` (+ `/kayit/belge`) | Public | 2-3 adımlı self-registration. Rol seçimi + rol bazlı alanlar (üretici YAMBİS/MERSİS/ticaret sicil, ofis TTBS/MYS, emlakçı TCKN/MYS belge + seviye). DB trigger `handle_new_user` `onay_bekliyor` başlatır. Emlakçı → KYC belge wizard (mesleki yeterlilik + vergi levhası, `kyc-belge` bucket) | ✅ |
| `/hesap-bekliyor` | Auth | Durum özel bekleme (onay_bekliyor/pasif/askıda/arşivli) + WhatsApp CTA | ✅ |
| `/gizlilik`, `/kvkk-aydinlatma`, `/kullanim-kosullari` | Public, noindex | KVKK/hukuki metinler | ✅ (TASLAK, avukat incelemesi gerekli) |
| `/p/[emlakci]/[birim]/[token]` | Public (anonim) | Paylaşım mikrositesi (Bölüm 9) | ✅ (en olgun sayfa) |

### 8.B Üretici Paneli (`/uretici`)
Layout guard: giriş yoksa `/login`; rol `uretici`/`admin` değilse `/`. Admin görürse amber "Admin olarak görüntülüyorsun" bandı.

| Rota | Amaç | Ana içerik | Durum |
|---|---|---|---|
| `/uretici` (Kokpit) | Canlı stok komuta merkezi | 6 KPI + stok dağılım barı + proje kartları + basit talep radarı + tam genişlik stok tablosu | ✅ |
| `/uretici/projeler` | Proje listesi | Kapaklı kart grid (stok/tazelik/fiyat aralığı) | ✅ |
| `/uretici/proje/yeni` | Kurulum sihirbazı | `ProjeWizard` 7 adım: künye → blok/tip → birim üretimi → fiyat/ödeme → medya → tahsis → yayınla | ✅ |
| `/uretici/proje/[id]` | Günlük operasyon | `BinaKesiti` (birim durum yönetimi) + **TAHSİS (MOAT) CRUD** + medya | ✅ |
| `/uretici/proje/[id]/kurulum` | Bir kez kimlik | Künye/imar/yatırım/ödeme/mahal/stok kurulumu/tanıtım/belge/**öznitelik taksonomisi**/**opsiyon yöntemi seçimi** | ✅ |
| `/uretici/stok` | Tek canlı fiyat listesi | `StokTablo` + `DaireModal` (üretici modu) + Bina Kesiti/Tablo görünüm geçişi, `?durum=` filtre | ✅ |
| `/uretici/tahsis` | Dağıtım genel bakış | Proje bazlı tahsis tablosu + erişim özeti rozeti ("Tüm ağa açık" / "N ofis · M danışman" / amber "Kimse görmüyor") | ✅ (view; CRUD proje detayda) |
| `/uretici/opsiyonlar` | Onay kuyruğu + kilitler | Bekleyen opsiyon talepleri (`OpsiyonKarar`/`TalepKarar` onay/red) + aktif kilit tablosu + aciliyet sinyalleri (<6sa amber, süresi dolan kırmızı) | ✅ |
| `/uretici/talep-radari` | Satış Zekâsı (veri moat) | events dönüşüm hunisi + içgörü kartları + aktif danışmanlar + hareket feed | ✅ |
| `/uretici/fiyat-onerisi` | Dinamik fiyat önerisi | events talep skoru → fiyat nudge (yalnız öneri, fiyatı değiştirmez) | ✅ |
| `/uretici/raporlar` | Performans özeti | Daire tipi bazlı satış oranı | ✅ |
| `/uretici/lead-sorgu` | Müşteri sorgula (kapalı devre) | ad/telefon birebir eşleşme → "ilk kaydeden danışman"; toplu listeleme YOK | ✅ |
| `/uretici/lansman` | Lansman/kampanya | Lansman oluştur/sil (proje + başlık + tarih + konum + durum: lansman/on_talep/satista/etkinlik) | ✅ |
| `/uretici/davet` | Davet | Ekip/danışman davet | ✅ |
| `/uretici/bildirimler` | Bildirimler | Son 100 → `BildirimListe` | ✅ |
| `/uretici/ayarlar` | Profil + firma | Doğrulama rozeti + **kurumsal firma profili** (logo/kuruluş yılı/hakkında/web/konum, `uretici.profil jsonb`) | ✅ |

### 8.C Emlakçı Havuzu / Canlı Ağ (`/havuz`)
Layout guard: izinli roller `emlakci/admin/ofis_yetkili/marka_yetkili/arsa_sahibi`. Doğrulanmamış emlakçı (`belge_durumu!=dogrulandi`) → "yalnız demo" bandı + `/havuz/dogrulama` CTA (yalnız `proje.demo=true` görür).

| Rota | Amaç | Ana içerik | Durum |
|---|---|---|---|
| `/havuz` (Canlı Ağ) | Tahsisli projeler komuta ekranı | `HavuzListe`: filtreler (Ülke›İl›İlçe + tip + durum + **8 kategori öznitelik facet'i**) + 4 KPI + proje kartları (stok bar, 4 kademeli tazelik rozeti) + **Liste/Harita geçişi** (Leaflet, sinyal renkli pin) + WhatsApp paylaş | ✅ |
| `/havuz/proje/[id]` | Proje detay + canlı fiyat | Hero/galeri/künye/kat planı/mahal + üretici firma kartı + `EmlakciStok` (Realtime) + her birim `/p/` mikrosite linki + **KatalogSecici** (müşteri kataloğu) | ✅ |
| `/havuz/opsiyonlarim` | Opsiyonlarım | Aktif kilitler (48s geri sayım) + bekleyen talepler (geri çek) | ✅ |
| `/havuz/paylastiklarim` | Paylaşım izleri | events (tip=paylasim) listesi, canlı fiyatla | ✅ |
| `/havuz/leadler` | Lead'lerim | Lead kartları + durum ilerletme + ara/WhatsApp | ✅ |
| `/havuz/eslestir` | Müşteri eşleştirme | Kritere göre fit-skor sıralaması (NLP Faz 2) | ✅ (çekirdek) |
| `/havuz/lansman` | Lansman Radarı | Tahsisli projelerin duyuruları (tarih/konum/durum rozeti) | ✅ |
| `/havuz/bildirimler` | Bildirimler | Son 100 → `BildirimListe` | ✅ |
| `/havuz/dogrulama` | Hesap doğrulama (KYC) | Belge yükleme + durum kartı | ✅ |
| `/havuz/profil` | Profil (salt okunur) | Kimlik + bağlı ofis | ✅ |

### 8.D Admin Paneli (`/admin`) : platform işletmecisi (BİZ)
Guard iki katmanlı: `layout.tsx` (rol=admin değilse `/`) + her action'da `adminGuard()`. Footer: "Bu panel stok/birim/bina kesiti görmez; gelir, hesap, doğrulama, denetim odaklıdır."

| Rota | Amaç | Ana içerik | Durum |
|---|---|---|---|
| `/admin` (Genel Bakış) | Platform komuta merkezi | MRR + onay kuyruğu + üretici doğrulama + ofis abonelik + denetim son 5 | ✅ |
| `/admin/kullanicilar` + `/[id]` | Tüm hesaplar | Liste + yeni kullanıcı oluştur (service-role) + hesap detay (parola sıfırla, durum değiştir) | ✅ |
| `/admin/ureticiler` | Müteahhit firmalar | Hesap aç + güven rozeti (doğrula) + **abonelik ata (ana gelir)** | ✅ |
| `/admin/ofisler` | Ofisler | Hesap aç + koltuk kapasitesi + paket ata | ✅ |
| `/admin/uyelik` | Üyelik paketleri | `PaketYonetimi` CRUD (fiyat/kota; hardcode yok) | ✅ |
| `/admin/onay` | Onay kuyruğu | Bekleyen kayda rol + ofis ata → onayla/reddet | ✅ |
| `/admin/dogrulama` | KYC belge review | `kyc-belge` imzalı URL (1sa) + doğrula/reddet | ✅ (service-role) |
| `/admin/denetim` | İz zinciri | events son 100, tip filtreli | ✅ (service-role) |

**Üç ayrı onay/doğrulama akışı:** (a) kayıt onayı (`profiles.durum`), (b) üretici güven rozeti (`uretici.dogrulanmis`), (c) KYC belge (`kullanici_belge.durum` + `profiles.belge_durumu`).

> **Planlanan (mockup onaylı, kod bekliyor):** `/admin/basvurular` : Onay Kuyruğu + Belge Doğrulama tek "Başvurular" alanında birleşir; liste + kayan detay paneli (drawer); rol duyarlı başvuru dosyası (tüm `profil_detay` + doğrulanabilir belge no + KYC belgeler + AI ön tarama rozeti + timeline). Şema değişikliği yok; mevcut action'lar yeniden kullanılır. Mockup: `tasarimlar/v2-admin-basvurular.html`.

---

## 9. Paylaşım mikrositesi (`/p/[emlakci]/[birim]/[token]`) : uçtan uca

Sistemin en kritik ve en olgun parçası; kapalı devre paylaşımın kalbi.

1. **Token üretimi:** Emlakçı `/havuz/proje/[id]`'de her birim için `generateShareToken(emlakciId, birimId)` = HMAC-SHA256 ilk 16 char (`LEAD_SHARE_SECRET`, fallback YOK).
2. **Paylaşım:** `PaylasWhatsApp` → `paylasimKaydet` anonim event yazar, sonra `wa.me` deep-link açar (emlakçının kendi telefonundan, ücretsiz).
3. **Açılış (anonim):** `verifyShareToken` eşleşmezse `notFound()`. Veri `createAdminClient` (RLS bypass, server-only) ile çekilir.
4. **Canlı fiyat basımı:** Fiyat `birim.liste_fiyati`'ndan o anki değerle (kopya yok, DEĞİŞMEZ #2). `satilabilir=false` → "satışa kapalı".
5. **İçerik (zenginleştirilmiş):** Hero + canlı durum rozeti + fiyat + danışman kartı + WhatsApp CTA + **foto galeri (lightbox)** + video + proje hakkında + **olanaklar & donatı** (8 kategori öznitelik) + künye (ada/parsel/emsal/taks) + kat planı + **daire içi özellikler + yakın çevre** + **etkileşimli ödeme planı slider** (peşinat↑→taksit↓) + harita + benzer birimler + eklentiler.
6. **OG önizleme (link kartı):** `generateMetadata` → başlık "{proje} · Daire {no} · {canlı fiyat}", og:image = proje kapak veya birim özel dinamik kart (`opengraph-image.tsx`). `robots: index:false` (kapalı devre).
7. **Tazelik:** nabız animasyonlu nokta + "X önce güncellendi".
8. **Event kaydı:** `after()` ile anonim görüntüleme (service-role, fire-and-forget). KVKK-safe: müşteri kimliği/IP/telefon YOK.
9. **Lead formu:** Yalnız `satilabilir && musait` ise. Niyet + ad + telefon + **ayrı açık rıza checkbox** (KVKK). POST `/api/lead` → token doğrula + normalize + throttle → `lead` insert (atanan=ilk_paylasan=emlakci) + event + danışmana bildirim. PII yalnız lead sahibi danışmana gider.
10. **Katalog export (yeni):** Emlakçı tahsisli daireleri seçip müşteriye kompakt fiyat listesi kataloğu üretir (print-optimize HTML → PDF, `window.print()`). Fiyat canlı basılır; her satırda mikrosite linki (tıklama → görüntüleme sinyali). Ağır PDF motoru yok.

---

## 10. Çekirdek akışlar

**Onboarding:**
```
/ (landing) → /kayit?rol=X → kayitOl → (emlakci) /kayit/belge → /hesap-bekliyor
                                     → (uretici/ofis) /hesap-bekliyor
admin onaylar (/admin/onay) → durum=aktif → login → panelYolu(rol)
```

**Üretici kurulum zinciri (üç onboarding yolu: kendi kurar / concierge / WhatsApp):**
```
/uretici/proje/yeni (wizard) → projeOlustur → /kurulum
  → blok/tip → birimGenerator (tip×kat) veya excelImport → fiyat/ödeme → medya → TAHSİS
  → /uretici/proje/[id] (operasyon)
```
Generator = ölçek anahtarı: Daire Tipi Şablonu + Kat Şablonu → 1000 daire tek tek girilmez.

**Tahsis → görünürlük → paylaşım → lead:**
```
üretici: tahsisEkle (segment/ofis/danışman + kapsam blok/kat/tip/tür/birim)
   ↓ RLS (emlakci_birim_gorebilir: daire bazlı + KYC gate + segment)
emlakçı: /havuz → /havuz/proje/[id] → generateShareToken
   ↓ PaylasWhatsApp (deep-link)
müşteri: /p/{...}/{token} → LeadForm → /api/lead
   ↓
emlakçı: /havuz/leadler   +   üretici: /uretici/lead-sorgu (yalnız sorgu)
```

**Opsiyon durum makinesi + çift satış kalkanı:**
```
musait ──(emlakçı opsiyon)──▶ opsiyonlu ──("sattım")──▶ satis_beklemede
satis_beklemede ──(üretici ONAY)──▶ satildi   /   ──(RED)──▶ musait
opsiyonlu ──(kilit_bitis geçti; cron)──▶ musait
planli ──(satisa_acilis geçti; cron)──▶ musait
```
Kalkan: `opsiyon_tek_aktif` unique partial index (`WHERE durum IN ('opsiyonlu','satis_beklemede')`) + `opsiyon_birim_senkron` trigger + onay RPC'de `FOR UPDATE`. İkinci opsiyon INSERT'i DB hatası alır.

**Opsiyon yöntemi (müteahhit kontrollü, proje bazında seçilir):**
- **`dogrudan`:** emlakçı "Opsiyon Al" ile ANINDA kilitler (RPC `opsiyon_al_dogrudan`, SECURITY DEFINER).
- **`talep_kod` / onay:** emlakçı talep açar → müteahhit onaylar (RPC + `FOR UPDATE`).
- **`gecici` (2 fazlı, yeni):** emlakçı alır → daire anında kilitlenir (çift satış korunur) ama `dogrulandi=false`, **müşteri bilgisi zorunlu + kota kontrolü**. Faz 2: müteahhit doğrular (kesin: `kilit_bitis=now+kilit_gun`) / reddeder (serbest bırakır) / doğrulama penceresi dolarsa cron serbest bırakır. RPC'ler: `opsiyon_al_gecici`, `opsiyon_dogrula`, `opsiyon_reddet`. Migration: `db/2026-08-04_opsiyon-gecici-dogrulama.sql`.

**Analitik veri akışı:**
```
paylaşım/görüntüleme/lead/opsiyon/katalog → events (append-only, service-role yazar)
   ↓
/uretici/talep-radari (dönüşüm hunisi) + /uretici/fiyat-onerisi (fiyat nudge)
   ↓
/admin/denetim (iz zinciri)
```

---

## 11. Veritabanı şeması (19+ tablo)

> Ana şema `supabase-schema.sql` 16 tablo; `db/` altındaki migration'lar tablo ekler ve genişletir. Kod migration kolonlarını kullanır; canlıda hepsi uygulanmış.

### 11.1 Çekirdek tablolar
| Tablo | Rol | RLS özeti |
|---|---|---|
| **profiles** | Kullanıcı (auth.users 1-1): rol, ad, telefon, ofis_id, durum, `belge_durumu` (KYC), marka/il/ilce/uzmanlik (segment), `profil_detay` (YAMBİS/MERSİS/TTBS/MYS/TCKN) | self + admin; `belge_durumu_guard` trigger |
| **uretici** | Müteahhit firma: dogrulanmis (güven rozeti), sahip_id, **`profil jsonb`** (logo/kuruluş/hakkında/web/konum) | sahip/admin; emlakçı tahsisli projesinin üreticisini görür |
| **ofis** | Emlak ofisi/franchise | herkes okur, yazma admin |
| **proje** | Künye + konum + inşaat zaman çizelgesi + `public_slug` + `demo` + `opsiyon_yontemi` + **`opsiyon_ayar jsonb`** + `kunye jsonb` (açıklama/donatı/öznitelik/yakın çevre) + Faz 2 yurtdışı alanları | sahip tam; emlakçı yalnız tahsisli |
| **blok** | Proje bloğu | sahip; tahsisli emlakçı okur |
| **daire_tipi** | Daire tipi (3+1 vb.), plan_url, taban_fiyat, banyo/balkon/otopark | sahip; tahsisli emlakçı okur |
| **birim** | **TEK DOĞRU KAYNAK.** tur, islem_tipi, satilabilir, satisa_acilis, tapu_durumu, durum, liste_fiyati, kira_bedeli, `odeme_plani jsonb`, serefiye, yon, manzara, net/brüt m², sahiplik, `ana_birim_id` (eklenti), stale | sahip tam; emlakçı yalnız `emlakci_birim_gorebilir()` (6-arg: daire bazlı + KYC + segment). **Realtime publication'da** |
| **tahsis** | **GÖRÜNÜRLÜĞÜN KAYNAĞI.** kapsam jsonb (blok/kat/tip/tür/birim), hedef_tip, hedef_filtre (segment), komisyon_tip/deger, münhasır, kontenjan, fiyat_gorunur | yalnız sahip üretici/admin |
| **opsiyon** | Birim kilidi: satici_id, durum, kilit_bitis + (yeni) `dogrulandi`, `dogrulama_bitis`, `musteri_ad/tel`, `gerekce`, `sonuc` | çift satış kalkanı; INSERT talep→onay veya dogrudan/gecici RPC |
| **opsiyon_talep** | Opsiyon talep→onay: durum, karar_veren_id | `opsiyon_talep_bekleyen_tek` unique |
| **lead** | Müşteri talebi: telefon_norm, atanan_id, ilk_paylasan_id, kvkk_riza | insert public (token); SELECT yalnız admin + atanan/ilk_paylaşan (üretici feed görmez) |
| **events** | Append-only audit (paylaşım/görüntüleme/lead/opsiyon/katalog) | select admin/kendi/sahip; INSERT yok → service-role yazar |
| **lansman** | Lansman/kampanya: proje_id, baslik, tarih, konum, durum | `lansman_owner` (üretici) + `lansman_emlakci_select` (tahsisli) |
| **proje_belge** | Ruhsat/iskan/yapı denetim + kapak/foto medya | sahip; tahsisli emlakçı okur |
| **mahal** | Teslim standardı (zemin/duvar/tavan/marka) | sahip; tahsisli emlakçı okur |
| **kullanici_belge** | KYC belge (mesleki_yeterlilik/vergi_levhasi), `ai_sonuc jsonb` (AI ön tarama) | self/admin; private `kyc-belge` bucket |
| **bildirim** | in-app bildirim | self okur/günceller; INSERT yok → service-role yazar |
| **abonelik_paketi** / **abonelik** | SaaS kademe + atanan abonelik (Faz 2 iskeleti) | herkes okur / abone başına tek aktif; admin |
| **fiyat_kurali** | Dinamik fiyatlama (Faz 2 hazır) | sahip üretici/admin |

### 11.2 Enum'lar (ürün tanım derinliği)
- **birim_durum:** musait · opsiyonlu · satis_beklemede · satildi · stop · planli · kiralandi
- **birim_tur (segment):** daire · ofis · dukkan · villa · depo · otopark (ticari farklı emlakçıya tahsis edilebilir)
- **islem_tipi:** satilik · kiralik · satilik_kiralik · pay_satisi · satisa_kapali
- **tapu_durum:** kat_irtifaki · kat_mulkiyeti · arsa_tapusu · kocan (KKTC) · yok
- **Üç net satış durumu (karıştırılmaz):** (a) **satılabilir**, (b) **planlı** (satışa açılış tarihi gelince cron açar), (c) **kalıcı satılamaz** (`sahiplik='arsa'` + `satilabilir=false`, arsa sahibi payı; havuzda görünür, satışa kapalı).
- **Komisyon görünürlüğü:** üretici tahsiste %/sabit tanımlar; emlakçı kendi kazancını görür, başkasınınkini görmez (RLS).

### 11.3 Öznitelik taksonomisi (`lib/ozellikler.ts`, 8 kategori)
Serbest metin yerine sabit sözlük: daire içi · sosyal · bina · ulaşım · güvenlik · teknik · otopark · manzara. `OzellikSecici` (üretici kurulum checkbox) + `OzellikGoster` (mikrosite/proje gruplu chip). Havuz filtre facet'i aynı 8 kategoriyle süzer (AND).

---

## 12. Güven protokolü (somut mekanizmalar)

- **Kim getirdi görünürlüğü (garanti DEĞİL):** danışman müşteri adayını kaydeder (telefon normalize); müteahhit ad/telefon **sorguladığında** ilk kimin lead'i olduğunu görür. Tüm danışmanların lead'i müteahhite iletilmez; yalnız sorgu sonucu gösterilir. Platform sahiplik garanti etmez, arbitraj yapmaz.
- **İlk bayrağı ben diktim (Lead Protection):** emlakçı sunum linkini paylaştığı an müşteri telefonu ona eşlenir; müşteri showroom'a tek başına gitse bile müteahhit numarayı girince "bu lead'i X getirdi" çıkar.
- **Tazelik Sigortası (Stale-Data Fuse):** 15 gün hareketsiz proje → müteahhite butonlu WhatsApp teyit; cevapsızsa "Canlı" rozeti sarıya döner + "son teyit 15 gün önce" uyarısı.
- **Syndication (fiyat/içerik senkron):** müteahhit %10 zam → tüm emlakçı PWA'sı saniyeler içinde güncellenir, eski fiyata kırmızı çizgi. Emlakçı yalnız onaylı/markalı materyal paylaşır.
- **Doğrulanmış üretici/proje rozeti:** vergi no/ruhsat/yapı denetim teyidi → sahte ilan riskine karşı.
- **Arsa sahibi (Faz 2):** salt okunur kendi payları + pay bildirimi WhatsApp (viral kaldıraç: şeffaflığı gören arsa sahibi bir sonraki arsasını yine bu sistemi kullanan müteahhide verir).
- **Kim getirdi iz zinciri:** her paylaşım/görüntüleme/lead/satış `events`'e. Komisyon Faz 2 ama iz Faz 1'den (geçmişe dönük üretilemez).

---

## 13. Tasarım sistemi : Berrak Güven

**Kuzey yıldızı:** "Buradaki veri canlı. Buradan satış yönetilir." His: Bloomberg + Linear + Notion + Apple Maps. Güzel görünmekten çok canlı veri güveni. His: ciddi, veri odaklı, hızlı, premium, sahada kullanılabilir, mobilde çok basit. CRM değil, katalog değil, portal değil.

**Renk = statü dili (dekoratif renk yok):**
- ink `#0F2638` · navy `#13314B` (komut alanı) · teal `#1E9B8A` (aksiyon/canlılık) · zemin `#EEF1F5`/spatial açık · kart beyaz · çizgi `rgba(15,38,56,.10)`
- **Sinyal (sabit):** müsait/yeşil `#2FB36B` · opsiyon/amber `#E3A12C` · satıldı/kırmızı `#D15A4E` · pasif/gri `#98A2B3`

**Tipografi:** Bricolage Grotesque (başlık) · Instrument Sans (arayüz) · Geist Mono (fiyat/tarih/sayaç/stok kodu, tabular-nums). Sunum ve OG kartında Outfit/Inter varyantı.

**İmza öğeler:**
- **Canlılık rozeti:** "● X önce" nabız animasyonu. Kademeler: 0-24sa yeşil · 1-7g teal · 7-15g amber · 15g+ gri. Sistemin imzası.
- 3×3 birim ızgara logosu (sinyal renkleri). Kritik kartlarda üstte ince renkli sinyal şeridi.
- Kart = mini dashboard. Radius 20-24px. Bol beyaz alan, sıcak kırık beyaz zemin.

**Beş ilke:** (1) Tek doğru bilgi (tasarım hiçbir şeyi gizlemez), (2) sinyal > gürültü, (3) iki yüz tek ruh (SIMPLE + PRO), (4) tazelik görünür, (5) ızgara dürüsttür.

**Layout:** Desktop = sol sidebar (Genel Bakış/Projeler/Stok/Tahsis/Opsiyonlar/Leadler/Talep Radarı/Raporlar/Ayarlar) + üst bar (canlı durum/son senkron/arama/bildirim) + geniş veri kartları. Mobil = alt tab (Ağ/Leadler/Paylaş/Opsiyon/Profil); E2 için 3 aksiyon.

**Stok ekranı 3 görünüm:** (1) Bina Kesiti (imza: blok/kat/daire, durum renkli, `A-12 / 3+1 / ₺8.75M`), (2) Tablo (pro), (3) Radar (talep yoğunluğu). Butonlar min 44px desktop / 52px mobil.

---

## 14. Teknoloji ve mimari

| Katman | Teknoloji |
|---|---|
| Frontend | Next.js (App Router, TypeScript strict) + Tailwind v4 + `motion` |
| Backend/DB | Supabase: PostgreSQL + Auth + Realtime + Storage + **RLS her tabloda** |
| Hosting | Vercel: serverless + günlük cron (`syd1` region) |
| PWA | serwist (service worker + manifest), mobil önce |
| Harita | Leaflet + OSM raster (anahtarsız) |
| Mail | Resend (transactional, best-effort) + markalı şablonlar (app + auth) |
| Faz 2 | Claude API (parse/içerik/eşleştirme), WhatsApp Cloud API (butonlu teyit) |

**Güvenlik mimarisi:** Görünürlük tamamen Postgres RLS'e devredilmiş. `tahsis` tablosu + SECURITY DEFINER fonksiyonlar (`emlakci_birim_gorebilir`) görünürlüğü belirler. Service-role (`createAdminClient`) yalnız server action / cron / route handler'da; `NEXT_PUBLIC` olmadığı için client bundle'ına girmez. Browser yalnız anon key kullanır. Multi-tenant baştan (uretici_id izolasyonu). Realtime "nice to have"; gayrimenkul temposu saat/gün, DB kilidi + cron yeterli.

### 14.1 API ve cron
Cron çizelgesi: tek path `/api/cron`, günde bir (03:00 UTC), üç iş dispatcher içinde sırayla.

| Endpoint | İş | Güvenlik |
|---|---|---|
| `/api/cron` | Dispatcher: opsiyon_suresi → stok_acilis → freshness | `cronYetkiKontrol` fail-closed (`CRON_SECRET` yoksa 500) |
| `/api/cron/freshness` | 15 günden eski birimi `stale=true` | service-role |
| `/api/cron/option-expiry` | Süresi geçen opsiyonu sil (trigger birimi müsait yapar) + audit; geçici opsiyon doğrulama penceresi dolanı serbest bırakır | service-role |
| `/api/cron/stok-acilis` | `planli` + `satisa_acilis<=now` birimi müsait yap | service-role |
| `/api/etkilesim` | Mikrosite anonim `favori`/ödeme_hesap sinyali (PII yok) | HMAC token |
| `/api/lead` | Public lead formu | Zod + HMAC + normalize + 10dk throttle |
| `/api/uretici/emlakci-ara` | Tahsis danışman arama + segment sayımı | anon rol-guard → service-role |

### 14.2 Çevre değişkenleri (`.env.example`)
`NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY` (server/cron) · `NEXT_PUBLIC_APP_URL` · `LEAD_SHARE_SECRET` (fallback yok) · `CRON_SECRET` · `RESEND_API_KEY` + `MAIL_FROM` · (Faz 2) `WHATSAPP_*`, `ANTHROPIC_API_KEY`.

---

## 15. SEO / GEO altyapısı

- **Middleware muafiyeti (kritik fix):** `robots.txt`, `sitemap.xml`, `opengraph-image`, `twitter-image` route'ları auth yönlendirmesinden muaf (önceden crawler'lar `/login`'e yönleniyordu; robots/sitemap/OG ölüydü).
- **metadataBase:** `https://projedar.com` → canonical + og:image absolute URL'e çözülür. Site geneli openGraph/twitter defaultları + robots(index,follow,max-image-preview:large).
- **Dinamik OG görseli:** `src/app/opengraph-image.tsx` (edge, ImageResponse) 1200×630 koyu komuta kartı (canlılık rozeti + wordmark + sinyal imzası, TR glyph subset). Dosya tabanlı → tüm route'lara otomatik. Mikrosite birim özel OG kartı da var.
- **robots:** 28 AI crawler explicit Allow (GPTBot, ClaudeBot, PerplexityBot, Google-Extended/Vertex, Apple, Meta, cohere, Diffbot, Phind, You, DuckAssist, Petal, Brave...).
- **Schema:** ana sayfa Organization + WebSite + FAQPage(7); muteahhit/emlakci/guven WebPage + FAQPage + BreadcrumbList (4 public sayfada tutarlı).
- **llms.txt:** kapsamlı (7 SSS). **sitemap:** 7 public URL (panel/mikrosite/sunum noindex + sitemap dışı).
- **Kalan:** blog/knowledge-base bölümü (blog henüz yok), agent-readiness `.well-known/*` (kapalı devre B2B için ikincil).

---

## 16. Yol haritası ve durum

### 16.1 MVP çekirdeği (büyük ölçüde bitti)
Stok + tahsis + opsiyon (talep-onay + dogrudan + geçici hibrit) + paylaşım + lead (sorgu) + tazelik + admin + KYC + analitik + firma profili + lansman + öznitelik filtresi + harita + mikrosite zenginleştirme + katalog + SEO/GEO. Hepsi commit'li ve canlıda.

### 16.2 İki stratejik reframe (yol haritasından neden saptı)
1. **2026-06-18 : Lead Engine kaldırıldı.** "Platform lead dağıtmaz/garanti vermez." Model: danışman kendi lead'ini toplar, müteahhit yalnız sorgular. Gelir fazlandı (müteahhit anlaşması + emlakçı bedava).
2. **2026-06-28/29 : "Sales Intelligence Platform" tezi.** Pusula: "veri yerçekimini artırıyor mu?" Kategori: "Tahsisli Canlı Satış Ağı." Landing geliştirici önce konumlandı.

### 16.3 Gerçek kalan frontlar
(a) Emlakçı katalog kodu (spec onaylı: `docs/superpowers/specs/2026-08-04-emlakci-katalog-design.md`), (b) admin "Başvurular" birleşik ekran kodu (mockup onaylı), (c) QA/cila sweep, (d) Faz 2 dış bağımlılıklar (WhatsApp Cloud API, AI/LLM, KYC AI oto doğrulama), (e) yeni logo (aday HTML'leri working tree'de).

### 16.4 Faz 2 (kod yazma sınırı)
WhatsApp serbest metin AI parse · Paylaşım Stüdyosu premium · ödeme planı motoru (döviz/senet) · dinamik fiyat otomasyonu (`fiyat_kurali` hazır: kat katsayısı + fiyat geçmişi) · opsiyon talep + kod · ticari pay satışı & detaylı kira · arsa sahibi paneli + pay bildirimi · kat karşılığı pay raporu · fiyat/talep zekası killer paneller (fiyat sapma off-platform, emlakçı skoru, tahsilat radar, satılabilirlik skoru) · marka konsolu · **yurtdışı projeler** (ülke/döviz/getiri/oturum/çok-dil alanları şemada hazır, boş) · AI hybrid search (pgvector) · Kolayimar video motoru entegrasyonu · Identity Graph (KVKK kapısı, kullanıcı kararı bekliyor) · finansal katman (Bloomberg vizyonu) · Sydney→Frankfurt migration (TR latency).

### 16.5 NE YAPMAYIZ (kategori dışı)
3D/immersive stüdyo motoru (üretici render/video yükler, biz motoru yapmayız) · tam CRM/muhasebe/ERP/post-sales evrak · online ödeme/escrow + otomatik sözleşme üretimi ("sözleşmeye taraf olmayız") · fuar/phygital araçları · B2C açık ilan portalı.

---

## 17. Vizyon (büyük resim)

| Aşama | Ne | Neyi mümkün kılar |
|---|---|---|
| Bugün | Canlı stok dağıtım ağı | Tek doğru bilgi, satış hızı |
| +12 ay | Proje veri altyapısı | Arz + talep izinin tek yerde toplanması |
| +24 ay | Fiyat & talep endeksi | Gerçek işlem verisinden piyasa göstergesi (kimsenin elinde yok) |
| +36 ay | Yatırım platformu | Veri → karar → sermaye yönlendirme; finansal katman (kredi eşleştirme, fractional ownership) |

**Yakın vadeli genişleme (Faz 2):** yurtdışı projeler. Türklerin yurtdışı GM yatırımı 2022 ~0,7 → 2023 ~2,1 milyar $ (+%173), 2025 ilk 11 ay ~2,4 milyar $. Rotalar: Dubai (getiri ~3 milyar $ Türk yatırımı, amortisman 12-15 yıl), Yunanistan (Golden Visa 250k€), ABD/Miami (Türkiye 5. sırada), KKTC (kira getirisi %6-9), İspanya/Portekiz. TR "master acente" yabancı geliştirici stoğunu alıp alt emlakçıya satar = birebir üretici→tahsis→emlakçı modeli.

---

## 18. Riskler ve dürüst skorkart

| Risk | Etki | Azaltıcı |
|---|---|---|
| Cold start (iki taraflı pazar) | Müteahhit yoksa emlakçı gelmez | Closed Deal Club: 3 müteahhit + 15-20 top broker + %100 exclusive; önce arz (concierge), sonra davetli talep. Ankara aksları: Çankaya/İncek/Çayyolu |
| Davranış değişimi (en büyük) | Excel/WhatsApp'tan kopma | Köprü mod (Excel import + WhatsApp tek tık); sistem mevcut akışın üstüne otursun |
| Tazelik müteahhide bağımlı | Güncellenmezse "canlı" çöker | Tazelik Sigortası cron + stale rozet |
| WhatsApp AI yanlış parse | Yanlış stok = değer yıkılır | MVP'de AI serbest metin yazma YOK; yalnız butonlu teyit |
| KVKK | Ceza riski | Açık rıza + aydınlatma + veri minimizasyonu; "piyasa zekâsı evet, müşteri profili hayır" çizgisi; Identity Graph kararı bekliyor |
| "Herkes kullanır kimse ödemez" | Gelir | Müteahhit anlaşması ana gelir; değer kanıtlanınca kademe |
| Büyük oyuncu kopyalar | Rekabet | Model uyumsuzluğu + veri yerçekimi + en zor segmentin güveni |

**Öz değerlendirme:** problem 9/10 · çözüm 8/10 · pazar 9/10 · execution zorluğu 9/10 · başarı ihtimali ~6.5/10. Default başarılı değil; **execution belirler.** En kritik cümle: "üretici sistemden çıkamaz hâle gelirse, bu iş unicorn olur."

---

## 19. Güncel durum özeti (2026-08-04)

Son dönem işleri (changelog'dan): marka **ProjePazar → Projedar** tüm repoda (domain projedar.com) · **opsiyon hibrit** (dogrudan/onay/geçici 2 fazlı) · **kurumsal firma profili** · **lansman/kampanya modülü** + Lansman Radarı · **yapılandırılmış öznitelik taksonomisi** (8 kategori) + havuz filtre facet'leri · **havuz harita görünümü** (Leaflet) · **mikrosite zenginleştirme** (galeri lightbox + hakkında + olanaklar + künye + daire içi + yakın çevre + etkileşimli ödeme slider) · **mikrosite OG kartı** (birim özel link önizlemesi) · **SEO/GEO altyapı** (middleware fix + dinamik OG + 28 AI crawler + BreadcrumbList) · **markalı mail sistemi** (app + auth şablonları) · **yüz yüze sunum deck'leri** (4 deck) · **emlakçı müşteri kataloğu** (spec onaylı, kod bekliyor) · **admin Başvurular v2** (mockup onaylı, kod bekliyor) · yeni logo çalışması (aday HTML'leri).

**Lansman öncesi operasyonel notlar:** e-posta onayı açık, domain + Resend SMTP bağlı (Supabase Custom SMTP kalan); Vercel env `LEAD_SHARE_SECRET` + `CRON_SECRET` tanımlı; RLS migration'ları (özellikle `lead-select-rls`) uygulandı; Vercel/GitHub Actions cron çalışıyor. Hukuki sayfalar TASLAK (avukat incelemesi). Supabase token ifşa geçmişi → rotate önerisi.

---

*Projedar · projedar.com · Berrak Güven · Kapsamlı Ürün Referansı (tek dosya, güncel) · 2026-08-04. Bağlayıcı kaynak: `ProjePazar-Sistem-Kurallari.md`. Build sırası: `ProjePazar-Devir-Dokumani.md`.*
