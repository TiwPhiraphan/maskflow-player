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
  delay = 2500,
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
    if (state.status !== 'playing') {
      return true;
    }

    // Check if focused element inside container has keyboard focus
    const doc = typeof document !== 'undefined' ? document : null;
    const activeEl = doc?.activeElement;
    if (activeEl && container.contains(activeEl) && activeEl !== container) {
      // An interactive child control is focused
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
    // Never hide on touch/pen leave (fires on mobile devices every time a finger lifts!)
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      return;
    }
    if (player.getState().status === 'playing' && !shouldStayVisible()) {
      hide();
    }
  };

  // Activity events
  container.addEventListener('pointermove', handleActivity);
  container.addEventListener('pointerdown', handlePointerDown);
  container.addEventListener('keydown', handleActivity);
  container.addEventListener('focusin', handleActivity);
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
      container.removeEventListener('focusin', handleActivity);
      container.removeEventListener('pointerleave', handlePointerLeave);
      unsubPlay();
      unsubPause();
      unsubEnded();
      unsubControls();
    },
  };
}
