import type { Store } from '../store';
import type { Emitter } from '../events';
import type { PlayerState, PlayerEvents } from '../types';

export interface FullscreenManager {
  isFullscreen(): boolean;
  enter(): Promise<void>;
  exit(): Promise<void>;
  toggle(): Promise<void>;
  destroy(): void;
}

// Vendor prefixes interface
interface VendorDocument extends Document {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface VendorElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface WebkitVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitSupportsFullscreen?: boolean;
  webkitDisplayingFullscreen?: boolean;
}

export function createFullscreenManager(
  container: HTMLElement,
  video: HTMLVideoElement,
  store: Store<PlayerState>,
  events: Emitter<PlayerEvents>,
): FullscreenManager {
  const doc = (typeof document !== 'undefined' ? document : null) as VendorDocument | null;
  const webkitVideo = video as WebkitVideoElement;

  function isFullscreen(): boolean {
    if (!doc) return false;
    const fullscreenEl =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    if (fullscreenEl && (fullscreenEl === container || container.contains(fullscreenEl))) {
      return true;
    }

    if (typeof webkitVideo.webkitDisplayingFullscreen === 'boolean') {
      return webkitVideo.webkitDisplayingFullscreen;
    }

    return false;
  }

  function updateState(fullscreen: boolean): void {
    if (store.getState().isFullscreen !== fullscreen) {
      store.setState({ isFullscreen: fullscreen });
      events.emit('fullscreenchange', fullscreen);
    }
  }

  const handleFullscreenChange = () => {
    updateState(isFullscreen());
  };

  const handleWebkitBegin = () => {
    updateState(true);
  };

  const handleWebkitEnd = () => {
    updateState(false);
  };

  // Attach change listeners
  if (doc) {
    doc.addEventListener('fullscreenchange', handleFullscreenChange);
    doc.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    doc.addEventListener('mozfullscreenchange', handleFullscreenChange);
    doc.addEventListener('MSFullscreenChange', handleFullscreenChange);
  }

  video.addEventListener('webkitbeginfullscreen', handleWebkitBegin);
  video.addEventListener('webkitendfullscreen', handleWebkitEnd);

  async function enter(): Promise<void> {
    const el = container as VendorElement;

    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        await el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      } else if (typeof webkitVideo.webkitEnterFullscreen === 'function') {
        // iOS Safari fallback on <video>
        webkitVideo.webkitEnterFullscreen();
      }
    } catch (err) {
      console.warn('[maskflow] Fullscreen request failed:', err);
    } finally {
      updateState(isFullscreen());
    }
  }

  async function exit(): Promise<void> {
    if (!doc) return;

    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      } else if (typeof webkitVideo.webkitExitFullscreen === 'function') {
        webkitVideo.webkitExitFullscreen();
      }
    } catch (err) {
      console.warn('[maskflow] Fullscreen exit failed:', err);
    } finally {
      updateState(isFullscreen());
    }
  }

  async function toggle(): Promise<void> {
    if (isFullscreen()) {
      await exit();
    } else {
      await enter();
    }
  }

  function destroy(): void {
    if (doc) {
      doc.removeEventListener('fullscreenchange', handleFullscreenChange);
      doc.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      doc.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      doc.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    }
    video.removeEventListener('webkitbeginfullscreen', handleWebkitBegin);
    video.removeEventListener('webkitendfullscreen', handleWebkitEnd);
  }

  return {
    isFullscreen,
    enter,
    exit,
    toggle,
    destroy,
  };
}
