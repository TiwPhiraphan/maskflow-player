import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { PlayIcon, PauseIcon, ReplayIcon } from '../icons';

export interface PlayButtonProps {
  player: MaskflowPlayer;
  state: PlayerState;
  className?: string | undefined;
}

export const PlayButton: React.FC<PlayButtonProps> = ({ player, state, className = '' }) => {
  const isVideoPaused = player.video ? player.video.paused : state.status !== 'playing';
  const isEnded = state.status === 'ended' || (player.video ? player.video.ended : false);
  const isPlaying = !isVideoPaused && !isEnded;

  const label = isEnded ? 'Replay (space)' : isPlaying ? 'Pause (space)' : 'Play (space)';

  return (
    <button
      type="button"
      className={`mf-btn mf-btn-play ${className}`.trim()}
      title={label}
      aria-label={label}
      aria-pressed={isPlaying}
      onClick={() => player.toggle()}
    >
      {isEnded ? <ReplayIcon /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
};
