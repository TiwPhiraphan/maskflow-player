import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { PlayIcon, PauseIcon, ReplayIcon } from '../icons';

export interface PlayButtonProps {
  player: MaskflowPlayer;
  state: PlayerState;
}

export const PlayButton: React.FC<PlayButtonProps> = ({ player, state }) => {
  const isPlaying = state.status === 'playing';
  const isEnded = state.status === 'ended';

  const label = isEnded ? 'Replay' : isPlaying ? 'Pause' : 'Play';

  return (
    <button
      type="button"
      className="mf-btn"
      aria-label={label}
      aria-pressed={isPlaying}
      onClick={() => player.toggle()}
    >
      {isEnded ? <ReplayIcon /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
};
