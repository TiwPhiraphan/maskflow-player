import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { CaptionsIcon } from '../icons';

export interface CaptionsButtonProps {
  player: MaskflowPlayer;
  state: PlayerState;
  className?: string | undefined;
}

export const CaptionsButton: React.FC<CaptionsButtonProps> = ({
  player,
  state,
  className = '',
}) => {
  const label = state.captionsEnabled ? 'Disable subtitles (c)' : 'Enable subtitles (c)';
  return (
    <button
      type="button"
      className={`mf-btn mf-btn-captions ${className}`.trim()}
      title={label}
      aria-label={label}
      aria-pressed={state.captionsEnabled}
      onClick={(e) => {
        player.toggleCaptions();
        (e.currentTarget as HTMLElement).blur();
      }}
    >
      <CaptionsIcon />
    </button>
  );
};
