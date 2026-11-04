# maskflow

## 0.4.0

### Minor Changes

- **Theme Customization (Dark, Light, Device)**:
  - Added full Dark mode, Light mode, and OS Device auto-preference (`prefers-color-scheme`) support via `theme` prop and `player.setTheme()`.
  - Added new CSS custom properties: `--mf-bg-panel`, `--mf-panel-text`, `--mf-panel-border`, `--mf-panel-hover`, `--mf-panel-shadow`, and `--mf-panel-kbd-*`.
  - Added "Appearance" settings submenu in the Settings popup and mobile bottom sheet for instant theme toggling.
- **Enhanced Subtitles & Closed Captions (CC)**:
  - Smart subtitle visibility: automatically hides CC button when no `<track>` items are configured, and displays the CC button when subtitle tracks are present.
  - Added `c` keyboard shortcut and dynamic tooltip (`Enable subtitles (c)` / `Disable subtitles (c)`) with `aria-pressed` synchronization.
- **Optimistic Seek Locking**:
  - Eliminated progress bar snapback/flicker when clicking or seeking along the timeline by optimistically locking until the media engine finishes seeked operations.
- **Replay State at Video Ended**:
  - Switched center and bottom play buttons to Replay icon on video end, with automated rewind (`currentTime = 0`) upon replay click.
- **Global & Hover Keyboard Shortcuts**:
  - Reworked keyboard manager to reliably capture shortcuts when hovering over the player or when clicking player buttons with focus blur, preventing input traps.
- **Multi-Quality Stream Switching**:
  - Seamless real-time quality switching across resolutions (1080p, 720p, 480p, 360p, 240p, 144p) preserving playback position and play state.
- **Vue 3 Playground & Rendering Fix**:
  - Fixed mount target binding in `vue.html` and verified complete rendering and controls parity with React.

## 0.3.0

### Minor Changes

- Major UI/UX overhaul inspired by YouTube video player architecture:
  - **3-Row Grid Layout**: Redesigned player overlay with a 3-row CSS grid (`auto 1fr auto`):
    - Top row: Truncated video title (`flex-1`, ellipsis truncation) and settings button with gradient scrim and notch safe-area padding.
    - Center row: Dual non-overlapping left & right seek zones + centered action button.
    - Bottom row: Single flex row containing desktop play/pause, volume control with desktop slider, current time (`mm:ss`), flex-1 progress bar, duration (`mm:ss`), desktop picture-in-picture, and fullscreen button.
  - **Reactive Loading State**: Derived strictly from `video.readyState` and network events:
    `loading = seeking || (!paused && readyState < HAVE_FUTURE_DATA) || (readyState === HAVE_NOTHING && networkState === NETWORK_LOADING)`.
    Never gets stuck after source change, seeking, network stalls, or error recovery.
  - **Mobile Seek Mode**: Double-tap zone enters seek mode (±10s); single-tap within seek mode adds stacked ±10s increments with animated ripple feedback; exits automatically after 1s of inactivity. Single tap outside seek mode toggles controls after a 250ms debounce.
  - **Custom Drag-Safe Progress Bar**: Uses pointer events with pointer capture. Uses local state for thumb scrubbing and commits seek on release, eliminating `timeupdate` fight. Accessible `role="slider"` with `aria-valuetext` in `"mm:ss of mm:ss"` format.
  - **Time Formatting**: Formatted as `mm:ss` (no hours rendered, minutes continue counting e.g. `75:03`).
  - **Keyboard Shortcuts & Dynamic Titles**: Support for `Space` (play/pause), `f` (fullscreen), `s` (toggle settings), `p` (picture-in-picture), `←`/`→` (seek ±10s), `m` (mute), `↑`/`↓` (volume), and `Esc` (close settings). Button titles & aria-labels dynamically reflect current state (e.g. `Play (space)`, `Pause (space)`, `Fullscreen (f)`). Prevents double-toggling when native buttons are focused.
  - **Settings Popover & Bottom Sheet**: Anchored dropdown popover on desktop, bottom sheet drawer on mobile viewports.
  - **Error Screen with Retry**: Solid black overlay on error with error icon, concise message, and Retry button that calls `video.load()` and resumes playback while keeping the top title visible.
  - **Full Mobile Responsiveness**: Touch targets at least 44x44px; clean 320px minimum viewport support without overflow.

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
