import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { ErrorIcon } from '../icons';

export interface ErrorOverlayProps {
  player: MaskflowPlayer;
  state: PlayerState;
  className?: string | undefined;
}

export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ player, state, className = '' }) => {
  if (state.status !== 'error') {
    return null;
  }

  const errorMessage = state.error || 'A playback error occurred.';

  const handleRetry = () => {
    const wasPlaying = !player.video.paused;
    player.video.load();
    if (wasPlaying || state.status === 'playing') {
      player.play().catch(() => {});
    }
  };

  return (
    <div className={`mf-error-overlay ${className}`.trim()} role="alert" aria-live="assertive">
      <div className="mf-error-icon">
        <ErrorIcon width={48} height={48} />
      </div>
      <div className="mf-error-msg">{errorMessage}</div>
      <button type="button" className="mf-btn mf-glass mf-error-retry" onClick={handleRetry}>
        Retry
      </button>
    </div>
  );
};
