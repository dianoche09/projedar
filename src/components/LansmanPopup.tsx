"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Check, ChevronRight, Users, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { kurucuKayit } from "./lansman-actions";

const ANAHTAR = "projedar_lansman_gorundu";

/**
 * Lansman pop-up'ı — public sayfalarda ilk ziyarette bir kez.
 * Rol-önce kayıt CTA'ları + "haber ver" e-posta yakalama (KVKK onaylı).
 * Girişli üyeye gösterilmez. Süre/kıtlık vaadi YOK. Emlakçıya "kazancının %100'ü sende"
 * (çıplak "komisyon yok" bilinçli KULLANILMAZ — emlakçı yanlış okur).
 */
export function LansmanPopup({ varsayilanRol }: { varsayilanRol?: "uretici" | "emlakci" }) {
  const [acik, setAcik] = useState(false);
  const [mod, setMod] = useState<"secim" | "eposta" | "tesekkur">("secim");
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, basla] = useTransition();

  const kapat = useCallback(() => setAcik(false), []);

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
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (iptal || data.session) return;
        zaman = window.setTimeout(goster, 4500);
        window.addEventListener("scroll", onScroll, { passive: true });
      });
    return () => {
      iptal = true;
      temizle();
    };
  }, []);

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
      aria-label="Projedar lansman"
      onClick={(e) => {
        if (e.target === e.currentTarget) kapat();
      }}
      className="fixed inset-0 z-[65] flex items-end justify-center bg-[rgba(8,20,34,0.55)] p-3 backdrop-blur-md sm:items-center sm:p-4"
    >
      <div
        className="relative w-full max-w-[440px] overflow-hidden rounded-t-[28px] border border-[var(--cizgi)] shadow-[var(--golge-3)] sm:rounded-[28px]"
        style={{
          background:
            "radial-gradient(130% 80% at 50% -12%, rgba(30,155,138,0.12), transparent 58%), linear-gradient(180deg,#ffffff, #fbfcfe)",
        }}
      >
        {/* üst sinyal şeridi (navy→teal, canlılık) */}
        <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "linear-gradient(90deg,#13314b,#1e9b8a)" }} />
        <button
          onClick={kapat}
          aria-label="Kapat"
          className="absolute right-3.5 top-3.5 z-10 grid size-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-[rgba(16,36,58,0.06)] hover:text-ink"
        >
          <X size={18} />
        </button>

        {mod === "secim" ? (
          <div className="px-6 pb-6 pt-7 sm:px-7">
            <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-teal-d">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-teal" />
              </span>
              Lansmana özel
            </p>
            <h2 className="mt-3 font-display text-[26px] font-extrabold leading-[1.08] tracking-tight text-ink">Ağ yeni açıldı</h2>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
              Projedar&apos;a erken katılanlara ücretsiz erişim ve öncelik. Sen kimsin?
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              <Link
                href="/kayit?rol=uretici&kaynak=lansman-popup"
                className={`group flex items-center gap-3.5 rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-teal/45 hover:shadow-[var(--golge-2)] ${
                  varsayilanRol === "uretici" ? "border-teal/40 shadow-[var(--golge-1)]" : "border-[var(--cizgi)]"
                }`}
              >
                <span className="grid size-11 flex-none place-items-center rounded-xl bg-[rgba(19,49,75,0.06)] text-navy">
                  <Building2 size={21} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-bold text-ink">Müteahhit / proje sahibiyim</span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-soft">Stok, fiyat ve tahsis tek panelde. Ücretsiz başla.</span>
                </span>
                <ChevronRight size={17} className="flex-none text-ink-soft transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/kayit?rol=emlakci&kaynak=lansman-popup"
                className={`group flex items-center gap-3.5 rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-teal/45 hover:shadow-[var(--golge-2)] ${
                  varsayilanRol === "emlakci" ? "border-teal/40 shadow-[var(--golge-1)]" : "border-[var(--cizgi)]"
                }`}
              >
                <span className="grid size-11 flex-none place-items-center rounded-xl bg-teal/10 text-teal-d">
                  <Users size={21} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-bold text-ink">Gayrimenkul danışmanıyım</span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-soft">Tahsisli projeleri canlı gör; kazancının %100&apos;ü sende.</span>
                </span>
                <ChevronRight size={17} className="flex-none text-ink-soft transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => {
                setHata(null);
                setMod("eposta");
              }}
              className="mt-4 block w-full text-center text-[13px] font-semibold text-ink-soft transition-colors hover:text-teal-d"
            >
              Şimdi hazır değilim, açılınca haber ver →
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 border-t border-[var(--cizgi)] pt-3.5 font-mono text-[11px] text-[var(--ink-faint)]">
              <span className="size-1.5 rounded-full bg-teal" aria-hidden />
              Canlı proje satış ağı
            </p>
          </div>
        ) : null}

        {mod === "eposta" ? (
          <form onSubmit={gonder} className="px-6 pb-6 pt-7 sm:px-7">
            <button
              type="button"
              onClick={() => setMod("secim")}
              className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
            >
              <ArrowLeft size={13} /> Geri
            </button>
            <h2 className="font-display text-[20px] font-extrabold tracking-tight text-ink">Açılınca ilk sen haber al</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              E-postanı bırak; ağ ve lansman fırsatı hazır olduğunda ilk sana yazalım.
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
              <label className="flex items-start gap-2.5 text-[11.5px] leading-relaxed text-ink-soft">
                <input type="checkbox" name="kvkk" required className="mt-0.5 size-4 flex-none" style={{ accentColor: "var(--color-teal)" }} />
                <span>
                  <Link href="/kvkk-aydinlatma" target="_blank" className="font-semibold text-teal-d underline">
                    KVKK Aydınlatma Metni
                  </Link>
                  &apos;ni okudum; e-postamın lansman bilgilendirmesi ve ticari elektronik ileti için işlenmesini onaylıyorum.
                </span>
              </label>
              {hata ? <p className="text-xs font-semibold text-[#c0483c]">{hata}</p> : null}
              <button
                type="submit"
                disabled={bekliyor}
                className="mt-1 w-full rounded-xl px-4 py-3 text-sm font-bold text-white shadow-[var(--golge-1)] transition-all hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: "linear-gradient(150deg,#1b5e6e,#1e9b8a)" }}
              >
                {bekliyor ? "Gönderiliyor…" : "Beni haberdar et"}
              </button>
            </div>
          </form>
        ) : null}

        {mod === "tesekkur" ? (
          <div className="px-6 py-9 text-center sm:px-7">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal/10">
              <Check size={28} className="text-teal-d" />
            </span>
            <h2 className="mt-4 font-display text-[20px] font-extrabold tracking-tight text-ink">Listedesin</h2>
            <p className="mx-auto mt-2 max-w-xs text-[14px] leading-relaxed text-ink-soft">
              Teşekkürler. Ağ ve lansman fırsatı hazır olduğunda ilk sana yazacağız.
            </p>
            <button
              onClick={kapat}
              className="mt-5 w-full rounded-xl border border-[var(--cizgi)] bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-soft"
            >
              Kapat
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
