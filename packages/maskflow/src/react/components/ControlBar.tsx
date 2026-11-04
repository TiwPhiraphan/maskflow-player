import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { ProgressBar } from './ProgressBar';
import { PlayButton } from './PlayButton';
import { VolumeControl } from './VolumeControl';
import { PipButton } from './PipButton';
import { FullscreenButton } from './FullscreenButton';
import { formatTime } from '../../core/utils/time';

export interface ControlBarProps {
  player: MaskflowPlayer;
  state: PlayerState;
  controls?: string[] | undefined;
  className?: string | undefined;
}

const DEFAULT_CONTROLS = ['play', 'progress', 'time', 'volume', 'settings', 'pip', 'fullscreen'];

export const ControlBar: React.FC<ControlBarProps> = ({
  player,
  state,
  controls = DEFAULT_CONTROLS,
  className = '',
}) => {
  const isEnabled = (name: string) => controls.includes(name);

  return (
    <div className={`mf-bottom-bar ${className}`.trim()} role="toolbar" aria-label="Media controls">
      {/* 1. Play/pause button (desktop only) */}
      {isEnabled('play') && (
        <PlayButton player={player} state={state} className="mf-desktop-only" />
      )}

      {/* 2. Volume button grouped with volume slider (slider is desktop only) */}
      {isEnabled('volume') && <VolumeControl player={player} state={state} />}

      {/* 3. Current time: mm:ss (no hours) */}
      {isEnabled('time') && (
        <span
          className="mf-time mf-time-current"
          aria-label={`Current time ${formatTime(state.currentTime)}`}
        >
          {formatTime(state.currentTime)}
        </span>
      )}

      {/* 4. Progress bar (flex-1) */}
      {isEnabled('progress') && <ProgressBar player={player} state={state} />}

      {/* 5. Duration: mm:ss (no hours) */}
      {isEnabled('time') && (
        <span
          className="mf-time mf-time-duration"
          aria-label={`Duration ${formatTime(state.duration)}`}
        >
          {formatTime(state.duration)}
        </span>
      )}

      {/* 6. Picture-in-picture button (desktop only) */}
      {isEnabled('pip') && <PipButton player={player} state={state} className="mf-desktop-only" />}

      {/* 7. Fullscreen button */}
      {isEnabled('fullscreen') && <FullscreenButton player={player} state={state} />}
    </div>
  );
};
