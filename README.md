# maskflow

> A modern, accessible, mobile-first video player with a futuristic glassmorphism interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/maskflow.svg)](https://www.npmjs.com/package/maskflow)

## Features

- 🔮 **Futuristic Glassmorphism:** Translucent floating control bar, blurred backdrop (`backdrop-filter`), smooth glow animations.
- 📱 **Mobile-First & Container Queries:** Adapts to container widths (`<480px`, `480-768px`, `>768px`) with bottom sheets on small screens and touch targets ≥ 44×44 px.
- ♿ **Accessible (WCAG AA):** Keyboard operable, full ARIA roles/sliders/live-regions, focus rings, reduced-motion support.
- ⚡ **Zero Runtime Dependencies:** Lean and modular core with optional framework adapters.
- 🌐 **HLS Support:** Dynamic lazy loading of `hls.js` with quality selection, falling back to native HLS on Safari/iOS.
- ⚛️ **Framework Adapters:** React (`maskflow/react`) and Vue 3 (`maskflow/vue`) with identical option APIs.

---

## Installation

```bash
# Core + React
npm install maskflow react react-dom

# Core + Vue
npm install maskflow vue

# With HLS support (optional)
npm install hls.js
```

---

## Quick Start

### React

```tsx
import { MaskflowPlayer } from 'maskflow/react';
import 'maskflow/styles.css';

export function App() {
  return (
    <MaskflowPlayer
      src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      poster="/poster.jpg"
      theme="dark"
      accent="#8b5cf6"
      controls={['play', 'progress', 'time', 'volume', 'captions', 'settings', 'pip', 'fullscreen']}
      keyboard
      gestures
      persist
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
    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    poster="/poster.jpg"
    theme="dark"
    accent="#8b5cf6"
    :keyboard="true"
    :gestures="true"
    :persist="true"
  />
</template>
```

### Vanilla / Core API

```ts
import { createPlayer } from 'maskflow';
import 'maskflow/styles.css';

const videoEl = document.querySelector('video');
const player = createPlayer(videoEl, {
  persist: true,
  theme: 'dark',
});
```

---

## Options

| Prop / Option        | Type                                        | Default                                                                        | Description                                 |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| `src`                | `string \| { src: string; type: string }[]` | (required)                                                                     | Media source URL or array of source objects |
| `poster`             | `string`                                    | `undefined`                                                                    | Poster image URL                            |
| `tracks`             | `TrackProps[]`                              | `[]`                                                                           | Subtitles/captions WebVTT track definitions |
| `autoPlay`           | `boolean`                                   | `false`                                                                        | Autoplay media                              |
| `muted`              | `boolean`                                   | `false`                                                                        | Start muted                                 |
| `loop`               | `boolean`                                   | `false`                                                                        | Loop media on end                           |
| `controls`           | `ControlItem[]`                             | `['play','progress','time','volume','captions','settings','pip','fullscreen']` | Enabled control items                       |
| `theme`              | `'dark' \| 'light' \| 'auto'`               | `'dark'`                                                                       | Visual theme                                |
| `accent`             | `string`                                    | `undefined`                                                                    | Custom accent color (CSS color or gradient) |
| `keyboard`           | `boolean`                                   | `true`                                                                         | Enable keyboard shortcuts when focused      |
| `gestures`           | `boolean`                                   | `true`                                                                         | Enable touch tap/double-tap gestures        |
| `persist`            | `boolean`                                   | `false`                                                                        | Remember volume and speed in `localStorage` |
| `onReady` / `@ready` | `(player) => void`                          | `undefined`                                                                    | Callback when player is initialized         |
| `onError` / `@error` | `(error) => void`                           | `undefined`                                                                    | Callback on error                           |

---

## Keyboard Shortcuts

| Shortcut       | Action                             |
| -------------- | ---------------------------------- |
| `Space` or `K` | Toggle Play / Pause                |
| `←` / `→`      | Seek backward / forward 5 s        |
| `J` / `L`      | Seek backward / forward 10 s       |
| `↑` / `↓`      | Adjust volume up / down 5%         |
| `M`            | Toggle mute                        |
| `F`            | Toggle fullscreen                  |
| `C`            | Toggle captions                    |
| `P`            | Toggle picture-in-picture          |
| `0` – `9`      | Seek to 0% – 90%                   |
| `<` / `>`      | Decrease / increase playback speed |

---

## CSS Variables

Customize appearance using CSS variables on the player container:

```css
:root {
  --mf-accent: linear-gradient(135deg, #8b5cf6, #06b6d4);
  --mf-bg: rgb(20 20 30 / 0.45);
  --mf-backdrop-filter: blur(18px) saturate(160%);
  --mf-border: 1px solid rgb(255 255 255 / 0.12);
  --mf-radius: 12px;
  --mf-text: #ffffff;
  --mf-text-muted: rgba(255, 255, 255, 0.7);
}
```

---

## License

[MIT](LICENSE) © 2026 TiwPhiraphan
