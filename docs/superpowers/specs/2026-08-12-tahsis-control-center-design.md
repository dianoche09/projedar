# Tasarım: Distribution Control Center (Tahsis Yönetim Katmanı)

Tarih: 2026-08-12
Durum: Onay bekliyor (brainstorming çıktısı)
Kapsam sahibi: üretici paneli — tahsis (dağıtım) yüzeyi

## 0. Bağlam ve sınır

Kod incelemesi (2026-08-12) gösterdi ki **granüler tahsis motoru zaten olgun**:
- Katman 1 "Kime": tüm ağ / ofis / danışman + **canlı segment** (marka/il/ilçe/uzmanlık). `tahsis_hedef` enum + `hedef_filtre jsonb`.
- Katman 2 "Neyi": proje / blok / kat / tip / tür / **tekil birim**. `tahsis.kapsam jsonb`.
- Katman 3 "Koşul": komisyon (tip/deger), bitiş, münhasır, kontenjan, fiyat görünürlüğü.

**Gerçek açık = Katman 4 yaşam döngüsü + okuma.** Bugün yalnız `tahsisEkle` + `tahsisSil` var; gerçek düzenleme, toplu aksiyon, askıya alma, silmeden kapatma, süresi-dolacak durumu, stok-değişti yansıması ve stok→satıcı ters görünümü yok.

Bu çalışma **yeni tahsis sistemi inşa etmiyor**; mevcut güçlü dağıtım motorunun **operasyonel kontrol katmanını** tamamlıyor. Bu sınır scope'u temiz tutar.

Doğru başlık: `/uretici/tahsis` yüzeyini **Distribution Control Center**'a yükseltmek — tek yönetim otoritesi, iki perspektif.

## 1. Şema değişiklikleri

Migration: `db/2026-08-12_tahsis-yasam-dongusu.sql`

```sql
create type tahsis_durum as enum ('aktif','askida','kaldirildi');

alter table tahsis
  add column durum      tahsis_durum not null default 'aktif',  -- mevcut satırlar 'aktif' (doğru; hepsi bugün canlı)
  add column created_by uuid references profiles(id),            -- simetri + join-free UI (mevcut satırlar NULL)
  add column updated_at timestamptz,                             -- BACKFILL YOK: NULL kalır → badge referansı baslangic'e düşer
  add column updated_by uuid references profiles(id);

create index tahsis_durum_idx on tahsis(proje_id, durum);
```

Not:
- `updated_at` bilinçli olarak `now()` ile doldurulmaz. Aksi halde "son yönetimden beri" değişiklik rozeti sahte bir referans üretir (bkz. "sahte tazelik üretme" prensibi).
- `baslangic` + `bitis` zaten var (yeniden eklenmez). "Süresi dolacak" ayrı bir status DEĞİL; `bitis`'ten türetilen UI durumudur.

## 2. Görünürlük / RLS

`emlakci_proje_tahsisli` ve `emlakci_birim_gorebilir` security-definer fonksiyonları tam semantik predikata güncellenir:

```
durum = 'aktif'
AND baslangic <= now()
AND (bitis IS NULL OR bitis > now())
AND <hedef eşleşmesi (mevcut: herkes/segment/ofis/danisman)>
AND <kapsam eşleşmesi — tek ortak helper, bkz. Bölüm 5>
```

Sonuç: askıya alınan (askida) veya silmeden kapatılan (kaldirildi) veya ileri tarihli (baslangic>now) veya süresi geçmiş tahsis emlakçıya **anında** görünmez olur. `durum` görünürlüğün birinci anahtarı olur.

**GÜVENLİK INVARIANTI (canlı DB'den doğrulandı 2026-08-12):** Bu iki fonksiyonun MEVCUT görünürlük semantiği korunur, lifecycle refactor onu DEĞİŞTİREMEZ; yalnız yeni lifecycle predikatı (`durum='aktif' AND baslangic<=now()`) EKLER. Korunacak mevcut mantık:
- `demo` proje bypass (demo proje herkese açık),
- `belge_durumu='dogrulandi'` gate (yalnız doğrulanmış emlakçı görür),
- segment filtre (`current_marka/il/ilce/uzmanlik` ↔ `hedef_filtre`),
- hedef eşleşmesi (herkes/danisman/ofis),
- `birimler` dahil kapsam eşleşmesi.
- **Canlı `birim` policy 6-arg overload'ı çağırır** (`emlakci_birim_gorebilir(id, proje_id, blok_id, tip_id, kat, tur::text)`); 5-arg overload ölü. Refactor 6-arg'ı günceller, policy imzası değişmez.
Kural: "Lifecycle refactor mevcut visibility semantics'i değiştiremez; yalnız lifecycle predicate ekler." Test bunu SELECT-seviyesi RLS ile (function çağrısı DEĞİL) kanıtlar.

## 3. Event modeli (ayrım net — karıştırılmaz)

- **Tahsis audit** → `events tip='tahsis'`, uygulama yazar. `payload = { aksiyon: 'olustur'|'guncelle'|'askiya_al'|'devam'|'kaldir', eski:{...}, yeni:{...} }`. Yaşam döngüsü kayıt izi.
- **Stok olayları** (dokunulmaz, mevcut):
  - `tip='fiyat'` → **DB trigger `birim_fiyat_log`** (`birim.liste_fiyati` değişince, append-only). Uygulama yazmaz. Kaynak: `src/lib/events.ts:12`, `FiyatTrend.tsx`, `raporlar/page.tsx:105`.
  - `tip='opsiyon'`, `tip='satis'` → mevcut uygulama event'leri.

**"Fiyat değişti" bir stok olayıdır, tahsis audit'i değildir.** Değişiklik rozeti yalnız stok olaylarından (`fiyat`/`opsiyon`/`satis`) okunur; tahsis audit'inden değil.

## 4. Server actions (`src/app/uretici/actions.ts`)

- `tahsisGuncelle(formData)` — **edit-in-place**, tüm alanlar dahil **hedef**:
  - Düzenlenebilir: hedef (hedef_tip / hedef_id / hedef_filtre), kapsam, komisyon (tip/deger), münhasır, kontenjan, fiyat_gorunur, süre (bitiş).
  - Bir tahsis satırı = tek atomik alıcı (fan-out yalnız create anında), bu yüzden hedef değişimi yeni satır gerektirmez. Audit `eski/yeni` payload ile tutulur.
  - `updated_at=now()`, `updated_by=auth.uid()` yazar + `tip='tahsis'` audit event'i (`aksiyon:'guncelle'`).
- `tahsisDurumGuncelle(formData)` — durum geçişleri: `aktif↔askida`, `→kaldirildi`. **Kullanıcıya görünen "Kaldır" = soft** (durum='kaldirildi'), hard delete değil. `updated_at/by` + audit event.
- `tahsisTopluAksiyon(formData)` — seçili tahsis id'leri: askıya al / devam / süre uzat / kaldır. Her kayıt için `updated_at/by` + audit event.
- `tahsisSil(formData)` (hard delete) — normal UI akışından **çıkarılır**; yalnız administrative cleanup / veri bütünlüğü istisnası için kalır.

Yetki: hepsi `createClient()` (kullanıcı oturumu) ile → `tahsis_owner` RLS policy (for all) proje sahibi üreticiyi zaten kısıtlar.

## 5. RPC'ler ve ortak kapsam predikatı (kritik)

Tek SQL helper — üç tüketici de aynı mantığı kullanır (drift kalkanı):

```sql
create or replace function birim_kapsaminda(
  p_blok_id uuid, p_tip_id uuid, p_kat int, p_tur text, p_birim_id uuid, p_kapsam jsonb
) returns boolean language sql immutable ...
```

- `emlakci_birim_gorebilir` (RLS) — inline kapsam mantığını **bu helper'a çevirir** (artık kopya yok).
- `tahsis_ozet(p_proje_id)` — tahsis-merkezli: her tahsis + kapsamındaki stok sayacı (müsait / opsiyonlu / satıldı) + referanstan (`updated_at ?? baslangic`) beri değişiklik sayısı (fiyat/opsiyon/satış).
- `stok_dagitim(p_proje_id)` — stok-merkezli ters indeks: her birim → onu satabilen **aktif** (durum='aktif' + tarih) tahsis/hedef listesi + şart.

Amaç ikincil (performans): `tasks.md`'deki `O(proje×birim)` client-join borcunu SQL'e taşır. Amaç birincil: **görünürlük mantığı üç yerde kopyalanmaz** → "UI'da satabilir görünüyor ama RLS göstermiyor" sınıfı bug engellenir.

## 6. Control Center UI (`/uretici/tahsis`) — tek yönetim otoritesi

- **KPI şeridi** (genişletilir): Aktif Tahsis · Dağıtımda · Münhasır · **Askıda** · **Süresi dolacak** · Kapsam Dışı.
- **Perspektif toggle:** `Tahsis-merkezli ↔ Stok-merkezli` (aynı dağıtım grafiğinin iki yönü).
- **Tahsis mercek:** proje-gruplu tablo + durum rozeti (aktif / askıda / süresi-dolacak / kaldırıldı) + stok sayaç & değişiklik rozeti (ör. `42 müsait · 3 opsiyonlu · 5 satıldı` + gerekirse `↑2 opsiyon · 1 fiyat değişti`) + yaşam döngüsü aksiyonları (Düzenle / Askıya al / Devam / Kaldır) + "son yönetim: 2g önce, sen" (`updated_at/by`) + checkbox → **toplu aksiyon barı**.
- **Stok mercek:** proje → blok → daire drilldown; her birim: durum (müsait/opsiyonlu/satıldı) + **"kim satabiliyor" + hangi şart** + inline erişim değiştir (o birimi kapsayan tahsise git veya yeni tahsis).
- **Süresi-dolacak:** `bitis` yakın → amber + "uzat" quick action (window UI seviyesinde, kod sabiti; iş kuralı değil).
- **Değişiklik rozeti referansı:** `tahsis.updated_at ?? baslangic`. UI'da açıkça etiketli ("son yönetimden beri"). **Hardcoded 7-gün yok.**
  - **SEMANTİK (dikkat):** bu rozet **acknowledgement / "okunmamış değişiklik" DEĞİL**, **lifecycle-relative change indicator**'dır: "bu tahsisi en son yönettiğimden beri kapsamında stok hareketi oldu mu". Kullanıcının değişiklikleri *gördüğünü* göstermez (ör. 09:00 fiyat değişir, 10:00 kullanıcı komisyonu düzenler → `updated_at` 10:00 olur, 09:00 değişimi rozetten düşer; bu bilinçli). Gerçek "görülmemiş değişiklik" istenirse ayrı `last_seen_at` tracking gerekir → sonraki faz.
- **`?proje=<id>`** query param → o projeye filtrelenmiş açılır (proje/[id]'den deep-link).
- **Düzenle:** mevcut `TahsisForm` edit moduna genişler (prefill + `tahsisGuncelle`); hedef seçici de prefill edilir.

## 7. proje/[id] downgrade (context shortcut)

`src/app/uretici/proje/[id]/page.tsx` içindeki TAHSİS section + inline `TahsisForm` + `tahsisSil` **kaldırılır**, yerine salt-okunur özet:

> **Dağıtım** · `N ofis · M danışman · X/Y birim dağıtımda` · **Tahsisleri Yönet →** (`/uretici/tahsis?proje=<id>`)

Sayılar `tahsis_ozet` / `stok_dagitim` RPC'sinden. Böylece proje/[id] operasyon ekranına dönmez; Control Center tek otorite kalır, proje sayfası yalnız bağlamsal giriş noktası.

## 8. Kabul kriterleri

- Tahsis düzenle (hedef dahil) → emlakçı görünürlüğü anında değişir; eski/yeni `events tip='tahsis'`'e yazılır.
- Askıya al → emlakçıda anında kaybolur, üreticide "askıda" durur; devam → geri gelir.
- Toplu: 3 tahsis seç → askıya al → 3'ü askıda + 3 audit event.
- Stok mercek: bir daire seç → onu satabilen tüm aktif hedef + şart görünür; bu liste RLS ile **birebir tutarlı** (aynı `birim_kapsaminda` helper).
- proje/[id] artık tahsis düzenlemez (özet + filtreli link).
- Hard delete normal UI'da yok.
- RLS testi: askida / kaldirildi / süresi-geçmiş / ileri-tarihli tahsis emlakçı SELECT'inde **sızmaz**.
- Değişiklik rozeti referansı UI'da etiketli; referans = `updated_at ?? baslangic`.
- `updated_at` mevcut satırlarda NULL (backfill yok).

## 8b. Invariantlar (uygulamada test ile kilitlenir)

Kullanıcı review'ı (2026-08-12) ile eklenen üç değişmez:

1. **`kaldirildi` terminal state.** `aktif ↔ askida` çift yönlü; ama `kaldirildi → aktif` normal UI'dan **yapılamaz**. Yanlış kaldırmada çözüm = yeniden tahsis oluştur. Aksi halde "kaldırma" ile "askıya alma" arasındaki semantik fark erir. Test ile açıkça kilitlenir (durum geçiş matrisi: aktif→askida, askida→aktif, aktif→kaldirildi, askida→kaldirildi; kaldirildi→* yasak).
2. **Toplu lifecycle atomik.** Bulk askıya al/devam/uzat/kaldır **application loop DEĞİL, tek DB transaction/RPC**: N tahsis + N audit event ya birlikte başarılı ya hiçbiri. İkinci kayıtta hata → yarım işlem olmamalı (ileride 100'lük bulk'ta kritik).
3. **`updated_at` yalnız tahsis-yönetim aksiyonunda değişir.** Stok fiyat değişimi / birim opsiyonlanması-satılması / sistemsel update `tahsis.updated_at`'ı **tetiklemez**. Tahsis tablosuna generic "updated_at=now()" trigger'ı KONMAZ; alan yalnız `tahsisGuncelle` / `tahsisDurumGuncelle` / `tahsisTopluAksiyon` içinde set edilir. Aksi halde "son yönetimden beri" değişiklik penceresi kendini sıfırlar.
4. **Audit gerçekten değişen satırdan üretilir.** Toplu aksiyon audit'i `UPDATE ... RETURNING` / CTE ile YALNIZ gerçekten değişen satırlardan yazılır (input'ta olup zaten hedef durumda olan satır event ÜRETMEZ). Payload `eski`/`yeni` değerleri taşır (`uzat` için eski/yeni `bitis` dahil). "Update sonrası tabloyu yeniden okuyup eşleşenleri event'le" deseni YASAK (yanlış satır + eski değer kaybı).
5. **`created_by` CREATE'te doldurulur.** `tahsisEkle` yeni kayıtlara `created_by=auth.uid()` yazar (mevcut kayıtlar NULL kalır, doğru).

## 9. Kapsam DIŞI (bu spec)

- Funnel / performans analitiği (tahsis → erişen emlakçı → paylaşım → opsiyon → satış zinciri). Yalnız veri hook'u bırakılır (events zaten var), ekran yapılmaz.
- Birim-bazlı activity feed (2. Q3 seçeneği reddedildi; activity feed ertelenen analitiğe kayar).
- "Kampanya" kavramı (tahsiste yok; dalga/lansman ayrı sistem).
- "Son görüntülemeye göre" değişiklik penceresi (ayrı last-view tracking gerektirir).
- WhatsApp / AI katmanları.

## 10. Deploy

- Migration → browser Supabase Dashboard SQL Editor (CLAUDE.md kuralı; hazır kopyalanır blok verilecek).
- `type-check` şart (ignoreBuildErrors yok).
- Direkt main (branch ceremony yok).

## Uygulama sırası (writing-plans için)

migration → **DB/RLS testleri (UI'dan ÖNCE)** → server actions → Control Center tahsis merceği → stok merceği → proje/[id] shortcut → E2E/kabul testleri.

Gerekçe: bu özelliğin güvenlik + doğruluk çekirdeği arayüz değil, "kim hangi birimi gerçekten görebiliyor?" sorusunun DB seviyesindeki cevabı (`birim_kapsaminda` + görünürlük predikatı). Bu yüzden görünürlük ve durum-geçiş testleri UI kodundan önce yazılır/geçirilir.

## Dokunulan dosyalar (öngörü)

- `db/2026-08-12_tahsis-yasam-dongusu.sql` (enum + kolonlar + RLS güncelleme + `birim_kapsaminda` helper + `tahsis_ozet` + `stok_dagitim`)
- `src/app/uretici/actions.ts` (tahsisGuncelle, tahsisDurumGuncelle, tahsisTopluAksiyon; tahsisSil demote)
- `src/app/uretici/tahsis/page.tsx` (Control Center yeniden yazımı; iki mercek; `?proje=` filtre)
- yeni bileşenler: perspektif toggle, stok mercek, toplu aksiyon barı, tahsis düzenle formu (veya `TahsisForm` edit modu)
- `src/lib/tahsis.ts` (RPC fetch yardımcıları gerekiyorsa)
- `src/app/uretici/proje/[id]/page.tsx` (tahsis section → özet + link)
