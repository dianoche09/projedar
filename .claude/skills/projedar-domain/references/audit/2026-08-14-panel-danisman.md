# Audit — Danışman Paneli (MODE D, scoped) · 2026-08-14

> Kapsam: `src/app/danisman/**` + `/p/[...slug]` mikrosite + `src/lib/sharing.ts` + `/api/lead` + `/api/etkilesim`.
> Kanonik gerçek: MASTER-IDENTITY-V2 > docs/projedar-intelligence > kod > db/*. Kod-doğrulanmış.
> Route: panel `/danisman` (eski `/havuz`). Verildi: yapısal rapor (ana teslim). Bu dosya kalıcı özet.

## Executive
Panel yüzey olarak zengin (havuz liste+harita+filtre, proje detay realtime, DaireModal, imzalı paylaşım+katalog,
3 opsiyon yöntemi, lead timeline, eşleştir, performans). Çekirdek opsiyon/çift-satış zinciri DB-tarafında sağlam
(`opsiyon_tek_aktif` unique + `opsiyon_birim_senkron` trigger DELETE→musait + cron serbest bırakma). Kırık/yanıltıcı
noktalar **fiyat görünürlük sınırının panel dışına sızması**, **buyer'a yanlış "tutuyoruz" vaadi**, **abuse throttle
boşlukları**, **realized hakediş ekranı yokluğu** ve **bayat `/havuz` bildirim deep-linkleri**.

## Bulgular (özet tablo)
| ID | Sev | Konu | Kanıt | En küçük düzeltme |
|---|---|---|---|---|
| D-01 | P1 | Mikrosite `fiyat_gorunur=false` redaksiyonunu bypass eder (admin client ham `liste_fiyati`) | `src/app/p/[...slug]/page.tsx:138-153,346-353` vs `proje/[id]/page.tsx:86-92` (`emlakci_birim_fiyat` RPC) | Mikrosite/katalog fiyatını yöneten tahsis `fiyat_gorunur`'una göre redakte et (aynı RPC/SQL) |
| D-02 | P1 | Katalog PDF gizli fiyatı basar | `proje/[id]/katalog/page.tsx:74-101,196` ham `liste_fiyati` | D-01 ile aynı redaksiyon |
| D-03 | P1 | Eşleştir aracı ham fiyat + bütçe filtresi ham fiyatla; redaksiyon yok | `eslestir/page.tsx:13-21`, `Eslestirici.tsx:47-49` | Redakte fiyat RPC'sini eşleştir sorgusuna da uygula |
| D-04 | P1 | Buyer'a "ön rezervasyon = daireyi tutuyoruz" vaadi ama hiçbir kilit/opsiyon oluşmaz (lead≠rezervasyon) | `p/[...slug]/LeadForm.tsx:98-99`, `/api/lead` sadece lead satırı yazar | Kopyayı "talep iletildi" yap; gerçek tutma = geçici-opsiyon akışına bağla |
| D-05 | P1 | `/api/lead` zayıf throttle (yalnız tel+birim/10dk), IP/captcha/global limit yok → lead spam + PII kirliliği + bildirim floodu; token buyer'ın elinde | `/api/lead/route.ts:44-59` | IP rate-limit + tekrar POST'ta captcha; günlük/birim tavanı |
| D-06 | P1 | Cross-emlakçı lead çakışması modellenmemiş; "kimse alamaz" güvencesi yalnız kendi görünümünde doğru | `leadler/[id]/page.tsx:79-86,143` (çift sayımı RLS-scoped) | Yakala anında telefon_norm çakışmasını platform-tarafı (admin) tespit + uyar/first-touch politikası |
| D-07 | P2 | Realized hakediş/kazanç ekranı yok; danışman yalnız PROJEKTE "senin payın" görür (earned≠paid conflation); `hakedis-defteri` tablosu var ama panelde yüzey yok | danisman route listesi (kazanc/hakedis sayfası yok) + `db/2026-08-09_hakedis-defteri.sql` | Kapanan satışlar + hakediş durumu için okunur ledger ekranı |
| D-08 | P2 | Bayat `/havuz/...` bildirim deep-linkleri (panel `/danisman`) → 404 | `db/2026-08-05_opsiyon-yasam-dongusu.sql:50`, `db/2026-08-10_fiyat-dususu-bildirim.sql:72` | Cron/trigger link'lerini `/danisman/...` yap |
| D-09 | P2 | Havuz liste "Canlı / son senkron" rozeti realtime değil (statik server snapshot); yalnız proje detay realtime | `HavuzListe.tsx:161-169` (rozet) vs realtime yalnız `EmlakciStok.tsx:70-96` | Rozeti "son güncelleme" olarak dürüstleştir veya listeyi realtime/poll'a bağla |
| D-10 | P2 | Görüntüleme/favori moat metrikleri self-inflatable: `/api/etkilesim` throttle yok; `goruntuleme` her sayfa yüklemede | `etkilesim/route.ts` (limit yok), `p/[...slug]/page.tsx:274-282` | Dedup (birim+gün) + IP throttle; kendi emlakçısını sayımdan düş |
| D-11 | P2 | Geçici-opsiyon müşteri PII'si (ad/tel) 3. kişi rızası kaydı olmadan sisteme girilir (müteahhide iletilir) | `DaireModal.tsx:667-709`, `opsiyonAlGecici` | KVKK: rıza/işleme dayanağı flag'le (LEGAL VALIDATION REQUIRED) |
| D-12 | P2 | Rakip opsiyonundaki birimde kilit bitiş/ETA görünmez + "boşalınca haber ver" yok (yalnız planlı `ilgiBildir`) | `DaireModal.tsx:764-769` (ETA yok) | Rakip opsiyonda `kilit_bitis` göster + serbest kalınca bildirim opt-in |
| D-13 | P2 | Havuz liste + eşleştir server pagination yok; tüm tahsisli birim tek seferde | `danisman/page.tsx:9-22`, `eslestir/page.tsx:13-21` | Ölçekte server-side sayfalama/limit |
| D-14 | P2 | Uzun HMAC paylaşım linki (emlakci/birim/token) süresiz + iptal edilemez; tahsis çekilse/durum değişse bile canlı veri servis eder (kısa-kod `aktif` ile iptal edilebilir, uzun link değil) | `sharing.ts:22-35`, `p/[...slug]/page.tsx:126` (tahsis re-check yok) | Uzun link path'ini deprecate et / kısa-koda migrate; `aktif` + opsiyonel expiry doğrula |
| D-15 | P3 | `fiyat_gorunur=false` birim havuz kartında "Fiyat belirtilmedi" (var ama gizli) yanıltıcı ifade | `HavuzListe.tsx:464` | "Fiyat üreticide gizli" ayrı ifade |
| D-16 | P3 | Havuz "Opsiyonlu" durum filtresi proje-agregatı (`p.opsiyon>0`), birim değil | `HavuzListe.tsx:104` | Etiketi netleştir |

## Doğrulanan sağlamlıklar (regresyon guard)
- Çift-satış: `opsiyon_tek_aktif` unique + 23505 UI mesajı (`actions.ts:154-157`).
- Opsiyon→birim durum senkron DELETE→musait (`supabase-schema.sql:397-413`) → orphan yok; cron serbest bırakma (`db/2026-08-05:14-31`).
- Emlakçı doğrudan opsiyon insert edemez (RLS `opsiyon_insert = is_admin()`), yöntem `dogrudan`/`gecici` yalnız SECURITY DEFINER RPC.
- Fiyat OG'ye basılmaz (donma önleme, DEĞİŞMEZ #2/#5) — `p/[...slug]/page.tsx:87-94`.
- Lead PII yalnız lead sahibine (RLS `lead_select` = admin/atanan/ilk_paylasan).

## Öncelik
Now: D-01,D-02,D-03 (fiyat redaksiyon paritesi — takım bunu "HIGH" ilan etti), D-04 (buyer vaadi), D-05 (lead spam).
Next: D-06,D-07,D-08,D-09,D-10.
Later: D-11..D-14.
Out/observe: D-15,D-16.
