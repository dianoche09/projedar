import type { FC } from "react";
import type { TocOge } from "@/components/icerik/IcerikToc";
import type { SssOgesi } from "@/lib/icerik/schema";
import { Govde as EidsGovde, toc as eidsToc, faq as eidsFaq } from "./eids-emlakci-rehberi";
import { Govde as YetkiBelgesiGovde, toc as yetkiBelgesiToc, faq as yetkiBelgesiFaq } from "./tasinmaz-ticareti-yetki-belgesi";
import { Govde as SosyalMedyaGovde, toc as sosyalMedyaToc, faq as sosyalMedyaFaq } from "./eids-sosyal-medya-ilan-paylasimi";
import { Govde as EdevletYetkiGovde, toc as edevletYetkiToc, faq as edevletYetkiFaq } from "./e-devletten-emlakciya-eids-yetkisi";
import { Govde as ProjeSatisGovde, toc as projeSatisToc, faq as projeSatisFaq } from "./proje-uzerinden-satis-nasil-yapilir";
import { Govde as MusteriKaydiGovde, toc as musteriKaydiToc, faq as musteriKaydiFaq } from "./musteri-kaydi-ve-hakedis-korumasi";
import { Govde as SifirKonutGovde, toc as sifirKonutToc, faq as sifirKonutFaq } from "./sifir-konut-satmanin-emlakciya-avantajlari";

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
  "proje-uzerinden-satis-nasil-yapilir": { Govde: ProjeSatisGovde, toc: projeSatisToc, faq: projeSatisFaq },
  "musteri-kaydi-ve-hakedis-korumasi": { Govde: MusteriKaydiGovde, toc: musteriKaydiToc, faq: musteriKaydiFaq },
  "sifir-konut-satmanin-emlakciya-avantajlari": { Govde: SifirKonutGovde, toc: sifirKonutToc, faq: sifirKonutFaq },
};
