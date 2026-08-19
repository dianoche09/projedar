/**
 * N11 / INV-N11-A — birimLeadKabulEdilebilir doğruluk tablosu + fail-closed.
 * Kabul = satilabilir===true VE durum ∈ {musait, opsiyonlu, satis_beklemede}. Kalan her şey red.
 * Bu, paylaşım linkinden lead kabulünün TEK yetki kapısıdır (token sabit HMAC). Çalıştır:
 *   npx tsx tests/domain/lead-visibility.test.ts
 */
import { birimLeadKabulEdilebilir, type BirimDurum } from "../../src/lib/types.ts";
import { esit, ozet } from "./_assert.ts";

// Kabul edilen durumlar (satilabilir=true iken)
for (const d of ["musait", "opsiyonlu", "satis_beklemede"] as BirimDurum[]) {
  esit(birimLeadKabulEdilebilir(d, true), true, `kabul: ${d} + satilabilir`);
}

// Terminal / geri-çekilmiş durumlar → red (satilabilir=true olsa bile)
for (const d of ["satildi", "kiralandi", "stop", "planli"] as BirimDurum[]) {
  esit(birimLeadKabulEdilebilir(d, true), false, `red: ${d}`);
}

// satilabilir=false → her durumda red (mal-sahibi payı vb.)
for (const d of ["musait", "opsiyonlu", "satis_beklemede"] as BirimDurum[]) {
  esit(birimLeadKabulEdilebilir(d, false), false, `red: ${d} + satilabilir=false`);
}

// Fail-closed: enum-dışı durum, null/undefined satilabilir → red
esit(birimLeadKabulEdilebilir("uyduruk" as BirimDurum, true), false, "fail-closed: bilinmeyen durum");
esit(birimLeadKabulEdilebilir("musait", null as unknown as boolean), false, "fail-closed: satilabilir=null");
esit(birimLeadKabulEdilebilir("musait", undefined as unknown as boolean), false, "fail-closed: satilabilir=undefined");
esit(birimLeadKabulEdilebilir("musait", 1 as unknown as boolean), false, "fail-closed: satilabilir=1 (strict true değil)");

ozet("N11 lead-visibility");
