import type { MaskflowPlayer as IMaskflowPlayer } from '../core/types';

export { MaskflowPlayer } from './MaskflowPlayer';
export { useMaskflow } from './useMaskflow';
export * from '../core/types';

export interface MaskflowVueInstance {
  getPlayer(): IMaskflowPlayer | null;
  play(): Promise<void> | undefined;
  pause(): void;
  toggle(): Promise<void> | undefined;
  seek(time: number): void;
  seekBy(delta: number): void;
  setVolume(volume: number): void;
  toggleMute(): void;
  setRate(rate: number): void;
  setQuality(quality: string | number): void;
  toggleFullscreen(): Promise<void> | undefined;
  togglePip(): Promise<void> | undefined;
  toggleCaptions(): void;
  destroy(): void;
}
