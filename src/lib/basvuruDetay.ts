import { PROFIL_ALANLARI, type RolAnahtar } from "@/lib/kayitAlanlar";

/** TCKN'yi KVKK-yalın maskele: ilk 3 + son 2 görünür. */
export function maskeTckn(v: string | null | undefined): string {
  const s = (v ?? "").replace(/\D/g, "");
  if (s.length !== 11) return v ?? "—";
  return `${s.slice(0, 3)}••••••${s.slice(9)}`;
}

/** Kamu doğrulaması yapılabilen belge no alanları (rol bazında) → vurgulanır. */
export const DOGRULANABILIR_ALAN: Record<string, { key: string; kaynak: string }> = {
  uretici: { key: "yetki_belge_no", kaynak: "YAMBİS / ŞANTİYE-M" },
  ofis_yetkili: { key: "tasinmaz_yetki_belge_no", kaynak: "TTBS" },
  emlakci: { key: "mys_belge_no", kaynak: "MYK / e-Devlet" },
};

export type DetaySatir = { key: string; etiket: string; deger: string; maskeli?: boolean };

/**
 * profil_detay'ı ilgili rolün alan sırası + etiketleriyle key/value satırlara çevirir.
 * kayitAlanlar.ts tek kaynak; boş alanlar atlanır; tckn maskelenir.
 */
export function profilDetaySatirlar(rol: string | null, detay: Record<string, unknown> | null): DetaySatir[] {
  const cfg = PROFIL_ALANLARI[rol as RolAnahtar];
  if (!cfg || !detay) return [];
  const out: DetaySatir[] = [];
  for (const a of cfg.alanlar) {
    const ham = detay[a.key];
    if (ham == null || `${ham}`.trim() === "") continue;
    const maskeli = a.key === "tckn";
    out.push({ key: a.key, etiket: a.etiket, deger: maskeli ? maskeTckn(`${ham}`) : `${ham}`, maskeli });
  }
  return out;
}

export const BELGE_TIP_AD: Record<string, string> = {
  mesleki_yeterlilik: "Mesleki Yeterlilik / Yetki Belgesi",
  vergi_levhasi: "Vergi Levhası",
};

export type AiSonuc = { gecerli?: boolean; skor?: number; ozet?: string } | null;

/** ai_sonuc → rozet tonu + kısa etiket. */
export function aiRozet(ai: AiSonuc): { ton: "ok" | "dikkat" | "yok"; etiket: string } {
  if (!ai || (ai.gecerli == null && ai.skor == null)) return { ton: "yok", etiket: "AI taraması yok" };
  const skor = typeof ai.skor === "number" ? ai.skor.toFixed(2) : "—";
  if (ai.gecerli) return { ton: "ok", etiket: `AI · geçerli ✓ · skor ${skor}` };
  return { ton: "dikkat", etiket: `AI · dikkat · skor ${skor}` };
}
