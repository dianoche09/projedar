"use client";

import { useState, useTransition } from "react";
import { leadDetayGuncelle, leadHatirlatmaKur } from "@/app/havuz/actions";
import { useToast } from "@/components/ui/Toast";

type Baslangic = {
  email: string | null;
  butce: string | null;
  ihtiyac_notu: string | null;
  etiket: string[] | null;
  sicaklik: string | null;
  kayip_nedeni: string | null;
  sonraki_aksiyon_at: string | null;
  sonraki_aksiyon_notu: string | null;
};

const SICAKLIK: [string, string, string][] = [
  ["sicak", "Sıcak", "var(--color-red)"],
  ["ilik", "Ilık", "var(--color-amber)"],
  ["soguk", "Soğuk", "var(--color-navy)"],
];

/** datetime-local input değeri için: ISO → "YYYY-MM-DDTHH:mm" (yerel). */
function localInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** L3+L4+L5: enrichment + sıcaklık + kayıp nedeni + takip hatırlatması. */
export function LeadDuzenlePanel({ leadId, bas, kaybedildi }: { leadId: string; bas: Baslangic; kaybedildi: boolean }) {
  const toast = useToast();
  const [bekliyor, basla] = useTransition();

  const [email, setEmail] = useState(bas.email ?? "");
  const [butce, setButce] = useState(bas.butce ?? "");
  const [ihtiyac, setIhtiyac] = useState(bas.ihtiyac_notu ?? "");
  const [etiket, setEtiket] = useState((bas.etiket ?? []).join(", "));
  const [sicaklik, setSicaklik] = useState(bas.sicaklik ?? "");
  const [kayip, setKayip] = useState(bas.kayip_nedeni ?? "");

  const [tarih, setTarih] = useState(localInput(bas.sonraki_aksiyon_at));
  const [hatirNot, setHatirNot] = useState(bas.sonraki_aksiyon_notu ?? "");

  const kaydet = () => {
    if (bekliyor) return;
    basla(async () => {
      const r = await leadDetayGuncelle(leadId, {
        email: email.trim(),
        butce: butce.trim(),
        ihtiyac_notu: ihtiyac.trim(),
        etiket: etiket.split(",").map((s) => s.trim()).filter(Boolean),
        sicaklik: sicaklik || null,
        kayip_nedeni: kayip.trim(),
      });
      toast.goster(r.ok ? "Kaydedildi" : "Kaydedilemedi", r.ok ? "basari" : "hata");
    });
  };

  const hatirlatmaKur = (temizle: boolean) => {
    if (bekliyor) return;
    basla(async () => {
      const iso = temizle || !tarih ? null : new Date(tarih).toISOString();
      const r = await leadHatirlatmaKur(leadId, iso, temizle ? null : hatirNot.trim() || null);
      if (r.ok && temizle) {
        setTarih("");
        setHatirNot("");
      }
      toast.goster(r.ok ? (temizle ? "Hatırlatma kaldırıldı" : "Hatırlatma kuruldu") : "İşlem başarısız", r.ok ? "basari" : "hata");
    });
  };

  const inputCls =
    "w-full rounded-xl border border-hair bg-white px-3 py-2 text-[13.5px] text-ink outline-none focus:border-teal";
  const etiketCls = "text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft";

  return (
    <div className="space-y-5">
      {/* Enrichment */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className={etiketCls}>E-posta</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" className={inputCls} />
        </label>
        <label className="space-y-1">
          <span className={etiketCls}>Bütçe</span>
          <input value={butce} onChange={(e) => setButce(e.target.value)} placeholder="3-4M TL" className={inputCls} />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className={etiketCls}>İhtiyaç</span>
          <input value={ihtiyac} onChange={(e) => setIhtiyac(e.target.value)} placeholder="3+1, 120m²+, Çankaya, yıl sonu teslim…" className={inputCls} />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className={etiketCls}>Etiketler (virgülle)</span>
          <input value={etiket} onChange={(e) => setEtiket(e.target.value)} placeholder="yatırımcı, acil, kredi-bekliyor" className={inputCls} />
        </label>
      </div>

      {/* Sıcaklık */}
      <div className="space-y-1.5">
        <span className={etiketCls}>Sıcaklık</span>
        <div className="flex flex-wrap gap-1.5">
          {SICAKLIK.map(([v, et, renk]) => (
            <button
              key={v}
              type="button"
              onClick={() => setSicaklik(sicaklik === v ? "" : v)}
              className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
              style={
                sicaklik === v
                  ? { background: renk, color: "#fff" }
                  : { border: "1px solid var(--cizgi)", color: "var(--color-ink-soft)" }
              }
            >
              {et}
            </button>
          ))}
        </div>
      </div>

      {/* Kayıp nedeni — yalnız kaybedildi durumunda anlamlı */}
      {kaybedildi ? (
        <label className="space-y-1">
          <span className={etiketCls}>Kayıp nedeni</span>
          <input value={kayip} onChange={(e) => setKayip(e.target.value)} placeholder="Fiyat / kredi çıkmadı / başka projeden aldı / ulaşılamadı" className={inputCls} />
        </label>
      ) : null}

      <div className="flex justify-end">
        <button type="button" onClick={kaydet} disabled={bekliyor} className="btn-primary disabled:opacity-60">
          {bekliyor ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>

      {/* Takip hatırlatması */}
      <div className="border-t pt-4" style={{ borderColor: "var(--cizgi)" }}>
        <span className={etiketCls}>Takip hatırlatması</span>
        <p className="mt-0.5 mb-2 text-[12px] text-ink-soft">Belirlediğin zamanda sana bildirim düşer. Takip etmeyi unutma diye.</p>
        <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
          <input type="datetime-local" value={tarih} onChange={(e) => setTarih(e.target.value)} className={inputCls} />
          <input value={hatirNot} onChange={(e) => setHatirNot(e.target.value)} placeholder="Hatırlatma notu (ör. kredi durumunu sor)" className={inputCls} />
        </div>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => hatirlatmaKur(false)} disabled={bekliyor || !tarih} className="btn-primary flex-1 disabled:opacity-60">
            {bas.sonraki_aksiyon_at ? "Güncelle" : "Kur"}
          </button>
          {bas.sonraki_aksiyon_at ? (
            <button type="button" onClick={() => hatirlatmaKur(true)} disabled={bekliyor} className="rounded-xl border border-hair px-4 text-[13px] font-semibold text-gray hover:border-red hover:text-red disabled:opacity-60">
              Kaldır
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
