# Projedar — Rakip Analizi & "En İyi Yapı" Reçetesi

> **Amaç:** Projedar'ı kategorisinin en iyisi yapacak yapıyı (sayfa mimarisi, içerik, tasarım, iş modeli konumlaması) global + ulusal rakipleri inceleyerek bulmak.
> **Kaynak:** 2026-07-24 derin araştırma (deep-research: 5 açı, 21 kaynak, 25 iddia çekişmeli doğrulama) + 7 paralel teardown ajanı (14 rakip, sayfa/içerik/tasarım) + canlı site doğrulaması.
> **Bağlayıcı bağlam:** `ProjePazar-Sistem-Kurallari.md` (DEĞİŞMEZLER), `CLAUDE.md`, memory `tasarim-dili.md`. Bu doküman rakip kanıtı + öneri sunar; DEĞİŞMEZLERİ ezmez.

---

## 0. Yönetici Özeti — Tek Cümle + 2×2 Çerçeve

**Bulgu:** Projedar'ın dört tanımlayıcı mekanizmasının HEPSİNİ birleştiren rakip yok (ne dünyada ne TR). Bu dörtlü:
1. Çok-müteahhitli **tek canlı ortak havuz**
2. Emlakçı-bazlı **tahsis-kısıtlı görünürlük** (RLS)
3. **DB-seviyesi çift-satış kalkanı**
4. **Komisyonsuz** (müteahhit anlaşması + emlakçı SaaS)

Bütün rakipler tek bir eksende ayrışıyor: **stoğu kim kontrol eder × erişim açık mı tahsisli mi.**

```
                     AÇIK erişim                    TAHSİSLİ / kapalı
                ┌──────────────────────────┬────────────────────────────────┐
 Stoğu MÜTEAHHİT│ New Home Buddy (Texas)    │ Avesdo, Konutmatik, Novo, Alnair│
 kontrol eder   │ BuildersUpdate, Buildify  │  → HEPSİ TEK-müteahhit / tek-marka│
                │ Topli, Connject           │  ◆ Projedar = ÇOK-müteahhit +   │
                │                           │    KOMİSYONSUZ + DB çift-satış → BOŞ│
                ├──────────────────────────┼────────────────────────────────┤
 Stoğu EMLAKÇI  │ RE-OS (MLS/PPS)           │ EmlakKanal (kapalı acente havuzu)│
 kontrol eder   │ (emlakçı↔emlakçı havuz)   │  (şu an BOŞ KABUK — vaporware)   │
                └──────────────────────────┴────────────────────────────────┘
        (Lasso/Code5 = tek-firma iç CRM; Entera = müteahhit→YATIRIMCI, agent'ı devre dışı bırakır)
```

**Boş hücre = Projedar'ın yeri:** müteahhit-kontrollü + tahsisli + **çok-müteahhitli** + **komisyonsuz**.

> ⚠️ **Revizyon (2026-07-24 ikinci doğrulama turu):** "Çift-satış kalkanı hiçbir rakipte yok" iddiası yumuşatıldı. **DomusHub** (domushub.io — DOĞRULANDI, gerçek ürün; MENA+SEA+CIS, sitesinde TR dili var, $250-500/ay açık fiyat) pazarlamasında birebir *"Instant unit locking via online deposit payment. Zero risk of double bookings."* diyor; **ECI LotVue** kredi kartıyla online lot kilitleme satıyor. İkisinde de kilit **ödemeye** bağlı; bizde kilit **veritabanının kendisinde** (unique partial index) ve opsiyon parasız. Doğru iddia: **"DB-seviyesi, ödemesiz kilit hiçbir rakipte yok"** — ama "zero double-booking" MESAJ alanı işgal edilmeye başlandı; bu mesajı sahiplenmek ertelenemez. Ayrıca **Konutmatik'in dış acenteye KOTALI STOK TAHSİSİ üründe zaten var** (bkz. 2.4 revizyonu) → "tahsisli stok" tek başına farklılaştırıcı değil; savunulabilir kombinasyon = **çok-müteahhitli ağ + bağımsız emlakçı tarafı + komisyonsuz + DB-kilidi**.

**Rakip tipolojisi (kimi ciddiye alacağız):**
| Tip | Kim | Bize etkisi |
|---|---|---|
| **Validasyon** (tezi kanıtlıyor, coğrafi/model uzak) | New Home Buddy, Avesdo, Alnair, BuildersUpdate | İyi haber: model çalışıyor. Tehdit değil. |
| **Gerçek TR rakip** (sahada çarpışırız) | **Novo CRM** (üretici tarafı), **Topli** (emlakçı tarafı), **RE-OS** (emlakçı tarafı) | Ana rekabet. Kalemiz: tahsis + komisyonsuz + DB kalkan. |
| **Bitişik / kısmi** | Konutmatik (tek-müteahhit, tasarım DNA'sı aynı), Connject (statik medya hub), Code5 (tek-firma iç CRM), Lasso, Entera, Buildify | Genişlerlerse rakip olur; şimdilik farklı katman. |
| **Boş kabuk / kategori sinyali** | EmlakKanal (0 ilan, fake mockup) | Rakip değil; "kapalı ağ" fikrinin paketlendiğini gösterir. Ders: cold-start asıl savaş. |

---

## 1. GLOBAL RAKİPLER — Teardown

### 1.1 Avesdo (Kanada) — avesdo.com · *en yakın konsept analoğu*
- **Ne:** Yeni-konut satışı için tek entegre işlem yazılımı (TMS). Stoğu "allocate / reserve / share / contract / close" + realtor portalları.
- **Sayfalar:** Solutions · Platform Overview · **8 Feature alt-sayfası** (Leads, Selection Worksheets, Inventory, Sales, Deposits, Contracts, **Realtor Portals**, Data) · Why Avesdo · Customer Stories · Blog · Login · Book a Demo.
- **Hero:** *"The Power to Close"* / *"Streamline New Home Sales. Maximize Success."* CTA: **BOOK A DEMO**.
- **Çekirdek copy (tahsis akışı — birebir bizim iskelet):** *Import leads → Collect unit requests → **Allocate electronically** → Complete contracts → Automate deposits → Make data-driven decisions.* İkili konum: **"Minimize Risk" + "Maximize Revenue."**
- **Sosyal kanıt:** 200+ Developers · 15k Homes Sold/yr · **$15B satılan değer** · 13k Active Realtors. Otorite cümlesi: *"Built by new home real estate lawyers…"*
- **Fiyat:** yok — enterprise sales-led, demo-gated.
- **Tasarım:** koyu lacivert-antrasit **#0C1D2B** + cyan **#09D0D0**/teal accent · **Inter** · kart/sekme blok sistemi · koyu-mod section'lar · ürün dashboard mockup. Vibe: **premium kurumsal PropTech/fintech.**
- **Ders:** (a) 4-adım "elektronik tahsis" akışını hero'da aynı netlikte anlat. (b) "$X toplam canlı stok değeri / N aktif müteahhit" güven bandı bize birebir oturur. (c) Koyu+cyan estetiği bizim "komuta merkezi" diline yakın — referans al. **Kaçın:** sözleşme/EFT/hukuk ağırlıklı enterprise soğukluğu + "fiyat gizli" huni; biz daha sıcak/şeffaf olmalıyız.

### 1.2 New Home Buddy (Texas) — newhomebuddy.com · *tezi en net doğrulayan*
- **Ne:** Müteahhit→emlakçı yeni-konut dağıtımı. **Emlakçıya %100 bedava, para müteahhitten.** Builder-verified listings.
- **Sayfalar:** Locations›Texas (şehir SEO) · For Agents · For Builder Reps · For Leadership (Sales Portal) · Training · Events · **Agent/Builder Leaderboard** · Testimonials · FAQ · Blog · **Get Listed** · Agent/Builder Portal (auth-arkası).
- **Hero:** *"Where new construction homes actually get sold."* / *"…connects agents, builder reps, and buyers around builder-verified new construction listings."* / **"100% free for agents. No fees, no catch."**
- **Kritik desenler:** "One platform, **three ways** to use it" (rol kartları) · **"Last Checked / Last Updated"** canlı tazelik göstergesi · **"You stay the contact — your name is on every home"** (emlakçı-birim bağı) · agent-to-rep **Connection** (emlakçı çalışacağı rep'i seçer = emlakçı-güdümlü tahsis benzeri).
- **Get Listed sayfası:** neredeyse boş — sadece başlık + **Builder Portal signup'a yönlendirme.** Gerçek stok girişi auth arkasında. (Desen: public = ikna, ürün = panelde.)
- **Fiyat:** ayrı sayfa yok; model = agent bedava, müteahhit öder (tam mekanik **doğrulanamadı**).
- **Tasarım:** mor **#912FC0**→orkide gradient + petrol-lacivert · Montserrat/Roboto · başlıkta **italik vurgu** imzası · WordPress/Enfold · emoji ikonlar · mobil-app-first mockup. Vibe: **sıcak, yerel-topluluk, prosumer.**
- **Ders:** "Emlakçıya bedava + builder-verified + tazelik göstergesi" deseni piyasada kanıtlı; **ödeme mekaniği doğrulanamadığı için "iş modeli birebir kanıtlı" DENMEMELİ** (validasyonu desen düzeyinde kullan, gelir-modeli düzeyinde değil). **"Last Checked/Last Updated" ve "senin adın her ilanda" desenlerini çal.** Growth: şehir SEO + leaderboard + events + training. **Kaçın:** emoji/"buddy" tüketici-şirinliği; biz Bloomberg+Linear ciddiyetindeyiz — taktiğini al, tonunu alma.
- **AYRIM:** NHB **açık raf** (herkes tüm doğrulanmış stoğu görür, kendi seçer); biz **tahsisli havuz** (yalnız kendine tahsisli). NHB Texas'ta → coğrafi tehdit değil, **validasyon.**

### 1.3 Alnair (Dubai) — alnair.ae · *canlı-stok mimarisinin en olgun global örneği*
- **Ne:** "IT Platform for Real Estate Professionals — all off-plan market in Dubai." Geliştirici paneli → agent booking, gerçek-zamanlı müsaitlik.
- **Sayfalar:** Ana (harita+arama) · Property Search (Dubai, real-time availability) · **For Agencies** (14 gün trial) · Developer profil sayfaları · Education/KB · about.alnair.ae (Services for Developers) · iOS/Android app · Telegram (1.500+ broker).
- **Çekirdek mekanik (birebir bizim mimari):** "**unit availability grids + control over available units**" · "**real-time unit booking + automatic update of sales status**" · **satış lansmanında agent'lara anlık bildirim** · "**automatic distribution of availability updates to brokers via WhatsApp**" · "**one magic link for all your selections to your client instead of 100 messages**" (koleksiyon→gizli-URL paylaşım).
- **İş modeli (KRİTİK AYRIM):** **Master Agent komisyon toplayıcılığı** (Intermark tek tüzel kişi; KYC+sözleşme+komisyon dağıtımı platformda) + geliştiriciden **SaaS: Basic $10k/yıl (1 hesap+5 broker) · Professional $15k · Corporate $20k/yıl** + **öne-çıkarma reklamı $1.350/proje/ay** (Telegram+email, "open rate >35%").
- **Tasarım:** harita-merkezli, availability grid, BI dashboard, CRM widget — **operatör konsolu** estetiği (Cloudflare arkasında, marka sayfaları Tilda ile zayıf cila).
- **Güven açığı:** App Store **2.3/5**, "no support, charged without notification" şikayetleri.
- **Ders:** Mimariyi (availability grid + real-time status + tahsisli agent'a anlık bildirim + tek-link koleksiyon paylaşım) doğrudan referans al. **Komisyonu AYIR:** Alnair işlemin içine giriyor (çıkar çatışması + güven açığı) → biz "saf altyapı, komisyon yok" ile karşı-konumlan. Fiyat ankoru: $10k/yıl SaaS + $1.350/ay promote kalemleri, müteahhit-anlaşması gelirimiz için referans.

### 1.4 BuildersUpdate (ABD) — buildersupdate.com
- **Ne:** Ulusal müteahhit→emlakçı yeni-konut envanter ağı. "**#1 source of new home inventory in the nation**", 841k+ agent · 13k+ site · 1.2M aylık newsletter.
- **Sayfalar:** Home · Agents (portal) · MLSs (70+ logo) · Builders (portal) · Buyers (map search) · Blog · Press · About · FAQ (ayrı agent/builder) · 70+ şehir SEO sayfası.
- **Hero:** *"SELL MORE HOMES REACHING AGENTS WITH REAL BUYERS"* · CTA **Create Free Account.**
- **Öne çıkan mekanik:** **New Home Spotlight™** — alıcıya gösterirken builder markası/adresi gizler, **emlakçıyı tek temas noktası yapar** (lead'i emlakçıya kilitler) = tahsis mantığının pazarlama karşılığı. **Pay Upon Performance:** builder upfront ödemez; **kapanışta + procuring-cause ise $750 sabit** (patentli buyer registration). ⚠️ **Şerh (2026-07-24):** "$750-kapanışta" mekaniği tek kaynaklı, ikinci turda doğrulanamadı (Bölüm 7 ile tutarlılık için: bu rakam yatırımcı/müteahhit sunumunda kaynak teyidi yapılmadan KULLANILMASIN). Ajan sayısı da kaynaklar arasında tutarsız (750k vs 841k).
- **Sosyal kanıt:** 18+ isim-unvan-şirketli testimonial ("*it's like MLS on steroids*"), tek çarpıcı istatistik: *"74% of new home sales are made with the help of a licensed agent."*
- **Tasarım:** navy/mavi, ALL-CAPS hero, `.aspx` legacy, hacim/logo-duvarıyla güven. Vibe: **olgun, hacimle-güven veren klasik portal** (şık değil).
- **Ders:** "New Home Spotlight™" (paylaşımda müteahhit gizli, emlakçı öne) = güçlü kanca. Tek çarpıcı sektör istatistiği hero'ya (TR: "yeni konut satışının %X'i emlakçı ile"). İsim+unvan+şirketli testimonial. **Kaçın:** "$750-kapanışta" komisyon-benzeri ücret bizim komisyonsuz modelle çelişir — landing'de net karşıtlık kur.

### 1.5 Buildify (Kanada) — getbuildify.com
- **Ne:** "**Canada's #1 API for New & Pre-Construction Home Listings**" — data feed + broker portal.
- **Sayfalar:** Home · API · Documentation · Coverage · Broker Portal · Mission · Pricing (**şifre-korumalı**) · Blog · Builder Directory · Book Demo.
- **Hikaye (birebir bizim problem cümlemiz):** *"Before Buildify, pre construction data was fragmented and reliant on relationships. Now we use technology…"* 3 kart: Full Control / **150+ attributes** / Daily updates.
- **AYRIM (bizim tersimiz):** FAQ: *"Can I sell if I'm not a VIP/Platinum Agent?" → "Absolutely! Our entire inventory is accessible to all agents, regardless of status"* — **açık-erişim, tahsisin tam tersi.**
- **Sosyal kanıt:** Tridel/Minto/Onni/Concord logoları · "10,000+ real estate websites" · RE/MAX, Century21, eXp.
- **Tasarım:** beyaz/ferah, mavi accent, kart-tabanlı, "Proudly Canadian 🇨🇦" + RESO badge. Vibe: **modern developer-dostu API SaaS**, tek-CTA (Book Demo) disiplini.
- **Ders:** "fragmented + relationship-reliant → technology" çerçevesini TR'ye uyarla (GEO citability bloğu). Onların "herkes her şeyi görür" tezine karşı **"üretici kime/hangi fiyata/ne kadar açacağını sen belirle"** kontrolünü öne çıkar. Coverage nokta-haritası (aktif vs coming-soon şehir) ağ büyümesini göstermenin ucuz yolu.

### 1.6 Entera (ABD) — entera.ai · *farklı talep ucu (uyarı)*
- **Ne:** "The Operating System for Single-Family Real Estate Investing" / "**The Bloomberg Terminal of Real Estate**." Müteahhit yeni-konut stoğunu **KURUMSAL YATIRIMCIYA** satar (agent'ı devre dışı bırakır).
- **New Construction sayfası:** *"Sell New Construction Inventory to Residential Investors at Scale"* → 3 fayda: Reach Qualified Investor Demand / Reduce Sales & Marketing Friction / Price with Market Confidence.
- **Sosyal kanıt:** 500K+ homes · 34 markets · 14M+ underwritten · ~$60M raised (Goldman). Basın: WSJ, NYT, Bloomberg.
- **Tasarım:** koyu charcoal + cyan, havadan foto + dashboard + pin'li harita. Vibe: **fintech-grade PropTech.**
- **Ders:** **Kategori sahiplenme retoriği** ("The Operating System for…" / "Bloomberg Terminal") → biz de "canlı konut stoğu dağıtım ağı"nı hero'da aynı özgüvenle sahiplenelim. New Construction 3-fayda iskeleti (daha hızlı satış / daha az pazarlama sürtünmesi / fiyat güveni) müteahhit landing'imiz için hazır — ama "yatırımcıya" değil "tahsisli emlakçı ağına" çevir. Koyu terminal estetiği + somut sayı blokları = güven.

### 1.7 Lasso CRM (ECI, ABD) — ecisolutions.com · *bitişik: tek-firma builder CRM*
- **Ne:** Homebuilder'a özel CRM (lead capture→nurture→convert). "**100% designed for homebuilding sales and marketing teams.**"
- **Konumlama silahı:** *"Generic CRMs require too much customization… focus on selling, not configuring."*
- **Sosyal kanıt:** **30% higher lead-to-sale conversion · 11x faster response · 87% NPS increase · 100+ builders.**
- **Fiyat:** gizli, quote-based (~$39/kullanıcı/ay tahmini). Suite: Lasso+LotVue(lot maps)+Insearch+AvidCX (**Şub 2026 birleşti** → büyükler suite'leşiyor).
- **Tasarım:** kurumsal mavi/teal, aydınlık, klasik enterprise B2B. Kullanıcı algısı: "biraz outdated."
- **Ders:** **"Generic değil, sektöre özel"** silahını çal (biz: genel CRM/Excel-WhatsApp kaosuna karşı "müteahhit-kontrollü canlı ağ"). Somut dönüşüm sayılarını hero-altına (bizde MVP'de: "sıfır çift-satış", "asla eski fiyattan satış"). **Boşluk:** Lasso küçük ekibe uygun paket vermiyor + arayüz "dated" → mobil-önce, modern, küçük emlakçıya bedava başlangıç bizim açığımız.

---

## 2. TÜRKİYE RAKİPLERİ — Teardown

### 2.1 Novo CRM — novoxcrm.com · ⚠️ *TR tehdit #1 (üretici tarafı)*
- **Ne:** "Sadece bir CRM değil. Eksiksiz Satış Platformu." Müteahhidin satış ofisi + broker ağı; AI-ağırlıklı, 35+ modül, abonelik.
- **Sayfalar:** Ana · **/solutions/insaat-crm (doğrudan rakip)** · gayrimenkul-crm · ai-sesli-arama · /solutions (modül kataloğu) · /wiki (SEO) · **11 ücretsiz hesaplayıcı** (Tapu Harcı, Broker Komisyonu, ROI…) · karşılaştırma SEO sayfası · pricing.
- **Hero:** *"Satış Ofisiniz Artık 7/24 Çalışıyor."* / "Minimum insan kaynağı • Maksimum AI otomasyonu."
- **Çekirdeğimizi kopyalıyor:** **Broker Portalı** — "Anlık stok/fiyat paylaşımı", "**Lead koruma & müşteri çakışma önleme**", "Hakediş/komisyon raporlaması". Uçtan uca: Kontak→Lead→Fırsat→Teklif→**Opsiyon**→Satış→Sözleşme.
- **Fiyat (açık):** Starter **₺1.999** · Professional **₺2.999** · Business **₺4.999** (Broker Ağı + Komisyon Planları + Leaderboard) · Enterprise özel. 14 gün ücretsiz.
- **Tasarım:** koyu navy **#1A1A2E** + cyan **#00D4D4** neon accent · iri bold başlık · dashboard screenshot · rozet bolluğu. Vibe: **AI-first, özellik-şişkin, "her şeyi yapan" (overwhelming).**
- **Ders:** Broker Portalı bizim çekirdeği bir modül olarak içeriyor AMA **Novo tek-müteahhit-içi CRM.** Farkımız: *"Tek müteahhidin CRM'i değil — TÜM müteahhitlerin canlı stoğu, tek ekran"* (ağ etkisi, Novo veremez). **Komisyon onların DNA'sı, bizim reddimiz** → "kazancın %100'ü sende." AI'yı taklit etme, **sadeliği silah yap** ("5 dakikada canlı, tek işi mükemmel"). **AL:** ücretsiz hesaplayıcı + wiki SEO motoru (emlakçı-odaklı 2-3 araç).

### 2.2 Topli — topli.io · ⚠️ *TR tehdit #2 (emlakçı tarafı)*
- **Ne:** Portekiz merkezli (kurucu Igor Bessonov, ~220 kişi), **Kasım 2025 İstanbul girişi**. Danışmana bedava, çok-müteahhit ağı, success-fee.
- **Sayfalar:** /tr /en /ru · **/presentation/tr (Geliştiriciler için)** · app.topli.io/sign-up (açık self-serve). Yan ürünler: Isabell (LMS), Linda (ERP).
- **Hero (emlakçı):** *"YEREL MÜŞTERİYE %3'E VARAN KOMİSYON — Ücretsiz kaydolun, satış yapın, kazanın. Komisyonun çoğu sizde!"*
- **Vaadi (neredeyse bizimki):** canlı doğrulanmış stok · lead koruma ("müşteriniz başka temsilciyle ulaşsa bile sizinle çalışır") · "tüm geliştiricilerle sözleşmeler — aracısız doğrudan" · API/XML feed · çok dil (TR/EN/RU/AR/FA).
- **Gelir:** saf **success-fee** (danışman bedava, satışta komisyondan Topli küçük pay, geliştiriciden). Satışı Topli'ye kaydetmek zorunlu (bağımlılık).
- **Sosyal kanıt:** yoğun basın (Cumhuriyet, DHA, egirişim) + tanınmış müteahhit logoları (**DAP, Sinpaş, Nurol, İhlas, Fuzul, Artaş…**) + 5 isimli referans.
- **Tasarım:** açık/ferah beyaz + navy **#1B2A4A**, SVG illüstrasyon, timeline infografik, partner-logo şeridi. Vibe: **global, sade, "network/pazaryeri" güven.**
- **Ders:** Emlakçı vaadi neredeyse aynı; **tek zayıfları komisyon** → *"kazancın %100'ü senin, biz stoğun/anlaşmanın arasına hiç girmiyoruz."* **Müteahhit kontrolü Topli'de YOK** (stok havuza atılır, 10k danışmana savrulur) → müteahhide *"Topli'de kontrolü kaybediyorsun; Projedar'da kime/hangi fiyata/ne kadar açacağını SEN belirliyorsun."* **AL:** PR + tanınmış müteahhit logo duvarı + çok-dil (en az EN paylaşım linki). **Kaçın:** "10.000 danışman" hacim-övünme dili — biz kontrol+güven+hız diyoruz.

### 2.3 RE-OS — re-os.com · *en güçlü TR oyuncu (emlakçı tarafı)*
- **Ne:** "Gayrimenkul Global Pazarlama Platformu" — emlak CRM + MLS + emlakçı↔emlakçı portföy paylaşımı (PPS) + 80+ portala tek-tık.
- **Sayfalar:** Anasayfa · İlanlar (listelo.com.tr) · Hazır Website · Özellikler · Telefon-CRM · Entegrasyonlar · **Reos AI** · Fiyatlar · SSS · Blog.
- **Çekirdek:** *"Emlak işlerini tek ekranda yönet, tüm dünyada yayınla!"* **MLS.TR "Portföy & Talep Havuzu"** (profesyoneller arası eşleştirme) + **Akıllı Eşleştirme** + **"Yönetmeliğe Uygun Çalışın"** (Taşınmaz Ticareti Yön., **EİDS**, GİB BTRANS).
- **Geliştirici modülü (bizimle çakışan ama ters):** *"…sıfır gayrimenkullere kendi alıcı müşterilerinizi yönlendirip, **satış primi kazanabilirsiniz**."* → **emlakçı-güdümlü + komisyonlu.**
- **Fiyat (açık):** Danışman ₺1.100-1.200/ay · Ofis ₺800-900 kişi/ay (min 3) · Franchise $800/ay+$200+$25/kullanıcı.
- **Sosyal kanıt:** 8.000+ profesyonel · 15.000+ portföy · 904.000+ işlem görmüş portföy · franchise logo duvarı (RE/MAX, Century21, eXp…).
- **Tasarım:** lacivert **#022041** + turkuaz **#1bb5cc** + sarı CTA **#ffd600** · **Poppins** · Bootstrap/şablon · logo-duvarı ağırlıklı. Vibe: **kurumsal, kanıt-yüklü, biraz kalabalık.**
- **Ders:** **AL:** "Portföy & Talep Havuzu" + Akıllı Eşleştirme (tahsis+eşleştirme çekirdeğimizi doğruluyor) + **"Yönetmeliğe uygun / EİDS" güven mesajı.** **Kaçın:** komisyon/satış primi (bizim tersimiz) + Bootstrap şablon estetiği. Farkımız: RE-OS emlakçı-merkezli genel CRM, müteahhit sadece bir "fırsat" — **müteahhit kontrolü yok**; kazanacağımız yer tam burası.

### 2.4 Konutmatik — konutmatik.com · *tek-müteahhit "dijital satış ofisi" · tasarım DNA'sı bizimle birebir*
- **Ne:** "Markalı gayrimenkul projeleri için **dijital satış ofisi platformu**" (2016'dan, yakında tamamen yeniden tasarlanmış). **Tek-müteahhit/tek-marka kurulum**, çok-müteahhit ağ DEĞİL.
- **Sayfalar:** Ana · **Sunum Sistemi** (canlı stok/fiyat, etkileşimli kat/daire planı, teklif) · **CRM** (lead→teklif→rezervasyon→sözleşme→tahsilat) · **3D/DISAO Studio** (Unreal dijital ikiz) · Referanslar · Bilgi Merkezi · TR/EN.
- **Hero:** *"Gayrimenkul Projeleri İçin Dijital Satış Ofisi Platformu"* · canlı bildirim mockup'ları (*"Deniz, kampanyana ilgi büyüyor 🤩 — 3dk önce"*) · "✓ SİSTEM DURUMU: Aktif & Canlı."
- **Bizimle örtüşen mekanikler:** Canlı Stok & Fiyat · Etkileşimli kat planı · **yetkilendirilmiş danışmanlara kısıtlı stok görüntüleme** (tahsis-benzeri, tek-marka ölçekte) · opsiyon/rezervasyon · **"kullanıcı özelinde komisyon/indirim oranı belirleme"** (bizim komisyonsuz ilkemizin aksine).
- **⚠️ REVİZYON (2026-07-24 derin teardown, birincil kaynak — site HTML):** Dış acente tahsisi "tahsis-benzeri" değil, **açıkça üründe**: Sunum Sistemi sayfasında "**05 / GELİŞMİŞ ACENTE YÖNETİMİ**" — *"acenteye özel kısıtlı **stok kotaları** ile satış ağınızı kontrol altında tutun"*, *"Acentelerinize belirli projelerde kısıtlı daire stokları atayın, **mükerrer veya aşırı satışı önleyin**"*, acente takip portalı, acente-özel komisyon oranları; mockup'ta *"RE/MAX Beta acente satış kotasının sonuna yaklaşıyor"*. Referans vakalarında da geçiyor (Taşyapı Şişli "acente ve talep yönetimi", Cidde "acente/broker sistemi"). **Sonuç:** müteahhit→dış-acente kotalı tahsis Türkiye'de üretimde VAR; farkımız yalnızca **çok-müteahhitli ağ + emlakçının bağımsız aktörlüğü + komisyonsuz**. Konum cümlesi keskinleşmeli: "acente modülü olan CRM değil, **ağın kendisi**." Konutmatik çok-müteahhit havuza kayarsa en tehlikeli rakip. (Ek gözlem: sitesi SSL sertifika hatası veriyor; site kalitesi buna rağmen kategori lideri, 8.5/10 — canlı HTML simülasyon anlatımı + vaka-kartı sosyal kanıtı bizim için ders.)
- **Sosyal kanıt (çok güçlü):** Artaş, Taşyapı, Bilgili, Ege Yapı, **Torunlar GYO**, Teknik Yapı, Dap, Ferko + uluslararası (Bağdat, Ritz-Carlton, Riyad).
- **Fiyat:** yok — enterprise/proje-bazlı, "Görüşme Talep Et."
- **Tasarım (style.css'ten doğrulandı):** slate **#0f172a/#1e293b** + rose accent **#f43f5e** · **sinyal renkleri BİZİMLE BİREBİR:** yeşil #22c55e müsait / amber #f59e0b opsiyon / kırmızı #ef4444 satıldı · SF Pro + Caveat · bespoke koyu-tema, bölüm-numaralı, canlı feed mockup. Vibe: **karanlık, sinematik, ürün-önce (Linear/Vercel), RE-OS'tan bir kuşak ileri.**
- **Ders:** **En önemli:** Konutmatik bizim tasarım+feature DNA'mızın aynısını kullanıyor → "Canlı Proje Satış Komuta Merkezi" dilimiz doğru; **ama tema aksanını ayrıştır** (onlar rose; biz farklı marka rengi seç, taklit görünme). **Boşluk = wedge'imiz:** Konutmatik **tek-müteahhit**, izole; **çok-müteahhitli, emlakçının tek havuzdan yalnız kendine tahsisliyi gördüğü ağ YOK.** Konum: *"Konutmatik = tek projenin dijital ofisi; Projedar = tüm projelerin dağıtım ağı."* **RİSK:** komisyon/indirim + acente yönetimi zaten var; çok-müteahhit havuza kayarsa doğrudan rakip → network-effect + komisyonsuz hendeğini erken kaz.

### 2.5 Code5 PrismCRM — code5.com.tr · *bitişik: tek-firma iç CRM*
- **Ne:** Proje satış firmalarına özel CRM (2004'ten). **Satış ofislerini merkeze entegre eder** (tek-geliştirici iç sistem).
- **Sayfalar:** Ana · Hakkımızda · **Ürün & Modüllerimiz** · İletişim · PRISM3D (3D/harita, API ile 3. taraf açık) · çoklu SEO domain · Katalog/Referans PDF.
- **Hero:** *"Konut ve Gayrimenkul Proje Satışına Özel CRM Altyapısı"* / rozet "2004'ten Beri Geliştiriliyor."
- **Modüller:** Görsel Satış Sistemi (2D kat planında daire durumu) · Esnek Satış · Sözleşme/Evrak · Teslim · Satış Sonrası · Teklif Modülü. Vurgu: *"Satış ofislerinizi merkez ile entegre ederek kontrolü ele alırsınız."*
- **Sosyal kanıt:** **Dap Yapı, Nish Adalar, Yeşil GYO, Via Port** (isimli).
- **Fiyat:** yok — "Demo Talep Et."
- **Tasarım:** kurumsal mavi/beyaz, animasyonlu GIF ikonlar (tarihli), placeholder "0+" sayaçlar. Vibe: **20 yıllık köklü ama görsel olarak tarihlenmiş.**
- **Ders:** PrismCRM tek-müteahhidin İÇİNİ yönetir; biz stoğu DIŞARIYA tahsisli havuza dağıtırız — dokunmadıkları boşluk. "Görsel Satış = kat planında canlı daire durumu" pazarın beklentisi → bizde yeşil/amber/kırmızı + tahsis-filtreli. **Kaçın:** placeholder sayaç + GIF ikon (güven kaybı) → biz gerçek/canlı sayı + tazelik rozeti.

### 2.6 Connject — connject.com · *komisyonsuz köprü / statik medya hub*
- **Ne:** "İnşaat Firması–Danışman–Yatırımcıyı tek ekranda buluşturan uluslararası B2B proje sunum & satış platformu." (İşleten ASTRADE TRADING LTD, KKTC).
- **Sayfalar:** /tr · Projeler (+ şehir/ülke/firma SEO kırılımı) · Araçlar · Blog · Videolar · İndir · Giriş/Kayıt. Demo = **WhatsApp deep-link.**
- **Hero:** *"Biz aradaki köprüyüz!"* · **"Connject Satışa Aracılık Yapmaz, Satıştan Komisyon Almaz!"** · 3 adım: "Ücretsiz Kayıt → Dosyaları Gönder → Satışı Başlat."
- **Bizimle örtüşen:** **"Kontenjan dolmadan katıl"** (kapasite gate) + **concierge** ("Dağınık dosyaları biz düzenleyelim, anında vitrine çık") + **"kapalı devre" üyelik** + **SMS-onaylı sunum belgesi** (lead sahiplenme izi) + güncel fiyat listesi + müşteri-ismine-özel PDF + çoklu dil.
- **AMA:** statik **medya vitrini**, canlı stok/tahsis değil. SSS'te *"firmalar tüm projeleri mi görür?"* = tahsis-görünürlük derdi çözülmemiş.
- **Fiyat:** danışmana bedava; gelir müteahhit/proje yayını tarafında; komisyon net reddedilir.
- **Tasarım:** sıcak krem **#F4F1ED** + canlı turuncu **#F63E02** · "New Hero" grotesk · Next.js mobil-önce · kartlı proje grid · harita/data-viz YOK. Vibe: **sıcak, güven-öncelikli, komisyonsuz köပrü.**
- **Ders:** **Concierge onboarding + kontenjan gate = bizim tam ruhumuz** → hero'da birleştir. **Komisyonsuzluğu marka silahı yap** (Connject'in hero cümlesi gibi tek net satır). SMS-onaylı sunum = lead sahiplenme deseni → çift-satış kalkanının müşteri-tarafı hafif karşılığı. **Farkımız:** Connject statik medya; biz **canlı stok + tahsis** → wedge net.

### 2.7 EmlakKanal — emlakkanal.com · *boş kabuk / vaporware (rakip DEĞİL)*
- **İddia:** "AI Destekli Kapalı Emlak Ağı · 81 il · 10.000+ acente · komisyon paylaşımı."
- **GERÇEK (canlı doğrulama 2026-07-24):** **"0 İlan"** · "1 ilan arasından 7 kategori" · mockup ilanları **fake** ("Ankara Çankaya · deniz manzaralı") · mobil "Çok Yakında" · footer **© 2026 FluxeSoft Yazılım** (yazılım ajansı; 360-soft benzeri ajanslar "Kapalı Devre Emlak Ağı"nı hazır ürün satıyor).
- **Model (dolsaydı):** emlakçı↔emlakçı yatay havuz + **komisyon paylaşımı** (bizim tersimiz), müteahhit yok.
- **Tasarım:** modern AI-SaaS gradient hero, koleksiyon kartları, leaderboard — cilalı ama içi boş.
- **Ders:** Rakip değil, **kategori sinyali** ("kapalı ağ" fikri paketleniyor ama kimse dolduramıyor). **Asıl savaş yazılım değil cold-start** → arzı (müteahhit stoğu) doldurmadan talep tarafını açma. "Canlı/tazelik" boş platformun taklit edemeyeceği farkımız.

---

## 3. Sayfa & İçerik Desenleri (14 rakipten ortak çıkarım)

**Herkeste olan sayfalar (bizde de olmalı):**
- **İki ayrı değer-önerisi sayfası:** "Müteahhit/Üretici için" + "Emlakçı için" (rol ayrımı — Avesdo, NHB, Novo, Topli, Alnair hepsinde).
- **Auth-arkası panel ayrımı:** public sayfa = ikna + kaydol/demo; gerçek ürün (stok, tahsis, panel) login arkasında (NHB Get Listed, Avesdo, Buildify, Konutmatik, Code5 — istisnasız).
- **Sosyal kanıt sayfası/bölümü:** isim+unvan+şirketli testimonial + tanınmış müteahhit logo duvarı (BuildersUpdate, Topli, Konutmatik, RE-OS).
- **Fiyat/paket:** kurumsal segment fiyatı gizler ("Demo Talep Et"); self-serve tarafta açık paket (Novo açık; Avesdo/Konutmatik/Code5 gizli). **Bizde:** müteahhit = demo/concierge (fiyat gizli), emlakçı = bedava self-serve.
- **SEO/growth motoru:** şehir/ülke/firma bazlı programatik sayfalar (NHB, BuildersUpdate, Connject, Novo) + wiki/hesaplayıcı (Novo) + blog.
- **Güven/uyumluluk:** EİDS/Taşınmaz Ticareti Yönetmeliği mesajı (RE-OS) — TR pazarında değerli.

**İçerik iskeleti desenleri (çalınacak copy blokları):**
- Kategori-sahiplenen tek-cümle hero (Entera "Operating System" / Avesdo "The Power to Close").
- Problem→çözüm citability bloğu ("fragmented + relationship-reliant → technology" — Buildify).
- Somut sayı bandı (Avesdo $15B / Lasso 30%-11x-87% / NHB $2B).
- "Kaos vs Düzen" karşılaştırma tablosu (Novo, Lasso: generic-vs-özel).
- Tazelik/canlılık göstergesi ("Last Checked/Last Updated" — NHB; "3dk önce" — Konutmatik).
- Komisyonsuzluk tek-satır güven rozeti (Connject "Komisyon Almaz!").

---

## 4. Tasarım Deseni Kararı

**Kategori iki estetik kutbuna ayrılıyor:**
- **Koyu "komuta merkezi / terminal":** Avesdo (#0C1D2B+cyan), Entera (charcoal+cyan), Novo (navy+neon), **Konutmatik (slate+rose)**, Alnair (grid/dashboard). → **Ciddi, veri-güveni, premium.**
- **Açık/sıcak "network-pazaryeri":** Topli (beyaz+navy), Connject (krem+turuncu), NHB (mor+emoji), RE-OS (mavi+sarı, şablon). → **Yaklaşılabilir ama daha az "operasyonel güven."**

**Projedar kararı (memory `tasarim-dili.md` ile uyumlu):** Koyu-değil ama **"Spatial açık" + veri-yoğun komuta merkezi** kutbundayız (Bloomberg+Linear). Konutmatik ve Avesdo bu yönün canlı kanıtı — **doğru yoldayız.** Kritik: **Konutmatik'in rose'undan ve genel slate-koyu klişesinden ayrış** — bizim "Spatial açık" zemin (#eef1f6) + navy/teal + sinyal renkleri (yeşil/amber/kırmızı) zaten farklılaştırıcı. Sinyal renkleri = statü dili (herkeste var ama bizde tutarlı sistem). **Kaçın:** RE-OS/Code5 Bootstrap-şablon hissi + NHB emoji-şirinliği.

---

## 5. "BİZİ EN İYİ YAPACAK YAPI" — Reçete

### 5.1 Önerilen Site Haritası
```
PUBLIC (ikna):
  /                         → Ana (kategori-sahiplenen hero + 2×2 farkımız + canlı kanıt)
  /uretici (müteahhit için) → Avesdo/Entera new-construction iskeleti + tahsis akışı
  /emlakci  (emlakçı için)  → NHB/Topli emlakçı vaadi ama KOMİSYONSUZ + tahsisli
  /nasil-calisir            → 4 adım: stok yükle → tahsis et → emlakçı paylaşır → opsiyon/satış
  /guven (güven protokolü)  → çift-satış kalkanı + tazelik + doğrulama rozeti + EİDS uyumu
  /fiyat                    → emlakçı bedava (açık) + müteahhit "Görüşelim" (concierge)
  /basari / referanslar     → isim+şirketli müteahhit/ofis testimonial + logo duvarı
  /sehir/{il}, /proje/{slug}→ programatik SEO (şehir + proje)
                              ⚠️ DEĞİŞMEZ ŞERHİ: kapalı-devre kuralı ("son kullanıcıya açık ilan yok")
                              + EİDS "ilan mahiyeti" sınırı gereği bu sayfalar FİYATSIZ ve STOKSUZ,
                              yalnız kurumsal tanıtım düzeyinde olabilir; canlı stok/fiyat ASLA public
                              sayfaya basılmaz (tahsisli /havuz ve imzalı /p/ linkleri dışına çıkmaz).
  /blog, /wiki, /araclar    → SEO/growth (hesaplayıcı: komisyonsuz kazanç, tazelik kontrol)
AUTH-ARKASI (ürün):
  /panel (müteahhit)        → stok/fiyat/tahsis/opsiyon/talep radarı (komuta merkezi)
  /havuz (emlakçı)          → yalnız tahsisli birimler + tek-link paylaşım (Alnair "magic link")
  /p/{...}                  → canlı satış mikrositesi (fiyat canlı basılır)
  /admin (BİZ)              → üyelik/kota/doğrulama/gelir (üretici ekranı görmez)
```

### 5.2 Ana Sayfa İçerik İskeleti (sıra)
1. **Hero (kategori-sahiplen):** "Çok-müteahhitli canlı konut stoğu dağıtım ağı" — Entera/Avesdo özgüveniyle. Alt: "Üretici stoğu tek noktadan yönetir; emlakçı yalnız kendine tahsisliyi canlı havuzdan görür ve paylaşır." Canlılık rozeti görünür.
2. **2×2 farkımız (citability bloğu):** "CRM değil, portal değil, komisyon havuzu değil — tahsisli dağıtım altyapısı." (Buildify problem→çözüm formatı.)
3. **Canlı kanıt bandı:** ağdaki toplam canlı stok değeri / aktif müteahhit / tahsisli birim (Avesdo $15B deseni) — gerçek sayı, EmlakKanal gibi fake değil.
4. **Nasıl çalışır (4 adım):** stok yükle → **elektronik tahsis** → emlakçı paylaşır → opsiyon/satış (Avesdo akışı). ⚠️ **Görsel kural (14-site ortak bulgusu):** hiçbir başarılı rakip akışı diyagram/ikonla anlatmıyor — ikna eden şey **numaralı GERÇEK ürün ekranı dizisi** (Avesdo Realtor Portals "1-2-3 screenshot" kalıbı) veya **canlı HTML simülasyon** (Konutmatik'in feed/sayaç mockup'ları). Bu bölüm ikon+metin DEĞİL, 4 gerçek ekran görüntüsü ya da CanliHavuzDemo tarzı canlı demo ile kurulacak; Topli'nin en büyük zaafı (sıfır ürün ekranı) bizim en ucuz silahımız.
5. **Üç kale (güven protokolü):** komisyonsuz (Connject satırı) · çift-satış imkânsız (DB kalkan) · her zaman canlı fiyat/tazelik (NHB Last-Updated).
6. **Rol kartları:** Üretici / Emlakçı / (BİZ=admin görünmez). Her biri kendi landing'ine.
7. **Sosyal kanıt:** isim+şirketli 3-5 referans + müteahhit logo duvarı (Topli/BuildersUpdate deseni).
8. **Kapanış CTA:** Üretici "Görüşelim/Demo" · Emlakçı "Ücretsiz Başla."

### 5.3 Model Konumlaması (her sayfada işlenecek üç kale)
- **Komisyonsuz** → Topli/RE-OS/EmlakKanal/Alnair'e karşı: "kazancın %100'ü sende, işleme girmeyiz."
- **Tahsis (üretici kontrolü)** → NHB/Buildify/Topli açık-erişimine karşı: "kime/hangi fiyata/ne kadar açacağını sen belirle."
- **DB çift-satış kalkanı + tazelik** → herkese karşı: "aynı daire iki kez satılamaz; asla eski fiyattan satış."

---

## 6. BİZDE NE DEĞİŞECEK — Somut Çıkarımlar (aksiyon)

1. **Landing yeniden yapısı:** Tek anasayfadan → **/uretici + /emlakci ayrı rol landing'leri** (herkeste bu ayrım var, bizde yok/zayıf). Üretici sayfası = Avesdo new-construction iskeleti; emlakçı sayfası = "komisyonsuz + tahsisli" anti-Topli mesajı.
2. **Tazelik göstergesini UI'da öne al:** NHB "Last Checked/Last Updated" + Konutmatik "3dk önce" — bizim `son_guncelleme` DEĞİŞMEZİNİN görünür karşılığı. Birim kartında + mikrositede.
3. **"Tek-link koleksiyon paylaşımı" (Alnair magic link):** emlakçı tahsisli seçimini tek gizli-URL'de paylaşsın (fiyat canlı basılır). Yüksek-değer, düşük-maliyet MVP deseni.
4. **Güven protokolü sayfası + tek-satır komisyonsuz rozet** (Connject deseni) — çift-satış kalkanını *ürün anlatısı* yap (şu an gömülü mekanik).
5. **Komisyonsuzluğu ana pazarlama omurgası yap** — Novo/Topli/RE-OS/Alnair hepsi komisyonlu; bu en keskin, kopyalanamaz karşı-konum.
6. **Cold-start disiplini:** EmlakKanal'ın boş-kabuk hatasına düşme — arzı (müteahhit anlaşması + gerçek stok) doldurmadan emlakçı tarafını açma; canlı sayı göster, fake gösterme.
7. **Growth motoru ekle:** şehir/proje programatik SEO (NHB/Connject) + emlakçı-odaklı 2-3 ücretsiz araç/wiki (Novo). GEO/SEO standardıyla uyumlu.
8. **Tasarım:** "Spatial açık komuta merkezi" yönünde ilerle (Konutmatik/Avesdo doğruluyor) ama **marka aksanını Konutmatik rose'undan ayrıştır.** Sinyal renkleri = statü dili tutarlılığı.
9. **EİDS uyumu konumlanma kozu:** kapalı-devre "ilan değil tahsis" modeli, 1 Şub 2026 EİDS + 286.206 TL sosyal-paylaşım cezası rejiminde avantaj → güven sayfasında işle. ⚠️ Aynı zamanda landing'deki "tek tıkla sosyal medya paylaşımı" iddiasını hukuken gözden geçir.
10. **Referans/güven biriktir:** Konutmatik'in silahı isimli müteahhit referansları (Torunlar/Taşyapı). Erken 3-5 gerçek müteahhit/ofis referansını isim+şirket formatında topla.

---

## 7. Açık Sorular / Araştırma Borcu
- New Home Buddy + BuildersUpdate gerçek gelir modeli (müteahhit ayağı) teyit edilmedi.
- Novo/Konutmatik çok-müteahhit havuza kayarsa → doğrudan rakip; izle. (Konutmatik'te acente-kotalı tahsis ZATEN üretimde — bkz. 2.4 revizyonu; izleme önceliği yükseldi.)
- ~~DomusHub, HomesUSA SpecDeck, ECI LotVue — 2. tur doğrulama borcu.~~ **KAPANDI (2026-07-24):**
  - **DomusHub = GERÇEK** (domushub.io): off-plan geliştiriciler için "Sales OS"; MENA+SEA+CIS, dil: EN/RU/**TR**/TH/ID; *"Instant unit locking via online deposit payment. Zero risk of double bookings"*; $250/ay (tek proje) – $500/ay (sınırsız); SOC 2/GDPR, Stripe + USDT/USDC. İsimli müşteri vakası YOK (genç ürün). Kilit = ödeme-kapılı (bizde DB + parasız opsiyon). **İzlenecek rakip** — TR diliyle pazara bakıyor.
  - **HomesUSA SpecDeck = gerçek ama farklı iş:** Texas, hacimli builder için otomatik MLS listing (50+ validasyon, real-time). Tazelik tezimizin aynısını söylüyor (*"buyers see yesterday's information, they move on"*) ama tahsis/kilit yok.
  - **ECI LotVue = mekanizma olarak en yakın görsel referans:** interaktif site haritasında renk-kodlu lot durumu+fiyat, builder sisteminden otomatik veri (*"no need to rekey data"* = tek doğru kaynak), **kredi kartıyla online lot kilitleme**, lot-click heat map. Tahsis/kesit görsel anlatımı için incele: ecisolutions.com/products/lotvue.

**Kaynak siteler:** avesdo.com · newhomebuddy.com · alnair.ae · buildersupdate.com · getbuildify.com · entera.ai · ecisolutions.com · novoxcrm.com · topli.io · re-os.com · konutmatik.com · code5.com.tr · connject.com · emlakkanal.com.

---

## 8. GÜNCEL 30+ RAKİP TARAMASI (2026-08-07, Ağustos 2026 web-kontrollü)

"Projedar benzerlik %" = analitik puan (rakip beyanı değil). 6 eksen ağırlıklı: geliştirici→bağımsız emlakçı ağı · çoklu geliştirici · canlı stok/fiyat · müşteri claim/sahiplik · hold-rezervasyon · komisyon/hakediş.

### 8.1 Ana tablo (31 oyuncu)

| # | Oyuncu | Pazar | Benzerlik | Ne satıyor | Projedar'a göre temel fark | Tehdit |
|--:|--------|-------|----------:|------------|----------------------------|:------:|
| 1 | **Connject** | TR/Global | 94% | Developer→danışman B2B proje ağı | Transaction OS derinliği (hold/booking/hakediş) sığ | 5/5 |
| 2 | **NOG Base** | UAE | 92% | Developer↔broker operating system | Nötr çoklu-geliştirici network etkisi zayıf; KOMİSYONLU | 5/5 |
| 3 | **DomusHub** | MENA/SEA | 91% | Off-plan Sales OS | Geliştiricinin kendi altyapısı; ortak danışman ağı değil | 5/5 |
| 4 | **Sell.Do** | Hindistan | 90% | Developer channel-partner OS | Kendi developer/CP CRM'i; çok-geliştirici ağ değil | 5/5 |
| ✚ | **Tapuva** | TR | 88% | Developer→broker proje dağıtım ağı (broker bedava, AI eşleştirme) | KOMİSYONLU (%3.2-4.0 developer öder); unit-level stok/DB kilit/hold sığ | 5/5 |
| 5 | **Arveya Enterprise** | TR | 86% | Developer+emlak ofisi ağı | CRM/B2B ekosistem ağır; saf dağıtım ağı değil | 5/5 |
| 6 | **Avesdo** | K.Amerika | 86% | New-home transaction mgmt | Developer merkezli; açık bağımsız broker marketplace değil | 5/5 |
| 7 | **BeyondWalls** | Hindistan | 85% | Developer↔CP ekosistem | İKİ YÜZ: consumer portalı açık-ilan (anti-tez); ağır servis katmanı | 4/5 |
| 8 | **Novo CRM** | TR | 84% | Developer CRM + broker bulutu | Developer kendi broker ağını yönetir; nötr marketplace değil | 5/5 |
| 9 | **Property Shell** | AU/Global | 83% | Project marketing + stock allocation | Emlakçı acquisition/network zayıf; enterprise altyapı | 4/5 |
| 10 | **Realatic** | Hindistan | 82% | Developer CRM + CP portal | Hindistan'a özgü developer CRM | 4/5 |
| 11 | **Buildesk** | Hindistan | 81% | Developer/mandate + CP CRM | Marketplace/discovery değil, mevcut partner yönetimi | 4/5 |
| 12 | **Unlatch** | FR/UK/Global | 80% | New-home collaborative sales | Broker ağı/discovery'den çok işlem dijitalleşmesi | 4/5 |
| 13 | **OFP Exchange** | UAE/ES/Bali | 80% | Off-plan transaction rail | Komisyonsuz SaaS değil; transaction rail + exclusivity | 4/5 |
| 14 | **Yapısoft SalesOffice** | TR | 79% | Developer Sales CRM | Kendi satış ofisi/broker; network marketplace yok | 4/5 |
| 15 | **Konutmatik** | TR | 78% | Dijital proje satış ofisi | Güçlü transaction altyapı ama TR emlakçı ağı değil | 4/5 |
| 16 | **Spark RE** | CA/US | 77% | New-development sales OS | Network dağıtımı değil, proje satış operasyonu | 4/5 |
| 17 | **SaleFish** | CA/Global | 76% | New-home sales platform | Developer merkezli transaction platform | 4/5 |
| 18 | **RE-OS** | TR | 75% | Emlak CRM+MLS+sıfır proje ağı | Developer live-stock/hold altyapısı merkezî değil | 4/5 |
| 19 | **PrismCRM/Code5** | TR | 73% | Developer proje satış CRM | External broker marketplace/network zayıf | 3/5 |
| 20 | **Ownly** | CA/US | 72% | Direct digital home buying | Ters: broker maliyetini AZALTMA vaadi | 3/5 |
| 21 | **Cecilian – The XO** | US | 70% | Developer/homebuilder ERP | Master-plan developer operasyonu | 3/5 |
| 22 | **MLS.tr** | TR | 69% | Kapalı emlakçı B2B ağı | Yeni proje/developer stoğu + transaction motoru yok | 4/5 |
| 23 | **PortföyCRM** | TR | 68% | CRM + ofisler arası network | Developer/new-development uzmanlığı yok | 3/5 |
| 24 | **Planports** | TR | 65% | Emlak/inşaat CRM | Cross-company developer→broker network yok | 3/5 |
| 25 | **ECI Lasso** | US/CA | 64% | Homebuilder CRM | Inventory distribution + broker transaction sınırlı | 3/5 |
| 26 | **ProspectONE/BST** | CA | 63% | Homebuilder CRM | Broker ağı yok; satış ofisi yazılımı | 3/5 |
| 27 | **New Home Star** | US | 61% | Builder sales outsourcing+tech | SaaS marketplace değil; insanlı outsourcing | 3/5 |
| 28 | **CondoGrid** | CA | 60% | Condo developer sales OS | Network/distribution katmanı dar | 3/5 |
| 29 | **Rylax** | IE | 58% | Property development platform | Satış network'ünden çok development lifecycle | 2/5 |
| 30 | **NoviHome** | US | 52% | Homebuyer experience | Buyer experience, dağıtım problemi değil | 2/5 |
| 31 | **iRealtee** | Filipinler | 50% | Brokerage OS | Brokerage tarafı; developer live inventory değil | 2/5 |

### 8.2 Feature matrix (● güçlü · ○ kısmi · — doğrulanmadı)

| Rakip | Çoklu gel. | Bağımsız broker ağı | Canlı stok | Canlı fiyat | Müşteri claim | Conflict | Hold | Booking | Komisyon | Hakediş | Multi-proj broker |
|-------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **Projedar hedefi** | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| Connject | ● | ● | ● | ● | ● | ○ | — | — | ● oran | — | ● |
| NOG Base | ○ | ● | ● | ● | ● | ○ | ● | ● | ● | ● | ○ |
| DomusHub | ○ | ● | ● | ● | ● | ○ | ● | ● | ● | ● | ○ |
| Sell.Do | ○ | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| Arveya | ●/○ | ● | ● | ● | ○ | ○ | ● | ●/○ | ● | ○ | ● |
| Avesdo | ○ | ● | ● | ● | ● | ○ | ● | ● | ○ | ○ | ○ |
| BeyondWalls | ● | ● | ● | ● | ● | ○ | ○ | ● | ● | ○ | ● |
| Novo | ○ | ● | ● | ● | ● | ○ | ● | ● | ● | ● | ○ |
| Realatic | ○ | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| Konutmatik | ○ | ○ | ● | ● | ● | ○ | ● | ● | ● | ○ | — |
| Tapuva | ● | ● | ● ilan | ● | ○ | ○ | — | — | ● | ○ | ● |
| RE-OS | ● | ● | ○ | ○ | ● | ○ | — | — | ● | ○ | ● |
| MLS.tr | ● | ● | ○ | ○ | ● | ○ | — | — | ● paylaşım | — | ● |

Projedar hedef satırı tüm 11 eksende ● = kimse tüm eksenleri birden kapatmıyor; ürün-özellik konumu lider.

### 8.3 Web mesajı / satılan korku (seçme)

| Rakip | Hero mesajı | Hedeflediği korku | Projedar dersi |
|-------|-------------|-------------------|----------------|
| Connject | "Biz aradaki köprüyüz" | Projelerin WhatsApp/PDF'te kaybolması | Network'ü ana ürün yap |
| NOG Base | "WhatsApp chaos → real-time inventory+commissions" | Stok + broker koordinasyon kaosu | "WhatsApp yerine Projedar" güçlü tema |
| DomusHub | "Single source of truth" | Eski fiyat, Excel, double booking | Tek doğru kaynak çok güçlü |
| Sell.Do | "Run your channel partner network with confidence" | Lead/brokerage kavgası, telefonla stok sorma | Enterprise mesajına çok yakın |
| Novo | "Brokerlar yönetilemiyor" | Müşteri sahipliği + hakediş çatışması | Problem validation |
| Konutmatik | "Satışı anında yönetin" | Yanlış stok/fiyat, çift rezervasyon | Transaction UX benchmark |
| RE-OS | "Sıfır projelere iş ortağı olun" | Emlakçının satacak proje bulamaması | Danışman acquisition mesajı |
| MLS.tr | "Rakip değil ekip olun" | Diğer emlakçıyla paylaşım korkusu | Network trust mesajı |
| Property Shell | "Stock allocation across sales channels" | Dağıtım kontrolü kaybı | Geliştirici mesajı için iyi |

### 8.4 En ciddi rakipler + globalde kopyalanacak 3

- **TR doğrudan:** Connject (business-model competitor: network + danışmana bedava + komisyonsuz) > Novo CRM (fiyat açık: Starter 1.999 / Pro 2.999 / Business 4.999 TL/ay; Business'ta Broker Ağı + Komisyon Planı) > Arveya (proje stoğu + ofis ağı + yatırımcı talebi, şifreli kapalı paylaşım) > RE-OS ("sıfır projelere iş ortağı") > Konutmatik (transaction derinliği benchmark: Boş→Rezerve→Satıldı + dinamik fiyat + stok lock).
- **Globalde ürünü en çok kopyalanacak 3:**
  1. **Sell.Do** — CP onboarding+KYC, kontrollü inventory, buyer tagging, **lead ownership conflict**, unit blocking, token payment, booking, brokerage calc, invoice, **payout ledger**, CP ranking. "Partnerin müşterisi hazır; stok sormak için ofisi arıyor, cevap gelene kadar ünite başkasına tutuluyor" = Projedar use-case'inin birebir tarifi.
  2. **DomusHub** — problem listesi birebir ("Available? Send me the price!", double sales, outdated marketing, spreadsheet chaos, commissions, agent cabinet, booking timer). Agent Cabinet: My clients→my deals→my commission journal. $250/ay (tek proje) – $500/ay (sınırsız).
  3. **NOG Base** — iş modeli en öğretici: Developer AED 5.000/ay · Broker ücretsiz · komisyon oto AED 300/payout · developer→broker network→live inventory→reservation→commission.

### 8.5 White-space (30 rakip sentezi) + KOD GERÇEĞİ

Kesişim = **NETWORK × LIVE INVENTORY × TRANSACTION GOVERNANCE**. Connject'te network var / governance sığ; Konutmatik-Novo'da governance var / ortak network yok; MLS-RE-OS'ta network var / unit-level transaction OS sığ. Projedar = üçünün kesişimi + **komisyonsuz**.

Ürün seviyesi zinciri: Developer→Proje→Blok→Kat→Bağımsız bölüm→Fiyat→Kampanya→Broker erişimi→Müşteri claim→Claim conflict→Hold→Reservation→Sale→Commission entitlement→Payout status→Performance.

**Kod doğrulaması (2026-08, koddan):** Projedar'ın "transaction governance + live inventory" ekseni KODDA GÜÇLÜ: dalga/release açılışı, opsiyon yaşam döngüsü (geçici-kilit + müteahhit doğrulama + süre/uzatma/sonuç), iki-taraflı güven skoru, granüler tahsis, DB çift-satış kalkanı, fiyat trendi, güncel-fiyat mikrosite. **Gerçek boşluk = NETWORK ayağı = cold-start/arz doldurma (kod değil, GTM).** En yakın rakiplerin (Connject 15K danışman, NOG Base 29K REGA broker) moat'ı iki-taraflı ağ yoğunluğu.

### 8.6 Fetch doğrulamaları (2026-08-07)

- **NOG Base (nogbase.ae):** tablo birebir doğrulandı. Developer AED 5.000/ay + broker bedava + milestone-linked komisyon (booking/construction/handover, AED 300/payout, "AED 13.59B komisyon"), canlı stok + instant lock, EOI/rezervasyon, WhatsApp AI, 48sa go-live, launch readiness scoring, native iOS/Android. Kurucu Ahmed Khaire. **Gelir modeli Projedar ile birebir; tek fark KOMİSYONLU → Projedar'ın komisyonsuz konumunu keskinleştirir.**
- **Tapuva (tapuva.com, TR) %88 — Connject profiline en yakın TR network rakibi:** developer→broker proje dağıtım ağı; **broker ücretsiz** (Projedar gelir modeliyle aynı taraf), çoklu geliştirici (15+ marka, 81 il), canlı ilan (100+), **AI satış koçu** (satış metni + itiraz yanıtı + müşteri eşleştirme) + akıllı eşleştirme (bölge/bütçe→broker), ücretsiz araçlar (vergi/kira getirisi hesaplayıcı, Novo/kolayseo deseni), KVKK. **KRİTİK FARK: KOMİSYONLU** (%3.2-4.0 developer öder, oranlar projede görünür) → Connject (komisyonsuz) ile NOG Base (komisyonlu) arası; Projedar komisyonsuz konumunu keskinleştirir. **Governance sığ:** ilan-seviyesi canlı stok (unit-level grid / DB çift-satış kilidi / hold-rezervasyon net değil) → Projedar'ın transaction OS derinliği yok. Tehdit 5/5 (TR doğrudan, broker-bedava + AI eşleştirme aktif satıyor). ⚠️ Web'de "Tapuva" ≠ "Tapu.com" (ikincisi alakasız ekspertizli açık artırma sitesi, Earlybird yatırımlı).
- **BeyondWalls — İKİ YÜZ (kritik):** `corporate.beyondwalls.com` = B2B developer↔channel-partner ekosistem (tabloda bu, MahaRERA kayıtlı, Pune/Mumbai). AMA `beyondwalls.com/property/...` (verilen URL) = B2C consumer portal: public listing + açık fiyat (₹46.73L, ₹4.582/sqft) + EMI hesaplayıcı + brosür indir + "Enquire Now" lead formu + indexlenebilir + **statik katalog (unit-level canlı grid YOK)**. Consumer yüzü = Projedar ANTİ-TEZİ (DEĞİŞMEZ #4 kapalı-devre + EİDS ihlali). **Ders: B2B ekosistem/kategori anlatımı AL, consumer portal ALMA.**

**EK-8 kaynak siteler:** nogbase.ae · tapuva.com · domushub.io · sell.do · arveya.com · beyondwalls.com · corporate.beyondwalls.com · propertyshell.com · realatic.com · buildesk.in · getunlatch.com · ofpexchange.com · konutmatik.com · spark.re · salefish.app · re-os.com · ownly.re · cecilianpartners.com · mls.tr · portfoycrm.com · novoxcrm.com.

---

## 9. TÜRKİYE DAVRANIŞ HARİTASI + Arveya Partner yeniden değerlendirme (2026-08-07, kullanıcı)

**Metodoloji dönüşü (en önemli çıkarım):** "Rakip firma" aramak yanlış; **davranış** aramak gerekiyor. Arveya Partner "müteahhit emlakçı canlı stok platformu" sorgusundan kaçar ama "yetkili portföy partner", "kapalı devre kurumsal portföy" sorgusuyla gelir. → keşif sorgu evrenini eşanlamlılarla genişlet (bkz. 9.6).

### 9.1 TR seviyeli rakip/benchmark haritası

| Seviye | Oyuncular | Not |
|--------|-----------|-----|
| 🔴 Pure-play / direct | **Connject · Tapuva · Topli** | Doğrudan araştırılacak çekirdek |
| 🟠 Model olarak çok yakın | **Arveya Partner** | Ürün mantığının önemli bölümünü doğruluyor (9.2) |
| 🟠 Network tarafında yakın | **RE-OS · MyTEKCE** | Emlakçı acquisition + white-label dağıtım benchmark |
| 🟡 B2B network davranışı | **MLS.tr · Özel İlan · Emlakçılar Portalı · EDAP** | TR'de kapalı-devre paylaşım DAVRANIŞI var = adoption riski ↓ (9.4) |
| 🟡 Developer-side feature | **Konutmatik · Novo · Yapısoft · Prism** | Feature/transaction benchmark |
| 🔵 Alternatif dağıtım kanalı | **NPR · Lia Proje · Go Partners · proje pazarlama şirketleri** | Teknoloji değil, mevcut alternatif maliyet (9.5) |
| 🔵 Off-market / partner benchmark | **E1 Holding/E1 Plus · Aclass Wealth** | Partner/referral ekonomisi + kapalı yatırım ağı güveni |
| ⚪ Watchlist / doğrulanmamış | **Xtapu · Portföy Uzmanı** | Gerçek traction/ürün kanıtı çıkana kadar tabloya girmez |

### 9.2 ⭐ Arveya Partner — yeniden değerlendirme (önce "fazla CRM" diye itilmişti; ürün ciddi)

Kamuya açık sayfada AÇIKÇA var (Projedar mantığını doğruluyor):
- yalnız yetkilendirilen portföyü görme + kapalı-devre erişim + **portföy-bazlı yetkilendirme** (= tahsis)
- partnerin kendi müşterisi yalnız kendisine görünür (= lead ownership)
- **telefon-bazlı mükerrer müşteri uyarısı** (= claim conflict)
- müşteriye **kendi logosuyla teklif** (= white-label)
- teklif açıldı mı / kaç kez görüntülendi (= paylaşım/görüntülenme sinyali)
- bekliyor / opsiyon / vazgeçti durumları (= opsiyon yaşam döngüsü)
- kurumsal: partner sayısı + hangi portföy hangi partnere görünür + partner performansı

**KRİTİK FARK (koru):** Arveya Partner = BİR kurumsal firmanın KENDİ portföyünü KENDİ partner ağına dağıtması = **network software**. Projedar = ÇOK bağımsız geliştiricinin stoğu, TEK bağımsız danışman ağı üzerinden = **network'ün kendisi**. Arveya yazılımı satar, Projedar ağı işletir.

### 9.3 MyTEKCE — düşünülenden öğretici (Lead Protection benchmark)

TEKCE partnerine: 7.000+ portföy → **kendi logosuyla sunum → müşteri kaydı (partner adına) → süreç takibi → satış → komisyon hakedişi → tahsilat takibi.** Hipotezimizi doğruluyor: *danışman yazılım istemiyor; satabileceği stok + müşterisinin korunduğuna dair görünürlük istiyor.* Projedar Lead Protection için doğrudan benchmark. Fark: MyTEKCE = TEKCE'nin KENDİ dağıtım ağı; Projedar = tüm geliştiriciler için bağımsız altyapı.

### 9.4 Özel İlan · Emlakçılar Portalı · EDAP — adoption riski azaltımı (rakip değil, kanıt)

Bunlar rakip oldukları için değil, **TR'de kapalı-devre B2B paylaşım davranışının OLUŞTUĞUNU** kanıtladıkları için önemli. Özel İlan: emlakçı↔emlakçı güvenli kapalı-devre portföy paylaşım ağı. Emlakçılar Portalı: TR çapında MLS + CRM + **dijital ortak satış sözleşmesi + gerçek zamanlı komisyon takibi + müşteri eşleştirme.** Çıkarım: emlakçıların başka profesyonellerle aynı kapalı dijital ağda stok paylaşması TR için yabancı davranış değil = Projedar için benimseme riski düşük.

### 9.5 Alternatif dağıtım kanalları (teknoloji kategorisi değil, dağıtım davranışı)

E1 Holding/E1 Plus (global off-market + franchise/partner ağı, TR iştiraki), Aclass Wealth (butik off-market yatırımcı ağı), Go Partners (Keller Williams çatısı, 600+ iş ortağı, insanlı proje satış/pazarlama service business), NPR/Lia Proje (proje pazarlama+satış hizmet şirketleri). "Rakip şirket" değil **Alternative Distribution Channels** = müteahhitin bugün Projedar yerine kullandığı alternatif maliyet.

### 9.6 Keşif metodolojisi: davranış-arama + eşanlamlı sorgu evreni (SerpAPI)

20 sorgu yetmez → 60-100 temel sorgu × kombinasyon = 500+ SERP. Eşanlamlı eşleme (rakip bizim kelimemizden kaçar):

| Bizim kelime | Rakibin kelimesi | Bizim kelime | Rakibin kelimesi |
|--------------|------------------|--------------|------------------|
| Tahsis | Yetkilendirme | Müşteri claim | Müşteri kaydı |
| Canlı stok | Güncel portföy | Lead protection | Müşteri koruma |
| Emlakçı ağı | Partner ağı | Developer | Kurumsal firma |
| Broker | Acente | Müteahhit | Proje sahibi |
| Proje dağıtımı | Partner satışı | Havuz | Portföy ağı |
| B2B network | Kapalı devre | Yeni konut | Sıfır proje |
| Dağıtım | İş ortaklığı | Satış ağı | Yetkili satış ağı |

Örnek getiren sorgular: `"yetkili portföy" "partner"` · `"partner ağı" gayrimenkul` · `"kurumsal portföy" "kapalı devre"`. **Bağlantı:** mevcut Keşif & Davet Motoru (`src/lib/kesif/`, SerpAPI Maps + Serper) sorgu evreni bu eşanlamlılarla genişletilebilir.

**EK-9 kaynak/oyuncu:** arveya.com (Partner) · mytekce.com · ozelilan · emlakcilarportali · edap · e1holding/e1plus · aclasswealth · gopartners · npr · liaproje · xtapu (watchlist).
