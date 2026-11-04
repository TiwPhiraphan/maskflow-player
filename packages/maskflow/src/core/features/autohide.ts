import type { MaskflowPlayer } from '../types';

export interface AutohideManager {
  show(): void;
  hide(): void;
  lock(locked: boolean): void;
  destroy(): void;
}

export function createAutohideManager(
  container: HTMLElement,
  player: MaskflowPlayer,
  delay = 3000,
): AutohideManager {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let isLocked = false;

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function shouldStayVisible(): boolean {
    if (isLocked) return true;
    const state = player.getState();
    const isVideoPaused = player.video ? player.video.paused : state.status !== 'playing';

    // Never hide while paused, in error, or not playing
    if (state.error || state.status === 'error' || state.status !== 'playing' || isVideoPaused) {
      return true;
    }

    // Never hide while keyboard focus is inside the controls
    const doc = typeof document !== 'undefined' ? document : null;
    const activeEl = doc?.activeElement;
    if (activeEl && container.contains(activeEl) && activeEl !== container) {
      return true;
    }

    return false;
  }

  function hide(): void {
    if (shouldStayVisible()) return;
    player.setControlsVisible(false);
  }

  function startTimer(): void {
    clearTimer();
    if (shouldStayVisible()) {
      return;
    }

    timer = setTimeout(() => {
      hide();
    }, delay);
  }

  function show(): void {
    player.setControlsVisible(true);
    startTimer();
  }

  const handleActivity = (e?: Event) => {
    // For touch devices, pointermove fires during touch scrolls/drags; don't trigger show() on touchmove
    if (e && 'pointerType' in e && (e as PointerEvent).pointerType === 'touch') {
      return;
    }
    show();
  };

  const handlePointerDown = () => {
    // If controls are already visible, touch/click activity refreshes the autohide timer
    if (player.getState().controlsVisible) {
      startTimer();
    }
  };

  const handlePointerLeave = (e: PointerEvent) => {
    // Never hide on touch/pen leave (fires on mobile devices every time a finger lifts)
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      return;
    }
    // Mobile / touch devices with coarse pointers should never hide on pointer leave
    if (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)')?.matches) {
      return;
    }
    // Only real desktop mouse cursors leaving should trigger hide
    if (e.pointerType !== 'mouse') {
      return;
    }
    if (player.getState().status === 'playing' && !shouldStayVisible()) {
      hide();
    }
  };

  // Activity events: any pointer move, touch, or key press shows controls again
  container.addEventListener('pointermove', handleActivity);
  container.addEventListener('pointerdown', handlePointerDown);
  container.addEventListener('keydown', handleActivity);
  const handleFocusIn = (e: FocusEvent) => {
    // Only show controls if keyboard focus moved to an interactive child element
    // Never trigger show() when the container itself receives focus
    if (e.target && e.target !== container && container.contains(e.target as Node)) {
      show();
    }
  };

  container.addEventListener('focusin', handleFocusIn);
  container.addEventListener('pointerleave', handlePointerLeave);

  // Playback state changes
  const unsubPlay = player.events.on('play', () => {
    startTimer();
  });

  const unsubPause = player.events.on('pause', () => {
    clearTimer();
    player.setControlsVisible(true);
  });

  const unsubEnded = player.events.on('ended', () => {
    clearTimer();
    player.setControlsVisible(true);
  });

  const unsubControls = player.events.on('controlschange', (visible) => {
    if (visible) {
      startTimer();
    } else {
      clearTimer();
    }
  });

  return {
    show,
    hide,
    lock(locked: boolean): void {
      isLocked = locked;
      if (locked) {
        clearTimer();
        player.setControlsVisible(true);
      } else {
        startTimer();
      }
    },
    destroy(): void {
      clearTimer();
      container.removeEventListener('pointermove', handleActivity);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('keydown', handleActivity);
      container.removeEventListener('focusin', handleFocusIn);
      container.removeEventListener('pointerleave', handlePointerLeave);
      unsubPlay();
      unsubPause();
      unsubEnded();
      unsubControls();
    },
  };
}
