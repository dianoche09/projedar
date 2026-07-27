"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAzalt } from "@/components/landing/useAzalt";

/**
 * KilitKoreografi · Mockup 02 "çift satış kalkanı" bölümü.
 * Opsiyon kilidinin yedi adımı tipografik koreografi olarak oynar:
 * SEÇ -> TALEP -> KONTROL -> KİLİT -> ENGEL -> KAYIT -> AĞ.
 * Solda dev adım kelimesi (görsel nesne), sağda biriken işlem günlüğü.
 * GERÇEK ETKİLEŞİM: ray üzerindeki adımlara dokununca akış ele alınır,
 * bitince baştan oynatılabilir. Reduced-motion: tam günlük, statik.
 * TÜM VERİLER ÖRNEKTİR. Sadece CSS + React state.
 */

type Adim = { kelime: string; uzun: string; renk: string; log: string };

const ADIMLAR: Adim[] = [
  { kelime: "SEÇ", uzun: "birim seçimi", renk: "#2fb36b", log: "14:02:08 · Yılmaz Emlak, B-7-1 detayını açtı" },
  { kelime: "TALEP", uzun: "opsiyon talebi", renk: "#3cc7b2", log: "14:02:11 · opsiyon talebi alındı" },
  { kelime: "KONTROL", uzun: "çakışma kontrolü", renk: "#3cc7b2", log: "14:02:11 · aktif opsiyon taraması: çakışma yok" },
  { kelime: "KİLİT", uzun: "48 saat kilit", renk: "#e3a12c", log: "14:02:12 · B-7-1 kilitlendi · 48 sa · veritabanı seviyesinde" },
  { kelime: "ENGEL", uzun: "ikinci erişim engellendi", renk: "#d15a4e", log: "14:03:40 · Kaya Emlak aynı birime talep gönderdi: reddedildi" },
  { kelime: "KAYIT", uzun: "işlem günlüğü", renk: "#3cc7b2", log: "14:03:41 · hareket günlüğe yazıldı · iz no 8412" },
  { kelime: "AĞ", uzun: "ağ güncellendi", renk: "#2fb36b", log: "14:03:41 · havuzdaki tüm danışman ekranlarında durum aynı anda değişti" },
];

const SON = ADIMLAR.length - 1;
const ADIM_ARALIK = 1500;

export function KilitKoreografi() {
  const kok = useRef<HTMLDivElement>(null);
  const zamanlayicilar = useRef<number[]>([]);
  const azalt = useAzalt();
  const [adim, setAdim] = useState(0);

  const temizle = useCallback(() => {
    zamanlayicilar.current.forEach((z) => window.clearTimeout(z));
    zamanlayicilar.current = [];
  }, []);

  /* koreografiyi baştan oynatır; yalnız olay callback'lerinden çağrılır */
  const oynat = useCallback(() => {
    temizle();
    if (azalt) {
      setAdim(SON);
      return;
    }
    setAdim(0);
    for (let n = 1; n <= SON; n++) {
      zamanlayicilar.current.push(window.setTimeout(() => setAdim(n), n * ADIM_ARALIK));
    }
  }, [azalt, temizle]);

  /* raya dokununca otomatik akış durur, adım ele alınır */
  const sec = (k: number) => {
    temizle();
    setAdim(k);
  };

  /* görünüme girince koreografi bir kez başlar */
  useEffect(() => {
    const el = kok.current;
    if (!el) return;
    const gozlemci = new IntersectionObserver(
      (girisler) => {
        if (girisler.some((g) => g.isIntersecting)) {
          gozlemci.disconnect();
          oynat();
        }
      },
      { threshold: 0.3 },
    );
    gozlemci.observe(el);
    return () => {
      gozlemci.disconnect();
      temizle();
    };
  }, [oynat, temizle]);

  const a = ADIMLAR[adim];

  return (
    <div ref={kok} className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
      {/* sol: dev adım kelimesi */}
      <div className="min-w-0">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--m2-ink-soft)]">
          adım {String(adim + 1).padStart(2, "0")} / {String(ADIMLAR.length).padStart(2, "0")} · {a.uzun}
        </p>
        <div className="mt-3 min-h-[1.05em] overflow-hidden text-[clamp(3rem,12vw,7.2rem)]">
          <span key={adim} className="m2-dev m2-kelime block" style={{ color: a.renk }}>
            {a.kelime}
          </span>
        </div>

        {/* adım rayı: dokununca akış ele alınır */}
        <div className="mt-6 flex gap-1.5" role="group" aria-label="Kilit koreografisi adımları">
          {ADIMLAR.map((s, k) => (
            <button
              key={s.kelime}
              type="button"
              onClick={() => sec(k)}
              aria-label={`Adım ${k + 1}: ${s.uzun}`}
              aria-current={k === adim ? "step" : undefined}
              className="min-h-[44px] min-w-0 flex-1"
            >
              <span
                className="block h-1.5 rounded-full transition-colors duration-300"
                style={{ background: k <= adim ? s.renk : "rgba(255,255,255,0.12)" }}
              />
            </button>
          ))}
        </div>

        <div className="mt-2 flex min-h-[44px] items-center">
          {adim === SON && !azalt ? (
            <button
              type="button"
              onClick={oynat}
              className="min-h-[44px] rounded-lg border border-[var(--m2-cizgi)] px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--m2-ink)] transition-colors hover:border-[var(--m2-teal)] hover:text-[var(--m2-teal)]"
            >
              Baştan oynat
            </button>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--m2-ink-soft)]">
              raya dokun, adımları sen gez
            </span>
          )}
        </div>
      </div>

      {/* sağ: biriken işlem günlüğü */}
      <div className="min-w-0 rounded-2xl border border-[var(--m2-cizgi)] bg-[var(--m2-zemin-2)] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--m2-cizgi-soft)] pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--m2-ink-soft)]">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-green nabiz" aria-hidden />
            işlem günlüğü · Çankaya Vadi
          </span>
          <span className="rounded border border-[var(--m2-cizgi)] px-2 py-0.5 text-[9px]">örnek</span>
        </div>
        <ul className="mt-3 min-h-[248px] space-y-2.5 sm:min-h-[224px]">
          {ADIMLAR.slice(0, adim + 1).map((s, k) => (
            <li
              key={s.kelime}
              className={`flex items-start gap-2.5 font-mono text-[11.5px] leading-relaxed ${
                k === adim ? "m2-satir-gir text-[var(--m2-ink)]" : "text-[var(--m2-ink-soft)]"
              }`}
            >
              <span className="mt-1.5 size-1.5 flex-none rounded-full" style={{ background: s.renk }} aria-hidden />
              <span className="min-w-0">{s.log}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-[var(--m2-cizgi-soft)] pt-3 font-mono text-[10px] leading-relaxed text-[var(--m2-ink-soft)]">
          Kilit uygulama katmanında değil, veritabanında tutulur: aktif opsiyon için tekil kayıt kuralı. Çift satış bu yüzden imkansızdır.
        </p>
      </div>
    </div>
  );
}
