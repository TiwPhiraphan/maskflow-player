import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { PlayIcon, PauseIcon, ReplayIcon } from '../icons';
import { Spinner } from './Spinner';

export interface BigPlayButtonProps {
  player: MaskflowPlayer;
  state: PlayerState;
  className?: string | undefined;
}

export const BigPlayButton: React.FC<BigPlayButtonProps> = ({ player, state, className = '' }) => {
  // If in error state, center button is hidden; error overlay takes over
  if (state.status === 'error') {
    return null;
  }

  const isLoading = state.loading || state.status === 'buffering' || state.status === 'loading';
  const isVideoPaused = player.video ? player.video.paused : state.status !== 'playing';
  const isEnded = state.status === 'ended' || (player.video ? player.video.ended : false);
  const isPlaying = !isVideoPaused && !isEnded;

  if (isLoading) {
    return (
      <div
        className={`mf-big-play mf-big-play-loading ${className}`.trim()}
        role="status"
        aria-label="Loading media"
      >
        <Spinner />
      </div>
    );
  }

  const label = isEnded ? 'Replay (space)' : isPlaying ? 'Pause (space)' : 'Play (space)';

  return (
    <button
      type="button"
      className={`mf-big-play ${isPlaying ? 'mf-playing' : ''} ${isEnded ? 'mf-ended' : ''} ${className}`.trim()}
      title={label}
      aria-label={label}
      aria-pressed={isPlaying}
      onClick={() => player.toggle()}
    >
      {isEnded ? <ReplayIcon /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
};
