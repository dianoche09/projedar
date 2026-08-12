import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AgBuyuyor } from "@/components/landing/AgBuyuyor";

/**
 * Site geneli kapanış footer'ı = anasayfadaki "Ağ büyüyor" görsel bölümü
 * (AgBuyuyor: rol kartları + CTA) + altında koyu footer menüsü.
 *
 * Tüm sayfalarda ortak kullanılır (anasayfa, içerik yüzeyi, ...). Kaynaklar
 * menüsü sektörel içerik yüzeyine açılır (yalnız yayında kategoriler).
 */
const KESFET: [string, string][] = [
  ["Konut projeleri", "/konut-projeleri"],
  ["Müteahhitler için", "/muteahhit"],
  ["Danışmanlar için", "/emlakci"],
  ["Nedir", "/nedir"],
  ["Rehberler", "/rehber"],
  ["Güven", "/guven"],
];

const YASAL: [string, string][] = [
  ["Kullanım Koşulları", "/kullanim-kosullari"],
  ["Gizlilik", "/gizlilik"],
  ["KVKK Aydınlatma", "/kvkk-aydinlatma"],
];

function KoyuFooter() {
  return (
    <footer className="relative mt-auto border-t border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-5 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Logo size={24} wordmark acik />
          <p className="max-w-xs text-center text-xs leading-relaxed text-white/60 md:text-left">
            Proje sahibi ve gayrimenkul danışmanlarını canlı, doğru veriyle buluşturan konut stoğu
            dağıtım ağı.
          </p>
        </div>
        <div className="flex flex-col gap-8 text-center sm:flex-row sm:gap-14 md:text-left">
          <nav aria-label="Keşfet" className="flex flex-col gap-2.5">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-white/45">
              Keşfet
            </p>
            {KESFET.map(([etiket, href]) => (
              <Link
                key={href}
                href={href}
                className="text-[13px] font-medium text-white/70 transition-colors duration-200 hover:text-white hover:underline"
              >
                {etiket}
              </Link>
            ))}
          </nav>
          <nav aria-label="Yasal" className="flex flex-col gap-2.5">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-white/45">
              Yasal
            </p>
            {YASAL.map(([etiket, href]) => (
              <Link
                key={href}
                href={href}
                className="text-[13px] font-medium text-white/70 transition-colors duration-200 hover:text-white hover:underline"
              >
                {etiket}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-[11px] text-white/45 sm:px-6">
        © 2026 Projedar, Tüm hakları saklıdır.
      </div>
    </footer>
  );
}

/** Anasayfadaki tam kapanış alanı (görsel CTA + footer). Her sayfada ortak. */
export function KapanisFooter() {
  return <AgBuyuyor altKisim={<KoyuFooter />} />;
}
