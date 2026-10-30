import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from '../core/store';
import { createEventEmitter } from '../core/events';
import { createPipManager } from '../core/features/pip';
import type { PlayerState, PlayerEvents } from '../core/types';

describe('PipManager', () => {
  let video: HTMLVideoElement;
  let store: ReturnType<typeof createStore<PlayerState>>;
  let events: ReturnType<typeof createEventEmitter<PlayerEvents>>;

  beforeEach(() => {
    video = document.createElement('video');
    video.requestPictureInPicture = vi.fn().mockResolvedValue({} as PictureInPictureWindow);
    document.exitPictureInPicture = vi.fn().mockResolvedValue(undefined);

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

  it('enters and exits PiP', async () => {
    const manager = createPipManager(video, store, events);
    await manager.enter();
    expect(video.requestPictureInPicture).toHaveBeenCalled();

    Object.defineProperty(document, 'pictureInPictureElement', {
      value: video,
      configurable: true,
      writable: true,
    });
    await manager.exit();
    expect(document.exitPictureInPicture).toHaveBeenCalled();

    manager.destroy();
  });

  it('syncs isPip state on enter/leave events', () => {
    const manager = createPipManager(video, store, events);
    const onPipChange = vi.fn();
    events.on('pipchange', onPipChange);

    video.dispatchEvent(new Event('enterpictureinpicture'));
    expect(store.getState().isPip).toBe(true);
    expect(onPipChange).toHaveBeenCalledWith(true);

    video.dispatchEvent(new Event('leavepictureinpicture'));
    expect(store.getState().isPip).toBe(false);
    expect(onPipChange).toHaveBeenCalledWith(false);

    manager.destroy();
  });
});
