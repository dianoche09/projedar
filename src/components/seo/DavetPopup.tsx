"use client";
import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { Building2, Users, Home, X, ArrowLeft, Check, ChevronRight } from "lucide-react";
import { musteriTalebi } from "./davet-actions";

const OTURUM_ANAHTAR = "projedar_davet_gorundu";

/**
 * SEO proje sayfasına gelen trafiği çeviren davetkâr 3 yönlü pop-up:
 * müteahhit (projeni ekle) / danışman (ağa katıl) / müşteri (KVKK onaylı iletişim).
 * Oturumda bir kez; 7sn gecikme veya %40 scroll ile açılır.
 */
export function DavetPopup({ slug, projeAd }: { slug: string; projeAd: string }) {
  const [acik, setAcik] = useState(false);
  const [mod, setMod] = useState<"secim" | "musteri" | "tesekkur">("secim");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const kapat = useCallback(() => setAcik(false), []);

  // Tetikleme: oturumda bir kez, 7sn gecikme veya %40 scroll.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(OTURUM_ANAHTAR)) return;
    let tetiklendi = false;
    let zaman = 0;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0 && window.scrollY / h > 0.4) goster();
    };
    const temizle = () => {
      window.clearTimeout(zaman);
      window.removeEventListener("scroll", onScroll);
    };
    function goster() {
      if (tetiklendi) return;
      tetiklendi = true;
      sessionStorage.setItem(OTURUM_ANAHTAR, "1");
      setAcik(true);
      temizle();
    }
    zaman = window.setTimeout(goster, 7000);
    window.addEventListener("scroll", onScroll, { passive: true });
    return temizle;
  }, []);

  // Esc ile kapat + arkaplan scroll kilidi.
  useEffect(() => {
    if (!acik) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") kapat(); };
    document.addEventListener("keydown", onKey);
    const eski = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = eski; };
  }, [acik, kapat]);

  if (!acik) return null;

  const gonder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHata(null);
    const fd = new FormData(e.currentTarget);
    const girdi = {
      ad: String(fd.get("ad") ?? ""),
      telefon: String(fd.get("telefon") ?? ""),
      slug,
      projeAd,
      kvkk: fd.get("kvkk") === "on",
      hp: String(fd.get("sirket") ?? ""),
    };
    basla(async () => {
      const s = await musteriTalebi(girdi);
      if (s.ok) setMod("tesekkur");
      else setHata(s.hata);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Projedar davet"
      onClick={(e) => { if (e.target === e.currentTarget) kapat(); }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(8,20,34,0.6)] p-3 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div className="kart relative w-full max-w-md overflow-hidden rounded-t-3xl border border-[var(--cizgi)] bg-paper p-0 shadow-[var(--golge-3)] sm:rounded-3xl">
        <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-teal" />
        <button onClick={kapat} aria-label="Kapat" className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-[rgba(16,36,58,0.06)] hover:text-ink">
          <X size={18} />
        </button>

        {mod === "secim" ? (
          <div className="p-6 sm:p-7">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-teal">Projedar ağı</p>
            <h2 className="mt-2 pr-8 font-display text-xl font-extrabold tracking-tight text-ink">{projeAd} ile ilgileniyor musun?</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">Kim olduğunu seç, doğru yere yönlendirelim.</p>
            <div className="mt-5 flex flex-col gap-2.5">
              <Link href="/kayit?rol=uretici&kaynak=proje-seo-popup" className="group flex items-center gap-3 rounded-2xl border border-[var(--cizgi)] p-3.5 text-left transition-colors hover:border-teal/50 hover:bg-teal/5">
                <span className="grid size-10 flex-none place-items-center rounded-xl bg-[rgba(19,49,75,0.07)]"><Building2 size={20} strokeWidth={1.7} color="var(--color-navy)" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink">Müteahhit / proje sahibiyim</span><span className="block text-xs text-ink-soft">Projeni Projedar ağına ekle, tek panelden yönet.</span></span>
                <ChevronRight size={16} className="flex-none text-ink-soft transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/kayit?rol=emlakci&kaynak=proje-seo-popup" className="group flex items-center gap-3 rounded-2xl border border-[var(--cizgi)] p-3.5 text-left transition-colors hover:border-teal/50 hover:bg-teal/5">
                <span className="grid size-10 flex-none place-items-center rounded-xl bg-teal/10"><Users size={20} strokeWidth={1.7} className="text-teal-d" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink">Gayrimenkul danışmanıyım</span><span className="block text-xs text-ink-soft">Ağa katıl, kazancın tamamı sende; Projedar pay almaz.</span></span>
                <ChevronRight size={16} className="flex-none text-ink-soft transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button type="button" onClick={() => { setHata(null); setMod("musteri"); }} className="group flex items-center gap-3 rounded-2xl border border-[var(--cizgi)] p-3.5 text-left transition-colors hover:border-teal/50 hover:bg-teal/5">
                <span className="grid size-10 flex-none place-items-center rounded-xl bg-[rgba(19,49,75,0.07)]"><Home size={20} strokeWidth={1.7} color="var(--color-navy)" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink">İlgileniyorum, bilgi istiyorum</span><span className="block text-xs text-ink-soft">İletişim bırak, uygun olduğunda sana dönelim.</span></span>
                <ChevronRight size={16} className="flex-none text-ink-soft transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        ) : null}

        {mod === "musteri" ? (
          <form onSubmit={gonder} className="p-6 sm:p-7">
            <button type="button" onClick={() => setMod("secim")} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"><ArrowLeft size={13} /> Geri</button>
            <h2 className="pr-8 font-display text-lg font-extrabold tracking-tight text-ink">Bu proje hakkında bilgi al</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">İletişimini bırak; {projeAd} için uygun olduğunda Projedar sana ulaşsın.</p>
            <div className="mt-4 flex flex-col gap-3">
              <input name="ad" required minLength={2} maxLength={80} placeholder="Ad Soyad" autoComplete="name"
                className="w-full rounded-xl border border-[var(--cizgi)] bg-white px-3.5 py-3 text-sm text-ink outline-none transition-colors focus:border-teal" />
              <input name="telefon" required inputMode="tel" maxLength={24} placeholder="Telefon" autoComplete="tel"
                className="w-full rounded-xl border border-[var(--cizgi)] bg-white px-3.5 py-3 text-sm text-ink outline-none transition-colors focus:border-teal" />
              <input name="sirket" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
              <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-soft">
                <input type="checkbox" name="kvkk" required className="mt-0.5 size-4 flex-none" style={{ accentColor: "var(--color-teal)" }} />
                <span><Link href="/kvkk-aydinlatma" target="_blank" className="font-semibold text-teal-d underline">KVKK Aydınlatma Metni</Link>&apos;ni okudum; iletişim bilgilerimin bu talep için işlenmesini onaylıyorum.</span>
              </label>
              {hata ? <p className="text-xs font-semibold text-[#e07a6e]">{hata}</p> : null}
              <button type="submit" disabled={bekliyor} className="btn-action mt-1 w-full justify-center disabled:opacity-60">{bekliyor ? "Gönderiliyor…" : "İletişim bırak"}</button>
              <p className="text-center text-[11px] text-[var(--ink-faint)]">Projedar bir ilan portalı değildir; fiyat ve stok yalnız yetkili danışmanlara açılır.</p>
            </div>
          </form>
        ) : null}

        {mod === "tesekkur" ? (
          <div className="p-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal/10"><Check size={28} className="text-teal-d" /></span>
            <h2 className="mt-4 font-display text-xl font-extrabold tracking-tight text-ink">Talebin bize ulaştı</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">Teşekkürler. {projeAd} için uygun olduğunda Projedar seninle iletişime geçer.</p>
            <button onClick={kapat} className="btn-action mt-5 w-full justify-center">Kapat</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
