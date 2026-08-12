interface StructuredDataProps {
  data: any
}

/**
 * Component to inject JSON-LD structured data.
 *
 * CRITICAL IMPLEMENTATION DETAIL (do NOT "simplify" to a JSX <script>):
 * Renders the <script> as raw HTML inside a hidden <div> via
 * dangerouslySetInnerHTML, NOT as a JSX <script> element. React 19's
 * resource-hoisting silently DROPS JSX <script> tags rendered inside <div>
 * roots in client-component pages (only fragment-rooted pages survived).
 * By emitting the <script> via innerHTML on a wrapper div, React never sees
 * it as a script element — it lands in the SSR HTML verbatim. Crawlers and
 * AI/audit tools see the JSON-LD; the browser doesn't execute it (HTML5
 * forbids executing scripts injected via innerHTML, and
 * type="application/ld+json" is non-executable by spec).
 *
 * The `<` -> `<` escape is XSS-safe (prevents </script> breakout).
 */
export default function StructuredData({ data }: StructuredDataProps) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  const html = `<script type="application/ld+json">${json}</script>`
  return (
    <div
      suppressHydrationWarning
      style={{ display: 'none' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/** Multiple structured data items. */
export function MultipleStructuredData({ items }: { items: any[] }) {
  return (
    <>
      {items.map((data, index) => (
        <StructuredData key={index} data={data} />
      ))}
    </>
  )
}
