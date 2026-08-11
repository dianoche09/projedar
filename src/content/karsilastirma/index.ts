import type { FC } from "react";
import type { TocOge } from "@/components/icerik/IcerikToc";
import type { SssOgesi } from "@/lib/icerik/schema";
import { Govde as IlanVsAgGovde, toc as ilanVsAgToc, faq as ilanVsAgFaq } from "./ilan-portali-vs-tahsisli-ag";

/**
 * Slug → gövde eşlemesi (karşılaştırma). Rehber/sözlük ile aynı desen.
 * Yeni karşılaştırma = 1 gövde dosyası + bu haritaya 1 satır + registry.
 */
export type KarsilastirmaModul = { Govde: FC; toc: TocOge[]; faq?: SssOgesi[] };

export const KARSILASTIRMA_GOVDE: Record<string, KarsilastirmaModul> = {
  "ilan-portali-vs-tahsisli-ag": { Govde: IlanVsAgGovde, toc: ilanVsAgToc, faq: ilanVsAgFaq },
};
