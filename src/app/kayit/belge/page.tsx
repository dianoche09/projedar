import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthKabuk } from "@/components/ui/AuthKabuk";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { kayitBelgeYukle } from "../actions";

const inp =
  "w-full rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white";
const ADIMLAR = ["Hesap türü", "Bilgiler", "Belgeler"];

export default async function KayitBelge({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  const { hata } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <AuthKabuk>
      <div className="kart p-6 sm:p-8">
        {/* Adım göstergesi — 3/3 */}
        <ol className="mb-5 flex items-center gap-2">
          {ADIMLAR.map((et, i) => {
            const son = i === ADIMLAR.length - 1;
            return (
              <li key={et} className="flex flex-1 items-center gap-2">
                <span
                  className={`flex size-6 flex-none items-center justify-center rounded-full text-xs font-bold ${
                    son ? "bg-teal text-white" : "bg-teal-soft text-teal-d"
                  }`}
                >
                  {son ? 3 : "✓"}
                </span>
                <span className={`whitespace-nowrap text-xs font-semibold ${son ? "text-ink" : "text-ink-soft"}`}>{et}</span>
                {!son ? <span className="h-px flex-1 bg-hair" /> : null}
              </li>
            );
          })}
        </ol>

        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Yetki belgeleri</h1>
        <p className="mt-2 text-sm font-medium text-ink-soft">
          Danışman olduğunu belgele — doğrulanınca tüm tahsisli projelere erişimin açılır. Belgelerin gizli tutulur
          (özel depolama · KVKK).
        </p>

        {hata ? (
          <p role="alert" className="mt-4 rounded-xl border border-red/20 bg-red-soft px-4 py-2.5 text-sm font-semibold text-red">
            {hata}
          </p>
        ) : null}

        <form action={kayitBelgeYukle} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-ink">
              Mesleki Yeterlilik / Taşınmaz Ticareti Yetki Belgesi{" "}
              <span className="font-normal text-ink-soft/70">(barkodlu)</span>
            </label>
            <input type="file" name="mesleki_yeterlilik" accept="image/*,.pdf" className={`${inp} mt-1`} />
            <input
              name="mys_no"
              inputMode="numeric"
              placeholder="Belge / barkod no (opsiyonel)"
              className="mt-2 w-full rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/55 focus:border-teal"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-ink">Vergi Levhası</label>
            <input type="file" name="vergi_levhasi" accept="image/*,.pdf" className={`${inp} mt-1`} />
          </div>
          <p className="text-[11px] text-ink-soft/80">PDF veya görsel · maks 8MB.</p>
          <SubmitButton>Belgeleri yükle ve bitir</SubmitButton>
        </form>

        <div className="mt-5 border-t border-hair pt-4 text-center">
          <Link href="/hesap-bekliyor" className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink hover:underline">
            Şimdilik atla → sonra yüklerim
          </Link>
          <p className="mt-1 text-[11px] text-ink-soft/70">Atlarsan doğrulanana kadar yalnız demo projeyi görürsün.</p>
        </div>
      </div>
    </AuthKabuk>
  );
}
