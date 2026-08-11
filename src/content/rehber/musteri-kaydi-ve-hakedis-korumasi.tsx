import {
  UserCheck,
  ScrollText,
  Percent,
  Clock,
  BadgeCheck,
  AlertTriangle,
  Users,
  ShieldCheck,
} from "lucide-react";
import { AnswerFirst } from "@/components/icerik/AnswerFirst";
import { Bolum } from "@/components/icerik/Bolum";
import { IcerikFAQ } from "@/components/icerik/IcerikFAQ";
import { IstatistikSerit } from "@/components/icerik/IstatistikSerit";
import { SurecAkisi } from "@/components/icerik/SurecAkisi";
import { VurguKutusu } from "@/components/icerik/VurguKutusu";
import { SenaryoKutusu } from "@/components/icerik/SenaryoKutusu";
import { BolumGorsel } from "@/components/icerik/IcerikGorsel";
import type { TocOge } from "@/components/icerik/IcerikToc";

/**
 * Rehber gövdesi: emlak danışmanı müşteri kaydı ve hak ediş (hizmet bedeli) koruması.
 * Hizmet bedeli/yetkilendirme iddiaları resmî kaynağa [1] atıflı (Taşınmaz Ticareti
 * Hakkında Yönetmelik). Oran/koşul değişebilir; yürürlükteki metin esastır, damgada teyit.
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
  { id: "ozet", baslik: "Kısa cevap" },
  { id: "hakedis", baslik: "Hizmet bedeli (hakediş) nedir?" },
  { id: "kayit", baslik: "Müşteri kaydı neden önemli?" },
  { id: "uc-sutun", baslik: "Hakedişi koruyan üç sütun" },
  { id: "proje", baslik: "Proje satışında özel durum" },
  { id: "anlasmazlik", baslik: "Anlaşmazlık nereden çıkar?" },
  { id: "senaryolar", baslik: "Örnek durumlar" },
  { id: "sik-hatalar", baslik: "Sık yapılan hatalar" },
];

/** Görünür SSS + FAQPage schema (tek kaynak). */
export const faq = [
  {
    s: "Emlak danışmanı hizmet bedelini (komisyon) en fazla ne kadar alabilir?",
    c: "Alım satım işlemlerinde hizmet bedeli, aracılık sözleşmesindeki satış bedelinin KDV hariç yüzde 4'ünden fazla olamaz. Kiralamada ise en fazla bir aylık kira bedeli kadardır (KDV hariç).",
  },
  {
    s: "Hizmet bedeli talep edebilmek için ne gerekir?",
    c: "Yetki belgesine sahip olmak ve iş sahibiyle yazılı yetkilendirme sözleşmesi düzenlemek gerekir. Yetki belgesi ve sözleşme olmadan hizmet bedeli talebi hukuken zayıftır.",
  },
  {
    s: "Müşteri kaydı hakedişi nasıl korur?",
    c: "Kayıt, hangi danışmanın hangi müşteriyi hangi projeye getirdiğini zaman damgalı ve net biçimde belgeler. Satış gerçekleşince hakedişin kime ait olduğu tartışmasız olur.",
  },
  {
    s: "Proje aşamasındaki konutta alıcı da iş sahibi olabilir mi?",
    c: "Evet. Yönetmelik, proje aşamasındaki veya tamamlanmamış taşınmazlarda alıcının da iş sahibi olduğu yetkilendirme sözleşmelerini ayrıca düzenler.",
  },
  {
    s: "Aynı müşteriyi iki danışman kaydederse ne olur?",
    c: "Kayıtların zaman damgası ve netliği belirleyici olur. Kayıt merkezi ve tekil değilse hakediş anlaşmazlığı çıkar; bu yüzden kaydın tek ve zaman damgalı olması önemlidir.",
  },
];

export function Govde() {
  return (
    <>
      <AnswerFirst>
        <p>
          Müşteri kaydı, bir danışmanın getirdiği alıcıyı bir projeye kayıtlı hale getirerek, satış
          gerçekleşirse hizmet bedelinin (hakedişin) kendisine ait olmasını güvenceye almasıdır. Koruma üç
          şeye dayanır: <strong>yetki belgesi, yazılı yetkilendirme sözleşmesi ve kaydın zaman damgalı,
          tekil olması.</strong> Hizmet bedeli alım satımda satış bedelinin KDV hariç en fazla{" "}
          <strong>yüzde 4</strong>&apos;üdür.<Kaynak n={1} />
        </p>
      </AnswerFirst>

      <IstatistikSerit
        ogeler={[
          { deger: "En fazla %4", etiket: "Alım satımda hizmet bedeli (KDV hariç)", renk: "navy" },
          { deger: "Yazılı sözleşme", etiket: "Hakediş talebinin şartı", renk: "teal" },
          { deger: "Zaman damgası", etiket: "Kaydın belirleyici gücü", renk: "amber" },
          { deger: "Tekil kayıt", etiket: "Anlaşmazlığı önler", renk: "navy" },
        ]}
      />

      <Bolum id="ozet" baslik="Kısa cevap" Ikon={UserCheck}>
        <p>
          Bir danışmanın emeği, satışın kapandığı an hakedişe dönüşür. Ama bu hakedişin tartışmasız olması,
          işin başında atılan iki adıma bağlıdır: <strong>doğru sözleşme</strong> ve <strong>net, zaman
          damgalı müşteri kaydı.</strong> Bu rehber, hakedişin nasıl doğduğunu ve nasıl korunacağını açıklar.
        </p>
      </Bolum>

      <Bolum id="hakedis" baslik="Hizmet bedeli (hakediş) nedir?" Ikon={Percent}>
        <p>
          Hizmet bedeli, taşınmaz ticaretinde verilen aracılık hizmetinin karşılığıdır ve mevzuatla
          sınırlandırılmıştır:<Kaynak n={1} />
        </p>
        <ul>
          <li><strong>Alım satım:</strong> Hizmet bedeli, aracılık sözleşmesindeki satış bedelinin KDV hariç yüzde 4&apos;ünden fazla olamaz.</li>
          <li><strong>Kiralama:</strong> Hizmet bedeli, bir aylık kira bedelinden (KDV hariç) fazla olamaz.</li>
          <li><strong>Şart:</strong> Hizmet bedeli talep edebilmek için yetki belgesi ve iş sahibiyle yazılı yetkilendirme sözleşmesi gerekir.</li>
        </ul>
        <p>
          Hizmet bedelinin iş sahibi ile taraflar arasında paylaşım usulü de sözleşmede düzenlenir; cayma
          parası kararlaştırılırsa, bu tutar hizmet bedelini aşamaz.<Kaynak n={1} />
        </p>
      </Bolum>

      <Bolum id="kayit" baslik="Müşteri kaydı neden önemli?" Ikon={ScrollText}>
        <p>
          Hizmet bedeli hakkı, işin sonunda &quot;bu müşteriyi ben getirdim&quot; diyebilmekle korunur.
          Müşteri kaydı tam da bunu belgeler: hangi danışmanın hangi müşteriyi hangi projeye, ne zaman
          getirdiğini gösterir. Kayıt belirsizse, satış kapandığında hakediş tartışmaya açılır.
        </p>
        <BolumGorsel
          src="/generated/rehber/eids-hero.jpg"
          alt="Bir gayrimenkul danışmanı, ofiste tablet üzerinde müşteri kaydını ve proje bilgisini incelerken"
          caption="Zaman damgalı ve tekil müşteri kaydı, hakedişin tartışmasız sahibini belirler (temsilî görsel)."
        />
      </Bolum>

      <Bolum id="uc-sutun" baslik="Hakedişi koruyan üç sütun" Ikon={ShieldCheck}>
        <SurecAkisi
          adimlar={[
            { baslik: "Yazılı sözleşme", aciklama: "İş sahibiyle yetkilendirme sözleşmesi yazılı yapılır; hizmet bedeli ve paylaşımı burada nettir." },
            { baslik: "Zaman damgalı kayıt", aciklama: "Müşteri, projeye getirildiği an kaydedilir; tarih ve saat hakedişin sırasını belirler." },
            { baslik: "Net tahsis", aciklama: "Hangi dairenin hangi danışmana açık olduğu belliyse, kaydın kapsamı da tartışmasız olur." },
          ]}
        />
        <VurguKutusu tip="dogru" baslik="Üçü birlikte çalışır">
          <p>
            Yazılı sözleşme hakkın <em>hukuki</em> zeminidir; zaman damgalı kayıt hakkın <em>kime ait</em>
            olduğunu; net tahsis ise <em>hangi kapsamda</em> geçerli olduğunu belirler. Biri eksikse hakediş
            zayıflar.
          </p>
        </VurguKutusu>
      </Bolum>

      <Bolum id="proje" baslik="Proje satışında özel durum" Ikon={BadgeCheck}>
        <p>
          Proje aşamasında olup henüz tamamlanmamış taşınmazlarda, yönetmelik alıcının da <strong>iş
          sahibi</strong> olduğu yetkilendirme sözleşmelerini ayrıca düzenler.<Kaynak n={1} /> Yani danışman,
          alıcı adına da yetkilendirme sözleşmesi kurabilir. Bu, projeden satışta müşteri kaydının ve
          sözleşmenin doğru kurulmasını daha da önemli kılar: hakedişin kimden, hangi sözleşmeye dayanarak
          doğduğu baştan net olmalıdır.
        </p>
      </Bolum>

      <Bolum id="anlasmazlik" baslik="Anlaşmazlık nereden çıkar?" Ikon={AlertTriangle}>
        <ul>
          <li><strong>Kayıtsız çalışmak:</strong> &quot;Müşteriyi ben getirdim&quot; sözlü kalırsa, kanıtı olmaz.</li>
          <li><strong>Çifte kayıt:</strong> Aynı müşteri iki danışman tarafından kaydedilirse, zaman damgası ve netlik yoksa hakediş çakışır.</li>
          <li><strong>Sözleşmesiz ilerlemek:</strong> Yetkilendirme sözleşmesi yoksa, hizmet bedeli talebi hukuken zayıf kalır.</li>
          <li><strong>Belirsiz tahsis:</strong> Hangi dairenin kime açık olduğu belli değilse, kaydın kapsamı tartışılır.</li>
        </ul>
      </Bolum>

      <Bolum id="senaryolar" baslik="Örnek durumlar" Ikon={Users}>
        <SenaryoKutusu baslik="Müşteriyi ben getirdim ama satışı başka danışman kapattı">
          <p>
            Belirleyici olan, müşterinin kime ve ne zaman kayıtlı olduğudur. Zaman damgalı, tekil bir kayıt
            varsa hakediş tartışmasızdır; kayıt yoksa iddia sözde kalır. Müşteriyi ilk temasta kaydedin.
          </p>
        </SenaryoKutusu>
        <SenaryoKutusu baslik="Aynı projede iki ofis aynı müşteriyi öne sürüyor">
          <p>
            Kayıtların merkezi ve zaman damgalı olması bu durumu baştan çözer. Kayıt dağınık (Excel, mesaj)
            tutuluyorsa, hangi kaydın önce geldiği bile tartışmalı olur.
          </p>
        </SenaryoKutusu>
      </Bolum>

      <Bolum id="sik-hatalar" baslik="Sık yapılan hatalar" Ikon={Clock}>
        <ul>
          <li>Müşteriyi sözlü sözle takip edip kayıt tutmamak.</li>
          <li>Yetkilendirme sözleşmesini yazılı yapmadan ilerlemek.</li>
          <li>Hizmet bedeli ve paylaşımını sözleşmede netleştirmemek.</li>
          <li>Kaydı zaman damgasız, dağınık yerlerde tutmak (Excel, mesaj).</li>
          <li>Proje satışında alıcı adına sözleşme imkânını atlamak.</li>
        </ul>
        <VurguKutusu tip="dogru" baslik="Kaydı merkezî ve zaman damgalı tutmak">
          <p>
            Müşteri kaydının tek merkezde, zaman damgalı ve tahsisle ilişkili tutulması, hakediş
            anlaşmazlıklarını yapısal olarak azaltır. Projedar bu kaydı ağ içinde canlı ve tahsisli tutar;
            kimin hangi projeye, ne zaman erişimi olduğu nettir. Hizmet bedeli tümüyle danışman ile iş sahibi
            arasındadır; Projedar bu bedele ortak olmaz.
          </p>
        </VurguKutusu>
      </Bolum>

      <IcerikFAQ sorular={faq} />
    </>
  );
}
