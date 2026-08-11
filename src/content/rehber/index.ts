import type { FC } from "react";
import type { TocOge } from "@/components/icerik/IcerikToc";
import { Govde as EidsGovde, toc as eidsToc } from "./eids-emlakci-rehberi";
import { Govde as YetkiBelgesiGovde, toc as yetkiBelgesiToc } from "./tasinmaz-ticareti-yetki-belgesi";

/**
 * Slug → gövde eşlemesi. Registry (meta) ile gövde ayrıktır: meta merkezî
 * `src/lib/icerik/kayit.ts`'te, gövde burada. Yeni rehber = 1 gövde dosyası +
 * bu haritaya 1 satır + registry'ye 1 meta kaydı.
 */
export type RehberModul = { Govde: FC; toc: TocOge[] };

export const REHBER_GOVDE: Record<string, RehberModul> = {
  "eids-emlakci-rehberi": { Govde: EidsGovde, toc: eidsToc },
  "tasinmaz-ticareti-yetki-belgesi": { Govde: YetkiBelgesiGovde, toc: yetkiBelgesiToc },
};
