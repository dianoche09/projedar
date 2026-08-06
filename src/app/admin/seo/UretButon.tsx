"use client";
import { useFormStatus } from "react-dom";

/** Form submit butonu; pending durumunda "Üretiliyor…" gösterir. */
export function UretButon() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex flex-none items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Üretiliyor…" : "Sayfa üret →"}
    </button>
  );
}
