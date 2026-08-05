import { redirect } from "next/navigation";

// Onay Kuyruğu, Başvurular çalışma alanına taşındı (hesap onayı + belge doğrulama tek dosyada).
export default function OnayYonlendir() {
  redirect("/admin/basvurular");
}
