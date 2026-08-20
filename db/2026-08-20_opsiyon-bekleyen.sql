-- 2026-08-20 — T13: "opsiyon düşerse haber ver". Başka danışmanın opsiyonundaki daireyi
-- takip → opsiyon serbest kalınca (expiry) takipçilere in-app bildirim + takip silinir.
-- opsiyon_serbest_birak (INV-CRON-001/002) idempotent delete-returning yapısı KORUNUR;
-- bildirim + takip-sil yalnız EK data-modifying CTE'ler (release/label mantığı değişmez).
-- create table/replace → idempotent. Management API'den uygulanır.

create table if not exists opsiyon_bekleyen (
  emlakci_id uuid not null references profiles(id) on delete cascade,
  birim_id   uuid not null references birim(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (emlakci_id, birim_id)
);

alter table opsiyon_bekleyen enable row level security;

drop policy if exists opsiyon_bekleyen_self on opsiyon_bekleyen;
create policy opsiyon_bekleyen_self on opsiyon_bekleyen for all
  using (emlakci_id = auth.uid())
  with check (emlakci_id = auth.uid());

-- opsiyon_serbest_birak: expiry sonrası serbest kalan birimlerin takipçilerine bildir + takibi sil.
create or replace function opsiyon_serbest_birak()
returns int language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  with del as (
    delete from opsiyon o
    where o.durum = 'opsiyonlu'
      and ( o.kilit_bitis < now() or (o.dogrulandi = false and o.dogrulama_bitis < now()) )
    returning o.id, o.satici_id, o.birim_id, o.dogrulandi
  ), ev as (
    insert into events (tip, profile_id, proje_id, birim_id, payload)
    select 'opsiyon', d.satici_id, b.proje_id, d.birim_id,
      jsonb_build_object('eylem', case when d.dogrulandi = false
                                       then 'dogrulama_sure_doldu' else 'sure_doldu' end)
    from del d join birim b on b.id = d.birim_id
  ), bekleyen_bildir as (
    -- T13: serbest kalan birimi takip eden danışmanlara bildir (opsiyonu düşen satıcı hariç)
    insert into bildirim (profile_id, tip, baslik, govde, link)
    select ob.emlakci_id, 'opsiyon', 'Beklediğin daire müsait oldu',
      'Takip ettiğin bir daire opsiyonu düştü, yeniden müsait. Havuzdan opsiyonlayabilirsin.',
      '/danisman/proje/' || b.proje_id
    from del d
    join opsiyon_bekleyen ob on ob.birim_id = d.birim_id and ob.emlakci_id is distinct from d.satici_id
    join birim b on b.id = d.birim_id
  ), bekleyen_sil as (
    -- takip tek seferlik: bildirim gidince (veya satıcının kendi takibi) temizlenir
    delete from opsiyon_bekleyen ob using del d where ob.birim_id = d.birim_id
  )
  select count(*) into v_count from del;
  return v_count;
end $$;

grant execute on function opsiyon_serbest_birak() to service_role;
