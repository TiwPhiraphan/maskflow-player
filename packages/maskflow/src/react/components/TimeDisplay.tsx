import React from 'react';
import type { PlayerState } from '../../core/types';
import { formatTime } from '../../core/utils/time';

export interface TimeDisplayProps {
  state: PlayerState;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ state }) => {
  return (
    <div
      className="mf-time"
      aria-label={`Current time ${formatTime(state.currentTime)} of ${formatTime(state.duration)}`}
    >
      <span>{formatTime(state.currentTime)}</span>
      <span className="mf-time-separator">/</span>
      <span>{formatTime(state.duration)}</span>
    </div>
  );
};
