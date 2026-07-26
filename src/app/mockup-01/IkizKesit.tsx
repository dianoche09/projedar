"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";

/**
 * IkizKesit · Mockup 01 hero sahnesi: fiziksel kesit maketi + canlı veri katmanı.
 * Taban: gerçek maket fotoğrafı (public/generated/mockup-01/hero-kesit-maket.jpg,
 * sol üst negatif alan künye paneli için ayrılmış). Üstüne kod ile bindirilen
 * ikiz katmanı: durum noktaları, fiyat etiketi, kilit rozeti, olay halkası.
 * Örnek olay döngüsü pinleri canlı tutar: opsiyon -> fiyat -> ikinci opsiyon ->
 * satış -> süre dolumu -> senkron sıfırlama. Alt şeritte olay metni + sayaç.
 * prefers-reduced-motion: döngü çalışmaz, statik ikiz + açıklama kalır.
 * TÜM VERİLER ÖRNEKTİR.
 */

type Durum = "musait" | "opsiyon" | "satildi";

const RENK: Record<Durum, string> = {
  musait: "#2fb36b",
  opsiyon: "#e3a12c",
  satildi: "#d15a4e",
};

const ETIKET: Record<Durum, string> = {
  musait: "müsait",
  opsiyon: "opsiyon · kilitli",
  satildi: "satıldı",
};

/* maket üzerindeki veri pinleri (x/y: görsel yüzdesi) */
type Pin = { kod: string; x: number; y: number; durum: Durum; fiyat?: string };

const PINLER: Pin[] = [
  { kod: "A-5-2", x: 44, y: 26.5, durum: "musait", fiyat: "₺9,4M" },
  { kod: "A-5-3", x: 49.5, y: 24, durum: "opsiyon" },
  { kod: "A-4-1", x: 33.5, y: 35, durum: "musait" },
  { kod: "A-4-3", x: 49.5, y: 36, durum: "musait" },
  { kod: "A-3-2", x: 41, y: 47, durum: "satildi" },
  { kod: "A-2-3", x: 49.5, y: 59, durum: "musait" },
  { kod: "A-4-5", x: 65, y: 40, durum: "musait" },
  { kod: "A-2-6", x: 71, y: 62, durum: "opsiyon" },
];

type Olay = {
  kod: string | null;
  durum?: Durum;
  sifirla?: boolean;
  renk: string;
  metin: string;
  rozet?: string;
};

const OLAYLAR: Olay[] = [
  { kod: "A-4-3", durum: "opsiyon", renk: "#e3a12c", metin: "A-4-3 opsiyonlandı · 48 saat kilit", rozet: "opsiyon · kilitli" },
  { kod: "A-2-3", renk: "#1e9b8a", metin: "A-2-3 fiyatı güncellendi · ağ yeni değeri okudu", rozet: "₺9,1M · şimdi" },
  { kod: "A-4-5", durum: "opsiyon", renk: "#e3a12c", metin: "A-4-5 opsiyonlandı · Kaya Emlak", rozet: "opsiyon · kilitli" },
  { kod: "A-4-3", durum: "satildi", renk: "#d15a4e", metin: "A-4-3 satıldı · tüm havuzlardan düştü", rozet: "satıldı" },
  { kod: "A-4-5", durum: "musait", renk: "#2fb36b", metin: "A-4-5 opsiyon süresi doldu · yeniden müsait", rozet: "müsait" },
  { kod: null, sifirla: true, renk: "#1e9b8a", metin: "örnek döngü başa sarıldı · ikiz senkron" },
];

const TABAN_DURUM: Record<string, Durum> = Object.fromEntries(PINLER.map((p) => [p.kod, p.durum]));

export function IkizKesit() {
  const [pinDurum, setPinDurum] = useState<Record<string, Durum>>(TABAN_DURUM);
  const [olayIdx, setOlayIdx] = useState(-1);
  const [sn, setSn] = useState(0);
  const [statik, setStatik] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      /* hydration sonrası tek kare ertele: senkron setState cascade'i yok */
      const kare = requestAnimationFrame(() => setStatik(true));
      return () => cancelAnimationFrame(kare);
    }
    let i = -1;
    const olaySayaci = setInterval(() => {
      i = (i + 1) % OLAYLAR.length;
      const o = OLAYLAR[i];
      setOlayIdx(i);
      setSn(0);
      if (o.sifirla) {
        setPinDurum({ ...TABAN_DURUM });
      } else {
        const kod = o.kod;
        const durum = o.durum;
        if (kod && durum) setPinDurum((eski) => ({ ...eski, [kod]: durum }));
      }
    }, 2800);
    const saniye = setInterval(() => setSn((s) => Math.min(s + 1, 59)), 1000);
    return () => {
      clearInterval(olaySayaci);
      clearInterval(saniye);
    };
  }, []);

  const aktifOlay = olayIdx >= 0 ? OLAYLAR[olayIdx] : null;
  const aktifPin = aktifOlay?.kod ? PINLER.find((p) => p.kod === aktifOlay.kod) : null;

  return (
    <div className="relative">
      {/* katmanlı derinlik: arkadaki kayık çerçeveler */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-[2px] border-[1.5px] border-[rgba(16,36,58,0.16)] sm:translate-x-3 sm:translate-y-3"
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden rounded-[2px] border border-[rgba(16,36,58,0.08)] sm:block sm:translate-x-6 sm:translate-y-6"
      />

      <div className="dt-cerceve dt-perspektif relative p-2 sm:p-2.5">
        {/* köşe kayıt işaretleri */}
        <span aria-hidden className="absolute -left-[5px] -top-[5px] size-3 border-l-[1.5px] border-t-[1.5px] border-ink" />
        <span aria-hidden className="absolute -right-[5px] -top-[5px] size-3 border-r-[1.5px] border-t-[1.5px] border-ink" />
        <span aria-hidden className="absolute -bottom-[5px] -left-[5px] size-3 border-b-[1.5px] border-l-[1.5px] border-ink" />
        <span aria-hidden className="absolute -bottom-[5px] -right-[5px] size-3 border-b-[1.5px] border-r-[1.5px] border-ink" />

        {/* maket + ikiz katmanı */}
        <div className="relative aspect-[1920/1088] overflow-hidden rounded-[1px] border border-[var(--cizgi)]">
          <Image
            src="/generated/mockup-01/hero-kesit-maket.jpg"
            alt="Konut projesinin fiziksel kesit maketi: katlar ve daireler açıkta, üzerinde canlı durum işaretleri"
            fill
            priority
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
          {/* duotone işleme: ink gölge + teal ışıma, marka paletine bağlar */}
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-multiply"
            style={{
              background:
                "linear-gradient(155deg, rgba(16,36,58,0.30) 0%, rgba(16,36,58,0.06) 42%, rgba(30,155,138,0.14) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(247,245,239,0.06) 0%, transparent 30%, rgba(16,36,58,0.18) 100%)" }}
          />

          {/* künye paneli: görselin sol üst negatif alanı */}
          <div className="absolute left-2.5 top-2.5 max-w-[190px] rounded-[2px] border border-[var(--cizgi-2)] bg-white/92 p-2.5 sm:left-3.5 sm:top-3.5">
            <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.13em] text-ink">
              Blok A · Dijital İkiz
            </p>
            <p className="mt-0.5 font-mono text-[8.5px] leading-snug text-ink-soft">
              fiziksel maket + canlı veri katmanı
            </p>
            <p className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1" aria-hidden>
              {(["musait", "opsiyon", "satildi"] as const).map((d) => (
                <span key={d} className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-ink-soft">
                  <span className="size-1.5 rounded-full" style={{ background: RENK[d] }} />
                  {d === "musait" ? "müsait" : d === "opsiyon" ? "opsiyon" : "satıldı"}
                </span>
              ))}
            </p>
          </div>

          {/* damgalar */}
          <span className="absolute right-2.5 top-2.5 rounded-[2px] border border-[var(--cizgi-2)] bg-white/92 px-2 py-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)] sm:right-3.5 sm:top-3.5">
            örnek
          </span>
          <span className="absolute bottom-2.5 left-2.5 rounded-[2px] bg-[rgba(16,36,58,0.72)] px-2 py-1 font-mono text-[8.5px] font-semibold uppercase tracking-[0.18em] text-white/90 sm:bottom-3.5 sm:left-3.5">
            Kesit A-A&apos; · Ölçek 1:Canlı
          </span>

          {/* veri pinleri */}
          {PINLER.map((p) => {
            const durum = pinDurum[p.kod] ?? p.durum;
            const aktifMi = aktifPin?.kod === p.kod;
            return (
              <div
                key={p.kod}
                className="absolute"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                aria-hidden
              >
                {/* olay halkası */}
                {aktifMi && aktifOlay ? (
                  <span
                    key={olayIdx}
                    className="dt-ping absolute -left-3 -top-3 size-6 rounded-full border-2"
                    style={{ borderColor: aktifOlay.renk }}
                  />
                ) : null}
                {/* durum noktası */}
                <span
                  className="absolute -left-[7px] -top-[7px] flex size-3.5 items-center justify-center rounded-full border-2 border-white shadow-[0_1px_5px_rgba(16,36,58,0.45)] transition-colors duration-500"
                  style={{ background: RENK[durum] }}
                >
                  {durum === "opsiyon" ? <Lock size={7} strokeWidth={3} className="text-white" /> : null}
                </span>
                {/* kalıcı fiyat etiketi */}
                {p.fiyat && !aktifMi ? (
                  <span className="absolute -top-[26px] left-0 -translate-x-1/2 whitespace-nowrap rounded-[2px] border border-[var(--cizgi-2)] bg-white/92 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-ink">
                    {p.kod} · {p.fiyat}
                  </span>
                ) : null}
                {/* aktif olay etiketi */}
                {aktifMi && aktifOlay ? (
                  <span
                    key={`etiket-${olayIdx}`}
                    className="dt-belir absolute -top-[30px] left-0 -translate-x-1/2 whitespace-nowrap rounded-[2px] border-[1.5px] bg-white px-2 py-1 font-mono text-[9.5px] font-bold text-ink shadow-[0_2px_8px_rgba(16,36,58,0.25)]"
                    style={{ borderColor: aktifOlay.renk }}
                  >
                    {p.kod} · {aktifOlay.rozet ?? ETIKET[durum]}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* alt olay şeridi + senkron sayacı */}
        <div className="flex min-h-[38px] flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1.5 pb-0.5 pt-2.5">
          {statik ? (
            <span className="font-mono text-[11px] text-ink-soft">
              İkiz canlı: her değişiklik anında tüm ekranlara yayılır.
            </span>
          ) : aktifOlay ? (
            <span key={olayIdx} className="dt-belir inline-flex min-w-0 items-center gap-2 font-mono text-[11px] text-ink" aria-live="polite">
              <span className="size-2 flex-none rounded-full" style={{ background: aktifOlay.renk }} aria-hidden />
              <span className="min-w-0 truncate">{aktifOlay.metin}</span>
            </span>
          ) : (
            <span className="font-mono text-[11px] text-ink-soft">İkiz dinleniyor: hareket bekleniyor.</span>
          )}
          <span className="inline-flex flex-none items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#1f7d4c]">
            <span className="size-1.5 rounded-full bg-green nabiz" aria-hidden />
            senkron · {statik ? "canlı" : sn === 0 ? "şimdi" : `${sn} sn önce`}
          </span>
        </div>
      </div>
    </div>
  );
}
