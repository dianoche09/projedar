/**
 * Projedar Semantic Territory Map (v1) — SEO Komuta Merkezi'nin kaynak haritası.
 *
 * SIRA (kullanıcı kuralı 2026-08-12): uzmanlık → problem → kullanıcı → semantic territory → keyword-data.
 * Bu dosyada KEYWORD VOLUME YOK — hacim en son çekilir. Önce stratejik uygunluk.
 *
 * STRATEGIC-FIT GATE (hacimden ÖNCE, must-have seçim mantığı):
 *  Gate 1 — stratejikFit ≥ 0.80 (Projedar'ın ürün/problem/kullanıcı/arzını doğrudan temsil eder mi?)
 *  Gate 2 — persona ∈ {danisman, ofis, muteahhit, satis-yoneticisi, nitelikli-alici(yalnız public arz)}
 *  Gate 3 — projedarCevap dolu (başkasının veremeyeceği özgün cevabımız var mı?)
 *  Gate'ten geçenlere SONRA hacim/KD/SERP skoru (firsat.ts) uygulanır.
 *
 * KPI: trafik değil → nitelikli KAYIT (2. KPI: /emlakci|/muteahhit geçiş). Her cluster kendi kayıt hunisi.
 * Rakip adı bu haritada YOK (kullanıcı-görünür değil zaten; kod içi de kullanılmaz).
 *
 * NOT: v1 tohum harita — genişletilebilir (hedef: 20 kategori + 30 danışman-problem + 30 müteahhit-problem
 * + 20 mekanizma). Buradaki set pattern'i ve gate'i kurar; satır eklenerek büyür.
 */

export type Persona = "danisman" | "ofis" | "muteahhit" | "satis-yoneticisi" | "nitelikli-alici";
export type Niyet = "informational" | "commercial" | "transactional" | "navigational";
export type Cluster =
  | "kategori" // kategori sahipliği (semantic territory)
  | "canli-stok" // problem: güncel stok & fiyat
  | "tahsis-opsiyon" // ürün mekanizması
  | "musteri-kayit" // problem: müşteri kaydı & çift-satış çakışması (hak koruma)
  | "komisyon-hakedis" // problem: ekonomik / hakediş
  | "arz"; // arz sahipliği (programmatic proje/firma/lokasyon)

export type Cta = "/emlakci" | "/muteahhit" | "/nedir" | "/konut-projeleri" | "/kayit" | "/guven";

export interface TerritoryGirdi {
  sorgu: string;
  cluster: Cluster;
  persona: Persona[];
  niyet: Niyet;
  isDeger: 1 | 2 | 3; // business value (kayıt/dönüşüm potansiyeli)
  stratejikFit: number; // 0..1 — Projedar'ı doğrudan temsil mi? (Gate 1)
  projedarCevap: string; // Gate 3 — başkasının veremeyeceği özgün cevabımız
  cta: Cta;
  url: string; // mevcut ya da önerilen yeni path
  pillar: boolean;
}

// ── 1) KATEGORİ SAHİPLİĞİ (semantic territory — hacim ikincil, entity/otorite) ───────────────
const KATEGORI: TerritoryGirdi[] = [
  { sorgu: "yeni konut proje satış ağı", cluster: "kategori", persona: ["danisman", "muteahhit"], niyet: "informational", isDeger: 3, stratejikFit: 1.0,
    projedarCevap: "Çok-müteahhitli, üretici-kontrollü tek canlı ortak havuz — kategorinin kendisi.", cta: "/nedir", url: "/nedir", pillar: true },
  { sorgu: "canlı konut stoğu", cluster: "kategori", persona: ["danisman", "muteahhit"], niyet: "informational", isDeger: 3, stratejikFit: 1.0,
    projedarCevap: "Bir daire değişir, bütün ağ anında güncellenir; fiyat tek doğru kaynaktan basılır.", cta: "/nedir", url: "/nedir", pillar: true },
  { sorgu: "tahsisli konut satışı", cluster: "kategori", persona: ["muteahhit", "danisman"], niyet: "informational", isDeger: 3, stratejikFit: 1.0,
    projedarCevap: "Üretici hangi emlakçının hangi projeyi göreceğini granüler tahsis eder.", cta: "/nedir", url: "/nedir", pillar: true },
  { sorgu: "müteahhit emlakçı satış ağı", cluster: "kategori", persona: ["muteahhit", "ofis"], niyet: "informational", isDeger: 3, stratejikFit: 1.0,
    projedarCevap: "Bağımsız çok-müteahhit stoğu ↔ bağımsız çok-danışman ağı; ağın kendisi.", cta: "/nedir", url: "/nedir", pillar: false },
  { sorgu: "emlakçıya proje tahsisi", cluster: "kategori", persona: ["ofis", "danisman"], niyet: "informational", isDeger: 3, stratejikFit: 0.95,
    projedarCevap: "Emlakçı yalnız kendisine tahsisli birimleri tek canlı havuzdan görür.", cta: "/emlakci", url: "/emlakci", pillar: false },
  { sorgu: "konut projesi dağıtım ağı", cluster: "kategori", persona: ["muteahhit"], niyet: "informational", isDeger: 2, stratejikFit: 0.9,
    projedarCevap: "Stoğu/fiyatı/dağıtımı tek noktadan yöneten canlı dağıtım ağı.", cta: "/muteahhit", url: "/muteahhit", pillar: false },
  { sorgu: "proje stoğu paylaşımı", cluster: "kategori", persona: ["muteahhit", "ofis"], niyet: "informational", isDeger: 2, stratejikFit: 0.88,
    projedarCevap: "Kontrol kaybetmeden çok-emlakçıya güvenli stok paylaşımı (tahsis + kalkan).", cta: "/muteahhit", url: "/muteahhit", pillar: false },
  { sorgu: "yeni konut projesi satışı nasıl yapılır", cluster: "kategori", persona: ["danisman", "ofis"], niyet: "informational", isDeger: 2, stratejikFit: 0.85,
    projedarCevap: "Tahsisli canlı stoktan paylaş-sat; ilan değil, profesyoneller arası satış.", cta: "/emlakci", url: "/rehber/yeni-konut-projesi-satisi", pillar: true },
];

// ── 2) PROBLEM SAHİPLİĞİ — asıl kayıt SEO'su (danışman + müteahhit açısı) ─────────────────────
const CANLI_STOK: TerritoryGirdi[] = [
  { sorgu: "güncel proje stok listesi nasıl takip edilir", cluster: "canli-stok", persona: ["danisman", "satis-yoneticisi"], niyet: "informational", isDeger: 3, stratejikFit: 0.95,
    projedarCevap: "Tek doğru kaynak (birim tablosu) + 'X önce güncellendi' tazelik rozeti.", cta: "/emlakci", url: "/rehber/guncel-proje-stok-takibi", pillar: true },
  { sorgu: "proje satışında stok ve fiyat nasıl güncel tutulur", cluster: "canli-stok", persona: ["muteahhit", "satis-yoneticisi"], niyet: "informational", isDeger: 3, stratejikFit: 0.95,
    projedarCevap: "Fiyat/durum yalnız birim tablosunda; her yazışta son_guncelleme=now, stale uyarısı.", cta: "/muteahhit", url: "/rehber/proje-stok-fiyat-guncel", pillar: false },
  { sorgu: "eski fiyatla daire satmak", cluster: "canli-stok", persona: ["danisman"], niyet: "informational", isDeger: 2, stratejikFit: 0.9,
    projedarCevap: "Paylaşımda fiyat canlı değerden basılır; eski/eskiyen fiyat riski yok.", cta: "/emlakci", url: "/rehber/eskiyen-fiyat-riski", pillar: false },
];

const MUSTERI_KAYIT: TerritoryGirdi[] = [
  { sorgu: "proje satışında müşteri çakışması nedir", cluster: "musteri-kayit", persona: ["danisman", "satis-yoneticisi"], niyet: "informational", isDeger: 3, stratejikFit: 0.97,
    projedarCevap: "Aynı dairenin iki danışmana kilitlenmesi; DB-seviyesi çift-satış kalkanı engeller.", cta: "/emlakci", url: "/rehber/musteri-cakismasi-cift-satis", pillar: true },
  { sorgu: "aynı dairenin iki danışmana satılması nasıl önlenir", cluster: "musteri-kayit", persona: ["muteahhit", "satis-yoneticisi"], niyet: "informational", isDeger: 3, stratejikFit: 0.97,
    projedarCevap: "Aktif opsiyon için DB'de unique partial index — uygulama katmanına güvenmez.", cta: "/muteahhit", url: "/rehber/cift-satis-onleme", pillar: false },
  { sorgu: "yeni konut projesi satarken müşteri kaydı nasıl korunur", cluster: "musteri-kayit", persona: ["danisman", "ofis"], niyet: "informational", isDeger: 3, stratejikFit: 0.95,
    projedarCevap: "Müşteri kaydı/claim proje bazında korunur; conflict tespiti danışman hakkını korur.", cta: "/emlakci", url: "/rehber/musteri-kaydi-koruma", pillar: true },
  { sorgu: "emlakçı müşteri kaydı nasıl yönetilir", cluster: "musteri-kayit", persona: ["muteahhit", "ofis"], niyet: "informational", isDeger: 2, stratejikFit: 0.9,
    projedarCevap: "Üretici panelinden claim/opsiyon görünür; kimin neyi gördüğü tek kaynakta.", cta: "/muteahhit", url: "/rehber/emlakci-musteri-kaydi-yonetimi", pillar: false },
];

const KOMISYON: TerritoryGirdi[] = [
  { sorgu: "emlak danışmanının proje satış komisyonu nasıl korunur", cluster: "komisyon-hakedis", persona: ["danisman"], niyet: "informational", isDeger: 3, stratejikFit: 0.95,
    projedarCevap: "Komisyonu müteahhit tanımlar, Projedar bu komisyona ortak olmaz; kazancın %100'ü senin.", cta: "/emlakci", url: "/rehber/proje-satis-komisyonu-koruma", pillar: true },
  { sorgu: "müteahhit projelerinde emlakçı komisyonu nasıl işler", cluster: "komisyon-hakedis", persona: ["danisman", "ofis"], niyet: "informational", isDeger: 3, stratejikFit: 0.93,
    projedarCevap: "komisyon_tip/deger DB'de; hakediş satışa bağlı, şeffaf takip.", cta: "/emlakci", url: "/rehber/muteahhit-projesi-emlakci-komisyonu", pillar: false },
  { sorgu: "emlakçı komisyon hakedişi nasıl yönetilir", cluster: "komisyon-hakedis", persona: ["muteahhit", "satis-yoneticisi"], niyet: "informational", isDeger: 2, stratejikFit: 0.9,
    projedarCevap: "Müteahhit her danışmana komisyon tanımlar; hakediş satışla tetiklenir.", cta: "/muteahhit", url: "/rehber/komisyon-hakedis-yonetimi", pillar: false },
];

// ── 3) ÜRÜN MEKANİZMASI (tahsis & opsiyon — güven protokolü) ─────────────────────────────────
const MEKANIZMA: TerritoryGirdi[] = [
  { sorgu: "daire tahsisi nedir", cluster: "tahsis-opsiyon", persona: ["danisman", "muteahhit"], niyet: "informational", isDeger: 2, stratejikFit: 0.92,
    projedarCevap: "Üreticinin bir birimi belirli emlakçı(lar)a görünür/satılabilir kılması.", cta: "/nedir", url: "/sozluk/daire-tahsisi", pillar: false },
  { sorgu: "proje satışında opsiyon nedir", cluster: "tahsis-opsiyon", persona: ["danisman"], niyet: "informational", isDeger: 2, stratejikFit: 0.92,
    projedarCevap: "48 saatlik geçici kilit; opsiyon DB'de tutulur, çift-satışı engeller.", cta: "/emlakci", url: "/sozluk/opsiyon", pillar: false },
  { sorgu: "daire tahsis sistemi nasıl kurulur", cluster: "tahsis-opsiyon", persona: ["muteahhit", "satis-yoneticisi"], niyet: "informational", isDeger: 3, stratejikFit: 0.9,
    projedarCevap: "Tek panelden proje/blok/kat/birim bazında granüler tahsis + görünürlük kontrolü.", cta: "/muteahhit", url: "/rehber/daire-tahsis-sistemi", pillar: true },
  { sorgu: "konut projesi emlakçı ağına nasıl açılır", cluster: "tahsis-opsiyon", persona: ["muteahhit"], niyet: "commercial", isDeger: 3, stratejikFit: 0.92,
    projedarCevap: "Stoğu partiler halinde tahsisle ağa aç; kontrol sende, dağıtım çok-emlakçıda.", cta: "/muteahhit", url: "/rehber/projeyi-emlakci-agina-acmak", pillar: false },
  { sorgu: "güven protokolü konut satışı", cluster: "tahsis-opsiyon", persona: ["danisman", "muteahhit"], niyet: "informational", isDeger: 2, stratejikFit: 0.9,
    projedarCevap: "Doğrulanmış üretici + tazelik rozeti + DB çift-satış kalkanı = güven protokolü.", cta: "/guven", url: "/guven", pillar: true },
];

// ── 4) MÜTEAHHİT B2B (düşük hacim / yüksek ticari değer — ana kanal SEO olmasa da sayfası yapılır) ──
const MUTEAHHIT_B2B: TerritoryGirdi[] = [
  { sorgu: "emlakçılarla proje satışı nasıl yönetilir", cluster: "canli-stok", persona: ["muteahhit", "satis-yoneticisi"], niyet: "commercial", isDeger: 3, stratejikFit: 0.95,
    projedarCevap: "Tek panelden stok+fiyat+tahsis+komisyon+claim; çok-emlakçı tek canlı gerçekte.", cta: "/muteahhit", url: "/rehber/emlakci-ile-proje-satisi-yonetimi", pillar: true },
  { sorgu: "konut projesi satış kanalları nelerdir", cluster: "canli-stok", persona: ["muteahhit"], niyet: "informational", isDeger: 2, stratejikFit: 0.85,
    projedarCevap: "Kontrollü çok-emlakçı ağ = ilan portalına göre kontrol+hız+güven.", cta: "/muteahhit", url: "/rehber/konut-projesi-satis-kanallari", pillar: false },
  { sorgu: "konut projesi nasıl daha hızlı satılır", cluster: "canli-stok", persona: ["muteahhit", "satis-yoneticisi"], niyet: "commercial", isDeger: 3, stratejikFit: 0.85,
    projedarCevap: "Aynı stoğu güvenle çok-emlakçıya dağıt; çift-satış imkânsız + canlı tazelik.", cta: "/muteahhit", url: "/rehber/konut-projesi-hizli-satis", pillar: false },
];

export const TERRITORY: TerritoryGirdi[] = [
  ...KATEGORI, ...CANLI_STOK, ...MUSTERI_KAYIT, ...KOMISYON, ...MEKANIZMA, ...MUTEAHHIT_B2B,
];

/** Arz sahipliği = programmatic mimari (query satırı değil, URL şablonu). Zaten kısmen kurulu. */
export const ARZ_MIMARI = {
  hub: "/konut-projeleri",
  il: "/konut-projeleri/[il]",
  ilce: "/konut-projeleri/[il]/[ilce]",
  proje: "/proje/[slug]",
  firma: "/firma/[slug]",
  not: "1000 gerçek varlık sayfası (proje/müteahhit/lokasyon/daire tipi/teslim/stok) > 1000 jenerik blog. İçerik-eşiği + gradual-index zaten var (sitemap.ts, icerik-esigi.ts).",
} as const;

const GATE2_PERSONALAR: Persona[] = ["danisman", "ofis", "muteahhit", "satis-yoneticisi", "nitelikli-alici"];

/** Strategic-fit gate (hacimden ÖNCE). must-have olabilmek için 3 gate'i de geçmeli. */
export function gateGecer(g: TerritoryGirdi): boolean {
  const gate1 = g.stratejikFit >= 0.8;
  const gate2 = g.persona.some((p) => GATE2_PERSONALAR.includes(p));
  const gate3 = g.projedarCevap.trim().length > 0;
  return gate1 && gate2 && gate3;
}

export function mustHaveEvreni(harita: TerritoryGirdi[] = TERRITORY): TerritoryGirdi[] {
  return harita.filter(gateGecer);
}

export function pillarlar(harita: TerritoryGirdi[] = TERRITORY): TerritoryGirdi[] {
  return harita.filter((g) => g.pillar && gateGecer(g));
}
