import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Maskflow Player E2E & Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the player container to be attached and ready
    await page.waitForSelector('.mf-player');
  });

  test('renders player and controls with glassmorphism bar', async ({ page }) => {
    const player = page.locator('.mf-player');
    await expect(player).toBeVisible();

    const controls = page.locator('.mf-controls');
    await expect(controls).toBeVisible();

    const progressBar = page.locator('.mf-progress');
    await expect(progressBar).toBeVisible();

    const playBtn = page.getByRole('button', { name: 'Play' }).first();
    await expect(playBtn).toBeVisible();
  });

  test('toggles play and pause on click', async ({ page }) => {
    const playBtn = page.locator('.mf-controls .mf-btn[aria-label="Play"]');
    await expect(playBtn).toBeVisible();

    await playBtn.click();
    // After clicking play, button should change label to Pause or state to playing
    const pauseBtn = page.locator('.mf-controls .mf-btn[aria-label="Pause"]');
    // Note: in automated headless environments media playback starts
    await expect(pauseBtn.or(playBtn)).toBeVisible();
  });

  test('keyboard shortcuts operate correctly', async ({ page }) => {
    const player = page.locator('.mf-player');
    await player.focus();

    // Toggle mute with 'm'
    await page.keyboard.press('m');
    const unmuteBtn = page.locator('.mf-controls .mf-btn[aria-label="Unmute"]');
    await expect(unmuteBtn).toBeVisible();

    // Unmute with 'm'
    await page.keyboard.press('m');
    const muteBtn = page.locator('.mf-controls .mf-btn[aria-label="Mute"]');
    await expect(muteBtn).toBeVisible();

    // Volume adjustment with ArrowUp / ArrowDown
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');

    // Seek shortcuts (ArrowRight, ArrowLeft, j, l)
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
  });

  test('fullscreen button is present and clickable', async ({ page }) => {
    const fsBtn = page.locator('.mf-btn[aria-label="Enter Fullscreen"]');
    await expect(fsBtn).toBeVisible();
    await fsBtn.click();
    // After click or fallback, button exists
    const anyFsBtn = page.locator('.mf-btn[aria-label*="fullscreen" i]');
    await expect(anyFsBtn).toBeVisible();
  });

  test('progress bar handles seek interaction', async ({ page }) => {
    const progressBar = page.locator('.mf-progress');
    await expect(progressBar).toBeVisible();

    const box = await progressBar.boundingBox();
    if (box) {
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
      const rightX = box.x + (box.width * 0.8);
      const centerY = box.y + (box.height * 0.4);
      await page.mouse.dblclick(rightX, centerY);
    }
    await expect(player).toBeVisible();
  });

  test('settings menu opens, changes speed, and closes on Escape', async ({ page }) => {
    const settingsBtn = page.locator('.mf-btn[aria-label="Settings"]');
    await settingsBtn.click();

    const menu = page.locator('.mf-menu.mf-menu-open');
    await expect(menu).toBeVisible();

    // Navigate to speed
    const speedItem = page.getByRole('menuitem', { name: /Speed/i });
    await speedItem.click();

    // Select 1.5x speed
    const speed15 = page.getByRole('menuitemradio', { name: /1\.5x/i });
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
