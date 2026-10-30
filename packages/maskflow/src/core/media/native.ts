import type { Store } from '../store';
import type { Emitter } from '../events';
import type { PlayerState, PlayerEvents, PlayerOptions, MediaSourceItem } from '../types';
import { clamp } from '../utils/math';

export function calculateBuffered(video: HTMLMediaElement): number {
  const duration = video.duration;
  if (!duration || Number.isNaN(duration) || duration <= 0) return 0;
  const time = video.currentTime;
  const ranges = video.buffered;

  for (let i = 0; i < ranges.length; i++) {
    if (ranges.start(i) <= time && time <= ranges.end(i)) {
      return clamp(ranges.end(i) / duration, 0, 1);
    }
  }

  if (ranges.length > 0) {
    return clamp(ranges.end(ranges.length - 1) / duration, 0, 1);
  }

  return 0;
}

export function attachNativeMedia(
  video: HTMLVideoElement,
  options: PlayerOptions,
  store: Store<PlayerState>,
  events: Emitter<PlayerEvents>,
): () => void {
  // Mobile requirement: playsinline
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  // Options configuration
  if (options.poster) {
    video.poster = options.poster;
  }
  if (typeof options.muted === 'boolean') {
    video.muted = options.muted;
  }
  if (typeof options.loop === 'boolean') {
    video.loop = options.loop;
  }

  // Handle Tracks
  if (options.tracks && options.tracks.length > 0) {
    for (const trackDef of options.tracks) {
      const track = document.createElement('track');
      track.kind = trackDef.kind;
      track.src = trackDef.src;
      if (trackDef.srclang) track.srclang = trackDef.srclang;
      if (trackDef.label) track.label = trackDef.label;
      if (trackDef.default) track.default = true;
      video.appendChild(track);
    }
  }

  // Handle Sources
  const src = options.src;
  if (typeof src === 'string') {
    video.src = src;
  } else if (Array.isArray(src)) {
    // Clear existing sources
    const existingSources = video.querySelectorAll('source');
    existingSources.forEach((s) => s.remove());

    for (const item of src as MediaSourceItem[]) {
      const sourceEl = document.createElement('source');
      sourceEl.src = item.src;
      if (item.type) {
        sourceEl.type = item.type;
      }
      video.appendChild(sourceEl);
    }
  }

  const handleLoadStart = () => {
    store.setState({ status: 'loading' });
  };

  const handleLoadedMetadata = () => {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    store.setState({
      duration,
      currentTime: video.currentTime,
      volume: video.volume,
      muted: video.muted,
      playbackRate: video.playbackRate,
    });
  };

  const handleCanPlay = () => {
    if (!video.paused && !video.ended) {
      store.setState({ status: 'playing' });
    } else {
      const currentState = store.getState().status;
      if (currentState === 'loading' || currentState === 'idle' || currentState === 'buffering') {
        store.setState({ status: 'ready' });
      }
    }
    events.emit('canplay', undefined);
  };

  const handlePlay = () => {
    store.setState({ status: 'playing' });
    events.emit('play', undefined);
  };

  const handlePlaying = () => {
    store.setState({ status: 'playing' });
    events.emit('playing', undefined);
  };

  const handlePause = () => {
    if (!video.ended) {
      store.setState({ status: 'paused' });
    }
    events.emit('pause', undefined);
  };

  const handleTimeUpdate = () => {
    const currentTime = video.currentTime;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const buffered = calculateBuffered(video);

    const update: Partial<PlayerState> = {
      currentTime,
      duration: duration || store.getState().duration,
      buffered,
    };

    if (!video.paused && !video.ended && store.getState().status !== 'playing') {
      update.status = 'playing';
    }

    store.setState(update);
    events.emit('timeupdate', { currentTime, duration });
  };

  const handleProgress = () => {
    const buffered = calculateBuffered(video);
    store.setState({ buffered });
  };

  const handleVolumeChange = () => {
    store.setState({
      volume: video.volume,
      muted: video.muted,
    });
    events.emit('volumechange', { volume: video.volume, muted: video.muted });
  };

  const handleRateChange = () => {
    store.setState({ playbackRate: video.playbackRate });
    events.emit('ratechange', video.playbackRate);
  };

  const handleSeeking = () => {
    events.emit('seeking', video.currentTime);
  };

  const handleSeeked = () => {
    events.emit('seeked', video.currentTime);
  };

  const handleWaiting = () => {
    store.setState({ status: 'buffering' });
    events.emit('waiting', undefined);
  };

  const handleEnded = () => {
    store.setState({ status: 'ended' });
    events.emit('ended', undefined);
  };

  const handleError = () => {
    const mediaError = video.error;
    let message = 'An unknown media error occurred.';
    let code: number | undefined;

    if (mediaError) {
      code = mediaError.code;
      switch (mediaError.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          message = 'Media playback was aborted.';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          message = 'A network error caused the media download to fail.';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          message = 'The media playback was aborted due to a corruption or unsupported feature.';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message = 'The media format or source is not supported.';
          break;
      }
    }

    store.setState({ status: 'error', error: message });
    events.emit('error', { message, code, originalError: mediaError });
    if (options.onError) {
      options.onError(message);
    }
  };

  video.addEventListener('loadstart', handleLoadStart);
  video.addEventListener('loadedmetadata', handleLoadedMetadata);
  video.addEventListener('canplay', handleCanPlay);
  video.addEventListener('play', handlePlay);
  video.addEventListener('playing', handlePlaying);
  video.addEventListener('pause', handlePause);
  video.addEventListener('timeupdate', handleTimeUpdate);
  video.addEventListener('progress', handleProgress);
  video.addEventListener('volumechange', handleVolumeChange);
  video.addEventListener('ratechange', handleRateChange);
  video.addEventListener('seeking', handleSeeking);
  video.addEventListener('seeked', handleSeeked);
  video.addEventListener('waiting', handleWaiting);
  video.addEventListener('ended', handleEnded);
  video.addEventListener('error', handleError);

  // If metadata is already loaded (e.g. video was pre-initialized)
  if (video.readyState >= 1) {
    handleLoadedMetadata();
  }
  if (video.readyState >= 3) {
    handleCanPlay();
  }

  // AutoPlay handling
  if (options.autoPlay) {
    video.play().catch((err) => {
      // Browsers often block unmuted autoplay, which is expected
      console.warn('[maskflow] Autoplay failed:', err);
    });
  }

  return () => {
    video.removeEventListener('loadstart', handleLoadStart);
    video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    video.removeEventListener('canplay', handleCanPlay);
    video.removeEventListener('play', handlePlay);
    video.removeEventListener('playing', handlePlaying);
    video.removeEventListener('pause', handlePause);
    video.removeEventListener('timeupdate', handleTimeUpdate);
    video.removeEventListener('progress', handleProgress);
    video.removeEventListener('volumechange', handleVolumeChange);
    video.removeEventListener('ratechange', handleRateChange);
    video.removeEventListener('seeking', handleSeeking);
    video.removeEventListener('seeked', handleSeeked);
    video.removeEventListener('waiting', handleWaiting);
    video.removeEventListener('ended', handleEnded);
    video.removeEventListener('error', handleError);
  };
}
