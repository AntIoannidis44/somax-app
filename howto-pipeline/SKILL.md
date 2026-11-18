---
name: exercise-howto-images
description: Generate, check and finish Somax exercise how-to images (2-panel start/end, red/orange muscle tint, Gemini gemini-3-pro-image with the app's base character). Load before generating, fixing, reviewing or costing any exercise how-to image.
---

# Exercise how-to images

Full rulebook: `exercise-howto/concepts/GEN_BRIEF.md` (v2). Read it first, every time. Lessons log: `exercise-howto/concepts/LEARNINGS.md`, read before starting and append after every rejection.

Non-negotiables (owner's rules):
- **One agent, sequential.** Never split generation across parallel workers. Quality and cost over speed.
- **Spec before spend.** Every item gets a verified entry in `specs_v2.json` (canonical name, camera preset, joint-level panels, delta, paintOn/doNotPaint, credible muscles) before any API call. Wrong muscle data is fixed, never drawn.
- **Max 3 calls per item**: render, then up to 2 edit-fixes (`gen_v2.py fix`). Then park it with the reason.
- Badges, arrow, divider and canvas size are drawn by `postprocess.py`, never by the model.
- Check every render at full size with Read against the GEN_BRIEF checklist. Never trust "ok" from the API or a subagent's claim.
- Gender: bodyweight / stretch / mobility / Pilates / yoga = female render; all else = male. User-facing labels say Masculine/Feminine.
- One image per genuinely distinct equipment+movement; obvious variants (bench/chair/step) share. Muscle pattern is not a visual grouping.
- Spend cap is set by the owner per run (`HARD_STOP` in `gen_v2.py`). Give a cost figure before going past the owner's balance. $0.134 USD per 2K call (Batch API $0.067 but reports of over-billing; test small first).
- Output only to `exercise-howto/images/_pending/`. Promotion to Supabase / manifest / app lookup happens after the coordinator's own review. No push, TestFlight or commit unless asked.

- 2026-11-18 owner decision: the v2 run goes through `gen_batch.py` (Batch API, half price), every image drawn as TWO takes in the same batch (keep the one that passes review), hard budget AUD 60 for the whole run enforced in the script (pessimistic 1.55 AUD/USD). A small edit-fix batch only for items where both takes fail, inside the same budget.

Run log to track yield: `cost_log_v2.json` + `results_v2.json`. Target: at most ~1.3 calls per accepted image.
