import { OZELLIK_KATEGORILERI, type Ozellikler } from "@/lib/ozellikler";

/**
 * Üretici kurulum formunda kategori-gruplu öznitelik checkbox'ları (sabit sözlük).
 * Uncontrolled: her checkbox name=`ozellik_<key>` value=etiket → FormData ile projeKunyeGuncelle'ye gider.
 * `parseOzellikler(formData)` toplayıp doğrular. Serbest metin yerine filtrelenebilir yapı.
 */
export function OzellikSecici({ current }: { current: Ozellikler }) {
  return (
    <div className="sm:col-span-2 space-y-4 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4">
      {/* Bu form ozellikler'i düzenler: action mevcut değeri EZEBİLİR (boş = tümünü temizle).
          Selector içermeyen formlar (sihirbaz imar adımı) bu marker'ı göndermez → ozellikler korunur. */}
      <input type="hidden" name="ozellik_var" value="1" />
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Özellikler (filtrelenebilir)</p>
      {OZELLIK_KATEGORILERI.map((kat) => {
        const secili = new Set(current[kat.key] ?? []);
        return (
          <fieldset key={kat.key} className="border-t border-slate-200/60 pt-3 first:border-t-0 first:pt-0">
            <legend className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{kat.baslik}</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
              {kat.secenekler.map((o) => (
                <label key={o} className="flex cursor-pointer items-center gap-2 py-0.5 text-[13px] text-slate-700">
                  <input
                    type="checkbox"
                    name={`ozellik_${kat.key}`}
                    value={o}
                    defaultChecked={secili.has(o)}
                    className="size-4 flex-none rounded border-slate-300 text-teal focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="min-w-0 truncate">{o}</span>
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
