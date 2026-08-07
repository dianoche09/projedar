import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { GeriLink, SayfaBaslik, Uyari } from "../_ortak";
import { pazarlamaAyarKaydet } from "./actions";

/** BYOK entegrasyon anahtarları — kullanıcı kendi API anahtarlarını girer; motorlar buradan okur. */
type Ayar = Record<string, string | null>;

const GRUPLAR: {
  baslik: string;
  faz: string;
  aciklama: string;
  alanlar: { name: string; etiket: string; ipucu: string }[];
}[] = [
  {
    baslik: "Kart / Karusel üretimi",
    faz: "gerekli",
    aciklama: "Görsel içerik (tekli kart + karusel) üretmek için minimum gereken iki anahtar.",
    alanlar: [
      { name: "claude_key", etiket: "Anthropic Claude API Key", ipucu: "console.anthropic.com → API Keys" },
      { name: "fal_key", etiket: "fal.ai API Key", ipucu: "fal.ai/dashboard/keys" },
    ],
  },
  {
    baslik: "Sesli Reel",
    faz: "sonraki faz",
    aciklama: "Seslendirilmiş kinetik-altyazılı reel üretimi. Harici ffmpeg derleyici (kutu) sunucusu gerektirir.",
    alanlar: [
      { name: "elevenlabs_key", etiket: "ElevenLabs API Key", ipucu: "elevenlabs.io → Profile → API Key" },
      { name: "render_url", etiket: "Reel Derleyici URL (ffmpeg kutu)", ipucu: "ör. https://render.sunucu.com" },
      { name: "render_token", etiket: "Reel Derleyici Token", ipucu: "kutu servisinin x-remux-token değeri" },
    ],
  },
  {
    baslik: "Otomatik Yayın",
    faz: "sonraki faz",
    aciklama: "İçeriği tüm platformlara (IG/LinkedIn/X/FB/YouTube/TikTok) tek noktadan yayınlamak için Publer.",
    alanlar: [
      { name: "publer_key", etiket: "Publer API Key", ipucu: "Publer Business planı → Settings → API" },
      { name: "publer_workspace_id", etiket: "Publer Workspace ID (opsiyonel)", ipucu: "boşsa ilk workspace otomatik seçilir" },
    ],
  },
  {
    baslik: "Keşif & Davet Motoru",
    faz: "gerekli",
    aciklama:
      "Müteahhit/proje/emlak ofisi adaylarını web'den keşfetmek için arama anahtarları. En az biri gerekli.",
    alanlar: [
      { name: "serpapi_key", etiket: "SerpAPI API Key", ipucu: "serpapi.com → Api Key (Google Maps + web)" },
      { name: "serper_key", etiket: "Serper API Key (opsiyonel)", ipucu: "serper.dev → API Key (web fallback)" },
      { name: "places_key", etiket: "Google Places API Key (opsiyonel)", ipucu: "console.cloud.google.com → Places API" },
    ],
  },
];

export default async function PazarlamaSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ mesaj?: string; hata?: string }>;
}) {
  const sp = await searchParams;

  let ayar: Ayar = {};
  let yukleHata: string | undefined;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("pazarlama_entegrasyon")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    ayar = (data ?? {}) as Ayar;
  } catch {
    yukleHata = "Service-role anahtarı tanımlı değil — anahtarlar okunamıyor (.env + Vercel).";
  }

  const maske = (v: string | null | undefined) =>
    v && String(v).length > 0 ? "•••• " + String(v).slice(-4) : null;

  const tanimliSay = GRUPLAR.flatMap((g) => g.alanlar).filter(
    (a) => ayar[a.name] && String(ayar[a.name]).length > 0,
  ).length;
  const toplamAlan = GRUPLAR.flatMap((g) => g.alanlar).length;

  return (
    <div className="mx-auto max-w-[900px] space-y-4 px-4 py-6 sm:px-6">
      <GeriLink href="/admin" etiket="Genel Bakış" />

      <SayfaBaslik
        baslik="Pazarlama Entegrasyonları"
        altEtiket={
          <>
            <span className="font-medium">{tanimliSay}/{toplamAlan} anahtar tanımlı</span>
            <span className="text-hair">·</span>
            <span className="mono text-xs text-gray">kendi API anahtarların · sunucuda saklanır, panele geri gönderilmez</span>
          </>
        }
        sag={
          <>
            <Link
              href="/admin/pazarlama/kesif"
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(150deg,#1b5e6e,#1e9b8a)" }}
            >
              Keşif Motoru →
            </Link>
            <span className="rozet mono bg-navy/10 text-navy">BYOK</span>
          </>
        }
      />

      <p className="text-sm text-ink-soft">
        Sosyal içerik motoru bu anahtarları kullanır. Kendi hesaplarından üret; maliyet ve kotalar sana ait.
        Güvenlik için mevcut anahtarlar burada gösterilmez (yalnız son 4 hane). Bir alanı boş bırakırsan
        değeri korunur; temizlemek için tek başına <span className="mono">-</span> yaz.
      </p>

      <Uyari hata={sp.hata ?? yukleHata} mesaj={sp.mesaj} />

      <form action={pazarlamaAyarKaydet} className="space-y-4">
        {GRUPLAR.map((g) => (
          <section key={g.baslik} className="belir belir-1 rounded-2xl border border-hair bg-card p-5">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="font-display text-[16px] font-bold text-ink">{g.baslik}</h2>
              <span
                className={`rozet mono text-[11px] ${
                  g.faz === "gerekli" ? "bg-teal/10 text-teal-d" : "bg-soft text-gray"
                }`}
              >
                {g.faz}
              </span>
            </div>
            <p className="mb-4 text-[13px] text-ink-soft">{g.aciklama}</p>

            <div className="space-y-3.5">
              {g.alanlar.map((a) => {
                const m = maske(ayar[a.name]);
                return (
                  <label key={a.name} className="block">
                    <span className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-ink">
                      {a.etiket}
                      {m ? (
                        <span className="rozet mono bg-teal/10 text-[11px] text-teal-d">{m}</span>
                      ) : (
                        <span className="rozet mono bg-soft text-[11px] text-gray">girilmedi</span>
                      )}
                    </span>
                    <input
                      type="password"
                      name={a.name}
                      autoComplete="off"
                      defaultValue=""
                      placeholder={m ? "Değiştirmek için yeni anahtar yaz" : a.ipucu}
                      className="w-full rounded-xl border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-teal"
                    />
                    <span className="mt-1 block text-[11.5px] text-gray">{a.ipucu}</span>
                  </label>
                );
              })}
            </div>
          </section>
        ))}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(150deg,#1b5e6e,#1e9b8a)" }}
          >
            Anahtarları Kaydet
          </button>
          <span className="text-[12px] text-gray">Boş alanlar korunur · yalnız yazdıkların güncellenir.</span>
        </div>
      </form>
    </div>
  );
}
