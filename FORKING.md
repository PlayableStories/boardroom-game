# Forking Boardroom

Boardroom is a small, opinionated, Reigns-style swipe card game. This document is for **forkers who want to re-skin it** — keep the mechanics, swap the theme.

Everything player-facing lives in **two files**:

| File | What's in it | Who edits it |
|---|---|---|
| **`src/content.md`** | All text: title, meter names, characters, 22 cards, 9 endings, UI strings | Writers, designers, game designers |
| **`src/theme.css`** | All visuals: palette, meter accent colors, character avatar colors, fonts | Designers, themers |

Both are plain text. No JSON braces, no JavaScript. The dev server hot-reloads on save.

If you instead want to **rebuild from scratch with AI assistance** using this repo as a structural reference, that's a separate path (Level 2) — see [REFERENCE_PROMPT.md](./REFERENCE_PROMPT.md) for a ready-to-paste prompt and platform notes.

## Workflow

```bash
git clone <your fork>
cd boardroom-game
npm install
npm run dev          # localhost:5173, hot-reload
# Edit src/content.md and/or src/theme.css
npm run build        # production build sanity check
node scripts/validate-content.mjs   # checks content stays internally consistent
```

---

## `src/content.md` — the text

One file. Sections marked by `#` headings. Edit values in place, save, hot-reload.

### Sections

```markdown
# Title

Boardroom              ← change to your game's title

# Meters

| ID | Icon | Name |       ← four meters; rename `Name` (the player-visible label)
|---|---|---|              and `Icon` (any emoji). Don't change `ID`s.
| shareholders | 💰 | Shareholders |
| management   | 🏢 | Management   |
| staff        | 😊 | Staff        |
| image        | 🌍 | Public Image |

# Characters

| ID | Name | Role | Initials |    ← character roster. One row per character.
|---|---|---|---|                     The `ID` is referenced by cards below.
| the-chair | The Chair | Board Representative | CH |
| the-hr-director | The HR Director | People Operations | HR |
| ... 11 rows total

# Endings

## shareholders_0 — Hostile Takeover     ← `<meterId>_<0 or 100>` then em-dash
                                            and the ending name.
The board accepted the acquisition       ← prose below is the epitaph.
offer. You were not part of the deal.

## shareholders_100 — Bubble Burst
...

## deck_exhaust — Out of Crises          ← the 9th ending: survived all cards.
You ran out of cards. The world ran
out of patience.

# UI

| Key | Text |
|---|---|
| playAgain          | Play Again         |
| youLastedSingular  | You lasted 1 card. |
| youLastedPlural    | You lasted {n} cards. |
| leftGlyph          | ✕                  |
| rightGlyph         | ✓                  |

# Cards

## bro-001                              ← card id (must be unique)

- **Type**: character                   ← character | bomb | chain | quarterly
- **Arc**: bro_culture                  ← thematic tag, no game logic
- **Character**: the-hr-director        ← references a row in `# Characters`

> An engineer has filed a harassment    ← prompt shown to the player.
> complaint against her team lead...      blockquote (`>`), can be multiple lines

### Left → Approve the transfer         ← left choice label
- shareholders: +5                      ← effect on each meter
- management: 0
- staff: -15
- image: 0
- Plants bomb: bro-bomb-001 after 8 cards   ← optional: triggers a delayed bomb

### Right → Investigate properly        ← right choice label
- shareholders: -8
- management: 0
- staff: +12
- image: +10

*The transfer was approved. She moved   ← flavor (italic) shown briefly
teams. He got a performance bonus.*       after the swipe.
```

### Card format reference

Every card has:
- `## <card-id>` — heading 2 with a unique id
- `- **Type**: <type>` — one of `character`, `bomb`, `chain`, `quarterly`
- `- **Arc**: <arc-tag>` — thematic grouping (no game logic)
- `- **Character**: <character-id>` — references the Character roster
- `> <prompt>` — the card text shown to the player
- `### Left → <label>` and `### Right → <label>` — both choices with effects
- `*<flavor>*` — italic flavor shown after the swipe

Optional fields:
- `- **Chain parent**: <card-id>` — for chain cards: which card precedes them
- `- **Chain trigger**: <left|right>` — for chain cards: which swipe direction triggers them
- `- Plants bomb: <card-id> after <N> cards` — schedules a bomb to detonate N cards later
- `- Unlocks chain: <card-id>` — shuffles a chain card into the deck

### What you can change freely

- Title, meter names + icons, all ending names + epitaphs, all UI strings
- Every card's prompt text, choice labels, character reference, flavor, arc tag
- Effect numbers (changes difficulty; the game stays valid)
- Add or remove cards (run the validator to make sure references resolve)

### What to leave alone

- Card `Type` field (decides which draw rules apply)
- `Chain parent` / `Chain trigger` / `Plants bomb` / `Unlocks chain` plumbing
- Meter IDs in the `# Meters` table — see Friction §1 below

---

## `src/theme.css` — the visuals

One CSS file. CSS custom properties only. Edit hex values in place.

```css
:root {
  /* ---- Page palette ---- */
  --bg:           #0e0d0b;   /* page background */
  --bg-glow:      #16130d;   /* top radial glow */
  --card:         #f5f0e8;   /* card surface */
  --card-edge:    #e3dccd;   /* card bottom gradient edge */
  --ink:          #1a1614;   /* text on cards */
  --ink-on-dark:  #f5f0e8;   /* text on dark background */
  --muted:        #8a847b;   /* secondary text */
  --muted-deep:   #5a544c;   /* tertiary text */

  /* ---- Meter accent colors ----
   * Variable name must match the meter `id` from content.md.
   */
  --accent-shareholders: #d4a534;
  --accent-management:   #c94c4c;
  --accent-staff:        #4ca89a;
  --accent-image:        #4c7ac9;

  /* ---- Character avatar colors ----
   * Variable name must match the character `id` from content.md
   * (prefix `--char-` + the slug id).
   */
  --char-the-chair:               #c9a84c;
  --char-the-hr-director:         #4ca89a;
  --char-the-journalist:          #c94c4c;
  /* ... one per character ... */

  /* ---- Fonts ---- */
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-mono:  'DM Mono', ui-monospace, Consolas, monospace;
}
```

### What you can change freely

- Any hex color
- Font family names (also update the `<link>` tags in `index.html` so the browser downloads the new face — see below)

### Coupling to content.md

Three sets of CSS variables must stay in sync with `content.md`:

| Pattern | Drives | Must match |
|---|---|---|
| `--accent-<meter-id>` | Meter bar fill, swipe direction tint | A row in `# Meters` |
| `--char-<character-id>` | Character avatar circle | A row in `# Characters` |

The validator (`scripts/validate-content.mjs`) checks that every meter and character has a matching CSS variable. If you add a character to `content.md`, add `--char-<their-id>: #hex;` to `theme.css`.

### Fonts

Swapping the font family is a two-file edit:

1. Replace the `--font-serif` / `--font-mono` value in `theme.css`.
2. Replace the matching Google Font `<link>` URLs in `index.html` (so the browser downloads the new family).

---

## Validation

Run these four checks before committing your re-skin:

```bash
npm run build                        # production build still works
npm run lint                         # source still passes lint
node scripts/validate-content.mjs    # content.md is well-formed; cross-refs resolve
node scripts/test-store.mjs          # game mechanics still pass (12 tests)
node scripts/test-ui-logic.mjs       # meter zones + delta formatting (7 tests)
```

The content validator catches:
- Malformed `content.md` structure (missing sections, bad headings)
- Card character references that don't resolve
- Bomb / chain / unlock references that don't resolve
- Missing meter or character CSS variables in `theme.css`
- Missing endings (you must have all 8 `meterId_0` / `meterId_100` + `deck_exhaust`)

---

## Known friction

The earlier version of this guide listed five friction points. The two-file refactor resolved character duplication and hardcoded UI strings. What remains:

1. **Renaming a meter id is a cascade** — though smaller than before. The four lowercase ids (`shareholders`, `management`, `staff`, `image`) appear in:
   - `content.md` — `# Meters` table + every card's effect bullets (~176 occurrences across 22 cards)
   - `content.md` — the 8 ending headings (`shareholders_0`, etc.)
   - `theme.css` — the `--accent-<id>` variables
   - Safe approach: pick a new lowercase id, find-and-replace exact-string repo-wide, then run `node scripts/validate-content.mjs` to catch stragglers.

2. **The quarterly rhythm is hardcoded.** "Every fourth card draws a quarterly" lives as `nextIndex % 4 === 0` in `src/store/gameStore.js`. Changing the cadence is a one-character JS edit — Level 2.

3. **Meter zone thresholds are hardcoded.** Warning at 20/80 and danger at 10/90 live in `meterZone` at `src/lib/meters.js`. Adjusting these is a JS edit — Level 2.

4. **Card schema is enforced by the validator.** Editing existing field values is safe. Adding *new* fields or renaming the shape will trip the validator and you'll need to update both the parser and the validator — Level 2.

5. **Favicon is a separate file.** Replace `public/favicon.svg` (referenced from `index.html` line 5). Not part of `theme.css` since it's a binary asset.

---

## Re-skin checklist

A copy-paste checklist for your fork's PR description.

### Text re-skin (`src/content.md`)
- [ ] Title
- [ ] Four meter names + icons (leave ids alone unless doing the full rename cascade)
- [ ] Character roster names + roles + initials (leave ids alone)
- [ ] All 22 card prompts, labels, flavor, character references
- [ ] All 8 endings + `deck_exhaust`
- [ ] UI strings (`playAgain`, `youLasted*`, glyphs)

### Visual re-skin (`src/theme.css`)
- [ ] Page palette (`--bg`, `--card`, `--ink`, etc.)
- [ ] Four meter accent colors
- [ ] Character avatar colors (one `--char-<id>` per roster entry)
- [ ] (Optional) Fonts — update `--font-*` AND the `<link>` URLs in `index.html`

### Other
- [ ] (Optional) Replace `public/favicon.svg`
- [ ] (Optional) `name` in `package.json` — cosmetic, not visible to players
- [ ] Run all 5 validation commands above; all green

---

Issues and PRs welcome at the upstream repo: <https://github.com/PlayableStories/boardroom-game>.
