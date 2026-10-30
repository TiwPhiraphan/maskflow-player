# GEMINI.md — maskflow-player

> Instructions for the coding agent (Gemini Flash) building **maskflow-player**.
> Work phase by phase. Finish and verify one phase before starting the next.
> Do not skip the "Done when" checks. Do not add features that are not listed here.

---

## 1. Project goal

Build a modern, accessible, mobile-first **video player** with a Plyr-like feature set but a more futuristic look (glassmorphism controls floating over the video).

- Published as **one unscoped npm package named `maskflow`** with subpath entry points:
  - `maskflow/react` → React component + hook
  - `maskflow/vue` → Vue 3 component + composable
  - `maskflow` → framework-agnostic core (`createPlayer`)
  - `maskflow/styles.css` → shared stylesheet
- **No `@scope` anywhere.** Never write `@maskflow/...` in code, docs, or config.
- Ship **React first**; Vue is added in Phase 8 reusing the same core.
- Publish to **npm** automatically through **GitHub Actions** + **Changesets**.

### Decisions already made (do not re-ask)

| Topic | Decision |
|---|---|
| Package | Single package `maskflow` with `exports` subpaths (`.`, `./react`, `./vue`, `./styles.css`) |
| Repo layout | pnpm workspace: `packages/maskflow` (published) + `apps/playground` (private) |
| Media (v1) | MP4/WebM via native `<video>`, HLS (`.m3u8`) via `hls.js` loaded lazily |
| Not in v1 | DASH, YouTube/Vimeo embeds, DRM, ads, playlists |
| Visual style | Glassmorphism: blurred translucent floating control bar, rounded pill shapes, smooth motion |
| Tooling | TypeScript, Vite (playground), tsup (library build), Vitest (unit), Playwright (e2e), Changesets (release) |
| Package manager | pnpm |

### Consumer usage (the target API shape)

```tsx
// React
import { MaskflowPlayer } from 'maskflow/react';
import 'maskflow/styles.css';
```

```vue
<!-- Vue -->
<script setup>
import { MaskflowPlayer } from 'maskflow/vue';
import 'maskflow/styles.css';
</script>
```

```ts
// Vanilla / custom
import { createPlayer } from 'maskflow';
```

---

## 2. Architecture

Key rule: **all player logic lives in `src/core`. `src/react` and `src/vue` are thin adapters.**

```
maskflow-player/
├─ GEMINI.md
├─ package.json                 # private root, scripts only
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
├─ .changeset/
├─ .github/workflows/
│  ├─ ci.yml
│  └─ release.yml
├─ packages/
│  └─ maskflow/                 # published package: "maskflow"
│     ├─ package.json
│     ├─ tsup.config.ts
│     └─ src/
│        ├─ index.ts            # exports core public API
│        ├─ core/
│        │  ├─ player.ts        # player class (state machine + API)
│        │  ├─ store.ts         # tiny reactive store (subscribe/getState)
│        │  ├─ events.ts        # typed event emitter
│        │  ├─ media/
│        │  │  ├─ native.ts     # <video> source handling
│        │  │  └─ hls.ts        # lazy import('hls.js'), quality levels
│        │  ├─ features/        # keyboard, fullscreen, pip, gestures, persistence, autohide
│        │  └─ utils/           # time format, clamp, a11y helpers
│        ├─ react/
│        │  ├─ index.ts
│        │  ├─ MaskflowPlayer.tsx
│        │  ├─ useMaskflow.ts   # useSyncExternalStore over core store
│        │  └─ components/      # ControlBar, ProgressBar, VolumeControl, SettingsMenu, ...
│        ├─ vue/                # added in Phase 8
│        │  ├─ index.ts
│        │  ├─ MaskflowPlayer.ts   # defineComponent + render functions (no .vue SFC)
│        │  └─ useMaskflow.ts
│        └─ styles/
│           └─ maskflow.css     # CSS variables, no framework
├─ apps/
│  └─ playground/               # private Vite app: React page + Vue page, e2e target
└─ e2e/                         # Playwright specs
```

### Import boundaries (enforce with ESLint `no-restricted-imports`)

- `src/core` must **not** import from `src/react` or `src/vue`, and must not import `react` or `vue`.
- `src/react` may import from `src/core` only. It must not import `vue`.
- `src/vue` may import from `src/core` only. It must not import `react`.
- `src/react` and `src/vue` must not import each other.

### Core design rules

1. `core` exposes `createPlayer(videoEl, options)` returning a player with:
   - **state** (via `player.store.getState()` / `subscribe`): `status`, `currentTime`, `duration`, `buffered`, `volume`, `muted`, `playbackRate`, `isFullscreen`, `isPip`, `quality`, `qualities`, `captionsEnabled`, `controlsVisible`, `error`
   - **methods**: `play()`, `pause()`, `toggle()`, `seek(t)`, `seekBy(dt)`, `setVolume(v)`, `toggleMute()`, `setRate(r)`, `setQuality(id|'auto')`, `toggleFullscreen()`, `togglePip()`, `toggleCaptions()`, `destroy()`
   - **events**: typed emitter (`play`, `pause`, `timeupdate`, `ended`, `error`, `qualitychange`, ...)
2. Adapters only: create the player in a mount hook, bind the store to the framework's reactivity, render UI, call `destroy()` on unmount.
3. Styling = plain CSS with custom properties (`--mf-*`), shipped as `maskflow/styles.css`. No CSS-in-JS, no Tailwind in the published package, so React and Vue look identical.
4. **SSR-safe:** nothing touches `window`/`document` at import time. Next.js and Nuxt must be able to import every entry point.
5. `hls.js` is an **optional peer dependency**, imported dynamically only for `.m3u8` sources when the browser lacks native HLS (Safari plays natively).
6. `react` and `vue` are **optional peer dependencies** (`peerDependenciesMeta`), because a user installs only the one they use. Neither may be bundled.
7. No runtime `dependencies` other than none (zero). Everything else is a peer or a devDependency.

---

## 3. UI / UX specification

### Visual language (glassmorphism, "futuristic")

- Control bar is a **floating rounded pill/panel** inset from the video edges (not a full-width gradient strip).
- Surface: `background: rgb(20 20 30 / 0.45)`, `backdrop-filter: blur(18px) saturate(160%)`, 1px translucent border (`rgb(255 255 255 / 0.12)`), soft shadow.
- Accent via `--mf-accent` (default a vivid gradient, e.g. violet → cyan). Progress fill and active states use the accent with a subtle glow.
- Large centered **play/pause button** with ripple/scale animation on state change; animated icon flash on double-tap seek (±10 s).
- Progress bar: thin by default, **grows on hover/touch**, shows buffered range, hover **time tooltip**, draggable thumb.
- Motion: 150–250 ms ease-out. Respect `prefers-reduced-motion`.
- Dark by default; `theme` option (`dark` | `light` | `auto`) driven by CSS variables.
- Icons: inline SVG, `currentColor`, 24 px grid. No icon font.
- Fallback when `backdrop-filter` is unsupported: opaque `rgb(20 20 30 / 0.85)` via `@supports not`.

### Controls (Plyr parity, v1)

Play/Pause, progress/seek, current time / duration, mute + volume slider, captions toggle (WebVTT `<track>`), settings menu (playback speed, quality when HLS), picture-in-picture, fullscreen, big center play button, loading spinner, error overlay with retry.

### Auto-hide

- Controls hide after ~2.5 s of inactivity while playing; show on mouse move, tap, focus, or when paused.
- Never hide while the settings menu is open or a control has keyboard focus.

### Mobile & responsive (required)

- Mobile-first CSS. Use **container queries** on the player root (`container-type: inline-size`), not only viewport media queries, so it works in narrow embeds.
- Container-width breakpoints: `< 480px` compact (volume slider hidden, mute button kept, settings opens as **bottom sheet**), `480–768px` medium, `> 768px` full.
- Touch targets ≥ **44×44 px**.
- Gestures: single tap toggles controls, **double-tap left/right = seek −10/+10 s**, horizontal drag on progress to scrub. Long-press 2× speed is optional (off by default).
- Use `playsInline`; handle iOS Safari fullscreen (fall back to `webkitEnterFullscreen`).
- Respect safe-area insets (`env(safe-area-inset-*)`) in fullscreen.
- Orientation changes must not break layout.

### Keyboard shortcuts (player focused or hovered)

`Space`/`K` play-pause, `←`/`→` seek ∓5 s, `J`/`L` seek ∓10 s, `↑`/`↓` volume, `M` mute, `F` fullscreen, `C` captions, `P` PiP, `0–9` jump to 0–90 %, `<` `>` speed.

### Accessibility (required)

- Real `<button>` elements with `aria-label`; toggles use `aria-pressed`.
- Progress and volume use `role="slider"` with `aria-valuemin/max/now/valuetext` and arrow-key support.
- Visible `:focus-visible` ring in accent color.
- Menus: `role="menu"`, focus trap while open, `Escape` closes and restores focus.
- Live region announces errors and key state changes.
- Text/icon contrast on the glass surface ≥ WCAG AA.

---

## 4. Public API

Option names are **identical across React and Vue**. React uses `onX` props; Vue uses `@x` events.

```tsx
import { MaskflowPlayer } from 'maskflow/react';
import 'maskflow/styles.css';

<MaskflowPlayer
  src="https://example.com/video.m3u8"   // string | { src, type }[]
  poster="/poster.jpg"
  tracks={[{ kind: 'captions', src: '/en.vtt', srclang: 'en', label: 'English', default: true }]}
  autoPlay={false}
  muted={false}
  loop={false}
  controls={['play','progress','time','volume','captions','settings','pip','fullscreen']}
  theme="dark"
  accent="#8b5cf6"
  keyboard
  gestures
  persist          // remember volume + speed in localStorage
  onReady={(player) => {}}
  onError={(err) => {}}
  ref={playerRef}  // exposes imperative core API
/>
```

Also export from `maskflow/react`: `useMaskflow(playerRef)` and all public types. `maskflow/vue` exports the matching `useMaskflow` composable.

---

## 5. Phased plan

Commit after every phase with a conventional commit message.

### Phase 0 — Name check & scaffold
1. **Check the npm name first:** run `npm view maskflow name version`.
   - If it returns "404 Not Found", the name is free, continue.
   - If the package exists, **STOP** and report it to the user. Do not invent another name.
2. Init pnpm workspace, `tsconfig.base.json` (strict), ESLint + Prettier (with the import-boundary rules above), `.editorconfig`, `.gitignore`, `LICENSE` (MIT), root `README.md`.
3. Create `packages/maskflow` and `apps/playground`.
4. Root scripts: `build`, `dev`, `lint`, `typecheck`, `test`, `e2e`, `size`, `changeset`, `release`.

**Done when:** `pnpm install && pnpm typecheck && pnpm lint` pass on the empty scaffold, and the npm name check result is recorded in `docs/DECISIONS.md`.

### Phase 1 — Core engine (no UI)
- Implement `store.ts`, `events.ts`, `player.ts`, native source handling, and all state fields/methods in §2 except HLS, PiP, fullscreen.
- Unit tests (Vitest + jsdom): store, events, time utils, seek clamping, volume clamping.

**Done when:** core tests pass and a plain HTML test page plays an MP4 through `createPlayer` imported from `maskflow`.

### Phase 2 — Core features
- Fullscreen (incl. iOS fallback), PiP, captions toggle, playback rate, keyboard shortcuts, persistence, auto-hide controller, gesture recognizer (tap / double-tap / drag).
- Lazy HLS adapter with quality levels and `auto`.

**Done when:** each feature has unit tests; an HLS stream plays in the playground on Chrome and uses native playback on Safari.

### Phase 3 — Design tokens & CSS
- Write `maskflow.css`: `--mf-*` variables, glass surface, light/dark themes, container-query breakpoints, reduced-motion, `@supports` fallback.
- Expose it as `maskflow/styles.css`.

**Done when:** a static HTML mock shows the full control bar correctly at 360 px, 768 px, and 1280 px container widths.

### Phase 4 — React components (`maskflow/react`)
- `useMaskflow` with `useSyncExternalStore`.
- Components: `ControlBar`, `PlayButton`, `BigPlayButton`, `ProgressBar`, `TimeDisplay`, `VolumeControl`, `SettingsMenu` (speed, quality; bottom sheet on compact), `CaptionsButton`, `PipButton`, `FullscreenButton`, `Spinner`, `ErrorOverlay`.
- `MaskflowPlayer` wires everything and forwards a ref. Must be React Strict-Mode safe.

**Done when:** the playground React page works with mouse, touch (DevTools emulation), and keyboard.

### Phase 5 — Quality gates
- Component tests (Vitest + Testing Library).
- Playwright e2e on Chromium, WebKit, and a mobile viewport project: play/pause, seek, volume, speed, fullscreen toggle, double-tap seek, keyboard shortcuts.
- `@axe-core/playwright`: no serious/critical violations.
- `size-limit` budgets (gzipped, excluding `hls.js`): `maskflow` (core) ≤ **12 kB**, `maskflow/react` ≤ **25 kB** total including shared core. CI fails if exceeded.

**Done when:** `pnpm test && pnpm e2e && pnpm size` are green locally.

### Phase 6 — Packaging
- `tsup` with entries `index`, `react/index`, `vue/index` (vue entry added in Phase 8), format ESM + CJS, `dts: true`, `splitting: true` (so core code is shared between entries, not duplicated), `external: ['react', 'react-dom', 'vue', 'hls.js']`, copy the CSS to `dist/styles.css`.
- `packages/maskflow/package.json` essentials:
  ```json
  {
    "name": "maskflow",
    "sideEffects": ["**/*.css"],
    "exports": {
      ".":            { "types": "./dist/index.d.ts",        "import": "./dist/index.js",        "require": "./dist/index.cjs" },
      "./react":      { "types": "./dist/react/index.d.ts",  "import": "./dist/react/index.js",  "require": "./dist/react/index.cjs" },
      "./vue":        { "types": "./dist/vue/index.d.ts",    "import": "./dist/vue/index.js",    "require": "./dist/vue/index.cjs" },
      "./styles.css": "./dist/styles.css",
      "./package.json": "./package.json"
    },
    "peerDependencies": { "react": ">=18", "vue": ">=3.3", "hls.js": "^1" },
    "peerDependenciesMeta": {
      "react": { "optional": true },
      "vue": { "optional": true },
      "hls.js": { "optional": true }
    },
    "publishConfig": { "access": "public", "provenance": true }
  }
  ```
  Also set `files: ["dist"]`, `repository`, `license`, `keywords`, `types` / `typesVersions` fallback for older `moduleResolution: node`.
- Verify with `publint` and `@arethetypeswrong/cli` (all three subpaths must resolve in `node16`/`bundler` modes).
- Test: `pnpm pack`, install the tarball into a throwaway Vite app **and** a Next.js app; `import 'maskflow/react'` must work, and SSR import must not crash.

**Done when:** publint and attw report no errors and both test apps render the player.

### Phase 7 — CI/CD to npm (GitHub Actions)
Use **Changesets** with `changesets/action`. One package, so no `fixed` group is needed.

`.github/workflows/ci.yml` — on PR and push to `main`:
1. checkout, `pnpm/action-setup`, `actions/setup-node` (Node 22, `cache: pnpm`)
2. `pnpm install --frozen-lockfile`
3. `pnpm lint && pnpm typecheck && pnpm build && pnpm test`
4. `pnpm exec playwright install --with-deps` then `pnpm e2e`
5. `pnpm size`

`.github/workflows/release.yml` — on push to `main`:
- `permissions: contents: write, pull-requests: write, id-token: write`
- `changesets/action` with `version: pnpm changeset version` and `publish: pnpm release` (`pnpm build && changeset publish`).
- Env: `NPM_TOKEN` from repo secret (or npm trusted publishing/OIDC if configured) and `NPM_CONFIG_PROVENANCE=true`.
- Flow: feature PRs include a changeset → bot opens a "Version Packages" PR → merging it publishes `maskflow` to npm.

Changesets config: `access: public`, `baseBranch: main`, ignore the private playground app.

**Human steps (list these in the final report; do NOT attempt them):** confirm the `maskflow` name is available on npm, add the `NPM_TOKEN` repo secret (or configure trusted publishing), and enable branch protection on `main`.

**Done when:** workflows pass `actionlint` and `npm publish --dry-run` succeeds in `packages/maskflow`.

### Phase 8 — Vue adapter (`maskflow/vue`)
- Add `src/vue/` reusing `src/core` unchanged.
- Implement `MaskflowPlayer` with `defineComponent` + render functions (`h`), **not** `.vue` SFCs, so tsup can build it without extra plugins.
- Same option names as React. Events: `ready`, `error`, etc. via `emits`. `v-model:` is not needed in v1.
- `useMaskflow` composable bridging the core store to `shallowRef` / `computed`.
- Add the `./vue` entry to tsup, and a Vue page in the playground.
- Verify SSR import in a Nuxt test app.
- Run the same Playwright suite against the Vue page.

**Done when:** e2e passes for React and Vue, `maskflow/vue` passes publint/attw, and `pnpm size` budget for `maskflow/vue` ≤ **25 kB**.

### Phase 9 — Docs
- Root `README.md`: install (`npm i maskflow`), React and Vue quick starts, options table, CSS variable reference, shortcut table, `hls.js` note (`npm i hls.js` for HLS).
- `CONTRIBUTING.md`; changelog generated by Changesets.
- Optional: deploy the playground to GitHub Pages via a separate workflow.

---

## 6. Engineering rules for the agent

- TypeScript `strict: true`; no `any` without a comment explaining why.
- Public API changes require updating §4 of this file and adding a changeset.
- Prefer small pure functions in `core`; side effects (DOM listeners) live in `features/` and are removed in `destroy()`.
- Always clean up: event listeners, timers, `ResizeObserver`, `hls.destroy()`.
- Do not add dependencies without need. Allowed: `hls.js`, `react`, `vue` (as peer/dev only) plus the tooling named in §1. Ask before adding anything else.
- Never commit secrets or tokens. Never run `npm publish` locally (dry-run only).
- After each phase: run `pnpm lint && pnpm typecheck && pnpm test`, fix failures, then commit.
- If a requirement is ambiguous or blocked, choose the simplest option that satisfies the "Done when" check and note it in `docs/DECISIONS.md`.

---

## 7. Progress checklist

- [ ] Phase 0 — Name check & scaffold
- [ ] Phase 1 — Core engine
- [ ] Phase 2 — Core features
- [ ] Phase 3 — Design tokens & CSS
- [ ] Phase 4 — React components
- [ ] Phase 5 — Quality gates
- [ ] Phase 6 — Packaging
- [ ] Phase 7 — CI/CD to npm
- [ ] Phase 8 — Vue adapter
- [ ] Phase 9 — Docs
