import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { PlayIcon, ReplayIcon } from '../icons';

export interface BigPlayButtonProps {
  player: MaskflowPlayer;
  state: PlayerState;
}

export const BigPlayButton: React.FC<BigPlayButtonProps> = ({ player, state }) => {
  if (state.status === 'playing' || (player.video && !player.video.paused && !player.video.ended)) {
    return null;
  }

  const isEnded = state.status === 'ended';

  return (
    <button
      type="button"
      className="mf-big-play mf-glass"
      aria-label={isEnded ? 'Replay' : 'Play'}
      onClick={() => player.toggle()}
    >
      {isEnded ? <ReplayIcon /> : <PlayIcon />}
    </button>
  );
};
