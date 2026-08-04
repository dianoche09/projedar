// Projedar test/demo LOGIN hesapları — TEK KAYNAK.
// Mevcut hesapları ProjePazar → Projedar markasına taşır (email + şifre), yoksa oluşturur.
// Idempotent: tekrar çalıştırılabilir. Admin API (service-role) → .test TLD geçerli.
//   node scripts/test-hesaplar.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const KOK = join(dirname(fileURLToPath(import.meta.url)), "..");
function envOku() {
  const yol = join(KOK, ".env.local");
  const o = {};
  if (!existsSync(yol)) return o;
  for (const s of readFileSync(yol, "utf8").split("\n")) {
    const m = s.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return o;
}
const env = { ...envOku(), ...process.env };
const URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error("HATA: SUPABASE URL/SERVICE_ROLE yok (.env.local)."); process.exit(1); }
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const SIFRE = "Projedar123!";
const ESKI_ALAN = "projepazar.test";
const YENI_ALAN = "projedar.test";

// kul = email local-part (rol yönlendirmesi: admin@→/admin, uretici@→/uretici, emlakci@→/havuz)
const HESAPLAR = [
  { kul: "admin", rol: "admin", ad: "Projedar Admin" },
  { kul: "uretici", rol: "uretici", ad: "Projedar Üretici" },
  { kul: "uretici2", rol: "uretici", ad: "Mar771 İnşaat" },
  { kul: "uretici3", rol: "uretici", ad: "Deniz Yapı A.Ş." },
  { kul: "uretici4", rol: "uretici", ad: "Akkent Construction" },
  { kul: "emlakci1", rol: "emlakci", ad: "Demo Danışman 1" },
  { kul: "emlakci2", rol: "emlakci", ad: "Demo Danışman 2" },
  { kul: "emlakci3", rol: "emlakci", ad: "Demo Danışman 3" },
];

async function kullaniciBul(email) {
  for (let s = 1; s <= 15; s++) {
    const { data } = await sb.auth.admin.listUsers({ page: s, perPage: 200 });
    const u = (data?.users ?? []).find((x) => x.email === email);
    if (u) return u;
    if ((data?.users ?? []).length < 200) break;
  }
  return null;
}

async function main() {
  for (const h of HESAPLAR) {
    const eski = `${h.kul}@${ESKI_ALAN}`;
    const yeni = `${h.kul}@${YENI_ALAN}`;

    // 1) Zaten taşınmış (yeni email var) → yalnız şifreyi eşitle
    const mevcutYeni = await kullaniciBul(yeni);
    if (mevcutYeni) {
      await sb.auth.admin.updateUserById(mevcutYeni.id, { password: SIFRE, email_confirm: true });
      console.log(`• ${yeni} → şifre eşitlendi (${SIFRE})`);
      continue;
    }
    // 2) Eski email var → email + şifre güncelle (profil uid'ye bağlı, korunur)
    const mevcutEski = await kullaniciBul(eski);
    if (mevcutEski) {
      const { error } = await sb.auth.admin.updateUserById(mevcutEski.id, { email: yeni, password: SIFRE, email_confirm: true });
      if (error) { console.log(`✗ ${eski} → ${yeni}: ${error.message}`); continue; }
      console.log(`↦ ${eski} → ${yeni} / ${SIFRE}`);
      continue;
    }
    // 3) Hiçbiri yok → oluştur + profil
    const { data: created, error: cErr } = await sb.auth.admin.createUser({
      email: yeni, password: SIFRE, email_confirm: true, user_metadata: { ad: h.ad },
    });
    if (cErr) { console.log(`✗ ${yeni}: ${cErr.message}`); continue; }
    const { error: pErr } = await sb.from("profiles").upsert(
      { id: created.user.id, rol: h.rol, ad: h.ad, durum: "aktif", aktif: true },
      { onConflict: "id" },
    );
    console.log(pErr ? `+ ${yeni} (profil: ${pErr.message})` : `+ ${yeni} oluşturuldu (${h.rol}) / ${SIFRE}`);
  }
  console.log(`\nbitti. Tüm test hesapları: <kul>@${YENI_ALAN} · şifre ${SIFRE}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
