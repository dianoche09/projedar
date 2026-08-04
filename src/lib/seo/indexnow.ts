/**
 * IndexNow — Bing/Yandex/Naver anlık indeksleme kanalı (Google IndexNow KULLANMAZ;
 * o sitemap'i tarar). Klasik sitemap-ping 2023'te öldü; değişen landing'leri buradan bildiririz.
 * Key public bir token'dır (gizli değil): yalnız "bu domain'in sahibiyim" kanıtıdır.
 * public/<key>.txt ile aynı olmalı.
 */
const KEY = process.env.INDEXNOW_KEY ?? "a3f5c9e1b7d2486fa3f5c9e1b7d2486f";
const HOST = "projedar.com";

/** Kapalı-devre: yalnız herkese açık, indexlenebilir landing'ler. Panel/mikrosite noindex. */
const PUBLIC_URLS = [
  `https://${HOST}/`,
  `https://${HOST}/muteahhit`,
  `https://${HOST}/emlakci`,
  `https://${HOST}/guven`,
];

export async function indexNowGonder(
  urls: string[] = PUBLIC_URLS,
): Promise<{ status: number; ok: boolean; gonderilen: number }> {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });
  // IndexNow başarıda 200/202 döner; içerik önemli değil.
  return { status: res.status, ok: res.status === 200 || res.status === 202, gonderilen: urls.length };
}
