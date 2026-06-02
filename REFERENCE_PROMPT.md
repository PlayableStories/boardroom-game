# Reference Prompt — Build a Reigns-style Game with AI

This is the **Level 2** path for forkers. Use it two ways:

- **Faithful rebuild** — recreate Boardroom on a different platform / stack.
- **Creative fork** — use the prompt as a template and change the title, theme, meters, characters, and card content during generation. Same mechanics, your world.

If you only want to swap text and visuals on an existing copy of this repo, [FORKING.md](./FORKING.md) (Level 1) is faster.

## When to use Level 2

Choose Level 2 if you want any of:

- A different stack (Next.js, Vue, Svelte, native mobile, whatever's current at the time you read this)
- Substantially different mechanics (different meter count, new card types, multiplayer, persistence)
- To re-theme the game during generation (creative fork) rather than after
- A clean codebase without inheriting our git history

Otherwise, Level 1 is the cheaper path.

## How to use this document

Paste the prompt below into your AI builder of choice. It's self-contained — the builder doesn't need to crawl this repo, though it can if it supports URL references (the link is at the bottom of the prompt).

The prompt's last section asks the AI to **present a checklist back to you** (title, theme, meters, mechanics, card count) and wait for your confirmation before writing code. Use that moment to adjust the theme if you're doing a creative fork.

---

## The prompt

````markdown
You will build a Reigns-style swipe-card game as a single-page web app. The reference theme is "Boardroom" — corporate satire where the player is a CEO making decisions — but the human pasting this prompt may want a different theme (medieval kingdom, school principal, starship captain, etc.). Confirm the theme with them before you start (see "Confirmation before you build" at the end).

Each card is a dilemma. The player swipes left or right. Each choice shifts four resource meters. If any meter hits 0 or 100, the game ends with one of eight thematic endings. If the player survives all cards, a ninth "deck exhaust" ending fires.

## Reference stack (what we tested with — substitute freely)

This is the stack the reference implementation uses. If your builder is more comfortable with a different stack, substitute it — preserve the **required mechanics** (next section) and the **two-file editable architecture** (later section), not the specific framework versions.

- React 19 (Vite scaffold)
- Zustand for game state
- Framer Motion for swipe gestures (drag-x with a ~120px threshold and a fly-off animation)
- Plain CSS with custom properties (so `theme.css` is the single visual-config file)
- No backend; all data bundled at build time

> If you are an AI reading this and the listed stack is no longer the current standard at the time of reading, substitute the current standard. Preserve only the required mechanics and the two-file editable architecture, not the specific framework versions.

## Required mechanics (must all be present)

The game is not done until all of these are implemented and working:

1. **Four resource meters**, all start at 50, clamp to [0, 100]. Reference ids: `shareholders`, `management`, `staff`, `image` (rename freely for a creative fork; keep four of them).
2. **Swipe gesture** — drag past a horizontal threshold to commit a choice; spring back if below threshold. Works on desktop (mouse drag) and mobile (touch).
3. **Per-choice effects** — every card has a left and right choice; each choice has integer deltas for all four meters.
4. **Bomb mechanic** — a choice can plant a bomb that detonates N cards later, drawing a specific bomb card at that index. The plant + detonation logic must work end-to-end.
5. **Chain mechanic, both paths**:
   - Direction-triggered: a chain card appears on the very next turn after a specific parent card is swiped in a specific direction.
   - Deck-injected: a choice can shuffle a chain card into the remaining deck.
6. **Quarterly cards** — every 4th card drawn is a quarterly (cross-cutting board-level dilemma), assuming any unplayed quarterlies remain.
7. **Eight meter-extreme endings** — one per `(meter, 0|100)` pair. Plus a ninth **deck-exhaust** ending if the player runs out of cards without breaking a meter.
8. **Game-over overlay** — ending name (serif headline) + epitaph (italic) + "You lasted N cards" + Play Again button that resets state.
9. **Flavor text** — each swipe shows a brief one-line outcome under the card stack for ~2.5s, then fades.

Card draw priority after every swipe: pending direction-triggered chain → due bomb → quarterly (every 4th turn) → next from shuffled base deck.

## Card types
- `character` — normal deck card; only these get shuffled into the base deck.
- `bomb` — only enters via a `plant_bomb` trigger from another card; never in the base deck.
- `chain` — enters via either `chainTrigger` (direction-triggered follow-up to a specific parent card) OR via `unlock_chain` (shuffled into the deck on a specific swipe choice).
- `quarterly` — auto-drawn every 4th turn; cross-cutting board-level dilemmas.

## Two-file customization (this is the key design)

All player-facing content + visuals live in **two files** at the top of the source tree. A non-programmer should be able to edit them without touching code:

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

Write a small zero-dependency parser (~200 lines) at `src/lib/parseContent.js` that reads `content.md` (via Vite's `?raw` import, or your stack's equivalent for bundling a text asset) and returns `{ title, meters, characters, endings, deckExhaust, ui, cards }`. Strict state machine — throw with clear errors on malformed input.

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

If your chosen stack genuinely cannot provide a single CSS-variable file (e.g. you must use a styling system that scatters config), tell the user that the two-file architecture cannot be fully preserved on this stack and ask whether to proceed with a single-file equivalent in your stack's idiom.

## Aesthetic (default theme)

Dark corporate satire. Dark page background, cream card surface, serif headlines (Playfair Display), monospace meter labels (DM Mono). Card has a drop shadow and rotates ±18° on drag. Choice labels (one centered on each side at the bottom of the card) fade in as the player tilts past 20px. Meter bars sit at the top of the screen with the icon, name, value, and a delta-preview chip that shows the upcoming effect during a drag.

For a creative fork, swap the aesthetic to match the chosen theme — the structural rules (single `theme.css`, palette + accents + character-avatar CSS variables, fonts) stay the same.

## Validation script

Write `scripts/validate-content.mjs` that:
- Parses `content.md`
- Checks all 4 meters present, all 8 meter-extreme endings + deck_exhaust present
- Every card's Character ref resolves to the roster
- Every Plants-bomb / Unlocks-chain / Chain-parent ref resolves to an existing card of the correct type
- Every character has a matching `--char-<id>` line in `theme.css`

## Starter content

Seed `src/content.md` with:
- The agreed title (Boardroom by default, or whatever the user picked in the confirmation step)
- The agreed four meters (with their icons and display names)
- At least **6** characters
- At least **20** cards covering at least 3 thematic arcs, **including at least 3 bomb cards and 2 chain cards** (one direction-triggered, one unlock-injected) so the bomb / chain / quarterly mechanics are visible in normal play. At least 2 quarterly cards.
- All 8 meter-extreme endings + `deck_exhaust`
- The UI strings (`playAgain`, `youLastedSingular`, `youLastedPlural`, `leftGlyph`, `rightGlyph`)

Seed `src/theme.css` with the palette and font variables above (or theme-appropriate equivalents).

## Done definition

- The dev server opens a playable game in the browser
- Swipe works on desktop (mouse drag) and mobile (touch)
- Every required mechanic from the "Required mechanics" section is observable in a single playthrough
- Triggering an ending shows the overlay with Play Again, and Play Again resets to a fresh deck
- The validation script passes
- Editing `content.md` or `theme.css` and saving hot-reloads the running game

## Confirmation before you build

Before writing code, present the following checklist to the user as your reply and **wait for confirmation or changes**:

```
Here's the game I'll build. Tell me which to change.

- Title: <Boardroom or the user-requested theme title>
- Setting / tone: <e.g. corporate satire — change if the user wants a different theme>
- Four meters: <e.g. shareholders / management / staff / image — rename for a creative fork>
- Card count: at least 20 (≥3 bombs, ≥2 chains, ≥2 quarterlies)
- Stack I plan to use: <state your stack — React+Vite or your platform's default>
- Two-file architecture: src/content.md (text) + src/theme.css (visuals) — confirm
- Required mechanics I will implement:
  - 4 meters with swipe-driven deltas
  - Bomb plant + delayed detonation
  - Chain via direction-trigger AND chain via deck-injection
  - Quarterly cards every 4th turn
  - 8 meter-extreme endings + deck-exhaust ending
  - Game-over overlay with Play Again
  - Flavor text after each swipe
- Aesthetic: <state your visual direction>

Confirm or tell me what to change before I start.
```

Only proceed when the user confirms.

---

Structural reference (if your builder can browse repos): https://github.com/PlayableStories/boardroom-game
````

---

## Platform notes

**These observations are a snapshot from when we tested. Builder defaults shift fast — if your builder behaves differently from this table, trust the builder, not the table.**

| Builder | First tested | What we observed | Suggested approach |
|---|---|---|---|
| Replit Agent | 2026-06 | High fidelity to the reference stack and the two-file architecture. ~15 cards on first generation. | Paste the prompt verbatim; expect close-to-spec output. |
| Bolt.new | — | Likely high fidelity (same React + Vite ecosystem as Replit). | Paste the prompt verbatim. |
| v0.app (formerly v0.dev) | 2026-06 | Playable game but defaults to Next.js + Tailwind + shadcn; reinvents the content schema. ~30 cards. | Use the prompt; the AI's confirmation step is your chance to push back on stack and schema choices. Accept that the two-file architecture may end up Tailwind-flavored. |
| Lovable.dev | — | Expected similar to v0 (Tailwind ecosystem default). | As with v0. |
| Cursor / Claude Code | — | The structural-reference URL at the bottom of the prompt is most useful here — they can browse the existing repo as well as read the prompt. | Paste prompt + let them clone the reference. |

If you're using a builder we haven't tested, **add what you observed** to this table via PR.

## After generation

Once your builder produces a playable game, sanity-check it:

1. Walk through the AI's pre-build confirmation reply and make sure every required mechanic is on its list. If something's missing, say so before it starts.
2. Run the validation script and confirm it passes.
3. Play a full run; trigger at least one ending; click Play Again.
4. Edit a hex in `theme.css` and a flavor line in `content.md`; confirm both hot-reload.
5. Customize the content and theme to your story.

If any of these fail, paste the failure back into the same chat with your builder — they usually fix it in a follow-up turn.

---

## Improvements welcome

The prompt evolves as we learn what builders do well and where they stumble. If you tested it on a builder not in the table, or discovered a refinement that landed reliably, open a PR.

Issues and PRs welcome at the upstream repo: <https://github.com/PlayableStories/boardroom-game>.
