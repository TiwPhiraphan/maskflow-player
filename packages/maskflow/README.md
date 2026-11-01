# maskflow

> A modern, accessible, mobile-first video player with a futuristic glassmorphism interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/maskflow.svg)](https://www.npmjs.com/package/maskflow)

Maskflow is published as a single unscoped npm package (`maskflow`) with subpath exports:

- `maskflow/react`: React component (`MaskflowPlayer`) and hook (`useMaskflow`)
- `maskflow/vue`: Vue 3 component (`MaskflowPlayer`) and composable (`useMaskflow`)
- `maskflow`: Framework-agnostic core engine (`createPlayer`)
- `maskflow/styles.css`: Shared glassmorphism stylesheet

---

## ✨ Features

- 🔮 **Futuristic Glassmorphism:** Floating translucent control bar with `backdrop-filter: blur(18px) saturate(160%)`, pill-shaped elements, and smooth glow animations.
- 📐 **16:9 Aspect Ratio by Default:** Enforced across CSS variables (`--mf-aspect-ratio`), props, and state, with customization support (`4/3`, `1/1`, `21/9`, or custom ratios).
- 📱 **Mobile-First & Container Queries:** Driven by container queries (`<480px`, `480-768px`, `>768px`), mobile bottom sheet settings, and ≥ 44×44 px touch targets.
- ♿ **Accessible (WCAG AA Compliant):** Full ARIA labels, slider roles for seek & volume, keyboard navigation, focus indicators, and reduced-motion fallbacks. Verified via `@axe-core/playwright`.
- ⚡ **Zero Runtime Dependencies:** Lean and tiny footprint. Core is ~5.3 kB, React and Vue adapters are ~8 kB (well under size budgets).
- 🌐 **Adaptive HLS Streaming:** Lazy imports `hls.js` on demand when playing `.m3u8` streams, with automatic quality level switching. Falls back to native HLS on Apple Safari/iOS.
- 🛡️ **SSR-Safe:** Fully safe to import in Next.js, Nuxt, Remix, and Node.js server environments without `window` or `document` access at import time.

---

## 📦 Installation

```bash
# Core + React
npm install maskflow react react-dom

# Core + Vue 3
npm install maskflow vue

# With HLS (.m3u8) playback support
npm install hls.js
```

> **Note on HLS:** `hls.js` is an optional peer dependency. You only need to install `hls.js` if you are playing HLS (`.m3u8`) video streams in browsers without native HLS support.

---

## 🚀 Quick Start

### React

```tsx
import { MaskflowPlayer } from 'maskflow/react';
import 'maskflow/styles.css';

export function VideoDemo() {
  return (
    <MaskflowPlayer
      src="https://storage.maskflow.online/api/public/video/1UInifytWbGldZA0I3A3jg9n_abi6oYGF"
      poster="/poster.jpg"
      theme="dark"
      accent="#8b5cf6"
      aspectRatio="16/9"
      controls={['play', 'progress', 'time', 'volume', 'captions', 'settings', 'pip', 'fullscreen']}
      keyboard
      gestures
      persist
      onReady={(player) => console.log('Player ready:', player)}
      onError={(err) => console.error('Player error:', err)}
    />
  );
}
```

### Vue 3

```vue
<script setup>
import { MaskflowPlayer } from 'maskflow/vue';
import 'maskflow/styles.css';
</script>

<template>
  <MaskflowPlayer
    src="https://storage.maskflow.online/api/public/video/1UInifytWbGldZA0I3A3jg9n_abi6oYGF"
    poster="/poster.jpg"
    theme="dark"
    accent="#8b5cf6"
    aspect-ratio="16/9"
    :keyboard="true"
    :gestures="true"
    :persist="true"
    @ready="(player) => console.log('Player ready:', player)"
    @error="(err) => console.error('Player error:', err)"
  />
</template>
```

### Vanilla / Framework-Agnostic Core

```ts
import { createPlayer } from 'maskflow';
import 'maskflow/styles.css';

const videoEl = document.querySelector('video')!;
const player = createPlayer(videoEl, {
  src: 'https://storage.maskflow.online/api/public/video/1UInifytWbGldZA0I3A3jg9n_abi6oYGF',
  theme: 'dark',
  accent: '#8b5cf6',
  aspectRatio: '16/9',
  persist: true,
});

player.play();
```

---

## ⚙️ Options & Props Reference

The props and options are identical across React (`onX` event props) and Vue 3 (`@x` events):

| Option / Prop        | Type                                        | Default                                                                        | Description                                                    |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `src`                | `string \| { src: string; type: string }[]` | _(required)_                                                                   | Video URL or array of source objects. Supports MP4, WebM, HLS. |
| `poster`             | `string`                                    | `undefined`                                                                    | Video poster image URL.                                        |
| `tracks`             | `MediaTrackItem[]`                          | `[]`                                                                           | Array of WebVTT subtitle/captions `<track>` definitions.       |
| `aspectRatio`        | `string`                                    | `'16/9'`                                                                       | Aspect ratio of player container (e.g. `'16/9'`, `'4/3'`).     |
| `theme`              | `'dark' \| 'light' \| 'auto'`               | `'dark'`                                                                       | Visual glass theme.                                            |
| `accent`             | `string`                                    | `undefined`                                                                    | Custom accent color (CSS hex or gradient string).              |
| `autoPlay`           | `boolean`                                   | `false`                                                                        | Autoplay video on load.                                        |
| `muted`              | `boolean`                                   | `false`                                                                        | Start playback muted.                                          |
| `loop`               | `boolean`                                   | `false`                                                                        | Loop playback when ended.                                      |
| `controls`           | `ControlItem[]`                             | `['play','progress','time','volume','captions','settings','pip','fullscreen']` | Array of control buttons and bars to render.                   |
| `keyboard`           | `boolean`                                   | `true`                                                                         | Enable keyboard hotkeys when player is focused.                |
| `gestures`           | `boolean`                                   | `true`                                                                         | Enable touch double-tap seek (±10s) and controls toggle.       |
| `persist`            | `boolean`                                   | `false`                                                                        | Remember volume, mute state, and playback speed in storage.    |
| `autoHideDelay`      | `number`                                    | `2500`                                                                         | Inactivity delay in milliseconds before hiding controls.       |
| `onReady` / `@ready` | `(player: MaskflowPlayer) => void`          | `undefined`                                                                    | Invoked when player instance is ready.                         |
| `onError` / `@error` | `(err: unknown) => void`                    | `undefined`                                                                    | Invoked when a media or player error occurs.                   |

---

## ⌨️ Keyboard Shortcuts

When the player container is focused or hovered:

| Shortcut       | Action                             |
| -------------- | ---------------------------------- |
| `Space` or `K` | Toggle Play / Pause                |
| `←` / `→`      | Seek backward / forward 5 seconds  |
| `J` / `L`      | Seek backward / forward 10 seconds |
| `↑` / `↓`      | Increase / decrease volume by 5%   |
| `M`            | Toggle Mute / Unmute               |
| `F`            | Toggle Fullscreen                  |
| `C`            | Toggle Captions / Subtitles        |
| `P`            | Toggle Picture-in-Picture          |
| `0` – `9`      | Jump to 0% – 90% of duration       |
| `<` / `>`      | Decrease / increase playback speed |
| `Escape`       | Close settings dropdown menu       |

---

## 🎨 CSS Variables & Customization

The player is styled with plain CSS via standard CSS variables (`--mf-*`). You can override them globally or on the player element:

```css
.mf-player {
  /* Colors & Glass Surface */
  --mf-accent: linear-gradient(135deg, #8b5cf6, #06b6d4);
  --mf-accent-solid: #8b5cf6;
  --mf-accent-glow: rgba(139, 92, 246, 0.45);
  --mf-bg-glass: rgba(20, 20, 30, 0.48);
  --mf-backdrop-filter: blur(18px) saturate(160%);
  --mf-border-glass: 1px solid rgba(255, 255, 255, 0.12);
  --mf-shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.45);
  --mf-text: #ffffff;
  --mf-text-muted: rgba(255, 255, 255, 0.7);

  /* Geometry & Layout */
  --mf-aspect-ratio: 16 / 9;
  --mf-radius-pill: 9999px;
  --mf-radius-panel: 16px;
  --mf-radius-sm: 8px;
  --mf-control-inset: 14px;
}
```

---

## 📱 Gestures & Touch

- **Single Tap:** Toggles control bar visibility.
- **Double Tap Left:** Seeks backward by 10 seconds with animated ripple feedback.
- **Double Tap Right:** Seeks forward by 10 seconds with animated ripple feedback.
- **Double Tap Center:** Toggles play and pause.
- **Drag Scrubbing:** Smooth scrubbing along the progress bar.

---

## 📄 License

[MIT](LICENSE) © 2026 TiwPhiraphan
