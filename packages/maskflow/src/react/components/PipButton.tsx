import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { PipIcon } from '../icons';

export interface PipButtonProps {
  player: MaskflowPlayer;
  state: PlayerState;
}

export const PipButton: React.FC<PipButtonProps> = ({ player, state }) => {
  return (
    <button
      type="button"
      className="mf-btn"
      aria-label="Picture in Picture"
      aria-pressed={state.isPip}
      onClick={() => player.togglePip()}
      onFocus={(e) => e.currentTarget.blur()}
    >
      <PipIcon />
    </button>
  );
};
