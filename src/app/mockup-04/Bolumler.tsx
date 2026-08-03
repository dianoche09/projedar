"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Lock } from "lucide-react";

/**
 * Mockup-04 ara bölümleri: nedir, bozuk sistem, opsiyon koreografisi,
 * tahsis, iki taraf, ilan portalı değil. Koyu sinematik zemin üzerinde
 * kırık beyaz metin, teal aksan, SABİT sinyal renkleri. Veriler örnektir.
 */

const YESIL = "#2fb36b";
const AMBER = "#e3a12c";
const KIRMIZI = "#d15a4e";
const TEAL = "#3fbfae";

function Gorun({
  children,
  gecikme = 0,
  className,
}: {
  children: React.ReactNode;
  gecikme?: number;
  className?: string;
}) {
  const azHareket = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={azHareket ? false : { opacity: 0, y: 26 }}
      whileInView={azHareket ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay: gecikme, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function BolumBaslik({
  etiket,
  baslik,
  aciklama,
}: {
  etiket: string;
  baslik: string;
  aciklama?: string;
}) {
  return (
    <Gorun className="max-w-2xl">
      <p className="mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3fbfae]">{etiket}</p>
      <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#ece9e2] sm:text-4xl">
        {baslik}
      </h2>
      {aciklama ? <p className="mt-3 text-[15px] leading-relaxed text-white/60">{aciklama}</p> : null}
    </Gorun>
  );
}

/* ---- 1 · nedir: tanım şeridi ---- */
export function NedirSeridi() {
  return (
    <section className="border-t border-white/[0.06] bg-[#0a1626]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:py-20 md:grid-cols-[1.25fr_1fr] md:gap-14">
        <Gorun>
          <p className="mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3fbfae]">Nedir</p>
          <p className="mt-4 font-display text-xl font-bold leading-relaxed tracking-tight text-[#ece9e2] sm:text-2xl">
            Projedar, çok müteahhitli ve üretici kontrollü bir canlı konut
            stoğu dağıtım ağıdır. Üretici stoğu, fiyatı ve dağıtımı tek noktadan
            yönetir; danışman yalnız kendisine tahsisli projeleri tek canlı
            havuzdan görür ve paylaşır.
          </p>
        </Gorun>
        <Gorun gecikme={0.12} className="flex flex-col justify-center gap-4">
          {(
            [
              ["01", "Tek doğru kaynak", "Fiyat ve durum yalnız birim kaydında yaşar. Kopya liste yok."],
              ["02", "Çift satış kalkanı", "Opsiyon kilidi veritabanı seviyesinde. İkincisi imkansız."],
              ["03", "Görünür tazelik", "Her veri 'X önce' etiketi taşır. Bayat liste kendini belli eder."],
            ] as const
          ).map(([no, b, a]) => (
            <div key={no} className="flex gap-4 border-b border-white/[0.07] pb-4 last:border-b-0 last:pb-0">
              <span className="mono flex-none text-[12px] font-semibold text-[#3fbfae]">{no}</span>
              <div>
                <p className="text-[14.5px] font-bold text-[#ece9e2]">{b}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-white/55">{a}</p>
              </div>
            </div>
          ))}
        </Gorun>
      </div>
    </section>
  );
}

/* ---- 2 · bozuk sistem ---- */
export function BozukSistem() {
  const kartlar = [
    {
      renk: KIRMIZI,
      baslik: "Ölü PDF listeler",
      metin: "Fiyat listesi dışarı çıktığı an eskimeye başlar. Danışman, üç hafta önceki dosyayla satış yapmaya çalışır.",
      dip: "son güncelleme: 21 gün önce",
    },
    {
      renk: AMBER,
      baslik: "Çift satış riski",
      metin: "Aynı daireye iki ayrı kapora. Telefon trafiği, iade, özür, itibar kaybı. Sistem yoksa şans vardır.",
      dip: "D-4-1: 2 alıcı, 1 daire",
    },
    {
      renk: KIRMIZI,
      baslik: "WhatsApp kaosu",
      metin: "Stok soruları kırk gruba dağılır. Kim neyi gördü, hangi fiyat güncel, kimse bilmez.",
      dip: "“D blokta 3+1 kaldı mı?” × 27",
    },
  ];
  return (
    <section className="border-t border-white/[0.06]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
        <BolumBaslik
          etiket="Bozuk sistem"
          baslik="PDF fiyat listesi öldüğü an, satış da ölür."
          aciklama="Yeni konut stoğu bugün kopyala-yapıştır listeler ve mesaj gruplarıyla dağılıyor. Işıklar gerçek, veri değil."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kartlar.map((k, i) => (
            <Gorun key={k.baslik} gecikme={i * 0.1}>
              <article className="relative h-full overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b1a2b] p-5">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ background: k.renk, opacity: 0.85 }}
                />
                <h3 className="text-[16px] font-bold text-[#ece9e2]">{k.baslik}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{k.metin}</p>
                <p className="mono mt-4 inline-flex items-center gap-1.5 text-[10.5px]" style={{ color: k.renk }}>
                  <span className="size-1.5 rounded-full" style={{ background: k.renk }} /> {k.dip}
                </p>
              </article>
            </Gorun>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- 3 · opsiyon kilidi koreografisi ---- */
export function OpsiyonKoreografisi() {
  const adimlar = [
    {
      no: "01",
      baslik: "Danışman dokunur",
      metin: "Müsait daireye tek dokunuş. Hücre yeşilden ambere döner, sayaç başlar.",
    },
    {
      no: "02",
      baslik: "Veritabanı kilitler",
      metin: "Kilit uygulama katmanında değil, DB'de. Aktif opsiyon için ikinci kayıt fiziksel olarak imkansız.",
      kod: "unique index · aktif opsiyon",
    },
    {
      no: "03",
      baslik: "Ağ aynı anda görür",
      metin: "Diğer bütün ekranlarda hücre o saniye kilitli görünür. Telefonla teyit devri kapanır.",
    },
  ];
  return (
    <section className="border-t border-white/[0.06] bg-[#0a1626]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
        <BolumBaslik
          etiket="Opsiyon kilidi"
          baslik="Tek dokunuş, bütün ağda kilit."
          aciklama="Opsiyon bir söz değil, bir kayıttır. 48 saat boyunca daire size aittir; süre dolarsa kilit kendiliğinden çözülür."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {adimlar.map((a, i) => (
            <Gorun key={a.no} gecikme={i * 0.1}>
              <article className="h-full rounded-2xl border border-white/[0.09] bg-[#0b1a2b] p-5">
                <div className="flex items-center justify-between">
                  <span className="mono text-[12px] font-semibold text-[#3fbfae]">{a.no}</span>
                  {i === 0 ? (
                    <span className="flex items-center gap-1" aria-hidden>
                      <span className="size-3 rounded-[4px]" style={{ background: YESIL }} />
                      <span className="mono text-[10px] text-white/40">→</span>
                      <span
                        className="flex size-3 items-center justify-center rounded-[4px]"
                        style={{ background: AMBER }}
                      >
                        <Lock size={7} strokeWidth={3} className="text-[#081220]" />
                      </span>
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-3 text-[16px] font-bold text-[#ece9e2]">{a.baslik}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{a.metin}</p>
                {a.kod ? (
                  <code className="mono mt-4 inline-block rounded-lg border border-[#3fbfae]/30 bg-[#3fbfae]/10 px-2.5 py-1.5 text-[10.5px] font-semibold text-[#3fbfae]">
                    {a.kod}
                  </code>
                ) : null}
              </article>
            </Gorun>
          ))}
        </div>
        <Gorun gecikme={0.2}>
          <p className="mono mt-6 text-[11px] text-white/40">
            48 saat dolarsa: kilit çözülür, hücre yeşile döner, akışa not düşer. İnsan hatasına yer yok.
          </p>
        </Gorun>
      </div>
    </section>
  );
}

/* ---- 4 · tahsis ---- */
export function TahsisBolumu() {
  /* soyut cephe ızgarası: 6 sütun × 8 kat, örnek dağılım */
  const satirlar = Array.from({ length: 8 }, (_, r) => r);
  const sutunlar = Array.from({ length: 6 }, (_, c) => c);
  const hucreRenk = (r: number, c: number): string => {
    if (r < 4) return ((r * 7 + c * 3) % 5 < 3 ? YESIL : (r + c) % 2 ? AMBER : KIRMIZI);
    if (c < 3) return ((r * 5 + c * 11) % 4 < 3 ? YESIL : AMBER);
    return "rgba(236,233,226,0.10)";
  };
  return (
    <section className="border-t border-white/[0.06]">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-2">
        <Gorun>
          <div className="rounded-2xl border border-white/[0.09] bg-[#0b1a2b] p-5 sm:p-6">
            <p className="mono mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              A Blok · tahsis haritası (örnek)
            </p>
            <div className="flex flex-col gap-4">
              {/* grup 1: üst 4 kat */}
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-xl border-2 border-[#3fbfae]/70 p-2">
                  <div className="grid grid-cols-6 gap-1.5">
                    {satirlar.slice(0, 4).flatMap((r) =>
                      sutunlar.map((c) => (
                        <span
                          key={`${r}-${c}`}
                          className="h-4 rounded-[4px]"
                          style={{ background: hucreRenk(r, c), opacity: 0.9 }}
                          aria-hidden
                        />
                      )),
                    )}
                  </div>
                </div>
                <span aria-hidden className="hidden h-px w-6 flex-none border-t border-dashed border-[#3fbfae]/60 sm:block" />
                <span className="mono flex-none rounded-lg border border-[#3fbfae]/40 bg-[#3fbfae]/10 px-2.5 py-1.5 text-[10.5px] font-semibold text-[#3fbfae]">
                  Yılmaz Emlak
                  <span className="block text-[9px] font-medium text-[#3fbfae]/70">9-12. katlar</span>
                </span>
              </div>
              {/* grup 2: alt 4 kat, sol 3 sütun */}
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-xl p-2" style={{ border: "2px solid rgba(236,233,226,0.28)" }}>
                  <div className="grid grid-cols-6 gap-1.5">
                    {satirlar.slice(4).flatMap((r) =>
                      sutunlar.map((c) => (
                        <span
                          key={`${r}-${c}`}
                          className="h-4 rounded-[4px]"
                          style={{ background: hucreRenk(r, c), opacity: c < 3 ? 0.9 : 1 }}
                          aria-hidden
                        />
                      )),
                    )}
                  </div>
                </div>
                <span aria-hidden className="hidden h-px w-6 flex-none border-t border-dashed border-white/40 sm:block" />
                <span className="mono flex-none rounded-lg border border-white/25 bg-white/[0.05] px-2.5 py-1.5 text-[10.5px] font-semibold text-[#ece9e2]">
                  Kaya Emlak
                  <span className="block text-[9px] font-medium text-white/50">5-8. kat, batı kanat</span>
                </span>
              </div>
            </div>
            <p className="mono mt-4 flex items-center gap-1.5 text-[10px] text-white/35">
              <span className="size-2 rounded-[3px] bg-[rgba(236,233,226,0.10)]" /> soluk hücreler: havuza kapalı, kimseye görünmez
            </p>
          </div>
        </Gorun>
        <Gorun gecikme={0.12}>
          <p className="mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3fbfae]">Tahsis</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#ece9e2] sm:text-4xl">
            Herkes her şeyi görmez. Görünürlük, tahsisin ta kendisi.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/60">
            Üretici blok, kat, hatta daire hassasiyetinde karar verir: hangi
            danışman grubu neyi görür, neyi paylaşır. Tahsis dışı stok o ekranda
            hiç var olmaz.
          </p>
          <ul className="mono mt-6 space-y-2.5 text-[12px] text-white/55">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#3fbfae]" /> satır seviyesinde güvenlik: görünürlük DB kuralı
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#3fbfae]" /> tahsis anında açılır, anında geri alınır
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#3fbfae]" /> her paylaşım canlı fiyattan basılır
            </li>
          </ul>
        </Gorun>
      </div>
    </section>
  );
}

/* ---- 5 · iki taraf ---- */
export function IkiTarafBolumu() {
  const taraflar = [
    {
      renk: TEAL,
      rol: "Üretici",
      baslik: "Stok sizde, kontrol sizde.",
      maddeler: [
        "Fiyatı bir kez güncellersiniz, her ekranda o saniye değişir",
        "Tahsisi blok, kat, daire hassasiyetinde siz yönetirsiniz",
        "Her opsiyon, satış ve paylaşım saniyesiyle kayıtta",
        "Concierge kurulum: listenizi biz taşırız",
      ],
      cta: "Projemi canlı ağa aç",
    },
    {
      renk: YESIL,
      rol: "Danışman",
      baslik: "Elinizde her zaman doğru stok.",
      maddeler: [
        "Yalnız size tahsisli projeler, tek canlı havuzda",
        "Bayat PDF yok: fiyat her açılışta canlı değerden gelir",
        "Tek dokunuş opsiyon, 48 saat garanti kilit",
        "Erken dönem danışman hesabı ücretsiz",
      ],
      cta: "Danışman olarak katıl",
    },
  ];
  return (
    <section className="border-t border-white/[0.06] bg-[#0a1626]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
        <BolumBaslik
          etiket="İki taraf"
          baslik="Aynı ağ, iki ayrı kokpit."
          aciklama="Üretici dağıtımı yönetir, danışman satışa odaklanır. İkisi de aynı tek doğruya bakar."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {taraflar.map((t, i) => (
            <Gorun key={t.rol} gecikme={i * 0.12}>
              <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b1a2b] p-6">
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: t.renk, opacity: 0.85 }} />
                <p className="mono text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: t.renk }}>
                  {t.rol}
                </p>
                <h3 className="mt-2 font-display text-xl font-extrabold tracking-tight text-[#ece9e2]">{t.baslik}</h3>
                <ul className="mt-4 flex-1 space-y-2.5">
                  {t.maddeler.map((m) => (
                    <li key={m} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-white/60">
                      <span className="mt-[7px] size-1.5 flex-none rounded-full" style={{ background: t.renk }} />
                      {m}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/kayit"
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-[13px] border text-[13.5px] font-semibold transition-colors"
                  style={{ borderColor: `${t.renk}66`, color: t.renk }}
                >
                  {t.cta}
                </Link>
              </article>
            </Gorun>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- 6 · ilan portalı değil ---- */
export function PortalDegil() {
  return (
    <section className="border-t border-white/[0.06]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
        <BolumBaslik
          etiket="Konum"
          baslik="İlan portalı değil. Altyapı."
          aciklama="Vitrin yarışı satmaz; doğru ve taze stok satar. Projedar görünmeyen katmandır: boru hattı, reklam panosu değil."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Gorun>
            <div className="h-full rounded-2xl border border-white/[0.09] bg-[#0b1a2b] p-6">
              <p className="mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d15a4e]">Burada olmayan</p>
              <ul className="mt-4 space-y-3">
                {["İlan yarışı ve vitrin sıralaması", "Satıştan komisyon", "Doping, öne çıkarma, reklam paketi", "Müşteri verisi pazarı"].map(
                  (m) => (
                    <li key={m} className="flex items-center gap-2.5 text-[13.5px] text-white/55">
                      <span className="mono flex size-4 flex-none items-center justify-center rounded-full border border-[#d15a4e]/50 text-[9px] font-bold text-[#d15a4e]">
                        ×
                      </span>
                      {m}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </Gorun>
          <Gorun gecikme={0.12}>
            <div className="h-full rounded-2xl border border-[#3fbfae]/25 bg-[#0b1a2b] p-6">
              <p className="mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3fbfae]">Burada olan</p>
              <ul className="mt-4 space-y-3">
                {["Canlı stok dağıtım ağı", "Üretici kontrolü ve granüler tahsis", "DB seviyesinde çift satış kalkanı", "Doğrulanmış üye, güven protokolü"].map(
                  (m) => (
                    <li key={m} className="flex items-center gap-2.5 text-[13.5px] text-white/70">
                      <span className="size-1.5 flex-none rounded-full bg-[#3fbfae]" />
                      {m}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </Gorun>
        </div>
      </div>
    </section>
  );
}
