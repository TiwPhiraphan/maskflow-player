import { useSyncExternalStore } from 'react';
import type { MaskflowPlayer, PlayerState } from '../core/types';

const defaultPlayerState: PlayerState = {
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
};

export function useMaskflow(player: MaskflowPlayer | null | undefined): PlayerState {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (!player) return () => {};
      return player.store.subscribe(onStoreChange);
    },
    () => {
      if (!player) return defaultPlayerState;
      return player.getState();
    },
    () => defaultPlayerState,
  );
}
