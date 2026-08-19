// Projedar — rol → panel eşlemesi (Sistem Kuralları B.1: her rol AYRI panel görür).

export type Rol =
  | "uretici"
  | "emlakci"
  | "ofis_yetkili"
  | "marka_yetkili"
  | "arsa_sahibi"
  | "admin";

/** Rol'ün ana paneli. admin=BİZ (platform yönetimi); üretici/ofis/emlakçı=müşteri.
 *  Faz-1: ofis/marka/arsa rolleri henüz ayrı panele sahip değil (gelir modeli: ofis/franchise = SONRA fazı)
 *  → tahsisli stok gördükleri /danisman'a yönlendirilir (404 yerine). Ayrı panelleri Faz-2. */
export const ROL_PANEL: Record<Rol, string> = {
  admin: "/admin",
  uretici: "/uretici",
  emlakci: "/danisman",
  ofis_yetkili: "/danisman",
  marka_yetkili: "/danisman",
  arsa_sahibi: "/danisman",
};

export const ROL_ETIKET: Record<Rol, string> = {
  admin: "Yönetim",
  uretici: "Üretici kokpiti",
  emlakci: "Emlakçı havuzu",
  ofis_yetkili: "Ofis konsolu",
  marka_yetkili: "Marka konsolu",
  arsa_sahibi: "Arsa sahibi",
};

/** Rol → KİŞİ etiketi (sidebar profil altında; panel adı ROL_ETIKET'ten ayrı). */
export const ROL_KISI_ETIKET: Record<Rol, string> = {
  admin: "Admin",
  uretici: "Üretici",
  emlakci: "Danışman",
  ofis_yetkili: "Ofis Yetkilisi",
  marka_yetkili: "Marka Yetkilisi",
  arsa_sahibi: "Arsa Sahibi",
};

/** Faz-1'de ayrı paneli olmayan, /danisman havuzuna park edilen org rolleri (belge/KYC akışı dışı). */
export const ORG_ROLLER: readonly Rol[] = ["ofis_yetkili", "marka_yetkili", "arsa_sahibi"];

/** Rol'e göre panel yolu. Bilinmeyen/null rol → "/". */
export function panelYolu(rol: string | null | undefined): string {
  return rol && rol in ROL_PANEL ? ROL_PANEL[rol as Rol] : "/";
}
