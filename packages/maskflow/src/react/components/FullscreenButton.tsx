import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { FullscreenEnterIcon, FullscreenExitIcon } from '../icons';

export interface FullscreenButtonProps {
  player: MaskflowPlayer;
  state: PlayerState;
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({ player, state }) => {
  return (
    <button
      type="button"
      className="mf-btn"
      aria-label={state.isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      aria-pressed={state.isFullscreen}
      onClick={() => player.toggleFullscreen()}
      onFocus={(e) => e.currentTarget.blur()}
    >
      {state.isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
    </button>
  );
};
