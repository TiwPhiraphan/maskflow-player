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
  let isMenuDismissed = false;
  let tapControlsVisible: boolean | null = null;

  const DOUBLE_TAP_MAX_DELAY = 280; // ms
  const DOUBLE_TAP_MAX_DISTANCE = 40; // px

  function clearTapTimer(): void {
    if (tapTimer !== null) {
      clearTimeout(tapTimer);
      tapTimer = null;
    }
  }

  function isInteractiveElement(target: EventTarget | null): boolean {
    if (!target || !(target instanceof Element)) return false;
    return Boolean(
      target.closest(
        'button, input, select, textarea, [role="button"], [role="slider"], [role="menu"], [role="menuitem"], .mf-controls, .mf-menu',
      ),
    );
  }

  function handlePointerDown(event: PointerEvent): void {
    if (!event.isPrimary) return;
    isMenuDismissed = Boolean(targetElement.querySelector('.mf-menu.mf-menu-open'));
    tapControlsVisible = player.getState().controlsVisible;
  }

  function handlePointerUp(event: PointerEvent): void {
    if (!isEnabled) return;
    if (isInteractiveElement(event.target)) return;

    // Only handle primary pointer (mouse left click, touch single point)
    if (!event.isPrimary) return;

    // If pointerdown happened while a menu was open, the tap was meant to dismiss the menu
    if (isMenuDismissed) {
      isMenuDismissed = false;
      tapControlsVisible = null;
      return;
    }

    const now = Date.now();
    const x = event.clientX;
    const y = event.clientY;
    const timeDelta = now - lastTapTime;
    const distance = Math.hypot(x - lastTapX, y - lastTapY);
    const initialControlsVisible =
      tapControlsVisible !== null ? tapControlsVisible : player.getState().controlsVisible;
    tapControlsVisible = null;

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
        (player as unknown as { _isGestureSeeking?: boolean })._isGestureSeeking = true;
        try {
          player.seekBy(-10);
        } finally {
          (player as unknown as { _isGestureSeeking?: boolean })._isGestureSeeking = false;
        }
        player.events.emit('doubletap', { side: 'left', delta: -10 });
      } else if (widthRatio > 0.65) {
        // Double tap Right: seek +10s
        (player as unknown as { _isGestureSeeking?: boolean })._isGestureSeeking = true;
        try {
          player.seekBy(10);
        } finally {
          (player as unknown as { _isGestureSeeking?: boolean })._isGestureSeeking = false;
        }
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
        // Single tap action: toggle controls visibility based on state when tapped
        player.setControlsVisible(!initialControlsVisible);
        tapTimer = null;
      }, DOUBLE_TAP_MAX_DELAY);
    }
  }

  targetElement.addEventListener('pointerdown', handlePointerDown);
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
      targetElement.removeEventListener('pointerdown', handlePointerDown);
      targetElement.removeEventListener('pointerup', handlePointerUp);
    },
  };
}
