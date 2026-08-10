import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { guvenliSunumYolu, sunumSifreDogru, sunumTokenBeklenen } from "@/lib/sunumGate";

export const metadata: Metadata = {
  title: "Projedar · Sunum girişi",
  robots: { index: false, follow: false },
};

async function girisYap(formData: FormData) {
  "use server";
  const sifre = String(formData.get("sifre") ?? "");
  const next = guvenliSunumYolu(String(formData.get("next") ?? ""));
  if (!sunumSifreDogru(sifre)) {
    redirect(`/sunum-giris?next=${encodeURIComponent(next)}&hata=1`);
  }
  const token = sunumTokenBeklenen();
  if (token) {
    const c = await cookies();
    c.set("sunum_ok", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 gün
    });
  }
  redirect(next);
}

export default async function SunumGiris({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; hata?: string }>;
}) {
  const sp = await searchParams;
  const next = guvenliSunumYolu(sp.next);
  const hata = sp.hata === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1622] px-6">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#101f30] p-8 text-center shadow-2xl">
        <p className="font-display text-[26px] font-extrabold tracking-tight text-white">
          proje<span className="text-[#2fd3bc]">dar</span>
        </p>
        <h1 className="mt-6 text-lg font-semibold text-white">Sunum girişi</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Bu sunum korumalıdır. Devam etmek için erişim parolasını girin.
        </p>
        <form action={girisYap} className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="next" value={next} />
          <input
            type="password"
            name="sifre"
            autoFocus
            required
            autoComplete="off"
            placeholder="Erişim parolası"
            className="h-12 rounded-xl border border-white/15 bg-[#0b1622] px-4 text-[15px] text-white placeholder-white/35 outline-none focus:border-[#2fd3bc] focus:ring-4 focus:ring-[#2fd3bc]/15"
          />
          {hata ? (
            <p className="text-sm font-medium text-[#e07a6e]">Parola hatalı. Tekrar deneyin.</p>
          ) : null}
          <button
            type="submit"
            className="h-12 rounded-xl bg-[#2fd3bc] text-[15px] font-semibold text-[#0b1622] transition-colors hover:bg-[#38e0c9]"
          >
            Giriş yap
          </button>
        </form>
        <p className="mt-6 text-[11px] text-white/35">Erişim parolası için Projedar ile iletişime geçin.</p>
      </div>
    </main>
  );
}
