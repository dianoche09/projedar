import { createClient } from "@/lib/supabase/server";
import { hesapSilmeTalebiOlustur } from "@/lib/kvkk/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

/**
 * KVKK "Hesap ve veri" bölümü — üretici/emlakçı panellerinde ortak.
 * Kullanıcı hesap/veri silme talebi açar; talep iz olarak düşer, silmeyi admin işler.
 * `revalideYolu`: talep sonrası tazelenecek panel yolu (ör. "/havuz/profil").
 */
export async function HesapVeVeri({ revalideYolu }: { revalideYolu: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: talep } = await supabase
    .from("hesap_silme_talebi")
    .select("durum, created_at")
    .eq("profile_id", user?.id ?? "")
    .eq("durum", "beklemede")
    .maybeSingle();

  return (
    <div className="kart kart-3d belir mt-4 p-6">
      <div
        className="mb-4 flex items-center gap-2 border-b pb-3"
        style={{ borderColor: "var(--cizgi)" }}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-red)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
        <h2
          className="font-display text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--ink-faint)" }}
        >
          Hesap ve veri (KVKK)
        </h2>
      </div>

      {talep ? (
        <div
          className="rounded-xl border px-4 py-3.5"
          style={{ borderColor: "rgba(227,161,44,.3)", background: "rgba(227,161,44,.08)" }}
        >
          <p className="text-[13.5px] font-semibold text-ink">
            Silme talebin alındı, işleme bekliyor.
          </p>
          <p className="mt-1 text-[12.5px] text-ink-soft">
            Talebin platform yönetimine iletildi. KVKK kapsamında en kısa sürede
            işlenecek. Bu süreçte hesabını kullanmaya devam edebilirsin.
          </p>
        </div>
      ) : (
        <>
          <p className="text-[13px] text-ink-soft">
            Hesabının ve kişisel verilerinin silinmesini talep edebilirsin (KVKK
            md. 7/11). Talebin platform yönetimine iletilir; onay sonrası hesabın
            ve verilerin kalıcı olarak silinir. İstersen kısa bir sebep
            ekleyebilirsin.
          </p>
          <form
            action={hesapSilmeTalebiOlustur.bind(null, revalideYolu)}
            className="mt-4 flex flex-col gap-3"
          >
            <textarea
              name="sebep"
              rows={2}
              maxLength={1000}
              placeholder="Sebep (opsiyonel)"
              className="w-full rounded-xl border px-3.5 py-2.5 font-sans text-[13.5px] text-ink outline-none transition-all placeholder:text-ink-soft/55 focus:border-teal focus:ring-4 focus:ring-teal/12"
              style={{ borderColor: "var(--cizgi)", background: "var(--color-soft)" }}
            />
            <SubmitButton
              varyant="outline"
              bekleyenMetin="Gönderiliyor…"
              className="min-h-11 w-full rounded-xl !border-red/30 !text-red hover:!bg-red-soft"
            >
              Hesap / veri silme talebi gönder
            </SubmitButton>
          </form>
        </>
      )}
    </div>
  );
}
