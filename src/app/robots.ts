import type { MetadataRoute } from "next";

const SITE = "https://projedar.com";

/**
 * Kapalı-devre B2B ağ: yalnız landing + yasal sayfalar indexlenir.
 * Panel/danisman/api route'ları (özel veri) disallow. AI crawler'lar landing için açık.
 */
export default function robots(): MetadataRoute.Robots {
  // Not: /p/ (share mikrositesi) BİLEREK disallow DEĞİL. Public + crawlable olmalı ki
  // Googlebot sayfadaki noindex,nofollow'u görebilsin (robots-disallow olsaydı noindex'i
  // göremez, paylaşılan URL çıplak SERP'e sızabilirdi — Google block-indexing dokümanı).
  const gizli = ["/danisman", "/uretici", "/admin", "/api", "/hesap-bekliyor", "/tasarim", "/login", "/kayit", "/mockup", "/sunum", "/_bildirim"];
  // GEO görünürlüğü: AI arama/asistan crawler'ları landing içeriğini okuyabilsin.
  const aiCrawlers = [
    // OpenAI
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    // Anthropic
    "ClaudeBot",
    "Claude-Web",
    "Claude-SearchBot",
    "anthropic-ai",
    // Perplexity
    "PerplexityBot",
    "Perplexity-User",
    // Google (AI / Gemini / Vertex)
    "Google-Extended",
    "GoogleOther",
    "Google-CloudVertexBot",
    // Apple
    "Applebot",
    "Applebot-Extended",
    // Amazon
    "Amazonbot",
    // ByteDance
    "Bytespider",
    // Common Crawl (birçok LLM eğitim kaynağı)
    "CCBot",
    // Meta AI
    "Meta-ExternalAgent",
    "FacebookBot",
    // Diğer AI arama / asistan
    "cohere-ai",
    "Diffbot",
    "PhindBot",
    "YouBot",
    "DuckAssistBot",
    "PetalBot",
    "Bravebot",
    "ImagesiftBot",
    "Timpibot",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: gizli },
      // AI arama motorları landing içeriğini okuyabilsin (GEO görünürlüğü)
      { userAgent: aiCrawlers, allow: "/", disallow: gizli },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
