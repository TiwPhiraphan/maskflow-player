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
  let seekModeTimer: ReturnType<typeof setTimeout> | null = null;
  let seekMode: { side: 'left' | 'right'; seconds: number } | null = null;

  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;
  let isMenuDismissed = false;
  let tapControlsVisible: boolean | null = null;

  const DOUBLE_TAP_MAX_DELAY = 260; // ms
  const DOUBLE_TAP_MAX_DISTANCE = 40; // px
  const SEEK_MODE_TIMEOUT = 1000; // ~1s auto-exit

  function clearTapTimer(): void {
    if (tapTimer !== null) {
      clearTimeout(tapTimer);
      tapTimer = null;
    }
  }

  function clearSeekModeTimer(): void {
    if (seekModeTimer !== null) {
      clearTimeout(seekModeTimer);
      seekModeTimer = null;
    }
  }

  function resetSeekModeTimer(): void {
    clearSeekModeTimer();
    seekModeTimer = setTimeout(() => {
      seekMode = null;
    }, SEEK_MODE_TIMEOUT);
  }

  function isInteractiveElement(target: EventTarget | null): boolean {
    if (!target || !(target instanceof Element)) return false;
    return Boolean(
      target.closest(
        'button, input, select, textarea, [role="button"], [role="slider"], [role="menu"], [role="menuitem"], .mf-bottom-bar, .mf-top-bar, .mf-menu, .mf-big-play',
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

    // Only handle primary pointer
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

    const rect = targetElement.getBoundingClientRect();
    const relativeX = x - rect.left;
    const widthRatio = rect.width > 0 ? relativeX / rect.width : 0.5;

    // Check if we are currently in seek mode
    if (seekMode !== null) {
      const isSameSide =
        (seekMode.side === 'left' && widthRatio < 0.45) ||
        (seekMode.side === 'right' && widthRatio > 0.55);

      if (isSameSide) {
        // Single tap while in seek mode adds another 10s to the stack
        seekMode.seconds += 10;
        const delta = seekMode.side === 'left' ? -10 : 10;
        const totalDelta = seekMode.side === 'left' ? -seekMode.seconds : seekMode.seconds;

        (player as unknown as { _isGestureSeeking?: boolean })._isGestureSeeking = true;
        try {
          player.seekBy(delta);
        } finally {
          (player as unknown as { _isGestureSeeking?: boolean })._isGestureSeeking = false;
        }

        player.events.emit('doubletap', { side: seekMode.side, delta: totalDelta });
        resetSeekModeTimer();
        return;
      } else {
        // Tap elsewhere exits seek mode immediately
        seekMode = null;
        clearSeekModeTimer();
      }
    }

    // Outside seek mode: check for double tap
    if (
      lastTapTime > 0 &&
      timeDelta >= 0 &&
      timeDelta < DOUBLE_TAP_MAX_DELAY &&
      distance < DOUBLE_TAP_MAX_DISTANCE
    ) {
      // Double tap detected!
      clearTapTimer();
      lastTapTime = 0;

      if (widthRatio < 0.4) {
        // Double tap Left zone: enters seek mode and seeks -10s
        seekMode = { side: 'left', seconds: 10 };
        (player as unknown as { _isGestureSeeking?: boolean })._isGestureSeeking = true;
        try {
          player.seekBy(-10);
        } finally {
          (player as unknown as { _isGestureSeeking?: boolean })._isGestureSeeking = false;
        }
        player.events.emit('doubletap', { side: 'left', delta: -10 });
        resetSeekModeTimer();
      } else if (widthRatio > 0.6) {
        // Double tap Right zone: enters seek mode and seeks +10s
        seekMode = { side: 'right', seconds: 10 };
        (player as unknown as { _isGestureSeeking?: boolean })._isGestureSeeking = true;
        try {
          player.seekBy(10);
        } finally {
          (player as unknown as { _isGestureSeeking?: boolean })._isGestureSeeking = false;
        }
        player.events.emit('doubletap', { side: 'right', delta: 10 });
        resetSeekModeTimer();
      } else {
        // Double tap Center: toggle play/pause
        player.toggle();
        player.events.emit('doubletap', { side: 'center' });
      }
    } else {
      // First tap, queue single tap action (~250ms delay)
      lastTapTime = now;
      lastTapX = x;
      lastTapY = y;
      clearTapTimer();

      tapTimer = setTimeout(() => {
        // Single tap outside seek mode toggles controls visibility
        player.setControlsVisible(!initialControlsVisible);
        tapTimer = null;
      }, 250);
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
      clearSeekModeTimer();
      seekMode = null;
    },
    destroy(): void {
      clearTapTimer();
      clearSeekModeTimer();
      seekMode = null;
      targetElement.removeEventListener('pointerdown', handlePointerDown);
      targetElement.removeEventListener('pointerup', handlePointerUp);
    },
  };
}
