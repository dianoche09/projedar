"use server";

import { z } from "zod";
import { kayitYaz } from "@/lib/events";

/**
 * Lansman "Kurucu Üyelik" popup'ından e-posta yakalama.
 * Ayrı tablo değil events(tip=kurucu) olarak toplanır (şema değişikliği yok, /admin/denetim'de görünür).
 * KVKK + ticari elektronik ileti onayı zorunlu; honeypot ile bot elenir. Stok/fiyat yazımı yok.
 */
const Sema = z.object({
  email: z.string().trim().email("Geçerli e-posta").max(160),
  rol: z.string().trim().max(20).optional(),
  kaynak: z.string().trim().max(60).optional(),
  kvkk: z.boolean(),
  hp: z.string().optional(), // honeypot (name=sirket)
});

export type KurucuSonuc = { ok: true } | { ok: false; hata: string };

export async function kurucuKayit(girdi: unknown): Promise<KurucuSonuc> {
  const p = Sema.safeParse(girdi);
  if (!p.success) return { ok: false, hata: "Geçerli bir e-posta ve onay gerekli." };
  const { hp, email, rol, kaynak, kvkk } = p.data;
  if (hp && hp.trim().length > 0) return { ok: true }; // bot: sessizce yut, başarı göster
  if (!kvkk) return { ok: false, hata: "Devam için onay gerekli." };

  await kayitYaz({
    tip: "kurucu",
    payload: { email, rol: rol || null, kvkk: true, kaynak: kaynak || "lansman_popup" },
  });
  return { ok: true };
}
