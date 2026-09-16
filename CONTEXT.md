# Somax — project context

Handover document capturing everything decided and built so far, so any new session (or person) can pick this up cleanly.

Last updated: 2026-09-17

---

## 1. What Somax is

A subscription-based **fitness RPG**. Real-world training consistency drives digital progression, competition and community. The differentiator is the link between fitness behaviour and persistent game progression — not any single feature.

Positioning: **Your life is the game. Your fitness is how you level up.**

Core loop: Train → Complete Goals → Earn XP → Level Up → Compete → Unlock Rewards → Repeat.

The beta exists to validate one hypothesis: **does turning fitness consistency into visible game progression make users more likely to consistently complete their fitness goals?**

Full original brief: `../fitness-rpg-claude-code-brief.md`

---

## 2. Where the project stands

### Built: a click-through HTML prototype
A single-file prototype at `../somax.html`, published as a private artifact:
**https://claude.ai/artifact/KzHBXVQ3xuwfHvXr1z7vTE**

It is a complete, working front-end beta — all state is simulated in the browser via `localStorage`, nothing is sent to a server. It contains:

- **Onboarding** — name, age, height, weight, goal, experience, availability, equipment, character creation
- **Home** — full-bleed 3D "arena" with the character, metric rings (steps, calories, active minutes, heart rate), quest card, today's session, daily goals with XP, level path ladder
- **Train** — week strip, program, workout screen, per-exercise completion, session completion
- **Play** — challenges, league leaderboard, achievements
- **Community** — activity feed with cheers
- **Profile** — character card, display-mode toggle, attributes, history, notification settings, feature flags, beta tools (simulate next day, reset demo)
- **Character studio** — 3D character, drag to spin, tap to flex, eight customisation categories (base, skin, hair, hair colour, top, bottom, shoes, extras) with level/streak-gated unlocks
- **XP engine** — level curve, daily XP caps, streaks, achievements, coins (earned at ¼ of XP)

### The problem that triggered the rebuild
The 3D character is generated in code from **three.js primitives** (spheres, cylinders, boxes). Compared to the reference the user supplied — https://ideausher.com/blog/gamified-ai-workout-app-development/ — it reads as a toy, not an athlete.

Gap, explicitly:
- Reference: sculpted photoreal human, muscle definition, real face, real hair, fabric with folds, mid-stride running pose, gym environment, cinematic lighting.
- Current: capsule limbs, sphere joints, two dots for eyes, half-sphere hair, flat-colour "clothing", hinge-swing run cycle, gradient backdrop, basic lighting.

Primitive geometry cannot close that gap. It needs real model files, real animations, environment lighting, and a project that can serve those assets — hence this repo.

---

## 3. Decisions made

### Tech stack (this repo)
| Layer | Choice |
|---|---|
| Build | Vite + React + TypeScript |
| 3D | three.js + React Three Fiber (`@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`) |
| Hosting | Cloudflare Pages (unlimited free bandwidth for static assets) |
| Persistence (beta) | `localStorage` — no backend yet |

### Assets for the character upgrade

**Update 2026-09-17: Ready Player Me is dead.** Netflix acquired RPM (announced Dec 2025) and shut down its entire public platform — Studio dashboard, avatar creator, developer APIs — on January 31, 2026. `studio.readyplayer.me` now returns NXDOMAIN. Researched replacements (MetaPerson/Avatar SDK, Avaturn) are alive but cost $800/month to embed a live per-user avatar creator in an app; only a single sandboxed avatar is free. Decision: skip live per-user avatar-generation APIs entirely.

| Need | Choice | Cost |
|---|---|---|
| Customisable athlete model | **2-4 free/one-time-purchase rigged humanoid GLBs** (CC0, Mixamo-compatible skeleton) + our own wardrobe system in code (already built in `catalog.ts`/`characterBuilder.ts`) | Free / small one-time |
| Animations | **Mixamo** (idle, run, flex) — still alive, some reported reliability flakiness, no shutdown | Free (Adobe ID) |
| Lighting / environment | **Poly Haven** HDRIs (CC0) | Free |

Beta cost: **$0** (or a small one-time asset-pack purchase). Store publishing later: Apple Developer US$99/yr, Google Play US$25 once.

Honest caveat: free/cheap base meshes plus our own wardrobe layer gets a real jump from the primitives, but not the photoreal athlete in the reference. That specific look still needs a bespoke sculpted model (3D artist, roughly $300–1,500) and is a later upgrade if the beta proves out.

### Planned backend (from the original brief, not yet built)
Supabase (managed Postgres + auth). XP must be **server-authoritative** — the client never decides XP amounts.

---

## 4. This repo

```
somax-app/
├── public/models/          Quaternius base characters + animation library (CC0)
├── src/                     ported React app
├── vite.config.ts           no base path — served from domain root
└── CONTEXT.md               this file
```

- Repo: https://github.com/AntIoannidis44/somax-app
- Hosting: **Cloudflare Workers (static assets)** — Cloudflare's current recommended path, superseding classic Pages; same unmetered free bandwidth (switched from GitHub Pages 2026-09-17, relevant given the multi-MB 3D assets this app serves repeatedly). Configured via `wrangler.jsonc` (`assets.directory: ./dist`). GitHub Pages workflow and the `/somax-app/` base path were removed accordingly.
- **Live URL: https://somax-app.antioannidis.workers.dev** — connected via Cloudflare's Git integration (Workers Builds), auto-deploys on every push to `main`. Verified working end-to-end in a headless browser, zero console errors.
- A Cloudflare API token (Account → Workers Scripts → Edit, scoped to this account) is in `.env` as `CLOUDFLARE_API_TOKEN`, enabling direct `wrangler deploy`/API access alongside the auto-deploy-on-push.
- First commit `ace9481` — scaffold pushed and confirmed on `origin/main`.
- Second commit `0c0f7d3` (2026-09-17) — full port of the `somax.html` prototype into React components (onboarding, home, train, play, community, profile, character studio, XP engine, store). Verified working end-to-end in a headless browser.
- Commits `bfacba4`, `1f3cc54` (2026-09-17) — Quaternius base character models and animation library (CC0), replacing the dead Ready Player Me plan.
- Commit `fa1de87` (2026-09-17) — hosting switched to Cloudflare Pages.
- None of the above pushed to `origin` yet.

### Local environment
- Node v24.21.0, npm 11.19.0 — installed and verified
- VS Code installed; project folder opened in it
- Git 2.50.1 (came with macOS)
- `.npmrc` sets `legacy-peer-deps=true` — React Three Fiber pulls optional Expo peer deps that conflict with React 19 otherwise

### Commands
```bash
npm run dev      # local dev server
npm run build    # production build
npm run preview  # preview the build
```

---

## 5. Phases

- **Phase 0 — Scaffold + port.** Done.
- **Phase 1 — Arena renderer.** Real model + animation done; cinematic lighting (HDRI, bloom, backdrop) not started.
- **Phase 2 — Customisation & unlocks.** Mostly done: body builds, skin tones, hair, 2 outfits (Trainer/Ranger) all real and wired up. More outfits/hairstyles are a same-pattern extension, not new architecture.
- **Phase 3 — Character (cartoon) mode.** Not started.
- **Phase 4 — Mobile packaging.** Not started.

RPM is no longer part of this plan (shut down Jan 2026) — see `../SCOPE-3d-character-upgrade.md` for the full, current, up-to-date scope and status. That file is the source of truth for phase detail; this section is a summary only.

---

## 6. Open items

**Should confirm:**
- [ ] Claude Code extension installed in VS Code
- [ ] `code` command added to PATH (VS Code → `Cmd+Shift+P` → "Shell Command: Install 'code' command in PATH")
- [x] Name confirmed as "Somax"
- [x] Hosting live: https://somax-app.antioannidis.workers.dev

**Carried over from the original brief, unresolved:**
- **XP fairness model is underspecified and it's the heart of the product.** Users on different quests need comparable League XP or the leaderboard is meaningless. Needs a concrete normalisation formula (percent of prescribed work completed, capped, per activity category) before leagues are coded.
- **Health data and consent need an actual plan.** In Australia this is sensitive health information under the Privacy Act and the APPs. Storing date of birth, weight and activity means a consent flow, privacy policy, data residency decisions and deletion handling from day one.
- **Champion rewards and supplements carry legal risk.** Discount-as-competition-prize can trigger trade promotion rules; supplement claims need review before shipping. Correctly deferred — just don't let it slip.

---

## 7. Working preferences established

- Don't claim something works without verifying it in a real browser first.
- Be direct about quality gaps rather than describing work in flattering terms.
- Answer questions in chat directly when asked, rather than only acting.
- Prefer one link at a time when walking through setup steps.
