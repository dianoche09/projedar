import type { FC } from "react";
import type { TocOge } from "@/components/icerik/IcerikToc";
import type { SssOgesi } from "@/lib/icerik/schema";
import { Govde as TerimlerGovde, toc as terimlerToc, faq as terimlerFaq } from "./proje-satis-terimleri";

/**
 * Slug → gövde eşlemesi (sözlük). Rehberle aynı desen: meta merkezî kayit.ts'te,
 * gövde burada. Yeni terim sayfası = 1 gövde dosyası + bu haritaya 1 satır + registry.
 */
export type SozlukModul = { Govde: FC; toc: TocOge[]; faq?: SssOgesi[] };

export const SOZLUK_GOVDE: Record<string, SozlukModul> = {
  "proje-satis-terimleri": { Govde: TerimlerGovde, toc: terimlerToc, faq: terimlerFaq },
};
