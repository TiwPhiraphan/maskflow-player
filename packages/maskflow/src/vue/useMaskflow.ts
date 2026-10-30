import { shallowRef, onScopeDispose, watch, type Ref } from 'vue';
import type { MaskflowPlayer, PlayerState } from '../core/types';

export const defaultPlayerState: PlayerState = {
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

export function useMaskflow(
  playerRef: Ref<MaskflowPlayer | null | undefined> | (() => MaskflowPlayer | null | undefined),
): Ref<PlayerState> {
  const state = shallowRef<PlayerState>(defaultPlayerState);

  const getPlayer = (): MaskflowPlayer | null | undefined => {
    return typeof playerRef === 'function' ? playerRef() : playerRef.value;
  };

  let unsubscribe: (() => void) | null = null;

  const updateSubscription = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }

    const player = getPlayer();
    if (player) {
      state.value = player.getState();
      unsubscribe = player.store.subscribe((nextState) => {
        state.value = nextState;
      });
    } else {
      state.value = defaultPlayerState;
    }
  };

  watch(getPlayer, updateSubscription, { immediate: true });

  onScopeDispose(() => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  });

  return state;
}
