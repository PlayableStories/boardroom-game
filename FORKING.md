# Forking Boardroom

Boardroom is a small, opinionated, Reigns-style swipe card game. This document is for **forkers who want to re-skin it** — keep the mechanics, swap the theme. A medieval kingdom. A school principal. A starship captain. Pick a setting, follow this guide, ship a complete game.

If you instead want to **rebuild from scratch with AI assistance** using this repo as a structural reference, that's a separate path (Level 2) and not covered here — see `boardroom-spec.md` and `boardroom-cards.md` in the root.

## What "Level 1" means

You will change **strings, colors, emoji, and the deck**. You will not change JavaScript control flow. The game's mechanics — meter clamps, swipe handling, bomb timing, chain triggers, the every-fourth-card quarterly rhythm, the eight ending categories — stay exactly as they are.

The customization surface is split into two groups so you can ship in two passes:

- **Group A — Text & content.** Rewrite everything the player reads. Ship a fully themed re-skin with the default look.
- **Group B — Visual identity.** Swap palette, fonts, emoji icons, favicon. Ship a fully retitled visual brand.

You can do A first and stop, do B first and stop, or do both. There is no order dependency.

### Recommended workflow

```bash
git clone <your fork>
cd boardroom-game
npm install
npm run dev          # localhost:5173, hot reload
# ... edit per the sections below ...
npm run build        # production build sanity check
node scripts/validate-cards.mjs   # checks the deck stays internally consistent
```

---

## Project tree

Legend: 📝 = Group A (text/content) · 🎨 = Group B (visual) · — = Level 2 (mechanics, leave alone)

```
boardroom-game/
├── index.html                    # 📝 <title>   🎨 favicon, Google Fonts
├── package.json                  # 📝 project name
├── public/
│   └── favicon.svg               # 🎨 swap the file
├── src/
│   ├── App.jsx                   # 📝 on-screen <h1>
│   ├── App.css                   # — layout + animations
│   ├── index.css                 # 🎨 palette + meter accent + font CSS variables
│   ├── data/
│   │   └── cards.json            # 📝 card text / labels / flavor / character names
│   │                             # 🎨 character.accentColor (per card)
│   ├── lib/
│   │   └── meters.js             # 📝 meter names    🎨 meter icons + accent ref
│   ├── store/
│   │   └── gameStore.js          # 📝 8 endings + deck-exhaust ending strings
│   │                             # — everything else (mechanics)
│   └── components/
│       ├── GameOver.jsx          # 📝 "Play Again" + "You lasted N cards"
│       ├── CardStack.jsx         # 🎨 ✕ / ✓ swipe glyphs
│       ├── CharacterPortrait.jsx # — renders character fields from card data
│       ├── MeterBar.jsx, MetersRow.jsx, FlavorText.jsx   # — fully data-driven
```

---

## Group A — Text & content

All edits in this group are strings or numbers inside `.json` / `.jsx` / `.js` files. No CSS, no images, no fonts.

### A1. Game title

| What | File | Where |
|---|---|---|
| Browser tab title | `index.html` | line 7, `<title>` |
| On-screen game title (top of page) | `src/App.jsx` | line 20, `<h1>` |

(The `name` field in `package.json` is a cosmetic / tooling identifier — see A6, optional.)

### A2. The four meter names

**File: `src/lib/meters.js`, lines 1–6** — the `METER_DEFS` array.

```js
export const METER_DEFS = [
  { id: 'shareholders', name: 'Shareholders',  icon: '💰', accent: 'var(--accent-shareholders)' },
  { id: 'management',   name: 'Management',    icon: '🏢', accent: 'var(--accent-management)' },
  { id: 'staff',        name: 'Staff',         icon: '😊', accent: 'var(--accent-staff)' },
  { id: 'image',        name: 'Public Image',  icon: '🌍', accent: 'var(--accent-image)' },
]
```

- **Safe to edit:** `name` (this is the on-screen label).
- `icon` is technically text but reads as visual identity — handled in Group B.
- `accent` is a CSS variable reference — handled in Group B.
- **⚠️ Leave `id` alone** unless you're prepared to do a full cascade rename — see Friction §1 below.

### A3. Cards

**File: `src/data/cards.json`** — one array of 22 cards.

Current deck breakdown:

| Type | Count | What it is |
|---|---|---|
| `character` | 10 | Normal deck cards. Drawn in shuffled order. |
| `bomb` | 7 | Triggered cards. A character/chain card "plants" them, they detonate N cards later. |
| `chain` | 3 | Direction-triggered follow-ups. Appear immediately after a specific swipe direction on a parent card. |
| `quarterly` | 2 | Auto-drawn every fourth card. Cross-cutting board-level dilemmas. |

Per card, **these fields are pure Group A** (edit freely on any card type):

- `text` — the main decision text shown on the card.
- `left.label`, `right.label` — the swipe choice labels (the things that fade in as you tilt the card).
- `flavor` — the one-line outcome shown briefly after the swipe.
- `character.name`, `character.role`, `character.avatarInitials` (always 2 chars).
- `arc` — a thematic grouping tag. Used for organization. No game logic looks at it.
- `left.effects.<meterId>`, `right.effects.<meterId>` — integer deltas applied to each meter on swipe. Rebalancing is allowed but changes difficulty.

**⚠️ Do not change** any of:

- `id` (referenced by other cards via `plant_bomb`, `chain`, `unlocks_chain`).
- `type` (decides which draw rules apply).
- `chain` (parent-id pointer on chain cards).
- `chainTrigger` (`'left'` or `'right'` — required on chain cards).
- `plant_bomb`, `bomb_delay`, `unlocks_chain` — these wire the bomb / chain plumbing.

`character.accentColor` is Group B (B4 below).

After editing, run `node scripts/validate-cards.mjs` — it catches dangling references and shape errors.

### A4. Endings

**File: `src/store/gameStore.js`, lines 7–45** — the `ENDINGS` map plus the deck-exhaust ending.

Eight endings, one per meter-extreme combination:

| Key | Triggered when |
|---|---|
| `shareholders_0`, `shareholders_100` | Shareholders meter hits 0 / 100 |
| `management_0`, `management_100` | Management meter hits 0 / 100 |
| `staff_0`, `staff_100` | Staff meter hits 0 / 100 |
| `image_0`, `image_100` | Public Image meter hits 0 / 100 |

Each is `{ name, epitaph }`. Both strings are Group A — fully editable. Example:

```js
shareholders_0: {
  name: 'Hostile Takeover',
  epitaph: 'The board accepted the acquisition offer. You were not part of the deal.',
},
```

Plus one deck-exhaust ending (lines 42–45), triggered when the player survives all cards without breaking a meter:

```js
const DECK_EXHAUST_ENDING = {
  name: 'Out of Crises',
  epitaph: 'You ran out of cards. The world ran out of patience.',
}
```

**⚠️ The `meterId_0` / `meterId_100` key shape is structural** — see Friction §1 if you also want to rename a meter id.

### A5. UI button & outcome strings

**File: `src/components/GameOver.jsx`** — the game-over overlay text:

- Line 17: `You lasted {cardIndex} {cardIndex === 1 ? 'card' : 'cards'}.` — the run-length sentence + singular/plural form.
- Line 20: `Play Again` — the restart button label.

**File: `src/lib/meters.js`, `formatDelta` (lines 14–18)** — the `+` / `−` / `±0` prefixes shown on the meter preview chips during a drag. Trivial swap if you'd rather use `▲` / `▼` / `=`, or words.

### A6. Tooling identity (optional)

The `name` field in `package.json` (line 2) is the npm package identifier. It shows up in IDE workspace headers and `npm` CLI output, but it is **not visible to the player** — the running game never reads it. Change it only if you want your fork's tooling identity to match the theme.

If you do change it, run `npm install` afterwards — the `name` field in `package-lock.json` resyncs automatically. No hand-edit needed.

---

## Group B — Visual identity

All edits in this group are CSS variables, image files, or short emoji swaps. No prose changes.

### B1. Color palette

**File: `src/index.css`, lines 2–9** — base palette CSS custom properties.

| Variable | Purpose |
|---|---|
| `--bg`, `--bg-glow` | Page background + radial glow on top of it |
| `--card`, `--card-edge` | Card surface + bottom gradient edge |
| `--ink`, `--ink-on-dark` | Text color on cards (dark on cream) / text on dark background (cream on dark) |
| `--muted`, `--muted-deep` | Secondary and tertiary text |

### B2. Meter accent colors

**File: `src/index.css`, lines 11–14** — four CSS variables matched 1:1 to meter ids.

```css
--accent-shareholders: #d4a534;
--accent-management:   #c94c4c;
--accent-staff:        #4ca89a;
--accent-image:        #4c7ac9;
```

These drive each meter's fill color, the pulsing-warning / flashing-danger animations on extreme values, and the swipe-direction tint on the choice labels (left = `--accent-management` red, right = `--accent-staff` teal in the default theme — see `src/App.css`).

### B3. Meter icons (emoji)

**File: `src/lib/meters.js`, lines 2–5** — the `icon` field on each `METER_DEFS` entry. Any emoji or short glyph works.

### B4. Character avatar colors

**File: `src/data/cards.json`** — `character.accentColor` (hex string) on each card. Drives the colored circle behind the character's initials.

**Note:** characters are currently duplicated per card — see Friction §2.

### B5. Swipe symbols

**File: `src/components/CardStack.jsx`, lines 63–67** — the `✕` (left) and `✓` (right) glyphs that prefix the choice labels.

```jsx
<motion.span className="choice-label choice-left" style={{ opacity: noOpacity }}>
  ✕ {card.left?.label}
</motion.span>
<motion.span className="choice-label choice-right" style={{ opacity: yesOpacity }}>
  {card.right?.label} ✓
</motion.span>
```

Swap with any single-character glyph or short word.

### B6. Fonts

Two places to change in lockstep:

- **CSS variables in `src/index.css` lines 16–17** — `--font-serif`, `--font-mono`.
- **Google Font `<link>` tags in `index.html` lines 8–17** — the URLs that load Playfair Display and DM Mono.

Update both. If you only swap the CSS variable, the browser falls back to the system serif/mono.

### B7. Favicon

Replace **`public/favicon.svg`**. Referenced from `index.html` line 5. Any SVG works; PNG also works if you also update the `type` attribute and filename in the `<link>`.

---

## Known friction

These are present-day rough edges, not blockers. Surfacing them so you know what you're getting into. A future repo change may smooth some of them.

1. **Renaming a meter id is a cascade, not a single edit.** The four lowercase ids (`shareholders`, `management`, `staff`, `image`) appear in:
   - `src/lib/meters.js` — `METER_DEFS` (1 occurrence)
   - `src/store/gameStore.js` — `METER_KEYS` (line 4), `INITIAL_METERS` (line 5), and the 8 `ENDINGS` keys (`<id>_0` and `<id>_100`)
   - `src/data/cards.json` — every card's `left.effects` and `right.effects` keys (~44 occurrences across 22 cards)
   - `src/index.css` — the matching `--accent-<id>` CSS variable

   The safe approach: pick a single exact lowercase string, find-and-replace repo-wide, then run `git grep '<old-id>'` and confirm zero matches before building.

2. **Characters are inlined per card.** Each card has its own copy of `character.name` / `role` / `avatarInitials` / `accentColor`. If "The Chair" appears on five cards, that's five separate copies. Renaming her means editing each occurrence. There is no central character registry today.

3. **A few player-facing strings are hardcoded in JSX, not data.**
   - `src/components/GameOver.jsx` — `"Play Again"` (line 20) and the `"You lasted N card(s)"` template (line 17).
   - `src/components/CardStack.jsx` — the `✕` and `✓` glyphs (lines 64, 67).

   They're trivial to edit but they don't live in `cards.json` or any JSON config — they're inline in the React components.

4. **The quarterly rhythm is hardcoded.** "Every fourth card draws a quarterly" lives as `nextIndex % 4 === 0` in `src/store/gameStore.js` line 221. Changing the cadence is a one-character JS edit, which crosses into Level 2.

5. **Meter zone thresholds are hardcoded.** The warning band (≤20 / ≥80) and danger band (≤10 / ≥90) live in `meterZone` at `src/lib/meters.js` lines 8–12. Adjusting these is a JS edit — Level 2.

6. **`scripts/validate-cards.mjs` enforces the card schema.** Editing existing field *values* is safe. Adding *new* fields or renaming the shape will trip the validator and you'll need to update it — Level 2.

---

## Re-skin checklist

Copy this into your fork's PR description and tick as you go.

### Group A — text & content

- [ ] Game title in `index.html` (line 7) and `src/App.jsx` (line 20)
- [ ] Four meter `name`s in `src/lib/meters.js` (leave `id`s alone unless doing the full cascade)
- [ ] Every card's `text`, `flavor`, `left/right.label`, `character.name`/`role`/`avatarInitials` in `src/data/cards.json`
- [ ] All 8 endings + the deck-exhaust ending in `src/store/gameStore.js`
- [ ] `GameOver.jsx` strings ("Play Again", "You lasted…") if you want non-default copy
- [ ] (Optional) `formatDelta` `+` / `−` / `±0` prefixes in `src/lib/meters.js`
- [ ] (Optional) `name` in `package.json` — cosmetic only; run `npm install` afterwards to resync `package-lock.json`

### Group B — visual identity

- [ ] Base palette CSS variables in `src/index.css` (`--bg`, `--card`, `--ink`, `--muted`, etc.)
- [ ] Four meter accent CSS variables in `src/index.css`
- [ ] Meter `icon` emoji in `src/lib/meters.js`
- [ ] Each card's `character.accentColor` in `src/data/cards.json`
- [ ] (Optional) `✕` / `✓` swipe glyphs in `src/components/CardStack.jsx`
- [ ] (Optional) `--font-*` vars in `src/index.css` + Google Font `<link>` URLs in `index.html`
- [ ] Replace `public/favicon.svg`

### Final checks (run before merging your re-skin)

- [ ] `npm run build` exits 0
- [ ] `npm run lint` exits 0
- [ ] `node scripts/validate-cards.mjs` reports `✅ 22 cards valid`
- [ ] `node scripts/test-store.mjs` reports `12 passed, 0 failed`
- [ ] Play a full run locally and trigger at least one ending

---

Issues and PRs welcome at the upstream repo: <https://github.com/WWStoryMode/boardroom-game>.
