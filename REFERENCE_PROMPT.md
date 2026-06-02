# Reference Prompt — Rebuilding Boardroom with AI

This is the **Level 2** path for forkers who want to recreate the game from scratch using an AI code generator (Replit Agent, Bolt.new, Lovable, v0.dev, Cursor, Claude Code, etc.) rather than re-skin the existing repo.

If you only want to swap text and visuals, [FORKING.md](./FORKING.md) (Level 1) is faster and lower risk.

## When to use Level 2

Choose Level 2 if you want any of:

- A different stack (Next.js + Tailwind, Vue, Svelte, native mobile, etc.)
- Substantially different mechanics (different meter count, new card types, multiplayer, persistence)
- To learn the game's design by building rather than reading
- A clean codebase without inheriting our git history

Otherwise, Level 1 is the cheaper path.

## How to use this document

Paste the prompt below into your AI builder of choice. It's self-contained — the builder doesn't need to crawl this repo, though it can if it supports URL references (the link is at the bottom of the prompt).

The prompt is the **first version** of our Level 2 reference. Treat it as a starting point — refine it for your stack, your audience, and your builder's strengths.

---

## The prompt

````markdown
Build a single-page swipe-card game in React (Vite). It's a Reigns-style satire game called "Boardroom" — the player is a CEO making decisions. Each card is a dilemma; swipe left or right to choose; each choice shifts four resource meters. If any meter hits 0 or 100, the game ends with one of eight thematic endings. If the player survives all cards, a ninth "deck exhaust" ending fires.

## Stack
- React 19 (Vite scaffold)
- Zustand for game state
- Framer Motion for swipe gestures (drag-x with a 120px threshold and fly-off animation)
- Plain CSS with custom properties — no Tailwind, no UI library
- No backend; all data bundled at build time

## Core mechanics
1. Four resource meters, all start at 50, clamp to [0, 100]:
   - `shareholders`, `management`, `staff`, `image`
2. Each card has a character (avatar circle + name + role), a prompt, a left choice, a right choice, and a brief "flavor" line that appears under the card stack after the swipe.
3. Each choice has: a short label (e.g. "Approve" / "Investigate"), integer deltas for all four meters, and optional plumbing (plant a bomb that detonates N cards later, or unlock a chain card that gets shuffled into the deck).
4. Card draw priority after every swipe: pending direction-triggered chain cards → bombs whose detonation index matches the current card index → quarterly cards (every 4th turn) → next card from the shuffled deck.
5. After every swipe: apply effects, check for an ending (any meter at 0 or 100), draw the next card, fade in the flavor text for ~2.5 seconds.
6. Game-over overlay: ending name (serif headline) + epitaph (italic) + "You lasted N cards" + Play Again button.

## Card types
- `character` — normal deck card; only these get shuffled into the base deck.
- `bomb` — only enters via a `plant_bomb` trigger from another card; never in the base deck.
- `chain` — enters either via `chainTrigger` (a direction-triggered follow-up to a specific parent card, appears on the next turn) OR via `unlock_chain` (shuffled into the deck on a specific swipe choice).
- `quarterly` — auto-drawn every 4th turn; cross-cutting board-level dilemmas.

## Two-file customization (this is the key design)

All player-facing content + visuals live in two files at the top of `src/`. Forkers edit these without touching JS:

### `src/content.md` — one markdown file with sections

```
# Title
Boardroom

# Meters
| ID | Icon | Name |
|---|---|---|
| shareholders | 💰 | Shareholders |
| management   | 🏢 | Management |
| staff        | 😊 | Staff |
| image        | 🌍 | Public Image |

# Characters
| ID | Name | Role | Initials |
|---|---|---|---|
| the-chair | The Chair | Board Representative | CH |
| the-hr-director | The HR Director | People Operations | HR |
...

# Endings
## shareholders_0 — Hostile Takeover
The board accepted the acquisition offer. You were not part of the deal.

## shareholders_100 — Bubble Burst
The investigation began on a Tuesday. By Thursday, you were trending.
...

## deck_exhaust — Out of Crises
You ran out of cards. The world ran out of patience.

# UI
| Key | Text |
|---|---|
| playAgain | Play Again |
| youLastedSingular | You lasted 1 card. |
| youLastedPlural | You lasted {n} cards. |
| leftGlyph | ✕ |
| rightGlyph | ✓ |

# Cards

## card-id
- **Type**: character
- **Arc**: thematic_tag
- **Character**: character-id-from-roster

> Card prompt shown to the player.

### Left → Left choice label
- shareholders: -3
- management: +5
- staff: -8
- image: -2
- Plants bomb: bomb-card-id after 5 cards     (optional)

### Right → Right choice label
- shareholders: -1
- management: -2
- staff: +5
- image: +3
- Unlocks chain: chain-card-id                (optional)

*Flavor text shown briefly after the swipe.*
```

Write a small zero-dependency parser (~200 lines) at `src/lib/parseContent.js` that reads `content.md` (via Vite's `?raw` import) and returns `{ title, meters, characters, endings, deckExhaust, ui, cards }`. Strict state machine — throw with clear errors on malformed input.

### `src/theme.css` — one CSS file

```css
:root {
  /* Page palette */
  --bg: #0e0d0b;
  --bg-glow: #16130d;
  --card: #f5f0e8;
  --card-edge: #e3dccd;
  --ink: #1a1614;
  --ink-on-dark: #f5f0e8;
  --muted: #8a847b;
  --muted-deep: #5a544c;

  /* Meter accents — variable name must match the meter id */
  --accent-shareholders: #d4a534;
  --accent-management:   #c94c4c;
  --accent-staff:        #4ca89a;
  --accent-image:        #4c7ac9;

  /* Character avatar colors — variable name must match the character id, prefixed with --char- */
  --char-the-chair: #c9a84c;
  --char-the-hr-director: #4ca89a;
  /* ... one per character ... */

  /* Fonts */
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-mono: 'DM Mono', ui-monospace, Consolas, monospace;
}
```

Components use `var(--accent-${meter.id})` for meter fill and `var(--char-${character.id})` for avatar background.

## Aesthetic
Dark corporate satire. Dark page background, cream card surface, serif headlines (Playfair Display), monospace meter labels (DM Mono). Card has a drop shadow and rotates ±18° on drag. Choice labels (one centered on each side at the bottom of the card) fade in as the player tilts past 20px. Meter bars sit at the top of the screen with the icon, name, value, and a delta-preview chip that shows the upcoming effect during a drag.

## Validation
Write `scripts/validate-content.mjs` that:
- Parses content.md
- Checks all 4 meters present, all 8 meter-extreme endings + deck_exhaust present
- Every card's Character ref resolves to the roster
- Every Plants-bomb / Unlocks-chain / Chain-parent ref resolves to an existing card of the correct type
- Every character has a matching `--char-<id>` line in theme.css

## Starter content
Seed `src/content.md` with: title "Boardroom", the four meters above, ~6 sample characters, ~10 sample cards across 2–3 thematic arcs (e.g. workplace culture, financial fraud, regulatory pressure), all 8 ending epitaphs + deck_exhaust. Seed `src/theme.css` with the palette above.

## Done definition
- `npm run dev` opens a playable game at localhost
- Swipe works on desktop (mouse drag) and mobile (touch)
- Triggering an ending shows the overlay with Play Again
- `node scripts/validate-content.mjs` passes
- Editing `content.md` or `theme.css` and saving hot-reloads the running game

Structural reference (if your builder can browse repos): https://github.com/PlayableStories/boardroom-game
````

---

## Platform notes

| Builder | Fit | Notes |
|---|---|---|
| Replit Agent | Strong | React + Vite native; expect one-shot success. |
| Bolt.new | Strong | Same stack alignment. |
| Lovable.dev | Adapt | Defaults to Tailwind + shadcn. Add "no Tailwind, use plain CSS" if you want to match this repo's stack. |
| v0.dev | Adapt | Optimized for Next.js + shadcn. Tell it React-Vite explicitly or accept the Next.js variant. |
| Cursor / Claude Code | Strong | They handle the structural-reference URL well — point them at the repo. |

## After generation

Once your builder produces a playable game, sanity-check it:

1. Run `node scripts/validate-content.mjs` and confirm it passes.
2. Play a full run, trigger at least one ending, click Play Again.
3. Edit a hex in `theme.css` and a flavor line in `content.md`; confirm both hot-reload.
4. Customize the content and theme to your theme.

If any of these fail, paste the failure back into the same chat with your builder — they usually fix it in a follow-up turn.

---

## Improvements welcome

This is the **first version** of the Level 2 prompt. As we learn what AI builders do well and where they stumble, the prompt will get tighter, the seed content will get richer, and platform-specific variants will land here.

Issues and PRs welcome at the upstream repo: <https://github.com/PlayableStories/boardroom-game>.
