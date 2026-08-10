import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Building2,
  ClipboardList,
  Lock,
  Rocket,
  TrendingUp,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Projedar · Sunumlar",
  robots: { index: false, follow: false },
};

type Sunum = { href: string; ad: string; aciklama: string; Ikon: typeof Rocket };

const YATIRIMCI: Sunum[] = [
  { href: "/sunum/v2/pitch", ad: "Yatırımcı Sunumu", aciklama: "Sorun, çözüm, pazar, iş modeli, ekip ve yatırım.", Ikon: Rocket },
  { href: "/sunum/v2/finansal", ad: "Finansal Projeksiyon", aciklama: "24 aylık plan, üç gelir akışı, senaryolar ve yatırım.", Ikon: TrendingUp },
  { href: "/sunum/v2/is-plani", ad: "İş Planı", aciklama: "Tam iş planı: pazar, gelir, pazara giriş, ekip ve risk.", Ikon: ClipboardList },
  { href: "/sunum/v2/gtm", ad: "Pazara Giriş", aciklama: "Coğrafi sıralama, kanallar, büyüme motoru, fiyatlama.", Ikon: Banknote },
];

const TANITIM: Sunum[] = [
  { href: "/sunum/v2/uretici", ad: "Proje Sahipleri İçin", aciklama: "Müteahhitlere ürün tanıtımı: stok, tahsis, opsiyon, satış.", Ikon: Building2 },
  { href: "/sunum/v2/emlakci", ad: "Gayrimenkul Danışmanları İçin", aciklama: "Danışmanlara ürün tanıtımı: canlı stok, birebir paylaşım.", Ikon: Users },
];

function Kart({ href, ad, aciklama, Ikon }: Sunum) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-white/10 bg-[#101f30] p-5 transition-all hover:-translate-y-0.5 hover:border-[#2fd3bc]/40 hover:bg-[#132639]"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2fd3bc]/12 text-[#2fd3bc]">
          <Ikon className="h-5 w-5" />
        </span>
        <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-white/35 group-hover:text-[#2fd3bc]">
          <Lock className="h-3.5 w-3.5" />
          Parolalı
        </span>
      </div>
      <h3 className="mt-4 text-[17px] font-semibold text-white">{ad}</h3>
      <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-white/55">{aciklama}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2fd3bc]">
        Aç
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export default function SunumIndex() {
  return (
    <main className="min-h-screen bg-[#0b1622] px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <p className="font-display text-[26px] font-extrabold tracking-tight text-white">
            proje<span className="text-[#2fd3bc]">dar</span>
          </p>
          <h1 className="font-display mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Sunumlar</h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/55">
            Bir sunuma tıklayın. Açmak için erişim parolası gerekir; parolayı bir kez girmeniz yeterli.
          </p>
        </header>

        <section className="mt-12">
          <h2 className="mono mb-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[#2fd3bc]">Yatırımcı sunumları</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {YATIRIMCI.map((s) => (
              <Kart key={s.href} {...s} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mono mb-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[#2fd3bc]">Ürün tanıtım sunumları</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {TANITIM.map((s) => (
              <Kart key={s.href} {...s} />
            ))}
          </div>
        </section>

        <p className="mt-14 text-center text-[12px] text-white/30">© 2026 Projedar · projedar.com</p>
      </div>
    </main>
  );
}
