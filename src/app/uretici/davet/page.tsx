import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { davetToken } from "@/lib/davet";
import { DavetPanel } from "./DavetPanel";

export default async function DavetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profil } = await supabase.from("profiles").select("ad").eq("id", user.id).single();
  const ad = ((profil?.ad as string) || "").trim() || "Müteahhit";

  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  // LEAD_SHARE_SECRET yoksa davetToken throw eder — 500 yerine bilgilendirici mesaj göster.
  let link: string | null = null;
  try {
    const token = davetToken(user.id, ad);
    link = `${proto}://${host}/kayit?rol=emlakci&d=${user.id}&n=${encodeURIComponent(ad)}&t=${token}`;
  } catch {
    link = null;
  }

  return (
    <div className="belir mx-auto max-w-2xl text-ink">
      <header className="mb-5">
        <h1 className="font-display text-[27px] font-bold tracking-tight text-navy">Emlakçı Davet Et</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Kendi danışmanlarını ağa çağır. Link seni davet eden olarak işaretler; danışman{" "}
          <strong className="text-ink">belge doğrulamasından</strong> geçer — davet, doğrulamayı atlamaz.
        </p>
      </header>
      {link ? (
        <DavetPanel link={link} ad={ad} />
      ) : (
        <p className="kart p-5 text-[13px] text-ink-soft">
          Davet linki şu an üretilemiyor (sistem yapılandırması eksik). Lütfen sonra tekrar dene.
        </p>
      )}
    </div>
  );
}
