# Spec: Admin "Başvurular" birleşik başvuru dosyası

Tarih: 2026-08-04 · Durum: onaylandı (tasarım + mockup) · Sonraki: implementasyon planı

## 1. Amaç
Admin panelinde kayıt/onay ve KYC belge doğrulama süreçlerini tek "Başvurular" çalışma alanında birleştirmek; onaylayan admin'in başvuranın **her ayrıntısını** (kayıtta toplanan `profil_detay` + yüklenen belgeler + AI ön-tarama + iz) aynı yerde görüp karar verebilmesi. Düz liste değil: liste + kayan detay paneli (drawer).

Kaynak karar (kullanıcı, AskUserQuestion 2026-08-04): kapsam = kayıt/onay çekirdeği derin + diğer ekranlar cila; onay + belge doğrulama birleşsin; görünüm = liste + drawer. Mockup onaylandı: `tasarimlar/v2-admin-basvurular.html`.

## 2. Bugünkü durum ve kapanacak boşluklar (koddan doğrulandı)
- `src/app/admin/onay/page.tsx` yalnız `profiles(id,ad,telefon,talep_rol,kayit_meta,created_at)` okur; `kayit_meta.vergi_no`/`ofis_adi` gösterir. **`profil_detay` hiç okunmuyor.**
- `src/app/admin/dogrulama/page.tsx` `kullanici_belge(id,profile_id,tip,url,created_at)` okur; imzalı URL üretir. **`ai_sonuc` gösterilmiyor.**
- İki ekran ayrı eksen: onaylayan admin başvuranın belgelerini/detayını aynı yerde göremiyor.
- `src/lib/kayitAlanlar.ts` → `PROFIL_ALANLARI` rol başına alan+etiket tanımı (tek kaynak); dosyada etiketleri yeniden kullanacağız.

## 3. DEĞİŞMEZLER uyumu
- **RLS-önce / client'ta service-role YOK (#1):** dosya (detay) Server Component'te render; `createAdminClient()` (service-role) yalnız sunucuda KYC belge + storage signed URL + events için. Client'a yalnız render edilmiş HTML gider.
- **Denetim:** her karar mevcut `kayitYaz()` ile `events`'e (zaten action'larda var).
- **Tazelik görünür (#5):** başvuru satırlarında "X önce" damgası.
- **Mobil-önce (#6):** iki-pane masaüstü; mobilde satıra dokununca drawer tam ekran, geri ile kapanır.
- **KVKK-yalın:** TCKN dosyada **maskeli** gösterilir (ör. `387••••••14`). Doğrulanabilir belge no'lar (MYS/YAMBİS/TTBS) tam gösterilir + kamu doğrulama kısayolu.
- Şema değişikliği **YOK** (tüm veri mevcut).

## 4. Mimari

### 4.1 Rota + navigasyon
- **Yeni:** `/admin/basvurular` (tek sayfa, iki-pane).
- **AdminNav:** "Onay Kuyruğu" + "Belge Doğrulama" → tek **"Başvurular"** girişi. Badge = işlem bekleyen sayısı; mockup'taki gibi iki mini-sayaç (hesap onayı / belge doğrulama) başlıkta gösterilir.
- **Eski rotalar:** `/admin/onay` ve `/admin/dogrulama` → `redirect('/admin/basvurular')`.
- **Dashboard** (`src/app/admin/page.tsx`) içindeki `/admin/onay` deep-link'leri → `/admin/basvurular`. Hızlı onay kuyruğu tablosu kalır; "detay →" ile dosyaya bağlanır.

### 4.2 Sol pane: kuyruk (client component)
- Prop olarak başvuru listesi + ofis listesi alır (server'dan).
- Liste sorgusu (server, admin RLS): `profiles` where `durum='onay_bekliyor'` **VEYA** `belge_durumu='beklemede'`; select `id, ad, telefon, talep_rol, il, ilce, durum, belge_durumu, created_at`; `order created_at desc`.
- Satır: avatar · ad · talep_rol pill · il/ilçe · "X önce" · **iki durum çipi** (hesap + belge) · sol kenar aciliyet sinyali.
- Filtre (client): durum · talep_rol · belge durumu · arama (ad/telefon/VKN). Canlı sayaç.
- Seçim: satır = `?b=<id>` (Link, `scroll={false}`); aktif satır vurgulanır.

### 4.3 Sağ pane: başvuru dosyası (server-render, `searchParams.b`)
`b` yoksa boş-durum ("Bir başvuru seç"). `b` varsa tek başvuranın dosyası:
1. **Başlık:** avatar, ad, telefon, talep_rol, kayıt zamanı, davet_eden (`kayit_meta.davet_eden`); hesap + belge durum rozetleri.
2. **Kimlik & Yetki:** `profil_detay` içindeki alanlar `PROFIL_ALANLARI[rol]` etiketleriyle (tek kaynak) key/value grid. Doğrulanabilir belge no (emlakçı `mys_belge_no` / üretici `yetki_belge_no` / ofis `tasinmaz_yetki_belge_no`) vurgulu kutu + "MYK/YAMBİS/TTBS'de doğrula" dış link (statik hedef; otomasyon değil). TCKN maskeli.
3. **KYC Belgeleri** (belge varsa): `kullanici_belge` (service-role) satırları: tip adı + imzalı "Görüntüle" + **AI ön-tarama** (`ai_sonuc`: `gecerli`/`skor`/`ozet` → yeşil "geçerli" / amber "dikkat" rozeti + özet).
4. **Başvuru izi:** bu `profile_id`'nin son `events` kayıtları (service-role) mini timeline.
5. **Karar paneli (sabit alt):** Rol select (5 rol: uretici, emlakci, ofis_yetkili, marka_yetkili, arsa_sahibi) + Ofis select → **Onayla** / **Reddet**; belge beklemede ise **Belge Doğrula** / **Belge Reddet**. Mevcut action'lar kullanılır.

### 4.4 Server actions (mevcut, yeniden kullanım)
- `kullaniciOnayla(formData)` — rol+ofis_id ata, `durum='aktif'`, onaylayan/onay_tarihi, event. Redirect hedefi → `/admin/basvurular`.
- `kullaniciReddet(formData)` — `durum='pasif'`, event. Redirect → `/admin/basvurular`.
- `belgeKarar(formData)` — `kullanici_belge.durum` + `profiles.belge_durumu` = `dogrulandi|red`, event. Redirect → `/admin/basvurular`.
- (Gerekirse) tek başvuru dosyasını çeken server helper; ya da doğrudan `page.tsx` içinde inline fetch.

## 5. Kapsam sınırı (YAGNI)
**Dahil:** yukarıdaki Başvurular alanı + nav + eski rota redirect + dashboard deep-link düzeltme.
**Hariç (bu iş değil):** `kullanicilar / ureticiler / ofisler / uyelik / denetim` yeniden yazımı (cila = yalnız token tutarlılığı, gerekirse); şema değişikliği; **AI oto-doğrulama üretimi** (`ai_sonuc` yalnız GÖSTERİLİR; üretimi roadmap KYC-gate/Faz-2); WhatsApp/mail hatırlatma otomasyonu (Faz-2).

## 6. Kabul kriterleri
1. `/admin/basvurular`: sol kuyruk + sağ dosya çalışır; bir başvuru seçilince tüm veri (profil_detay + KYC + ai_sonuc + iz) görünür.
2. Onayla → hesap aktif + rol/ofis atanır + event yazılır; kuyruk günceller.
3. Reddet → pasif + event.
4. Belge Doğrula/Reddet → `belge_durumu` + `kullanici_belge.durum` güncellenir + event.
5. `grep -r "service" ...` ile service-role client'a sızmaz; detay yalnız server'da fetch edilir.
6. `/admin/onay` ve `/admin/dogrulama` → `/admin/basvurular` redirect; nav tek "Başvurular" + doğru badge.
7. Mobilde drawer düzgün açılır/kapanır; boş-durum ve "servis anahtarı yok" hâli graceful.
8. `npm run lint` temiz; `type-check:changed` geçer.

## 7. Açık uçlar
- Yok (TCKN maskeli kararı kilitlendi). Uygulama sırasında `events` tablosunda tek-profil sorgusunun mevcut kolon adlarıyla (`profile_id`) uyumu doğrulanacak.
