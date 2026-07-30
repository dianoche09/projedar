"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

/**
 * Final CTA · bina görseli geri döner, bu kez tek kule değil bütün mahalle:
 * ağ büyümüş hissi. Kulelerin üzerinde nabız atan sinyal noktaları.
 * Görsel lazy yüklenir; reduced-motion'da noktalar statik.
 */

const NOKTALAR: { x: string; y: string; renk: string; gecikme: number }[] = [
  { x: "24%", y: "56%", renk: "#2fb36b", gecikme: 0 },
  { x: "37%", y: "50%", renk: "#3fbfae", gecikme: 0.6 },
  { x: "50%", y: "48%", renk: "#2fb36b", gecikme: 1.1 },
  { x: "61%", y: "52%", renk: "#e3a12c", gecikme: 1.7 },
  { x: "76%", y: "47%", renk: "#2fb36b", gecikme: 2.3 },
  { x: "88%", y: "58%", renk: "#3fbfae", gecikme: 2.9 },
];

export function AgBuyuyor({ altKisim }: { altKisim?: React.ReactNode } = {}) {
  const azHareket = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-t border-white/[0.06]">
      <style>{`
        @keyframes ppAgNabiz {
          0% { box-shadow: 0 0 0 0 var(--pp-renk); opacity: 1; }
          70% { box-shadow: 0 0 0 10px transparent; opacity: 0.85; }
          100% { box-shadow: 0 0 0 0 transparent; opacity: 1; }
        }
        .pp-ag-nokta { animation: ppAgNabiz 3.2s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .pp-ag-nokta { animation: none; } }
      `}</style>

      <div className="relative min-h-[86svh]">
        <Image
          src="/generated/mockup-04/final-ag.jpg"
          alt="Gece sisinde ışıkları yanan birden çok konut kulesi, büyüyen bir ağ"
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* okunurluk perdesi */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #081220 0%, rgba(8,18,32,0.42) 30%, rgba(8,18,32,0.30) 55%, rgba(8,18,32,0.9) 100%)",
          }}
        />

        {/* kulelerin üzerinde ağ sinyalleri */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {NOKTALAR.map((n, i) => (
            <span
              key={i}
              className="pp-ag-nokta absolute size-2 rounded-full"
              style={
                {
                  left: n.x,
                  top: n.y,
                  background: n.renk,
                  animationDelay: `${n.gecikme}s`,
                  "--pp-renk": `${n.renk}77`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className="relative mx-auto flex min-h-[86svh] w-full max-w-6xl flex-col items-center justify-center px-5 py-24 text-center">
          <motion.div
            initial={azHareket ? false : { opacity: 0, y: 28 }}
            whileInView={azHareket ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full max-w-4xl flex-col items-center"
          >
            <p className="mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3fbfae]">
              Ağ büyüyor
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-[#ece9e2] sm:text-5xl">
              Her akşam biraz daha fazla ışık bu ağa bağlanıyor.
            </h2>
            <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-white/65">
              Stoğunuz yaşayan bir ağda dolaşsın: doğru danışmanda, doğru
              fiyatla, her zaman taze. Projeniz de bu ışıklardan biri olsun.
            </p>
            {/* rol kartları (m2 "Hangi taraftasınız?" içeriği, kullanıcı isteğiyle butonların yerinde) */}
            <div className="mt-10 grid w-full gap-5 text-left lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-[rgba(10,22,36,0.82)] backdrop-blur-sm">
                <div className="h-[3px] bg-gradient-to-r from-[#1e9b8a] to-[#2fb36b]" aria-hidden />
                <div className="p-6 sm:p-7">
                  <h3 className="font-display text-xl font-extrabold tracking-tight text-[#ece9e2]">Proje Sahibiyim</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/65">
                    Bloklarınızı, katlarınızı, birimlerinizi tek panelden yönetin. Fiyatı siz güncellersiniz,
                    hangi danışman neyi görecek siz seçersiniz. Her paylaşım canlı fiyattan basılır, her hareket iz bırakır.
                  </p>
                  <p className="mono mt-4 text-[11.5px] tracking-wide text-[#3fbfae]">stok · fiyat · tahsis · opsiyon · rapor</p>
                  <Link
                    href="/kayit?rol=uretici"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-[13px] bg-[#1e9b8a] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#1a8676]"
                  >
                    Projemi Yükle →
                  </Link>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-[rgba(10,22,36,0.82)] backdrop-blur-sm">
                <div className="h-[3px] bg-gradient-to-r from-[#1e9b8a] to-[#2fb36b]" aria-hidden />
                <div className="p-6 sm:p-7">
                  <h3 className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-[#ece9e2]">
                    Danışmanım
                    <span className="rounded-full border border-[#2fb36b]/50 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#2fb36b]">Ücretsiz</span>
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/65">
                    Size tahsisli projeleri tek canlı havuzda görün. &quot;Müsait mi?&quot; diye kimseyi aramayın:
                    durum ekranda, fiyat günceldir. Tek dokunuşla paylaşın, opsiyonu anında kilitleyin.
                  </p>
                  <p className="mono mt-4 text-[11.5px] tracking-wide text-[#3fbfae]">havuz · paylaş · opsiyon · lead</p>
                  <Link
                    href="/kayit?rol=emlakci"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-[13px] border border-white/30 px-6 text-[14px] font-semibold text-[#ece9e2] transition-colors hover:border-white/60"
                  >
                    Havuza Katıl →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* isteğe bağlı alt kısım: ana sayfada footer bu görselle birleşir */}
        {altKisim}
      </div>
    </section>
  );
}
