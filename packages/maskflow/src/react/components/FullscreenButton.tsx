import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { FullscreenEnterIcon, FullscreenExitIcon } from '../icons';

export interface FullscreenButtonProps {
  player: MaskflowPlayer;
  state: PlayerState;
  className?: string | undefined;
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  player,
  state,
  className = '',
}) => {
  const isFullscreen = state.isFullscreen;
  const label = isFullscreen ? 'Exit fullscreen (f)' : 'Fullscreen (f)';

  return (
    <button
      type="button"
      className={`mf-btn mf-btn-fullscreen ${className}`.trim()}
      title={label}
      aria-label={label}
      aria-pressed={isFullscreen}
      onClick={() => player.toggleFullscreen()}
    >
      {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
    </button>
  );
};
