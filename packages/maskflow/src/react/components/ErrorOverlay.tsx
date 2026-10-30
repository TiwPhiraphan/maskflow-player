import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';

export interface ErrorOverlayProps {
  player: MaskflowPlayer;
  state: PlayerState;
}

export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ player, state }) => {
  if (state.status !== 'error') {
    return null;
  }

  const errorMessage = state.error || 'A playback error occurred.';

  const handleRetry = () => {
    const src = player.options.src;
    if (typeof src === 'string') {
      player.video.src = src;
    }
    player.play().catch(() => {});
  };

  return (
    <div className="mf-error-overlay" role="alert" aria-live="assertive">
      <div className="mf-error-msg">{errorMessage}</div>
      <button
        type="button"
        className="mf-btn mf-glass"
        style={{ width: 'auto', padding: '8px 16px', borderRadius: '8px' }}
        onClick={handleRetry}
      >
        Retry
      </button>
    </div>
  );
};
