import { MessageCircle, Send, Link2, Check } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { MagneticButton } from "@/components/MagneticButton";

/**
 * "Tek tık · birebir paylaşım" vitrini. YASAL ÇERÇEVE (EİDS): kamuya açık sosyal feed'e
 * (Instagram/Facebook/X) fiyatlı daire postu = "ilan" riski (286K TL/paylaşım). Bu yüzden
 * odak WhatsApp / birebir (1:1) + link kopyala — danışmanın kişisel, birebir paylaşımı.
 * Fiyat canlı basılır, link birebir mikrosite (açık ilan havuzu değil).
 */
const KANALLAR = [
  { Icon: MessageCircle, ad: "WhatsApp", renk: "text-[#1f7d4c]", bg: "bg-[#e7f6ee]" },
  { Icon: Send, ad: "Telegram", renk: "text-[#2b7fb8]", bg: "bg-[#e7f1f8]" },
  { Icon: Link2, ad: "Bağlantı", renk: "text-ink-soft", bg: "bg-[var(--color-soft)]" },
];

const FAYDA: [string, string][] = [
  ["Daireyi seç, gönder", "Üç saniyede müşterinin telefonunda."],
  ["Fiyat her zaman canlı", "Eski fiyatla paylaşım riski yok — o anki değerden basılır."],
  ["Link birebir mikrosite", "Müşteri canlı detayı görür; açık ilan havuzu değil."],
];

export function BirebirPaylasim() {
  return (
    <section className="relative">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-2">
        {/* SOL — telefon mockup */}
        <Reveal>
          <div className="relative mx-auto w-full max-w-[320px]">
            <div className="rounded-[2.2rem] border-[7px] border-ink bg-ink p-2 shadow-[var(--golge-3)]">
              <div className="overflow-hidden rounded-[1.6rem] bg-white">
                <div className="flex items-center justify-between px-4 py-2 font-mono text-[10px] text-ink-soft">
                  <span>9:41</span>
                  <span aria-hidden>▪ ▪ ▪</span>
                </div>
                <div className="px-3 pb-3">
                  <div className="relative overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/gorseller/render-cankaya-vadi.jpg" alt="Örnek daire paylaşımı" loading="lazy" className="aspect-[16/10] w-full object-cover" />
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold text-[#1f7d4c]">
                      <span className="size-1.5 rounded-full bg-green nabiz" /> WhatsApp&apos;tan gönderildi
                    </span>
                  </div>
                  <div className="mt-2.5 rounded-xl border border-[var(--cizgi)] p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-ink">Çankaya Vadi · A-7-2</span>
                      <span className="text-[#1f7d4c]" aria-hidden>✓</span>
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-ink-soft">3+1 · 142 m² · Çankaya</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-lg font-semibold text-ink">₺8,75M</span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#1f7d4c]">
                        <span className="size-1.5 rounded-full bg-green nabiz" /> canlı · 2 dk
                      </span>
                    </div>
                    <div className="mt-2 rounded-md bg-[var(--color-soft)] px-2 py-1 text-center font-mono text-[10px] text-ink-soft">
                      projepazar.com/p/cankaya-vadi/a-7-2
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-around">
                    {KANALLAR.map(({ Icon, ad, renk, bg }) => (
                      <div key={ad} className="flex flex-col items-center gap-1">
                        <span className={`flex size-11 items-center justify-center rounded-2xl ${bg} ${renk}`}>
                          <Icon size={20} strokeWidth={2} />
                        </span>
                        <span className="font-mono text-[9px] text-ink-soft">{ad}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* SAĞ — metin */}
        <Reveal delay={120}>
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Tek tık · birebir paylaşım</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Beğendiğin daireyi, müşterine birebir gönder
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
              ProjePazar açık ilan yayınlamaz. Beğendiğin daireyi tek tıkla WhatsApp&apos;tan müşterine birebir
              gönderirsin; fiyat o anki <strong className="font-semibold text-ink">canlı değerden</strong> basılır, link
              birebir mikrosite. Açık ilan havuzu değil — <strong className="font-semibold text-ink">kişisel, birebir paylaşım</strong>.
            </p>
            <ul className="mt-6 space-y-3">
              {FAYDA.map(([b, a]) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-0.5 flex size-5 flex-none items-center justify-center rounded-full bg-[var(--color-teal-soft)] text-[var(--color-teal-d)]">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span className="text-sm text-ink-soft">
                    <strong className="font-semibold text-ink">{b}</strong> — {a}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <MagneticButton href="/kayit?rol=emlakci" className="btn-action">
                Ücretsiz danışman ol → paylaşmaya başla
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
