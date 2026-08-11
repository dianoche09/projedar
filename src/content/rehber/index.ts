import type { FC } from "react";
import type { TocOge } from "@/components/icerik/IcerikToc";
import type { SssOgesi } from "@/lib/icerik/schema";
import { Govde as EidsGovde, toc as eidsToc, faq as eidsFaq } from "./eids-emlakci-rehberi";
import { Govde as YetkiBelgesiGovde, toc as yetkiBelgesiToc, faq as yetkiBelgesiFaq } from "./tasinmaz-ticareti-yetki-belgesi";
import { Govde as SosyalMedyaGovde, toc as sosyalMedyaToc, faq as sosyalMedyaFaq } from "./eids-sosyal-medya-ilan-paylasimi";
import { Govde as EdevletYetkiGovde, toc as edevletYetkiToc, faq as edevletYetkiFaq } from "./e-devletten-emlakciya-eids-yetkisi";

/**
 * Slug → gövde eşlemesi. Registry (meta) ile gövde ayrıktır: meta merkezî
 * `src/lib/icerik/kayit.ts`'te, gövde burada. Yeni rehber = 1 gövde dosyası +
 * bu haritaya 1 satır + registry'ye 1 meta kaydı. `faq` (varsa) hem görünür
 * SSS'i hem FAQPage schema'sını besler (tek kaynak).
 */
export type RehberModul = { Govde: FC; toc: TocOge[]; faq?: SssOgesi[] };

export const REHBER_GOVDE: Record<string, RehberModul> = {
  "eids-emlakci-rehberi": { Govde: EidsGovde, toc: eidsToc, faq: eidsFaq },
  "tasinmaz-ticareti-yetki-belgesi": { Govde: YetkiBelgesiGovde, toc: yetkiBelgesiToc, faq: yetkiBelgesiFaq },
  "eids-sosyal-medya-ilan-paylasimi": { Govde: SosyalMedyaGovde, toc: sosyalMedyaToc, faq: sosyalMedyaFaq },
  "e-devletten-emlakciya-eids-yetkisi": { Govde: EdevletYetkiGovde, toc: edevletYetkiToc, faq: edevletYetkiFaq },
};
