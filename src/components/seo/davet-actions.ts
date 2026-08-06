"use server";
import { z } from "zod";
import { kayitYaz } from "@/lib/events";

/**
 * SEO proje sayfası davet pop-up'ından gelen MÜŞTERİ talebi.
 * Platform "jenerik" lead: events(tip=lead) olarak toplanır, OTOMATIK forward YOK
 * (admin değerlendirir). KVKK onayı zorunlu; stok/fiyat yazımı yok (DEĞİŞMEZ korunur).
 */
const Sema = z.object({
  ad: z.string().trim().min(2).max(80),
  telefon: z.string().trim().min(7).max(24).regex(/^[0-9+()\s-]+$/),
  slug: z.string().trim().min(1).max(160),
  projeAd: z.string().trim().max(200).nullable().optional(),
  kvkk: z.boolean(),
  hp: z.string().optional(), // honeypot
});

export type TalepSonuc = { ok: true } | { ok: false; hata: string };

export async function musteriTalebi(girdi: unknown): Promise<TalepSonuc> {
  const p = Sema.safeParse(girdi);
  if (!p.success) return { ok: false, hata: "Lütfen ad, geçerli telefon ve KVKK onayını gir." };
  const { hp, ad, telefon, slug, projeAd, kvkk } = p.data;
  if (hp && hp.trim().length > 0) return { ok: true }; // bot: sessizce yut, başarı göster
  if (!kvkk) return { ok: false, hata: "Devam için KVKK onayı gerekli." };
  await kayitYaz({
    tip: "lead",
    payload: { ad, telefon, slug, projeAd: projeAd ?? null, kvkk: true, kaynak: "proje_seo_popup" },
  });
  return { ok: true };
}
