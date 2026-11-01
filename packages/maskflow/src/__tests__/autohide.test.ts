import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createEventEmitter } from '../core/events';
import { createAutohideManager } from '../core/features/autohide';
import type { MaskflowPlayer, PlayerEvents, PlayerState } from '../core/types';

describe('AutohideManager', () => {
  let container: HTMLDivElement;
  let mockPlayer: MaskflowPlayer;
  let events: ReturnType<typeof createEventEmitter<PlayerEvents>>;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    events = createEventEmitter<PlayerEvents>();

    const mockState: PlayerState = {
      status: 'playing',
      currentTime: 10,
      duration: 100,
      buffered: 0.5,
      volume: 1,
      muted: false,
      playbackRate: 1,
      isFullscreen: false,
      isPip: false,
      quality: 'auto',
      qualities: [],
      captionsEnabled: false,
      controlsVisible: true,
      aspectRatio: '16/9',
      error: null,
    };

    mockPlayer = {
      getState: vi.fn(() => mockState),
      events,
      setControlsVisible: vi.fn(),
    } as unknown as MaskflowPlayer;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hides controls after delay when playing', () => {
    const manager = createAutohideManager(container, mockPlayer, 2000);
    manager.show();

    vi.advanceTimersByTime(1999);
    expect(mockPlayer.setControlsVisible).toHaveBeenCalledWith(true);

    vi.advanceTimersByTime(2);
    expect(mockPlayer.setControlsVisible).toHaveBeenCalledWith(false);

    manager.destroy();
  });

  it('resets timer on pointer activity', () => {
    const manager = createAutohideManager(container, mockPlayer, 2000);
    manager.show();

    vi.advanceTimersByTime(1500);
    container.dispatchEvent(new Event('pointermove'));

    vi.advanceTimersByTime(1000); // 2500ms total, but 1000ms since reset
    expect(mockPlayer.setControlsVisible).not.toHaveBeenCalledWith(false);

    vi.advanceTimersByTime(1001); // 2001ms since reset
    expect(mockPlayer.setControlsVisible).toHaveBeenCalledWith(false);

    manager.destroy();
  });

  it('does not hide when locked', () => {
    const manager = createAutohideManager(container, mockPlayer, 2000);
    manager.lock(true);

    vi.advanceTimersByTime(5000);
    expect(mockPlayer.setControlsVisible).not.toHaveBeenCalledWith(false);

    manager.destroy();
  });

  it('does not hide controls on pointerleave from touch (mobile usability)', () => {
    const manager = createAutohideManager(container, mockPlayer, 2000);
    manager.show();

    // Simulate mobile touch pointerleave (when finger lifts off digitizer)
    const touchLeaveEvent = new Event('pointerleave');
    Object.defineProperty(touchLeaveEvent, 'pointerType', { value: 'touch' });
    container.dispatchEvent(touchLeaveEvent);

    // Should NOT hide immediately
    expect(mockPlayer.setControlsVisible).not.toHaveBeenCalledWith(false);

    // But should still hide after full delay
    vi.advanceTimersByTime(2001);
    expect(mockPlayer.setControlsVisible).toHaveBeenCalledWith(false);

    manager.destroy();
  });

  it('hides controls on mouse pointerleave (desktop)', () => {
    const manager = createAutohideManager(container, mockPlayer, 2000);
    manager.show();

    const mouseLeaveEvent = new Event('pointerleave');
    Object.defineProperty(mouseLeaveEvent, 'pointerType', { value: 'mouse' });
    container.dispatchEvent(mouseLeaveEvent);

    expect(mockPlayer.setControlsVisible).toHaveBeenCalledWith(false);

    manager.destroy();
  });
});
