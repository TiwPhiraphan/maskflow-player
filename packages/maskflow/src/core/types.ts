import type { Store } from './store';
import type { Emitter } from './events';

export type PlayerStatus =
  'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error';

export interface QualityLevel {
  id: string | number;
  label: string;
  height?: number | undefined;
  bitrate?: number | undefined;
}

export interface PlayerState {
  status: PlayerStatus;
  currentTime: number;
  duration: number;
  buffered: number; // 0 to 1
  volume: number; // 0 to 1
  muted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isPip: boolean;
  quality: string | number | 'auto';
  qualities: QualityLevel[];
  captionsEnabled: boolean;
  controlsVisible: boolean;
  aspectRatio: string; // e.g. "16/9"
  error: string | null;
}

export interface DoubleTapEvent {
  side: 'left' | 'right' | 'center';
  delta?: number | undefined;
}

export interface PlayerEvents {
  play: void;
  pause: void;
  timeupdate: { currentTime: number; duration: number };
  volumechange: { volume: number; muted: boolean };
  ratechange: number;
  seeking: number;
  seeked: number;
  waiting: void;
  playing: void;
  canplay: void;
  ended: void;
  error: { message: string; code?: number | undefined; originalError?: unknown };
  qualitychange: string | number | 'auto';
  qualitieschange: QualityLevel[];
  controlschange: boolean;
  fullscreenchange: boolean;
  pipchange: boolean;
  captionschange: boolean;
  doubletap: DoubleTapEvent;
  toggleshortcuts: void;
  ready: void;
  destroy: void;
}

export interface MediaSourceItem {
  src: string;
  type?: string | undefined;
  quality?: string | number | undefined;
  label?: string | undefined;
  height?: number | undefined;
}

export interface MediaTrackItem {
  kind: TextTrackKind;
  src: string;
  srclang?: string | undefined;
  label?: string | undefined;
  default?: boolean | undefined;
}

export type PlayerSource = string | MediaSourceItem[];

export interface PlayerOptions {
  src: PlayerSource;
  poster?: string | undefined;
  tracks?: MediaTrackItem[] | undefined;
  autoPlay?: boolean | undefined;
  muted?: boolean | undefined;
  loop?: boolean | undefined;
  controls?: string[] | undefined;
  theme?: ('dark' | 'light' | 'auto') | undefined;
  accent?: string | undefined;
  keyboard?: boolean | undefined;
  gestures?: boolean | undefined;
  persist?: boolean | undefined;
  autoHideDelay?: number | undefined;
  aspectRatio?: string | undefined; // default "16/9"
  qualities?: QualityLevel[] | undefined;
  container?: HTMLElement | undefined;
  onReady?: ((player: MaskflowPlayer) => void) | undefined;
  onError?: ((err: unknown) => void) | undefined;
}

export interface MaskflowPlayer {
  readonly store: Store<PlayerState>;
  readonly events: Emitter<PlayerEvents>;
  readonly video: HTMLVideoElement;
  readonly options: PlayerOptions;
  readonly container: HTMLElement;

  getState(): PlayerState;
  play(): Promise<void>;
  pause(): void;
  toggle(): Promise<void>;
  seek(time: number): void;
  seekBy(delta: number): void;
  setVolume(volume: number): void;
  toggleMute(): void;
  setRate(rate: number): void;
  setQuality(id: string | number | 'auto'): void;
  toggleFullscreen(): Promise<void>;
  togglePip(): Promise<void>;
  toggleCaptions(): void;
  setControlsVisible(visible: boolean): void;
  lockControls(locked: boolean): void;
  setAspectRatio(ratio: string): void;
  destroy(): void;
}
