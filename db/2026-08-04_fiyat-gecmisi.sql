-- Fiyat geçmişi — birim.liste_fiyati her değiştiğinde events'e tip='fiyat' kaydı.
--
-- NEDEN trigger (uygulama katmanı değil): fiyat 3+ yoldan güncellenir (tekil düzenle,
-- fiyat aksiyonu, toplu içe aktarma). DEĞİŞMEZ "uygulama katmanına güvenme" (opsiyon/
-- çift-satış ile aynı disiplin). Trigger tüm yolları yakalar. Append-only log; tek doğru
-- kaynağı (birim.liste_fiyati) bozmaz, ona rakip ikinci kaynak değildir.
--
-- SECURITY DEFINER: events INSERT politikası yok (yazma server-side) → definer RLS bypass.
-- auth.uid(): app kaynaklı değişimde değiştiren; cron/service-role'da null.
-- Yalnız gerçek DEĞİŞİM loglanır: ilk fiyatlama (null→değer) ve fiyat silme (değer→null) hariç.

create or replace function birim_fiyat_log() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if NEW.liste_fiyati is null
     or OLD.liste_fiyati is null
     or NEW.liste_fiyati is not distinct from OLD.liste_fiyati then
    return NEW;
  end if;

  insert into events (tip, profile_id, proje_id, birim_id, payload)
  values (
    'fiyat',
    auth.uid(),
    NEW.proje_id,
    NEW.id,
    jsonb_build_object(
      'eski', OLD.liste_fiyati,
      'yeni', NEW.liste_fiyati,
      'pct', round(((NEW.liste_fiyati - OLD.liste_fiyati) / OLD.liste_fiyati) * 100, 2),
      'daire_no', NEW.daire_no,
      'para_birimi', NEW.para_birimi
    )
  );
  return NEW;
end; $$;

drop trigger if exists birim_fiyat_log_trg on birim;
create trigger birim_fiyat_log_trg
  after update of liste_fiyati on birim
  for each row execute function birim_fiyat_log();
