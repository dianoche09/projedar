-- 2026-08-04 — Opsiyon HİBRİT: müteahhit-kontrollü anlık kilit (proje.opsiyon_yontemi='dogrudan')
-- 'dogrudan' → emlakçı anında opsiyon alır (bu RPC). 'talep_kod' → mevcut talep→onay akışı.
-- DEĞİŞMEZ #3 korunur: opsiyon_tek_aktif unique index eş-zamanlı ikinci alanı reddeder.
-- Canlıda Management API/token ile uygulandı.

create or replace function opsiyon_al_dogrudan(p_birim uuid, p_gun int default 3)
  returns uuid language plpgsql security definer set search_path = public as $$
declare v_ops uuid; v_proje uuid; v_yontem text;
begin
  -- müsait + satılabilir + emlakçının GÖREBİLDİĞİ (tahsisli) birim
  select b.proje_id into v_proje from birim b
    where b.id = p_birim and b.durum = 'musait' and b.satilabilir = true
      and emlakci_birim_gorebilir(b.id, b.proje_id, b.blok_id, b.tip_id, b.kat, b.tur::text);
  if v_proje is null then raise exception 'Daire musait/tahsisli degil'; end if;
  -- proje yöntemi 'dogrudan' değilse anlık opsiyon kapalı
  select opsiyon_yontemi::text into v_yontem from proje where id = v_proje;
  if v_yontem is distinct from 'dogrudan' then raise exception 'Bu projede anlik opsiyon kapali'; end if;
  -- kilit (unique index çift-satışı engeller)
  insert into opsiyon (birim_id, satici_id, yontem, durum, kilit_bitis)
    values (p_birim, auth.uid(), 'dogrudan', 'opsiyonlu', now() + (p_gun || ' days')::interval)
    returning id into v_ops;
  return v_ops;
end $$;
grant execute on function opsiyon_al_dogrudan(uuid, int) to authenticated;
