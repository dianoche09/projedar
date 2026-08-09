import Link from "next/link";
import { sifreSifirlamaIste } from "./actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { AuthKabuk } from "@/components/ui/AuthKabuk";

const inpCls =
  "min-h-12 w-full rounded-xl border border-hair bg-soft px-4 font-sans text-base text-ink outline-none transition-all placeholder:text-ink-soft/55 focus:border-teal focus:bg-white focus:ring-4 focus:ring-teal/12";

export default async function SifremiUnuttumPage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; mesaj?: string }>;
}) {
  const { hata, mesaj } = await searchParams;

  return (
    <AuthKabuk>
      <div className="kart p-6 sm:p-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          Şifreni sıfırla
        </h1>
        <p className="mt-2 text-sm font-medium text-ink-soft">
          Hesabının e-postasını gir, sıfırlama bağlantısını gönderelim.
        </p>

        {hata && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red/20 bg-red-soft px-4 py-2.5 text-sm text-red font-semibold"
          >
            {hata}
          </p>
        )}
        {mesaj && (
          <p className="mt-4 rounded-xl border border-green/20 bg-green-soft px-4 py-2.5 text-sm text-green font-semibold">
            {mesaj}
          </p>
        )}

        <form action={sifreSifirlamaIste} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-bold text-ink">
            E-posta
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="ornek@projedar.com"
              className={inpCls}
            />
          </label>

          <SubmitButton
            varyant="teal"
            bekleyenMetin="Gönderiliyor…"
            className="mt-2 min-h-12 w-full rounded-xl bg-teal py-3.5 text-base font-bold text-white hover:bg-teal-d shadow-[0_6px_16px_rgba(30,155,138,0.3)]"
          >
            Sıfırlama bağlantısı gönder
          </SubmitButton>
        </form>

        <p className="mt-6 border-t border-hair pt-4 text-center text-sm font-medium text-ink-soft">
          Şifreni hatırladın mı?{" "}
          <Link href="/login" className="font-bold text-teal hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </AuthKabuk>
  );
}
