/**
 * Per-entity unique content for programmatic SEO pages (THE doorway-safe engine).
 *
 * Two layers:
 *   1. CURATED metadata for well-known entities (real, broadly-true characteristics)
 *   2. Variant text pools selected DETERMINISTICALLY by an entity-name hash, so
 *      every entity gets a unique-looking page even without curated data.
 *
 * No fabricated facts — curated entries describe broadly known characteristics;
 * variants are written as generally-true statements about your domain's mechanics.
 * This is what keeps 100s of programmatic pages out of the thin-content / doorway
 * penalty: same template, genuinely different text per page.
 *
 * CONFIG PER PROJECT: replace CURATED entries and the *_VARIANTS pools with your
 * niche's true statements. Keep the mechanism (stableHash + modulo selection).
 */

import { slugify } from './slug'

export type EntityCharacter = 'type-a' | 'type-b' | 'type-c' | 'genel'

export interface EntityMeta {
  character: EntityCharacter
  knownFor: string
  typicalMetric: string // e.g. a typical band/range relevant to your niche
  primaryType: string
  landmarks?: string[]
}

// ~N well-known entities with real characteristics. Fabricate nothing.
const CURATED: Record<string, EntityMeta> = {
  'example-slug': {
    character: 'type-a',
    knownFor: 'what this entity is broadly known for',
    typicalMetric: '1.0-2.0',
    primaryType: 'the dominant type/use here',
    landmarks: ['Sub-area 1', 'Sub-area 2', 'Sub-area 3'],
  },
  // ... add curated entries; uncurated entities fall back to a generic-but-true default
}

// Generally-true statements about your domain (NOT entity-specific). 8+ each.
const INTRO_VARIANTS: string[] = [
  'true statement A about how the domain mechanic works',
  'true statement B',
  'true statement C',
  'true statement D',
  'true statement E',
  'true statement F',
  'true statement G',
  'true statement H',
]

const CONTENT_VARIANTS: string[] = [
  'true detail statement 1.',
  'true detail statement 2.',
  'true detail statement 3.',
  'true detail statement 4.',
  'true detail statement 5.',
  'true detail statement 6.',
  'true detail statement 7.',
  'true detail statement 8.',
]

const CTA_TAG_VARIANTS: string[] = [
  'CTA tag 1', 'CTA tag 2', 'CTA tag 3', 'CTA tag 4',
  'CTA tag 5', 'CTA tag 6', 'CTA tag 7', 'CTA tag 8',
]

const CHARACTER_DESCRIPTORS: Record<EntityCharacter, string> = {
  'type-a': 'description of what a type-a entity is like',
  'type-b': 'description of what a type-b entity is like',
  'type-c': 'description of what a type-c entity is like',
  'genel': 'generic-but-true description used when the entity is not curated',
}

const stableHash = (s: string): number => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function getEntityMeta(entity: string): EntityMeta {
  const key = slugify(entity)
  return CURATED[key] ?? {
    character: 'genel',
    knownFor: 'a generic-but-true fallback description',
    typicalMetric: '1.0-2.0',
    primaryType: 'the common default type',
  }
}

export interface EntityContentBlocks {
  intro: string
  contentParagraph: string
  ctaTag: string
  characterText: string
  knownFor: string
  typicalMetric: string
  primaryType: string
  landmarks: string[]
}

export function getEntityContent(parent: string, entity: string): EntityContentBlocks {
  const meta = getEntityMeta(entity)
  const h = stableHash(slugify(entity))

  // Different bit-shifts pick from different pools → combinatorial uniqueness.
  const introMechanic = INTRO_VARIANTS[h % INTRO_VARIANTS.length]
  const contentMechanic = CONTENT_VARIANTS[(h >>> 3) % CONTENT_VARIANTS.length]
  const ctaTag = CTA_TAG_VARIANTS[(h >>> 5) % CTA_TAG_VARIANTS.length]
  const characterText = CHARACTER_DESCRIPTORS[meta.character]

  const landmarkList = (meta.landmarks && meta.landmarks.length)
    ? meta.landmarks.slice(0, 3).join(', ')
    : 'its main sub-areas'

  const intro =
    `${parent} ${entity}, ${meta.knownFor}; ${characterText}. ` +
    `${introMechanic}.`

  const contentParagraph =
    `In ${entity} the typical band is ${meta.typicalMetric} and the dominant type is ` +
    `${meta.primaryType}. Notable areas: ${landmarkList}. ${contentMechanic}`

  return {
    intro,
    contentParagraph,
    ctaTag,
    characterText,
    knownFor: meta.knownFor,
    typicalMetric: meta.typicalMetric,
    primaryType: meta.primaryType,
    landmarks: meta.landmarks ?? [],
  }
}
