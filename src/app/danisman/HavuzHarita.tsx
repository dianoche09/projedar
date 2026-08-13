"use client";

import { useEffect, useRef } from "react";
import type * as L from "leaflet";
import "leaflet/dist/leaflet.css";

export type HaritaProje = {
  id: string;
  ad: string;
  il: string | null;
  ilce: string | null;
  lat: number | null;
  lng: number | null;
  toplam: number;
  musait: number;
  opsiyon: number;
  satildi: number;
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

/** Havuz harita görünümü: tahsisli projeler OSM üzerinde sinyal-renkli pin. Filtre haritaya da uygulanır. */
export function HavuzHarita({ projeler }: { projeler: HaritaProje[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const konumsuz = projeler.filter((p) => p.lat == null || p.lng == null).length;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let map: L.Map | undefined;
    let iptal = false;

    (async () => {
      const leafletMod = await import("leaflet");
      const Lmod = (leafletMod.default ?? leafletMod) as typeof import("leaflet");
      if (iptal || !ref.current) return;
      const konumlu = projeler.filter((p) => p.lat != null && p.lng != null);

      map = Lmod.map(el, { scrollWheelZoom: false, attributionControl: false }).setView([39.0, 35.2], 6);
      Lmod.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

      const noktalar: [number, number][] = [];
      konumlu.forEach((p) => {
        const renk = p.musait > 0 ? "#2fb36b" : p.opsiyon > 0 ? "#e3a12c" : "#d15a4e";
        const rozet = p.musait > 0 ? p.musait : p.opsiyon > 0 ? p.opsiyon : "";
        const icon = Lmod.divIcon({
          className: "",
          html: `<span style="display:flex;width:26px;height:26px;align-items:center;justify-content:center;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${renk};color:#fff;font:700 11px/1 ui-sans-serif,system-ui;box-shadow:0 3px 8px rgba(8,20,34,.35);border:2px solid #fff"><span style="transform:rotate(45deg)">${rozet}</span></span>`,
          iconSize: [26, 26],
          iconAnchor: [13, 24],
          popupAnchor: [0, -22],
        });
        const konum = esc([p.ilce, p.il].filter(Boolean).join(", ") || "");
        Lmod.marker([p.lat as number, p.lng as number], { icon })
          .addTo(map as L.Map)
          .bindPopup(
            `<div style="min-width:184px;font:400 12.5px/1.45 ui-sans-serif,system-ui">
               <strong style="font-size:14px;color:#10243a">${esc(p.ad)}</strong><br/>
               <span style="color:#667">${konum}</span><br/>
               <span style="color:#10243a;font-weight:700">${p.toplam} birim</span>
               <span style="color:#1f7d4c;font-weight:600">· ${p.musait} müsait</span><br/>
               <span style="color:#9a6a12">${p.opsiyon} opsiyon</span>
               <span style="color:#b0526a">· ${p.satildi} satıldı</span><br/>
               <a href="/danisman/proje/${p.id}" style="display:inline-block;margin-top:6px;color:#1e9b8a;font-weight:700;text-decoration:none">İncele →</a>
             </div>`,
          );
        noktalar.push([p.lat as number, p.lng as number]);
      });

      if (noktalar.length) map.fitBounds(noktalar, { padding: [44, 44], maxZoom: 13 });
    })();

    return () => {
      iptal = true;
      if (map) map.remove();
    };
  }, [projeler]);

  return (
    <div className="belir">
      <div ref={ref} className="h-[560px] w-full overflow-hidden rounded-2xl border border-[var(--cizgi-2)] bg-[var(--color-soft)] shadow-sm" />
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-[var(--ink-faint)]">
        <span className="flex items-center gap-1.5"><span className="freshdot" style={{ background: "var(--color-green)" }} /> Müsait var</span>
        <span className="flex items-center gap-1.5"><span className="freshdot" style={{ background: "var(--color-amber)" }} /> Opsiyonlu</span>
        <span className="flex items-center gap-1.5"><span className="freshdot" style={{ background: "var(--color-red)" }} /> Satıldı</span>
        {konumsuz > 0 ? <span className="ml-auto">{konumsuz} projenin konumu girilmemiş, haritada görünmez.</span> : null}
      </div>
    </div>
  );
}
