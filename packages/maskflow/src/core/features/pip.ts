import type { Store } from '../store';
import type { Emitter } from '../events';
import type { PlayerState, PlayerEvents } from '../types';

export interface PipManager {
  isPip(): boolean;
  enter(): Promise<void>;
  exit(): Promise<void>;
  toggle(): Promise<void>;
  destroy(): void;
}

export function createPipManager(
  video: HTMLVideoElement,
  store: Store<PlayerState>,
  events: Emitter<PlayerEvents>,
): PipManager {
  const doc = typeof document !== 'undefined' ? document : null;

  function isPip(): boolean {
    if (!doc) return false;
    return doc.pictureInPictureElement === video;
  }

  function updateState(pip: boolean): void {
    if (store.getState().isPip !== pip) {
      store.setState({ isPip: pip });
      events.emit('pipchange', pip);
    }
  }

  const handleEnterPip = () => {
    updateState(true);
  };

  const handleLeavePip = () => {
    updateState(false);
  };

  video.addEventListener('enterpictureinpicture', handleEnterPip);
  video.addEventListener('leavepictureinpicture', handleLeavePip);

  async function enter(): Promise<void> {
    if (!video.requestPictureInPicture) return;
    try {
      await video.requestPictureInPicture();
    } catch (err) {
      console.warn('[maskflow] PiP request failed:', err);
    }
  }

  async function exit(): Promise<void> {
    if (!doc || !doc.exitPictureInPicture) return;
    try {
      if (doc.pictureInPictureElement) {
        await doc.exitPictureInPicture();
      }
    } catch (err) {
      console.warn('[maskflow] PiP exit failed:', err);
    }
  }

  async function toggle(): Promise<void> {
    if (isPip()) {
      await exit();
    } else {
      await enter();
    }
  }

  function destroy(): void {
    video.removeEventListener('enterpictureinpicture', handleEnterPip);
    video.removeEventListener('leavepictureinpicture', handleLeavePip);
  }

  return {
    isPip,
    enter,
    exit,
    toggle,
    destroy,
  };
}
