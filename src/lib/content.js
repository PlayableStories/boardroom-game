import { parseContent } from './parseContent.js'

let raw
try {
  raw = (await import('../content.md?raw')).default
} catch {
  const { readFileSync } = await import('node:fs')
  const { fileURLToPath } = await import('node:url')
  const { dirname, join } = await import('node:path')
  const here = dirname(fileURLToPath(import.meta.url))
  raw = readFileSync(join(here, '../content.md'), 'utf8')
}

const parsed = parseContent(raw)

export const charactersById = Object.fromEntries(parsed.characters.map((c) => [c.id, c]))

const cardsResolved = parsed.cards.map((card) => ({
  ...card,
  character: charactersById[card.characterId] || null,
}))

const content = { ...parsed, cards: cardsResolved }

export default content
