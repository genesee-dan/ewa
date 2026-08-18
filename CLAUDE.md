# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An educational web simulator demonstrating dark patterns used by earned wage access (EWA) apps (DailyPay, Dave, EarnIn, MoneyLion). No real money moves. Built by Genesee Co-op Federal Credit Union.

Live site: **https://ewademo.genesee.coop** (served from `gh-pages` branch)
Game preview: **https://ewademo.genesee.coop/game/**
Videos page: **https://ewademo.genesee.coop/videos.html**

## Commands

```bash
npm run dev        # local dev server
npm run build      # production build to dist/
npm run lint       # ESLint
npm run preview    # preview the dist/ build locally
```

### Deploying to the live site

**Deployment is automatic. Do NOT hand-edit the `gh-pages` branch.**

Every push to `main` triggers the GitHub Actions workflow `.github/workflows/deploy.yml`,
which rebuilds the site and **replaces the entire `gh-pages` tree** (via
`peaceiris/actions-gh-pages`). So:

- To ship a change, merge/push it to `main` — that's the whole deploy step.
- Any file you commit to `gh-pages` by hand (or any subfolder you add there manually)
  **will be wiped on the next push to `main`.** If something needs to live on the
  deployed site permanently, add it to the workflow so it's rebuilt every deploy —
  don't drop it into `gh-pages` directly.
- The workflow builds the root with `VITE_SHOW_GAME=true` (also set in
  `.env.production`), so the live root includes the simulation. Don't remove that flag.

What the workflow publishes:

| Path | Source | Build |
|------|--------|-------|
| `/` (root) | `main` | `VITE_SHOW_GAME=true npm run build` |
| `/previous/` | `claude/ewa-game` branch (frozen pre-accessibility app) | `vite build --base=/previous/` |

To change what's deployed (add a subfolder, change the previous snapshot, etc.),
edit `.github/workflows/deploy.yml`, not the `gh-pages` branch.

`CNAME` (`ewademo.genesee.coop`) is handled by the workflow — never copy it into a subfolder build.

### Preview a subfolder build (e.g. `/game/`)

A subfolder pushed to `gh-pages` by hand is temporary — the next push to `main`
wipes it. For a **permanent** preview URL, add a build step to
`.github/workflows/deploy.yml` (see how `/previous/` is built). For a **throwaway**
local check, build with the right base and serve it locally instead:

```bash
npx vite build --base=/game/
npm run preview   # or: npx vite preview --base=/game/
```

### Regenerating the explainer videos

Requires the Kokoro TTS model at `/tmp/vid/kokoro-en-v0_19/` and Playwright Chromium at `/opt/pw-browsers/`.

```bash
node scripts/tts-kokoro.mjs          # regenerates /tmp/vid/seg{0-6}.wav
node scripts/make-video.mjs          # writes public/explainer.mp4

node scripts/tts-kokoro-loc.mjs      # regenerates /tmp/vid/loc{0-7}.wav
node scripts/make-video-loc.mjs      # writes public/explainer-loc.mp4
```

To fix a single segment (e.g. segment 2), delete the wav first:
```bash
rm /tmp/vid/seg2.wav && node scripts/tts-kokoro.mjs
```

Pronunciation note: APR is spelled `"eh pee ar"` in TTS text so Kokoro reads each letter.

### Video captions / subtitles (i18n)

The player (`src/components/VideoPlayer.jsx`) supports WebVTT caption tracks via a
`tracks` prop; a **CC** button cycles off → each available language, and it defaults
to the app language when a matching track exists. Tracks live in `public/subtitles/`
as `<video>.<lang>.vtt` and are passed in by `VideoScreen` / `VideoLocScreen`.

Generate/refresh them with:

```bash
node scripts/gen-subtitles.mjs   # writes public/subtitles/*.{en,es}.vtt
```

Timings mirror the narration build: if the rendered wavs are in `/tmp/vid` (video
env) the cues are exact; otherwise they're estimated from word count — re-run in the
video env for frame-accurate cues. **To add a subtitle language**, add its segment
array under the matching video key in `scripts/gen-subtitles.mjs`, re-run, and add a
`{ lang, label, src }` entry to the `tracks` prop in the screen.

### Spanish-narrated (dubbed) videos — TODO

Subtitles are the interim for non-English; the plan is a real Spanish **dub** (natural
narration, not captions). The Spanish narration script already exists (the `es`
segment arrays in `scripts/gen-subtitles.mjs`). To produce it, mirror
`tts-kokoro*.mjs` + `make-video*.mjs` with a Spanish Kokoro voice (e.g. the
`kokoro-multi-lang-v1_0` model's `ef_`/`em_` Spanish speakers) and translated on-screen
scene text, writing `public/explainer.es.mp4`; then have `VideoScreen` pick the `.es.mp4`
source when the app language is `es`. This must run in the video-build environment
(needs the Kokoro model + Playwright), not a fresh web session.

## Branch structure

| Branch | Purpose |
|--------|---------|
| `main` | **Production source of truth.** Contains the full app (demo + simulation + accessibility). Every push here auto-deploys to the live site. |
| `claude/ewa-game` | Frozen pre-accessibility snapshot. Served at `/previous/` by the deploy workflow — leave it frozen. |
| `gh-pages` | **Auto-generated by CI from `main` — never edit directly.** Any manual change is overwritten on the next push to `main`. |

**The game branch (`claude/ewa-game`) must never break the original demo path.** The demo and simulation share the same codebase; all game additions are purely additive behind the `gameMode` flag.

## Architecture

### State — `src/context/AppContext.jsx`

Single React context holding all app state:
- `landed` / `gameMode` — controls which flow the user enters (landing → setup → app)
- `profile` — set on onboarding completion or `startGame()`; `null` shows pre-app screens
- `scenario` — generated by `makeScenario(overrides?)` on each run; drives all fake data
- `lastTransfer` — written by `requestTransfer()`; consumed by RealCostScreen and GameResultScreen
- `tipDodgeTaps` (ref) — counts guilt-screen clicks; never shown during play, revealed at end
- `limitDeadline` (ref) — fake countdown timer deadline

Key functions: `requestTransfer()`, `resetDemo()`, `startGame({ name, profession, weeklyPay })`.

### Scenario & gauntlet — `src/data/scenario.js`

`makeScenario(overrides?)` generates a randomized worker, wages, available balance, and transaction history. Overrides allow the game to inject the player's real profession and weekly pay while keeping everything else random.

`makeGauntlet()` builds a shuffled sequence of dark-pattern screens for the tip flow. Called fresh per transfer inside `TransferScreen`.

`PROFESSIONS` — exported array used by `GameSetupScreen` for the job picker.

### Routing — `src/App.jsx`

Uses `HashRouter` (required for GitHub Pages). Gate logic before the router:
1. `!landed` → `LandingScreen` (two buttons: game vs. demo)
2. `!profile && gameMode` → `GameSetupScreen`
3. `!profile && !gameMode` → `OnboardingScreen`
4. Otherwise → the full app with routes

Routes: `/` home, `/transfer`, `/history`, `/account`, `/cost` (demo result), `/watch`, `/watch-loc`, `/game-result` (game reveal).

### The transfer flow — `src/screens/TransferScreen.jsx`

The core dark-pattern simulation. Internal step machine: `amount → plus → ask → queue → resuggest → lastchance → confirm → success`. The `queue` step iterates through the gauntlet returned by `makeGauntlet()`. On success, navigates to `/cost` (demo) or `/game-result` (game mode) based on the `gameMode` flag.

### Game mode additions (on `claude/ewa-game`)

- `GameSetupScreen` — 3-step wizard (name, profession picker with "Other" freetext, weekly pay slider). Calls `startGame()`.
- `GameResultScreen` — end reveal: letter grade S–D based on how much the provider extracted, annual projection, credit union LOC comparison showing money saved.

### Video pipeline

`scripts/tts-kokoro.mjs` + `scripts/make-video.mjs` generate `public/explainer.mp4`.
`scripts/tts-kokoro-loc.mjs` + `scripts/make-video-loc.mjs` generate `public/explainer-loc.mp4`.

Pipeline: Kokoro offline TTS → WAV segments → ffmpeg narration mix → Playwright HTML scene recording → ffmpeg mux to MP4.

### Deployment notes

- `public/CNAME` contains `ewademo.genesee.coop` — this file must always be present in `gh-pages` root.
- `vite.config.js` uses `base: '/'` (not `/ewa/`) since the custom domain is at root.
- Videos (`explainer.mp4`, `explainer-loc.mp4`) and `videos.html` are committed directly to `gh-pages` — they are not part of the Vite build and must be copied manually when updated.
