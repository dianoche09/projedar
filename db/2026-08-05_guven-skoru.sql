-- 2026-08-05 — İki taraflı güven skoru (karşılıklı görünür): emlakçı + müteahhit
-- Reputation = güven protokolü moat'ı. Hesaplama events (kalıcı iz) + opsiyon_talep + birim tazeliğinden.
-- SECURITY DEFINER: skor karşı tarafa görünür bir itibar sinyali (emlakçı↔müteahhit + admin). Canlıda uygulandı.

-- ── emlakçı: dönüşüm vs israf (boş-opsiyon disiplini) ──
-- baslatilan (gecici/dogrudan/talep), satis (satisa_donustu), vazgecme (vazgecildi/iptal),
-- dusme (sure_doldu/dogrulama_sure_doldu). Skor = 100*(satis + 0.5*vazgecme)/sonuclanan. <3 sonuç → null (Yeni).
create or replace function emlakci_skor(p_profil uuid)
returns jsonb language sql stable security definer set search_path=public as $$
  with agg as (
    select
      count(*) filter (where payload->>'eylem' in ('gecici','dogrudan','talep')) as baslatilan,
      count(*) filter (where payload->>'eylem' = 'satisa_donustu') as satis,
      count(*) filter (where payload->>'eylem' in ('vazgecildi','iptal')) as vazgecme,
      count(*) filter (where payload->>'eylem' in ('sure_doldu','dogrulama_sure_doldu')) as dusme
    from events where tip='opsiyon' and profile_id = p_profil
  )
  select jsonb_build_object(
    'baslatilan', baslatilan, 'satis', satis, 'vazgecme', vazgecme, 'dusme', dusme,
    'sonuclanan', satis+vazgecme+dusme,
    'skor', case when (satis+vazgecme+dusme) < 3 then null
      else round(100.0 * (satis + 0.5*vazgecme) / (satis+vazgecme+dusme)) end
  ) from agg
$$;
grant execute on function emlakci_skor(uuid) to authenticated;

-- ── müteahhit: yanıt oranı(30) + SLA-içi(25) + doğrulama sorumluluğu(25) + stok tazeliği(20) ──
-- Ağırlıklı ortalama (yalnız veri olan bileşenler). (talep + gecici) < 3 → null (Yeni müteahhit).
create or replace function muteahhit_skor(p_uretici uuid)
returns jsonb language sql stable security definer set search_path=public as $$
  with pr as (select id from proje where uretici_id = p_uretici),
  t as (
    select t.created_at, t.karar_at, t.durum,
      coalesce((p.opsiyon_ayar->>'yanit_sla_saat')::int,48) as sla
    from opsiyon_talep t join birim b on b.id=t.birim_id join proje p on p.id=b.proje_id
    where p.uretici_id = p_uretici
  ),
  ta as (
    select count(*) ttop,
      count(*) filter (where durum<>'beklemede') yanit,
      count(*) filter (where karar_at is not null and karar_at <= created_at + (sla||' hours')::interval) sla_ici
    from t
  ),
  ge as (
    select count(*) filter (where payload->>'eylem'='gecici') baslatilan,
      count(*) filter (where payload->>'eylem'='dogrulandi') dogrulandi,
      count(*) filter (where payload->>'eylem'='dogrulama_sure_doldu') dusen
    from events where tip='opsiyon' and proje_id in (select id from pr)
  ),
  tz as (
    select count(*) filter (where son_guncelleme > now()-interval '15 days')::numeric tazel, count(*)::numeric tum
    from birim where proje_id in (select id from pr) and satilabilir=true
  ),
  c as (
    select
      case when ta.ttop>0 then ta.yanit::numeric/ta.ttop end as c_yanit,
      case when ta.yanit>0 then ta.sla_ici::numeric/ta.yanit end as c_sla,
      case when (ge.dogrulandi + ge.dusen) > 0 then ge.dogrulandi::numeric/(ge.dogrulandi + ge.dusen) end as c_dogr,
      case when tz.tum>0 then tz.tazel/tz.tum end as c_tazelik,
      ta.ttop as talep_sayisi, ge.baslatilan as gecici_sayisi
    from ta, ge, tz
  )
  select jsonb_build_object(
    'skor', case when (talep_sayisi + gecici_sayisi) >= 3 and agirlik>0 then round(100.0*puan/agirlik) end,
    'yanit_oran', round(coalesce(c_yanit,0)*100), 'sla_oran', round(coalesce(c_sla,0)*100),
    'dogrulama_oran', round(coalesce(c_dogr,0)*100), 'tazelik_oran', round(coalesce(c_tazelik,0)*100),
    'talep_sayisi', talep_sayisi, 'gecici_sayisi', gecici_sayisi
  ) from (
    select c_yanit, c_sla, c_dogr, c_tazelik, talep_sayisi, gecici_sayisi,
      coalesce(c_yanit*30,0)+coalesce(c_sla*25,0)+coalesce(c_dogr*25,0)+coalesce(c_tazelik*20,0) as puan,
      (case when c_yanit is not null then 30 else 0 end)+(case when c_sla is not null then 25 else 0 end)+
      (case when c_dogr is not null then 25 else 0 end)+(case when c_tazelik is not null then 20 else 0 end) as agirlik
    from c
  ) x
$$;
grant execute on function muteahhit_skor(uuid) to authenticated;

-- ── Admin komuta tablosu: tüm emlakçı / müteahhit skorları tek sorguda (scalar fonksiyonları yeniden kullanır) ──
create or replace function emlakci_skor_tablo()
returns table(profil_id uuid, ad text, ofis_id uuid, skor int, detay jsonb)
language sql stable security definer set search_path=public as $$
  select p.id, p.ad, p.ofis_id, (e->>'skor')::int, e
  from profiles p cross join lateral (select emlakci_skor(p.id) as e) x
  where p.rol='emlakci'
$$;
grant execute on function emlakci_skor_tablo() to authenticated;

create or replace function muteahhit_skor_tablo()
returns table(uretici_id uuid, ad text, skor int, detay jsonb)
language sql stable security definer set search_path=public as $$
  select u.id, u.ad, (m->>'skor')::int, m
  from uretici u cross join lateral (select muteahhit_skor(u.id) as m) x
$$;
grant execute on function muteahhit_skor_tablo() to authenticated;
