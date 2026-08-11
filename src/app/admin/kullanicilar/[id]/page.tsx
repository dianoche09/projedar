import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROL_ETIKET, type Rol } from "@/lib/roller";
import { HESAP_DURUM_ETIKET, HESAP_DURUM_ROZET, zamanOnce, type HesapDurum } from "@/lib/types";
import { hesapDurumDegistir } from "../../actions";
import { Avatar, GeriLink, Uyari } from "../../_ortak";
import { SifreSifirlaButon } from "./SifreSifirlaButon";

const DURUMLAR: HesapDurum[] = ["aktif", "pasif", "askida", "arsivli"];

function Satir({ etiket, deger }: { etiket: string; deger: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-hair py-2.5 first:border-t-0">
      <span className="text-[13px] text-gray">{etiket}</span>
      <span className="text-[13px] font-semibold text-ink">{deger}</span>
    </div>
  );
}

export default async function KullaniciDetay({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hata?: string; mesaj?: string }>;
}) {
  const { id } = await params;
  const { hata, mesaj } = await searchParams;
  const supabase = await createClient();
  const { data: k } = await supabase
    .from("profiles")
    .select("id, ad, rol, durum, ofis_id, telefon, son_giris, talep_rol, created_at")
    .eq("id", id)
    .single();
  if (!k) notFound();
  const { data: ofis } = k.ofis_id
    ? await supabase.from("ofis").select("id, ad").eq("id", k.ofis_id).single()
    : { data: null };

  // E-posta ve auth durumu auth.users'ta (profiles'ta yok) → service-role ile çek (yalnız server).
  let email: string | null = null;
  let emailDogrulandi = false;
  let authSonGiris: string | null = null;
  try {
    const admin = createAdminClient();
    const { data: au } = await admin.auth.admin.getUserById(id);
    email = au?.user?.email ?? null;
    emailDogrulandi = Boolean(au?.user?.email_confirmed_at);
    authSonGiris = au?.user?.last_sign_in_at ?? null;
  } catch {
    /* service-role yoksa e-posta gösterilmez (akış bozulmaz) */
  }

  const durum = k.durum as HesapDurum;

  return (
    <div className="mx-auto max-w-[860px] space-y-4 px-4 py-6 sm:px-6">
      <GeriLink href="/admin/kullanicilar" etiket="Kullanıcılar" />

      {/* Başlık kartı — avatar + ad + durum + rol (SayfaBaslik hiyerarşisiyle uyumlu) */}
      <header className="kart belir signal-top flex flex-wrap items-center gap-4 p-5" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
        <Avatar ad={k.ad} id={k.id} boyut={52} />
        <div className="min-w-0">
          <h1 className="font-display text-[27px] font-bold leading-none tracking-tight text-ink">{k.ad ?? "—"}</h1>
          <div className="mt-1.5 flex items-center gap-2 text-[13px] text-ink-soft">
            <span className="size-2 shrink-0 rounded-full bg-teal" aria-hidden />
            <span className="font-medium">{ROL_ETIKET[k.rol as Rol]}</span>
            <span className="text-hair">·</span>
            <span className="mono text-xs text-gray">{k.telefon ?? "tel —"}</span>
          </div>
        </div>
        <span className={`rozet ml-auto ${HESAP_DURUM_ROZET[durum]}`}>{HESAP_DURUM_ETIKET[durum]}</span>
      </header>

      <Uyari hata={hata} mesaj={mesaj} />

      <section className="kart belir belir-1 p-5">
        <h2 className="font-display text-base font-semibold text-ink">Profil</h2>
        <div className="mt-2.5">
          <Satir etiket="Rol" deger={ROL_ETIKET[k.rol as Rol]} />
          <Satir
            etiket="E-posta"
            deger={
              email ? (
                <span className="inline-flex items-center gap-1.5">
                  <a href={`mailto:${email}`} className="text-teal-d transition-colors hover:underline">
                    {email}
                  </a>
                  {emailDogrulandi ? (
                    <span className="rozet mono bg-green-soft text-teal-d">doğrulandı</span>
                  ) : (
                    <span className="rozet mono bg-amber-soft text-amber">doğrulanmadı</span>
                  )}
                </span>
              ) : (
                "—"
              )
            }
          />
          <Satir etiket="Telefon" deger={k.telefon ?? "—"} />
          <Satir
            etiket="Ofis"
            deger={
              ofis ? (
                <Link href={`/admin/ofisler?vurgu=${ofis.id}`} className="text-teal-d transition-colors hover:underline">
                  {ofis.ad} →
                </Link>
              ) : (
                "—"
              )
            }
          />
          <Satir etiket="Talep edilen rol" deger={k.talep_rol ? ROL_ETIKET[k.talep_rol as Rol] : "—"} />
          <Satir
            etiket="Son giriş"
            deger={
              <span className="mono">
                {authSonGiris ?? k.son_giris ? zamanOnce((authSonGiris ?? k.son_giris) as string) : "hiç"}
              </span>
            }
          />
          <Satir etiket="Kayıt" deger={<span className="mono">{zamanOnce(k.created_at)}</span>} />
        </div>
      </section>

      <section className="kart belir belir-2 p-5">
        <h2 className="font-display text-base font-semibold text-ink">Güvenlik</h2>
        <p className="mt-1 text-xs text-gray">
          Kullanıcıya güvenli şifre sıfırlama bağlantısı gönderir. Düz-metin parola tutulmaz;
          kullanıcı kendi şifresini belirler.
        </p>
        <SifreSifirlaButon kullaniciId={k.id} />
      </section>

      <section className="kart belir belir-3 p-5">
        <h2 className="font-display text-base font-semibold text-ink">Hesap durumu</h2>
        <p className="mt-1 text-xs text-gray">Aktifleştir, pasifleştir, askıya al veya arşivle.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DURUMLAR.map((d) => {
            const tehlike = d === "arsivli" || d === "askida";
            return (
              <form key={d} action={hesapDurumDegistir}>
                <input type="hidden" name="kullanici_id" value={k.id} />
                <input type="hidden" name="durum" value={d} />
                <button
                  disabled={d === durum}
                  className={`rounded-lg border px-3.5 py-1.5 text-[13px] font-semibold transition-colors disabled:opacity-40 ${
                    tehlike ? "border-red/30 text-red hover:bg-red/10" : "border-hair text-navy hover:border-teal"
                  }`}
                >
                  {HESAP_DURUM_ETIKET[d]}
                </button>
              </form>
            );
          })}
        </div>
      </section>
    </div>
  );
}
