# DEVLOG — Building Boardroom with an AI Collaborator

A session log written for anyone using an AI coding agent to build their own game. The patterns matter more than the code.

---

## 1. Start from a brief, not from code

Boardroom existed on paper before it existed in any editor — a design spec describing the concept, mechanics, four meters, schema, and visual direction, plus a card deck with prose for an 18-card prototype. The brief was specific enough that the AI could plan the build without inventing what the game should be.

Before the first line of code, we asked the AI to read both documents and produce a written implementation plan. That plan surfaced four ambiguities the spec hadn't decided. Rather than letting the AI guess, each was resolved with a quick multiple-choice picker:

- Direction semantics — does left mean "yes" or "no"? Decision: add an explicit `direction` field so each card could self-describe.
- Public or private repo? Public.
- Org name? Set on the spot.
- Build order? Followed the spec's recommendation.

This is the cheapest design discussion you can have with an AI: lock the genuinely open questions before any code lands. Two minutes of multiple-choice saves an hour of refactor.

---

## 2. Set the workflow rules early

Two ground rules emerged in the first hour and held the entire session.

**Phased work, explicit stops.** "Do this phase, stop, wait for me to say carry on." No bundling. After each phase the AI would report what shipped and pause. The preference was saved as memory, so future sessions inherit it automatically.

**Branch per task, PR closes the task.** Right after the initial setup: *"From now on, every modification starts as a short-lived branch. Test in the branch. PR to main. Never commit to main directly. Each phase gets a test plan."* Holding to that rule across the whole session meant `main` was always merge-ready, every meaningful change had a review surface, and the project never accumulated half-finished state.

If you only adopt one thing from this DEVLOG, adopt these two rules.

---

## 3. The build was five PRs, with conversation between

The game came together as five sequential phases — deps cleanup, card data + validator, game state store, UI components, polish — each one its own branch, headless tests, and PR.

Two moments inside the build are worth calling out because they show the conversation, not just the code:

- **The validator caught a missing card.** Phase 2 included a validation script that checked every bomb reference resolved. It immediately found that one card planted a bomb whose target card didn't exist. The AI surfaced the issue and asked: draft the missing card, or remove the reference? We chose to draft it, and the missing card got written in conversation as a deny-and-discredit follow-up. The validator script kept paying us back for the rest of the session.

- **"Pin the card" feedback.** After Phase 4 produced a playable game, a single sentence — *"The UI looks good, but pin the card so it keeps in position and only leans when dragged"* — drove a small but specific refactor: removing the y-axis entrance and exit animations from the card. A spec can't predict feel; only play can.

---

## 4. Bugs found by playing, not by tests

After deploying to Vercel and playing on iPhone, two real-world issues surfaced:
1. Choice labels slid off the edges of the screen during drag.
2. The "Public Image" meter clipped on narrow viewports.

Each became its own PR. The pattern: describe what you saw, the AI proposes two or three concrete fix options with trade-offs, you pick one, AI ships it. Direct hands-on play surfaces things automated tests never will. Budget time for it.

---

## 5. Evolving the project past v1

After the prototype was playable, the project went through three follow-on rounds — a rename for trademark caution, a GitHub repo rename, and an organization transfer. Each round followed the same shape:

1. You propose the change in a sentence.
2. The AI lists the moving pieces and trade-offs (what breaks, what auto-redirects, what needs a manual remote update).
3. You pick specifics (e.g. "suggest five candidate names" → "use this one" → "for the repo name, something different" → "this one").
4. AI executes.

These are the actions where a hands-off AI can do quiet damage. The "propose → list options → confirm → execute" loop is the safety mechanism.

---

## 6. Document friction, then decide what to fix

For forkability we deliberately did the slow thing.

**Round one: write the guide, document the friction.** A `FORKING.md` cataloged every place a re-skinner would need to edit, and honestly listed the friction — duplicated character objects, hardcoded UI strings, the meter-id rename cascade. No code changed yet.

**Round two: refactor only after the friction was named.** A few days of reading the doc made it obvious which friction was worth fixing. The whole customization surface collapsed into two files — one markdown file for text, one CSS file for visuals. JSON and YAML were both ruled out as "too punctuation-heavy for non-programmers" — markdown + CSS won because they were already familiar to the target audience (writers, designers).

Writing the friction down before fixing it is slower in the moment but cheaper in the long run. You stop refactoring things that weren't actually problems.

---

## 7. Empirical iteration with AI builders

The most useful pattern of the whole session: **don't ship a prompt without testing it on real builders.**

The Level 2 doc — a reference prompt for forkers who want to rebuild the game on a different stack via Replit, v0, Bolt, etc. — went through two distinct versions:

- **v1** was drafted from the spec and pushed to a branch.
- Tested on **Replit Agent** — strong one-shot fidelity, but only 15 cards (the bomb mechanic barely showed).
- Tested on **v0.app** — playable game, but it defaulted to Next.js + Tailwind, reinvented the content schema, and silently dropped bombs and quarterlies.
- The gap between v1's hypothesis and v0's reality drove a strategic discussion: fight v0's defaults, accept the divergence honestly, or write a separate prompt variant?
- Decision: accept the divergence and reframe the prompt to be future-proof. Two new requirements landed that wouldn't have come from theory alone — instruct the AI builder to **show its plan to the human and wait for confirmation before writing code**, and frame the prompt for both "faithful rebuild" and "creative fork" modes.
- **v2** landed on the same branch as a follow-up commit, then opened as a single PR closing the task.

If your AI-built game has a "share this with other builders" goal, drafting a prompt is the easy part. Validating that the prompt actually works on real builders is what makes it useful. Expect to iterate.

---

## 8. Patterns to take with you

- **Have a brief.** A design spec + sample content beats a chat conversation as a starting point.
- **Resolve ambiguity early via multiple-choice.** Don't let the AI guess on undecided design questions.
- **Branch per task. PR closes the task.** Not per commit. Multiple commits accumulate on a branch; the PR ships the whole thing.
- **Phase the work. Stop between phases.** Make the AI report what shipped and wait. This catches direction drift before it accumulates.
- **Play your own game.** Automated tests find code bugs. Hands-on play finds design and feel bugs.
- **Propose → options → confirm → execute** for any action that's visible to others (renames, transfers, PRs, deletions).
- **Document friction before fixing it.** Some friction isn't worth a refactor. Reading the doc tells you which.
- **Test prompts on the builders you're targeting.** AI builders have personalities. Drafting from theory is half the work; empirical iteration is the other half.

---

*This DEVLOG accompanies [README.md](./README.md) (what the game is), [FORKING.md](./FORKING.md) (re-skinning it), and [REFERENCE_PROMPT.md](./REFERENCE_PROMPT.md) (rebuilding it with an AI builder).*
