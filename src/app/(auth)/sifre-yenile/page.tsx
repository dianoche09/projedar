import Link from "next/link";
import { sifreYenile } from "./actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { AuthKabuk } from "@/components/ui/AuthKabuk";
import { createClient } from "@/lib/supabase/server";

const inpCls =
  "min-h-12 w-full rounded-xl border border-hair bg-soft px-4 font-sans text-base text-ink outline-none transition-all placeholder:text-ink-soft/55 focus:border-teal focus:bg-white focus:ring-4 focus:ring-teal/12";

export default async function SifreYenilePage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>;
}) {
  const { hata } = await searchParams;

  // Recovery oturumu callback'te kurulur. Yoksa bağlantı geçersiz/süresi dolmuş.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthKabuk>
      <div className="kart p-6 sm:p-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Yeni parola belirle
        </h1>

        {!user ? (
          <>
            <p className="mt-2 text-sm font-medium text-ink-soft">
              Bağlantı geçersiz veya süresi dolmuş görünüyor. Sıfırlamayı yeniden
              başlat.
            </p>
            <Link
              href="/sifremi-unuttum"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal py-3.5 text-base font-bold text-white hover:bg-teal-d shadow-[0_6px_16px_rgba(30,155,138,0.3)]"
            >
              Yeni bağlantı iste
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm font-medium text-ink-soft">
              Hesabın için yeni bir parola gir. En az 6 karakter.
            </p>

            {hata && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red/20 bg-red-soft px-4 py-2.5 text-sm text-red font-semibold"
              >
                {hata}
              </p>
            )}

            <form action={sifreYenile} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-bold text-ink">
                Yeni parola
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="••••••••"
                  className={inpCls}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-ink">
                Yeni parola (tekrar)
                <input
                  name="password2"
                  type="password"
                  required
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="••••••••"
                  className={inpCls}
                />
              </label>

              <SubmitButton
                varyant="teal"
                bekleyenMetin="Kaydediliyor…"
                className="mt-2 min-h-12 w-full rounded-xl bg-teal py-3.5 text-base font-bold text-white hover:bg-teal-d shadow-[0_6px_16px_rgba(30,155,138,0.3)]"
              >
                Parolayı güncelle
              </SubmitButton>
            </form>
          </>
        )}
      </div>
    </AuthKabuk>
  );
}
