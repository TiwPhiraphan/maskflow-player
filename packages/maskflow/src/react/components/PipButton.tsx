import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { PipIcon } from '../icons';

export interface PipButtonProps {
  player: MaskflowPlayer;
  state: PlayerState;
  className?: string | undefined;
}

export const PipButton: React.FC<PipButtonProps> = ({ player, state, className = '' }) => {
  const label = 'Picture-in-picture (p)';

  return (
    <button
      type="button"
      className={`mf-btn mf-btn-pip mf-desktop-only ${className}`.trim()}
      title={label}
      aria-label={label}
      aria-pressed={state.isPip}
      onClick={() => player.togglePip()}
    >
      <PipIcon />
    </button>
  );
};
