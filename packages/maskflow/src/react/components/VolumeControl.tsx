import React, { useRef, useState, useCallback } from 'react';
import type { MaskflowPlayer, PlayerState } from '../../core/types';
import { VolumeHighIcon, VolumeMutedIcon } from '../icons';
import { clamp } from '../../core/utils/math';

export interface VolumeControlProps {
  player: MaskflowPlayer;
  state: PlayerState;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ player, state }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isMuted = state.muted || state.volume === 0;
  const volumeLevel = isMuted ? 0 : state.volume;

  const calculateRatio = useCallback((clientX: number): number => {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return clamp((clientX - rect.left) / rect.width, 0, 1);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);

    const ratio = calculateRatio(e.clientX);
    player.setVolume(ratio);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const ratio = calculateRatio(e.clientX);
      player.setVolume(ratio);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      player.setVolume(state.volume + 0.05);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      player.setVolume(state.volume - 0.05);
    }
  };

  return (
    <div className="mf-volume-container">
      <button
        type="button"
        className="mf-btn"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        aria-pressed={isMuted}
        onClick={() => player.toggleMute()}
      >
        {isMuted ? <VolumeMutedIcon /> : <VolumeHighIcon />}
      </button>

      <div
        ref={sliderRef}
        className="mf-volume-slider"
        role="slider"
        tabIndex={0}
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(volumeLevel * 100)}
        aria-valuetext={`${Math.round(volumeLevel * 100)}%`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <div className="mf-volume-rail">
          <div className="mf-volume-fill" style={{ width: `${volumeLevel * 100}%` }} />
        </div>
      </div>
    </div>
  );
};
