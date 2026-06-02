// Parses src/content.md into a structured object.
// Strict: throws with a line-anchored message on malformed input.

export function parseContent(raw) {
  const sections = splitTopSections(raw)

  const meters = parseTable(sections.Meters, ['id', 'icon', 'name'])
  const characters = parseTable(sections.Characters, ['id', 'name', 'role', 'initials'])
  const uiRows = parseTable(sections.UI, ['key', 'text'])
  const ui = Object.fromEntries(uiRows.map((r) => [r.key, r.text]))

  const { endings, deckExhaust } = parseEndingsSection(sections.Endings)
  const cards = parseCardsSection(sections.Cards)

  return {
    title: parseTitle(sections.Title),
    meters,
    characters,
    endings,
    deckExhaust,
    ui,
    cards,
  }
}

function splitTopSections(raw) {
  const lines = raw.split('\n')
  const sections = {}
  let current = null
  for (const line of lines) {
    const m = line.match(/^# (.+?)\s*$/)
    if (m) {
      if (current) sections[current.name] = current.body.trim()
      current = { name: m[1].trim(), body: '' }
    } else if (current) {
      current.body += line + '\n'
    }
  }
  if (current) sections[current.name] = current.body.trim()

  const required = ['Title', 'Meters', 'Characters', 'Endings', 'UI', 'Cards']
  for (const r of required) {
    if (!(r in sections)) throw new Error(`Missing required section: # ${r}`)
  }
  return sections
}

function parseTitle(body) {
  const first = body.split('\n').find((l) => l.trim() !== '')
  if (!first) throw new Error('Title section is empty')
  return first.trim()
}

function parseTable(body, expectedColumns) {
  const lines = body.split('\n').filter((l) => l.trim() !== '')
  const tableLines = lines.filter((l) => l.trim().startsWith('|'))
  if (tableLines.length < 3) {
    throw new Error(`Expected a markdown table with header + separator + at least one row; got ${tableLines.length} table lines`)
  }
  const header = parseRow(tableLines[0]).map((c) => c.toLowerCase())
  // tableLines[1] is the separator row (|---|---|)
  for (let i = 0; i < expectedColumns.length; i++) {
    if (header[i] !== expectedColumns[i].toLowerCase()) {
      throw new Error(`Table column ${i} expected "${expectedColumns[i]}", got "${header[i]}"`)
    }
  }
  return tableLines.slice(2).map((line) => {
    const cells = parseRow(line)
    const row = {}
    for (let i = 0; i < expectedColumns.length; i++) {
      row[expectedColumns[i]] = (cells[i] ?? '').trim()
    }
    return row
  })
}

function parseRow(line) {
  // Strip leading/trailing pipes, split on |, trim each cell.
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|\s*$/, '')
  return trimmed.split('|').map((c) => c.trim())
}

function splitSubSections(body) {
  const lines = body.split('\n')
  const subs = []
  let current = null
  for (const line of lines) {
    const m = line.match(/^## (.+?)\s*$/)
    if (m) {
      if (current) subs.push({ heading: current.heading, body: current.body.trim() })
      current = { heading: m[1].trim(), body: '' }
    } else if (current) {
      current.body += line + '\n'
    }
  }
  if (current) subs.push({ heading: current.heading, body: current.body.trim() })
  return subs
}

function parseEndingsSection(body) {
  const subs = splitSubSections(body)
  const endings = {}
  let deckExhaust = null
  for (const { heading, body: subBody } of subs) {
    // Heading shape: "<id> — <name>" (em-dash) or "<id> - <name>" (regular hyphen)
    const m = heading.match(/^(\S+)\s+[—–-]\s+(.+)$/)
    if (!m) throw new Error(`Malformed ending heading: "${heading}" — expected "<id> — <name>"`)
    const id = m[1].trim()
    const name = m[2].trim()
    const epitaph = subBody.trim()
    if (!epitaph) throw new Error(`Ending ${id} has no epitaph body`)
    if (id === 'deck_exhaust') {
      deckExhaust = { name, epitaph }
    } else {
      endings[id] = { name, epitaph }
    }
  }
  if (!deckExhaust) throw new Error('Missing deck_exhaust ending')
  return { endings, deckExhaust }
}

function parseCardsSection(body) {
  const subs = splitSubSections(body)
  if (subs.length === 0) throw new Error('No cards found under # Cards')
  return subs.map(({ heading, body: cardBody }) => parseCard(heading.trim(), cardBody))
}

function parseCard(id, body) {
  const card = {
    id,
    arc: null,
    chain: null,
    chainTrigger: null,
    type: null,
    characterId: null,
    text: null,
    flavor: null,
    left: null,
    right: null,
  }

  const lines = body.split('\n')
  let i = 0

  // 1) Field bullets: `- **Field**: value`
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') { i++; continue }
    const m = line.match(/^- \*\*([^*]+)\*\*:\s*(.+?)\s*$/)
    if (!m) break
    const field = m[1].trim().toLowerCase().replace(/[\s&]+/g, '_')
    const val = m[2].trim()
    if (field === 'type') card.type = val
    else if (field === 'arc') card.arc = val
    else if (field === 'character') card.characterId = val
    else if (field === 'chain_parent') card.chain = val
    else if (field === 'chain_trigger') card.chainTrigger = val
    else throw new Error(`Card ${id}: unknown field "${field}"`)
    i++
  }

  // 2) Blockquote → prompt text
  const promptLines = []
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') { i++; continue }
    if (line.startsWith('>')) {
      promptLines.push(line.replace(/^>\s?/, ''))
      i++
    } else {
      break
    }
  }
  if (promptLines.length === 0) throw new Error(`Card ${id}: missing prompt blockquote`)
  card.text = promptLines.join(' ').replace(/\s+/g, ' ').trim()

  // 3) Choices: `### Left → label` and `### Right → label`
  let parsedChoices = 0
  while (i < lines.length && parsedChoices < 2) {
    const line = lines[i]
    if (line.trim() === '') { i++; continue }
    const m = line.match(/^### (Left|Right) [→\->]+ (.+?)\s*$/)
    if (!m) break
    const side = m[1].toLowerCase()
    const label = m[2].trim()
    i++

    const choice = { label, effects: {}, plant_bomb: null, bomb_delay: null, unlock_chain: null }

    while (i < lines.length) {
      const ln = lines[i]
      if (ln.trim() === '') { i++; continue }
      // End choice if we hit the next ### or the flavor italic line
      if (ln.startsWith('### ')) break
      if (ln.trim().match(/^\*[^*].*\*\s*$/)) break

      const bm = ln.match(/^-\s+(.+?)\s*$/)
      if (!bm) {
        throw new Error(`Card ${id} ${side}: expected bullet, got "${ln}"`)
      }
      const content = bm[1].trim()

      const plantM = content.match(/^Plants bomb:\s*([\w-]+)\s+after\s+(\d+)\s+cards?\s*$/i)
      if (plantM) {
        choice.plant_bomb = plantM[1]
        choice.bomb_delay = parseInt(plantM[2], 10)
        i++
        continue
      }

      const chainM = content.match(/^Unlocks chain:\s*([\w-]+)\s*$/i)
      if (chainM) {
        choice.unlock_chain = chainM[1]
        i++
        continue
      }

      const effectM = content.match(/^(\w+):\s*([+-]?\d+)\s*$/)
      if (effectM) {
        choice.effects[effectM[1]] = parseInt(effectM[2], 10)
        i++
        continue
      }

      throw new Error(`Card ${id} ${side}: unrecognized bullet "${content}"`)
    }

    card[side] = choice
    parsedChoices++
  }

  if (!card.left || !card.right) {
    throw new Error(`Card ${id}: must have both Left and Right choices`)
  }

  // 4) Flavor: italic line `*<text>*`
  while (i < lines.length) {
    const line = lines[i].trim()
    if (line === '') { i++; continue }
    const m = line.match(/^\*([^*].*)\*\s*$/)
    if (m) {
      card.flavor = m[1].trim()
      break
    }
    i++
  }
  if (!card.flavor) throw new Error(`Card ${id}: missing flavor (italic line at end)`)

  return card
}
