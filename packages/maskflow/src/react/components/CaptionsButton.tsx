import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { CaptionsIcon } from '../icons';

export interface CaptionsButtonProps {
  player: MaskflowPlayer;
  state: PlayerState;
}

export const CaptionsButton: React.FC<CaptionsButtonProps> = ({ player, state }) => {
  return (
    <button
      type="button"
      className="mf-btn"
      aria-label="Captions"
      aria-pressed={state.captionsEnabled}
      onClick={() => player.toggleCaptions()}
    >
      <CaptionsIcon />
    </button>
  );
};
