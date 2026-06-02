# Boardroom

> Swipe to lead. Watch your empire collapse from a decision you made ten cards ago.

A Reigns-style swipe-card game about the impossible balancing act of corporate leadership. You are the CEO. Advisors present dilemmas. Each choice nudges four resource meters. Push any of them too high or too low, and the game ends — with one of nine named outcomes, each with its own epitaph.

A single playthrough takes 5–10 minutes. Plays on desktop (mouse drag) and mobile (touch).

---

## Quickstart

```bash
git clone https://github.com/PlayableStories/boardroom-game.git
cd boardroom-game
npm install
npm run dev          # localhost:5173
npm run build        # production build
```

---

## The Game

Each card is a corporate dilemma — a complaint, a leak, a board pressure, a quarterly call. You swipe left or right to commit to one of two responses. Every choice shifts four resource meters:

| Meter | What it represents |
|---|---|
| 💰 **Shareholders** | Investor confidence |
| 🏢 **Management** | Executive cohesion |
| 😊 **Staff** | Employee morale |
| 🌍 **Public Image** | Reputation in the world |

All meters start at 50 and clamp to [0, 100]. If any of them hits 0 or 100, the run ends with a named ending: Hostile Takeover, Board Coup, Great Resignation, Overexposure, PR Collapse — eight in total, one per `(meter, extreme)` pair. Survive the whole deck and you get a ninth ending, *Out of Crises*: "You ran out of cards. The world ran out of patience."

## The Design

Four mechanics carry the game:

- **Four meters, only failure modes 0 and 100.** Too little OR too much of any constituency kills you. The original Reigns insight, applied to the C-suite.

- **Card archetypes with different draw rules.** `character` cards form the shuffled base deck. `bomb` cards plant on one swipe and detonate N cards later — a decision that comes back to haunt you. `chain` cards either trigger on the next turn (direction-triggered follow-ups) or shuffle into the deck (unlock-injected). `quarterly` cards interrupt every 4th turn for board-level dilemmas.

- **Draw priority:** pending chain → due bomb → quarterly → next shuffled card. Bombs and chains override the deck so the game has memory.

- **Two-file customization.** All player-facing text lives in **one** markdown file (`src/content.md`); all visuals live in **one** CSS file (`src/theme.css`). Writers and designers can re-skin the game without touching JavaScript. This is the load-bearing design choice — it splits the project into a clean engine and an editable surface.

The reference deck is 22 cards (10 `character` / 7 `bomb` / 3 `chain` / 2 `quarterly`) drawn from 11 archetypal characters (The Chair, The HR Director, The Journalist, The CFO, The Legal Counsel, The Whistleblower, and others). A validation script (`scripts/validate-content.mjs`) enforces internal consistency: every bomb reference resolves, every character is in the roster, every meter id has a matching CSS variable.

## The Concept

Dark satire about the impossible balancing act of corporate leadership. The player makes decisions that feel reasonable in the moment — quiet settlement, performance bonus, strategic pivot, statement of denial — and then watches their carefully managed empire collapse from a planted bomb they forgot about.

The aim: feel clever, then feel guilty, then watch your empire collapse from a decision you made ten cards ago.

The reference arcs draw from real-world scandals — bro culture, fake-it-til-you-make-it valuations, safety shortcuts, defeat devices, productivity machines, the cult of growth — without naming specific companies. Characters are archetypes rather than real people. Ending epitaphs are darkly funny one-liners: *"The hashtag trended for nine days. The advertisers left on day two."*

---

## Fork it

Boardroom isn't just a game — it's a template for satirical leadership simulators. Two paths to make it yours:

### Level 1 — Re-skin (text and visuals)
Keep the mechanics, swap the theme. A medieval kingdom, a school principal, a starship captain. Edit two files: `src/content.md` for all text, `src/theme.css` for all visuals. No JavaScript required.

→ See **[FORKING.md](./FORKING.md)** for the full re-skin guide.

### Level 2 — Rebuild from scratch with AI
Recreate the game on a different stack — Next.js, Vue, Svelte, native mobile, whatever — using an AI code builder (Replit Agent, Bolt.new, Lovable, v0.app, Cursor, Claude Code). The reference prompt is self-contained and asks the AI to confirm with you before writing code.

→ See **[REFERENCE_PROMPT.md](./REFERENCE_PROMPT.md)** for the prompt and platform notes.

---

## Tech stack

- **React 19** (Vite scaffold)
- **Zustand** — game state
- **Framer Motion** — swipe gestures (drag-x with a 120px threshold and fly-off animation)
- **Plain CSS** with custom properties (no Tailwind, no UI library)
- **No backend** — all data bundled at build time
- **Fonts:** Playfair Display (serif) + DM Mono (mono)

The two-file editable architecture (`src/content.md` + `src/theme.css`) is the project's defining design choice. Both are parsed at build time; the dev server hot-reloads on save.

## Validation

```bash
node scripts/validate-content.mjs    # content.md schema + cross-refs against theme.css
node scripts/test-store.mjs          # 12 game-mechanic tests
node scripts/test-ui-logic.mjs       # 7 meter-zone + delta-formatting tests
```

All three should report green before a fork or refactor ships.

---

## Repository structure

```
boardroom-game/
├── README.md                  # you are here
├── FORKING.md                 # Level 1 (re-skin) guide
├── REFERENCE_PROMPT.md        # Level 2 (AI rebuild) prompt
├── boardroom-spec.md          # original design spec
├── boardroom-cards.md         # original card deck reference
├── index.html
├── package.json
├── public/
│   └── favicon.svg
├── src/
│   ├── content.md             # 📝 all player text lives here
│   ├── theme.css              # 🎨 all visuals live here
│   ├── App.jsx, App.css
│   ├── index.css, main.jsx
│   ├── components/            # CardStack, MetersRow, GameOver, etc.
│   ├── lib/                   # parseContent, content loader, meters
│   └── store/                 # Zustand game store
└── scripts/
    ├── validate-content.mjs
    ├── test-store.mjs
    └── test-ui-logic.mjs
```

---

## Contributing

Issues and PRs welcome. The two-file architecture means most contributions land in `src/content.md` (new cards, new endings, new characters) or `src/theme.css` (visual variants) — no game-engine knowledge required.
