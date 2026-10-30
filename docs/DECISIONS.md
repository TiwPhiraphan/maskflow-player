# Architectural and Project Decisions

## 1. npm Package Name Availability

- **Date:** 2026-10-30
- **Command:** `npm view maskflow name version`
- **Result:** `404 Not Found` (Registry response: `{"error":"Not found"}`).
- **Decision:** The unscoped package name `maskflow` is confirmed free on npm. We proceed with `maskflow` as the single published package name.

## 2. Core Decisions Recorded from Specification

- **Single Package subpaths:** `maskflow`, `maskflow/react`, `maskflow/vue`, `maskflow/styles.css`.
- **No scope:** Never use `@maskflow/...`.
- **Zero runtime dependencies:** `maskflow` has zero runtime dependencies; `react`, `vue`, and `hls.js` are optional peer dependencies.
- **Glassmorphism design:** Blurred translucent floating control bar, rounded pill shapes, custom properties (`--mf-*`).
- **Framework adapters:** `src/core` is framework-agnostic. `src/react` and `src/vue` are thin adapters with strict import boundaries.
