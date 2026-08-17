import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { zamanOnce } from "@/lib/types";
import { LeadDurum } from "../LeadDurum";
import { LeadNotForm } from "./LeadNotForm";
import { LeadDuzenlePanel } from "./LeadDuzenlePanel";
import { TutTalebiOpsiyon } from "./TutTalebiOpsiyon";

export const dynamic = "force-dynamic";

const DURUM_ET: Record<string, string> = {
  yeni: "Yeni", arandi: "Arandı", gorusme: "Görüşme", opsiyon: "Opsiyon", kazanildi: "Kazanıldı", kaybedildi: "Kayıp",
};
const NIYET_ET: Record<string, string> = {
  bilgi: "Bilgi istedi", randevu: "Randevu istedi", on_rezervasyon: "Almak istiyor",
};
const NOT_TIP_ET: Record<string, string> = {
  not: "Not", arama: "Arama", whatsapp: "WhatsApp", gorusme: "Görüşme", sistem: "Sistem",
};

/** Stok-bağlı olay → insan etiketi (timeline). */
function olayEtiket(tip: string, payload: Record<string, unknown> | null): string {
  switch (tip) {
    case "paylasim": return "Bu birimi paylaştın";
    case "goruntuleme": return "Müşteri paylaşım linkine baktı";
    case "lead": return "Lead oluştu (paylaşımdan)";
    case "durum": return `Durum → ${DURUM_ET[String(payload?.durum ?? "")] ?? payload?.durum}`;
    case "opsiyon": return "Opsiyon hareketi";
    default: return tip;
  }
}

type TimelineOge = { ts: string; kaynak: "not" | "olay"; etiket: string; govde?: string | null; tip?: string };

export default async function LeadDetay({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS lead_select → yalnız sahibi (atanan/ilk_paylasan) veya admin görür.
  const { data: lead } = await supabase
    .from("lead")
    .select(
      "id, ad, telefon, telefon_norm, durum, niyet, kaynak, kvkk_riza, created_at, son_temas_at, updated_at, email, butce, ihtiyac_notu, etiket, sicaklik, kayip_nedeni, sonraki_aksiyon_at, sonraki_aksiyon_notu, birim_id, proje_id, birim:birim_id(daire_no, durum, satilabilir), proje:proje_id(ad, opsiyon_ayar)"
    )
    .eq("id", id)
    .single();

  if (!lead) notFound();

  const proje = lead.proje as { ad?: string; opsiyon_ayar?: { yontem?: string } | null } | null;
  const birim = lead.birim as { daire_no?: string; durum?: string; satilabilir?: boolean } | null;
  const tel = (lead.telefon ?? "").replace(/\D/g, "");
  // D1/Option B: yüksek-niyet ("almak istiyorum") + birim hâlâ müsait + lead açık → tek-tık gerçek opsiyon köprüsü.
  const acikLead = !["kazanildi", "kaybedildi"].includes(lead.durum);
  const tutTalebi = lead.niyet === "on_rezervasyon" && acikLead && lead.birim_id && lead.proje_id;
  const birimMusait = birim?.durum === "musait" && birim?.satilabilir === true;
  // opsiyon_al_gecici ile aynı çözümleme (coalesce(...,'gecici')): 'onay' ise geçici-opsiyon RPC'si reddeder
  // → buton yerine talep-akışı notu göster (dead-end buton olmasın).
  const opsYontem = proje?.opsiyon_ayar?.yontem ?? "gecici";

  // Notlar (RLS lead_not_select)
  const { data: notlar } = await supabase
    .from("lead_not")
    .select("id, tip, govde, created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  // Stok-bağlı olaylar: bu lead'e özel (lead/durum) + bu birimin paylaşım/görüntüleme izleri
  const { data: leadOlay } = await supabase
    .from("events")
    .select("tip, payload, created_at")
    .eq("payload->>lead_id", id)
    .order("created_at", { ascending: false })
    .limit(50);
  const { data: birimOlay } = lead.birim_id
    ? await supabase
        .from("events")
        .select("tip, payload, created_at")
        .eq("birim_id", lead.birim_id)
        .in("tip", ["paylasim", "goruntuleme"])
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] as { tip: string; payload: Record<string, unknown> | null; created_at: string }[] };

  // Çift-lead: aynı telefon başka lead kaydında mı (RLS ile zaten kendi leadlerin)
  let cift = 0;
  if (lead.telefon_norm) {
    const { count } = await supabase
      .from("lead")
      .select("id", { count: "exact", head: true })
      .eq("telefon_norm", lead.telefon_norm);
    cift = (count ?? 1) - 1;
  }

  // Timeline birleştir
  const timeline: TimelineOge[] = [
    ...(notlar ?? []).map((n) => ({ ts: n.created_at, kaynak: "not" as const, etiket: NOT_TIP_ET[n.tip] ?? "Not", govde: n.govde, tip: n.tip })),
    ...([...(leadOlay ?? []), ...(birimOlay ?? [])] as { tip: string; payload: Record<string, unknown> | null; created_at: string }[]).map((e) => ({
      ts: e.created_at,
      kaynak: "olay" as const,
      etiket: olayEtiket(e.tip, e.payload),
      tip: e.tip,
    })),
  ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  const SICAKLIK_ET: Record<string, string> = { sicak: "Sıcak", ilik: "Ilık", soguk: "Soğuk" };

  return (
    <div className="mx-auto max-w-[760px] text-ink">
      <Link href="/danisman/leadler" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-teal-d hover:underline">
        ← Lead&apos;lerim
      </Link>

      {/* Başlık kartı */}
      <div className="kart kart-3d p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[24px] font-bold leading-none tracking-tight text-navy">{lead.ad || "İsimsiz aday"}</h1>
              {lead.niyet && lead.niyet !== "bilgi" ? (
                <span className="lead-pill" style={{ background: "rgba(47,179,107,.14)", color: "var(--color-green)" }}>
                  {NIYET_ET[lead.niyet] ?? lead.niyet}
                </span>
              ) : null}
              {lead.sicaklik ? (
                <span className="lead-pill" style={{ background: "rgba(19,49,75,.08)", color: "var(--color-navy)" }}>
                  {SICAKLIK_ET[lead.sicaklik] ?? lead.sicaklik}
                </span>
              ) : null}
            </div>
            <a href={`tel:${lead.telefon}`} className="mono mt-1.5 inline-block text-[14px] font-semibold text-teal-d hover:underline">
              {lead.telefon || "—"}
            </a>
            <p className="mt-1.5 text-[12.5px] text-ink-soft">
              {proje?.ad ?? "—"}
              {birim?.daire_no ? ` · Daire ${birim.daire_no}` : ""} · {zamanOnce(lead.created_at)}
              {lead.son_temas_at ? ` · son temas ${zamanOnce(lead.son_temas_at)}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${lead.telefon}`} className="btn-primary">Ara</a>
            <a href={`https://wa.me/${tel}`} target="_blank" rel="noopener noreferrer" className="btn-wa">WhatsApp</a>
          </div>
        </div>

        {/* Kim getirdi — güven/sahiplik */}
        <div className="mt-4 flex items-start gap-2 rounded-xl p-3" style={{ background: "rgba(30,155,138,.07)" }}>
          <span className="freshdot mt-1.5" style={{ background: "var(--color-teal)" }} />
          <p className="text-[12.5px] text-ink-soft">
            <strong className="text-ink">İlk bayrağı sen diktin.</strong> Bu müşteri senin paylaşımından doğdu ve yalnız sana görünür. Kimse göremez, kimse alamaz.
          </p>
        </div>

        {/* D1: "Almak istiyorum" talebi → gerçek geçici opsiyon köprüsü (danışman başlatır, müteahhit doğrular) */}
        {tutTalebi ? (
          <div className="mt-3 rounded-xl border border-teal/25 p-3.5" style={{ background: "rgba(30,155,138,.06)" }}>
            <p className="text-[12.5px] font-semibold text-ink">
              Müşteri bu daireyi <strong>almak istediğini</strong> belirtti.
            </p>
            {!birimMusait ? (
              <p className="mt-1 text-[12px] text-ink-soft">
                Bu daire artık müsait değil ({birim?.durum ?? "—"}) — opsiyon alınamaz. Müşteriye alternatif öner.
              </p>
            ) : opsYontem === "onay" ? (
              <p className="mt-1 text-[12px] text-ink-soft">
                Bu projede opsiyon <strong>önce-onay</strong> yöntemiyle alınır. Daire detayından opsiyon talebi oluştur;
                müteahhit onaylayınca kilit doğar.
              </p>
            ) : (
              <>
                <p className="mt-1 mb-2.5 text-[12px] text-ink-soft">
                  Uygunsa müşteri adına geçici opsiyon alarak tut — müşteri bilgisi ön-dolu. Kilit müteahhit doğrulamasına gider.
                </p>
                <TutTalebiOpsiyon
                  birimId={lead.birim_id as string}
                  projeId={lead.proje_id as string}
                  musteriAd={lead.ad ?? ""}
                  musteriTel={lead.telefon ?? ""}
                />
              </>
            )}
          </div>
        ) : null}

        {cift > 0 ? (
          <div className="mt-2 flex items-start gap-2 rounded-xl p-3" style={{ background: "rgba(227,161,44,.12)" }}>
            <span className="freshdot mt-1.5" style={{ background: "var(--color-amber)" }} />
            <p className="text-[12.5px] text-ink-soft">
              Bu telefon numarası <strong className="text-ink">{cift}</strong> ayrı lead kaydında daha var. Aynı müşteri olabilir, mükerrer takibe dikkat.
            </p>
          </div>
        ) : null}

        {/* Durum ilerletme */}
        <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--cizgi)" }}>
          <span className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">Durum</span>
          <div className="mt-2">
            <LeadDurum leadId={lead.id} durum={lead.durum} />
          </div>
        </div>
      </div>

      {/* Not ekleme */}
      <div className="belir mt-5 kart p-5">
        <h2 className="mb-3 font-display text-[16px] font-bold text-ink">Aktivite ekle</h2>
        <LeadNotForm leadId={lead.id} />
      </div>

      {/* Müşteri detayı + hatırlatma */}
      <div className="belir mt-5 kart p-5">
        <h2 className="mb-3 font-display text-[16px] font-bold text-ink">Müşteri detayı</h2>
        <LeadDuzenlePanel
          leadId={lead.id}
          kaybedildi={lead.durum === "kaybedildi"}
          bas={{
            email: lead.email ?? null,
            butce: lead.butce ?? null,
            ihtiyac_notu: lead.ihtiyac_notu ?? null,
            etiket: (lead.etiket as string[] | null) ?? null,
            sicaklik: lead.sicaklik ?? null,
            kayip_nedeni: lead.kayip_nedeni ?? null,
            sonraki_aksiyon_at: lead.sonraki_aksiyon_at ?? null,
            sonraki_aksiyon_notu: lead.sonraki_aksiyon_notu ?? null,
          }}
        />
      </div>

      {/* Zaman çizelgesi (stok-bağlı + notlar) */}
      <div className="belir mt-5 kart p-5">
        <h2 className="mb-3 font-display text-[16px] font-bold text-ink">Zaman çizelgesi</h2>
        {timeline.length === 0 ? (
          <p className="text-[13px] text-ink-soft">Henüz hareket yok. İlk notunu ekle veya durumu ilerlet.</p>
        ) : (
          <ol className="space-y-3">
            {timeline.map((o, i) => (
              <li key={`${o.kaynak}-${i}-${o.ts}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1.5 size-2 rounded-full" style={{ background: o.kaynak === "not" ? "var(--color-navy)" : "var(--color-teal)" }} />
                  {i < timeline.length - 1 ? <span className="w-px flex-1" style={{ background: "var(--cizgi-2)" }} /> : null}
                </div>
                <div className="min-w-0 pb-1">
                  <p className="text-[13px] font-semibold text-ink">{o.etiket}</p>
                  {o.govde ? <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-soft">{o.govde}</p> : null}
                  <p className="mt-0.5 text-[11.5px] text-ink-soft">{zamanOnce(o.ts)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
