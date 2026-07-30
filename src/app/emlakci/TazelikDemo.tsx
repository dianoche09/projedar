"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tazelik rozet sistemi mini demosu, "● X önce" imzasının yeşil→amber→kırmızı
 * geçişini canlı gösterir. Gün otomatik akar; kaydırıcıyla elle de gezilir
 * (elle dokununca otomatik akış kısa süre durur). Eşikler globals.css .taze ile birebir.
 */

const SON_GUN = 21;

function tazeGorsel(gun: number): { sinif: string; etiket: string } {
  if (gun <= 0) return { sinif: "t-0", etiket: "2 dk önce" };
  if (gun <= 7) return { sinif: "t-7", etiket: `${gun} gün önce` };
  if (gun <= 15) return { sinif: "t-15", etiket: `${gun} gün önce` };
  return { sinif: "t-eski", etiket: `${gun} gün önce` };
}

function tazeMesaj(gun: number): { rozet: string; baslik: string; metin: string } {
  if (gun <= 7)
    return { rozet: "d-musait", baslik: "Taze, paylaş", metin: "Veri güncel; gönül rahatlığıyla müşterine gönder." };
  if (gun <= 15)
    return { rozet: "d-opsiyon", baslik: "Eskiyor, teyit et", metin: "Rozet sarıya döndü; paylaşmadan önce havuzdaki canlı değere bak." };
  return { rozet: "d-satildi", baslik: "Eski, paylaşma", metin: "Bu ekran görüntüsüne güvenme; canlı havuz zaten doğrusunu gösteriyor." };
}

export function TazelikDemo() {
  const [gun, setGun] = useState(0);
  const [duraklat, setDuraklat] = useState(false);
  const devamZamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (duraklat) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const aralik = setInterval(() => setGun((g) => (g >= SON_GUN ? 0 : g + 1)), 900);
    return () => clearInterval(aralik);
  }, [duraklat]);

  useEffect(() => {
    return () => {
      if (devamZamanlayici.current) clearTimeout(devamZamanlayici.current);
    };
  }, []);

  const elleAyarla = (deger: number) => {
    setGun(deger);
    setDuraklat(true);
    if (devamZamanlayici.current) clearTimeout(devamZamanlayici.current);
    devamZamanlayici.current = setTimeout(() => setDuraklat(false), 4000);
  };

  const gorsel = tazeGorsel(gun);
  const mesaj = tazeMesaj(gun);

  return (
    <div className="kart relative overflow-hidden p-0">
      <span className="absolute right-4 top-4 z-10 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
        örnek görünüm
      </span>

      {/* örnek birim satırı, rozet gün ilerledikçe renk değiştirir */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--cizgi)] bg-[var(--color-soft)] px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[13px] font-semibold text-ink">A-7-2</span>
            <span className="font-mono text-[11px] text-ink-soft">3+1 · 142 m²</span>
          </div>
          <span className={`taze mt-1 ${gorsel.sinif}`}>
            <span className={`nokta ${gun <= 0 ? "nabiz" : ""}`} /> {gorsel.etiket}
          </span>
        </div>
        <span className="font-mono text-[17px] font-semibold text-ink">₺8,75M</span>
      </div>

      {/* zaman kaydırıcısı, son güncellemeden bu yana geçen gün */}
      <div className="px-5 py-4">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[10.5px] text-[var(--ink-faint)]">
          <span>Son güncellemeden bu yana</span>
          <span className="font-semibold text-ink">{gun === 0 ? "bugün" : `${gun}. gün`}</span>
        </div>
        <input
          type="range"
          min={0}
          max={SON_GUN}
          step={1}
          value={gun}
          onChange={(e) => elleAyarla(Number(e.target.value))}
          className="w-full accent-teal"
          aria-label="Son güncellemeden bu yana geçen gün"
        />
        <div className="mt-0.5 flex justify-between font-mono text-[9.5px] text-[var(--ink-faint)]">
          <span>bugün</span>
          <span>7 gün</span>
          <span>15 gün</span>
          <span>21+ gün</span>
        </div>
      </div>

      {/* durum mesajı */}
      <div className="flex items-start gap-3 border-t border-[var(--cizgi)] px-5 py-4">
        <span className={`durum ${mesaj.rozet} mt-0.5`}><span className="nokta" />{mesaj.baslik}</span>
        <p className="text-[13px] leading-relaxed text-ink-soft">{mesaj.metin}</p>
      </div>
    </div>
  );
}
