import {
  FileText,
  BadgeCheck,
  Store,
  GraduationCap,
  UserCheck,
  Wallet,
  RefreshCw,
  Link2,
  AlertTriangle,
} from "lucide-react";
import { AnswerFirst } from "@/components/icerik/AnswerFirst";
import { Bolum } from "@/components/icerik/Bolum";
import { GuncelDurumTablosu } from "@/components/icerik/GuncelDurumTablosu";
import { IcerikFAQ } from "@/components/icerik/IcerikFAQ";
import { IstatistikSerit } from "@/components/icerik/IstatistikSerit";
import { SurecAkisi } from "@/components/icerik/SurecAkisi";
import { VurguKutusu } from "@/components/icerik/VurguKutusu";
import { BolumGorsel } from "@/components/icerik/IcerikGorsel";
import type { TocOge } from "@/components/icerik/IcerikToc";

/**
 * Rehber gövdesi: Taşınmaz Ticareti Yetki Belgesi (EİDS kümesi kardeşi).
 * Mevzuat iddiaları resmî kaynaklara [n] ile atıflıdır (Taşınmaz Ticareti Hakkında
 * Yönetmelik [1], TTBS [2]). Rakam/tarih/harç değişebilir; kaynak kontrolü tarihi damgada.
 */

function Kaynak({ n }: { n: number }) {
  return (
    <sup>
      <a
        href="#kaynaklar-baslik"
        className="ml-0.5 font-mono text-[10px] font-semibold text-teal-d no-underline hover:underline"
        aria-label={`Kaynak ${n}`}
      >
        [{n}]
      </a>
    </sup>
  );
}

export const toc: TocOge[] = [
  { id: "ozet", baslik: "Kısaca yetki belgesi" },
  { id: "nedir", baslik: "Yetki belgesi nedir?" },
  { id: "isletme-sartlari", baslik: "İşletme için şartlar" },
  { id: "sorumlu-danisman", baslik: "Sorumlu emlak danışmanı ve MYK" },
  { id: "basvuru", baslik: "Başvuru: TTBS adımları" },
  { id: "2026-harc", baslik: "2026 yıllık yetki harcı" },
  { id: "gecerlilik", baslik: "Geçerlilik ve yenileme" },
  { id: "eids-iliskisi", baslik: "EİDS ile ilişkisi" },
  { id: "sik-hatalar", baslik: "Sık yapılan hatalar" },
];

/** Görünür SSS + FAQPage schema (tek kaynak). */
export const faq = [
  {
    s: "Taşınmaz ticareti yetki belgesi olmadan emlak ofisi açılır mı?",
    c: "Hayır. Taşınmaz ticareti (alım, satım, kiralama aracılığı) faaliyeti için yetki belgesi zorunludur; belgesiz faaliyet idari yaptırıma tabidir.",
  },
  {
    s: "Yetki belgesi için hangi mesleki yeterlilik belgesi gerekir?",
    c: "İşletmede en az bir sorumlu emlak danışmanının Seviye 5 mesleki yeterlilik belgesine sahip olması gerekir.",
  },
  {
    s: "Başvuru nereden yapılır?",
    c: "Başvuru, Ticaret Bakanlığı’nın Taşınmaz Ticareti Bilgi Sistemi (TTBS) üzerinden çevrim içi yapılır; onay Ticaret İl Müdürlüğü tarafından verilir.",
  },
  {
    s: "Yetki belgesinin süresi var mı?",
    c: "Yetki belgesi şartlar korundukça süresizdir; ancak sorumlu danışmanın mesleki yeterlilik belgesi 5 yıl geçerlidir ve süresinde yenilenmelidir.",
  },
  {
    s: "Yetki belgesi olan işletme ilan verebilir mi?",
    c: "İlan yayımlamak için yetki belgesi tek başına yeterli değildir; ilgili taşınmaz için EİDS yetkilendirmesi de e-Devlet üzerinden alınmalıdır.",
  },
];

export function Govde() {
  return (
    <>
      <AnswerFirst>
        <p>
          Taşınmaz Ticareti Yetki Belgesi, emlak ticareti (alım, satım, kiralama aracılığı) yapan
          işletmelerin sahip olması gereken resmî izin belgesidir. Ticaret Bakanlığı tarafından{" "}
          <strong>Taşınmaz Ticareti Bilgi Sistemi (TTBS)</strong> üzerinden verilir.<Kaynak n={2} /> Belge
          olmadan taşınmaz ticareti faaliyeti yürütülemez; ayrıca ilan yayımlamak için EİDS yetkilendirmesi
          de gerekir.<Kaynak n={1} />
        </p>
      </AnswerFirst>

      <IstatistikSerit
        ogeler={[
          { deger: "Seviye 5", etiket: "Sorumlu emlak danışmanı mesleki yeterlilik belgesi", renk: "teal" },
          { deger: "20-40 bin ₺", etiket: "2026 yıllık yetki harcı (küçük şehir / büyükşehir)", renk: "amber" },
          { deger: "5 yıl", etiket: "Mesleki yeterlilik belgesi geçerlilik süresi", renk: "navy" },
          { deger: "TTBS", etiket: "Başvuru ve sorgulama kanalı", renk: "navy" },
        ]}
      />

      <Bolum id="ozet" baslik="Kısaca yetki belgesi" Ikon={BadgeCheck}>
        <GuncelDurumTablosu
          baslik="Yetki belgesi: temel çerçeve"
          kolonlar={["Konu", "Durum"]}
          satirlar={[
            ["Belgeyi veren kurum", "Ticaret Bakanlığı (Ticaret İl Müdürlükleri / TTBS)"],
            ["Zorunlu mu", "Evet; belgesiz taşınmaz ticareti yapılamaz"],
            ["Sorumlu danışman şartı", "En az bir kişide Seviye 5 mesleki yeterlilik belgesi"],
            ["Başvuru kanalı", "TTBS (çevrim içi)"],
            ["Belge geçerliliği", "Süresiz (şartlar korundukça); güncelleme gerekebilir"],
            ["Mesleki yeterlilik belgesi", "5 yıl geçerli, süresinde yenilenmeli"],
            ["2026 yıllık harç", "Küçük şehir ~20.000 TL, büyükşehir ~40.000 TL"],
          ]}
          dipnot="Kaynak kontrolü: 11 Ağustos 2026. Tutar, şart ve süreçler değişebilir; başvuru öncesi TTBS'yi ve bulunduğunuz Ticaret İl Müdürlüğünü teyit edin."
        />
      </Bolum>

      <Bolum id="nedir" baslik="Yetki belgesi nedir, neden gerekir?" Ikon={FileText}>
        <p>
          Taşınmaz Ticareti Hakkında Yönetmelik, emlak sektöründe daha güvenilir ve denetlenebilir bir
          hizmet için işletmelere belge zorunluluğu getirir.<Kaynak n={1} /> Yetki belgesi, işletmenin
          taşınmaz alım, satım ve kiralanmasına aracılık etme yetkisini gösterir. Belgesiz faaliyet idari
          yaptırıma tabidir.
        </p>
        <p>
          Belge <strong>işletmeye</strong> verilir; ancak işletmede belirli niteliklere sahip bir{" "}
          <strong>sorumlu emlak danışmanı</strong> bulunması şarttır. Yani yetki belgesi, işletme şartları
          ile personel (mesleki yeterlilik) şartlarının birlikte sağlanmasıyla alınır.
        </p>
      </Bolum>

      <Bolum id="isletme-sartlari" baslik="İşletme için aranan şartlar" Ikon={Store}>
        <p>Ticaret İl Müdürlüklerinin belirttiği temel işletme şartları:</p>
        <ul>
          <li>
            <strong>Vergi mükellefiyeti:</strong> Gelir veya Kurumlar Vergisi mükellefi olmak; faaliyet
            konuları arasında taşınmaz ticaretinin bulunması ve güncel vergi levhası.
          </li>
          <li>
            <strong>Meslek odası kaydı:</strong> Esnaf veya Ticaret Odasından son üç ay içinde alınmış
            güncel oda kayıt/faaliyet belgesi (esnaf sicil tasdiknamesi kabul edilmez).
          </li>
          <li>
            <strong>İş yeri:</strong> Faaliyete uygun, bağımsız bir iş yeri.
          </li>
          <li>
            <strong>Sorumlu emlak danışmanı:</strong> İşletmede en az bir sorumlu emlak danışmanının Seviye
            5 mesleki yeterlilik belgesine sahip olması.
          </li>
        </ul>
        <p>
          Ayrıca başvuruda bulunan kişilerde 18 yaşını doldurmuş olmak, iflasla ilgili itibar şartı ve adli
          sicil şartı (kasten işlenen suçtan 5 yıldan fazla hapis veya zimmet, rüşvet, dolandırıcılık,
          sahtecilik gibi suçlardan hüküm giymemiş olmak) aranır.<Kaynak n={1} />
        </p>
      </Bolum>

      <Bolum id="sorumlu-danisman" baslik="Sorumlu emlak danışmanı ve mesleki yeterlilik" Ikon={GraduationCap}>
        <p>
          Yetki belgesinin kalbi, sorumlu emlak danışmanı şartıdır. Bu kişinin <strong>Seviye 5 mesleki
          yeterlilik belgesi</strong> bulunması gerekir. Ek olarak öğrenim ve deneyim koşulları vardır:
        </p>
        <ul>
          <li>Belge başvurusundan önceki son beş yıl içinde, ön lisans/lisans/lisansüstü mezunları için en az <strong>6 ay</strong>; diğerleri için en az <strong>12 ay</strong> emlak danışmanlığı deneyimi.</li>
          <li>Öğrenim: en az ilköğretim mezunu ve taşınmaz ticareti konusunda en az 100 saatlik eğitimde başarı.</li>
        </ul>
        <VurguKutusu tip="bilgi" baslik="İlgili alan mezunlarına istisna">
          <p>
            Ortaöğretim veya yükseköğretim kurumlarının taşınmaz ticareti ile ilgili alanlarından (ya da
            denkliği kabul edilen yurt dışı kurumlardan) mezun olanlarda mesleki eğitim ve deneyim şartı
            aranmaz.<Kaynak n={1} />
          </p>
        </VurguKutusu>
      </Bolum>

      <Bolum id="basvuru" baslik="Başvuru: TTBS üzerinden adımlar" Ikon={UserCheck}>
        <p>
          Başvuru, Ticaret Bakanlığı’nın Taşınmaz Ticareti Bilgi Sistemi (TTBS) üzerinden çevrim içi yapılır.
          <Kaynak n={2} /> Pratik akış:
        </p>
        <SurecAkisi
          adimlar={[
            { baslik: "Mesleki yeterlilik", aciklama: "Sorumlu danışman Seviye 5 belgesini alır." },
            { baslik: "Belgeler hazırlanır", aciklama: "Vergi levhası, oda kaydı, iş yeri ve kişisel şart belgeleri." },
            { baslik: "TTBS başvurusu", aciklama: "İşletme ve sorumlu danışman bilgileriyle çevrim içi başvuru." },
            { baslik: "İl Müdürlüğü onayı", aciklama: "Şartlar sağlanırsa yetki belgesi düzenlenir." },
          ]}
        />
        <BolumGorsel
          src="/generated/rehber/eids-edevlet.jpg"
          alt="Bir dizüstü bilgisayarda dijital doğrulama ekranı ve onay işareti; yanında telefon tutan el"
          caption="Yetki belgesi başvurusu TTBS üzerinden çevrim içi yürütülür (temsilî görsel)."
        />
      </Bolum>

      <Bolum id="2026-harc" baslik="2026 yıllık yetki harcı" Ikon={Wallet}>
        <p>
          2026 itibarıyla yetki belgesi için yıllık harç uygulaması gündeme gelmiştir: küçük şehirlerde
          yaklaşık <strong>20.000 TL</strong>, büyükşehirlerde yaklaşık <strong>40.000 TL</strong> olarak
          konuşulmaktadır.<Kaynak n={1} />
        </p>
        <VurguKutusu tip="uyari" baslik="Tutarı işlem öncesi teyit edin">
          <p>
            Harç tutarları ve uygulama detayları yıl içinde güncellenebilir. Başvuru veya yenileme öncesi
            TTBS’yi ve bulunduğunuz Ticaret İl Müdürlüğünü teyit edin.
          </p>
        </VurguKutusu>
      </Bolum>

      <Bolum id="gecerlilik" baslik="Geçerlilik ve yenileme" Ikon={RefreshCw}>
        <p>
          Yetki belgesi, şartlar korundukça <strong>süresiz</strong> düzenlenir; işletmenin taşınması, isim
          değişikliği veya şartların kaybı durumunda güncellenmesi gerekir. Sorumlu danışmanın mesleki
          yeterlilik belgesi ise <strong>5 yıl</strong> geçerlidir ve süresinde yenilenmelidir. Yenilenmeyen
          mesleki yeterlilik belgesi, işletmenin yetki belgesinin iptaline yol açabilir.
        </p>
      </Bolum>

      <Bolum id="eids-iliskisi" baslik="Yetki belgesi ile EİDS ilişkisi" Ikon={Link2}>
        <p>
          Yetki belgesi ve EİDS iki ayrı ama tamamlayıcı gerekliliktir. Yetki belgesi <strong>taşınmaz
          ticareti yapma</strong> iznidir; EİDS ise <strong>ilan yayımlama</strong> için taşınmaz bazında
          yapılan resmî doğrulamadır. Belgesi olan işletme dahi, ilan verecekse ilgili taşınmaz için EİDS
          yetkilendirmesini ayrıca almalıdır.<Kaynak n={1} />
        </p>
        <p>
          EİDS zorunluluğu, tarihleri ve sosyal medya kuralları için EİDS rehberimize bakabilirsiniz.
        </p>
      </Bolum>

      <Bolum id="sik-hatalar" baslik="Sık yapılan hatalar" Ikon={AlertTriangle}>
        <ul>
          <li>Yetki belgesi ile EİDS yetkilendirmesini aynı sanmak.</li>
          <li>Sorumlu danışmanın mesleki yeterlilik belgesinin 5 yıllık süresini takip etmemek.</li>
          <li>Oda kaydını esnaf sicil tasdiknamesiyle karıştırmak (kabul edilmez).</li>
          <li>İş yeri, isim veya adres değişikliğinde belgeyi güncellememek.</li>
          <li>Yıllık harç ve güncel şartları başvuru öncesi teyit etmemek.</li>
        </ul>
      </Bolum>

      <IcerikFAQ sorular={faq} />
    </>
  );
}
