-- 2026-08-09 — Hakediş defteri: müteahhit↔emlakçı kazanılan-vs-ödenen takibi.
-- DEĞİŞMEZ: Platform satış komisyonundan PAY ALMAZ. Bu tablo yalnız müteahhit ile
--   danışman ARASINDAKİ hakediş ödemesinin TAKİBİDİR (mutabakat defteri); Projedar
--   taraf değildir, tahsilat yapmaz. Kazanç tutarı satılan birimin satıcı tahsisinden
--   (komisyon_tip/komisyon_deger) hesaplanır — ham oran client'a çıkmaz, snapshot TL tutar.
-- Browser SQL Editor'den uygula (MCP/terminal çalışmıyor). Kod migration olmadan graceful:
--   tablo/rpc yoksa hakediş ekranları boş/kapalı görünür, panel çalışır.

-- ============================================================
-- 1) Hakediş ödeme kaydı — birim başına tek (satış = tek hakediş)
-- ============================================================
create table if not exists hakedis (
  id          uuid primary key default gen_random_uuid(),
  birim_id    uuid not null references birim(id) on delete cascade,
  proje_id    uuid not null references proje(id) on delete cascade,
  uretici_id  uuid not null references uretici(id) on delete cascade,  -- ödeyen taraf (proje sahibi firma)
  emlakci_id  uuid not null references profiles(id),                    -- kazanan taraf (satışı yapan danışman)
  tutar       numeric,                                                  -- kazanç snapshot (TL); null=gizli/hesaplanamaz
  para_birimi text default 'TRY',
  durum       text not null default 'bekliyor' check (durum in ('bekliyor','odendi')),
  odenen_at   timestamptz,
  aciklama    text,
  created_at  timestamptz default now(),
  unique (birim_id)
);

alter table hakedis enable row level security;

-- Üretici kendi projesinin hakedişlerini görür + yönetir (ödeme işaretler)
drop policy if exists hakedis_uretici_all on hakedis;
create policy hakedis_uretici_all on hakedis for all
  using (
    exists (
      select 1 from proje p join uretici u on u.id = p.uretici_id
      where p.id = hakedis.proje_id and u.sahip_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from proje p join uretici u on u.id = p.uretici_id
      where p.id = hakedis.proje_id and u.sahip_id = auth.uid()
    )
  );

-- Emlakçı yalnız kendi hakedişini GÖRÜR (yazamaz — ödemeyi müteahhit işaretler)
drop policy if exists hakedis_emlakci_select on hakedis;
create policy hakedis_emlakci_select on hakedis for select
  using (emlakci_id = auth.uid());

-- Admin denetim
drop policy if exists hakedis_admin_all on hakedis;
create policy hakedis_admin_all on hakedis for all using (is_admin()) with check (is_admin());

-- ============================================================
-- 2) Satıcı-parametreli birim kazancı (emlakci_birim_kazanci'nin tek-birim + p_satici versiyonu)
--    Müteahhit hakediş defterinde satıcının kazancını, emlakçı kendi hakedişini hesaplar.
--    Yetki guard: yalnız birimin projesinin üreticisi VEYA p_satici=auth.uid() sonuç alır.
--    current_*() auth.uid()'e bağlı olduğundan burada profil alanları p_satici için okunur.
-- ============================================================
create or replace function birim_satici_kazanci(p_birim_id uuid, p_satici uuid)
returns numeric
language sql stable security definer set search_path = public as $$
  select case
    when t.fiyat_gorunur and t.komisyon_tip = 'yuzde' and t.komisyon_deger is not null and b.liste_fiyati is not null
      then round(b.liste_fiyati * t.komisyon_deger / 100)
    when t.fiyat_gorunur and t.komisyon_tip = 'sabit' and t.komisyon_deger is not null
      then t.komisyon_deger
    else null
  end
  from birim b
  join tahsis t on t.proje_id = b.proje_id
  where b.id = p_birim_id
    -- yetki: emlakçı kendi kazancı VEYA projenin üreticisi
    and (
      p_satici = auth.uid()
      or exists (
        select 1 from proje pp join uretici uu on uu.id = pp.uretici_id
        where pp.id = b.proje_id and uu.sahip_id = auth.uid()
      )
    )
    and (t.bitis is null or t.bitis > now())
    and (
      (t.hedef_tip = 'herkes'
        and (t.hedef_filtre->>'marka'    is null or (select marka    from profiles where id = p_satici) = t.hedef_filtre->>'marka')
        and (t.hedef_filtre->>'il'       is null or (select il       from profiles where id = p_satici) = t.hedef_filtre->>'il')
        and (t.hedef_filtre->>'ilce'     is null or (select ilce     from profiles where id = p_satici) = t.hedef_filtre->>'ilce')
        and (t.hedef_filtre->>'uzmanlik' is null or (select uzmanlik from profiles where id = p_satici) = t.hedef_filtre->>'uzmanlik'))
      or (t.hedef_tip = 'danisman' and t.hedef_id = p_satici)
      or (t.hedef_tip = 'ofis' and t.hedef_id = (select ofis_id from profiles where id = p_satici))
    )
    and (coalesce(jsonb_array_length(t.kapsam->'bloklar'),0) = 0 or b.blok_id::text in (select jsonb_array_elements_text(t.kapsam->'bloklar')))
    and (coalesce(jsonb_array_length(t.kapsam->'tipler'),0)  = 0 or b.tip_id::text  in (select jsonb_array_elements_text(t.kapsam->'tipler')))
    and (coalesce(jsonb_array_length(t.kapsam->'katlar'),0)  = 0 or b.kat::text     in (select jsonb_array_elements_text(t.kapsam->'katlar')))
    and (coalesce(jsonb_array_length(t.kapsam->'turler'),0)  = 0 or b.tur::text     in (select jsonb_array_elements_text(t.kapsam->'turler')))
    and (coalesce(jsonb_array_length(t.kapsam->'birimler'),0) = 0 or b.id::text     in (select jsonb_array_elements_text(t.kapsam->'birimler')))
  order by (case t.hedef_tip when 'danisman' then 0 when 'ofis' then 1 else 2 end), t.baslangic desc
  limit 1;
$$;

grant execute on function birim_satici_kazanci(uuid, uuid) to authenticated;
