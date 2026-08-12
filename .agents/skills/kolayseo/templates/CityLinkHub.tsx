import Link from 'next/link'
import { slugify } from '@/lib/slug'
// Your entity list (cities, categories, regions...). Replace with your axis.
import { ENTITIES } from '@/constants/entities'

/**
 * Internal-link mesh — THE authority lever, not decoration.
 *
 * Programmatic [entity] pages are often orphaned (the footer only links a few
 * big ones). This component drops a full cross-link web under each entity page:
 * internal links (authority flow) + a crawl path. Server component, zero JS.
 * In the source project this single mesh rescued 114 orphaned programmatic pages.
 *
 * `sibling` cross-links two programmatic networks (e.g. /category-a/x ↔ /category-b/x)
 * so authority flows between them, not just within one.
 */
interface Props {
  /** '/category-a' | '/category-b' — link base */
  basePath: string
  /** Section heading, e.g. "Other Cities" */
  title: string
  /** Anchor suffix, e.g. "Zoning" → "Ankara Zoning" */
  linkSuffix: string
  /** Current entity slug — so we don't link a page to itself */
  currentSlug?: string
  /** Sibling page link (cross-network) */
  sibling?: { href: string; label: string }
  /** Optional intro line under the heading */
  intro?: string
}

export default function CityLinkHub({ basePath, title, linkSuffix, currentSlug, sibling, intro }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      <h2 className="text-lg font-black text-gray-900 mb-1">{title}</h2>
      {intro && <p className="text-sm text-gray-500 font-medium mb-5">{intro}</p>}
      <div className="flex flex-wrap gap-2">
        {sibling && (
          <Link
            href={sibling.href}
            className="px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-xs font-bold text-primary-700 hover:bg-primary-100 transition-colors"
          >
            {sibling.label}
          </Link>
        )}
        {ENTITIES.map((entity) => {
          const slug = slugify(entity)
          if (slug === currentSlug) return null
          const label = entity.charAt(0) + entity.slice(1).toLowerCase()
          return (
            <Link
              key={slug}
              href={`${basePath}/${slug}`}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:text-primary-700 hover:border-primary-300 transition-colors"
            >
              {label} {linkSuffix}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
