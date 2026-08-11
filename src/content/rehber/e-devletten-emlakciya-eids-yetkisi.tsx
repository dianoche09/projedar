import {
  KeyRound,
  UserCheck,
  ListChecks,
  Clock,
  Users2,
  FileText,
  AlertTriangle,
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
 * Rehber gövdesi: e-Devlet üzerinden EİDS yetkilendirme (EİDS kümesi kardeşi).
 * Süreç/süre iddiaları resmî kaynağa [n] atıflı (EİDS yetki uygulaması [1], e-Devlet hizmeti [2]).
 * Adım/süre değişebilir; kaynak kontrolü damgada.
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
  { id: "nedir", baslik: "EİDS yetkisi nedir?" },
  { id: "kim-verir", baslik: "Kim verir, kim alır?" },
  { id: "adimlar", baslik: "e-Devlet'ten adım adım" },
  { id: "sure", baslik: "Yetki süresi ve bitişi" },
  { id: "hisseli", baslik: "Hisseli taşınmaz durumu" },
  { id: "belge-farki", baslik: "Yetki belgesinden farkı" },
  { id: "senaryolar", baslik: "Örnek durumlar" },
  { id: "sik-hatalar", baslik: "Sık yapılan hatalar" },
];

export function Govde() {
  return (
    <>
      <AnswerFirst>
        <p>
          EİDS yetkisi, bir taşınmaz için ilan yayımlama iznidir ve <strong>taşınmaz sahibi tarafından
          e-Devlet üzerinden</strong> emlak işletmesine verilir.<Kaynak n={2} /> Yetki taşınmaz bazındadır,
          en az <strong>3 ay</strong> süreyle tanımlanır ve doğrulama bilgisi (kod/QR) oluşturur.<Kaynak n={1} />
        </p>
      </AnswerFirst>

      <IstatistikSerit
        ogeler={[
          { deger: "e-Devlet", etiket: "Yetkilendirme kanalı", renk: "navy" },
          { deger: "Taşınmaz sahibi", etiket: "Yetkiyi veren taraf", renk: "teal" },
          { deger: "En az 3 ay", etiket: "Yetki süresi", renk: "amber" },
          { deger: "Taşınmaz bazında", etiket: "Yetki kapsamı (her taşınmaz için ayrı)", renk: "navy" },
        ]}
      />

      <Bolum id="ozet" baslik="Kısa cevap" Ikon={KeyRound}>
        <p>
          Emlak işletmesi, bir taşınmazı ilana çıkarmadan önce iki şeye ihtiyaç duyar: geçerli bir yetki
          belgesi ve o taşınmaz için sahibinden e-Devlet üzerinden alınmış EİDS yetkisi. Bu rehber ikinci
          adımı, yani <strong>e-Devlet üzerinden yetkilendirmeyi</strong> açıklar.
        </p>
      </Bolum>

      <Bolum id="nedir" baslik="EİDS yetkisi nedir?" Ikon={FileText}>
        <p>
          EİDS (Elektronik İlan Doğrulama Sistemi), taşınmaz ilanlarının yetkili kişilerce verildiğini
          doğrulayan resmî sistemdir. Satılık taşınmaz ilanlarında yetki doğrulaması 1 Şubat 2026’dan
          itibaren zorunludur.<Kaynak n={1} /> Yetki, ilanı verecek işletmeye taşınmaz sahibi tarafından
          e-Devlet üzerinden tanımlanır.<Kaynak n={2} />
        </p>
      </Bolum>

      <Bolum id="kim-verir" baslik="Kim verir, kim alır?" Ikon={UserCheck}>
        <ul>
          <li><strong>Yetkiyi veren:</strong> taşınmaz sahibi (malik).</li>
          <li><strong>Yetkiyi alan:</strong> taşınmaz ticareti yetki belgesine sahip emlak işletmesi.</li>
          <li><strong>Kapsam:</strong> yetki belirli bir taşınmaz için verilir; her taşınmaz için ayrı yetkilendirme gerekir.</li>
        </ul>
        <p>
          Taşınmaz sahibi kendi taşınmazı için doğrudan ilan verebilir; ancak bir işletme aracılığıyla
          ilan yayımlanacaksa, o işletmenin ilgili taşınmaz için yetkilendirilmesi gerekir.<Kaynak n={1} />
        </p>
      </Bolum>

      <Bolum id="adimlar" baslik="e-Devlet üzerinden adım adım" Ikon={ListChecks}>
        <p>
          Yetkilendirme e-Devlet üzerinden yapılır. Pratik akış, taşınmaz sahibinin ilgili hizmet üzerinden
          işletmeyi o taşınmaz için tanımlamasına dayanır:<Kaynak n={2} />
        </p>
        <SurecAkisi
          adimlar={[
            { baslik: "e-Devlet girişi", aciklama: "Taşınmaz sahibi e-Devlet'te taşınmaz ilanı yetkilendirme hizmetine girer." },
            { baslik: "Taşınmaz ve işletme seçimi", aciklama: "İlgili taşınmaz ve yetkilendirilecek emlak işletmesi seçilir." },
            { baslik: "Süre ve onay", aciklama: "Yetki süresi belirlenir (en az 3 ay) ve onaylanır." },
            { baslik: "Doğrulama bilgisi", aciklama: "Taşınmaza özgü doğrulama bilgisi (kod/QR) oluşur; ilan bu bilgiyle yayımlanır." },
          ]}
        />
        <BolumGorsel
          src="/generated/rehber/eids-edevlet.jpg"
          alt="Bir dizüstü bilgisayarda dijital doğrulama ekranı ve onay işareti; yanında telefon tutan el"
          caption="Yetkilendirme ve doğrulama e-Devlet üzerinden, taşınmaz bazında yapılır (temsilî görsel)."
        />
        <VurguKutusu tip="bilgi" baslik="İşlem öncesi teyit">
          <p>
            e-Devlet hizmet adı, ekran adımları ve alanlar güncellenebilir. İşlem öncesi e-Devlet’teki
            güncel hizmet akışını ve Ticaret Bakanlığı yönlendirmelerini teyit edin.
          </p>
        </VurguKutusu>
      </Bolum>

      <Bolum id="sure" baslik="Yetki süresi ve bitişi" Ikon={Clock}>
        <p>
          Verilen EİDS yetkisi belirli bir süre için geçerlidir; süre <strong>en az 3 ay</strong> olarak
          belirlenir.<Kaynak n={1} /> Sürenin dolması, işletmenin o taşınmaz için ilan verme hakkını
          sonlandırır. İlan yayında kalacaksa yetkinin süresinde yenilenmesi gerekir.
        </p>
      </Bolum>

      <Bolum id="hisseli" baslik="Hisseli taşınmaz durumu" Ikon={Users2}>
        <p>
          Hisseli taşınmazlarda tüm hissedarların yetki vermesi gerekmez; tek bir hissedarın EİDS yetkisi
          vermesi ilan için yeterli olabilir.<Kaynak n={1} /> Yine de tarafların aralarındaki ticari
          düzenlemeyi ayrıca netleştirmesi önerilir.
        </p>
      </Bolum>

      <Bolum id="belge-farki" baslik="Yetki belgesinden farkı" Ikon={FileText}>
        <p>
          EİDS yetkisi ile taşınmaz ticareti yetki belgesi ayrı kavramlardır. <strong>Yetki belgesi</strong>{" "}
          işletmenin taşınmaz ticareti yapma iznidir; <strong>EİDS yetkisi</strong> ise ilan yayımlamak için
          taşınmaz bazında verilen doğrulamadır. Belgesi olan işletme dahi, ilan verecekse ilgili taşınmaz
          için EİDS yetkisini ayrıca almalıdır.
        </p>
      </Bolum>

      <Bolum id="senaryolar" baslik="Örnek durumlar" Ikon={UserCheck}>
        <SenaryoKutusu baslik="Sahip 'yetkiyi verdim' diyor ama ilan hâlâ doğrulanamıyor">
          <p>
            Yetkilendirmenin doğru taşınmaz ve doğru işletme için tanımlandığını, süresinin başladığını ve
            doğrulama bilgisinin oluştuğunu kontrol edin. Eksik veya hatalı tanımlama ilanın
            doğrulanamamasına yol açabilir.
          </p>
        </SenaryoKutusu>
        <SenaryoKutusu baslik="Yetki süresi doldu, ilan hâlâ yayında">
          <p>
            Süre dolduğunda ilan verme hakkı sona erer. İlanı yayında tutacaksanız yetkiyi süresinde
            yenileyin; aksi hâlde doğrulama geçersiz duruma düşebilir.
          </p>
        </SenaryoKutusu>
      </Bolum>

      <Bolum id="sik-hatalar" baslik="Sık yapılan hatalar" Ikon={AlertTriangle}>
        <ul>
          <li>Yetki belgesini EİDS yetkisiyle karıştırmak.</li>
          <li>Bir taşınmaz için alınan yetkiyi başka taşınmaz için geçerli sanmak.</li>
          <li>Yetki süresinin dolduğunu fark etmeden yayını sürdürmek.</li>
          <li>Doğrulama bilgisini (kod/QR) ilanda görünür tutmamak.</li>
        </ul>
      </Bolum>

      <IcerikFAQ
        sorular={[
          {
            s: "EİDS yetkisini kim verir?",
            c: <p>Taşınmaz sahibi (malik), e-Devlet üzerinden ilgili emlak işletmesini o taşınmaz için yetkilendirir.</p>,
          },
          {
            s: "Yetki nereden verilir?",
            c: <p>Yetkilendirme e-Devlet üzerinden, taşınmaz ilanı yetkilendirme hizmetiyle yapılır.</p>,
          },
          {
            s: "Yetki süresi en az ne kadardır?",
            c: <p>Taşınmaz sahibinin verdiği EİDS yetkisi en az 3 ay olarak belirlenir.</p>,
          },
          {
            s: "Her taşınmaz için ayrı yetki mi gerekir?",
            c: <p>Evet. Yetki taşınmaz bazındadır; her taşınmaz için ayrı yetkilendirme gerekir.</p>,
          },
          {
            s: "Hisseli taşınmazda tüm hissedarların yetki vermesi gerekir mi?",
            c: <p>Hayır. Tek bir hissedarın EİDS yetkisi vermesi ilan için yeterli olabilir.</p>,
          },
        ]}
      />
    </>
  );
}
