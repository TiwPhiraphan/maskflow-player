import { createStore } from './store';
import { createEventEmitter } from './events';
import { attachNativeMedia } from './media/native';
import { clamp } from './utils/math';
import type {
  MaskflowPlayer,
  PlayerOptions,
  PlayerState,
  PlayerEvents,
  QualityLevel,
} from './types';

export function createPlayer(
  videoElement: HTMLVideoElement,
  options: PlayerOptions,
): MaskflowPlayer {
  if (!videoElement) {
    throw new Error('[maskflow] createPlayer requires a valid HTMLVideoElement.');
  }

  const initialVolume = typeof options.muted === 'boolean' && options.muted ? 0 : 1;
  const initialMuted = Boolean(options.muted);

  const store = createStore<PlayerState>({
    status: 'idle',
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: initialVolume,
    muted: initialMuted,
    playbackRate: 1,
    isFullscreen: false,
    isPip: false,
    quality: 'auto',
    qualities: [] as QualityLevel[],
    captionsEnabled: false,
    controlsVisible: true,
    error: null,
  });

  const events = createEventEmitter<PlayerEvents>();

  let isDestroyed = false;

  // Media attachment
  const detachMedia = attachNativeMedia(videoElement, options, store, events);

  const player: MaskflowPlayer = {
    store,
    events,
    video: videoElement,
    options,

    getState(): PlayerState {
      return store.getState();
    },

    async play(): Promise<void> {
      if (isDestroyed) return;
      try {
        await videoElement.play();
      } catch (err) {
        console.warn('[maskflow] play() failed:', err);
        throw err;
      }
    },

    pause(): void {
      if (isDestroyed) return;
      videoElement.pause();
    },

    async toggle(): Promise<void> {
      if (isDestroyed) return;
      if (videoElement.paused || videoElement.ended) {
        await player.play();
      } else {
        player.pause();
      }
    },

    seek(time: number): void {
      if (isDestroyed) return;
      const duration = Number.isFinite(videoElement.duration) ? videoElement.duration : Infinity;
      const targetTime = clamp(time, 0, duration);
      videoElement.currentTime = targetTime;
    },

    seekBy(delta: number): void {
      if (isDestroyed) return;
      player.seek(videoElement.currentTime + delta);
    },

    setVolume(volume: number): void {
      if (isDestroyed) return;
      const clamped = clamp(volume, 0, 1);
      videoElement.volume = clamped;
      if (clamped > 0 && videoElement.muted) {
        videoElement.muted = false;
      }
    },

    toggleMute(): void {
      if (isDestroyed) return;
      videoElement.muted = !videoElement.muted;
    },

    setRate(rate: number): void {
      if (isDestroyed) return;
      const clamped = clamp(rate, 0.25, 4);
      videoElement.playbackRate = clamped;
    },

    setQuality(id: string | number | 'auto'): void {
      if (isDestroyed) return;
      store.setState({ quality: id });
      events.emit('qualitychange', id);
    },

    async toggleFullscreen(): Promise<void> {
      if (isDestroyed) return;
      // Basic fallback if called before Phase 2 fullscreen manager
      if (!document.fullscreenElement) {
        if (videoElement.requestFullscreen) {
          await videoElement.requestFullscreen();
          store.setState({ isFullscreen: true });
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          store.setState({ isFullscreen: false });
        }
      }
    },

    async togglePip(): Promise<void> {
      if (isDestroyed) return;
      if (document.pictureInPictureElement) {
        if (document.exitPictureInPicture) {
          await document.exitPictureInPicture();
          store.setState({ isPip: false });
        }
      } else {
        if (videoElement.requestPictureInPicture) {
          await videoElement.requestPictureInPicture();
          store.setState({ isPip: true });
        }
      }
    },

    toggleCaptions(): void {
      if (isDestroyed) return;
      const tracks = videoElement.textTracks;
      if (!tracks || tracks.length === 0) return;

      const currentEnabled = store.getState().captionsEnabled;
      const nextEnabled = !currentEnabled;

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track && (track.kind === 'captions' || track.kind === 'subtitles')) {
          track.mode = nextEnabled ? 'showing' : 'hidden';
        }
      }

      store.setState({ captionsEnabled: nextEnabled });
      events.emit('captionschange', nextEnabled);
    },

    setControlsVisible(visible: boolean): void {
      if (isDestroyed) return;
      store.setState({ controlsVisible: visible });
      events.emit('controlschange', visible);
    },

    destroy(): void {
      if (isDestroyed) return;
      isDestroyed = true;

      detachMedia();
      events.emit('destroy', undefined);
      events.removeAllListeners();

      store.setState({ status: 'idle' });
    },
  };

  // Ready callback & event
  if (options.onReady) {
    try {
      options.onReady(player);
    } catch (err) {
      console.error('[maskflow] Error in onReady callback:', err);
    }
  }

  events.emit('ready', undefined);

  return player;
}
