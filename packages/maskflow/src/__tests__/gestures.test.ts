import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createEventEmitter } from '../core/events';
import { createGestureManager } from '../core/features/gestures';
import type { MaskflowPlayer, PlayerEvents, PlayerState } from '../core/types';

describe('GestureManager', () => {
  let target: HTMLDivElement;
  let mockPlayer: MaskflowPlayer;
  let mockState: PlayerState;
  let events: ReturnType<typeof createEventEmitter<PlayerEvents>>;

  beforeEach(() => {
    vi.useFakeTimers();
    target = document.createElement('div');
    document.body.appendChild(target);

    // Mock bounding rect: width 1000px, from 0 to 1000
    target.getBoundingClientRect = vi.fn(
      () =>
        ({
          left: 0,
          top: 0,
          right: 1000,
          bottom: 500,
          width: 1000,
          height: 500,
          x: 0,
          y: 0,
          toJSON: () => {},
        }) as DOMRect,
    );

    events = createEventEmitter<PlayerEvents>();

    mockState = {
      status: 'playing',
      currentTime: 30,
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
      seekBy: vi.fn(),
      toggle: vi.fn(),
    } as unknown as MaskflowPlayer;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function firePointer(x: number, y: number) {
    const downEvent = new MouseEvent('pointerdown', {
      bubbles: true,
      clientX: x,
      clientY: y,
    });
    Object.defineProperty(downEvent, 'isPrimary', { value: true });
    target.dispatchEvent(downEvent);

    const upEvent = new MouseEvent('pointerup', {
      bubbles: true,
      clientX: x,
      clientY: y,
    });
    Object.defineProperty(upEvent, 'isPrimary', { value: true });
    target.dispatchEvent(upEvent);
  }

  it('triggers single tap to toggle controls when visible', () => {
    mockState.controlsVisible = true;
    const manager = createGestureManager(target, mockPlayer);

    firePointer(500, 250);
    expect(mockPlayer.setControlsVisible).not.toHaveBeenCalled();

    // Advance past single-tap timer
    vi.advanceTimersByTime(300);
    expect(mockPlayer.setControlsVisible).toHaveBeenCalledWith(false);

    manager.destroy();
  });

  it('triggers single tap to show controls when hidden', () => {
    mockState.controlsVisible = false;
    const manager = createGestureManager(target, mockPlayer);

    firePointer(500, 250);
    expect(mockPlayer.setControlsVisible).not.toHaveBeenCalled();

    // Advance past single-tap timer
    vi.advanceTimersByTime(300);
    expect(mockPlayer.setControlsVisible).toHaveBeenCalledWith(true);

    manager.destroy();
  });

  it('triggers double tap on left to seek -10s', () => {
    const manager = createGestureManager(target, mockPlayer);
    const onDoubleTap = vi.fn();
    events.on('doubletap', onDoubleTap);

    // Tap 1
    firePointer(150, 250);
    vi.advanceTimersByTime(50);
    // Tap 2 at left side (150px / 1000px = 15%)
    firePointer(155, 250);

    expect(mockPlayer.seekBy).toHaveBeenCalledWith(-10);
    expect(onDoubleTap).toHaveBeenCalledWith({ side: 'left', delta: -10 });

    manager.destroy();
  });

  it('triggers double tap on right to seek +10s', () => {
    const manager = createGestureManager(target, mockPlayer);
    const onDoubleTap = vi.fn();
    events.on('doubletap', onDoubleTap);

    // Tap 1
    firePointer(850, 250);
    vi.advanceTimersByTime(50);
    // Tap 2 at right side (850px / 1000px = 85%)
    firePointer(855, 250);

    expect(mockPlayer.seekBy).toHaveBeenCalledWith(10);
    expect(onDoubleTap).toHaveBeenCalledWith({ side: 'right', delta: 10 });

    manager.destroy();
  });
});
