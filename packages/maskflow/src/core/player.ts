import { createStore } from './store';
import { createEventEmitter } from './events';
import { attachNativeMedia } from './media/native';
import { isHlsSource, attachHlsMedia, type HlsAdapter } from './media/hls';
import { createFullscreenManager } from './features/fullscreen';
import { createPipManager } from './features/pip';
import { createKeyboardManager } from './features/keyboard';
import { createPersistenceManager } from './features/persistence';
import { createAutohideManager } from './features/autohide';
import { createGestureManager } from './features/gestures';
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

  const container = options.container || videoElement.parentElement || videoElement;
  const initialVolume = typeof options.muted === 'boolean' && options.muted ? 0 : 1;
  const initialMuted = Boolean(options.muted);
  const initialAspectRatio = options.aspectRatio || '16/9';

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
    aspectRatio: initialAspectRatio,
    error: null,
  });

  const events = createEventEmitter<PlayerEvents>();

  let isDestroyed = false;
  let hlsAdapter: HlsAdapter | null = null;

  // Media attachment: check if HLS or standard native source
  const isHls = isHlsSource(options.src);
  let detachMedia: () => void;

  if (isHls) {
    // For HLS, we attach native event listeners with src skipped so hls.js can load it
    detachMedia = attachNativeMedia(videoElement, { ...options, src: '' }, store, events);
    // Initialize HLS asynchronously
    attachHlsMedia(videoElement, options, store, events).then((adapter) => {
      if (isDestroyed) {
        adapter?.destroy();
      } else {
        hlsAdapter = adapter;
      }
    });
  } else {
    detachMedia = attachNativeMedia(videoElement, options, store, events);
  }

  const fullscreenManager = createFullscreenManager(container, videoElement, store, events);
  const pipManager = createPipManager(videoElement, store, events);

  const player: MaskflowPlayer = {
    store,
    events,
    video: videoElement,
    options,
    container,

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
      if (hlsAdapter) {
        hlsAdapter.setQuality(id);
      }
      store.setState({ quality: id });
      events.emit('qualitychange', id);
    },

    async toggleFullscreen(): Promise<void> {
      if (isDestroyed) return;
      await fullscreenManager.toggle();
    },

    async togglePip(): Promise<void> {
      if (isDestroyed) return;
      await pipManager.toggle();
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

    lockControls(locked: boolean): void {
      if (isDestroyed) return;
      autohideManager.lock(locked);
    },

    setAspectRatio(ratio: string): void {
      if (isDestroyed) return;
      store.setState({ aspectRatio: ratio });
    },

    destroy(): void {
      if (isDestroyed) return;
      isDestroyed = true;

      autohideManager.destroy();
      gestureManager.destroy();
      keyboardManager.destroy();
      persistenceManager.destroy();
      fullscreenManager.destroy();
      pipManager.destroy();
      hlsAdapter?.destroy();
      detachMedia();

      events.emit('destroy', undefined);
      events.removeAllListeners();

      store.setState({ status: 'idle' });
    },
  };

  const keyboardManager = createKeyboardManager(container, player, options.keyboard !== false);
  const persistenceManager = createPersistenceManager(player, Boolean(options.persist));
  const autohideManager = createAutohideManager(container, player, options.autoHideDelay ?? 2500);
  const gestureManager = createGestureManager(container, player, options.gestures !== false);

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
