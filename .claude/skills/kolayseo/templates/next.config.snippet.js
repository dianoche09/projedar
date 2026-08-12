/**
 * Merge these into your next.config.js. (siteConfig.url must match your canonical host.)
 */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      // Canonical domain: apex → www (one host = consistent session/cookies, no OAuth split).
      // Guard on host so no redirect loop (www !== 'example.com').
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'example.com' }],
        destination: 'https://www.example.com/:path*',
        permanent: true,
      },
      // 301-merge old/variant paths → real routes (kills soft-404, preserves link equity):
      // { source: '/old-path', destination: '/real-path', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        // RFC 8288 Link headers — agent discovery surface on the homepage.
        source: '/',
        headers: [
          {
            key: 'Link',
            value: [
              '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
              '</llms.txt>; rel="alternate"; type="text/markdown"',
              '</sitemap.xml>; rel="sitemap"; type="application/xml"',
            ].join(', '),
          },
        ],
      },
    ]
  },
  images: { formats: ['image/avif', 'image/webp'] },
}

module.exports = nextConfig
