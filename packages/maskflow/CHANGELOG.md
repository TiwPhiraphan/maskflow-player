# maskflow

## 0.2.2

### Patch Changes

- Fix mobile touch responsiveness and controls accessibility:
  - Fix autohide immediately disappearing on finger lift by ignoring touch `pointerleave`.
  - Fix gesture race condition between autohide timer and single-tap controls toggle.
  - Fix iOS WebKit touch click cancellation by replacing premature focus-blur with post-click blur.
  - Enlarge progress bar touch hit area to 42px and force scrubber thumb visibility on coarse pointer devices.
  - Add pointer-capture touch drag scrubbing support for both React and Vue components.
  - Disable native `<video>` pointer events so touch gestures reliably reach the player container.
  - Optimize compact mobile button layout and hide PiP on narrow viewports (<380px).

## 0.2.1

### Patch Changes

- d7c5240: Include README.md documentation and LICENSE in published package bundle.

## 0.2.0

### Minor Changes

- 2068796: Initial release of `maskflow`:
  - Futuristic glassmorphism video player for React and Vue 3.
  - Framework-agnostic core state engine (`maskflow`).
  - React adapter (`maskflow/react`) and Vue 3 adapter (`maskflow/vue`).
  - Adaptive HLS streaming via lazy `hls.js` with quality switching.
  - Mobile gestures (±10s double-tap seek, container queries, bottom sheet).
  - WCAG AA accessibility compliance with zero critical/serious violations.
  - 16:9 default aspect ratio.
