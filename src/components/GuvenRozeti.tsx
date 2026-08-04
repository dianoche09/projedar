/**
 * Güven skoru rozeti (iki taraflı — karşılıklı görünür).
 * emlakçı: dönüşüm vs israf · müteahhit: yanıt/SLA/doğrulama/tazelik.
 * skor null → "Yeni" (yeterli veri yok). Renk kademeleri tasarım sinyalleriyle uyumlu.
 */
export function GuvenRozeti({
  skor,
  etiket = "Güven",
  ipucu,
  boyut = "sm",
}: {
  skor: number | null | undefined;
  etiket?: string;
  ipucu?: string;
  boyut?: "sm" | "xs";
}) {
  const pad = boyut === "xs" ? "px-1.5 py-[2px] text-[10px]" : "px-2 py-[3px] text-[11px]";

  if (skor == null) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 font-bold text-slate-500 ${pad}`} title="Yeterli veri yok">
        <span className="size-1.5 rounded-full bg-slate-400" />
        Yeni
      </span>
    );
  }

  // Kademe: 80+ yeşil · 60-79 teal · 40-59 amber · <40 kırmızı
  const t =
    skor >= 80
      ? { bg: "bg-green-soft", fg: "text-green", dot: "bg-green" }
      : skor >= 60
        ? { bg: "bg-teal-soft", fg: "text-teal-d", dot: "bg-teal" }
        : skor >= 40
          ? { bg: "bg-amber-soft", fg: "text-[#9a6a12]", dot: "bg-amber" }
          : { bg: "bg-red-soft", fg: "text-red", dot: "bg-red" };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold ${t.bg} ${t.fg} ${pad}`} title={ipucu}>
      <span className={`size-1.5 rounded-full ${t.dot}`} />
      {etiket} {skor}
    </span>
  );
}
