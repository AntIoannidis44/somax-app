# Onboarding redesign (Nov 2026)

Source for the approved onboarding design canvas:
https://claude.ai/artifact/CUtAFQSn8MHU4Hnaw7xrfj

`project/` holds the canvas index (`canvas.json`) and one `.dc.html` per
artboard. `Main.dc.html` is the clickable flow; the other boards import it
at a given step (Path A: Build my plan, Path B: Quick start).
Built in the app as `src/components/onboarding/v2/OnboardingV2.tsx`.
