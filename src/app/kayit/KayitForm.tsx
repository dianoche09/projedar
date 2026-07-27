"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { kayitOl } from "./actions";

const ROLLER = [
  { value: "uretici", etiket: "Üretici / Müteahhit", aciklama: "Proje ve stok yöneten firma" },
  { value: "ofis_yetkili", etiket: "Emlak Ofisi / Franchise", aciklama: "Ekip ve abonelik sahibi" },
  { value: "emlakci", etiket: "Emlakçı / Danışman", aciklama: "Havuzdan paylaşan danışman" },
] as const;

const inp =
  "min-h-12 w-full rounded-xl border border-hair bg-soft px-4 text-base text-ink outline-none transition-all placeholder:text-ink-soft/55 focus:border-teal focus:bg-white focus:ring-4 focus:ring-teal/12";

function Gonder() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="min-h-12 flex-1 rounded-xl bg-teal py-3.5 text-base font-bold text-white transition-all duration-300 hover:bg-teal-d disabled:opacity-50 shadow-[0_6px_16px_rgba(30,155,138,0.3)]"
    >
      {pending ? "Oluşturuluyor…" : "Hesabı oluştur"}
    </button>
  );
}

export function KayitForm({ davet }: { davet?: { ad: string; d: string; n: string; t: string } | null }) {
  const [adim, setAdim] = useState<0 | 1>(0);
  const [rol, setRol] = useState<string>(davet ? "emlakci" : "uretici");

  const emlakci = rol === "emlakci";
  const adimlar = emlakci ? ["Hesap türü", "Bilgiler", "Belgeler"] : ["Hesap türü", "Bilgiler"];

  return (
    <form action={kayitOl} className="mt-6 flex flex-col gap-4 text-ink">
      {davet ? (
        <>
          <input type="hidden" name="d" value={davet.d} />
          <input type="hidden" name="n" value={davet.n} />
          <input type="hidden" name="t" value={davet.t} />
          <p className="rounded-xl border border-teal/25 bg-teal-soft px-3.5 py-2.5 text-[13px] font-medium text-teal-d">
            <strong className="font-bold text-ink">{davet.ad}</strong> seni ağına davet ediyor. Danışman olarak kaydol;
            belgeni doğrulayınca sana tahsisli projeleri canlı görürsün.
          </p>
        </>
      ) : null}

      {/* Adım göstergesi */}
      <ol className="flex items-center gap-2">
        {adimlar.map((et, i) => {
          const aktif = i === adim;
          const gecti = i < adim;
          return (
            <li key={et} className="flex flex-1 items-center gap-2">
              <span
                className={`flex size-6 flex-none items-center justify-center rounded-full text-xs font-bold ${
                  aktif ? "bg-teal text-white" : gecti ? "bg-teal-soft text-teal-d" : "bg-hair text-ink-soft"
                }`}
              >
                {gecti ? "✓" : i + 1}
              </span>
              <span className={`whitespace-nowrap text-xs font-semibold ${aktif ? "text-ink" : "text-ink-soft"}`}>{et}</span>
              {i < adimlar.length - 1 ? <span className="h-px flex-1 bg-hair" /> : null}
            </li>
          );
        })}
      </ol>

      {/* ADIM 1 — Hesap türü. Radiolar her zaman DOM'da (adım 2'de gizli) ki değer submit olsun. */}
      <div className={adim === 0 ? "flex flex-col gap-2" : "hidden"}>
        <span className="text-sm font-bold text-ink">Hesap türü</span>
        {ROLLER.map((r) => (
          <label
            key={r.value}
            className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3.5 transition-all duration-200 ${
              rol === r.value ? "border-teal bg-teal-soft shadow-sm" : "border-hair hover:border-teal/40"
            }`}
          >
            <input
              type="radio"
              name="talep_rol"
              value={r.value}
              checked={rol === r.value}
              onChange={() => setRol(r.value)}
              className="mt-1 accent-teal"
            />
            <span>
              <span className="block text-sm font-bold text-ink">{r.etiket}</span>
              <span className="block text-xs font-medium text-ink-soft">{r.aciklama}</span>
            </span>
          </label>
        ))}
        <button
          type="button"
          onClick={() => setAdim(1)}
          className="mt-2 min-h-12 w-full rounded-xl bg-teal py-3.5 text-base font-bold text-white transition-all duration-300 hover:bg-teal-d shadow-[0_6px_16px_rgba(30,155,138,0.3)]"
        >
          Devam →
        </button>
      </div>

      {/* ADIM 2 — Bilgiler */}
      <div className={adim === 1 ? "flex flex-col gap-4" : "hidden"}>
        <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
          Ad soyad
          <input name="ad" required={adim === 1} minLength={2} placeholder="Ad Soyad" className={inp} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
          E-posta
          <input name="email" type="email" required={adim === 1} autoComplete="email" placeholder="ornek@projepazar.com" className={inp} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
          Telefon <span className="font-normal text-ink-soft/70">(opsiyonel)</span>
          <input name="telefon" type="tel" autoComplete="tel" placeholder="+90…" className={inp} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
          Parola
          <input name="password" type="password" required={adim === 1} minLength={6} autoComplete="new-password" placeholder="••••••••" className={inp} />
        </label>

        {rol === "uretici" ? (
          <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
            Vergi no <span className="font-normal text-ink-soft/70">(firma doğrulaması için)</span>
            <input name="vergi_no" inputMode="numeric" placeholder="VKN" className={inp} />
          </label>
        ) : null}
        {rol === "ofis_yetkili" ? (
          <label className="flex flex-col gap-1.5 text-sm font-bold text-ink">
            Ofis / Franchise adı
            <input name="ofis_adi" placeholder="ör. Demo Gayrimenkul" className={inp} />
          </label>
        ) : null}

        {emlakci ? (
          <p className="rounded-xl border border-teal/20 bg-teal-soft/50 px-3.5 py-2.5 text-xs font-medium text-teal-d">
            Sonraki adımda yetki belgelerini (barkodlu MYS + vergi levhası) yükleyeceksin. İstersen atlayabilirsin —
            doğrulanana kadar yalnız demo projeyi görürsün.
          </p>
        ) : null}

        <div className="mt-1 flex gap-3">
          <button
            type="button"
            onClick={() => setAdim(0)}
            className="min-h-12 rounded-xl border border-hair px-5 text-base font-bold text-ink-soft transition-colors hover:bg-soft"
          >
            ← Geri
          </button>
          <Gonder />
        </div>
      </div>
    </form>
  );
}
