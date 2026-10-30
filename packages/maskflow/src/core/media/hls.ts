import type { Store } from '../store';
import type { Emitter } from '../events';
import type { PlayerState, PlayerEvents, PlayerOptions, QualityLevel } from '../types';

export function isHlsSource(source: unknown): boolean {
  if (typeof source === 'string') {
    return /\.m3u8(\?.*)?$/i.test(source);
  }
  if (Array.isArray(source)) {
    return source.some((item) => {
      if (typeof item === 'object' && item !== null && 'src' in item) {
        const srcStr = String((item as { src: string }).src);
        const typeStr = 'type' in item ? String((item as { type: string }).type) : '';
        return (
          /\.m3u8(\?.*)?$/i.test(srcStr) ||
          /application\/(x-mpegurl|vnd\.apple\.mpegurl)/i.test(typeStr)
        );
      }
      return false;
    });
  }
  return false;
}

export function getHlsUrl(source: unknown): string {
  if (typeof source === 'string') {
    return source;
  }
  if (Array.isArray(source)) {
    for (const item of source) {
      if (typeof item === 'object' && item !== null && 'src' in item) {
        const srcStr = String((item as { src: string }).src);
        const typeStr = 'type' in item ? String((item as { type: string }).type) : '';
        if (
          /\.m3u8(\?.*)?$/i.test(srcStr) ||
          /application\/(x-mpegurl|vnd\.apple\.mpegurl)/i.test(typeStr)
        ) {
          return srcStr;
        }
      }
    }
  }
  return '';
}

export interface HlsAdapter {
  setQuality(id: string | number | 'auto'): void;
  destroy(): void;
}

export async function attachHlsMedia(
  video: HTMLVideoElement,
  options: PlayerOptions,
  store: Store<PlayerState>,
  events: Emitter<PlayerEvents>,
): Promise<HlsAdapter | null> {
  const hlsUrl = getHlsUrl(options.src);
  if (!hlsUrl) return null;

  // Check if browser supports native HLS (Safari / iOS)
  const canPlayNativeHls = Boolean(
    video.canPlayType('application/vnd.apple.mpegurl') ||
    video.canPlayType('application/x-mpegURL'),
  );

  // If native HLS is supported and we're on Safari / iOS, let native handle it
  const isApple =
    typeof navigator !== 'undefined' &&
    /Safari/i.test(navigator.userAgent) &&
    !/Chrome|Chromium|Android/i.test(navigator.userAgent);

  if (canPlayNativeHls && isApple) {
    video.src = hlsUrl;
    return {
      setQuality: () => {},
      destroy: () => {},
    };
  }

  // Otherwise, load hls.js dynamically
  try {
    const hlsModule = await import('hls.js');
    const Hls = hlsModule.default;

    if (!Hls || !Hls.isSupported()) {
      if (canPlayNativeHls) {
        video.src = hlsUrl;
        return {
          setQuality: () => {},
          destroy: () => {},
        };
      }
      throw new Error('HLS is not supported in this browser.');
    }

    const hls = new Hls({
      autoStartLoad: true,
      enableWorker: true,
    });

    hls.attachMedia(video);

    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(hlsUrl);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      const levels: QualityLevel[] = data.levels.map((lvl, index) => {
        const height = lvl.height;
        const bitrate = lvl.bitrate;
        const label = height
          ? `${height}p`
          : bitrate
            ? `${Math.round(bitrate / 1000)} kbps`
            : `Level ${index + 1}`;
        return {
          id: index,
          label,
          height: height || undefined,
          bitrate: bitrate || undefined,
        };
      });

      const allQualities: QualityLevel[] = [{ id: 'auto', label: 'Auto' }, ...levels];

      store.setState({
        qualities: allQualities,
        quality: 'auto',
      });
      events.emit('qualitieschange', allQualities);
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
      const isAuto = hls.autoLevelEnabled;
      const currentId = isAuto ? 'auto' : data.level;
      store.setState({ quality: currentId });
      events.emit('qualitychange', currentId);
    });

    hls.on(Hls.Events.ERROR, (_, errorData) => {
      if (errorData.fatal) {
        switch (errorData.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.warn('[maskflow] Fatal network error encountered, attempting recovery...');
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.warn('[maskflow] Fatal media error encountered, attempting recovery...');
            hls.recoverMediaError();
            break;
          default:
            console.error('[maskflow] Unrecoverable HLS error:', errorData);
            store.setState({
              status: 'error',
              error: errorData.details || 'Fatal HLS streaming error.',
            });
            events.emit('error', {
              message: errorData.details || 'Fatal HLS streaming error.',
              originalError: errorData,
            });
            hls.destroy();
            break;
        }
      }
    });

    return {
      setQuality(id: string | number | 'auto'): void {
        if (id === 'auto') {
          hls.currentLevel = -1; // -1 means auto in hls.js
        } else {
          const index = typeof id === 'number' ? id : parseInt(id, 10);
          if (!Number.isNaN(index) && index >= 0 && index < hls.levels.length) {
            hls.currentLevel = index;
          }
        }
      },
      destroy(): void {
        hls.destroy();
      },
    };
  } catch (err) {
    if (canPlayNativeHls) {
      video.src = hlsUrl;
      return {
        setQuality: () => {},
        destroy: () => {},
      };
    }
    console.error('[maskflow] Failed to initialize HLS:', err);
    store.setState({
      status: 'error',
      error: 'Failed to load HLS streaming engine.',
    });
    return null;
  }
}
