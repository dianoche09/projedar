import { createAdminClient } from "@/lib/supabase/admin";
import { GeriLink, SayfaBaslik } from "../_ortak";
import { zamanOnce } from "@/lib/types";
import { CsvIndir, type KurucuSatir } from "./CsvIndir";

// Kurucu Üyelik popup'ından gelen e-posta kayıtları (events tip=kurucu).
// Ayrı tablo yok; e-posta bazında tekilleştirilir (en son kayıt).

const ROL_ETIKET: Record<string, string> = {
  uretici: "Proje sahibi",
  emlakci: "Danışman",
  ofis_yetkili: "Ofis",
};

export default async function KurucuSayfasi() {
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return (
      <div className="mx-auto max-w-[1000px] space-y-4 px-4 py-6 sm:px-6">
        <GeriLink href="/admin" etiket="Genel Bakış" />
        <SayfaBaslik baslik="Kurucu Kayıtlar" altEtiket={<span className="text-gray">Lansman listesi</span>} />
        <div className="kart p-8 text-center text-sm text-gray">Liste şu an okunamıyor; servis anahtarı tanımlı değil.</div>
      </div>
    );
  }

  const { data } = await admin
    .from("events")
    .select("id, payload, created_at")
    .eq("tip", "kurucu")
    .order("created_at", { ascending: false })
    .limit(2000);

  // e-posta bazında tekilleştir (en yeni kayıt kalır)
  const gorulen = new Set<string>();
  const satirlar: KurucuSatir[] = [];
  let toplamHam = 0;
  for (const e of data ?? []) {
    const p = (e.payload ?? {}) as Record<string, unknown>;
    const email = typeof p.email === "string" ? p.email.trim().toLowerCase() : "";
    if (!email) continue;
    toplamHam++;
    if (gorulen.has(email)) continue;
    gorulen.add(email);
    satirlar.push({
      email,
      rol: typeof p.rol === "string" && p.rol ? p.rol : null,
      kaynak: typeof p.kaynak === "string" && p.kaynak ? p.kaynak : null,
      tarih: e.created_at as string,
    });
  }
  const tekil = satirlar.length;

  return (
    <div className="mx-auto max-w-[1000px] space-y-4 px-4 py-6 sm:px-6">
      <GeriLink href="/admin" etiket="Genel Bakış" />
      <SayfaBaslik
        baslik="Kurucu Kayıtlar"
        noktaRenk={tekil > 0 ? "var(--color-teal)" : "var(--color-gray)"}
        altEtiket={
          <>
            <span className="font-medium">{tekil} tekil e-posta</span>
            <span className="text-hair">·</span>
            <span className="mono text-xs text-gray">lansman popup · {toplamHam} kayıt</span>
          </>
        }
        sag={<CsvIndir satirlar={satirlar} />}
      />

      {tekil === 0 ? (
        <div className="kart px-5 py-16 text-center">
          <p className="text-sm font-semibold text-ink">Henüz kurucu kaydı yok</p>
          <p className="mt-1 text-xs text-gray">Lansman popup&apos;ından e-posta bırakanlar burada birikir.</p>
        </div>
      ) : (
        <div className="kart overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="tbl w-full">
              <thead>
                <tr>
                  <th className="text-left">E-posta</th>
                  <th className="text-left">İlgi</th>
                  <th className="text-left">Kaynak</th>
                  <th className="text-right">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {satirlar.map((s) => (
                  <tr key={s.email}>
                    <td className="font-medium text-ink">{s.email}</td>
                    <td>
                      {s.rol ? (
                        <span className="rozet bg-navy/10 text-navy">{ROL_ETIKET[s.rol] ?? s.rol}</span>
                      ) : (
                        <span className="text-gray">—</span>
                      )}
                    </td>
                    <td className="mono text-[12px] text-gray">{s.kaynak ?? "—"}</td>
                    <td className="mono text-right text-[12px] text-gray">{zamanOnce(s.tarih)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
