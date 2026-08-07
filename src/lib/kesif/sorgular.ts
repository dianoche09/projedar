import type { Segment } from "./tipler";

/**
 * Segment × il → Türkçe arama sorgu seti. HEDEF: yeni/aktif projesi olan müteahhit.
 * Eski/tamamlanmış projeleri elemek için sorgular YENİLİK niyeti taşır (lansman, satışta,
 * inşaat, ön satış, teslim 20xx). İl sorguya gömülür.
 *
 * Yıl gömülü sorgular tazeliği artırır ({yil} = içinde bulunulan yıl, çağrı anında basılır).
 * Maliyet: her sorgu = (Maps + Serper web + Places) × il. proje/muteahhit'te web HER ZAMAN çalışır
 * (yeni proje içeriği Maps'te değil web/portal/haberde) — bkz. kesfet().
 */
function sablon(yil: number): Record<Segment, string[]> {
  return {
    // Müteahhit = yeni projesi OLAN geliştirici (tamamlanmışı değil).
    muteahhit: [
      `{il} yeni konut projesi lansman ${yil}`,
      `{il} inşaatı devam eden konut projesi müteahhit`,
      `{il} satışta konut projesi geliştirici firma`,
      `{il} ön satış konut projesi ${yil}`,
    ],
    // Proje = yeni proje kaydı → zenginleştirmede arkasındaki müteahhide çözülür.
    proje: [
      `{il} yeni lansman konut projesi ${yil}`,
      `{il} satışta daire projesi teslim ${yil + 1}`,
      `{il} inşaat halinde konut projesi satış ofisi`,
      `{il} ön talep konut projesi yeni`,
    ],
    ofis: ["{il} emlak ofisi", "{il} yetkili satış ofisi gayrimenkul"],
    emlakci: ["{il} gayrimenkul danışmanı", "{il} proje satış danışmanı"],
  };
}

export function sorgularUret(il: string, segment: Segment, yil: number): string[] {
  const temiz = il.trim();
  return sablon(yil)[segment].map((s) => s.replace(/\{il\}/g, temiz));
}
