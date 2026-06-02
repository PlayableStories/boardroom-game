#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { parseContent } from '../src/lib/parseContent.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const contentPath = resolve(ROOT, 'src/content.md')
const themePath = resolve(ROOT, 'src/theme.css')

const failures = []
const fail = (msg) => failures.push(msg)

let content
try {
  content = parseContent(readFileSync(contentPath, 'utf8'))
} catch (err) {
  console.error('❌ content.md failed to parse:', err.message)
  process.exit(1)
}

const themeCss = readFileSync(themePath, 'utf8')

// --- Meters ---
if (content.meters.length !== 4) fail(`expected 4 meters, got ${content.meters.length}`)
const meterIds = new Set()
for (const m of content.meters) {
  if (!m.id || !m.name || !m.icon) fail(`meter row incomplete: ${JSON.stringify(m)}`)
  if (meterIds.has(m.id)) fail(`duplicate meter id "${m.id}"`)
  meterIds.add(m.id)
  if (!themeCss.match(new RegExp(`--accent-${m.id}\\s*:`))) {
    fail(`theme.css missing --accent-${m.id} for meter "${m.id}"`)
  }
}

// --- Characters ---
const charIds = new Set()
for (const c of content.characters) {
  if (!c.id || !c.name || !c.role || !c.initials) {
    fail(`character row incomplete: ${JSON.stringify(c)}`)
  }
  if (charIds.has(c.id)) fail(`duplicate character id "${c.id}"`)
  charIds.add(c.id)
  if (!themeCss.match(new RegExp(`--char-${c.id}\\s*:`))) {
    fail(`theme.css missing --char-${c.id} for character "${c.name}"`)
  }
}

// --- Endings ---
for (const m of meterIds) {
  for (const t of ['0', '100']) {
    const key = `${m}_${t}`
    if (!content.endings[key]) fail(`missing ending "${key}"`)
    else if (!content.endings[key].name || !content.endings[key].epitaph) {
      fail(`ending "${key}" missing name or epitaph`)
    }
  }
}
if (!content.deckExhaust?.name || !content.deckExhaust?.epitaph) {
  fail('missing deck_exhaust ending')
}

// --- UI strings ---
for (const k of ['playAgain', 'youLastedSingular', 'youLastedPlural', 'leftGlyph', 'rightGlyph']) {
  if (!content.ui[k]) fail(`missing UI string "${k}"`)
}

// --- Cards ---
const VALID_TYPES = new Set(['character', 'bomb', 'chain', 'quarterly'])
const cardIds = new Set()
for (const card of content.cards) {
  if (cardIds.has(card.id)) fail(`duplicate card id "${card.id}"`)
  cardIds.add(card.id)
  if (!VALID_TYPES.has(card.type)) fail(`card ${card.id}: unknown type "${card.type}"`)
  if (!card.characterId || !charIds.has(card.characterId)) {
    fail(`card ${card.id}: character "${card.characterId}" not in roster`)
  }
  if (card.type === 'chain') {
    const hasTrigger = card.chainTrigger === 'left' || card.chainTrigger === 'right'
    const parent = card.chain ? content.cards.find((c) => c.id === card.chain) : null
    const parentUnlocks = parent && (parent.left?.unlock_chain === card.id || parent.right?.unlock_chain === card.id)
    if (!hasTrigger && !parentUnlocks) {
      fail(`chain card ${card.id}: needs either a Chain trigger field OR a parent that unlocks it via "Unlocks chain"`)
    }
    if (card.chain && !parent) {
      fail(`chain card ${card.id}: parent "${card.chain}" not found`)
    }
  }
  for (const side of ['left', 'right']) {
    const choice = card[side]
    if (!choice) {
      fail(`card ${card.id}: missing ${side} choice`)
      continue
    }
    for (const m of meterIds) {
      if (typeof choice.effects[m] !== 'number') {
        fail(`card ${card.id}: ${side}.effects.${m} not a number`)
      }
    }
    for (const k of Object.keys(choice.effects)) {
      if (!meterIds.has(k)) fail(`card ${card.id}: ${side}.effects has unknown meter "${k}"`)
    }
    if (choice.plant_bomb && !cardIds.has(choice.plant_bomb)) {
      // Check after all cards loaded; defer to a second pass below
    }
    if (choice.unlock_chain && !cardIds.has(choice.unlock_chain)) {
      // Same: deferred
    }
  }
}

// Second pass: cross-reference bomb / chain ids after all card ids are known.
for (const card of content.cards) {
  for (const side of ['left', 'right']) {
    const choice = card[side]
    if (choice.plant_bomb) {
      const target = content.cards.find((c) => c.id === choice.plant_bomb)
      if (!target) fail(`card ${card.id}: ${side}.plant_bomb "${choice.plant_bomb}" does not resolve`)
      else if (target.type !== 'bomb') {
        fail(`card ${card.id}: ${side}.plant_bomb "${choice.plant_bomb}" points to type=${target.type}, expected bomb`)
      }
      if (typeof choice.bomb_delay !== 'number' || choice.bomb_delay < 1) {
        fail(`card ${card.id}: ${side} plants bomb but bomb_delay is invalid (${choice.bomb_delay})`)
      }
    }
    if (choice.unlock_chain) {
      const target = content.cards.find((c) => c.id === choice.unlock_chain)
      if (!target) fail(`card ${card.id}: ${side}.unlock_chain "${choice.unlock_chain}" does not resolve`)
      else if (target.type !== 'chain') {
        fail(`card ${card.id}: ${side}.unlock_chain "${choice.unlock_chain}" points to type=${target.type}, expected chain`)
      }
    }
  }
}

if (failures.length) {
  console.error(`\n❌ ${failures.length} validation failure(s):`)
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}

const arcs = [...new Set(content.cards.map((c) => c.arc).filter(Boolean))]
const types = [...new Set(content.cards.map((c) => c.type))]
console.log(`✅ content.md valid.`)
console.log(`   • title:      "${content.title}"`)
console.log(`   • meters:     ${[...meterIds].join(', ')}`)
console.log(`   • characters: ${content.characters.length}`)
console.log(`   • cards:      ${content.cards.length} (types: ${types.join(', ')})`)
console.log(`   • arcs:       ${arcs.join(', ')}`)
console.log(`   • endings:    ${Object.keys(content.endings).length} + deck_exhaust`)
