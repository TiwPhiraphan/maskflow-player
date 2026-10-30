import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from '../core/store';
import { createEventEmitter } from '../core/events';
import { createFullscreenManager } from '../core/features/fullscreen';
import type { PlayerState, PlayerEvents } from '../core/types';

describe('FullscreenManager', () => {
  let container: HTMLDivElement;
  let video: HTMLVideoElement;
  let store: ReturnType<typeof createStore<PlayerState>>;
  let events: ReturnType<typeof createEventEmitter<PlayerEvents>>;

  beforeEach(() => {
    container = document.createElement('div');
    video = document.createElement('video');
    container.appendChild(video);

    container.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

    store = createStore<PlayerState>({
      status: 'idle',
      currentTime: 0,
      duration: 0,
      buffered: 0,
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
    });
    events = createEventEmitter<PlayerEvents>();
  });

  it('enters fullscreen on container', async () => {
    const manager = createFullscreenManager(container, video, store, events);
    await manager.enter();
    expect(container.requestFullscreen).toHaveBeenCalled();
  });

  it('exits fullscreen on document', async () => {
    const manager = createFullscreenManager(container, video, store, events);
    await manager.exit();
    expect(document.exitFullscreen).toHaveBeenCalled();
  });

  it('updates state and emits event when fullscreen changes', () => {
    const manager = createFullscreenManager(container, video, store, events);
    const onFsChange = vi.fn();
    events.on('fullscreenchange', onFsChange);

    // Simulate entering fullscreen
    Object.defineProperty(document, 'fullscreenElement', {
      value: container,
      configurable: true,
      writable: true,
    });
    document.dispatchEvent(new Event('fullscreenchange'));

    expect(store.getState().isFullscreen).toBe(true);
    expect(onFsChange).toHaveBeenCalledWith(true);

    // Simulate exiting fullscreen
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
      writable: true,
    });
    document.dispatchEvent(new Event('fullscreenchange'));

    expect(store.getState().isFullscreen).toBe(false);
    expect(onFsChange).toHaveBeenCalledWith(false);

    manager.destroy();
  });
});
