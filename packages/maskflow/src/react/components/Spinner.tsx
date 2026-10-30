import React from 'react';
import type { PlayerState } from '../../core/types';

export interface SpinnerProps {
  state: PlayerState;
}

export const Spinner: React.FC<SpinnerProps> = ({ state }) => {
  const isLoading = state.status === 'loading' || state.status === 'buffering';

  if (!isLoading) {
    return null;
  }

  return <div className="mf-spinner" aria-label="Loading media" role="status" />;
};
