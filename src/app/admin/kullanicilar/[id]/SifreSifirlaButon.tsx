"use client";

import { useActionState, useState } from "react";
import { parolaSifirlamaLinkiGonder, type SifreLinkState } from "../../actions";

/**
 * Şifre sıfırlama bağlantısı gönder — düz-metin parola YOK. Kullanıcıya güvenli tek-kullanımlık
 * link e-postalanır, kendi şifresini belirler. Mail düşmezse üretilen link burada kopyalanabilir
 * (admin-in-the-loop fallback; link redirect/URL'e sızmaz, yalnız bellekte gösterilir).
 */
export function SifreSifirlaButon({ kullaniciId }: { kullaniciId: string }) {
  const [state, formAction, pending] = useActionState<SifreLinkState, FormData>(
    parolaSifirlamaLinkiGonder,
    null,
  );
  const [kopyalandi, setKopyalandi] = useState(false);

  async function kopyala(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      /* clipboard yoksa kullanıcı elle seçer */
    }
  }

  return (
    <div className="mt-3">
      <form action={formAction}>
        <input type="hidden" name="kullanici_id" value={kullaniciId} />
        <button
          disabled={pending}
          className="btn-ghost !min-h-0 !rounded-lg !px-4 !py-2 !text-[13px] disabled:opacity-50"
        >
          {pending ? "Gönderiliyor…" : "Şifre sıfırlama bağlantısı gönder"}
        </button>
      </form>

      {state ? (
        <div
          className={`mt-3 rounded-lg border px-3 py-2.5 text-[13px] ${
            state.ok ? "border-teal/30 bg-green-soft text-teal-d" : "border-red/30 bg-red/10 text-red"
          }`}
        >
          <p className="font-medium">{state.mesaj}</p>
          {state.ok && state.link ? (
            <div className="mt-2 border-t border-teal/20 pt-2">
              <p className="text-[11px] text-gray">
                Mail ulaşmazsa bu tek-kullanımlık bağlantıyı elle ilet (kısa süre sonra geçersiz olur):
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  readOnly
                  value={state.link}
                  onFocus={(e) => e.currentTarget.select()}
                  className="min-w-0 flex-1 rounded-md border border-hair bg-card px-2 py-1.5 text-[11px] text-ink outline-none"
                />
                <button
                  type="button"
                  onClick={() => kopyala(state.link!)}
                  className="shrink-0 rounded-md border border-hair bg-card px-2.5 py-1.5 text-[11px] font-semibold text-navy transition-colors hover:border-teal"
                >
                  {kopyalandi ? "Kopyalandı" : "Kopyala"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
