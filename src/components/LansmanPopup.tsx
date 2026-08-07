"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Check, ChevronRight, Sparkles, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { kurucuKayit } from "./lansman-actions";

const ANAHTAR = "projedar_lansman_gorundu";

/**
 * Lansman "Kurucu Üyelik" pop-up'ı — public sayfalarda ilk ziyarette bir kez.
 * Kayıt CTA'ı (müteahhit/danışman) + "haber ver" e-posta yakalama (KVKK onaylı).
 * Girişli üyeye gösterilmez. Kıtlık/sayı vaadi YOK (zaman-sınırlı "lansmana özel").
 */
export function LansmanPopup({ varsayilanRol }: { varsayilanRol?: "uretici" | "emlakci" }) {
  const [acik, setAcik] = useState(false);
  const [mod, setMod] = useState<"secim" | "eposta" | "tesekkur">("secim");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const kapat = useCallback(() => setAcik(false), []);

  // Tetik: ziyaretçi başına bir kez (localStorage), 4sn gecikme veya %35 scroll. Girişli üyeye gösterme.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(ANAHTAR)) return;
    let iptal = false;
    let tetiklendi = false;
    let zaman = 0;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0 && window.scrollY / h > 0.35) goster();
    };
    const temizle = () => {
      window.clearTimeout(zaman);
      window.removeEventListener("scroll", onScroll);
    };
    function goster() {
      if (tetiklendi || iptal) return;
      tetiklendi = true;
      localStorage.setItem(ANAHTAR, "1");
      setAcik(true);
      temizle();
    }
    // Üye ise gösterme (anon oturum kontrolü, RLS-güvenli anon key).
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (iptal || data.session) return;
        zaman = window.setTimeout(goster, 4000);
        window.addEventListener("scroll", onScroll, { passive: true });
      });
    return () => {
      iptal = true;
      temizle();
    };
  }, []);

  // Esc ile kapat + arka plan scroll kilidi.
  useEffect(() => {
    if (!acik) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") kapat();
    };
    document.addEventListener("keydown", onKey);
    const eski = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = eski;
    };
  }, [acik, kapat]);

  if (!acik) return null;

  const gonder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHata(null);
    const fd = new FormData(e.currentTarget);
    const girdi = {
      email: String(fd.get("email") ?? ""),
      rol: String(fd.get("rol") ?? ""),
      kaynak: "lansman_popup_eposta",
      kvkk: fd.get("kvkk") === "on",
      hp: String(fd.get("sirket") ?? ""),
    };
    basla(async () => {
      const s = await kurucuKayit(girdi);
      if (s.ok) setMod("tesekkur");
      else setHata(s.hata);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Projedar kurucu üyelik"
      onClick={(e) => {
        if (e.target === e.currentTarget) kapat();
      }}
      className="fixed inset-0 z-[65] flex items-end justify-center bg-[rgba(8,20,34,0.6)] p-3 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div className="kart relative w-full max-w-md overflow-hidden rounded-t-3xl border border-[var(--cizgi)] bg-paper p-0 shadow-[var(--golge-3)] sm:rounded-3xl">
        <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-teal" />
        <button
          onClick={kapat}
          aria-label="Kapat"
          className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-[rgba(16,36,58,0.06)] hover:text-ink"
        >
          <X size={18} />
        </button>

        {mod === "secim" ? (
          <div className="p-6 sm:p-7">
            <p className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-teal">
              <Sparkles size={13} strokeWidth={2.2} /> Lansmana özel
            </p>
            <h2 className="mt-2 pr-8 font-display text-xl font-extrabold tracking-tight text-ink">Kurucu Üyelik açıldı</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Kurucu üyelere ilk yıl ücretsiz kullanım. Komisyon yok, kazancın %100&apos;ü senin. Sonradan ücretlenecek
              özellikler kurucularda ilk yıl ücretsiz.
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              <Link
                href="/kayit?rol=uretici&kaynak=lansman-popup"
                className={`group flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors hover:border-teal/50 hover:bg-teal/5 ${
                  varsayilanRol === "uretici" ? "border-teal/50 bg-teal/5" : "border-[var(--cizgi)]"
                }`}
              >
                <span className="grid size-10 flex-none place-items-center rounded-xl bg-[rgba(19,49,75,0.07)]">
                  <Building2 size={20} strokeWidth={1.7} color="var(--color-navy)" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">Kurucu üye ol (proje sahibi)</span>
                  <span className="block text-xs text-ink-soft">Stoğunu ağa aç, tek panelden yönet. İlk yıl ücretsiz.</span>
                </span>
                <ChevronRight size={16} className="flex-none text-ink-soft transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/kayit?rol=emlakci&kaynak=lansman-popup"
                className={`group flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors hover:border-teal/50 hover:bg-teal/5 ${
                  varsayilanRol === "emlakci" ? "border-teal/50 bg-teal/5" : "border-[var(--cizgi)]"
                }`}
              >
                <span className="grid size-10 flex-none place-items-center rounded-xl bg-teal/10">
                  <Users size={20} strokeWidth={1.7} className="text-teal-d" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">Kurucu danışman ol</span>
                  <span className="block text-xs text-ink-soft">Tahsisli projeleri canlı gör, komisyonsuz sat.</span>
                </span>
                <ChevronRight size={16} className="flex-none text-ink-soft transition-transform group-hover:translate-x-0.5" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setHata(null);
                  setMod("eposta");
                }}
                className="mt-0.5 text-center text-[13px] font-semibold text-ink-soft transition-colors hover:text-ink"
              >
                Şimdi hazır değilim, açılınca haber ver →
              </button>
            </div>
          </div>
        ) : null}

        {mod === "eposta" ? (
          <form onSubmit={gonder} className="p-6 sm:p-7">
            <button
              type="button"
              onClick={() => setMod("secim")}
              className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
            >
              <ArrowLeft size={13} /> Geri
            </button>
            <h2 className="pr-8 font-display text-lg font-extrabold tracking-tight text-ink">Kurucu listesine katıl</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              E-postanı bırak; kurucu üyelik ayrıcalıkları ve lansman fırsatı hazır olduğunda ilk sen haberdar ol.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <input
                name="email"
                type="email"
                required
                maxLength={160}
                placeholder="E-posta adresin"
                autoComplete="email"
                className="w-full rounded-xl border border-[var(--cizgi)] bg-white px-3.5 py-3 text-sm text-ink outline-none transition-colors focus:border-teal"
              />
              <input type="hidden" name="rol" value={varsayilanRol ?? ""} />
              <input name="sirket" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
              <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-soft">
                <input type="checkbox" name="kvkk" required className="mt-0.5 size-4 flex-none" style={{ accentColor: "var(--color-teal)" }} />
                <span>
                  <Link href="/kvkk-aydinlatma" target="_blank" className="font-semibold text-teal-d underline">
                    KVKK Aydınlatma Metni
                  </Link>
                  &apos;ni okudum; e-postamın kurucu üyelik bilgilendirmesi ve ticari elektronik ileti için işlenmesini onaylıyorum.
                </span>
              </label>
              {hata ? <p className="text-xs font-semibold text-[#e07a6e]">{hata}</p> : null}
              <button type="submit" disabled={bekliyor} className="btn-action mt-1 w-full justify-center disabled:opacity-60">
                {bekliyor ? "Gönderiliyor…" : "Beni haberdar et"}
              </button>
            </div>
          </form>
        ) : null}

        {mod === "tesekkur" ? (
          <div className="p-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal/10">
              <Check size={28} className="text-teal-d" />
            </span>
            <h2 className="mt-4 font-display text-xl font-extrabold tracking-tight text-ink">Listedesin</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
              Teşekkürler. Kurucu üyelik ayrıcalıkları açıldığında ilk sana haber vereceğiz.
            </p>
            <button onClick={kapat} className="btn-action mt-5 w-full justify-center">
              Kapat
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
