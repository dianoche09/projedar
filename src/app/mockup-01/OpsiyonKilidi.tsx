"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Lock, RotateCcw } from "lucide-react";

/**
 * OpsiyonKilidi · Mockup 01 signature moment (Bölüm 03).
 * Koreografik opsiyon-kilidi protokolü: kullanıcı kesitten yeşil bir daire seçer,
 * altı adım sırayla işler:
 *   1 TALEP -> 2 ÇAKIŞMA KONTROLÜ (kesit üstünde tarama) -> 3 FİZİKSEL KİLİT
 *   (hücre amber + kilit düşer) -> 4 İKİNCİ ERİŞİM (ikinci danışman reddedilir)
 *   -> 5 KAYIT (deftere satır yazılır) -> 6 AĞ YAYINI (yalnız yetkili ekranlar
 *   nabız atar, ağ dışı ekran değişmez).
 * Sıfırla: kilitler kalkar, defter kaydı bilerek KALIR (iz silinmez).
 * prefers-reduced-motion: adımlar beklemeden tamamlanmış gösterilir.
 * TÜM VERİLER ÖRNEKTİR; state bileşen içindedir, sayfa yenilenince sıfırlanır.
 */

type Durum = "musait" | "opsiyon" | "satildi";

const RENK: Record<Durum, string> = {
  musait: "#2fb36b",
  opsiyon: "#e3a12c",
  satildi: "#d15a4e",
};

const KAT_SAYISI = 5;
const NO_SAYISI = 4;

/* deterministik örnek dağılım */
function tabanDurum(kat: number, no: number): Durum {
  const h = (kat * 17 + no * 29) % 10;
  if (h < 5) return "musait";
  if (h < 8) return "opsiyon";
  return "satildi";
}

const ADIMLAR: { ad: string; detay: string }[] = [
  { ad: "Talep", detay: "Danışman opsiyon talebi gönderdi." },
  { ad: "Çakışma kontrolü", detay: "Aktif opsiyon taraması yapıldı: 0 çakışma." },
  { ad: "Fiziksel kilit", detay: "Birim satırı 48 saat kilitlendi." },
  { ad: "İkinci erişim", detay: "M. Kaya aynı daireyi denedi: sistem reddetti." },
  { ad: "Kayıt", detay: "İşlem deftere yazıldı; iz silinmez." },
  { ad: "Ağ yayını", detay: "Değişiklik yalnız yetkili ağa yayıldı." },
];

const YETKILI_EKRANLAR = ["A. Yılmaz", "M. Kaya", "Satış Ofisi"] as const;

/* adımlar arası bekleme süreleri (ms): 1->2, 2->3, ... 5->6 */
const GECIKMELER = [950, 1050, 1150, 1000, 950] as const;

function saatYaz(): string {
  return new Date().toLocaleTimeString("tr-TR", { hour12: false });
}

export function OpsiyonKilidi() {
  const [hedef, setHedef] = useState<string | null>(null);
  const [adim, setAdim] = useState(0);
  const [kilitli, setKilitli] = useState<string[]>([]);
  const [defter, setDefter] = useState<string[]>([]);
  const zamanlar = useRef<ReturnType<typeof setTimeout>[]>([]);

  const kosuyor = hedef !== null && adim < ADIMLAR.length;

  const temizle = () => {
    for (const z of zamanlar.current) clearTimeout(z);
    zamanlar.current = [];
  };

  useEffect(() => temizle, []);

  const deftereYaz = (kod: string) => {
    setDefter((eski) => [`${saatYaz()} · ${kod} · opsiyon kilidi · D. Aksoy · 48 sa`, ...eski].slice(0, 4));
  };

  const baslat = (kod: string) => {
    if (kosuyor) return;
    temizle();
    setHedef(kod);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAdim(ADIMLAR.length);
      setKilitli((eski) => [...eski, kod]);
      deftereYaz(kod);
      return;
    }
    setAdim(1);
    let toplam = 0;
    GECIKMELER.forEach((gecikme, i) => {
      toplam += gecikme;
      zamanlar.current.push(
        setTimeout(() => {
          const yeni = i + 2;
          setAdim(yeni);
          if (yeni === 3) setKilitli((eski) => [...eski, kod]);
          if (yeni === 5) deftereYaz(kod);
        }, toplam)
      );
    });
  };

  const sifirla = () => {
    temizle();
    setHedef(null);
    setAdim(0);
    setKilitli([]);
  };

  const durumBul = (kat: number, no: number): Durum =>
    kilitli.includes(`A-${kat}-${no}`) ? "opsiyon" : tabanDurum(kat, no);

  const katlar = Array.from({ length: KAT_SAYISI }, (_, i) => KAT_SAYISI - i);
  const nolar = Array.from({ length: NO_SAYISI }, (_, i) => i + 1);
  const bitti = hedef !== null && adim >= ADIMLAR.length;

  return (
    <div className="dt-cerceve relative overflow-hidden">
      <span className="absolute right-3 top-3 z-10 rounded-[2px] border border-[var(--cizgi-2)] bg-white px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
        örnek
      </span>

      <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* ---- SOL: kesit + ağ ekranları ---- */}
        <div className="border-b-[1.5px] border-ink p-4 sm:p-6 lg:border-b-0 lg:border-r-[1.5px]">
          <p className="mb-4 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            Blok A · Kesit · {kosuyor ? "protokol işliyor" : "daire seçin"}
          </p>

          <div className="relative">
            {/* çakışma taraması */}
            {adim === 2 ? <div key={`tarama-${hedef}`} className="dt-tarama z-10" aria-hidden /> : null}

            {katlar.map((kat) => (
              <div key={kat} className="mb-1.5 flex items-center gap-2">
                <span className="w-7 flex-none text-right font-mono text-[10px] text-[var(--ink-faint)]">K{kat}</span>
                <div className="flex min-w-0 flex-1 gap-1.5">
                  {nolar.map((no) => {
                    const kod = `A-${kat}-${no}`;
                    const durum = durumBul(kat, no);
                    const hedefMi = kod === hedef;
                    const secilebilir = durum === "musait" && !kosuyor;
                    return (
                      <button
                        key={no}
                        type="button"
                        disabled={!secilebilir}
                        onClick={() => baslat(kod)}
                        style={{ background: RENK[durum] }}
                        className={`relative flex h-11 min-w-0 flex-1 items-center justify-center rounded-[3px] border border-[rgba(16,36,58,0.35)] font-mono text-[10px] font-semibold leading-none text-white transition-[background-color,box-shadow] duration-500 ${
                          secilebilir ? "cursor-pointer hover:shadow-[0_5px_12px_rgba(16,36,58,0.22)]" : "cursor-default"
                        } ${hedefMi && adim >= 3 ? "dt-halka" : ""} ${
                          hedefMi && adim >= 1 && adim < 3 ? "ring-2 ring-teal ring-offset-1" : ""
                        }`}
                        aria-label={
                          durum === "musait"
                            ? `${kod} müsait, opsiyon protokolünü başlatmak için dokun`
                            : `${kod} ${durum === "opsiyon" ? "opsiyonlu, kilitli" : "satıldı"}`
                        }
                      >
                        {kat}-{no}
                        {hedefMi && adim >= 3 ? (
                          <Lock size={10} strokeWidth={2.5} className="dt-kilit-dus absolute right-1 top-1" />
                        ) : durum === "opsiyon" && !hedefMi ? (
                          <Lock size={9} strokeWidth={2.5} className="absolute right-1 top-1 opacity-80" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ikinci erişim reddi */}
          <p className="mt-3 flex min-h-[22px] items-center gap-2 font-mono text-[11px]" aria-live="polite">
            {hedef !== null && adim >= 4 ? (
              <span className="dt-belir inline-flex items-center gap-2 font-semibold text-red">
                <span className="flex size-4 flex-none items-center justify-center rounded-full border-[1.5px] border-red text-[9px] leading-none">
                  ×
                </span>
                2. talep reddedildi · tekil indeks: opsiyon_aktif
              </span>
            ) : (
              <span className="text-[var(--ink-faint)]">
                Yeşil bir daireye dokun: kilit protokolü karşında işlesin.
              </span>
            )}
          </p>

          {/* ağ ekranları */}
          <div className="mt-5 border-t border-dashed border-[rgba(16,36,58,0.16)] pt-4">
            <p className="mb-2.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
              Ağ · kim ne görüyor
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {YETKILI_EKRANLAR.map((ad, i) => (
                <div
                  key={ad}
                  className={`rounded-[3px] border border-[var(--cizgi-2)] bg-white p-2.5 ${
                    hedef !== null && adim >= 6 ? "dt-ag-nabiz" : ""
                  }`}
                  style={{ animationDelay: `${i * 140}ms` }}
                >
                  <p className="truncate font-mono text-[8.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
                    {ad}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px]">
                    {hedef !== null && adim >= 6 ? (
                      <>
                        <span className="size-1.5 flex-none rounded-full bg-amber" aria-hidden />
                        <span className="truncate font-semibold text-[#9a6a12]">{hedef} kilitli</span>
                      </>
                    ) : (
                      <>
                        <span className="size-1.5 flex-none rounded-full bg-green" aria-hidden />
                        <span className="truncate text-ink-soft">canlı havuz</span>
                      </>
                    )}
                  </p>
                </div>
              ))}
              <div className="rounded-[3px] border border-dashed border-[rgba(16,36,58,0.3)] bg-[rgba(16,36,58,0.04)] p-2.5">
                <p className="truncate font-mono text-[8.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
                  Ağ dışı danışman
                </p>
                <p className="mt-1.5 truncate font-mono text-[10px] text-[var(--ink-faint)]">
                  {hedef !== null && adim >= 6 ? "değişiklik ulaşmadı" : "tahsis yok · erişemez"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---- SAĞ: protokol adımları + defter ---- */}
        <div className="flex flex-col p-4 sm:p-6">
          <p className="mb-4 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            Kilit protokolü · 6 adım
          </p>

          <ol className="relative space-y-0">
            {ADIMLAR.map((a, i) => {
              const sira = i + 1;
              const tamam = adim > sira || bitti;
              const aktif = adim === sira && !bitti;
              return (
                <li key={a.ad} className="relative flex gap-3.5 pb-4 last:pb-0">
                  {sira < ADIMLAR.length ? (
                    <span
                      aria-hidden
                      className="absolute left-[13px] top-7 h-[calc(100%-26px)] border-l border-dashed border-[rgba(16,36,58,0.2)]"
                    />
                  ) : null}
                  <span
                    className={`z-[1] flex size-[27px] flex-none items-center justify-center rounded-full border-[1.5px] font-mono text-[10.5px] font-semibold transition-colors duration-300 ${
                      tamam
                        ? "border-ink bg-ink text-white"
                        : aktif
                          ? "border-teal bg-[var(--color-teal-soft)] text-[var(--color-teal-d)]"
                          : "border-[var(--cizgi-2)] bg-white text-[var(--ink-faint)]"
                    }`}
                    aria-hidden
                  >
                    {tamam ? <Check size={13} strokeWidth={3} /> : `0${sira}`}
                  </span>
                  <div className={`min-w-0 pt-0.5 transition-opacity duration-300 ${tamam || aktif ? "opacity-100" : "opacity-45"}`}>
                    <p className="text-[13.5px] font-bold uppercase tracking-wide text-ink">
                      <span className="dt-display">{a.ad}</span>
                      {aktif ? (
                        <span className="ml-2 inline-block size-1.5 rounded-full bg-teal nabiz align-middle" aria-hidden />
                      ) : null}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] leading-relaxed text-ink-soft">
                      {tamam || aktif ? a.detay : "bekliyor"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="sr-only" aria-live="polite">
            {hedef === null
              ? "Protokol bekliyor"
              : bitti
                ? `${hedef} için kilit protokolü tamamlandı`
                : `Adım ${adim}: ${ADIMLAR[adim - 1]?.ad ?? ""}`}
          </p>

          {bitti ? (
            <div className="dt-belir mt-4 flex flex-wrap items-center gap-3 border-t border-dashed border-[rgba(16,36,58,0.16)] pt-4">
              <p className="min-w-0 flex-1 font-mono text-[11px] leading-relaxed text-ink">
                Kilit fizikseldir: uygulama değil, veritabanı reddeder.
              </p>
              <button type="button" onClick={sifirla} className="dt-tus dt-tus-cizgi !min-h-[44px] !px-4 !text-[11px]">
                <RotateCcw size={13} strokeWidth={2.5} />
                Sıfırla
              </button>
            </div>
          ) : null}

          {/* defter */}
          <div className="mt-auto pt-5">
            <div className="rounded-[3px] border border-[var(--cizgi-2)] bg-[rgba(16,36,58,0.03)] p-3.5">
              <p className="mb-2 flex items-center justify-between gap-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                İşlem defteri
                <span className="normal-case tracking-normal">kayıt kalıcıdır</span>
              </p>
              {defter.length === 0 ? (
                <p className="font-mono text-[10.5px] text-[var(--ink-faint)]">Henüz kayıt yok.</p>
              ) : (
                <ul className="space-y-1.5">
                  {defter.map((satir) => (
                    <li key={satir} className="dt-belir truncate font-mono text-[10.5px] text-ink-soft">
                      {satir}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-2.5 font-mono text-[9.5px] leading-relaxed text-[var(--ink-faint)]">
              Deneme kilidi bileşen içindedir, sayfa yenilenince sıfırlanır. Sıfırla düğmesi kilidi
              kaldırır ama defter kaydını silmez: gerçek sistemde de iz kalır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
