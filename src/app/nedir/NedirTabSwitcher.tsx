"use client";

import { useState } from "react";

type TabId = "konsol" | "manifesto" | "sahne";

interface TabItem {
  id: TabId;
  label: string;
  badge: string;
  desc: string;
  src: string;
  highlights: string[];
}

const TABS: TabItem[] = [
  {
    id: "konsol",
    label: "Konsept 1 · Canlı Ürün Konsolu",
    badge: "B2B Kokpit & Simülatör",
    desc: "Ürünün kendisi anlatsın. Üretici Kokpiti ↔ Emlakçı Havuzu canlı stok durumu ve opsiyon kilitleme simülasyonu.",
    src: "/mockups/v3-nedir-1-konsol.html",
    highlights: ["Real-time DB Stok Kilidi", "Granüler Tahsis Kapısı", "● 2 Dakika Önce Güncellendi"],
  },
  {
    id: "manifesto",
    label: "Konsept 2 · Editoryal Manifesto",
    badge: "Tipografi & Berrak Güven",
    desc: "Dağınık Excel/WhatsApp kaosu ile Projedar'ın 'Tek Doğru Bilgi' vaadi arasındaki farkı kinetik tipografi ve dürüst matrisle sunar.",
    src: "/mockups/v3-nedir-2-manifesto.html",
    highlights: ["Tek Doğru Bilgi İlkesi", "Eski vs Yeni Karşılaştırması", "Şeffaf İz Zinciri Akışı"],
  },
  {
    id: "sahne",
    label: "Konsept 3 · Sakin Ürün Sahnesi",
    badge: "Apple Minimalist Beat'ler",
    desc: "Az beat, dev nefes alan alanlar. Her bölümde tek bir temel ilkeyi (DB Çift-Satış Kalkanı, Granüler Tahsis) dev ürün kesitiyle kanıtlar.",
    src: "/mockups/v3-nedir-3-sahne.html",
    highlights: ["DB Çift-Satış Kalkanı", "Granüler Tahsis Yetkisi", "Emlakçı Paylaşım Mikrositesi"],
  },
];

export function NedirTabSwitcher() {
  const [activeTab, setActiveTab] = useState<TabId>("konsol");
  const current = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="w-full">
      {/* SEKMELER / TAB CONTROLS */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#13314B]/5 border border-[var(--cizgi)]">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-display text-sm font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#13314B] text-white shadow-md shadow-[#13314B]/15 scale-[1.01]"
                  : "bg-transparent text-ink-soft hover:text-ink hover:bg-white/60"
              }`}
            >
              <span className={`size-2 rounded-full ${isActive ? "bg-teal animate-pulse" : "bg-ink-soft/40"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* AKTİF SEKME BİLGİ & AÇIKLAMA */}
      <div className="mt-6 rounded-2xl border border-[var(--cizgi)] bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--cizgi)] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-teal uppercase tracking-widest bg-teal/10 px-2.5 py-0.5 rounded-md">
                {current.badge}
              </span>
              <span className="font-mono text-[11px] text-ink-soft">● Canlı İnteraktif Önizleme</span>
            </div>
            <h3 className="mt-2 font-display text-xl font-bold text-ink sm:text-2xl">{current.label}</h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">{current.desc}</p>
          </div>

          <a
            href={current.src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#13314B] px-4 py-2.5 font-display text-xs font-semibold text-white transition-all hover:bg-teal shrink-0"
          >
            Tam Ekran Aç ↗
          </a>
        </div>

        {/* HIGHLIGHTS / ÖNE ÇIKAN İLKELER */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-ink-soft uppercase tracking-wider mr-2">Öne Çıkanlar:</span>
          {current.highlights.map((h) => (
            <span key={h} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--cizgi)] bg-[var(--soft)] px-3 py-1 text-xs font-medium text-ink">
              <span className="text-teal font-bold">✓</span> {h}
            </span>
          ))}
        </div>

        {/* PREVIEW FRAME / CANVAS */}
        <div className="mt-6 relative w-full overflow-hidden rounded-xl border border-[var(--cizgi)] bg-[#0a1420] shadow-inner aspect-[16/10] sm:aspect-[16/9]">
          <iframe
            src={current.src}
            title={current.label}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
