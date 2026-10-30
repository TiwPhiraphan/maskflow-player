import React from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { ProgressBar } from './ProgressBar';
import { PlayButton } from './PlayButton';
import { VolumeControl } from './VolumeControl';
import { TimeDisplay } from './TimeDisplay';
import { CaptionsButton } from './CaptionsButton';
import { SettingsMenu } from './SettingsMenu';
import { PipButton } from './PipButton';
import { FullscreenButton } from './FullscreenButton';

export interface ControlBarProps {
  player: MaskflowPlayer;
  state: PlayerState;
  controls?: string[] | undefined;
}

const DEFAULT_CONTROLS = [
  'play',
  'progress',
  'time',
  'volume',
  'captions',
  'settings',
  'pip',
  'fullscreen',
];

export const ControlBar: React.FC<ControlBarProps> = ({
  player,
  state,
  controls = DEFAULT_CONTROLS,
}) => {
  const isEnabled = (name: string) => controls.includes(name);

  return (
    <div className="mf-controls mf-glass" role="toolbar" aria-label="Media controls">
      {isEnabled('progress') && <ProgressBar player={player} state={state} />}

      <div className="mf-controls-row">
        <div className="mf-controls-left">
          {isEnabled('play') && <PlayButton player={player} state={state} />}
          {isEnabled('volume') && <VolumeControl player={player} state={state} />}
          {isEnabled('time') && <TimeDisplay state={state} />}
        </div>

        <div className="mf-controls-right">
          {isEnabled('captions') && <CaptionsButton player={player} state={state} />}
          {isEnabled('settings') && <SettingsMenu player={player} state={state} />}
          {isEnabled('pip') && <PipButton player={player} state={state} />}
          {isEnabled('fullscreen') && <FullscreenButton player={player} state={state} />}
        </div>
      </div>
    </div>
  );
};
