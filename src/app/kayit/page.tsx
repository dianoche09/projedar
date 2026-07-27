import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KayitForm } from "./KayitForm";
import { AuthKabuk } from "@/components/ui/AuthKabuk";
import { davetGecerli } from "@/lib/davet";

export default async function KayitPage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; rol?: string; d?: string; n?: string; t?: string }>;
}) {
  const { hata, d, n, t } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  // Müteahhit daveti: imza geçerliyse emlakçı rolü ön-seçilir + davet eden gösterilir.
  const davet = davetGecerli(d, n, t) ? { ad: n as string, d: d as string, n: n as string, t: t as string } : null;

  return (
    <AuthKabuk>
      <div className="kart p-6 sm:p-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Hesap oluştur</h1>
        <p className="mt-2 text-sm font-medium text-ink-soft">
          Kaydın admin onayından sonra aktifleşir. Onaylanınca giriş yapıp paneline erişirsin.
        </p>

        {hata ? (
          <p role="alert" className="mt-4 rounded-xl border border-red/20 bg-red-soft px-4 py-2.5 text-sm text-red font-semibold">
            {hata}
          </p>
        ) : null}

        <KayitForm davet={davet} />

        <p className="mt-6 border-t border-hair pt-4 text-center text-sm font-medium text-ink-soft">
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="font-bold text-teal hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs font-semibold text-ink-soft/70">
        Kapalı devre B2B ağ · yalnızca davetli üretici ve danışmanlar.
      </p>
    </AuthKabuk>
  );
}
