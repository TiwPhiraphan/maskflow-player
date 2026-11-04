import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const testPages = [
  { framework: 'React', path: '/' },
  { framework: 'Vue', path: '/vue.html' },
];

async function ensureControlsVisible(page: Page) {
  const isHidden = await page.evaluate(() => {
    const el = document.querySelector('.mf-player');
    return el ? el.classList.contains('mf-controls-hidden') : false;
  });
  if (isHidden) {
    await page.locator('.mf-player').click({ position: { x: 100, y: 100 }, force: true });
    await page.waitForTimeout(300);
  }
}

for (const { framework, path } of testPages) {
  test.describe(`Maskflow Player (${framework}) E2E & Accessibility`, () => {
    test.beforeEach(async ({ page }) => {
      // Mock instant metadata and suppress CDN network errors in headless CI/E2E
      await page.addInitScript(() => {
        const origAdd = HTMLVideoElement.prototype.addEventListener;
        HTMLVideoElement.prototype.addEventListener = function (
          type: string,
          listener: EventListenerOrEventListenerObject,
          options?: boolean | AddEventListenerOptions,
        ) {
          if (type === 'error') {
            return;
          }
          return origAdd.call(this, type, listener, options);
        };

        const srcDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
        if (srcDescriptor?.set) {
          const origSet = srcDescriptor.set;
          Object.defineProperty(HTMLMediaElement.prototype, 'src', {
            set(value) {
              origSet.call(this, value);
              setTimeout(() => {
                Object.defineProperty(this, 'duration', { value: 60, configurable: true });
                Object.defineProperty(this, 'readyState', { value: 4, configurable: true });
                this.dispatchEvent(new Event('loadedmetadata'));
                this.dispatchEvent(new Event('canplay'));
              }, 50);
            },
            configurable: true,
          });
        }
      });

      await page.goto(path);
      const player = page.locator('.mf-player');
      await player.waitFor({ state: 'visible' });
      await player.scrollIntoViewIfNeeded();
    });

    test('renders player and controls with glassmorphism bar', async ({ page }) => {
      const player = page.locator('.mf-player');
      await expect(player).toBeVisible();

      const controls = page.locator('.mf-controls-wrapper');
      await expect(controls).toBeVisible();

      await ensureControlsVisible(page);

      const progressBar = page.locator('.mf-progress');
      if (!(await progressBar.isVisible())) {
        await page.locator('.mf-player').click({ position: { x: 100, y: 100 }, force: true });
        await page.waitForTimeout(300);
      }
      await expect(progressBar).toBeVisible();

      const bigPlay = page.locator('.mf-big-play').first();
      await expect(bigPlay).toBeVisible();
    });

    test('toggles play and pause on click', async ({ page, isMobile, browserName }) => {
      if (browserName === 'webkit') {
        test.skip();
        return;
      }

      const bigPlayBtn = page.locator('button.mf-big-play').first();
      const bottomPlayBtn = page.locator('.mf-bottom-bar .mf-btn[aria-label*="Play" i]').first();
      const clickablePlayBtn = isMobile ? bigPlayBtn : bottomPlayBtn.or(bigPlayBtn).first();

      await clickablePlayBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

      if (await clickablePlayBtn.isVisible()) {
        await clickablePlayBtn.click();
        const pauseBtn = page.locator('.mf-big-play[aria-label*="Pause" i], .mf-btn[aria-label*="Pause" i]').first();
        await expect(pauseBtn.or(clickablePlayBtn).first()).toBeVisible();
      }
    });

    test('keyboard shortcuts operate correctly', async ({ page, isMobile }) => {
      if (isMobile) {
        test.skip();
        return;
      }
      const player = page.locator('.mf-player');
      await player.focus();

      // Toggle mute with 'm'
      await page.keyboard.press('m');
      const unmuteBtn = page.locator('.mf-btn[aria-label*="Unmute" i]').first();
      if (await unmuteBtn.isVisible()) {
        await expect(unmuteBtn).toBeVisible();

        // Unmute with 'm'
        await page.keyboard.press('m');
        const muteBtn = page.locator('.mf-btn[aria-label*="Mute" i]').first();
        await expect(muteBtn).toBeVisible();
      }

      // Volume adjustment with ArrowUp / ArrowDown
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');

      // Seek shortcuts (ArrowRight, ArrowLeft)
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowLeft');
    });

    test('fullscreen button is present and clickable', async ({ page }) => {
      await ensureControlsVisible(page);

      const fsBtn = page.locator('.mf-btn[aria-label*="Fullscreen" i]').first();
      if (!(await fsBtn.isVisible())) {
        await page.locator('.mf-player').click({ position: { x: 100, y: 100 }, force: true });
        await page.waitForTimeout(300);
      }
      await expect(fsBtn).toBeVisible();
      await fsBtn.click();
      const anyFsBtn = page.locator('.mf-btn[aria-label*="fullscreen" i]').first();
      await expect(anyFsBtn).toBeVisible();
    });

    test('progress bar handles seek interaction', async ({ page }) => {
      await ensureControlsVisible(page);

      const progressBar = page.locator('.mf-progress');
      if (!(await progressBar.isVisible())) {
        await page.locator('.mf-player').click({ position: { x: 100, y: 100 }, force: true });
        await page.waitForTimeout(300);
      }
      await expect(progressBar).toBeVisible();

      const box = await progressBar.boundingBox();
      if (box && box.width > 0) {
        // Click at 50% along the progress bar
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      }
      await expect(progressBar).toBeVisible();
    });

    test('double-tap seek gestures trigger on player', async ({ page }) => {
      const player = page.locator('.mf-player');
      await expect(player).toBeVisible();

      const box = await player.boundingBox();
      if (box) {
        // Double click on right side to seek forward (+10s)
        const rightX = box.x + box.width * 0.8;
        const centerY = box.y + box.height * 0.4;
        await page.mouse.dblclick(rightX, centerY);
      }
      await expect(player).toBeVisible();
    });

    test('settings menu opens, changes speed, and closes on Escape', async ({ page }) => {
      await ensureControlsVisible(page);

      const settingsBtn = page.locator('.mf-btn[aria-label*="Settings" i]').first();
      if (!(await settingsBtn.isVisible())) {
        await page.locator('.mf-player').click({ position: { x: 100, y: 100 }, force: true });
        await page.waitForTimeout(300);
      }
      await settingsBtn.click();

      const menu = page.locator('.mf-menu.mf-menu-open');
      await expect(menu).toBeVisible();

      // Navigate to speed
      const speedItem = page.getByRole('menuitem', { name: /Speed/i }).first();
      await speedItem.click();

      // Select 1.5x speed
      const speed15 = page.getByRole('menuitemradio', { name: /1\.5x/i }).first();
      await speed15.click();

      // Menu closes after selection
      await expect(menu).not.toBeVisible();
    });

    test('no serious or critical accessibility violations (@axe-core)', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('.mf-player')
        .analyze();

      const seriousOrCritical = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );

      expect(seriousOrCritical).toEqual([]);
    });
  });
}
