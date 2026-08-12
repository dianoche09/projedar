import { siteConfig } from '@/lib/seo';

// Route Handler at src/app/robots.txt/route.ts (dynamic, NOT a static file).

// AI crawlers explicitly allowed (GEO optimization). 27 known agents.
const AI_CRAWLERS = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
  'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  'PerplexityBot', 'Google-Extended', 'GoogleOther',
  'Amazonbot', 'BraveBot', 'PhindBot', 'cohere-ai',
  'FacebookBot', 'Meta-ExternalAgent', 'Applebot-Extended',
  'Bytespider', 'CCBot', 'Diffbot', 'YouBot', 'AI2Bot',
  'ImagesiftBot', 'OmgiliBot', 'PiplBot', 'SemrushBot-OCOB',
  'Timpibot', 'KangarooBot',
];

// Generic/unknown bots: block private paths including /_next/.
const ALL_BOT_PRIVATE = ['/dashboard/', '/admin/', '/api/', '/_next/'];
// Search engines need /_next/static/ to render — blocking it hurts CWV and causes
// "indexed despite blocked" warnings. So only block truly private paths for them.
const SEARCH_ENGINE_PRIVATE = ['/dashboard/', '/admin/', '/api/'];

const block = (userAgent: string, disallowPaths: string[], extraDisallow: string[] = []): string =>
  [
    `User-agent: ${userAgent}`,
    'Allow: /',
    ...disallowPaths.map((p) => `Disallow: ${p}`),
    ...extraDisallow.map((p) => `Disallow: ${p}`),
  ].join('\n');

export function GET(): Response {
  const blocks: string[] = [
    block('*', ALL_BOT_PRIVATE, ['/test-*', '/*.json$', '/*?*utm_*']),
    block('Googlebot', SEARCH_ENGINE_PRIVATE),
    block('Bingbot', SEARCH_ENGINE_PRIVATE),
    ...AI_CRAWLERS.map((ua) => block(ua, ALL_BOT_PRIVATE)),
  ];

  const body = [
    blocks.join('\n\n'),
    '',
    `Sitemap: ${siteConfig.url}/sitemap.xml`,
    `Host: ${siteConfig.url}`,
    '',
    '# AI discoverability files',
    `# LLMs overview: ${siteConfig.url}/llms.txt`,
    `# LLMs full content: ${siteConfig.url}/llms-full.txt`,
    '',
    '# Content usage signals — https://contentsignals.org/',
    'Content-Signal: ai-train=yes, search=yes, ai-input=yes',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
