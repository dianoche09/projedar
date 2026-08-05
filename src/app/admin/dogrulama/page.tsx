import { redirect } from "next/navigation";

// Belge Doğrulama, Başvurular çalışma alanına taşındı (hesap onayı + belge doğrulama tek dosyada).
export default function DogrulamaYonlendir() {
  redirect("/admin/basvurular");
}
