# Contributing to Maskflow

Thank you for contributing to **maskflow**! Maskflow is a modern, accessible, mobile-first video player with a futuristic glassmorphism interface published as a single unscoped npm package.

---

## 🛠️ Repository Layout

This repository is managed with [pnpm](https://pnpm.io) workspaces:

- `packages/maskflow`: The published library containing:
  - `maskflow` (framework-agnostic core engine)
  - `maskflow/react` (React component and hooks)
  - `maskflow/vue` (Vue 3 component and composables)
  - `maskflow/styles.css` (Glassmorphism design stylesheet)
- `apps/playground`: Private Vite development and test application for both React and Vue.
- `e2e`: Playwright end-to-end and `@axe-core` accessibility test suite.

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Run playground dev server:**
   ```bash
   pnpm dev
   ```
   Open `http://localhost:5173` for the React demo or `http://localhost:5173/vue.html` for the Vue 3 demo.

3. **Build library:**
   ```bash
   pnpm build
   ```

---

## 🧪 Testing & Quality Gates

Before opening a pull request, ensure all quality gates pass:

```bash
# Typecheck TypeScript across all packages
pnpm typecheck

# Run ESLint
pnpm lint

# Run Vitest unit & component tests
pnpm test

# Run Playwright E2E tests (Chromium, WebKit, Mobile Viewports)
pnpm e2e

# Check bundle size budgets
pnpm size

# Check package export resolution
pnpm check:pkg
```

### Bundle Size Budgets
- `maskflow` (core): ≤ **12 kB** gzipped
- `maskflow/react`: ≤ **25 kB** gzipped (including core)
- `maskflow/vue`: ≤ **25 kB** gzipped (including core)

---

## 📦 Changesets & Versioning

We use [Changesets](https://github.com/changesets/changesets) for package versioning and changelog generation.

When making a change that should be released:
1. Run:
   ```bash
   pnpm changeset
   ```
2. Select the change type (`patch`, `minor`, or `major`) and describe the changes.
3. Commit the generated markdown file in `.changeset/`.

When changes are merged into `main`, GitHub Actions automatically generates release PRs and publishes new versions to npm.

---

## 📜 Commit Guidelines

We use conventional commit format:

- `feat:` New features
- `fix:` Bug fixes
- `test:` Adding or updating tests
- `docs:` Documentation improvements
- `refactor:` Code restructuring without functional changes
- `ci:` CI/CD and workflow changes
- `chore:` Tooling and maintenance
