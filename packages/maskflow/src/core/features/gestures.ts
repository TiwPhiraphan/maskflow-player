import type { MaskflowPlayer } from '../types';

export interface GestureManager {
  enable(): void;
  disable(): void;
  destroy(): void;
}

export function createGestureManager(
  targetElement: HTMLElement,
  player: MaskflowPlayer,
  enabled = true,
): GestureManager {
  let isEnabled = enabled;
  let tapTimer: ReturnType<typeof setTimeout> | null = null;
  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;

  const DOUBLE_TAP_MAX_DELAY = 280; // ms
  const DOUBLE_TAP_MAX_DISTANCE = 40; // px

  function clearTapTimer(): void {
    if (tapTimer !== null) {
      clearTimeout(tapTimer);
      tapTimer = null;
    }
  }

  function isInteractiveElement(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest(
        'button, input, select, textarea, [role="button"], [role="slider"], [role="menu"], [role="menuitem"]',
      ),
    );
  }

  function handlePointerUp(event: PointerEvent): void {
    if (!isEnabled) return;
    if (isInteractiveElement(event.target)) return;

    // Only handle primary pointer (mouse left click, touch single point)
    if (!event.isPrimary) return;

    const now = Date.now();
    const x = event.clientX;
    const y = event.clientY;
    const timeDelta = now - lastTapTime;
    const distance = Math.hypot(x - lastTapX, y - lastTapY);

    if (
      lastTapTime > 0 &&
      timeDelta >= 0 &&
      timeDelta < DOUBLE_TAP_MAX_DELAY &&
      distance < DOUBLE_TAP_MAX_DISTANCE
    ) {
      // Double tap detected!
      clearTapTimer();
      lastTapTime = 0;

      const rect = targetElement.getBoundingClientRect();
      const relativeX = x - rect.left;
      const widthRatio = rect.width > 0 ? relativeX / rect.width : 0.5;

      if (widthRatio < 0.35) {
        // Double tap Left: seek -10s
        player.seekBy(-10);
        player.events.emit('doubletap', { side: 'left', delta: -10 });
      } else if (widthRatio > 0.65) {
        // Double tap Right: seek +10s
        player.seekBy(10);
        player.events.emit('doubletap', { side: 'right', delta: 10 });
      } else {
        // Double tap Center: toggle play/pause
        player.toggle();
        player.events.emit('doubletap', { side: 'center' });
      }
    } else {
      // First tap, queue single tap action
      lastTapTime = now;
      lastTapX = x;
      lastTapY = y;
      clearTapTimer();

      tapTimer = setTimeout(() => {
        // Single tap action: toggle controls visibility
        const currentVisible = player.getState().controlsVisible;
        player.setControlsVisible(!currentVisible);
        tapTimer = null;
      }, DOUBLE_TAP_MAX_DELAY);
    }
  }

  targetElement.addEventListener('pointerup', handlePointerUp);

  return {
    enable(): void {
      isEnabled = true;
    },
    disable(): void {
      isEnabled = false;
      clearTapTimer();
    },
    destroy(): void {
      clearTapTimer();
      targetElement.removeEventListener('pointerup', handlePointerUp);
    },
  };
}
