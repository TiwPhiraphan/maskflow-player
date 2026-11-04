import React from 'react';
import type { PlayerState } from '../../core/types';

export interface SpinnerProps {
  state?: PlayerState | undefined;
  className?: string | undefined;
}

export const Spinner: React.FC<SpinnerProps> = ({ state, className = '' }) => {
  if (state && !state.loading && state.status !== 'buffering' && state.status !== 'loading') {
    return null;
  }

  return (
    <div className={`mf-spinner ${className}`.trim()} aria-label="Loading media" role="status" />
  );
};
