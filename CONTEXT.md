# Somax — project context

Handover document capturing everything decided and built so far, so any new session (or person) can pick this up cleanly.

Last updated: 2026-09-16

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
| Hosting | GitHub Pages via GitHub Actions |
| Persistence (beta) | `localStorage` — no backend yet |

### Assets for the character upgrade
| Need | Choice | Cost |
|---|---|---|
| Customisable athlete model | **Ready Player Me** (GLB output, standard skeleton, Avatar API) | Free tier |
| Animations | **Mixamo** (idle, run, flex) + RPM animation library | Free (Adobe ID) |
| Lighting / environment | **Poly Haven** HDRIs (CC0) | Free |

Beta cost: **$0**. Store publishing later: Apple Developer US$99/yr, Google Play US$25 once.

Honest caveat recorded: Ready Player Me gives a polished, game-quality, customisable avatar — a large jump from the primitives — but **not** the photoreal athlete in the reference. That specific look needs a bespoke sculpted model (3D artist, roughly $300–1,500) and is a later upgrade if the beta proves out. Branded wardrobe items (a "Somax jersey" inside RPM's catalogue) are also not on the free tier; the workaround is accessories rendered on top of the model in our own code.

### Planned backend (from the original brief, not yet built)
Supabase (managed Postgres + auth). XP must be **server-authoritative** — the client never decides XP amounts.

---

## 4. This repo

```
somax-app/
├── .github/workflows/deploy.yml   GitHub Pages deploy on push to main
├── src/                            (still Vite starter — port pending)
├── vite.config.ts                  base: '/somax-app/'
└── CONTEXT.md                      this file
```

- Repo: https://github.com/AntIoannidis44/somax-app
- Live URL (once Pages is enabled): https://antioannidis44.github.io/somax-app/
- First commit `ace9481` — scaffold pushed and confirmed on `origin/main`.

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

- **Phase 0 — Scaffold + port.** Repo, build pipeline, Pages deploy *(scaffold done)*. Port the prototype's state, XP engine and all screens from `somax.html` into React components, keeping `localStorage` persistence. Result: the app as it exists today, hosted, with a real build pipeline.
- **Phase 1 — Arena renderer.** The visible quality jump. Load a Ready Player Me athlete GLB, play Mixamo run/idle/flex clips, HDRI environment lighting, reflective floor, glowing platform, contact shadows, bloom + ACES tone mapping, gym backdrop, per-screen camera framing.
- **Phase 2 — Customisation & unlocks.** Rebuild the studio on RPM's Avatar API with our own locker UI and the existing level/streak unlock gating. Persist avatar id; thumbnails via RPM's render API.
- **Phase 3 — Character (cartoon) mode.** Stylised model on the same rig — Subway Surfers-style — with a toon shading pass. More modes later.
- **Phase 4 — Mobile packaging.** Expo wrapper per the original brief; R3F runs on Expo via `expo-gl`.

Full scope detail: `../SCOPE-3d-character-upgrade.md`

---

## 6. Open items

**Blocking Phase 1:**
- [ ] Ready Player Me application created at https://studio.readyplayer.me — need **subdomain** and **application ID**, Avatar API enabled
- [ ] Mixamo access (free Adobe ID) at https://www.mixamo.com

**Should confirm:**
- [ ] GitHub Pages source set to **GitHub Actions** (Settings → Pages) so the deploy workflow publishes
- [ ] Claude Code extension installed in VS Code
- [ ] `code` command added to PATH (VS Code → `Cmd+Shift+P` → "Shell Command: Install 'code' command in PATH")
- [ ] Name confirmed as "Somax"
- [ ] Free-asset path for the beta, or budget a bespoke model now

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
