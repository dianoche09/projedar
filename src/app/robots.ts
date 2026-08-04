import type { MetadataRoute } from "next";

const SITE = "https://projedar.com";

/**
 * Kapalı-devre B2B ağ: yalnız landing + yasal sayfalar indexlenir.
 * Panel/havuz/api route'ları (özel veri) disallow. AI crawler'lar landing için açık.
 */
export default function robots(): MetadataRoute.Robots {
  const gizli = ["/havuz", "/uretici", "/admin", "/api", "/hesap-bekliyor", "/p/", "/tasarim", "/login", "/kayit"];
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
